import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/db/supabase';
import { generateCorrectedDocx } from '@/lib/export/docx-corrected';
import { generateCorrectedPdf } from '@/lib/export/pdf-corrected';
import { correctionOutputSchema } from '@/schemas/ai-output.schema';
import { isBillingEnabled } from '@/config/constants';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

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
  const supabase = getAdminClient();

  // Query direta: buscar contrato + correção em paralelo, sem intermediários
  const [contractRes, correctionRes] = await Promise.all([
    supabase.from('contracts').select('id, status, original_filename, contract_type').eq('id', params.id).single(),
    supabase.from('corrected_contracts').select('changes').eq('contract_id', params.id).maybeSingle(),
  ]);

  if (contractRes.error || !contractRes.data) {
    return NextResponse.json(
      { error: 'Contrato não encontrado.', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }

  const contract = contractRes.data;

  // Gate de pagamento
  if (isBillingEnabled() && contract.status !== 'paid') {
    return NextResponse.json(
      { error: 'Pagamento necessário para baixar o contrato corrigido.', code: 'PAYMENT_REQUIRED' },
      { status: 402 }
    );
  }

  // Verificar se a correção existe
  if (correctionRes.error) {
    console.error(`[Download] Erro ao buscar correção: ${correctionRes.error.message}`);
  }

  const correctionData = correctionRes.data?.changes as Record<string, unknown> | null;

  if (!correctionData) {
    return NextResponse.json(
      { error: 'O contrato ainda não foi corrigido. Clique em "Corrigir contrato" primeiro.', code: 'NOT_CORRECTED' },
      { status: 400 }
    );
  }

  const parsed = correctionOutputSchema.safeParse(correctionData);

  if (!parsed.success) {
    console.error(`[Download] Dados de correção inválidos:`, parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '));
    return NextResponse.json(
      { error: 'Dados de correção inválidos.', code: 'INVALID_DATA' },
      { status: 500 }
    );
  }

  const contractType = contract.contract_type || 'outro';
  const docData = {
    filename: contract.original_filename || 'contrato',
    contractType: TYPE_LABELS[contractType] || contractType,
    correction: parsed.data,
  };

  const safeName = (contract.original_filename || 'contrato').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9À-ÿ_\-. ]/g, '_');
  const format = request.nextUrl.searchParams.get('format') || 'docx';

  try {
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
  } catch (err) {
    console.error(`[Download] Erro ao gerar ${format} para ${params.id}:`, err);
    return NextResponse.json(
      { error: `Erro ao gerar o arquivo ${format.toUpperCase()}. Tente novamente.`, code: 'GENERATION_ERROR' },
      { status: 500 }
    );
  }
}
