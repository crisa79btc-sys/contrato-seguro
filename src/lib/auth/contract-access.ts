/**
 * Verifica se o usuário atual tem acesso a um contrato.
 *
 * Regra:
 *   - Contrato anônimo (user_id = null) → qualquer um com o UUID pode acessar.
 *   - Contrato com dono (user_id != null) → apenas o próprio usuário pode acessar.
 *
 * Retorna `true` se o acesso for permitido, `false` caso contrário.
 */
export function canAccessContract(
  contractUserId: string | null,
  currentUserId: string | null | undefined
): boolean {
  // Contrato sem dono: acesso livre (upload anônimo)
  if (!contractUserId) return true;
  // Contrato com dono: exige match exato
  return contractUserId === currentUserId;
}
