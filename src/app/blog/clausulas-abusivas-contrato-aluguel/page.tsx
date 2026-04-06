import type { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app';

export const metadata: Metadata = {
  title: 'Cláusulas Abusivas em Contrato de Aluguel: Como Identificar e Se Proteger',
  description:
    'Saiba quais cláusulas são consideradas abusivas pela Lei do Inquilinato (Lei 8.245/91) e pelo CDC. Guia completo para locatários e locadores com exemplos reais.',
  keywords: [
    'cláusulas abusivas contrato de aluguel',
    'contrato de aluguel abusivo',
    'lei do inquilinato',
    'direitos do inquilino',
    'contrato de locação cláusulas proibidas',
    'multa abusiva aluguel',
    'revisão contrato aluguel',
  ],
  openGraph: {
    title: 'Cláusulas Abusivas em Contrato de Aluguel: Como Identificar e Se Proteger',
    description:
      'Guia completo sobre cláusulas abusivas em contratos de aluguel. Conheça seus direitos pela Lei do Inquilinato.',
    url: `${BASE_URL}/blog/clausulas-abusivas-contrato-aluguel`,
    type: 'article',
    locale: 'pt_BR',
    siteName: 'ContratoSeguro',
    publishedTime: '2026-04-06T12:00:00Z',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cláusulas Abusivas em Contrato de Aluguel',
    description: 'Guia completo para identificar e se proteger de cláusulas abusivas no aluguel.',
  },
  alternates: {
    canonical: `${BASE_URL}/blog/clausulas-abusivas-contrato-aluguel`,
  },
};

function ArticleJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Cláusulas Abusivas em Contrato de Aluguel: Como Identificar e Se Proteger',
    description:
      'Guia completo sobre cláusulas abusivas em contratos de aluguel, com base na Lei do Inquilinato e no Código de Defesa do Consumidor.',
    author: { '@type': 'Organization', name: 'ContratoSeguro', url: BASE_URL },
    publisher: { '@type': 'Organization', name: 'ContratoSeguro', url: BASE_URL },
    datePublished: '2026-04-06',
    dateModified: '2026-04-06',
    mainEntityOfPage: `${BASE_URL}/blog/clausulas-abusivas-contrato-aluguel`,
    inLanguage: 'pt-BR',
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default function ClausulasAbusivasAluguelPage() {
  return (
    <>
      <ArticleJsonLd />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Link
              href="/blog"
              className="text-sm text-brand-600 hover:underline"
            >
              Blog
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500">Aluguel</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
            Cláusulas Abusivas em Contrato de Aluguel: Como Identificar e Se Proteger
          </h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <time dateTime="2026-04-06">6 de abril de 2026</time>
            <span>8 min de leitura</span>
          </div>
        </header>

        <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-brand-600">
          <p className="text-lg leading-relaxed text-gray-700">
            Assinar um contrato de aluguel é um dos atos mais comuns da vida civil brasileira.
            Segundo dados do IBGE, mais de 20% dos domicílios no Brasil são alugados. No entanto,
            muitos contratos contêm cláusulas que violam a legislação vigente e podem ser
            consideradas abusivas. Conhecer seus direitos é o primeiro passo para se proteger.
          </p>

          <h2 className="mt-10 text-2xl font-bold">O que é uma cláusula abusiva?</h2>
          <p className="text-gray-700">
            Uma cláusula abusiva é aquela que coloca uma das partes em desvantagem excessiva,
            contrariando a boa-fé e o equilíbrio contratual. No contexto dos contratos de locação,
            a <strong>Lei do Inquilinato (Lei 8.245/1991)</strong> é a legislação principal que rege
            as relações entre locadores e locatários. Além dela, o{' '}
            <strong>Código de Defesa do Consumidor (Lei 8.078/1990)</strong> pode ser aplicado
            quando a locação é intermediada por imobiliárias, conforme entendimento consolidado
            em parte da jurisprudência.
          </p>
          <p className="text-gray-700">
            O <strong>Código Civil (Lei 10.406/2002)</strong>, em seus artigos 421 e 422,
            estabelece que os contratos devem observar a função social e o princípio da boa-fé
            objetiva, servindo como fundamento adicional para questionar cláusulas desequilibradas.
          </p>

          <h2 className="mt-10 text-2xl font-bold">
            Cláusulas abusivas mais comuns em contratos de aluguel
          </h2>

          <h3 className="mt-6 text-xl font-semibold">
            1. Multa desproporcional por rescisão antecipada
          </h3>
          <p className="text-gray-700">
            A Lei do Inquilinato, em seu artigo 4o, permite a cobrança de multa por rescisão
            antecipada, mas determina que ela deve ser proporcional ao tempo restante do contrato.
            Uma cláusula que fixa multa de 3 aluguéis independentemente de quando o inquilino
            saia -- mesmo faltando apenas um mês para o término -- é considerada abusiva. A multa
            deve ser calculada proporcionalmente ao período de cumprimento.
          </p>
          <p className="text-gray-700">
            Por exemplo, se o contrato é de 30 meses com multa de 3 aluguéis, e o inquilino sai
            após 20 meses, a multa proporcional seria de 1 aluguel (3 x 10/30). Qualquer cobrança
            acima disso pode ser contestada judicialmente.
          </p>

          <h3 className="mt-6 text-xl font-semibold">
            2. Proibição de sublocação sem qualquer possibilidade
          </h3>
          <p className="text-gray-700">
            O artigo 13 da Lei 8.245/91 estabelece que a cessão da locação, a sublocação e o
            empréstimo dependem de consentimento prévio e escrito do locador. Embora o locador
            tenha o direito de vedar a sublocação, cláusulas que proíbam absolutamente qualquer
            forma de cessão, mesmo com anuência prévia, podem ser consideradas excessivamente
            restritivas, especialmente em contratos comerciais.
          </p>

          <h3 className="mt-6 text-xl font-semibold">
            3. Obrigação de pintura na devolução do imóvel
          </h3>
          <p className="text-gray-700">
            Esta é uma das cláusulas mais discutidas no direito locatício brasileiro. O artigo 23,
            inciso III, da Lei do Inquilinato obriga o locatário a restituir o imóvel no estado em
            que o recebeu, salvo as deteriorações decorrentes do uso normal. O desgaste natural da
            pintura pelo uso regular é considerado deterioração normal. Portanto, a obrigação
            incondicional de repintar o imóvel -- independentemente do estado da pintura na
            devolução -- pode ser questionada judicialmente. A jurisprudência de diversos tribunais
            estaduais tem consolidado esse entendimento.
          </p>

          <h3 className="mt-6 text-xl font-semibold">
            4. Renúncia ao direito de preferência na compra
          </h3>
          <p className="text-gray-700">
            O artigo 27 da Lei do Inquilinato garante ao locatário o direito de preferência na
            aquisição do imóvel locado, em igualdade de condições com terceiros. Cláusulas que
            obriguem o inquilino a renunciar previamente a esse direito são nulas de pleno
            direito, pois o artigo 45 da mesma lei veda expressamente a renúncia antecipada de
            direitos conferidos ao locatário.
          </p>

          <h3 className="mt-6 text-xl font-semibold">
            5. Reajuste por índice não previsto em lei
          </h3>
          <p className="text-gray-700">
            O artigo 17 da Lei 8.245/91 determina que é livre a convenção do aluguel, mas o
            artigo 18 proíbe estipulação de reajuste vinculado a variação cambial ou salário
            mínimo. Os índices mais utilizados e aceitos são o IGP-M (FGV) e o IPCA (IBGE).
            Cláusulas que prevejam reajuste pelo dólar, pelo salário mínimo ou por índices
            inexistentes são consideradas nulas.
          </p>

          <h3 className="mt-6 text-xl font-semibold">
            6. Cobrança de taxa de administração do locatário
          </h3>
          <p className="text-gray-700">
            A taxa de administração cobrada pela imobiliária é de responsabilidade do locador,
            que é quem contrata o serviço de administração do imóvel. Repassar essa cobrança
            ao inquilino configura prática abusiva. O mesmo vale para taxas de elaboração de
            contrato ou taxas de vistoria inicial.
          </p>

          <h3 className="mt-6 text-xl font-semibold">
            7. Fiador obrigado a permanecer indefinidamente
          </h3>
          <p className="text-gray-700">
            O artigo 40 da Lei do Inquilinato prevê hipóteses em que o fiador pode se exonerar
            da fiança. Cláusulas que impeçam o fiador de exercer esse direito ou que estendam
            automaticamente a garantia por prazo indeterminado, sem possibilidade de saída, são
            consideradas abusivas. O fiador tem o direito de se desobrigar nos casos previstos
            em lei, como na prorrogação do contrato por prazo indeterminado (Súmula 214 do STJ).
          </p>

          <h2 className="mt-10 text-2xl font-bold">
            O que fazer ao identificar uma cláusula abusiva
          </h2>
          <p className="text-gray-700">
            Se você identificar cláusulas abusivas em seu contrato de aluguel, existem algumas
            medidas que podem ser tomadas:
          </p>
          <ol className="list-decimal space-y-2 pl-6 text-gray-700">
            <li>
              <strong>Negociar antes de assinar:</strong> o momento ideal para questionar cláusulas
              é antes da assinatura. Solicite a remoção ou alteração de cláusulas que considere
              abusivas.
            </li>
            <li>
              <strong>Registrar por escrito:</strong> toda alteração acordada deve ser formalizada
              por escrito, preferencialmente como aditivo contratual ou com a cláusula riscada e
              rubricada por ambas as partes.
            </li>
            <li>
              <strong>Procurar o PROCON:</strong> se a locação é intermediada por imobiliária, o
              PROCON pode auxiliar na mediação do conflito.
            </li>
            <li>
              <strong>Ação judicial:</strong> cláusulas nulas podem ser declaradas como tal pelo
              Poder Judiciário, mesmo durante a vigência do contrato. O artigo 45 da Lei do
              Inquilinato declara nulas de pleno direito as cláusulas que visem elidir os
              objetivos da lei.
            </li>
            <li>
              <strong>Usar ferramentas de análise:</strong> plataformas de análise contratual com
              inteligência artificial podem identificar cláusulas problemáticas de forma rápida e
              objetiva, servindo como ponto de partida para a negociação.
            </li>
          </ol>

          <h2 className="mt-10 text-2xl font-bold">
            Direitos irrenunciáveis do locatário
          </h2>
          <p className="text-gray-700">
            O artigo 45 da Lei 8.245/91 é categórico: são nulas de pleno direito as cláusulas do
            contrato de locação que visem a elidir os objetivos da lei. Isso significa que mesmo
            que o locatário tenha assinado o contrato, cláusulas que violem a lei são
            automaticamente inválidas. Entre os direitos que não podem ser suprimidos por
            contrato estão:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li>Direito de preferência na compra do imóvel (art. 27)</li>
            <li>Direito à indenização por benfeitorias necessárias (art. 35)</li>
            <li>Direito à purgação da mora em ação de despejo por falta de pagamento (art. 62, II)</li>
            <li>Proporcionalidade da multa por rescisão antecipada (art. 4o)</li>
            <li>Direito de permanecer no imóvel durante a vigência do contrato, salvo exceções legais (art. 4o)</li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold">
            Legislação aplicável: resumo
          </h2>
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li><strong>Lei 8.245/1991</strong> (Lei do Inquilinato) -- legislação principal para locações urbanas</li>
            <li><strong>Lei 8.078/1990</strong> (CDC) -- aplicável quando há intermediação por imobiliária</li>
            <li><strong>Lei 10.406/2002</strong> (Código Civil) -- princípios gerais dos contratos (arts. 421, 422)</li>
            <li><strong>Súmula 214 do STJ</strong> -- exoneração do fiador na prorrogação do contrato</li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold">Conclusão</h2>
          <p className="text-gray-700">
            A assinatura de um contrato de aluguel exige atenção redobrada. Cláusulas abusivas são
            mais comuns do que se imagina e podem causar prejuízos financeiros significativos.
            Conhecer a Lei do Inquilinato e os seus direitos é fundamental para negociar condições
            justas e evitar surpresas desagradáveis. Em caso de dúvida, procure orientação jurídica
            especializada ou utilize ferramentas de análise contratual para ter uma visão clara
            dos riscos do seu contrato.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-brand-200 bg-brand-50 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900">
            Quer saber se o seu contrato de aluguel tem cláusulas abusivas?
          </h2>
          <p className="mt-2 text-gray-600">
            Faça upload do seu contrato e receba uma análise detalhada com inteligência artificial
            em poucos minutos. Totalmente gratuito.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Analisar meu contrato de aluguel
          </Link>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-400">
            Este artigo tem caráter informativo e educacional. Não constitui aconselhamento
            jurídico. Para situações específicas, consulte um advogado especializado em direito
            imobiliário.
          </p>
        </div>
      </article>
    </>
  );
}
