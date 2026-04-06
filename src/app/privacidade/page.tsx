import type { Metadata } from 'next';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'Politica de Privacidade',
  description:
    'Politica de privacidade do ContratoSeguro. Saiba como seus dados sao coletados, utilizados e protegidos em conformidade com a LGPD.',
  alternates: {
    canonical: '/privacidade',
  },
};

export default function PrivacidadePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Politica de Privacidade</h1>
        <p className="mb-10 text-sm text-gray-500">
          Ultima atualizacao: 6 de abril de 2026
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">1. Introducao</h2>
            <p>
              O ContratoSeguro (&quot;nos&quot;, &quot;nosso&quot; ou &quot;Plataforma&quot;) respeita a privacidade de
              seus usuarios e esta comprometido com a protecao dos seus dados pessoais. Esta Politica
              de Privacidade descreve quais informacoes coletamos, como as utilizamos, armazenamos e
              protegemos, em conformidade com a Lei Geral de Protecao de Dados Pessoais (LGPD - Lei
              n. 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">2. Dados coletados</h2>
            <p className="mb-3">Coletamos os seguintes tipos de dados:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Documentos enviados:</strong> contratos em formato PDF, JPG, PNG ou WebP que
                voce faz upload para analise. O conteudo e processado exclusivamente para gerar a
                analise solicitada.
              </li>
              <li>
                <strong>Dados de uso anonimos:</strong> informacoes agregadas e anonimizadas sobre o
                uso da plataforma, coletadas pelo Vercel Analytics. Esses dados nao incluem
                informacoes pessoais identificaveis (PII) e nao utilizam cookies de rastreamento.
              </li>
              <li>
                <strong>Dados tecnicos:</strong> tipo de navegador, resolucao de tela e sistema
                operacional, coletados de forma anonima para melhoria da experiencia do usuario.
              </li>
            </ul>
            <p className="mt-3">
              <strong>Nao coletamos:</strong> nome, e-mail, CPF, endereco, telefone ou qualquer dado
              pessoal identificavel. Voce nao precisa criar conta para usar a plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">3. Finalidade do tratamento</h2>
            <p className="mb-3">
              Os dados sao tratados com as seguintes finalidades, conforme Art. 7o da LGPD:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Realizar a analise automatizada do contrato enviado pelo usuario</li>
              <li>Gerar relatorios e versoes corrigidas do documento</li>
              <li>Melhorar a qualidade e o desempenho da plataforma (dados anonimos)</li>
              <li>Garantir a seguranca e prevenir fraudes</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              4. Processamento por inteligencia artificial
            </h2>
            <p>
              Utilizamos a API da Anthropic (modelo Claude) para processar o texto extraido dos
              documentos. O conteudo e enviado via conexao criptografada (TLS) e processado
              exclusivamente para gerar a analise. A Anthropic nao armazena os dados enviados via API
              e nao os utiliza para treinamento de modelos de IA, conforme sua politica de dados
              comerciais.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              5. Armazenamento e periodo de retencao
            </h2>
            <p>
              Os documentos e resultados de analise sao armazenados no Supabase (PostgreSQL
              hospedado na AWS), com criptografia em repouso e em transito.{' '}
              <strong>
                Todos os documentos e dados de analise sao excluidos automaticamente apos 7
                (sete) dias
              </strong>
              , contados a partir da data do upload. Apos esse periodo, nao e possivel recuperar os
              dados.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">6. Cookies e rastreamento</h2>
            <p>
              O ContratoSeguro utiliza o Vercel Analytics e o Vercel Speed Insights, que sao
              ferramentas de analytics que respeitam a privacidade do usuario. Essas ferramentas{' '}
              <strong>nao utilizam cookies de rastreamento</strong>, nao coletam dados pessoais
              identificaveis e nao compartilham informacoes com terceiros. Os dados coletados sao
              exclusivamente metricas de desempenho e uso agregadas e anonimizadas.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              7. Compartilhamento com terceiros
            </h2>
            <p className="mb-3">
              <strong>Nao vendemos, alugamos ou compartilhamos seus dados com terceiros</strong> para
              fins de marketing ou publicidade. Os dados sao processados exclusivamente pelos
              seguintes servicos tecnicos, necessarios ao funcionamento da plataforma:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Anthropic (Claude API):</strong> processamento de texto para analise por IA.
                Os dados nao sao retidos ou usados para treinamento.
              </li>
              <li>
                <strong>Supabase:</strong> armazenamento temporario de documentos e resultados (7
                dias).
              </li>
              <li>
                <strong>Vercel:</strong> hospedagem da aplicacao e analytics anonimos.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">8. Seguranca dos dados</h2>
            <p>Adotamos medidas tecnicas e organizacionais para proteger seus dados, incluindo:</p>
            <ul className="ml-6 mt-3 list-disc space-y-2">
              <li>Criptografia em transito (TLS/HTTPS) em todas as comunicacoes</li>
              <li>Criptografia em repouso no banco de dados</li>
              <li>Exclusao automatica apos 7 dias</li>
              <li>Acesso restrito a infraestrutura por credenciais seguras</li>
              <li>Nenhum armazenamento local de documentos no servidor</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              9. Seus direitos (LGPD, Arts. 17-22)
            </h2>
            <p className="mb-3">
              Em conformidade com a LGPD, voce tem os seguintes direitos sobre seus dados:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Confirmacao e acesso:</strong> saber se tratamos seus dados e acessar as
                informacoes (Art. 18, I e II)
              </li>
              <li>
                <strong>Correcao:</strong> solicitar a correcao de dados incompletos ou
                desatualizados (Art. 18, III)
              </li>
              <li>
                <strong>Eliminacao:</strong> solicitar a exclusao dos seus dados a qualquer momento.
                Como os dados sao excluidos automaticamente em 7 dias, este direito e atendido de
                forma proativa (Art. 18, VI)
              </li>
              <li>
                <strong>Informacao sobre compartilhamento:</strong> saber com quais entidades seus
                dados sao compartilhados (Art. 18, VII)
              </li>
              <li>
                <strong>Revogacao do consentimento:</strong> revogar seu consentimento a qualquer
                momento (Art. 18, IX)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              10. Exclusao antecipada de dados
            </h2>
            <p>
              Se voce deseja que seus dados sejam excluidos antes do prazo de 7 dias, entre em
              contato conosco pelo e-mail abaixo. Atenderemos a solicitacao em ate 48 horas uteis.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              11. Alteracoes nesta politica
            </h2>
            <p>
              Esta Politica de Privacidade pode ser atualizada periodicamente. Alteracoes
              significativas serao comunicadas na plataforma. A data da ultima atualizacao sera sempre
              indicada no topo desta pagina.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">12. Contato</h2>
            <p>
              Para exercer seus direitos, esclarecer duvidas ou enviar solicitacoes relacionadas a
              esta Politica de Privacidade, entre em contato:
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
              <strong>Base legal:</strong> Esta politica esta em conformidade com a Lei Geral de
              Protecao de Dados Pessoais (Lei n. 13.709/2018), o Marco Civil da Internet (Lei n.
              12.965/2014) e demais normas aplicaveis do ordenamento juridico brasileiro.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
