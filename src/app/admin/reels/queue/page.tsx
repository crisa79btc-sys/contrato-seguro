/**
 * Painel admin — fila de Reels.
 *
 * Lista reels em todos os estados (filtrável). Para reels `ready`, o usuário
 * pode editar título/descrição/hashtags, agendar no próximo slot ter/sex 19h
 * BRT, publicar agora ou cancelar.
 *
 * Dependências: /api/admin/reels/queue (GET) e /api/admin/reels/queue/[id] (PATCH).
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type Reel = {
  id: string;
  status: string;
  title: string | null;
  description: string | null;
  hashtags_instagram: string[] | null;
  hashtags_youtube: string[] | null;
  hook: string | null;
  duration_seconds: number | null;
  thumbnail_path: string | null;
  ready_storage_path: string | null;
  scheduled_for: string | null;
  error_message: string | null;
  created_at: string;
  reels_posts?: Array<{
    platform: string;
    platform_url: string | null;
    views: number;
    likes: number;
    comments: number;
  }>;
};

const STATUS_FILTERS = ['all', 'ready', 'scheduled', 'posted', 'failed', 'processing'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

const STATUS_BADGE: Record<string, string> = {
  uploaded: 'bg-gray-200 text-gray-800',
  transcribing: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  ready: 'bg-emerald-100 text-emerald-800',
  scheduled: 'bg-amber-100 text-amber-800',
  posting: 'bg-amber-100 text-amber-800',
  posted: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export default function ReelsQueuePage() {
  const [secret, setSecret] = useState('');
  const [inputSecret, setInputSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [reels, setReels] = useState<Reel[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<Partial<Reel>>({});

  const load = useCallback(
    async (s: string, f: StatusFilter) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/admin/reels/queue?secret=${encodeURIComponent(s)}&status=${f}`
        );
        if (res.status === 401) {
          setAuthenticated(false);
          sessionStorage.removeItem('admin_secret');
          throw new Error('Senha incorreta');
        }
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = (await res.json()) as { reels: Reel[] };
        setReels(data.reels);
        setAuthenticated(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_secret');
    if (saved) {
      setSecret(saved);
      void load(saved, filter);
    }
  }, [filter, load]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSecret(inputSecret);
    sessionStorage.setItem('admin_secret', inputSecret);
    void load(inputSecret, filter);
  };

  const patch = async (
    id: string,
    body: Record<string, unknown>,
    successMsg?: string
  ) => {
    const res = await fetch(`/api/admin/reels/queue/${id}?secret=${encodeURIComponent(secret)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      alert(data.error ?? `Erro ${res.status}`);
      return;
    }
    if (successMsg) alert(successMsg);
    await load(secret, filter);
    setEditing(null);
    setEditBuffer({});
  };

  const startEdit = (reel: Reel) => {
    setEditing(reel.id);
    setEditBuffer({
      title: reel.title,
      description: reel.description,
      hashtags_instagram: reel.hashtags_instagram,
      hashtags_youtube: reel.hashtags_youtube,
    });
  };

  const saveEdit = (id: string) => {
    void patch(id, { action: 'update_copy', ...editBuffer });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow w-full max-w-md">
          <h1 className="text-xl font-bold mb-4">Admin — Fila de Reels</h1>
          <input
            type="password"
            placeholder="ADMIN_SECRET"
            value={inputSecret}
            onChange={(e) => setInputSecret(e.target.value)}
            className="w-full border p-2 rounded mb-4"
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Fila de Reels</h1>
          <Link href="/admin/reels/upload" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
            + Novo upload
          </Link>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-sm ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-white border'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-500">Carregando...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {reels.length === 0 && !loading && (
          <p className="text-gray-500">Nenhum reel nesse filtro.</p>
        )}

        <div className="space-y-4">
          {reels.map((reel) => (
            <div key={reel.id} className="bg-white rounded shadow p-4">
              <div className="flex items-start justify-between mb-2 gap-4">
                <div className="flex-1 min-w-0">
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded ${STATUS_BADGE[reel.status] ?? 'bg-gray-200'}`}
                  >
                    {reel.status}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(reel.created_at).toLocaleString('pt-BR')}
                  </span>
                  {reel.duration_seconds != null && (
                    <span className="text-xs text-gray-500 ml-2">
                      {reel.duration_seconds}s
                    </span>
                  )}
                </div>
                <code className="text-xs text-gray-400 truncate">{reel.id.slice(0, 8)}</code>
              </div>

              {editing === reel.id ? (
                <div className="space-y-2 mb-2">
                  <input
                    value={(editBuffer.title as string) ?? ''}
                    onChange={(e) => setEditBuffer({ ...editBuffer, title: e.target.value })}
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Título"
                    maxLength={80}
                  />
                  <textarea
                    value={(editBuffer.description as string) ?? ''}
                    onChange={(e) => setEditBuffer({ ...editBuffer, description: e.target.value })}
                    className="w-full border p-2 rounded text-sm"
                    rows={4}
                    placeholder="Descrição"
                  />
                  <input
                    value={(editBuffer.hashtags_instagram ?? []).join(' ')}
                    onChange={(e) =>
                      setEditBuffer({
                        ...editBuffer,
                        hashtags_instagram: e.target.value.split(/\s+/).filter(Boolean),
                      })
                    }
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Hashtags IG (separadas por espaço, sem #)"
                  />
                  <input
                    value={(editBuffer.hashtags_youtube ?? []).join(' ')}
                    onChange={(e) =>
                      setEditBuffer({
                        ...editBuffer,
                        hashtags_youtube: e.target.value.split(/\s+/).filter(Boolean),
                      })
                    }
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Hashtags YT"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(reel.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setEditing(null);
                        setEditBuffer({});
                      }}
                      className="bg-gray-200 px-3 py-1 rounded text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold mb-1">{reel.title ?? '(sem título ainda)'}</h3>
                  {reel.description && (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap mb-2">
                      {reel.description.slice(0, 300)}
                      {reel.description.length > 300 ? '...' : ''}
                    </p>
                  )}
                  {reel.hashtags_instagram && reel.hashtags_instagram.length > 0 && (
                    <p className="text-xs text-blue-600 mb-2">
                      {reel.hashtags_instagram.map((t) => `#${t}`).join(' ')}
                    </p>
                  )}
                </>
              )}

              {reel.error_message && (
                <p className="text-xs text-red-600 mb-2">Erro: {reel.error_message}</p>
              )}

              {reel.scheduled_for && (
                <p className="text-xs text-amber-700 mb-2">
                  Agendado para: {new Date(reel.scheduled_for).toLocaleString('pt-BR')}
                </p>
              )}

              {reel.reels_posts && reel.reels_posts.length > 0 && (
                <div className="text-xs text-gray-600 mb-2 space-y-0.5">
                  {reel.reels_posts.map((p) => (
                    <div key={p.platform}>
                      <span className="font-medium">{p.platform}:</span>{' '}
                      {p.platform_url ? (
                        <a
                          href={p.platform_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          ver post
                        </a>
                      ) : (
                        '—'
                      )}{' '}
                      <span className="text-gray-500">
                        {p.views}👁 {p.likes}❤ {p.comments}💬
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {reel.status === 'ready' && editing !== reel.id && (
                  <>
                    <button
                      onClick={() => startEdit(reel)}
                      className="bg-gray-100 border px-3 py-1 rounded text-sm"
                    >
                      Editar copy
                    </button>
                    <button
                      onClick={() => patch(reel.id, { action: 'schedule' }, 'Agendado!')}
                      className="bg-emerald-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Aprovar e agendar
                    </button>
                    <button
                      onClick={() => patch(reel.id, { action: 'publish_now' }, 'Publicando em 10s')}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Publicar agora
                    </button>
                  </>
                )}
                {reel.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => patch(reel.id, { action: 'cancel' }, 'Cancelado')}
                      className="bg-gray-200 px-3 py-1 rounded text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => patch(reel.id, { action: 'publish_now' }, 'Publicando em 10s')}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Publicar agora
                    </button>
                  </>
                )}
                {reel.status === 'failed' && (
                  <button
                    onClick={() => patch(reel.id, { action: 'schedule' }, 'Reagendado')}
                    className="bg-amber-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Reagendar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
