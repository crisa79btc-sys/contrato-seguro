import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { uploadFileSchema } from '@/schemas/upload.schema';
import { parsePdf } from '@/lib/parsers/pdf';
import { extractTextFromImage } from '@/lib/parsers/ocr-vision';
import { cleanContractText } from '@/lib/parsers/text-cleaner';
import { store } from '@/lib/store';
import { classifyContract } from '@/lib/ai/classifier';
import { analyzeContract } from '@/lib/ai/analyzer';

// Magic bytes
const MAGIC_BYTES: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF
};

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const expected = MAGIC_BYTES[mimeType];
  if (!expected) return true; // tipo sem magic bytes conhecido, aceitar
  if (buffer.length < expected.length) return false;
  return expected.every((byte, i) => buffer[i] === byte);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado.', code: 'NO_FILE' },
        { status: 400 }
      );
    }

    // Validar metadados com Zod
    const validation = uploadFileSchema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Ler o buffer do arquivo
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validar magic bytes
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: 'O arquivo não corresponde ao formato informado.', code: 'INVALID_FILE' },
        { status: 400 }
      );
    }

    // Extrair texto conforme o tipo de arquivo
    let text: string;
    let pageCount: number;

    try {
      if (IMAGE_TYPES.includes(file.type)) {
        // Imagem: usar Claude Vision diretamente
        const rawText = await extractTextFromImage(
          buffer,
          file.type as 'image/jpeg' | 'image/png' | 'image/webp'
        );
        text = cleanContractText(rawText);
        pageCount = 1;
      } else {
        // PDF: tentar texto direto, fallback para Vision
        const result = await parsePdf(buffer);
        text = cleanContractText(result.text);
        pageCount = result.pageCount;
      }
    } catch (err) {
      return NextResponse.json(
        {
          error: err instanceof Error ? err.message : 'Erro ao processar o arquivo.',
          code: 'PARSE_ERROR',
        },
        { status: 400 }
      );
    }

    // Gerar ID e salvar no store
    const contractId = randomUUID();

    await store.createContract({
      id: contractId,
      original_text: text,
      original_filename: file.name,
      file_size_bytes: file.size,
      page_count: pageCount,
    });

    // Disparar análise em background (não bloqueia o response)
    processContract(contractId).catch(async (err) => {
      console.error(`Erro inesperado no contrato ${contractId}:`, err);
      await store.updateContract(contractId, {
        status: 'error',
        error_message: 'Erro inesperado ao processar o contrato. Tente novamente.',
      });
    });

    return NextResponse.json(
      {
        contractId,
        fileName: file.name,
        fileSize: file.size,
        pageCount,
        status: 'uploaded',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Erro no upload:', err);
    return NextResponse.json(
      { error: 'Erro interno ao processar o arquivo.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * Processa o contrato em background: classifica + analisa.
 */
async function processContract(contractId: string) {
  const contract = await store.getContract(contractId);
  if (!contract) throw new Error('Contrato não encontrado');

  // Etapa 1: Classificação
  await store.updateContract(contractId, { status: 'classifying' });

  try {
    const { classification } = await classifyContract(contract.original_text);
    await store.updateContract(contractId, {
      status: 'classified',
      contract_type: classification.type,
      classification_result: classification,
    });
  } catch (err) {
    console.error(`Erro na classificação do contrato ${contractId}:`, err);
    await store.updateContract(contractId, {
      status: 'classified',
      contract_type: 'outro',
    });
  }

  // Etapa 2: Análise gratuita
  await store.updateContract(contractId, { status: 'analyzing' });

  try {
    const { analysis, usage } = await analyzeContract(contract.original_text, 'free');

    await store.updateContract(contractId, {
      status: 'analyzed',
      analysis_result: {
        ...analysis,
        usage,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Erro desconhecido na análise';
    console.error(`Erro na análise do contrato ${contractId}:`, err);
    await store.updateContract(contractId, {
      status: 'error',
      error_message: `Erro na análise: ${message}`,
    });
  }
}
