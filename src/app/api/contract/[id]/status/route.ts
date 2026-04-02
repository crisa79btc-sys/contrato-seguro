import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

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

  const response: Record<string, unknown> = {
    status: contract.status,
    contractType: contract.contract_type,
    filename: contract.original_filename,
  };

  if (contract.error_message) {
    response.error_message = contract.error_message;
  }

  if (contract.status === 'error') {
    response.error = contract.error_message;
  }

  if (['analyzed', 'correcting', 'corrected'].includes(contract.status) && contract.analysis_result) {
    response.result = contract.analysis_result;
  }

  if (contract.status === 'corrected' && contract.correction_result) {
    response.correction = contract.correction_result;
  }

  return NextResponse.json(response);
}
