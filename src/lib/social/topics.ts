/**
 * Banco de temas para posts automáticos.
 * 30+ temas com rotação automática por categoria e tipo.
 */

import type { TopicTemplate, PostCategory } from './types';

export const TOPIC_BANK: TopicTemplate[] = [
  // === ALUGUEL ===
  {
    key: 'aluguel-multa-rescisao',
    category: 'aluguel',
    type: 'dica',
    promptHint: 'Multa por rescisão antecipada de aluguel: o que diz a Lei do Inquilinato (Lei 8.245/91 art. 4º). A multa deve ser proporcional ao tempo restante.',
  },
  {
    key: 'aluguel-reajuste-abusivo',
    category: 'aluguel',
    type: 'mito_verdade',
    promptHint: 'Mito: o proprietário pode reajustar o aluguel no valor que quiser. Verdade: o reajuste deve seguir o índice previsto no contrato (IGPM, IPCA).',
  },
  {
    key: 'aluguel-checklist-antes',
    category: 'aluguel',
    type: 'checklist',
    promptHint: '5 itens essenciais para verificar antes de assinar um contrato de aluguel: vistoria, índice de reajuste, multa rescisória, garantias, responsabilidade por reparos.',
  },
  {
    key: 'aluguel-vistoria',
    category: 'aluguel',
    type: 'dica',
    promptHint: 'A importância da vistoria de entrada e saída no contrato de aluguel. Sem laudo de vistoria, o inquilino pode ser cobrado indevidamente por danos pré-existentes.',
  },
  {
    key: 'aluguel-garantias',
    category: 'aluguel',
    type: 'pergunta',
    promptHint: 'Qual garantia locatícia você usa? Caução, fiador ou seguro-fiança? Cada uma tem vantagens e desvantagens. Pergunte ao público qual prefere.',
  },

  // === TRABALHO ===
  {
    key: 'trabalho-experiencia',
    category: 'trabalho',
    type: 'dica',
    promptHint: 'Contrato de experiência: máximo 90 dias (CLT art. 445). Se ultrapassar, vira contrato por prazo indeterminado automaticamente.',
  },
  {
    key: 'trabalho-pj-clt',
    category: 'trabalho',
    type: 'mito_verdade',
    promptHint: 'Mito: trabalhar como PJ é sempre vantajoso. Verdade: se há subordinação, habitualidade e pessoalidade, é vínculo CLT disfarçado (pejotização ilegal).',
  },
  {
    key: 'trabalho-horas-extras',
    category: 'trabalho',
    type: 'estatistica',
    promptHint: 'Horas extras no contrato de trabalho: devem ser pagas com adicional mínimo de 50% (CF art. 7º XVI). Muitos contratos tentam incluir cláusula de banco de horas irregular.',
  },
  {
    key: 'trabalho-rescisao',
    category: 'trabalho',
    type: 'checklist',
    promptHint: '4 direitos que todo trabalhador tem na rescisão sem justa causa: aviso prévio, multa 40% FGTS, férias proporcionais, 13º proporcional.',
  },
  {
    key: 'trabalho-non-compete',
    category: 'trabalho',
    type: 'dica',
    promptHint: 'Cláusula de não-competição em contratos de trabalho: para ser válida, precisa ter prazo limitado, área geográfica definida e compensação financeira.',
  },

  // === SERVIÇO ===
  {
    key: 'servico-escopo',
    category: 'servico',
    type: 'dica',
    promptHint: 'A importância de definir o escopo exato no contrato de prestação de serviço. Sem escopo claro, o prestador pode ser cobrado por trabalho não combinado.',
  },
  {
    key: 'servico-pagamento',
    category: 'servico',
    type: 'checklist',
    promptHint: '3 cláusulas essenciais de pagamento em contratos de serviço: valor, prazo, condições de reajuste. Nunca aceite "a combinar".',
  },
  {
    key: 'servico-cancelamento',
    category: 'servico',
    type: 'mito_verdade',
    promptHint: 'Mito: o prestador pode cancelar o serviço a qualquer momento sem consequências. Verdade: o CC arts. 602-609 prevê obrigações de ambas as partes.',
  },
  {
    key: 'servico-responsabilidade',
    category: 'servico',
    type: 'pergunta',
    promptHint: 'Você já verificou se seu contrato de serviço tem cláusula de limitação de responsabilidade? Muitos contratos limitam a responsabilidade do prestador ao valor pago.',
  },

  // === COMPRA E VENDA ===
  {
    key: 'compra-veiculo-dut',
    category: 'compra_venda',
    type: 'dica',
    promptHint: 'Na compra de veículo, a propriedade se transfere pela tradição (entrega), não pelo registro (CC art. 1.267). O DUT deve ser preenchido e assinado na hora.',
  },
  {
    key: 'compra-veiculo-reserva',
    category: 'compra_venda',
    type: 'mito_verdade',
    promptHint: 'Mito: cláusula de reserva de domínio é ilegal. Verdade: é perfeitamente válida (CC arts. 521-528). O vendedor mantém a propriedade até quitação total.',
  },
  {
    key: 'compra-imovel-checklist',
    category: 'compra_venda',
    type: 'checklist',
    promptHint: '5 documentos essenciais antes de comprar um imóvel: matrícula atualizada, certidões negativas, IPTU, habite-se, certidão de ônus reais.',
  },
  {
    key: 'compra-arrependimento',
    category: 'compra_venda',
    type: 'estatistica',
    promptHint: 'Direito de arrependimento: nas compras fora do estabelecimento (online), o consumidor tem 7 dias para desistir (CDC art. 49). Em contratos presenciais, não existe esse direito automático.',
  },

  // === CONSUMIDOR ===
  {
    key: 'consumidor-clausula-abusiva',
    category: 'consumidor',
    type: 'dica',
    promptHint: 'Cláusulas abusivas são NULAS de pleno direito (CDC art. 51). Exemplos: multa acima de 2%, perda total do valor pago, renúncia a direitos básicos.',
  },
  {
    key: 'consumidor-propaganda-enganosa',
    category: 'consumidor',
    type: 'mito_verdade',
    promptHint: 'Mito: se não está no contrato escrito, não vale. Verdade: a propaganda integra o contrato (CDC art. 30). O que foi prometido na publicidade deve ser cumprido.',
  },
  {
    key: 'consumidor-garantia',
    category: 'consumidor',
    type: 'dica',
    promptHint: 'Garantia legal vs contratual: a garantia legal é de 30 dias (não-duráveis) ou 90 dias (duráveis) e não pode ser excluída por contrato (CDC art. 26).',
  },
  {
    key: 'consumidor-negativacao',
    category: 'consumidor',
    type: 'pergunta',
    promptHint: 'Você sabe que a negativação indevida gera direito a indenização? Pergunte ao público se já passaram por isso e se conhecem seus direitos.',
  },

  // === DIGITAL ===
  {
    key: 'digital-termos-uso',
    category: 'digital',
    type: 'dica',
    promptHint: 'Termos de uso de apps e serviços digitais: você sabia que aceitar sem ler pode significar abrir mão de direitos? A LGPD garante proteção mesmo assim.',
  },
  {
    key: 'digital-lgpd',
    category: 'digital',
    type: 'estatistica',
    promptHint: 'LGPD (Lei 13.709/2018): empresas que coletam dados pessoais precisam de consentimento específico. Contratos digitais devem informar quais dados são coletados e para quê.',
  },
  {
    key: 'digital-assinatura-eletronica',
    category: 'digital',
    type: 'mito_verdade',
    promptHint: 'Mito: contrato assinado digitalmente não tem valor legal. Verdade: a assinatura eletrônica tem validade jurídica (Lei 14.063/2020 e MP 2.200-2/2001).',
  },
  {
    key: 'digital-cancelamento-assinatura',
    category: 'digital',
    type: 'checklist',
    promptHint: '3 direitos ao cancelar assinaturas digitais: cancelamento imediato, sem multa abusiva, reembolso proporcional. Muitos contratos tentam impor fidelidade irregular.',
  },

  // === GERAL ===
  {
    key: 'geral-ler-contrato',
    category: 'geral',
    type: 'estatistica',
    promptHint: 'Pesquisas mostram que mais de 90% das pessoas assinam contratos sem ler. Uma análise pode evitar prejuízos de milhares de reais.',
  },
  {
    key: 'geral-testemunhas',
    category: 'geral',
    type: 'dica',
    promptHint: 'Testemunhas em contrato: não são obrigatórias para validade, mas tornam o contrato título executivo extrajudicial (CPC art. 784). Sempre inclua 2 testemunhas.',
  },
  {
    key: 'geral-prazo-prescricao',
    category: 'geral',
    type: 'dica',
    promptHint: 'Prazos de prescrição: ação de cobrança prescreve em 5 anos (CC art. 206 §5º). Não deixe para agir tarde demais se identificar problemas no contrato.',
  },
  {
    key: 'geral-foro-competente',
    category: 'geral',
    type: 'mito_verdade',
    promptHint: 'Mito: o foro definido no contrato é sempre obrigatório. Verdade: em relação de consumo, o consumidor pode ajuizar ação no seu domicílio (CDC art. 101 I).',
  },
  {
    key: 'geral-ia-contratos',
    category: 'geral',
    type: 'dica',
    promptHint: 'Como a IA pode ajudar na análise de contratos: identificação rápida de cláusulas abusivas, comparação com legislação vigente, sugestão de correções. CTA para usar o ContratoSeguro.',
  },
  {
    key: 'geral-importancia-escrito',
    category: 'geral',
    type: 'pergunta',
    promptHint: 'Você já fez um acordo "de boca" que deu errado? Contrato verbal é válido, mas difícil de provar. Pergunte ao público suas experiências.',
  },
];

/**
 * Escolhe o próximo tema evitando repetições.
 * - Não repete temas já postados no ciclo
 * - Não repete a mesma categoria consecutivamente
 * - Reseta o ciclo quando todos os temas foram usados
 */
export function pickNextTopic(
  postedKeys: string[],
  lastCategory: string | null
): TopicTemplate {
  // Filtrar temas ainda não postados
  let available = TOPIC_BANK.filter((t) => !postedKeys.includes(t.key));

  // Se todos foram postados, resetar ciclo
  if (available.length === 0) {
    available = [...TOPIC_BANK];
  }

  // Evitar mesma categoria consecutiva
  if (lastCategory) {
    const different = available.filter((t) => t.category !== lastCategory);
    if (different.length > 0) {
      available = different;
    }
  }

  // Escolher aleatoriamente entre os disponíveis
  const index = Math.floor(Math.random() * available.length);
  return available[index];
}

/**
 * Posts de fallback caso o Claude falhe.
 */
export const FALLBACK_POSTS = [
  {
    text: '🛡️ Você sabia que cláusulas abusivas em contratos são NULAS de pleno direito?\n\nO Código de Defesa do Consumidor (art. 51) protege você contra abusos contratuais.\n\n📋 Analise seu contrato gratuitamente com IA:\n👉 contrato-seguro-inky.vercel.app\n\n⚖️ Conteúdo informativo. Não substitui orientação jurídica profissional.',
    hashtags: ['#contratos', '#direitodoconsumidor', '#clausulaabusiva', '#direitoslegais'],
    imageHeadline: 'Cláusulas abusivas são NULAS',
  },
  {
    text: '📝 Antes de assinar qualquer contrato, verifique:\n\n✅ Multa rescisória proporcional\n✅ Índice de reajuste definido\n✅ Prazo e condições claras\n✅ Responsabilidades de cada parte\n✅ Foro competente\n\n🔍 Nossa IA analisa tudo isso em segundos:\n👉 contrato-seguro-inky.vercel.app\n\n⚖️ Conteúdo informativo. Não substitui orientação jurídica profissional.',
    hashtags: ['#contratos', '#dicasjuridicas', '#protejaseusdiireitos'],
    imageHeadline: 'Checklist antes de assinar',
  },
  {
    text: '🏠 Vai alugar um imóvel?\n\nNunca assine sem verificar:\n- Quem paga IPTU e condomínio\n- Regras de rescisão antecipada\n- Condições da vistoria\n\n🛡️ Analise seu contrato gratuitamente:\n👉 contrato-seguro-inky.vercel.app\n\n⚖️ Conteúdo informativo. Não substitui orientação jurídica profissional.',
    hashtags: ['#aluguel', '#contratodealuguel', '#inquilino', '#direitoimobiliario'],
    imageHeadline: 'Cuidados no contrato de aluguel',
  },
];
