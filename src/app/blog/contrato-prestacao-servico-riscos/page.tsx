import type { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app';

export const metadata: Metadata = {
  title: 'Contrato de Prestação de Serviço: Riscos e Como Se Proteger',
  description:
    'Conheça os principais riscos em contratos de prestação de serviço e saiba como redigir ou revisar um contrato seguro, com base no Código Civil brasileiro.',
  keywords: [
    'contrato prestação de serviço riscos',
    'contrato de prestação de serviço',
    'riscos contrato de serviço',
    'cláusulas contrato prestação serviço',
    'modelo contrato prestação de serviço',
    'contrato PJ riscos',
    'pejotização contrato',
  ],
  openGraph: {
    title: 'Contrato de Prestação de Serviço: Riscos e Como Se Proteger',
    description:
      'Guia completo sobre riscos em contratos de prestação de serviço e como se proteger com base no Código Civil.',
    url: `${BASE_URL}/blog/contrato-prestacao-servico-riscos`,
    type: 'article',
    locale: 'pt_BR',
    siteName: 'ContratoSeguro',
    publishedTime: '2026-04-06T12:00:00Z',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contrato de Prestação de Serviço: Riscos e Como Se Proteger',
    description: 'Os principais riscos em contratos de prestação de serviço e como evitá-los.',
  },
  alternates: {
    canonical: `${BASE_URL}/blog/contrato-prestacao-servico-riscos`,
  },
};

function ArticleJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Contrato de Prestação de Serviço: Riscos e Como Se Proteger',
    description:
      'Guia completo sobre riscos em contratos de prestação de serviço, com base no Código Civil brasileiro.',
    author: { '@type': 'Organization', name: 'ContratoSeguro', url: BASE_URL },
    publisher: { '@type': 'Organization', name: 'ContratoSeguro', url: BASE_URL },
    datePublished: '2026-04-06',
    dateModified: '2026-04-06',
    mainEntityOfPage: `${BASE_URL}/blog/contrato-prestacao-servico-riscos`,
    inLanguage: 'pt-BR',
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default function ContratoPrestacaoServicoRiscosPage() {
  return (
    <>
      <ArticleJsonLd />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Link href="/blog" className="text-sm text-brand-600 hover:underline">
              Blog
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500">Serviços</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
            Contrato de Prestação de Serviço: Riscos e Como Se Proteger
          </h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <time dateTime="2026-04-06">6 de abril de 2026</time>
            <span>8 min de leitura</span>
          </div>
        </header>

        <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-brand-600">
          <p className="text-lg leading-relaxed text-gray-700">
            O contrato de prestação de serviço é um dos instrumentos mais utilizados nas relações
            comerciais e profissionais no Brasil. Regulado pelos artigos 593 a 609 do Código
            Civil (Lei 10.406/2002), ele estabelece as condições sob as quais uma parte (o
            prestador) se compromete a realizar um serviço para outra (o tomador), mediante
            remuneração. Apesar de sua aparente simplicidade, esses contratos escondem riscos
            significativos para ambas as partes quando mal redigidos ou incompletos.
          </p>

          <h2 className="mt-10 text-2xl font-bold">
            Características do contrato de prestação de serviço
          </h2>
          <p className="text-gray-700">
            O contrato de prestação de serviço possui características que o distinguem de outras
            modalidades contratuais. É importante entendê-las para evitar confusões que podem
            gerar consequências jurídicas graves:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li>
              <strong>Autonomia do prestador:</strong> diferentemente do contrato de trabalho
              (CLT), o prestador tem autonomia para definir como o serviço será executado. Não há
              subordinação jurídica.
            </li>
            <li>
              <strong>Prazo máximo de 4 anos:</strong> o artigo 598 do Código Civil limita o
              contrato de prestação de serviço a 4 anos. Após esse prazo, o contrato extingue-se
              automaticamente, podendo ser renovado.
            </li>
            <li>
              <strong>Pessoalidade relativa:</strong> salvo disposição contrária, o prestador pode
              se fazer substituir por terceiro, ao contrário do contrato de trabalho, que exige
              pessoalidade.
            </li>
            <li>
              <strong>Remuneração:</strong> o pagamento pelo serviço é elemento essencial. Na
              falta de estipulação, aplica-se o costume do lugar (art. 596 do CC).
            </li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold">
            Principais riscos em contratos de prestação de serviço
          </h2>

          <h3 className="mt-6 text-xl font-semibold">
            1. Pejotização: o risco da relação de emprego disfarçada
          </h3>
          <p className="text-gray-700">
            O risco mais grave e frequente em contratos de prestação de serviço é a chamada
            &quot;pejotização&quot;: a contratação de uma pessoa jurídica (PJ) para realizar
            atividades que, na prática, configuram relação de emprego. A CLT, em seus artigos
            2o e 3o, define os elementos da relação de emprego: pessoalidade, subordinação,
            habitualidade e onerosidade.
          </p>
          <p className="text-gray-700">
            Quando o prestador PJ trabalha com horário fixo, recebe ordens diretas, não pode
            se fazer substituir e presta serviços de forma contínua e exclusiva, há forte
            indicativo de vínculo empregatício disfarçado. Nesse caso, a Justiça do Trabalho
            pode reconhecer a relação de emprego e condenar o tomador ao pagamento de todos os
            direitos trabalhistas retroativos: FGTS, 13o salário, férias, INSS e multas.
          </p>
          <p className="text-gray-700">
            O artigo 9o da CLT é claro: são nulos de pleno direito os atos praticados com o
            objetivo de desvirtuar, impedir ou fraudar a aplicação dos preceitos trabalhistas.
            A jurisprudência do TST tem sido rigorosa na identificação de fraudes.
          </p>

          <h3 className="mt-6 text-xl font-semibold">
            2. Escopo do serviço mal definido
          </h3>
          <p className="text-gray-700">
            Um dos problemas mais comuns é a definição vaga ou incompleta do escopo do serviço.
            Quando o contrato não especifica com precisão o que deve ser entregue, surgem
            conflitos sobre o que está incluído no preço e o que constitui serviço adicional.
          </p>
          <p className="text-gray-700">
            O ideal é que o contrato contenha uma descrição detalhada dos serviços, com
            entregas específicas (deliverables), prazos intermediários e critérios objetivos
            de aceitação. A falta dessas definições pode levar a disputas judiciais em que
            a interpretação do contrato será feita pelo juiz, muitas vezes de forma
            desfavorável para a parte que redigiu o instrumento (aplicação do artigo 423 do
            Código Civil, que determina a interpretação mais favorável ao aderente).
          </p>

          <h3 className="mt-6 text-xl font-semibold">
            3. Ausência de cláusula de rescisão
          </h3>
          <p className="text-gray-700">
            O artigo 602 do Código Civil prevê que o prestador pode ser despedido sem justa
            causa, mas terá direito à retribuição vencida e à metade da que lhe caberia até
            o final do contrato. A ausência de uma cláusula de rescisão bem definida pode
            gerar obrigações financeiras significativas para o tomador que precise encerrar o
            contrato antecipadamente.
          </p>
          <p className="text-gray-700">
            Por outro lado, o artigo 603 determina que, se o prestador se despedir sem justa
            causa, terá direito à retribuição vencida, mas responderá por perdas e danos. Um
            contrato bem redigido deve prever expressamente as condições de rescisão para ambas
            as partes, incluindo prazos de aviso prévio e eventuais multas compensatórias.
          </p>

          <h3 className="mt-6 text-xl font-semibold">
            4. Responsabilidade civil e seguros
          </h3>
          <p className="text-gray-700">
            Quem responde se o serviço prestado causar danos a terceiros? Se o contrato não
            tratar dessa questão, aplica-se a regra geral do Código Civil: aquele que causa
            dano a outrem é obrigado a repará-lo (art. 927). Mas a responsabilidade pode
            recair sobre o tomador quando houver culpa na escolha do prestador (culpa in
            eligendo) ou na fiscalização do serviço (culpa in vigilando).
          </p>
          <p className="text-gray-700">
            É fundamental que o contrato estabeleça claramente a divisão de responsabilidades,
            exija seguros quando aplicável e preveja cláusulas de indenização (hold harmless)
            para proteger ambas as partes.
          </p>

          <h3 className="mt-6 text-xl font-semibold">
            5. Propriedade intelectual
          </h3>
          <p className="text-gray-700">
            Em contratos de prestação de serviço que envolvam criação intelectual -- como
            desenvolvimento de software, design, redação, consultoria e projetos de engenharia
            -- a questão da propriedade intelectual é crucial. Quem detém os direitos sobre o
            trabalho produzido?
          </p>
          <p className="text-gray-700">
            A Lei de Direitos Autorais (Lei 9.610/1998) e a Lei de Propriedade Industrial
            (Lei 9.279/1996) estabelecem regras específicas. Em geral, se o contrato for
            omisso, os direitos patrimoniais sobre a obra pertencem ao autor (o prestador).
            Para que o tomador detenha os direitos, é necessária cessão expressa por escrito.
            A ausência dessa cláusula pode gerar disputas onerosas.
          </p>

          <h3 className="mt-6 text-xl font-semibold">
            6. Confidencialidade e proteção de dados
          </h3>
          <p className="text-gray-700">
            Com a entrada em vigor da LGPD (Lei 13.709/2018), contratos de prestação de serviço
            que envolvam acesso a dados pessoais devem obrigatoriamente conter cláusulas sobre
            tratamento de dados, finalidade, segurança e responsabilidade. A ausência dessas
            cláusulas pode expor ambas as partes a sanções administrativas pela ANPD (Autoridade
            Nacional de Proteção de Dados), que incluem multas de até 2% do faturamento da
            empresa, limitadas a R$ 50 milhões por infração.
          </p>

          <h2 className="mt-10 text-2xl font-bold">
            Cláusulas essenciais em um contrato de prestação de serviço
          </h2>
          <p className="text-gray-700">
            Para minimizar riscos, um contrato de prestação de serviço deve conter, no mínimo:
          </p>
          <ol className="list-decimal space-y-2 pl-6 text-gray-700">
            <li>
              <strong>Identificação completa das partes:</strong> razão social, CNPJ/CPF,
              endereço e representantes legais.
            </li>
            <li>
              <strong>Objeto detalhado:</strong> descrição precisa dos serviços, entregas
              esperadas e critérios de qualidade.
            </li>
            <li>
              <strong>Prazo e cronograma:</strong> data de início, marcos intermediários e prazo
              final.
            </li>
            <li>
              <strong>Remuneração e forma de pagamento:</strong> valor, parcelas, condições de
              reajuste e penalidades por atraso.
            </li>
            <li>
              <strong>Obrigações de cada parte:</strong> o que o tomador deve fornecer (acesso,
              informações, materiais) e o que o prestador deve entregar.
            </li>
            <li>
              <strong>Cláusula de rescisão:</strong> condições para encerramento antecipado, aviso
              prévio e consequências financeiras.
            </li>
            <li>
              <strong>Propriedade intelectual:</strong> quem detém os direitos sobre o trabalho
              produzido.
            </li>
            <li>
              <strong>Confidencialidade:</strong> proteção de informações sensíveis trocadas
              durante a prestação.
            </li>
            <li>
              <strong>Tratamento de dados pessoais (LGPD):</strong> se aplicável, definir papéis
              de controlador e operador.
            </li>
            <li>
              <strong>Foro e resolução de conflitos:</strong> eleição de foro competente ou
              cláusula arbitral.
            </li>
          </ol>

          <h2 className="mt-10 text-2xl font-bold">
            Diferença entre prestação de serviço e empreitada
          </h2>
          <p className="text-gray-700">
            É comum confundir o contrato de prestação de serviço com o contrato de empreitada
            (arts. 610 a 626 do CC). A diferença fundamental está no objeto: na prestação de
            serviço, remunera-se a atividade (o trabalho em si); na empreitada, remunera-se o
            resultado (a obra concluída).
          </p>
          <p className="text-gray-700">
            A classificação correta é importante porque as regras de responsabilidade diferem.
            Na empreitada de materiais, por exemplo, o empreiteiro responde pelos riscos até a
            entrega da obra (art. 611 do CC). Já na empreitada de lavor, os riscos correm por
            conta do dono da obra. Classificar erroneamente o contrato pode gerar obrigações
            inesperadas.
          </p>

          <h2 className="mt-10 text-2xl font-bold">
            O que fazer para se proteger
          </h2>
          <p className="text-gray-700">
            Tanto prestadores quanto tomadores de serviço devem adotar boas práticas para
            minimizar riscos contratuais:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li>
              Nunca inicie a prestação de serviço sem contrato assinado. Acordos verbais são
              válidos juridicamente, mas extremamente difíceis de provar.
            </li>
            <li>
              Revise o contrato com atenção antes de assinar. Se possível, consulte um advogado
              ou utilize ferramentas de análise contratual.
            </li>
            <li>
              Documente todas as comunicações e alterações de escopo por escrito (e-mails ou
              aditivos contratuais).
            </li>
            <li>
              Se você é tomador, evite elementos que caracterizem vínculo empregatício:
              subordinação direta, controle de horário e exclusividade.
            </li>
            <li>
              Se você é prestador PJ, mantenha autonomia real: tenha outros clientes, defina
              seus horários e emita notas fiscais.
            </li>
            <li>
              Inclua sempre uma cláusula de limitação de responsabilidade, respeitando os limites
              legais.
            </li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold">Conclusão</h2>
          <p className="text-gray-700">
            O contrato de prestação de serviço, quando bem elaborado, protege ambas as partes
            e previne conflitos. Quando mal redigido ou inexistente, pode gerar prejuízos
            financeiros expressivos, reconhecimento de vínculo empregatício e responsabilização
            por danos. Investir tempo na análise e revisão do contrato antes de assiná-lo não
            é um custo -- é uma proteção. Ferramentas de análise contratual com inteligência
            artificial podem ser um primeiro passo eficiente para identificar riscos e lacunas
            antes de consultar um profissional.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-brand-200 bg-brand-50 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900">
            Tem um contrato de prestação de serviço para revisar?
          </h2>
          <p className="mt-2 text-gray-600">
            Faça upload e descubra em minutos se há riscos ou cláusulas problemáticas. Análise
            gratuita com inteligência artificial.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Analisar meu contrato de serviço
          </Link>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-400">
            Este artigo tem caráter informativo e educacional. Não constitui aconselhamento
            jurídico. Para situações específicas, consulte um advogado especializado em direito
            civil ou empresarial.
          </p>
        </div>
      </article>
    </>
  );
}
