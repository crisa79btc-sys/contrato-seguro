/**
 * Store em memória para desenvolvimento local.
 * TODO: Substituir por Supabase quando configurado.
 */

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
  error_message: string | null;
  created_at: string;
};

const contracts = new Map<string, ContractRecord>();

export const store = {
  createContract(data: {
    id: string;
    original_text: string;
    original_filename: string;
    file_size_bytes: number;
    page_count: number;
  }): ContractRecord {
    const record: ContractRecord = {
      ...data,
      contract_type: null,
      status: 'uploaded',
      analysis_result: null,
      classification_result: null,
      error_message: null,
      created_at: new Date().toISOString(),
    };
    contracts.set(data.id, record);
    return record;
  },

  getContract(id: string): ContractRecord | undefined {
    return contracts.get(id);
  },

  updateContract(id: string, updates: Partial<ContractRecord>): ContractRecord | undefined {
    const record = contracts.get(id);
    if (!record) return undefined;
    const updated = { ...record, ...updates };
    contracts.set(id, updated);
    return updated;
  },
};
