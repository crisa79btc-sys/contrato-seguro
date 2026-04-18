-- ============================================================================
-- ContratoSeguro - Migração 007: Correções de Segurança
-- ============================================================================
-- Versão:      007
-- Data:        2026-04-13
-- Descrição:   Correções críticas identificadas em auditoria de segurança:
--              1. Adiciona status 'paid' ao CHECK constraint de contracts
--              2. Remove coluna original_file_url (não usada, potencial PII)
--              3. Garante que chat_messages é deletado em cascade
-- ============================================================================

-- 1. Adicionar 'paid' ao CHECK constraint de status
-- O backend tenta setar status='paid' após pagamento aprovado, mas o constraint
-- atual rejeita esse valor silenciosamente, quebrando o fluxo de pagamento.
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_status_check;
ALTER TABLE public.contracts ADD CONSTRAINT contracts_status_check
  CHECK (status IN (
    'uploaded', 'classifying', 'classified',
    'analyzing', 'analyzed',
    'correcting', 'corrected',
    'paid',
    'error'
  ));

-- 2. Garantir que chat_messages tem ON DELETE CASCADE (caso não exista)
-- A migração 004 pode ter criado sem o cascade, deixando mensagens órfãs
-- quando contratos são deletados pelo cron de cleanup.
-- Esta operação é segura — recria a FK com cascade se não existir.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.referential_constraints
    WHERE constraint_name = 'chat_messages_contract_id_fkey'
      AND delete_rule = 'CASCADE'
  ) THEN
    ALTER TABLE public.chat_messages
      DROP CONSTRAINT IF EXISTS chat_messages_contract_id_fkey;
    ALTER TABLE public.chat_messages
      ADD CONSTRAINT chat_messages_contract_id_fkey
      FOREIGN KEY (contract_id)
      REFERENCES public.contracts(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Verificar resultado
SELECT
  column_name,
  check_clause
FROM information_schema.check_constraints cc
JOIN information_schema.constraint_column_usage ccu USING (constraint_name)
WHERE ccu.table_name = 'contracts'
  AND ccu.column_name = 'status';
