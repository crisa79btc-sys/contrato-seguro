/**
 * Banco de temas para posts automáticos.
 * 30+ temas com rotação automática por categoria e tipo.
 */

import type { TopicTemplate, PostCategory, PostType } from './types';

/**
 * Calendário editorial semanal.
 * Cada dia da semana tem uma categoria e tipo preferido.
 * 0 = Domingo, 1 = Segunda, ..., 6 = Sábado (padrão JS getDay())
 */
export const DAY_OF_WEEK_CALENDAR: Record<number, { category: PostCategory; type: PostType }> = {
  0: { category: 'consumidor',  type: 'caso_real'   },  // Dom — caso real chocante
  1: { category: 'trabalho',    type: 'dica'        },  // Seg — direitos trabalhistas
  2: { category: 'aluguel',     type: 'checklist'   },  // Ter — moradia prática
  3: { category: 'consumidor',  type: 'mito_verdade'},  // Qua — mitos do CDC
  4: { category: 'digital',     type: 'dica'        },  // Qui — contratos digitais
  5: { category: 'condominio',  type: 'antes_depois'},  // Sex — antes/depois viral
  6: { category: 'geral',       type: 'caso_real'   },  // Sáb — caso real clássico
};

/**
 * Datas especiais brasileiras — override total de categoria+tipo.
 * Formato: 'MM-DD' → { category, type, hint }
 */
export const SPECIAL_DATES: Record<string, { category: PostCategory; type: PostType; hint: string }> = {
  '01-15': { category: 'trabalho',    type: 'dica',         hint: 'Volta das férias coletivas — direitos do trabalhador no retorno: comprovante de gozo, folha de ponto. CLT art. 143.' },
  '02-10': { category: 'digital',     type: 'caso_real',    hint: 'Temporada de Carnaval e golpes digitais de revenda de ingresso: caso real de cláusula "sem reembolso" em app de eventos, que é NULA (CDC art. 35).' },
  '03-08': { category: 'trabalho',    type: 'estatistica',  hint: 'Dia Internacional da Mulher — estatística de desigualdade salarial e direitos da trabalhadora grávida/licença maternidade (CF art. 7º XVIII + CLT 392).' },
  '03-15': { category: 'consumidor',  type: 'dica',         hint: 'Dia Mundial do Consumidor — CDC art. 6º: 7 direitos básicos que todo consumidor tem.' },
  '05-01': { category: 'trabalho',    type: 'estatistica',  hint: 'Dia do Trabalhador — quantos direitos ainda são violados: FGTS não recolhido, horas extras não pagas. Dados do TST.' },
  '05-12': { category: 'trabalho',    type: 'dica',         hint: 'Dia das Mães (semana) — licença maternidade, adaptação de horários, proibição de discriminação. CF art. 7º XVIII + Lei 11.770/08.' },
  '06-12': { category: 'servico',     type: 'caso_real',    hint: 'Dia dos Namorados — contratos de fotografia/restaurante com cláusula de "não reembolso em caso de desistência". Caso real: noiva perdeu R$ 5k. CDC art. 51.' },
  '08-11': { category: 'geral',       type: 'dica',         hint: 'Dia do Advogado — 5 situações em que NÃO dá pra resolver sozinho: herança complexa, contratos > R$ 50k, divórcio litigioso, ações trabalhistas, despejo.' },
  '09-07': { category: 'consumidor',  type: 'mito_verdade', hint: 'Independência do Brasil — "o consumidor brasileiro é o mais protegido do mundo". Verdade parcial: CDC é top 3 mundial, mas execução falha.' },
  '10-12': { category: 'servico',     type: 'checklist',    hint: 'Dia das Crianças — contratos de festa infantil (buffet, animador, fotógrafo): 5 cláusulas que você TEM que olhar antes de assinar.' },
  '10-29': { category: 'digital',     type: 'dica',         hint: 'Dia Mundial da Internet — termos de uso e LGPD: quais dados você cedeu sem saber. Lei 13.709/18.' },
  '11-25': { category: 'consumidor',  type: 'caso_real',    hint: 'Black Friday — caso real de "desconto enganoso" (preço inflado antes, desconto falso). CDC art. 37 + Decreto 5.903/06 exige histórico de preço honesto.' },
  '12-10': { category: 'trabalho',    type: 'checklist',    hint: 'Dezembro — 13º salário, férias coletivas, rescisões de fim de ano. Checklist do que conferir no holerite.' },
};

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

  // === ALUGUEL — novos ===
  {
    key: 'aluguel-despejo-procedimento',
    category: 'aluguel',
    type: 'dica',
    promptHint: 'Processo de despejo: o locador NÃO pode expulsar o inquilino de forma extrajudicial (cortar água, trocar fechadura). É necessária ação judicial. Lei 8.245/91 arts. 59-66.',
  },
  {
    key: 'aluguel-sublocacao-proibida',
    category: 'aluguel',
    type: 'mito_verdade',
    promptHint: 'Mito: o inquilino pode sublocar o imóvel livremente pelo Airbnb. Verdade: sublocação sem autorização escrita do locador é causa de despejo (Lei 8.245/91 art. 13).',
  },
  {
    key: 'aluguel-reformas-responsabilidade',
    category: 'aluguel',
    type: 'dica',
    promptHint: 'Quem paga reformas no imóvel alugado: locador paga benfeitorias necessárias (estruturais), inquilino paga melhorias estéticas. Cláusula que inverte isso pode ser questionada. Lei 8.245/91 art. 22.',
  },
  {
    key: 'aluguel-renovatoria-comercial',
    category: 'aluguel',
    type: 'dica',
    promptHint: 'Ação renovatória: locatário comercial tem direito à renovação compulsória após 5 anos de contrato e 3 anos no mesmo ramo. Deve ser proposta entre 1 ano e 6 meses antes do vencimento. Lei 8.245/91 art. 51.',
  },
  {
    key: 'aluguel-fiador-pos-entrega',
    category: 'aluguel',
    type: 'mito_verdade',
    promptHint: 'Mito: ao entregar as chaves, o fiador está automaticamente liberado. Verdade: fiador pode responder por dívidas anteriores à entrega das chaves mesmo depois. Para ser liberado, precisa notificação formal. CC art. 835.',
  },
  {
    key: 'aluguel-atraso-consequencias',
    category: 'aluguel',
    type: 'checklist',
    promptHint: 'Consequências do atraso no pagamento do aluguel: multa contratual (geralmente 10%), juros de mora (1% a.m.), correção pelo índice do contrato, possibilidade de ação de despejo por falta de pagamento. Lei 8.245/91.',
  },
  {
    key: 'aluguel-seguro-incendio-obrigacao',
    category: 'aluguel',
    type: 'dica',
    promptHint: 'Seguro contra incêndio no contrato de aluguel: é obrigação legal do LOCADOR contratar (Lei 8.245/91 art. 22, VIII). Cláusula que transfere esse custo ao inquilino pode ser contestada.',
  },
  {
    key: 'aluguel-caucao-limite',
    category: 'aluguel',
    type: 'dica',
    promptHint: 'Caução no contrato de aluguel: limitada a 3 meses de aluguel por lei (Lei 8.245/91 art. 38). Deve ser devolvida corrigida em até 30 dias após a devolução do imóvel sem danos.',
  },

  // === TRABALHO — novos ===
  {
    key: 'trabalho-ferias-direito',
    category: 'trabalho',
    type: 'dica',
    promptHint: 'Férias: empregado adquire direito após 12 meses de serviço (CLT art. 130). Empregador escolhe quando conceder, mas deve avisar com 30 dias de antecedência. Férias vencidas não gozadas devem ser pagas em dobro.',
  },
  {
    key: 'trabalho-assedio-moral',
    category: 'trabalho',
    type: 'dica',
    promptHint: 'Assédio moral no trabalho: humilhações, metas impossíveis, isolamento e ameaças recorrentes geram direito a indenização por danos morais. Pode configurar rescisão indireta (justa causa do empregador). CLT art. 483.',
  },
  {
    key: 'trabalho-home-office-custos',
    category: 'trabalho',
    type: 'mito_verdade',
    promptHint: 'Mito: em home office, o empregador não precisa pagar nada de infraestrutura. Verdade: o contrato DEVE prever quem paga equipamentos e internet. Sem previsão, pode haver responsabilidade. CLT art. 75-D.',
  },
  {
    key: 'trabalho-insalubridade-percentuais',
    category: 'trabalho',
    type: 'checklist',
    promptHint: 'Adicional de insalubridade: grau mínimo (10% do salário mínimo), médio (20%), máximo (40%). Atividades com agentes químicos, físicos ou biológicos nocivos. Laudo de médico do trabalho necessário. CLT art. 189.',
  },
  {
    key: 'trabalho-banco-horas-limite',
    category: 'trabalho',
    type: 'mito_verdade',
    promptHint: 'Mito: banco de horas pode acumular indefinidamente. Verdade: deve ser compensado em até 1 ano (acordo coletivo) ou 6 meses (acordo individual). Se não compensado, vira hora extra a pagar. CLT art. 59 §2º.',
  },
  {
    key: 'trabalho-gestante-estabilidade',
    category: 'trabalho',
    type: 'dica',
    promptHint: 'Estabilidade da gestante: desde a confirmação da gravidez até 5 meses após o parto. Vale mesmo em contrato de experiência. Demissão nesse período gera reintegração ou indenização. CF art. 10, II, b (ADCT).',
  },
  {
    key: 'trabalho-descanso-semanal',
    category: 'trabalho',
    type: 'dica',
    promptHint: 'Descanso semanal remunerado: todo trabalhador tem direito a 1 dia de descanso por semana, preferencialmente domingo (CLT art. 67). Trabalhar no DSR gera pagamento em dobro desse dia.',
  },
  {
    key: 'trabalho-rescisao-indireta',
    category: 'trabalho',
    type: 'dica',
    promptHint: 'Rescisão indireta: quando o empregador descumpre obrigações (não paga, assedia, reduz salário sem acordo), o empregado pode rescindir com direito a todas as verbas como se fosse demitido sem justa causa. CLT art. 483.',
  },

  // === SERVIÇO — novos ===
  {
    key: 'servico-prazo-descumprimento',
    category: 'servico',
    type: 'dica',
    promptHint: 'Atraso na entrega de serviço ou obra: o contratante pode cobrar multa moratória por cada dia de atraso, exigir desconto proporcional ou rescindir com perdas e danos. Contrato sem multa dificulta cobrança. CC arts. 389-391.',
  },
  {
    key: 'servico-exclusividade-limites',
    category: 'servico',
    type: 'mito_verdade',
    promptHint: 'Mito: cláusula de exclusividade em serviços é sempre válida. Verdade: exclusividade irrazoável, sem compensação financeira adequada, pode limitar ilegalmente a liberdade de trabalho. CF art. 5º, XIII.',
  },
  {
    key: 'servico-nda-elementos',
    category: 'servico',
    type: 'checklist',
    promptHint: '4 elementos essenciais de um NDA válido: definição precisa do que é confidencial, prazo de vigência, exceções (informação pública, obrigação legal), e penalidade pelo descumprimento. CC art. 927.',
  },
  {
    key: 'servico-propriedade-intelectual',
    category: 'servico',
    type: 'dica',
    promptHint: 'Propriedade intelectual em contrato criativo (design, software, foto): sem cláusula expressa de cessão de direitos, o criador mantém a propriedade. O contrato DEVE definir quem é dono do que foi entregue. Lei 9.610/98 art. 4º.',
  },
  {
    key: 'servico-autonomo-vinculo',
    category: 'servico',
    type: 'mito_verdade',
    promptHint: 'Mito: contratar como PJ sempre elimina o vínculo empregatício. Verdade: se há subordinação, pessoalidade, habitualidade e remuneração, a Justiça do Trabalho pode reconhecer vínculo CLT mesmo com contrato PJ.',
  },
  {
    key: 'servico-garantia-construcao',
    category: 'servico',
    type: 'dica',
    promptHint: 'Garantia legal em obras e construção civil: construtora e empreiteira respondem por vícios de solidez e segurança durante 5 anos (CC art. 618). Cláusula contratual que reduz esse prazo é nula.',
  },
  {
    key: 'servico-pagamento-antecipado',
    category: 'servico',
    type: 'pergunta',
    promptHint: 'Risco do pagamento 100% antecipado em serviços: o que você faria se pagar tudo antes e o prestador sumir? Pergunte ao público e apresente como se proteger: pagamento em etapas, nota fiscal, contrato escrito.',
  },
  {
    key: 'servico-rescisao-unilateral',
    category: 'servico',
    type: 'dica',
    promptHint: 'Rescisão unilateral pelo contratante: tem direito de cancelar, mas deve pagar os serviços já prestados e indenizar por lucros cessantes razoáveis. Multa contratual deve ser proporcional ao dano. CC art. 473.',
  },

  // === COMPRA E VENDA — novos ===
  {
    key: 'compra-imovel-registro-necessario',
    category: 'compra_venda',
    type: 'dica',
    promptHint: 'Comprar imóvel sem registrar em cartório: contrato de compra e venda NÃO transfere a propriedade. Sem registro, o vendedor pode vender para outra pessoa. Quem registrar primeiro fica com o imóvel. CC art. 1.245.',
  },
  {
    key: 'compra-financiamento-cet',
    category: 'compra_venda',
    type: 'checklist',
    promptHint: '5 itens críticos do contrato de financiamento imobiliário: taxa de juros nominal, CET (Custo Efetivo Total), prazo, sistema de amortização (SAC vs PRICE), e seguros MIP/DFI. Res. BCB 4.553/2017.',
  },
  {
    key: 'compra-consorcio-direitos',
    category: 'compra_venda',
    type: 'dica',
    promptHint: 'Direitos do consorciado: administradora não pode impedir lances, deve prestar contas mensalmente, e é proibida de distribuir os contemplados por ordem de cadastro sem sorteio. Lei 11.795/2008.',
  },
  {
    key: 'compra-veiculo-recall',
    category: 'compra_venda',
    type: 'dica',
    promptHint: 'Recall de veículo: fabricante é obrigado a consertar gratuitamente qualquer defeito de segurança (CDC art. 10). Vender veículo com recall pendente sem informar o comprador configura vício oculto.',
  },
  {
    key: 'compra-veiculo-particular-cuidados',
    category: 'compra_venda',
    type: 'checklist',
    promptHint: '5 cuidados ao comprar veículo de pessoa física: checar restrições no DETRAN, débitos e multas, histórico de sinistros (fipe.org.br), fazer vistoria prévia, e registrar a transferência em até 30 dias. CTB art. 123.',
  },
  {
    key: 'compra-arras-sinal',
    category: 'compra_venda',
    type: 'mito_verdade',
    promptHint: 'Mito: quem dá o sinal sempre perde se desistir do negócio. Verdade: quem desiste perde o sinal (arras confirmatórias). Mas se quem recebeu o sinal desistir, deve devolver EM DOBRO. CC arts. 418-419.',
  },
  {
    key: 'compra-eviccao',
    category: 'compra_venda',
    type: 'dica',
    promptHint: 'Evicção: se você compra um bem que pertence a terceiro e perde para ele por decisão judicial, tem direito a receber de volta o preço pago mais perdas e danos do vendedor original. CC arts. 447-457.',
  },
  {
    key: 'compra-vicio-redibitorio',
    category: 'compra_venda',
    type: 'dica',
    promptHint: 'Vício redibitório: defeito oculto que existia antes da compra e torna o bem inadequado ao uso. Permite devolver com reembolso total ou pedir abatimento do preço. Prazo: 30 dias (móveis) ou 1 ano (imóveis). CC arts. 441-446.',
  },

  // === CONSUMIDOR — novos ===
  {
    key: 'consumidor-vicio-prazos',
    category: 'consumidor',
    type: 'checklist',
    promptHint: 'Prazo para reclamar de vício do produto/serviço: 30 dias para bens não duráveis, 90 dias para bens duráveis. Prazo começa no recebimento ou quando o defeito aparecer. Após o prazo, produto vai para assistência. CDC art. 26.',
  },
  {
    key: 'consumidor-pratica-abusiva-lista',
    category: 'consumidor',
    type: 'checklist',
    promptHint: '5 práticas abusivas proibidas pelo CDC: venda casada (condicionar um produto a outro), preço diferente do anunciado, recusa de venda sem justificativa, cobrar mais por pagamento à vista, e cobrança vexatória de dívidas. CDC art. 39.',
  },
  {
    key: 'consumidor-servico-essencial-corte',
    category: 'consumidor',
    type: 'mito_verdade',
    promptHint: 'Mito: empresa pode cortar água, luz ou internet a qualquer momento por inadimplência. Verdade: corte de serviço essencial exige notificação prévia e não pode ser feito à noite ou em finais de semana e feriados.',
  },
  {
    key: 'consumidor-superendividamento',
    category: 'consumidor',
    type: 'dica',
    promptHint: 'Lei do Superendividamento (14.181/2021): consumidor pessoa física pode pedir repactuação de todas as dívidas em conciliação judicial. Protege o mínimo existencial e permite parcelamento de até 5 anos.',
  },
  {
    key: 'consumidor-cobranca-indevida',
    category: 'consumidor',
    type: 'dica',
    promptHint: 'Cobrança indevida: quem cobra valor que não é devido é obrigado a devolver em dobro o que cobrou indevidamente (CDC art. 42, parágrafo único). Guarde todos os comprovantes — eles são sua prova.',
  },
  {
    key: 'consumidor-procon-quando',
    category: 'consumidor',
    type: 'dica',
    promptHint: 'Quando acionar o PROCON: após tentar resolver diretamente com a empresa e não obter resposta em prazo razoável. PROCON pode aplicar multas e determinar reparação. Acione também no site consumidor.gov.br.',
  },
  {
    key: 'consumidor-recall-obrigacao',
    category: 'consumidor',
    type: 'dica',
    promptHint: 'Recall é obrigatório quando há risco à segurança do consumidor. A empresa deve comunicar ativamente (anúncios, SMS, carta), recolher e corrigir o produto gratuitamente. Omissão gera responsabilidade civil e criminal. CDC art. 10.',
  },
  {
    key: 'consumidor-cancelamento-academia',
    category: 'consumidor',
    type: 'mito_verdade',
    promptHint: 'Mito: academia pode cobrar multa integral pelo cancelamento antes do fim da fidelidade. Verdade: multa deve ser proporcional ao tempo restante. Mudança de cidade ou motivo de saúde permitem cancelamento sem multa.',
  },

  // === DIGITAL — novos ===
  {
    key: 'digital-marketplace-responsabilidade',
    category: 'digital',
    type: 'dica',
    promptHint: 'Responsabilidade do marketplace (Mercado Livre, Shopee, Amazon): a plataforma responde solidariamente por produtos defeituosos vendidos por terceiros. STJ pacificou o entendimento (CDC art. 7º, parágrafo único).',
  },
  {
    key: 'digital-influencer-contrato',
    category: 'digital',
    type: 'checklist',
    promptHint: '5 cláusulas essenciais no contrato com influenciador: cessão de direitos de imagem, prazo e exclusividade, métricas mínimas de entrega, aprovação prévia do conteúdo, e rescisão por comportamento que prejudique a marca.',
  },
  {
    key: 'digital-lgpd-vazamento',
    category: 'digital',
    type: 'dica',
    promptHint: 'Vazamento de dados pessoais: empresa tem obrigação de notificar a ANPD e os titulados afetados em até 2 dias úteis após tomar conhecimento (LGPD art. 48). O titular pode pedir indenização por danos sofridos.',
  },
  {
    key: 'digital-pix-fraude',
    category: 'digital',
    type: 'mito_verdade',
    promptHint: 'Mito: banco nunca é responsável por fraude com Pix. Verdade: banco responde por falha de segurança em sua plataforma (CDC art. 14). Em golpe de engenharia social (quando o cliente é enganado), a responsabilidade é debatida nos tribunais.',
  },
  {
    key: 'digital-contrato-ia',
    category: 'digital',
    type: 'checklist',
    promptHint: '4 pontos críticos em contratos com serviços de IA: quem é dono dos dados e conteúdos gerados, se o conteúdo pode ser usado para treinar o modelo, limitações de responsabilidade por erros, e portabilidade dos dados ao cancelar. LGPD.',
  },
  {
    key: 'digital-saas-contrato',
    category: 'digital',
    type: 'checklist',
    promptHint: '5 cláusulas críticas para analisar em contratos SaaS: SLA de disponibilidade, portabilidade dos dados ao cancelar, propriedade dos dados, limitação de responsabilidade por incidentes, e prazo de aviso para mudanças unilaterais.',
  },

  // === GERAL — novos ===
  {
    key: 'geral-notificacao-extrajudicial',
    category: 'geral',
    type: 'dica',
    promptHint: 'Notificação extrajudicial pelo cartório: interrompe a prescrição, cria prova formal da data e do conteúdo da comunicação, e muitas vezes resolve o conflito sem precisar de processo judicial. CC art. 202, II.',
  },
  {
    key: 'geral-mediacao-arbitragem',
    category: 'geral',
    type: 'dica',
    promptHint: 'Mediação vs Arbitragem vs Judicial: mediação é consensual (mais barata); arbitragem é rápida (6-12 meses) e especializada; via judicial pode levar anos. Cláusula de arbitragem bem redigida evita litígio demorado. Lei 9.307/96.',
  },
  {
    key: 'geral-solidariedade-responsabilidade',
    category: 'geral',
    type: 'dica',
    promptHint: 'Solidariedade no contrato: com cláusula solidária, o credor pode cobrar 100% da dívida de qualquer devedor. Na subsidiariedade, só cobra do garantidor se o devedor principal não pagar. A diferença importa muito. CC art. 275.',
  },
  {
    key: 'geral-boa-fe-objetiva',
    category: 'geral',
    type: 'dica',
    promptHint: 'Boa-fé objetiva (CC art. 422): as partes devem agir com lealdade, transparência e cooperação durante todo o contrato — antes de assinar, durante e após o encerramento. Sua violação pode gerar responsabilidade mesmo sem previsão expressa.',
  },
  {
    key: 'geral-nulidade-anulabilidade',
    category: 'geral',
    type: 'mito_verdade',
    promptHint: 'Mito: contrato irregular é sempre nulo. Verdade: nulidade absoluta (CC art. 166) pode ser arguida por qualquer pessoa a qualquer tempo. Anulabilidade (CC art. 171) só pode ser invocada pela parte prejudicada, dentro de prazo.',
  },
  {
    key: 'geral-contrato-verbal-prova',
    category: 'geral',
    type: 'mito_verdade',
    promptHint: 'Mito: contrato verbal não tem valor legal. Verdade: é válido (CC art. 107), mas difícil de provar. Prints de WhatsApp, e-mails, testemunhos e notas fiscais podem servir como prova. O risco está na falta de evidências.',
  },
  {
    key: 'geral-juros-legais',
    category: 'geral',
    type: 'dica',
    promptHint: 'Juros de mora sem previsão contratual: 1% ao mês (CC art. 406). Juros compostos (anatocismo) são vedados em contratos civis (Súmula STJ 121). Cláusula com juros abusivos pode ser revisada judicialmente.',
  },
  {
    key: 'geral-lesao-contratual',
    category: 'geral',
    type: 'dica',
    promptHint: 'Lesão contratual (CC art. 157): contrato pode ser anulado quando uma parte aproveitou a necessidade ou inexperiência da outra para obter vantagem desproporcional. Muito comum em contratos de empréstimo e financiamento.',
  },
  {
    key: 'geral-cessao-contrato',
    category: 'geral',
    type: 'dica',
    promptHint: 'Cessão de crédito: quando sua credora vende a dívida para um fundo de cobrança, você continua devendo o mesmo valor — a cessão não pode piorar sua situação. O cedente é obrigado a te notificar. CC art. 286.',
  },
  {
    key: 'geral-forca-maior',
    category: 'geral',
    type: 'mito_verdade',
    promptHint: 'Mito: força maior sempre livra de qualquer obrigação. Verdade: força maior exclui responsabilidade pelo inadimplemento naquele momento, mas não cancela o contrato automaticamente. A obrigação pode ser suspensa ou renegociada. CC art. 393.',
  },
  {
    key: 'geral-checklist-final',
    category: 'geral',
    type: 'checklist',
    promptHint: 'Checklist essencial antes de assinar qualquer contrato: identificação completa das partes, objeto claro, valor e forma de pagamento, prazo, multa por descumprimento, foro competente, e 2 testemunhas com CPF.',
  },
  {
    key: 'geral-prescricao-civil',
    category: 'geral',
    type: 'dica',
    promptHint: 'Prazos de prescrição civil: cobrança de dívida prescreve em 5 anos (CC art. 206 §5º, I); responsabilidade civil em 3 anos (CC art. 206 §3º, V). Prescrição pode ser interrompida por notificação ou reconhecimento da dívida.',
  },

  // === PERGUNTAS — engajamento (Tarefa 4.2) ===
  {
    key: 'q-aluguel-pegadinha',
    category: 'aluguel',
    type: 'pergunta',
    promptHint: 'Pergunte de forma direta e provocante qual foi a cláusula mais absurda que o usuário já viu em contrato de aluguel. Explique a importância de ler antes de assinar.',
  },
  {
    key: 'q-trabalho-horasextras',
    category: 'trabalho',
    type: 'pergunta',
    promptHint: 'Pergunte se o usuário sabe quando pode recusar hora extra. Cite CLT art. 59 de forma acessível. Incentive comentários com experiências pessoais.',
  },
  {
    key: 'q-consumidor-arrependimento',
    category: 'consumidor',
    type: 'pergunta',
    promptHint: 'Pergunte se o usuário conhece o direito de arrependimento de 7 dias em compras online. Cite CDC art. 49. Incentive quem já usou esse direito a comentar.',
  },
  {
    key: 'q-servico-calote',
    category: 'servico',
    type: 'pergunta',
    promptHint: 'Pergunte se o usuário já prestou um serviço e levou calote. Como se preveniu? Introduza a importância do contrato escrito com multa por inadimplência.',
  },
  {
    key: 'q-digital-termos-leu',
    category: 'digital',
    type: 'pergunta',
    promptHint: 'Pergunte honestamente: você lê os termos de uso antes de clicar em "Aceito"? Revele dados curiosos sobre o comprimento médio dos termos de uso dos apps mais populares.',
  },
  {
    key: 'q-compra-contrato-verbal',
    category: 'compra_venda',
    type: 'pergunta',
    promptHint: 'Pergunte se o usuário já fez um negócio de boca que deu errado. Lembre que contrato verbal é válido mas difícil de provar. Incentive comentários sobre experiências.',
  },
  {
    key: 'q-aluguel-cauca-devolvida',
    category: 'aluguel',
    type: 'pergunta',
    promptHint: 'Pergunte se o usuário já teve dificuldade para receber a caução de volta ao sair de um aluguel. Explique o prazo legal de devolução (30 dias) e como se proteger.',
  },
  {
    key: 'q-trabalho-pj-pressao',
    category: 'trabalho',
    type: 'pergunta',
    promptHint: 'Pergunte se o usuário já foi pressionado pelo empregador a abrir CNPJ para trabalhar como PJ em vez de CLT. Explique os riscos da pejotização ilegal.',
  },
  {
    key: 'q-geral-assinou-sem-ler',
    category: 'geral',
    type: 'pergunta',
    promptHint: 'Pergunte honestamente: qual foi o último contrato que você assinou sem ler direito? Crie identificação com o público e introduza por que vale a pena ler antes de assinar.',
  },
  {
    key: 'q-consumidor-cobranca-indevida',
    category: 'consumidor',
    type: 'pergunta',
    promptHint: 'Pergunte se o usuário já foi cobrado por algo que não pediu ou já pagou. Lembre que cobrança indevida exige devolução em dobro (CDC art. 42, parágrafo único).',
  },
  {
    key: 'q-aluguel-vistoria',
    category: 'aluguel',
    type: 'pergunta',
    promptHint: 'Pergunte se o usuário já perdeu o depósito de aluguel por danos que não causou. Explique a importância da vistoria documentada de entrada e saída.',
  },
  {
    key: 'q-servico-orcamento',
    category: 'servico',
    type: 'pergunta',
    promptHint: 'Pergunte se o usuário sabe que orçamento aceito vira contrato e pode ser cobrado em juízo. Incentive comentários sobre experiências com orçamentos que não foram respeitados.',
  },
  {
    key: 'q-geral-multa-abusiva',
    category: 'geral',
    type: 'pergunta',
    promptHint: 'Pergunte ao público: qual a multa mais absurda que já viram em um contrato? Explique que multas desproporcionais podem ser revisadas judicialmente (CC art. 413).',
  },
  {
    key: 'q-consumidor-cancelamento',
    category: 'consumidor',
    type: 'pergunta',
    promptHint: 'Pergunte se o usuário já tentou cancelar um serviço e foi mal atendido ou cobrado multa abusiva. Cite os direitos do consumidor no cancelamento.',
  },
  {
    key: 'q-trabalho-ferias-negadas',
    category: 'trabalho',
    type: 'pergunta',
    promptHint: 'Pergunte se o usuário já teve férias negadas ou adiadas pelo empregador muitas vezes. Explique que férias vencidas precisam ser pagas em dobro (CLT art. 137).',
  },

  // === ESTATÍSTICAS — dados que impactam (Tarefa 4.2) ===
  {
    key: 's-contratos-nao-lidos',
    category: 'geral',
    type: 'estatistica',
    promptHint: 'Pesquisas do Procon e órgãos de defesa do consumidor apontam que a grande maioria dos consumidores assina contratos sem ler o documento completo. Construa um post de impacto sobre o risco disso — use linguagem como "a maioria" ou "a cada 10 brasileiros, 9".',
  },
  {
    key: 's-processos-trabalhistas',
    category: 'trabalho',
    type: 'estatistica',
    promptHint: 'CNJ e Tribunal Superior do Trabalho publicam que o Brasil é um dos países com maior volume de processos trabalhistas por ano, na casa de milhões. Use como gancho para falar de prevenção via contrato bem redigido.',
  },
  {
    key: 's-superendividamento-brasil',
    category: 'consumidor',
    type: 'estatistica',
    promptHint: 'Dados do Banco Central e PEIC/CNC indicam que dezenas de milhões de famílias brasileiras estão endividadas. Use como gancho para falar sobre contratos de crédito e como identificar cláusulas abusivas antes de assinar.',
  },
  {
    key: 's-aluguel-disputas',
    category: 'aluguel',
    type: 'estatistica',
    promptHint: 'Tribunais de Justiça registram grande volume de ações relacionadas a contratos de locação todo ano. Use como motivação para ler o contrato antes de assinar e entender os direitos de ambas as partes.',
  },
  {
    key: 's-pejotizacao-aumento',
    category: 'trabalho',
    type: 'estatistica',
    promptHint: 'IBGE e pesquisas de mercado de trabalho indicam crescimento expressivo no número de MEIs e PJs nos últimos anos. Parte significativa é pejotização. Use como gancho para falar sobre vínculo empregatício disfarçado.',
  },
  {
    key: 's-tempo-processo-judicial',
    category: 'geral',
    type: 'estatistica',
    promptHint: 'CNJ registra que processos cíveis levam em média vários anos para ser resolvidos no Brasil. Use como argumento para resolver conflitos contratuais antes de chegar à Justiça, com contratos bem redigidos.',
  },
  {
    key: 's-clientes-procon',
    category: 'consumidor',
    type: 'estatistica',
    promptHint: 'Procon registra anualmente centenas de milhares de reclamações de consumidores — telecomunicações, bancos e comércio eletrônico lideram. Use como gancho para falar sobre como contratos claros previnem disputas.',
  },
  {
    key: 's-fraude-digital-crescimento',
    category: 'digital',
    type: 'estatistica',
    promptHint: 'Febraban e relatórios de cibersegurança indicam crescimento expressivo de fraudes digitais e golpes online no Brasil ano a ano. Use como alerta para verificar contratos digitais com atenção.',
  },
  {
    key: 's-rescisao-contratual-prejuizo',
    category: 'servico',
    type: 'estatistica',
    promptHint: 'Estudos de mercado indicam que contratos de serviço mal redigidos geram prejuízos expressivos a prestadores e contratantes. Use como argumento para ter contrato escrito com cláusulas claras antes de começar qualquer serviço.',
  },
  {
    key: 's-analise-ia-economia',
    category: 'geral',
    type: 'estatistica',
    promptHint: 'Honorários médios de advogados para análise de contratos variam de centenas a milhares de reais dependendo da complexidade. Compare com o custo da análise automatizada e o valor gerado ao identificar cláusulas abusivas antes de assinar.',
  },

  // === CONDOMÍNIO ===
  {
    key: 'condominio-taxa-extra-abusiva',
    category: 'condominio',
    type: 'caso_real',
    promptHint: 'Caso real: síndico cobrou "taxa de obras emergenciais" de R$ 2.000 sem aprovação em assembleia. Ilegal: obras extraordinárias exigem quórum de 2/3 dos condôminos (Lei 4.591/64 art. 22 + CC art. 1.341). Tom: indignação comedida + como contestar.',
  },
  {
    key: 'condominio-multa-desproporcional',
    category: 'condominio',
    type: 'dica',
    promptHint: 'Multa por infração condominial: limite legal de 5 vezes o valor da cota condominial (CC art. 1.336, §2º). Convenção que prevê multas maiores está em desacordo com o Código Civil e pode ser contestada.',
  },
  {
    key: 'condominio-barulho-horario',
    category: 'condominio',
    type: 'mito_verdade',
    promptHint: 'Mito: barulho só é proibido após 22h. Verdade: depende do regulamento interno do condomínio. Em muitos casos obras são proibidas aos finais de semana e o horário pode ser mais restrito que a lei municipal. CC art. 1.336, IV.',
  },
  {
    key: 'condominio-inadimplente-restricoes',
    category: 'condominio',
    type: 'mito_verdade',
    promptHint: 'Mito: condômino inadimplente pode ser impedido de usar áreas comuns. Verdade: STJ pacificou que bloquear acesso à piscina, salão e academia é constrangedor e ilegal (REsp 1.699.022). O condomínio deve cobrar judicialmente.',
  },
  {
    key: 'condominio-obras-sem-aprovacao',
    category: 'condominio',
    type: 'checklist',
    promptHint: '3 tipos de obras e o que cada uma precisa: benfeitorias úteis = quórum 50%+1 em assembleia; benfeitorias voluptuárias = 2/3 dos condôminos; reparações urgentes = síndico age sem consultar. CC art. 1.341.',
  },
  {
    key: 'condominio-animal-proibicao',
    category: 'condominio',
    type: 'mito_verdade',
    promptHint: 'Mito: condomínio pode proibir qualquer animal. Verdade: STJ e STF pacificaram que proibição genérica de animais domésticos é abusiva. O condomínio só pode restringir se houver perturbação real comprovada (RE 1.110.8078/DF).',
  },
  {
    key: 'condominio-locacao-airbnb',
    category: 'condominio',
    type: 'dica',
    promptHint: 'Locar unidade pelo Airbnb em condomínio: sem previsão proibitória na convenção, STJ entende que é permitido (REsp 1.819.075/RS). A convenção pode proibir, mas precisa de quórum de aprovação de 2/3. Locações ocasionais ≠ hospedagem comercial.',
  },
  {
    key: 'condominio-fundo-reserva',
    category: 'condominio',
    type: 'dica',
    promptHint: 'Fundo de reserva condominial: obrigatório por lei, mínimo de 5% do orçamento (convenções podem prever mais). Não pode ser usado para despesas ordinárias — só emergências. Pedir prestação de contas anual é direito do condômino. Lei 4.591/64 art. 9º.',
  },
  {
    key: 'condominio-assembleia-convocacao',
    category: 'condominio',
    type: 'checklist',
    promptHint: 'Checklist da assembleia condominial válida: convocação por escrito com 10 dias de antecedência mínima, pauta pré-definida, local acessível, livro de atas lavrado e assinado. Assembleia irregular pode ser anulada judicialmente. CC art. 1.354.',
  },
  {
    key: 'condominio-taxa-rateio',
    category: 'condominio',
    type: 'pergunta',
    promptHint: 'Você sabe como é calculada a sua cota de condomínio? Pergunte ao público se já questionou o rateio. Explique: pode ser por fração ideal (área da unidade) ou de outra forma prevista na convenção — e isso faz diferença no bolso.',
  },
  {
    key: 'condominio-caso-real-entulho',
    category: 'condominio',
    type: 'caso_real',
    promptHint: 'Caso real: condômino jogou entulho de obra no corredor sem comunicar o síndico. Outros condôminos foram cobrados no rateio do custo de remoção. Ilegal: quem causa o dano responde sozinho. CC art. 186 + 927. Tom: injustiça cotidiana muito conhecida.',
  },

  // === CASO REAL — novos ===
  {
    key: 'caso-real-trabalho-horas',
    category: 'trabalho',
    type: 'caso_real',
    promptHint: 'Caso real: empregado trabalhou 12h/dia durante 2 anos, contrato dizia "banco de horas". Empresa jamais compensou. Condenada a pagar todas as horas como extra (50% adicional). CLT art. 59 §2º + Súmula 291 do TST. Tom: "acharam que você não ia cobrar".',
  },
  {
    key: 'caso-real-servico-fotografo',
    category: 'servico',
    type: 'caso_real',
    promptHint: 'Caso real: fotógrafo sumiu no dia do casamento após receber 100% do pagamento antecipado. Sem contrato com cláusula de multa. Noiva perdeu R$ 4.500 e as fotos do casamento. CC arts. 389-391. Tom: prevenção + o que o contrato correto deveria ter.',
  },
  {
    key: 'caso-real-digital-subs-automatica',
    category: 'digital',
    type: 'caso_real',
    promptHint: 'Caso real: consumidor cancelou assinatura pelo app, mas cobrança continuou por mais 3 meses. Empresa alegou que o cancelamento não foi "concluído". CDC art. 49 parágrafo único: cancelamento DEVE ser pelo MESMO canal da contratação. Cobrança indevida devolve em dobro (CDC art. 42). Tom: cilada clássica.',
  },
  {
    key: 'caso-real-consumidor-garantia-negada',
    category: 'consumidor',
    type: 'caso_real',
    promptHint: 'Caso real: loja negou garantia de geladeira porque consumidor não guardou nota fiscal. Absurdo: garantia legal de 90 dias independe de nota fiscal (CDC art. 26). Nota fiscal é direito do consumidor, não condição para garantia. Tom: armadilha que muita gente cai.',
  },
  {
    key: 'caso-real-geral-clausula-impressa',
    category: 'geral',
    type: 'caso_real',
    promptHint: 'Caso real: contrato com 40 páginas, cláusula de renúncia total a indenizações em fonte minúscula no final. STJ: cláusulas abusivas em contratos de adesão são NULAS mesmo que assinadas (CDC art. 54 §4º). Tom: "letra miúda que ninguém lê mas todos assinam".',
  },
  {
    key: 'caso-real-aluguel-despejo-ilegal',
    category: 'aluguel',
    type: 'caso_real',
    promptHint: 'Caso real: proprietário cortou água e trocou a fechadura do apartamento porque o inquilino atrasou 1 mês de aluguel. Crime: turbação de posse (CC art. 1.210) + estelionato por execução de autotutela. Tom: "locador achou que podia fazer justiça pelas próprias mãos".',
  },
  {
    key: 'caso-real-trabalho-pejotizacao-condenada',
    category: 'trabalho',
    type: 'caso_real',
    promptHint: 'Caso real: empresa de TI contratou 50 desenvolvedores como PJ, todos com horário fixo 9-18h, exclusividade e chefe direto. Ação coletiva na Justiça do Trabalho condenou empresa a pagar FGTS + férias + 13º de todos. CLT arts. 2-3. Tom: "pejotização tem custo alto pra empresa".',
  },
  {
    key: 'caso-real-compra-imovel-irregular',
    category: 'compra_venda',
    type: 'caso_real',
    promptHint: 'Caso real: família comprou imóvel via contrato particular, vendedor morreu sem registrar em cartório. Herdeiros do vendedor entraram na Justiça e ficaram com o imóvel. CC art. 1.245: sem registro em cartório, não é seu. Tom: dramático + alerta urgente.',
  },
  {
    key: 'caso-real-condominio-obra-nao-aprovada',
    category: 'condominio',
    type: 'caso_real',
    promptHint: 'Caso real: síndico aprovou sozinho uma reforma na fachada do prédio de R$ 80.000 sem convocar assembleia. Condôminos recorreram ao Judiciário, obra foi embargada, síndico destituído e obrigado a ressarcir. CC art. 1.348 + Lei 4.591/64. Tom: poder do síndico tem limite.',
  },
  {
    key: 'caso-real-geral-multa-quebrada',
    category: 'geral',
    type: 'caso_real',
    promptHint: 'Caso real: contrato de academia com multa rescisória de R$ 2.400 (12 meses x mensalidade). Consumidor cancelou por ter se mudado de cidade. Juiz reduziu multa a zero: caso fortuito + proporcionalidade (CC art. 413 + CDC art. 51). Tom: multa abusiva cai na Justiça.',
  },

  // === ANTES/DEPOIS ===
  {
    key: 'ad-aluguel-multa-rescisao',
    category: 'aluguel',
    type: 'antes_depois',
    promptHint: 'Antes: "Em caso de rescisão pelo locatário, será devida multa equivalente a 3 meses de aluguel integralmente, independentemente do tempo de permanência." Depois: corrigir para multa proporcional ao tempo restante do contrato (Lei 8.245/91 art. 4º). Explicar por que a cláusula original é nula.',
  },
  {
    key: 'ad-trabalho-banco-horas',
    category: 'trabalho',
    type: 'antes_depois',
    promptHint: 'Antes: "As horas extras realizadas serão compensadas em banco de horas sem prazo definido para compensação." Depois: corrigir para prazo máximo de 6 meses (acordo individual) ou 1 ano (acordo coletivo), com conversão automática em pagamento se não compensado (CLT art. 59 §2º).',
  },
  {
    key: 'ad-servico-responsabilidade-zero',
    category: 'servico',
    type: 'antes_depois',
    promptHint: 'Antes: "O CONTRATADO não se responsabiliza por quaisquer danos, diretos, indiretos, lucros cessantes ou consequenciais decorrentes da prestação dos serviços." Depois: versão válida que admite responsabilidade por negligência e dolo, com limitação proporcional ao valor do contrato (CC art. 422 + CDC art. 51, I).',
  },
  {
    key: 'ad-consumidor-foro-abusivo',
    category: 'consumidor',
    type: 'antes_depois',
    promptHint: 'Antes: "Fica eleito o foro da Comarca de São Paulo, SP, para dirimir quaisquer controvérsias, renunciando as partes a qualquer outro." Depois: versão que mantém o foro do fornecedor mas ressalva o direito do consumidor de ajuizar no seu domicílio (CDC art. 101, I). Explicar que a cláusula original é NULA em relações de consumo.',
  },
  {
    key: 'ad-digital-renovacao-automatica',
    category: 'digital',
    type: 'antes_depois',
    promptHint: 'Antes: "O contrato se renova automaticamente por igual período, salvo cancelamento com 90 dias de antecedência por escrito via cartório." Depois: versão com notificação simples por email, prazo de cancelamento de 30 dias e direito de arrependimento de 7 dias após cada renovação (CDC art. 49 + Lei 14.181/2021).',
  },
  {
    key: 'ad-condominio-taxa-extra',
    category: 'condominio',
    type: 'antes_depois',
    promptHint: 'Antes: "O síndico fica autorizado a aprovar obras e despesas extraordinárias de até R$ 50.000 sem aprovação em assembleia." Depois: versão com limite razoável para emergências reais (ex: R$ 3.000) e exigência de assembleia para qualquer obra de melhoria (CC art. 1.341 + Lei 4.591/64 art. 22).',
  },
  {
    key: 'ad-geral-multa-abusiva',
    category: 'geral',
    type: 'antes_depois',
    promptHint: 'Antes: "O descumprimento de qualquer obrigação contratual sujeitará a parte inadimplente ao pagamento de multa equivalente a 200% do valor total do contrato." Depois: versão com multa proporcional ao dano real, dentro do limite legal de moderação pelo juiz (CC arts. 412-413). Explicar que multa desproporcional é revisável.',
  },

  // === CASO REAL — cláusulas absurdas comentadas ===
  {
    key: 'caso-real-multa-100pct',
    category: 'aluguel',
    type: 'caso_real',
    promptHint: 'Cláusula real encontrada: "O locatário pagará multa equivalente a 100% do valor total do contrato em caso de rescisão antecipada". Comentar com sarcasmo: isso é absurdo e ilegal. A Lei 8.245/91 art. 4º exige multa PROPORCIONAL ao tempo restante. Tom de choque/indignação saudável.',
  },
  {
    key: 'caso-real-pj-pejotizacao',
    category: 'trabalho',
    type: 'caso_real',
    promptHint: 'Caso real: contrato PJ com jornada fixa 9-18h, chefe direto, exclusividade, férias não remuneradas. Comentar: isso é pejotização clássica e é RECLAMAÇÃO TRABALHISTA certa. CLT arts. 2º e 3º. Vínculo empregatício disfarçado.',
  },
  {
    key: 'caso-real-foro-abusivo',
    category: 'consumidor',
    type: 'caso_real',
    promptHint: 'Cláusula real: contrato de consumo eleger foro em cidade 2000 km distante do consumidor. Isso é NULO (CDC art. 51, IV). Consumidor ajuíza no próprio domicílio (CDC art. 101, I). Tom: "acham que você não vai contestar".',
  },
  {
    key: 'caso-real-reserva-dominio',
    category: 'compra_venda',
    type: 'caso_real',
    promptHint: 'Caso real: vendedor cobrou multa de 30% + reteve 100% dos valores pagos em compra de veículo parcelado. Comentar: retenção integral é abusiva (CDC art. 53). Com reserva de domínio válida, só pode reter o uso do bem + valor razoável pelo depreciação. CC arts. 521-528.',
  },
  {
    key: 'caso-real-assinatura-perpetua',
    category: 'digital',
    type: 'caso_real',
    promptHint: 'Cláusula real de app de streaming: "renovação automática por 12 meses sem opção de cancelamento online". CDC art. 51 + Lei 14.181/2021 (superendividamento). Cancelamento deve ser pelo MESMO canal da contratação (CDC art. 49 par. único). Tom: indignação comedida.',
  },
  {
    key: 'caso-real-limitacao-total',
    category: 'servico',
    type: 'caso_real',
    promptHint: 'Cláusula real: "a responsabilidade do prestador fica limitada ao valor da mensalidade, excluindo danos diretos, indiretos e lucros cessantes". NULA. Limitar responsabilidade por negligência grave viola CDC art. 51, I + CC art. 422 (boa-fé). Tom: "isso é comum e poucos sabem que é nulo".',
  },
];

/**
 * Escolhe o próximo tema com calendário editorial inteligente.
 *
 * Cascata de prioridade:
 * 0. Data especial brasileira (Dia do Trabalhador, Dia do Consumidor, etc.)
 * 1. Categoria + tipo do dia da semana, diferente de ontem em ambos
 * 2. Categoria + tipo do dia da semana, diferente apenas em categoria
 * 3. Categoria certa do dia, tipo diferente de ontem
 * 4. Tipo diferente + categoria diferente
 * 5. Categoria diferente (comportamento original)
 * 6. Qualquer disponível (fallback final)
 */
export function pickNextTopic(
  postedKeys: string[],
  lastCategory: string | null,
  lastType: string | null = null
): TopicTemplate {
  const available = TOPIC_BANK.filter((t) => !postedKeys.includes(t.key));

  // Se todos foram postados, usar banco completo (reset acontece antes de chamar esta função)
  const pool = available.length > 0 ? available : [...TOPIC_BANK];

  // Prioridade 0: data especial brasileira
  const todayMD = new Date().toISOString().slice(5, 10); // "MM-DD"
  const special = SPECIAL_DATES[todayMD];
  if (special) {
    const match = pool.find((t) => t.category === special.category && t.type === special.type);
    if (match) return match;
  }

  // Categoria e tipo preferidos para hoje
  const dow = new Date().getDay();
  const preferred = DAY_OF_WEEK_CALENDAR[dow];

  // Prioridade 1: categoria + tipo certos, diferente de ontem em ambos
  const p1 = pool.find((t) =>
    t.category === preferred.category &&
    t.type === preferred.type &&
    t.category !== lastCategory &&
    t.type !== lastType
  );
  if (p1) return p1;

  // Prioridade 2: categoria + tipo certos, apenas categoria diferente de ontem
  const p2 = pool.find((t) =>
    t.category === preferred.category &&
    t.type === preferred.type &&
    t.category !== lastCategory
  );
  if (p2) return p2;

  // Prioridade 3: categoria certa + tipo diferente de ontem
  const p3 = pool.find((t) =>
    t.category === preferred.category &&
    t.type !== lastType
  );
  if (p3) return p3;

  // Prioridade 4: tipo diferente + categoria diferente
  const p4 = pool.find((t) =>
    t.type !== lastType &&
    t.category !== lastCategory
  );
  if (p4) return p4;

  // Prioridade 5: apenas categoria diferente
  const p5 = pool.find((t) => t.category !== lastCategory);
  if (p5) return p5;

  return pool[0];
}

/**
 * Posts de fallback caso o Claude falhe.
 */
export const FALLBACK_POSTS = [
  {
    text: 'Você sabia que cláusulas abusivas em contratos são NULAS de pleno direito? 🤔\n\nO Código de Defesa do Consumidor (art. 51) protege você — mesmo que você já tenha assinado.\n\nExemplos de cláusulas abusivas: multa acima de 2%, renúncia total a direitos, foro em outra cidade.\n\nJá se deparou com alguma dessas? Conta aqui 👇\n\n🛡️ Analise seu contrato GRÁTIS: https://contrato-seguro-inky.vercel.app\n\n⚖️ Conteúdo informativo. Não substitui orientação jurídica profissional.',
    hashtags: ['#contratos', '#direitodoconsumidor', '#clausulaabusiva', '#direitoslegais'],
    imageHeadline: 'Cláusulas abusivas são NULAS',
  },
  {
    text: '90% das pessoas assinam contratos sem ler o que está escrito. Você faz isso? 📝\n\nAntes de assinar, verifique:\n✅ Multa rescisória proporcional\n✅ Índice de reajuste definido\n✅ Prazo e condições claras\n✅ Responsabilidades bem definidas\n✅ Foro competente na sua cidade\n\nQual desses itens você costuma verificar? Comenta! 👇\n\n🛡️ Analise seu contrato GRÁTIS: https://contrato-seguro-inky.vercel.app\n\n⚖️ Conteúdo informativo. Não substitui orientação jurídica profissional.',
    hashtags: ['#contratos', '#dicasjuridicas', '#protejaseusdireitos', '#contratoseguro'],
    imageHeadline: 'Checklist antes de assinar',
  },
  {
    text: 'Vai alugar um imóvel? Cuidado com o que está — e o que NÃO está — no contrato. 🏠\n\nMuitos inquilinos descobrem armadilhas só depois de assinar:\n→ Quem paga IPTU e condomínio (não é sempre o inquilino!)\n→ Multa rescisória: deve ser proporcional ao tempo restante\n→ Vistoria: sem laudo, qualquer dano pode ser cobrado de você\n\nJá caiu em alguma dessas armadilhas? 👇\n\n🛡️ Analise seu contrato GRÁTIS: https://contrato-seguro-inky.vercel.app\n\n⚖️ Conteúdo informativo. Não substitui orientação jurídica profissional.',
    hashtags: ['#aluguel', '#contratodealuguel', '#inquilino', '#direitoimobiliario'],
    imageHeadline: 'Cuidados no contrato de aluguel',
  },
];
