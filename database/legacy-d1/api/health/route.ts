import { ensureDatabase } from '@/db';

export async function GET() {
  try {
    const d1 = await ensureDatabase();
    await d1.prepare('SELECT 1 AS ok').first();
    return Response.json({ ok: true, database: 'connected' });
  } catch (error) {
    console.error('Health check failed', error);
    return Response.json({ ok: false, database: 'unavailable' }, { status: 503 });
  }
}
