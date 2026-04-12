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
