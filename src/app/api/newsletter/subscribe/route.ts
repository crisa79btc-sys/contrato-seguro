import { NextRequest, NextResponse } from 'next/server';
import { addEmailToList } from '@/lib/social/brevo-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; firstName?: string };
    const { email, firstName } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    await addEmailToList({ email: email.toLowerCase().trim(), firstName });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true }); // silent fail — não expor erros internos
  }
}
