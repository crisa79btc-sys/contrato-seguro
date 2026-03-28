import { describe, it, expect } from 'vitest';
import { cleanContractText } from '../text-cleaner';

describe('cleanContractText', () => {
  it('remove linhas em branco excessivas', () => {
    const input = 'Cláusula 1\n\n\n\n\nCláusula 2';
    const result = cleanContractText(input);
    expect(result).toBe('Cláusula 1\n\nCláusula 2');
  });

  it('remove espaços múltiplos', () => {
    const input = 'O   locatário    deve   pagar';
    const result = cleanContractText(input);
    expect(result).toBe('O locatário deve pagar');
  });

  it('remove paginação PDF', () => {
    const input = 'Cláusula 1\nPágina 1 de 10\nCláusula 2';
    const result = cleanContractText(input);
    expect(result).toBe('Cláusula 1\n\nCláusula 2');
  });

  it('remove paginação com formato numérico', () => {
    const input = 'Texto\n3/10\nMais texto';
    const result = cleanContractText(input);
    expect(result).toBe('Texto\n\nMais texto');
  });

  it('trunca textos muito longos', () => {
    const longText = 'A'.repeat(60000);
    const result = cleanContractText(longText);
    expect(result.length).toBeLessThan(52000);
    expect(result).toContain('[NOTA: Contrato truncado');
  });

  it('preserva texto curto sem alteração significativa', () => {
    const input = 'Contrato simples entre partes.';
    const result = cleanContractText(input);
    expect(result).toBe('Contrato simples entre partes.');
  });

  it('normaliza CRLF para LF', () => {
    const input = 'Linha 1\r\nLinha 2';
    const result = cleanContractText(input);
    expect(result).toBe('Linha 1\nLinha 2');
  });
});
