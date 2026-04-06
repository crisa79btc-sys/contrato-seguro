import type { Metadata } from 'next';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description:
    'Termos de uso do ContratoSeguro. Condicoes de utilizacao da plataforma de analise de contratos com inteligencia artificial.',
  alternates: {
    canonical: '/termos',
  },
};

export default function TermosPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Termos de Uso</h1>
        <p className="mb-10 text-sm text-gray-500">
          Ultima atualizacao: 6 de abril de 2026
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">1. Aceitacao dos termos</h2>
            <p>
              Ao acessar e utilizar o ContratoSeguro (&quot;Plataforma&quot;), voce concorda
              integralmente com estes Termos de Uso. Caso nao concorde com qualquer disposicao
              aqui prevista, voce nao devera utilizar a Plataforma. O uso continuado apos eventuais
              alteracoes constitui aceitacao tacita dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              2. Descricao do servico
            </h2>
            <p className="mb-3">
              O ContratoSeguro e uma plataforma online que utiliza inteligencia artificial para
              analisar documentos contratuais, identificar possiveis riscos e gerar sugestoes de
              correcao. O servico inclui:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                Upload de documentos nos formatos PDF, JPG, PNG e WebP, com limite de 10 MB por
                arquivo
              </li>
              <li>Analise automatizada do conteudo do contrato por inteligencia artificial</li>
              <li>Identificacao de clausulas potencialmente abusivas ou desfavoraveis</li>
              <li>Geracao de versao corrigida do contrato com sugestoes de melhoria</li>
              <li>Download do relatorio e do contrato corrigido em formato PDF ou DOCX</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              3. Natureza informativa do servico
            </h2>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-900">Aviso importante:</p>
              <p className="mt-2 text-amber-800">
                O ContratoSeguro e uma <strong>ferramenta informativa e educacional</strong>. A
                analise gerada pela inteligencia artificial <strong>nao constitui parecer juridico,
                consultoria legal ou assessoria advocaticia</strong>. Os resultados apresentados nao
                substituem a consulta a um advogado habilitado junto a Ordem dos Advogados do Brasil
                (OAB).
              </p>
              <p className="mt-2 text-amber-800">
                As sugestoes e identificacoes de riscos sao baseadas em padroes da legislacao
                brasileira e jurisprudencia pacificada, mas podem conter imprecisoes. O usuario e
                integralmente responsavel por suas decisoes juridicas.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              4. Responsabilidades do usuario
            </h2>
            <p className="mb-3">Ao utilizar a Plataforma, o usuario se compromete a:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                Enviar apenas documentos sobre os quais tenha direito de acesso e analise
              </li>
              <li>
                Nao utilizar a Plataforma para fins ilicitos, fraudulentos ou que violem direitos de
                terceiros
              </li>
              <li>
                Nao tentar acessar sistemas, dados ou funcionalidades nao autorizados da Plataforma
              </li>
              <li>
                Nao utilizar a analise gerada como substituto de assessoria juridica profissional
                para decisoes de alto impacto
              </li>
              <li>
                Compreender que a qualidade da analise depende da qualidade e legibilidade do
                documento enviado
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              5. Limitacao de responsabilidade
            </h2>
            <p>
              Na maxima extensao permitida pela legislacao brasileira, incluindo o Codigo Civil (Lei
              n. 10.406/2002, Arts. 186, 187 e 927), o ContratoSeguro nao sera responsavel por:
            </p>
            <ul className="ml-6 mt-3 list-disc space-y-2">
              <li>
                Danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso ou da
                impossibilidade de uso da Plataforma
              </li>
              <li>
                Decisoes juridicas, financeiras ou de qualquer natureza tomadas com base na analise
                gerada
              </li>
              <li>
                Imprecisoes, omissoes ou erros nas analises produzidas pela inteligencia artificial
              </li>
              <li>
                Perdas de dados decorrentes de falhas tecnicas, interrupcoes de servico ou caso
                fortuito
              </li>
              <li>
                Conteudo dos documentos enviados pelo usuario
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              6. Disponibilidade do servico
            </h2>
            <p>
              O ContratoSeguro se empenha em manter a Plataforma disponivel de forma ininterrupta,
              mas nao garante disponibilidade continua ou isenta de erros. A Plataforma pode ficar
              temporariamente indisponivel para manutencao, atualizacoes ou por fatores fora do nosso
              controle. Nos reservamos o direito de modificar, suspender ou descontinuar qualquer
              funcionalidade a qualquer momento, sem aviso previo.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              7. Propriedade intelectual
            </h2>
            <p className="mb-3">
              Todo o conteudo da Plataforma, incluindo mas nao limitado a textos, graficos,
              logotipos, icones, imagens, software e codigo-fonte, e de propriedade do ContratoSeguro
              ou de seus licenciantes e esta protegido pelas leis brasileiras de propriedade
              intelectual (Lei n. 9.610/1998 e Lei n. 9.609/1998).
            </p>
            <p>
              Os documentos enviados pelo usuario permanecem de propriedade exclusiva do usuario. O
              ContratoSeguro nao adquire nenhum direito sobre o conteudo dos contratos analisados. As
              analises e correcoes geradas pela IA sao licenciadas ao usuario para uso pessoal e nao
              exclusivo.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              8. Privacidade e protecao de dados
            </h2>
            <p>
              O tratamento de dados pessoais pela Plataforma e regido pela nossa{' '}
              <a href="/privacidade" className="text-brand-600 hover:underline">
                Politica de Privacidade
              </a>
              , que faz parte integrante destes Termos de Uso. Os documentos enviados sao
              criptografados e excluidos automaticamente apos 7 dias, em conformidade com a LGPD
              (Lei n. 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              9. Condicoes de pagamento
            </h2>
            <p>
              A analise de contratos e sempre gratuita. Funcionalidades adicionais, como o download
              do contrato corrigido, poderao ser cobradas conforme o modelo de precos vigente,
              informado ao usuario antes da confirmacao do pagamento. Os pagamentos sao processados
              por meio do Mercado Pago, e suas condicoes estao sujeitas aos termos do respectivo
              processador de pagamentos.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              10. Legislacao aplicavel e foro
            </h2>
            <p>
              Estes Termos de Uso sao regidos pela legislacao da Republica Federativa do Brasil,
              incluindo o Marco Civil da Internet (Lei n. 12.965/2014), o Codigo de Defesa do
              Consumidor (Lei n. 8.078/1990) quando aplicavel, e a LGPD (Lei n. 13.709/2018). Para
              dirimir quaisquer controversias decorrentes destes Termos, fica eleito o foro da
              comarca do domicilio do usuario, conforme Art. 101, I, do Codigo de Defesa do
              Consumidor.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              11. Alteracoes nos termos
            </h2>
            <p>
              O ContratoSeguro se reserva o direito de alterar estes Termos de Uso a qualquer
              momento. Alteracoes significativas serao comunicadas na Plataforma. A continuidade do
              uso apos a publicacao de alteracoes constitui aceitacao dos novos termos. A data da
              ultima atualizacao sera sempre indicada no topo desta pagina.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">12. Contato</h2>
            <p>
              Para duvidas, sugestoes ou reclamacoes sobre estes Termos de Uso, entre em contato:
            </p>
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p>
                <strong>ContratoSeguro</strong>
              </p>
              <p>
                E-mail:{' '}
                <a
                  href="mailto:contato@contratoseguro.com.br"
                  className="text-brand-600 hover:underline"
                >
                  contato@contratoseguro.com.br
                </a>
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-brand-100 bg-brand-50 p-4">
            <p className="text-sm text-brand-800">
              <strong>Base legal:</strong> Estes termos estao em conformidade com o Marco Civil da
              Internet (Lei n. 12.965/2014), o Codigo Civil (Lei n. 10.406/2002), o Codigo de Defesa
              do Consumidor (Lei n. 8.078/1990) e a Lei Geral de Protecao de Dados Pessoais (Lei n.
              13.709/2018).
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
