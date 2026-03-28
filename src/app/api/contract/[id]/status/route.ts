import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const contract = store.getContract(params.id);

  if (!contract) {
    return NextResponse.json(
      { error: 'Contrato não encontrado.', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }

  const response: Record<string, unknown> = {
    status: contract.status,
    contractType: contract.contract_type,
  };

  if (contract.status === 'error') {
    response.error = contract.error_message;
  }

  if (contract.status === 'analyzed' && contract.analysis_result) {
    response.result = contract.analysis_result;
  }

  return NextResponse.json(response);
}
