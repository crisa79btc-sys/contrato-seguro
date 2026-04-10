import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/db/supabase';
import { store } from '@/lib/store';
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

/**
 * Busca os dados de correção com múltiplas estratégias (fallback).
 * Retorna { contract, correctionData } ou null se não encontrar.
 */
async function fetchCorrectionData(contractId: string): Promise<{
  contract: { id: string; status: string; original_filename: string; contract_type: string | null };
  correctionData: Record<string, unknown>;
} | null> {
  // Estratégia 1: store.getContract() — mesmo caminho que a rota de status
  try {
    const record = await store.getContract(contractId);
    if (record && record.correction_result) {
      console.log(`[Download] Dados encontrados via store para ${contractId}`);
      return {
        contract: {
          id: record.id,
          status: record.status,
          original_filename: record.original_filename,
          contract_type: record.contract_type,
        },
        correctionData: record.correction_result as Record<string, unknown>,
      };
    }
    console.warn(`[Download] Store retornou correction_result=${record?.correction_result === null ? 'null' : 'undefined'} para ${contractId} (status=${record?.status})`);
  } catch (err) {
    console.error(`[Download] Erro no store.getContract:`, err);
  }

  // Estratégia 2: query direta ao Supabase com select('*')
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('corrected_contracts')
      .select('*')
      .eq('contract_id', contractId)
      .maybeSingle();

    if (error) {
      console.error(`[Download] Erro na query direta: ${error.message} (code=${error.code})`);
    } else if (data?.changes) {
      console.log(`[Download] Dados encontrados via query direta para ${contractId}`);
      // Buscar dados básicos do contrato
      const { data: cData } = await supabase
        .from('contracts')
        .select('id, status, original_filename, contract_type')
        .eq('id', contractId)
        .single();
      if (cData) {
        return {
          contract: cData,
          correctionData: data.changes as Record<string, unknown>,
        };
      }
    } else {
      console.warn(`[Download] Query direta: data=${JSON.stringify(data ? Object.keys(data) : null)} para ${contractId}`);
    }
  } catch (err) {
    console.error(`[Download] Erro na query direta:`, err);
  }

  // Estratégia 3: aguardar 1.5s e tentar novamente (race condition com waitUntil)
  await new Promise(resolve => setTimeout(resolve, 1500));
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('corrected_contracts')
      .select('changes')
      .eq('contract_id', contractId)
      .maybeSingle();

    if (!error && data?.changes) {
      console.log(`[Download] Dados encontrados via retry (1.5s delay) para ${contractId}`);
      const { data: cData } = await supabase
        .from('contracts')
        .select('id, status, original_filename, contract_type')
        .eq('id', contractId)
        .single();
      if (cData) {
        return {
          contract: cData,
          correctionData: data.changes as Record<string, unknown>,
        };
      }
    }
    console.error(`[Download] Retry também falhou para ${contractId}. error=${error?.message}, data_keys=${data ? Object.keys(data) : 'null'}`);
  } catch (err) {
    console.error(`[Download] Erro no retry:`, err);
  }

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`[Download] Requisição para contractId=${params.id}, format=${request.nextUrl.searchParams.get('format')}`);

  const result = await fetchCorrectionData(params.id);

  if (!result) {
    // Verificar se o contrato ao menos existe
    try {
      const record = await store.getContract(params.id);
      if (!record) {
        return NextResponse.json(
          { error: 'Contrato não encontrado.', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }
    } catch { /* ignore */ }

    return NextResponse.json(
      { error: 'O contrato ainda não foi corrigido. Clique em "Corrigir contrato" primeiro.', code: 'NOT_CORRECTED' },
      { status: 400 }
    );
  }

  const { contract, correctionData } = result;

  // Gate de pagamento
  if (isBillingEnabled() && contract.status !== 'paid') {
    return NextResponse.json(
      { error: 'Pagamento necessário para baixar o contrato corrigido.', code: 'PAYMENT_REQUIRED' },
      { status: 402 }
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
