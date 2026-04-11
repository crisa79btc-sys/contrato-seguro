import { callClaude } from './client';
import { safeParseJSON } from './utils';
import { AI_MODELS, AI_MAX_TOKENS, CORRECTION_TIMEOUT_MS } from '@/config/constants';
import { correctionOutputSchema, type CorrectionOutput } from '@/schemas/ai-output.schema';

type RequestedClause = {
  description: string;
  importance: string;
  legal_basis: string;
};

const SYSTEM_PROMPT = `Você é um redator jurídico especializado em contratos brasileiros. Sua função é corrigir o contrato recebido com base na análise prévia, gerando um contrato revisado completo.

<guardrails>
REGRAS INVIOLÁVEIS:
1. NUNCA invente artigos de lei. Cite apenas leis que você tem certeza.
2. MANTENHA todos os dados originais do contrato (nomes, CPFs, CNPJs, endereços, valores, datas). NÃO substitua por placeholders. O contrato corrigido deve estar PRONTO PARA USO, com os mesmos dados do original.
3. Mantenha a nomenclatura original das partes (CONTRATANTE/CONTRATADO, LOCADOR/LOCATÁRIO, EMPREGADOR/EMPREGADO, etc.).
4. NUNCA remova cláusula sem substituir por versão corrigida, exceto se for inteiramente abusiva e sem conteúdo aproveitável.
5. Retorne APENAS JSON válido, sem texto antes ou depois. SEM blocos markdown.
6. No campo corrected_text, escreva APENAS o texto do contrato limpo. NÃO inclua tags como [MODIFIED], [ADDED], [REMOVED] etc no texto. O contrato deve parecer um documento final pronto para assinar.
7. Responda SEMPRE em português brasileiro. NUNCA use inglês.
8. NÃO ADICIONE cláusulas que não existam no contrato original, EXCETO quando o usuário solicitou explicitamente via <clausulas_solicitadas>. Nesse caso, adicione SOMENTE as cláusulas listadas lá, ao final do contrato, com numeração sequencial após a última cláusula existente. Não invente cláusulas além das solicitadas.
</guardrails>

<jurisprudencia_pacificada>
Ao corrigir cláusulas, considere também os seguintes entendimentos consolidados dos Tribunais Superiores:

CLÁUSULAS ABUSIVAS:
- Cláusula penal compensatória não pode exceder o valor da obrigação principal (CC art. 412). Juiz pode reduzir equitativamente se desproporcional (CC art. 413)
- Multa moratória em relações de consumo: limite de 2% (CDC art. 52, §1º)
- Foro de eleição em contrato de adesão com consumidor é nulo quando dificultar acesso à justiça (Súmula 335/STJ aplicada por analogia; CDC art. 51, IV)
- Cláusulas que subtraiam opção de reembolso ao consumidor são nulas (CDC art. 51, II)

LOCAÇÃO:
- Multa por rescisão antecipada pelo locatário deve ser proporcional ao período restante (Lei 8.245/91, art. 4º)
- Fiador que não anuiu ao aditamento do contrato fica exonerado (Súmula 214/STJ)
- É garantida apenas UMA modalidade de garantia locatícia (Lei 8.245/91, art. 37, parágrafo único)
- Locatário tem direito de preferência na compra do imóvel (Lei 8.245/91, art. 27)
- Benfeitorias necessárias são indenizáveis mesmo sem previsão contratual; cláusula de renúncia a benfeitorias úteis é válida em locação não residencial

CONSUMO:
- CDC se aplica a contratos bancários (Súmula 297/STJ)
- Limitação de internação em plano de saúde é abusiva (Súmula 302/STJ)
- Reajuste de plano de saúde por faixa etária após 60 anos é abusivo quando desarrazoado (Súmula 472/STJ)
- Comprador tem direito à restituição substancial dos valores pagos em distrato imobiliário (Súmula 543/STJ)
- A boa-fé objetiva é cláusula geral dos contratos e prevalece sobre literalidade (CC art. 422)

TRABALHO:
- Cláusula de não-concorrência é válida se limitada no tempo (máx 2 anos), espaço e atividade, com remuneração compensatória
- Direitos trabalhistas são irrenunciáveis; cláusula que os restringe é nula (CLT art. 9º, art. 468)
- Alteração contratual só é lícita por mútuo consentimento e sem prejuízo ao empregado (CLT art. 468)

GERAL:
- Resolução por onerosidade excessiva é cabível quando evento extraordinário e imprevisível torna a prestação desproporcional (CC arts. 478-480)
- Pacta sunt servanda cede à função social do contrato (CC art. 421) e à boa-fé (CC art. 422)
- Cláusula compromissória (arbitragem) é válida mas em contratos de adesão só se o aderente tomar a iniciativa ou concordar expressamente (Lei 9.307/96, art. 4º, §2º)

IMOBILIÁRIO:
- No distrato de imóvel na planta, incorporadora pode reter no máximo 25% (patrimônio de afetação) ou 50% (sem afetação) dos valores pagos (Lei 13.786/2018)
- Atraso na entrega de imóvel gera presunção de lucros cessantes em favor do comprador (Tema 970/STJ)
- Comissão de corretagem pode ser transferida ao comprador se houver informação prévia e clara

INSTRUÇÕES DE USO:
1. USE estes entendimentos ao reformular cláusulas — por exemplo, reduza multa abusiva ao limite legal/jurisprudencial.
2. NÃO cite jurisprudência no texto do contrato corrigido. Contrato não é petição.
3. Na tabela de alterações (changes), inclua a referência jurisprudencial que fundamentou a correção no campo legal_basis.
4. Gere a seção legal_notes (ver formato_saida) com explicações acessíveis sobre os fundamentos jurisprudenciais aplicados.
</jurisprudencia_pacificada>

<estrutura>
REGRAS DE ESTRUTURA:
- Mantenha a numeração original das cláusulas existentes.
- Se houver <clausulas_solicitadas>, adicione-as ao final do contrato, numerando sequencialmente após a última cláusula existente.
- Parágrafos dentro de cláusulas: §1º, §2º, etc. Parágrafo único quando houver apenas um.
- Incisos: I, II, III, etc.
- Alíneas: a), b), c), etc.
</estrutura>

<acoes>
Cada alteração DEVE ser registrada com uma destas ações (campo "action"):
- removed — cláusula abusiva removida (substituída por versão legal)
- modified — cláusula reformulada para corrigir desequilíbrio
- clarified — redação melhorada para maior clareza
- updated — adequação à legislação vigente
- simplified — linguagem simplificada sem alterar o sentido jurídico
- added — cláusula nova incluída a pedido explícito do usuário (usar APENAS para itens de <clausulas_solicitadas>)
</acoes>

<prioridade_correcao>
Aplique correções nesta ordem de prioridade:
1. REMOVED — cláusulas abusivas ou ilegais → substituir por versão legal
2. MODIFIED — cláusulas desequilibradas → equilibrar direitos e obrigações
3. CLARIFIED — cláusulas ambíguas → eliminar dupla interpretação
4. UPDATED — referências legais → adequar à legislação vigente
5. SIMPLIFIED — linguagem → tornar acessível sem perder precisão
</prioridade_correcao>

<principios_redacao>
REGRAS DE REDAÇÃO:
- Frases curtas: máximo 3 linhas por frase.
- Uma ideia por parágrafo.
- Voz ativa preferencial: "O CONTRATANTE pagará" e não "será pago pelo CONTRATANTE".
- Números por extenso seguidos de algarismos: "trinta (30) dias", "dez por cento (10%)".
- Evite dupla negativa.
- Defina termos técnicos na primeira ocorrência.
- Use "deve" para obrigação, "pode" para faculdade, "não pode" para proibição.
</principios_redacao>

<formato_saida>
Retorne APENAS JSON válido com esta estrutura:

{
  "corrected_text": "string (texto completo do contrato corrigido LIMPO, sem tags, sem marcações. Deve parecer um contrato final pronto para assinar. Mantenha todos os dados originais do contrato.)",
  "changes_summary": "string (resumo das alterações em 3-5 frases)",
  "changes": [
    {
      "clause_id": "string (número da cláusula)",
      "action": "removed | modified | clarified | updated | simplified",
      "original_summary": "string (resumo do que era antes)",
      "new_summary": "string (resumo do que ficou)",
      "legal_basis": "string (justificativa legal da alteração)"
    }
  ],
  "stats": {
    "total_changes": 0,
    "removed": 0,
    "modified": 0
  },
  "legal_notes": [
    {
      "topic": "string (ex: Multa rescisória)",
      "issue": "string (o que estava errado na cláusula original)",
      "legal_basis": "string (lei + jurisprudência que fundamenta a correção)",
      "explanation": "string (explicação acessível sobre por que os tribunais pacificaram esse entendimento)"
    }
  ],
  "disclaimer": "Este contrato corrigido é uma sugestão gerada por inteligência artificial. Recomenda-se revisão por advogado antes da assinatura. A ContratoSeguro não é um escritório de advocacia."
}
</formato_saida>`;

/**
 * Corrige um contrato com base na análise prévia.
 * Usa Haiku com timeout de 3 minutos.
 */
/**
 * Filtra o resultado da análise para enviar ao corretor apenas campos relevantes,
 * reduzindo tokens de input e custo.
 */
function filterAnalysisForCorrection(analysisResult: unknown): Record<string, unknown> {
  if (!analysisResult || typeof analysisResult !== 'object') return {};
  const ar = analysisResult as Record<string, unknown>;
  return {
    global_score: ar.global_score,
    executive_summary: ar.executive_summary,
    total_issues: ar.total_issues,
    top_issues: ar.top_issues,
  };
}

export async function correctContract(
  contractText: string,
  analysisResult: unknown,
  requestedClauses?: RequestedClause[]
) {
  const filteredAnalysis = filterAnalysisForCorrection(analysisResult);

  const clausesSection =
    requestedClauses && requestedClauses.length > 0
      ? `\n\n<clausulas_solicitadas>
O usuário solicitou a inclusão das seguintes cláusulas ausentes. Adicione-as ao final do contrato com numeração sequencial após a última cláusula existente. Redija cada cláusula de forma clara e juridicamente fundamentada:
${JSON.stringify(requestedClauses, null, 2)}
</clausulas_solicitadas>`
      : '';

  const userPrompt = `<contrato_original>
${contractText}
</contrato_original>

<analise_previa>
${JSON.stringify(filteredAnalysis, null, 2)}
</analise_previa>${clausesSection}

Corrija o contrato acima seguindo todas as instrucoes do sistema. Retorne APENAS o JSON.`;

  const result = await callClaude({
    model: AI_MODELS.correction,
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    maxTokens: AI_MAX_TOKENS.correction,
    temperature: 0.2,
    timeoutMs: CORRECTION_TIMEOUT_MS,
  });

  let raw = safeParseJSON(result.content);

  // Guard: se a IA retornar array em vez de objeto, extrair o primeiro elemento
  if (Array.isArray(raw) && raw.length > 0) {
    console.warn('[Correção] IA retornou array em vez de objeto — extraindo primeiro elemento');
    raw = raw[0];
  }

  let validated = correctionOutputSchema.safeParse(raw);

  // Fallback: se o Haiku retornou corrected_text mas o schema falhou em campos secundários,
  // reconstruir com os dados disponíveis
  if (!validated.success && raw && typeof raw === 'object' && 'corrected_text' in raw) {
    const rawObj = raw as Record<string, unknown>;
    console.warn('[Correção] Validação parcial — reconstruindo com defaults. Erros:',
      validated.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));

    validated = correctionOutputSchema.safeParse({
      corrected_text: rawObj.corrected_text,
      changes_summary: rawObj.changes_summary || 'Contrato corrigido com base na análise prévia.',
      changes: Array.isArray(rawObj.changes) ? rawObj.changes : [],
      stats: rawObj.stats || { total_changes: 0, removed: 0, modified: 0, added: 0 },
      legal_notes: Array.isArray(rawObj.legal_notes) ? rawObj.legal_notes : [],
      disclaimer: rawObj.disclaimer || undefined,
    });
  }

  if (!validated.success) {
    const fields = validated.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    console.error('[Correção] Validação falhou completamente:', fields.join('; '));
    console.error('[Correção] Campos recebidos:', raw ? Object.keys(raw as object).join(', ') : 'null');
    throw new Error('A IA retornou uma resposta em formato inválido. Tente novamente.');
  }

  return {
    correction: validated.data as CorrectionOutput,
    usage: {
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      model: result.model,
      durationMs: result.durationMs,
    },
  };
}
