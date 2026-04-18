import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { isBillingEnabled } from '@/config/constants';
import { getCurrentUser } from '@/lib/auth/current-user';
import { canAccessContract } from '@/lib/auth/contract-access';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const [contract, user] = await Promise.all([
    store.getContract(params.id),
    getCurrentUser(),
  ]);

  if (!contract) {
    return NextResponse.json(
      { error: 'Contrato não encontrado.', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }

  if (!canAccessContract(contract.user_id, user?.id)) {
    return NextResponse.json(
      { error: 'Acesso negado.', code: 'FORBIDDEN' },
      { status: 403 }
    );
  }

  const response: Record<string, unknown> = {
    status: contract.status,
    contractType: contract.contract_type,
    filename: contract.original_filename,
    billingEnabled: isBillingEnabled(),
  };

  if (contract.error_message) {
    response.error_message = contract.error_message;
  }

  if (contract.status === 'error') {
    response.error = contract.error_message;
  }

  if (['analyzed', 'correcting', 'corrected', 'paid'].includes(contract.status) && contract.analysis_result) {
    response.result = contract.analysis_result;
  }

  if (['corrected', 'paid'].includes(contract.status) && contract.correction_result) {
    response.correction = contract.correction_result;
  }

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'CDN-Cache-Control': 'no-store',
      'Vercel-CDN-Cache-Control': 'no-store',
    },
  });
}
