'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import MessageBubble from './MessageBubble';

type Message = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
};

type Props = {
  contractId: string;
  contractType?: string | null;
};

const SUGGESTED_QUESTIONS = [
  'Posso cancelar o contrato a qualquer momento?',
  'Qual é a multa por rescisão antecipada?',
  'O contrato prevê reajuste de valor?',
];

export default function ChatPanel({ contractId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [messagesUsed, setMessagesUsed] = useState(0);
  const [messagesLimit, setMessagesLimit] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll para a última mensagem
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Carregar histórico ao montar
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`/api/contract/${contractId}/chat`);
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.messages ?? []);
        setMessagesUsed(data.messagesUsed ?? 0);
        setMessagesLimit(data.messagesLimit ?? 20);
      } catch {
        // Falha silenciosa — chat começa vazio
      } finally {
        setInitialLoading(false);
      }
    }
    loadHistory();
  }, [contractId]);

  // Scroll ao receber novas mensagens
  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  async function sendMessage(text: string) {
    const question = text.trim();
    if (!question || loading) return;

    setError(null);
    setInput('');

    // Adicionar mensagem do usuário otimisticamente
    const optimisticUser: Message = { role: 'user', content: question };
    setMessages((prev) => [...prev, optimisticUser]);
    setLoading(true);

    try {
      const res = await fetch(`/api/contract/${contractId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Remover mensagem otimista em caso de erro
        setMessages((prev) => prev.slice(0, -1));
        setError(data.error || 'Erro ao enviar pergunta. Tente novamente.');
        return;
      }

      // Adicionar resposta da IA
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer },
      ]);
      setMessagesUsed(data.messagesUsed ?? messagesUsed + 1);
      setMessagesLimit(data.messagesLimit ?? messagesLimit);
    } catch {
      setMessages((prev) => prev.slice(0, -1));
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const remaining = messagesLimit - messagesUsed;
  const limitReached = remaining <= 0;
  const isEmpty = messages.length === 0 && !initialLoading;

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
      {/* Header do chat */}
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600/20">
            <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Pergunte ao contrato</h3>
            <p className="text-xs text-slate-500">Respostas baseadas no texto do seu contrato</p>
          </div>
        </div>

        {/* Contador de perguntas */}
        <div className={`text-xs ${remaining <= 5 ? 'text-orange-400' : 'text-slate-500'}`}>
          {remaining > 0 ? (
            <span>{remaining} pergunta{remaining !== 1 ? 's' : ''} restante{remaining !== 1 ? 's' : ''}</span>
          ) : (
            <span className="text-red-400">Limite atingido</span>
          )}
        </div>
      </div>

      {/* Área de mensagens */}
      <div className="h-80 overflow-y-auto px-5 py-4">
        {initialLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
          </div>
        ) : isEmpty ? (
          /* Estado vazio — sugestões de perguntas */
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-slate-400">
              Faça uma pergunta sobre este contrato
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-left text-xs text-slate-300 transition hover:border-brand-500/30 hover:bg-white/8 hover:text-white"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Lista de mensagens */
          <div className="flex flex-col gap-3">
            {messages.map((msg, i) => (
              <MessageBubble key={msg.id ?? i} role={msg.role} content={msg.content} />
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="mr-2 mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-600">
                  <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white/8 px-4 py-2.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="border-t border-white/5 px-5 py-2">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Aviso de limite próximo */}
      {remaining <= 5 && remaining > 0 && !limitReached && (
        <div className="border-t border-white/5 px-5 py-2">
          <p className="text-xs text-orange-400">
            Você tem apenas {remaining} pergunta{remaining !== 1 ? 's' : ''} restante{remaining !== 1 ? 's' : ''}.{' '}
            <a href="/entrar" className="underline">Faça login</a> para ter mais 80.
          </p>
        </div>
      )}

      {/* CTA quando limite atingido */}
      {limitReached && (
        <div className="border-t border-white/5 px-5 py-3">
          <p className="text-center text-xs text-slate-400">
            Limite de {messagesLimit} perguntas atingido.{' '}
            <a href="/entrar" className="font-medium text-brand-400 hover:underline">
              Faça login para ter 100 perguntas
            </a>
          </p>
        </div>
      )}

      {/* Input */}
      {!limitReached && (
        <form
          onSubmit={handleSubmit}
          className="border-t border-white/8 px-4 py-3 flex items-end gap-3"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre o contrato… (Enter para enviar)"
            disabled={loading}
            rows={1}
            className="flex-1 resize-none rounded-xl bg-white/8 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-white/10 transition focus:ring-brand-500/50 disabled:opacity-50"
            style={{ maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-500 disabled:opacity-40"
            aria-label="Enviar pergunta"
          >
            {loading ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
