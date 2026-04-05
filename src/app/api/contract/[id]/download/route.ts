import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { generateCorrectedDocx } from '@/lib/export/docx-corrected';
import { generateCorrectedPdf } from '@/lib/export/pdf-corrected';
import { correctionOutputSchema } from '@/schemas/ai-output.schema';

export const dynamic = 'force-dynamic';
import { isBillingEnabled } from '@/config/constants';

const TYPE_LABELS: Record<string, string> = {
  aluguel: 'Contrato de Aluguel',
  trabalho: 'Contrato de Trabalho',
  servico: 'Prestação de Serviço',
  compra_venda: 'Compra e Venda',
  financiamento: 'Financiamento',
  digital: 'Termos Digitais',
  outro: 'Contrato',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const contract = await store.getContract(params.id);

  if (!contract) {
    return NextResponse.json(
      { error: 'Contrato não encontrado.', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }

  // Gate de pagamento: quando billing ativo, exige status 'paid'
  if (isBillingEnabled() && contract.status !== 'paid') {
    return NextResponse.json(
      { error: 'Pagamento necessário para baixar o contrato corrigido.', code: 'PAYMENT_REQUIRED' },
      { status: 402 }
    );
  }

  if (!isBillingEnabled() && contract.status !== 'corrected' && contract.status !== 'paid') {
    return NextResponse.json(
      { error: 'O contrato ainda não foi corrigido.', code: 'NOT_CORRECTED' },
      { status: 400 }
    );
  }

  if (!contract.correction_result) {
    return NextResponse.json(
      { error: 'O contrato ainda não foi corrigido.', code: 'NOT_CORRECTED' },
      { status: 400 }
    );
  }

  const correctionData = contract.correction_result as Record<string, unknown>;
  const parsed = correctionOutputSchema.safeParse(correctionData);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados de correção inválidos.', code: 'INVALID_DATA' },
      { status: 500 }
    );
  }

  const contractType = contract.contract_type || 'outro';
  const docData = {
    filename: contract.original_filename,
    contractType: TYPE_LABELS[contractType] || contractType,
    correction: parsed.data,
  };

  const safeName = contract.original_filename.replace(/\.[^.]+$/, '');
  const format = request.nextUrl.searchParams.get('format') || 'docx';

  if (format === 'pdf') {
    const pdfBytes = await generateCorrectedPdf(docData);
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}_corrigido.pdf"`,
      },
    });
  }

  const buffer = await generateCorrectedDocx(docData);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${safeName}_corrigido.docx"`,
    },
  });
}
