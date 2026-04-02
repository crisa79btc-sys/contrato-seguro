/**
 * Store dual-mode: Supabase (produção) ou memória (dev local).
 * Detecta automaticamente se Supabase está configurado.
 * A interface é idêntica — nenhuma API route precisa mudar.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type ContractRecord = {
  id: string;
  original_text: string;
  original_filename: string;
  file_size_bytes: number;
  page_count: number;
  contract_type: string | null;
  status: string;
  analysis_result: unknown | null;
  classification_result: unknown | null;
  correction_result: unknown | null;
  error_message: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Detectar modo
// ---------------------------------------------------------------------------
function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

const supabase = getSupabaseAdmin();
const isSupabaseMode = supabase !== null;

if (isSupabaseMode) {
  console.log('[Store] Modo Supabase ativado');
} else {
  console.log('[Store] Modo memória (Supabase não configurado)');
}

// ---------------------------------------------------------------------------
// Store em memória (fallback dev local)
// ---------------------------------------------------------------------------
const globalStore = globalThis as typeof globalThis & {
  __contractStore?: Map<string, ContractRecord>;
};

if (!globalStore.__contractStore) {
  globalStore.__contractStore = new Map<string, ContractRecord>();
}

const memoryContracts = globalStore.__contractStore;

// ---------------------------------------------------------------------------
// Interface unificada
// ---------------------------------------------------------------------------
export const store = {
  async createContract(data: {
    id: string;
    original_text: string;
    original_filename: string;
    file_size_bytes: number;
    page_count: number;
  }): Promise<ContractRecord> {
    const record: ContractRecord = {
      ...data,
      contract_type: null,
      status: 'uploaded',
      analysis_result: null,
      classification_result: null,
      correction_result: null,
      error_message: null,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseMode) {
      const { error } = await supabase!.from('contracts').insert({
        id: record.id,
        original_text: record.original_text,
        original_filename: record.original_filename,
        file_size_bytes: record.file_size_bytes,
        page_count: record.page_count,
        status: 'uploaded',
      });
      if (error) {
        console.error('[Store] Erro ao criar contrato no Supabase:', error.message);
        throw new Error(`Erro ao salvar contrato: ${error.message}`);
      }
    } else {
      memoryContracts.set(data.id, record);
    }

    return record;
  },

  async getContract(id: string): Promise<ContractRecord | undefined> {
    if (isSupabaseMode) {
      const { data, error } = await supabase!
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return undefined;

      return {
        id: data.id,
        original_text: data.original_text ?? '',
        original_filename: data.original_filename ?? '',
        file_size_bytes: data.file_size_bytes ?? 0,
        page_count: data.page_count ?? 0,
        contract_type: data.contract_type,
        status: data.status,
        analysis_result: data.analysis_result,
        classification_result: data.classification_result,
        correction_result: data.correction_result,
        error_message: data.error_message,
        created_at: data.created_at,
      };
    }

    return memoryContracts.get(id);
  },

  async updateContract(
    id: string,
    updates: Partial<ContractRecord>
  ): Promise<ContractRecord | undefined> {
    if (isSupabaseMode) {
      // Mapear campos para o schema do Supabase
      const supabaseUpdates: Record<string, unknown> = {};
      if (updates.status !== undefined) supabaseUpdates.status = updates.status;
      if (updates.contract_type !== undefined) supabaseUpdates.contract_type = updates.contract_type;
      if (updates.analysis_result !== undefined) supabaseUpdates.analysis_result = updates.analysis_result;
      if (updates.classification_result !== undefined) supabaseUpdates.classification_result = updates.classification_result;
      if (updates.correction_result !== undefined) supabaseUpdates.correction_result = updates.correction_result;
      if (updates.error_message !== undefined) supabaseUpdates.error_message = updates.error_message;

      const { data, error } = await supabase!
        .from('contracts')
        .update(supabaseUpdates)
        .eq('id', id)
        .select('*')
        .single();

      if (error || !data) {
        console.error('[Store] Erro ao atualizar contrato:', error?.message);
        return undefined;
      }

      return {
        id: data.id,
        original_text: data.original_text ?? '',
        original_filename: data.original_filename ?? '',
        file_size_bytes: data.file_size_bytes ?? 0,
        page_count: data.page_count ?? 0,
        contract_type: data.contract_type,
        status: data.status,
        analysis_result: data.analysis_result,
        classification_result: data.classification_result,
        correction_result: data.correction_result,
        error_message: data.error_message,
        created_at: data.created_at,
      };
    }

    const record = memoryContracts.get(id);
    if (!record) return undefined;
    const updated = { ...record, ...updates };
    memoryContracts.set(id, updated);
    return updated;
  },
};
