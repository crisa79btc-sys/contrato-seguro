/**
 * Painel admin — upload de vídeo cru do iPhone 16 para o pipeline de Reels.
 *
 * Fluxo:
 *   1. Usuário cola ADMIN_SECRET (salvo em sessionStorage).
 *   2. Seleciona/drag vídeo .mp4 ou .mov (até 500MB).
 *   3. Opcional: tema/contexto em texto livre (ajuda o Claude no título/hashtags).
 *   4. POST multipart → /api/admin/reels/upload → retorna reel criado.
 *   5. Link para /admin/reels/queue para acompanhar o processamento.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ReelsUploadPage() {
  const [secret, setSecret] = useState('');
  const [inputSecret, setInputSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [userContext, setUserContext] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ id: string; status: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_secret');
    if (saved) {
      setSecret(saved);
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSecret(inputSecret);
    sessionStorage.setItem('admin_secret', inputSecret);
    setAuthenticated(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (f.size > 500 * 1024 * 1024) {
      setError('Arquivo maior que 500MB');
      return;
    }
    if (!['video/mp4', 'video/quicktime'].includes(f.type)) {
      setError('Formato inválido: use .mp4 ou .mov');
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    const form = new FormData();
    form.append('file', file);
    if (userContext.trim()) form.append('userContext', userContext.trim());

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/admin/reels/upload?secret=${encodeURIComponent(secret)}`);

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          setProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      };

      xhr.onload = () => {
        setUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText) as { reel: { id: string; status: string } };
          setResult({ id: data.reel.id, status: data.reel.status });
          setFile(null);
          setUserContext('');
        } else {
          try {
            const data = JSON.parse(xhr.responseText) as { error?: string };
            setError(data.error ?? `Erro ${xhr.status}`);
          } catch {
            setError(`Erro ${xhr.status}`);
          }
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        setError('Erro de rede');
      };

      xhr.send(form);
    } catch (err) {
      setUploading(false);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow w-full max-w-md">
          <h1 className="text-xl font-bold mb-4">Admin — Upload de Reel</h1>
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
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Upload de Reel</h1>
          <Link href="/admin/reels/queue" className="text-blue-600 hover:underline text-sm">
            Ver fila →
          </Link>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Grave no iPhone (30-90s, vertical), envie aqui. A IA transcreve, corta,
          formata 9:16, coloca legendas, trilha e thumbnail. Depois você revisa
          em <Link href="/admin/reels/queue" className="text-blue-600">/admin/reels/queue</Link>.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Vídeo (.mp4 ou .mov, até 500MB)</label>
          <input
            type="file"
            accept="video/mp4,video/quicktime"
            onChange={handleFileChange}
            disabled={uploading}
            className="w-full border p-2 rounded"
          />
          {file && (
            <p className="text-xs text-gray-500 mt-1">
              {file.name} — {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Tema/contexto (opcional — ajuda a IA)
          </label>
          <textarea
            value={userContext}
            onChange={(e) => setUserContext(e.target.value)}
            disabled={uploading}
            placeholder="Ex.: multa abusiva em locação residencial"
            rows={3}
            className="w-full border p-2 rounded resize-none"
            maxLength={500}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {uploading && (
          <div className="mb-4">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Upload {progress}%</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded mb-4 text-sm">
            ✓ Vídeo enviado! ID: <code className="font-mono">{result.id}</code><br />
            Status atual: {result.status}. O processamento leva ~3 minutos.{' '}
            <Link href="/admin/reels/queue" className="underline">
              Acompanhe na fila
            </Link>.
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-600 text-white p-3 rounded font-semibold disabled:bg-gray-300"
        >
          {uploading ? 'Enviando...' : 'Enviar e processar'}
        </button>
      </div>
    </div>
  );
}
