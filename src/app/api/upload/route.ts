import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { uploadFileSchema } from '@/schemas/upload.schema';
import { parsePdf } from '@/lib/parsers/pdf';
import { cleanContractText } from '@/lib/parsers/text-cleaner';
import { store } from '@/lib/store';
import { classifyContract } from '@/lib/ai/classifier';
import { analyzeContract } from '@/lib/ai/analyzer';

// Magic bytes do PDF
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF

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

    // Validar magic bytes (é realmente um PDF?)
    if (buffer.length < 4 || !buffer.subarray(0, 4).equals(PDF_MAGIC)) {
      return NextResponse.json(
        { error: 'O arquivo não é um PDF válido.', code: 'INVALID_PDF' },
        { status: 400 }
      );
    }

    // Parsing do PDF
    let text: string;
    let pageCount: number;
    try {
      const result = await parsePdf(buffer);
      text = cleanContractText(result.text);
      pageCount = result.pageCount;
    } catch (err) {
      return NextResponse.json(
        {
          error: err instanceof Error ? err.message : 'Erro ao processar o PDF.',
          code: 'PARSE_ERROR',
        },
        { status: 400 }
      );
    }

    // Gerar ID e salvar no store
    const contractId = randomUUID();

    store.createContract({
      id: contractId,
      original_text: text,
      original_filename: file.name,
      file_size_bytes: file.size,
      page_count: pageCount,
    });

    // Disparar análise em background (não bloqueia o response)
    processContract(contractId).catch((err) => {
      // Safety net: caso algum erro não tratado escape do processContract
      console.error(`Erro inesperado no contrato ${contractId}:`, err);
      store.updateContract(contractId, {
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
 * No futuro será substituído por Inngest background job.
 */
async function processContract(contractId: string) {
  const contract = store.getContract(contractId);
  if (!contract) throw new Error('Contrato não encontrado');

  // Etapa 1: Classificação
  store.updateContract(contractId, { status: 'classifying' });

  let contractType = 'outro';
  try {
    const { classification } = await classifyContract(contract.original_text);
    contractType = classification.type;
    store.updateContract(contractId, {
      status: 'classified',
      contract_type: classification.type,
      classification_result: classification,
    });
  } catch (err) {
    console.error(`Erro na classificação do contrato ${contractId}:`, err);
    // Classificação falhou, mas podemos continuar com tipo 'outro'
    store.updateContract(contractId, {
      status: 'classified',
      contract_type: 'outro',
    });
  }

  // Etapa 2: Análise gratuita
  store.updateContract(contractId, { status: 'analyzing' });

  try {
    const { analysis, usage } = await analyzeContract(contract.original_text, 'free');

    store.updateContract(contractId, {
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
    store.updateContract(contractId, {
      status: 'error',
      error_message: `Erro na análise: ${message}`,
    });
  }
}
