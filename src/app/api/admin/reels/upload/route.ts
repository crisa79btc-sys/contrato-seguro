/**
 * POST /api/admin/reels/upload
 *
 * Recebe um vídeo (multipart/form-data) gravado pelo usuário no iPhone 16,
 * faz upload no bucket reels-raw e dispara o pipeline em background
 * (transcribe → analyze → process video → thumbnail → status=ready).
 *
 * Auth: ADMIN_SECRET via ?secret= ou header Authorization: Bearer.
 *
 * Form fields:
 *   - file: arquivo .mp4 ou .mov (obrigatório)
 *   - userContext: string opcional — dá contexto ao Claude ("tema: multa de aluguel")
 */

import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { getAdminClient } from '@/lib/db/supabase';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_SIZE_BYTES = 500 * 1024 * 1024; // 500MB
const ALLOWED_MIME = ['video/mp4', 'video/quicktime']; // .mp4, .mov

function authorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${secret}`) return true;
  return false;
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'multipart/form-data inválido' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Campo "file" ausente' }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json(
      { error: `MIME não suportado: ${file.type}. Use mp4 ou mov.` },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Arquivo maior que 500MB' }, { status: 413 });
  }

  const userContext = form.get('userContext');

  const admin = getAdminClient();
  const reelId = randomUUID();
  const ext = file.type === 'video/quicktime' ? 'mov' : 'mp4';
  const rawPath = `raw/${reelId}.${ext}`;

  // Upload para Storage
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await admin.storage
    .from('reels-raw')
    .upload(rawPath, new Uint8Array(arrayBuffer), {
      contentType: file.type,
      upsert: false,
    });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Insere na fila
  const { data: reel, error: insertError } = await admin
    .from('reels_queue')
    .insert({
      id: reelId,
      raw_storage_path: rawPath,
      raw_size_bytes: file.size,
      user_context: typeof userContext === 'string' ? userContext : null,
      status: 'uploaded',
    })
    .select()
    .single();
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Dispara pipeline em background
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://contrato-seguro-inky.vercel.app';

  waitUntil(
    (async () => {
      try {
        await fetch(`${baseUrl}/api/reels/process/${reelId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.ADMIN_SECRET ?? ''}` },
        });
      } catch (err) {
        console.error(`[reels/upload] Falha ao disparar process/${reelId}:`, err);
      }
    })()
  );

  return NextResponse.json({ reel }, { status: 202 });
}
