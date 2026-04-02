import { describe, it, expect } from 'vitest';
import { store } from '../store';

describe('store', () => {
  it('cria e recupera um contrato', async () => {
    const contract = await store.createContract({
      id: 'test-1',
      original_text: 'Contrato de teste',
      original_filename: 'contrato.pdf',
      file_size_bytes: 1024,
      page_count: 2,
    });

    expect(contract.id).toBe('test-1');
    expect(contract.status).toBe('uploaded');
    expect(contract.contract_type).toBeNull();

    const retrieved = await store.getContract('test-1');
    expect(retrieved).toEqual(contract);
  });

  it('retorna undefined para id inexistente', async () => {
    const result = await store.getContract('nao-existe');
    expect(result).toBeUndefined();
  });

  it('atualiza campos do contrato', async () => {
    await store.createContract({
      id: 'test-2',
      original_text: 'Texto',
      original_filename: 'teste.pdf',
      file_size_bytes: 512,
      page_count: 1,
    });

    const updated = await store.updateContract('test-2', {
      status: 'analyzed',
      contract_type: 'aluguel',
    });

    expect(updated?.status).toBe('analyzed');
    expect(updated?.contract_type).toBe('aluguel');
    expect(updated?.original_filename).toBe('teste.pdf');
  });

  it('retorna undefined ao atualizar id inexistente', async () => {
    const result = await store.updateContract('nao-existe', { status: 'error' });
    expect(result).toBeUndefined();
  });
});
