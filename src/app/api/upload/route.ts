import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { uploadFileSchema } from '@/schemas/upload.schema';
import { parsePdf } from '@/lib/parsers/pdf';
import { MAX_UPLOAD_SIZE_BYTES } from '@/config/constants';

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
      text = result.text;
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

    // Gerar ID do contrato
    const contractId = randomUUID();

    // TODO: Salvar no Supabase Storage + criar registro na tabela contracts
    // Por enquanto, retornamos os dados mockados para o frontend funcionar
    const contract = {
      contractId,
      fileName: file.name,
      fileSize: file.size,
      pageCount,
      textLength: text.length,
      status: 'uploaded' as const,
    };

    // TODO: Disparar job de classificação + análise via Inngest

    return NextResponse.json(contract, { status: 201 });
  } catch (err) {
    console.error('Erro no upload:', err);
    return NextResponse.json(
      { error: 'Erro interno ao processar o arquivo.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// Next.js App Router: o limite de body é configurado no next.config.mjs
