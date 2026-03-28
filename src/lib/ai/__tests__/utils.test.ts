import { describe, it, expect } from 'vitest';
import { safeParseJSON } from '../utils';

describe('safeParseJSON', () => {
  it('parseia JSON limpo', () => {
    const result = safeParseJSON('{"type": "aluguel"}');
    expect(result).toEqual({ type: 'aluguel' });
  });

  it('parseia JSON dentro de bloco markdown', () => {
    const input = 'Aqui está o resultado:\n```json\n{"score": 75}\n```\n';
    const result = safeParseJSON(input);
    expect(result).toEqual({ score: 75 });
  });

  it('parseia JSON dentro de bloco markdown sem language tag', () => {
    const input = '```\n{"score": 75}\n```';
    const result = safeParseJSON(input);
    expect(result).toEqual({ score: 75 });
  });

  it('parseia JSON com texto antes e depois', () => {
    const input = 'A análise encontrou:\n{"risk_level": "high"}\nFim da análise.';
    const result = safeParseJSON(input);
    expect(result).toEqual({ risk_level: 'high' });
  });

  it('parseia array JSON', () => {
    const input = 'Resultado: [1, 2, 3]';
    const result = safeParseJSON(input);
    expect(result).toEqual([1, 2, 3]);
  });

  it('lança erro para input totalmente inválido', () => {
    expect(() => safeParseJSON('isso não é JSON')).toThrow(
      'formato inválido'
    );
  });

  it('lança erro para string vazia', () => {
    expect(() => safeParseJSON('')).toThrow('formato inválido');
  });

  it('parseia JSON com espaços e newlines extras', () => {
    const input = '  \n  {"value": 42}  \n  ';
    const result = safeParseJSON(input);
    expect(result).toEqual({ value: 42 });
  });
});
