import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { generateAnalysisReport } from '@/lib/export/pdf-report';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const contract = await store.getContract(params.id);

  if (!contract) {
    return NextResponse.json(
      { error: 'Contrato não encontrado.', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }

  if (contract.status !== 'analyzed' || !contract.analysis_result) {
    return NextResponse.json(
      { error: 'Análise ainda não concluída.', code: 'NOT_READY' },
      { status: 400 }
    );
  }

  const result = contract.analysis_result as {
    global_score: { value: number; interpretation: string };
    total_issues: number;
    top_issues: {
      clause_id: string;
      original_text_summary: string;
      risk_level: string;
      explanation: string;
    }[];
    executive_summary: string;
  };

  try {
    const pdf = await generateAnalysisReport({
      filename: contract.original_filename,
      contractType: contract.contract_type || 'Outro',
      score: result.global_score.value,
      interpretation: result.global_score.interpretation,
      summary: result.executive_summary,
      issues: result.top_issues,
      totalIssues: result.total_issues,
    });

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="analise-contrato-${params.id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (err) {
    console.error(`[Report] Erro ao gerar relatório para ${params.id}:`, err);
    return NextResponse.json(
      { error: 'Erro ao gerar o relatório PDF. Tente novamente.', code: 'GENERATION_ERROR' },
      { status: 500 }
    );
  }
}
