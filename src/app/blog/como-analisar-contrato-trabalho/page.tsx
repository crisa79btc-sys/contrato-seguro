import type { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app';

export const metadata: Metadata = {
  title: 'Como Analisar um Contrato de Trabalho: Guia Completo para o Trabalhador',
  description:
    'Aprenda a analisar seu contrato de trabalho e identificar cláusulas irregulares. Conheça seus direitos garantidos pela CLT e pela Constituição Federal.',
  keywords: [
    'como analisar contrato de trabalho',
    'contrato de trabalho cláusulas',
    'direitos trabalhistas contrato',
    'CLT contrato de trabalho',
    'cláusulas abusivas contrato trabalho',
    'revisão contrato trabalho',
    'contrato de trabalho o que verificar',
  ],
  openGraph: {
    title: 'Como Analisar um Contrato de Trabalho: Guia Completo',
    description:
      'Guia completo para analisar contratos de trabalho. Conheça seus direitos pela CLT e identifique cláusulas irregulares.',
    url: `${BASE_URL}/blog/como-analisar-contrato-trabalho`,
    type: 'article',
    locale: 'pt_BR',
    siteName: 'ContratoSeguro',
    publishedTime: '2026-04-06T12:00:00Z',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Como Analisar um Contrato de Trabalho',
    description: 'Guia completo para o trabalhador analisar seu contrato e conhecer seus direitos.',
  },
  alternates: {
    canonical: `${BASE_URL}/blog/como-analisar-contrato-trabalho`,
  },
};

function ArticleJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Como Analisar um Contrato de Trabalho: Guia Completo para o Trabalhador',
    description:
      'Guia completo para analisar contratos de trabalho, com base na CLT e na Constituição Federal.',
    author: { '@type': 'Organization', name: 'ContratoSeguro', url: BASE_URL },
    publisher: { '@type': 'Organization', name: 'ContratoSeguro', url: BASE_URL },
    datePublished: '2026-04-06',
    dateModified: '2026-04-06',
    mainEntityOfPage: `${BASE_URL}/blog/como-analisar-contrato-trabalho`,
    inLanguage: 'pt-BR',
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default function ComoAnalisarContratoTrabalhoPage() {
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
            <span className="text-sm text-gray-500">Trabalho</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
            Como Analisar um Contrato de Trabalho: Guia Completo para o Trabalhador
          </h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <time dateTime="2026-04-06">6 de abril de 2026</time>
            <span>9 min de leitura</span>
          </div>
        </header>

        <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-brand-600">
          <p className="text-lg leading-relaxed text-gray-700">
            O contrato de trabalho é o documento que formaliza a relação entre empregado e
            empregador. Apesar de ser regulado pela CLT (Consolidação das Leis do Trabalho --
            Decreto-Lei 5.452/1943) e pela Constituição Federal de 1988, muitos trabalhadores
            assinam seus contratos sem uma leitura cuidadosa, deixando passar cláusulas que
            podem prejudicá-los. Este guia explica o que verificar antes de assinar.
          </p>

          <h2 className="mt-10 text-2xl font-bold">
            Elementos essenciais de um contrato de trabalho
          </h2>
          <p className="text-gray-700">
            Todo contrato de trabalho deve conter, no mínimo, as seguintes informações, conforme
            o artigo 29 da CLT e a prática consolidada:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li>
              <strong>Identificação das partes:</strong> nome completo, CPF/CNPJ, endereço do
              empregador e do empregado.
            </li>
            <li>
              <strong>Função e descrição das atividades:</strong> o cargo deve ser claramente
              definido. Funções genéricas como &quot;serviços gerais&quot; podem ser usadas para
              exigir tarefas incompatíveis com a contratação.
            </li>
            <li>
              <strong>Remuneração:</strong> salário base, forma de pagamento e periodicidade.
              O artigo 459 da CLT determina que o pagamento deve ser feito até o 5o dia útil do
              mês subsequente.
            </li>
            <li>
              <strong>Jornada de trabalho:</strong> horário de entrada, saída e intervalo. A
              Constituição Federal (art. 7o, XIII) limita a jornada a 8 horas diárias e 44 horas
              semanais.
            </li>
            <li>
              <strong>Data de início e prazo:</strong> se o contrato é por prazo determinado ou
              indeterminado.
            </li>
            <li>
              <strong>Local de trabalho:</strong> endereço ou indicação de trabalho remoto, se for
              o caso.
            </li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold">
            Tipos de contrato de trabalho
          </h2>
          <p className="text-gray-700">
            A legislação brasileira prevê diferentes modalidades de contrato de trabalho, cada
            uma com regras específicas:
          </p>

          <h3 className="mt-6 text-xl font-semibold">Contrato por prazo indeterminado</h3>
          <p className="text-gray-700">
            É a modalidade padrão. Não tem data de término prevista e confere ao trabalhador
            todos os direitos da CLT, incluindo aviso prévio, multa de 40% do FGTS e seguro-
            desemprego em caso de demissão sem justa causa.
          </p>

          <h3 className="mt-6 text-xl font-semibold">Contrato por prazo determinado</h3>
          <p className="text-gray-700">
            Previsto nos artigos 443 e 445 da CLT, tem duração máxima de 2 anos. Só é válido
            em hipóteses específicas: serviço cuja natureza justifique a predeterminação do
            prazo, atividades empresariais de caráter transitório, ou contrato de experiência.
            Um contrato por prazo determinado fora dessas hipóteses pode ser convertido em
            prazo indeterminado judicialmente.
          </p>

          <h3 className="mt-6 text-xl font-semibold">Contrato de experiência</h3>
          <p className="text-gray-700">
            Modalidade de contrato por prazo determinado, com duração máxima de 90 dias (art.
            445, parágrafo único, da CLT). Pode ser prorrogado uma única vez, desde que a soma
            dos períodos não ultrapasse 90 dias. Cláusula que preveja experiência de 120 dias,
            por exemplo, é irregular.
          </p>

          <h3 className="mt-6 text-xl font-semibold">Contrato intermitente</h3>
          <p className="text-gray-700">
            Introduzido pela Reforma Trabalhista (Lei 13.467/2017), o artigo 443, par. 3o, da CLT
            define o trabalho intermitente como aquele em que a prestação de serviços não é
            contínua, com alternância de períodos de atividade e inatividade. O contrato deve
            ser celebrado por escrito e conter especificamente o valor da hora de trabalho, que
            não pode ser inferior ao valor horário do salário mínimo.
          </p>

          <h2 className="mt-10 text-2xl font-bold">
            Cláusulas que merecem atenção especial
          </h2>

          <h3 className="mt-6 text-xl font-semibold">Cláusula de exclusividade</h3>
          <p className="text-gray-700">
            Embora seja válida, a cláusula de exclusividade deve ser proporcional e razoável.
            Impedir o trabalhador de exercer qualquer outra atividade, mesmo fora do horário de
            trabalho e sem concorrência, pode ser considerada abusiva, especialmente se a
            remuneração não compensar essa restrição. O artigo 5o, XIII, da Constituição Federal
            garante a liberdade de exercício de qualquer trabalho ou profissão.
          </p>

          <h3 className="mt-6 text-xl font-semibold">Cláusula de não-concorrência</h3>
          <p className="text-gray-700">
            A cláusula de não-concorrência pós-contratual não tem previsão expressa na CLT, mas
            é aceita pela jurisprudência desde que atenda a requisitos de validade: prazo
            razoável (geralmente até 2 anos), limitação geográfica, especificação das atividades
            vedadas e compensação financeira adequada. Uma cláusula de não-concorrência sem
            contrapartida financeira tende a ser invalidada pelos tribunais trabalhistas.
          </p>

          <h3 className="mt-6 text-xl font-semibold">Banco de horas</h3>
          <p className="text-gray-700">
            Após a Reforma Trabalhista, o banco de horas pode ser pactuado por acordo individual
            escrito, desde que a compensação ocorra no período máximo de 6 meses (art. 59, par.
            5o, da CLT). Para compensação em até 1 ano, é necessário acordo ou convenção coletiva
            (art. 59, par. 2o). Verifique se o contrato respeita esses prazos e se há mecanismo
            claro de controle das horas.
          </p>

          <h3 className="mt-6 text-xl font-semibold">Descontos salariais</h3>
          <p className="text-gray-700">
            O artigo 462 da CLT proíbe descontos nos salários, salvo em caso de adiantamento,
            dispositivos de lei ou convenção coletiva. Cláusulas que autorizem descontos por
            danos ao patrimônio do empregador só são válidas quando o dano for causado por dolo
            do empregado. Em caso de culpa (negligência), o desconto só é possível se houver
            previsão contratual expressa.
          </p>

          <h3 className="mt-6 text-xl font-semibold">Transferência de local de trabalho</h3>
          <p className="text-gray-700">
            O artigo 469 da CLT determina que a transferência de local de trabalho que acarrete
            mudança de domicílio só é possível com a concordância do empregado, salvo exceções
            legais (como empregados em cargo de confiança). Cláusulas amplas que permitam
            transferência unilateral para qualquer localidade devem ser analisadas com cautela.
          </p>

          <h2 className="mt-10 text-2xl font-bold">
            Direitos que não podem ser suprimidos por contrato
          </h2>
          <p className="text-gray-700">
            A CLT e a Constituição Federal estabelecem um patamar mínimo de direitos que nenhum
            contrato pode reduzir. O artigo 9o da CLT declara nulos os atos praticados com o
            objetivo de desvirtuar, impedir ou fraudar a aplicação dos preceitos trabalhistas.
            Entre os direitos irrenunciáveis estão:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li>Salário mínimo (art. 7o, IV, da CF)</li>
            <li>13o salário (art. 7o, VIII, da CF)</li>
            <li>Férias acrescidas de 1/3 (art. 7o, XVII, da CF)</li>
            <li>FGTS (art. 7o, III, da CF)</li>
            <li>Repouso semanal remunerado (art. 7o, XV, da CF)</li>
            <li>Adicional noturno, de insalubridade e de periculosidade (arts. 73, 192 e 193 da CLT)</li>
            <li>Licença-maternidade de 120 dias (art. 7o, XVIII, da CF)</li>
            <li>Aviso prévio proporcional ao tempo de serviço (art. 7o, XXI, da CF)</li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold">
            Passo a passo para analisar seu contrato
          </h2>
          <ol className="list-decimal space-y-3 pl-6 text-gray-700">
            <li>
              <strong>Leia o contrato inteiro antes de assinar.</strong> Pode parecer óbvio, mas
              muitos trabalhadores assinam sob pressão, sem leitura completa. Você tem o direito
              de levar o documento para casa e analisá-lo com calma.
            </li>
            <li>
              <strong>Verifique se o cargo e a remuneração correspondem ao combinado.</strong>{' '}
              Compare o que foi acordado verbalmente com o que está escrito. Diferenças entre o
              combinado e o contratado são a principal fonte de conflitos trabalhistas.
            </li>
            <li>
              <strong>Confira a jornada de trabalho.</strong> Verifique se as horas semanais estão
              dentro do limite legal. Observe se há previsão de horas extras e como serão
              remuneradas (no mínimo 50% a mais, conforme art. 7o, XVI, da CF).
            </li>
            <li>
              <strong>Analise as cláusulas restritivas.</strong> Exclusividade, não-concorrência,
              confidencialidade -- todas precisam ser proporcionais e ter contrapartida adequada.
            </li>
            <li>
              <strong>Verifique os benefícios.</strong> Vale-transporte, vale-refeição, plano de
              saúde -- confirme se estão previstos no contrato ou em documentos acessórios.
            </li>
            <li>
              <strong>Atente para cláusulas de rescisão.</strong> O contrato não pode criar
              condições de rescisão mais gravosas do que as previstas na CLT.
            </li>
          </ol>

          <h2 className="mt-10 text-2xl font-bold">
            A Reforma Trabalhista e os contratos atuais
          </h2>
          <p className="text-gray-700">
            A Lei 13.467/2017 (Reforma Trabalhista) trouxe alterações significativas. O artigo
            611-A da CLT passou a permitir que convenções e acordos coletivos prevaleçam sobre a
            lei em determinadas matérias, como jornada de trabalho, banco de horas e intervalo
            intrajornada. Porém, o artigo 611-B lista os direitos que não podem ser suprimidos
            ou reduzidos, como salário mínimo, FGTS e normas de saúde e segurança.
          </p>
          <p className="text-gray-700">
            Para trabalhadores considerados &quot;hipersuficientes&quot; (com diploma de nível
            superior e remuneração igual ou superior a duas vezes o teto do RGPS), o artigo
            444, parágrafo único, da CLT permite a negociação individual das matérias listadas
            no artigo 611-A. Ainda assim, os direitos do artigo 611-B permanecem protegidos.
          </p>

          <h2 className="mt-10 text-2xl font-bold">Conclusão</h2>
          <p className="text-gray-700">
            Analisar cuidadosamente um contrato de trabalho antes de assiná-lo é uma medida de
            proteção fundamental. A legislação trabalhista brasileira oferece um amplo conjunto
            de garantias ao trabalhador, mas essas garantias só podem ser exercidas por quem as
            conhece. Em caso de dúvidas sobre cláusulas específicas, busque orientação junto ao
            sindicato da sua categoria, ao Ministério do Trabalho ou a um advogado trabalhista.
            Ferramentas de análise contratual com IA também podem ajudar a identificar pontos
            de atenção de forma rápida e acessível.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-brand-200 bg-brand-50 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900">
            Analise seu contrato de trabalho com IA
          </h2>
          <p className="mt-2 text-gray-600">
            Faça upload do seu contrato e descubra em minutos se há cláusulas irregulares ou
            riscos ocultos. Análise gratuita e confidencial.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Analisar meu contrato de trabalho
          </Link>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-400">
            Este artigo tem caráter informativo e educacional. Não constitui aconselhamento
            jurídico. Para situações específicas, consulte um advogado especializado em direito
            do trabalho.
          </p>
        </div>
      </article>
    </>
  );
}
