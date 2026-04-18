/**
 * Store dual-mode: Supabase (produção) ou memória (dev local).
 * Detecta automaticamente se Supabase está configurado.
 *
 * Modo Supabase usa o schema 001 (normalizado):
 * - contracts: dados básicos do contrato
 * - analyses: resultado da análise (1:1 com contracts, JSONB completo em `parties`)
 * - corrected_contracts: resultado da correção (1:1 com contracts, JSONB completo em `changes`)
 *
 * A interface ContractRecord é idêntica — nenhuma API route precisa mudar.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type ContractRecord = {
  id: string;
  user_id: string | null;
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
  console.log('[Store] Modo Supabase ativado (schema 001 normalizado)');
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
    user_id?: string;
  }): Promise<ContractRecord> {
    const record: ContractRecord = {
      ...data,
      user_id: data.user_id ?? null,
      contract_type: null,
      status: 'uploaded',
      analysis_result: null,
      classification_result: null,
      correction_result: null,
      error_message: null,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseMode) {
      const insertData: Record<string, unknown> = {
        id: record.id,
        original_text: record.original_text,
        original_filename: record.original_filename,
        file_size_bytes: record.file_size_bytes,
        page_count: record.page_count,
        status: 'uploaded',
      };
      if (data.user_id) insertData.user_id = data.user_id;

      const { error } = await supabase!.from('contracts').insert(insertData);
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
      // Todas as 3 queries em paralelo (antes eram sequenciais)
      const [contractRes, analysisRes, correctionRes] = await Promise.all([
        supabase!.from('contracts').select('*').eq('id', id).single(),
        supabase!.from('analyses').select('parties').eq('contract_id', id).maybeSingle(),
        supabase!.from('corrected_contracts').select('changes').eq('contract_id', id).maybeSingle(),
      ]);

      if (contractRes.error) {
        console.error('[Store] Erro ao buscar contrato:', contractRes.error.message);
        return undefined;
      }
      const c = contractRes.data;
      if (!c) return undefined;

      if (analysisRes.error) {
        console.error('[Store] Erro ao buscar análise:', analysisRes.error.message);
      }
      if (correctionRes.error) {
        console.error('[Store] Erro ao buscar correção:', correctionRes.error.message);
      }

      const analysisResult = analysisRes.data?.parties ?? null;
      const correctionResult = correctionRes.data?.changes ?? null;

      return {
        id: c.id,
        user_id: c.user_id ?? null,
        original_text: c.original_text ?? '',
        original_filename: c.original_filename ?? '',
        file_size_bytes: c.file_size_bytes ?? 0,
        page_count: c.page_count ?? 0,
        contract_type: c.contract_type,
        status: c.status,
        analysis_result: analysisResult,
        classification_result: null,
        correction_result: correctionResult,
        error_message: c.error_message,
        created_at: c.created_at,
      };
    }

    return memoryContracts.get(id);
  },

  async updateContract(
    id: string,
    updates: Partial<ContractRecord>
  ): Promise<ContractRecord | undefined> {
    if (isSupabaseMode) {
      // 1. Atualizar tabela contracts (campos básicos)
      const contractUpdates: Record<string, unknown> = {};
      if (updates.status !== undefined) contractUpdates.status = updates.status;
      if (updates.contract_type !== undefined) contractUpdates.contract_type = updates.contract_type;
      if (updates.error_message !== undefined) contractUpdates.error_message = updates.error_message;

      if (Object.keys(contractUpdates).length > 0) {
        const { error } = await supabase!
          .from('contracts')
          .update(contractUpdates)
          .eq('id', id);

        if (error) {
          console.error('[Store] Erro ao atualizar contrato:', error.message);
          return undefined;
        }
      }

      // 2. Upsert resultado da análise na tabela analyses
      if (updates.analysis_result != null) {
        const ar = updates.analysis_result as Record<string, unknown>;
        const gs = ar.global_score as Record<string, unknown> | undefined;
        const usage = ar.usage as Record<string, unknown> | undefined;

        const { error: aErr } = await supabase!
          .from('analyses')
          .upsert(
            {
              contract_id: id,
              risk_score: gs?.value ?? null,
              global_score_interpretation: gs?.interpretation ?? null,
              summary: ar.executive_summary ?? null,
              tier: 'free',
              total_clauses_analyzed: ar.total_issues ?? 0,
              problematic_clauses_count: ar.total_issues ?? 0,
              ai_model_used: usage?.model ?? null,
              ai_tokens_input: usage?.tokensInput ?? null,
              ai_tokens_output: usage?.tokensOutput ?? null,
              processing_time_ms: usage?.durationMs ?? null,
              parties: ar, // JSONB: armazena resultado completo para reconstrução
            },
            { onConflict: 'contract_id' }
          );

        if (aErr) {
          console.error('[Store] Erro ao salvar análise:', aErr.message);
          throw new Error(`Erro ao salvar análise: ${aErr.message}`);
        }
      }

      // 3. Upsert resultado da correção na tabela corrected_contracts
      if (updates.correction_result != null) {
        const cr = updates.correction_result as Record<string, unknown>;
        const usage = cr.usage as Record<string, unknown> | undefined;

        // Buscar analysis_id (FK opcional)
        let analysisId: string | null = null;
        const { data: aRef } = await supabase!
          .from('analyses')
          .select('id')
          .eq('contract_id', id)
          .single();
        if (aRef) analysisId = aRef.id;

        const { error: cErr } = await supabase!
          .from('corrected_contracts')
          .upsert(
            {
              contract_id: id,
              analysis_id: analysisId,
              corrected_text: cr.corrected_text ?? null,
              changes_summary: cr.changes_summary ?? null,
              changes: cr, // JSONB: armazena resultado completo para reconstrução
              ai_model_used: usage?.model ?? null,
              ai_tokens_input: usage?.tokensInput ?? null,
              ai_tokens_output: usage?.tokensOutput ?? null,
              processing_time_ms: usage?.durationMs ?? null,
            },
            { onConflict: 'contract_id' }
          );

        if (cErr) {
          console.error('[Store] Erro ao salvar correção:', cErr.message);
          throw new Error(`Erro ao salvar correção: ${cErr.message}`);
        }
      }

      // Retornar registro completo atualizado
      return this.getContract(id);
    }

    // Modo memória
    const record = memoryContracts.get(id);
    if (!record) return undefined;
    const updated = { ...record, ...updates };
    memoryContracts.set(id, updated);
    return updated;
  },
};
