import type { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app';

export const metadata: Metadata = {
  title: 'Direitos do Consumidor em Contratos: O Que Você Precisa Saber',
  description:
    'Entenda como o Código de Defesa do Consumidor (CDC) protege você em contratos de adesão, compras online, financiamentos e serviços. Guia prático com exemplos reais.',
  keywords: [
    'direitos do consumidor contratos',
    'código de defesa do consumidor',
    'contrato de adesão abusivo',
    'cláusulas abusivas CDC',
    'direitos do consumidor compras online',
    'contrato abusivo o que fazer',
    'proteção do consumidor contratos',
  ],
  openGraph: {
    title: 'Direitos do Consumidor em Contratos: O Que Você Precisa Saber',
    description:
      'Guia completo sobre como o CDC protege o consumidor em contratos de adesão, compras e serviços.',
    url: `${BASE_URL}/blog/direitos-consumidor-contratos`,
    type: 'article',
    locale: 'pt_BR',
    siteName: 'ContratoSeguro',
    publishedTime: '2026-04-06T12:00:00Z',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Direitos do Consumidor em Contratos',
    description: 'Como o CDC protege você em contratos. Guia prático com exemplos.',
  },
  alternates: {
    canonical: `${BASE_URL}/blog/direitos-consumidor-contratos`,
  },
};

function ArticleJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Direitos do Consumidor em Contratos: O Que Você Precisa Saber',
    description:
      'Guia completo sobre os direitos do consumidor em contratos, com base no Código de Defesa do Consumidor.',
    author: { '@type': 'Organization', name: 'ContratoSeguro', url: BASE_URL },
    publisher: { '@type': 'Organization', name: 'ContratoSeguro', url: BASE_URL },
    datePublished: '2026-04-06',
    dateModified: '2026-04-06',
    mainEntityOfPage: `${BASE_URL}/blog/direitos-consumidor-contratos`,
    inLanguage: 'pt-BR',
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default function DireitosConsumidorContratosPage() {
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
            <span className="text-sm text-gray-500">Consumidor</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
            Direitos do Consumidor em Contratos: O Que Você Precisa Saber
          </h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <time dateTime="2026-04-06">6 de abril de 2026</time>
            <span>9 min de leitura</span>
          </div>
        </header>

        <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-brand-600">
          <p className="text-lg leading-relaxed text-gray-700">
            O Código de Defesa do Consumidor (Lei 8.078/1990) é uma das legislações mais avançadas
            do mundo em proteção ao consumidor. Ele estabelece um conjunto robusto de garantias
            para quem adquire produtos ou contrata serviços, especialmente em situações de
            desequilíbrio contratual. Entender esses direitos é essencial para não ser prejudicado
            por cláusulas abusivas que, infelizmente, ainda são comuns em contratos de adesão no
            Brasil.
          </p>

          <h2 className="mt-10 text-2xl font-bold">
            O que é um contrato de adesão?
          </h2>
          <p className="text-gray-700">
            O artigo 54 do CDC define contrato de adesão como aquele cujas cláusulas foram
            estabelecidas unilateralmente pelo fornecedor, sem que o consumidor possa discutir
            ou modificar substancialmente seu conteúdo. São exemplos comuns: contratos de telefonia,
            internet, planos de saúde, cartões de crédito, seguros, academias, estacionamentos e
            serviços de streaming.
          </p>
          <p className="text-gray-700">
            A principal característica do contrato de adesão é que o consumidor tem apenas duas
            opções: aceitar integralmente ou recusar. Justamente por essa assimetria, a lei
            impõe proteções especiais. O par. 3o do artigo 54 determina que os contratos de
            adesão devem ser redigidos em termos claros e com caracteres ostensivos e legíveis,
            com tamanho de fonte não inferior ao corpo 12.
          </p>

          <h2 className="mt-10 text-2xl font-bold">
            Cláusulas abusivas segundo o CDC
          </h2>
          <p className="text-gray-700">
            O artigo 51 do CDC lista as cláusulas consideradas nulas de pleno direito em contratos
            de consumo. Essas cláusulas são automaticamente inválidas, independentemente de
            decisão judicial. As principais incluem:
          </p>

          <h3 className="mt-6 text-xl font-semibold">
            1. Cláusulas que impossibilitem, exonerem ou atenuem a responsabilidade do fornecedor
          </h3>
          <p className="text-gray-700">
            O artigo 51, inciso I, do CDC proíbe cláusulas que isentem o fornecedor de
            responsabilidade por defeitos nos produtos ou na prestação de serviços. Uma cláusula
            que diga, por exemplo, &quot;a empresa não se responsabiliza por danos causados pelo
            produto&quot; é nula. A responsabilidade do fornecedor pelos vícios e defeitos é
            objetiva (arts. 12 a 14 do CDC), ou seja, independe de culpa.
          </p>

          <h3 className="mt-6 text-xl font-semibold">
            2. Cláusulas que imponham representante para concluir negócio pelo consumidor
          </h3>
          <p className="text-gray-700">
            O inciso VIII do artigo 51 veda cláusulas que obriguem o consumidor a nomear um
            representante imposto pelo fornecedor para concluir ou realizar atos em seu nome.
            Isso inclui procurações em branco ou mandatos irrevogáveis embutidos em contratos.
          </p>

          <h3 className="mt-6 text-xl font-semibold">
            3. Inversão do ônus da prova em prejuízo do consumidor
          </h3>
          <p className="text-gray-700">
            O inciso VI proíbe cláusulas que invertam o ônus da prova em desfavor do consumidor.
            Pelo contrário, o artigo 6o, VIII, do CDC prevê a inversão do ônus da prova a favor
            do consumidor como direito básico, quando o juiz considerar verossímil a alegação ou
            quando o consumidor for hipossuficiente.
          </p>

          <h3 className="mt-6 text-xl font-semibold">
            4. Obrigação de arbitragem compulsória
          </h3>
          <p className="text-gray-700">
            O inciso VII proíbe cláusulas que determinem a utilização compulsória de arbitragem.
            Embora a arbitragem seja um meio válido de resolução de conflitos (Lei 9.307/1996),
            ela não pode ser imposta ao consumidor em contrato de adesão. O consumidor sempre
            conserva o direito de acessar o Poder Judiciário.
          </p>

          <h3 className="mt-6 text-xl font-semibold">
            5. Multas desproporcionais
          </h3>
          <p className="text-gray-700">
            O par. 2o do artigo 52 do CDC limita a multa de mora em contratos de consumo a 2%
            do valor da prestação. Multas superiores a esse percentual são automaticamente
            reduzidas ao limite legal. Já a cláusula penal compensatória (por inadimplemento
            total) deve respeitar os princípios da proporcionalidade e boa-fé, conforme o
            artigo 413 do Código Civil.
          </p>

          <h2 className="mt-10 text-2xl font-bold">
            Direito de arrependimento
          </h2>
          <p className="text-gray-700">
            Um dos direitos mais importantes do consumidor é o direito de arrependimento, previsto
            no artigo 49 do CDC. Toda compra realizada fora do estabelecimento comercial --
            incluindo compras pela internet, telefone ou catálogo -- pode ser cancelada em até
            7 dias corridos a contar do recebimento do produto ou da contratação do serviço.
          </p>
          <p className="text-gray-700">
            Esse direito é incondicional: o consumidor não precisa justificar o motivo do
            arrependimento. Os valores pagos devem ser devolvidos integralmente, incluindo o
            frete. Qualquer cláusula contratual que tente limitar ou eliminar o direito de
            arrependimento em compras realizadas fora do estabelecimento é nula.
          </p>
          <p className="text-gray-700">
            Vale destacar que o direito de arrependimento não se aplica a compras feitas
            presencialmente em lojas físicas. Nesses casos, a troca ou devolução depende da
            política do estabelecimento, salvo em caso de vício do produto (art. 18 do CDC).
          </p>

          <h2 className="mt-10 text-2xl font-bold">
            Vícios e defeitos: garantia legal
          </h2>
          <p className="text-gray-700">
            O CDC estabelece prazos de garantia legal que existem independentemente de qualquer
            menção no contrato:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li>
              <strong>30 dias</strong> para reclamar de vícios aparentes em produtos e serviços
              não duráveis (art. 26, I).
            </li>
            <li>
              <strong>90 dias</strong> para vícios aparentes em produtos e serviços duráveis
              (art. 26, II).
            </li>
          </ul>
          <p className="text-gray-700">
            A garantia contratual é complementar à legal (art. 50). Portanto, se um fabricante
            oferece 1 ano de garantia, os 90 dias legais somam-se a esse período. Cláusulas que
            tentem substituir a garantia legal pela contratual, ou que limitem a garantia legal
            a períodos inferiores, são nulas.
          </p>

          <h2 className="mt-10 text-2xl font-bold">
            Contratos de financiamento e empréstimo
          </h2>
          <p className="text-gray-700">
            O artigo 52 do CDC estabelece que, nos contratos de financiamento, o fornecedor deve
            informar prévia e adequadamente sobre: o preço do produto em moeda corrente, o
            montante dos juros de mora e a taxa efetiva anual de juros, os acréscimos legalmente
            previstos, o número e periodicidade das prestações e a soma total a pagar.
          </p>
          <p className="text-gray-700">
            A falta de clareza nessas informações pode ensejar a revisão judicial do contrato.
            O STJ tem entendimento consolidado de que a cobrança de juros sobre juros
            (anatocismo) é vedada em operações não bancárias, e que instituições financeiras
            devem observar transparência na composição dos encargos (Súmula 541 do STJ).
          </p>
          <p className="text-gray-700">
            Além disso, o par. 1o do artigo 52 garante ao consumidor o direito de liquidação
            antecipada do débito, com redução proporcional dos juros e demais acréscimos.
            Cláusulas que impeçam ou dificultem o pagamento antecipado são nulas.
          </p>

          <h2 className="mt-10 text-2xl font-bold">
            Contratos de serviços essenciais
          </h2>
          <p className="text-gray-700">
            Os contratos de serviços essenciais -- como telefonia, energia elétrica, água,
            internet e planos de saúde -- recebem proteção especial do CDC. O artigo 22
            determina que os órgãos públicos e concessionários devem fornecer serviços adequados,
            eficientes, seguros e, quando essenciais, contínuos.
          </p>
          <p className="text-gray-700">
            No caso de planos de saúde, a Lei 9.656/1998 complementa o CDC. Cláusulas que limitem
            o tempo de internação (a chamada &quot;cláusula de limitação de prazo de
            internação&quot;) foram declaradas abusivas pela Súmula 302 do STJ.
          </p>

          <h2 className="mt-10 text-2xl font-bold">
            Como agir diante de cláusulas abusivas
          </h2>
          <ol className="list-decimal space-y-3 pl-6 text-gray-700">
            <li>
              <strong>Identifique a cláusula:</strong> leia o contrato com atenção e marque os
              trechos que pareçam desvantajosos ou contrários ao que foi combinado verbalmente.
            </li>
            <li>
              <strong>Documente tudo:</strong> guarde cópias do contrato, publicidades,
              e-mails e qualquer comunicação com o fornecedor.
            </li>
            <li>
              <strong>Reclame formalmente:</strong> entre em contato com o SAC do fornecedor,
              registre reclamação no site consumidor.gov.br ou procure o PROCON da sua cidade.
            </li>
            <li>
              <strong>Ação judicial:</strong> se a via administrativa não resolver, o consumidor
              pode ingressar com ação no Juizado Especial Cível (para causas até 40 salários
              mínimos) sem necessidade de advogado para causas de até 20 salários mínimos.
            </li>
            <li>
              <strong>Análise prévia:</strong> antes de assinar qualquer contrato, utilize
              ferramentas de análise contratual para identificar riscos e cláusulas problemáticas.
            </li>
          </ol>

          <h2 className="mt-10 text-2xl font-bold">
            Princípios fundamentais do CDC nos contratos
          </h2>
          <p className="text-gray-700">
            Para além das cláusulas específicas, o CDC fundamenta a proteção contratual em
            princípios que orientam a interpretação de qualquer contrato de consumo:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li>
              <strong>Vulnerabilidade do consumidor</strong> (art. 4o, I): reconhecimento de que
              o consumidor é a parte mais fraca da relação.
            </li>
            <li>
              <strong>Boa-fé objetiva</strong> (art. 4o, III): dever de lealdade e transparência
              nas relações contratuais.
            </li>
            <li>
              <strong>Equilíbrio contratual</strong> (art. 4o, III): vedação de vantagem excessiva
              para qualquer das partes.
            </li>
            <li>
              <strong>Interpretação mais favorável</strong> (art. 47): em caso de dúvida, as
              cláusulas contratuais são interpretadas de maneira mais favorável ao consumidor.
            </li>
            <li>
              <strong>Direito à informação</strong> (art. 6o, III): informação clara e adequada
              sobre produtos e serviços.
            </li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold">Conclusão</h2>
          <p className="text-gray-700">
            O CDC é um instrumento poderoso de proteção, mas só funciona quando o consumidor
            conhece seus direitos. Cláusulas abusivas em contratos de adesão são nulas
            independentemente de terem sido assinadas. Se você se deparar com um contrato que
            parece injusto, saiba que a legislação está ao seu lado. Procure informação, documente
            os problemas e não hesite em buscar seus direitos, seja administrativamente ou
            judicialmente.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-brand-200 bg-brand-50 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900">
            Suspeita de cláusulas abusivas no seu contrato?
          </h2>
          <p className="mt-2 text-gray-600">
            Faça upload do seu contrato e receba uma análise gratuita com inteligência artificial.
            Identifique riscos e cláusulas problemáticas em minutos.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Analisar meu contrato grátis
          </Link>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-400">
            Este artigo tem caráter informativo e educacional. Não constitui aconselhamento
            jurídico. Para situações específicas, consulte um advogado ou procure o PROCON da
            sua cidade.
          </p>
        </div>
      </article>
    </>
  );
}
