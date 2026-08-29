import { env } from 'cloudflare:workers';
import { hasAdminSession, isSameOrigin } from '@/lib/admin-auth';

async function ensureDatabase() {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      normalized_name TEXT NOT NULL UNIQUE,
      confirmed_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
  await env.DB.prepare('CREATE UNIQUE INDEX IF NOT EXISTS guests_normalized_name_unique ON guests (normalized_name)').run();
}

async function denyUnauthorized(request: Request) {
  if (await hasAdminSession(request)) return null;
  return Response.json({ error: 'Abre el enlace privado de Adela para acceder.' }, { status: 401 });
}

export async function GET(request: Request) {
  const denied = await denyUnauthorized(request);
  if (denied) return denied;
  await ensureDatabase();
  const { results } = await env.DB.prepare(
    'SELECT id, name, confirmed_at AS confirmedAt FROM guests WHERE confirmed_at IS NOT NULL ORDER BY confirmed_at DESC',
  ).all<{ id: string; name: string; confirmedAt: string }>();
  return Response.json({ guests: results });
}

export async function DELETE(request: Request) {
  const denied = await denyUnauthorized(request);
  if (denied) return denied;
  if (!isSameOrigin(request)) return Response.json({ error: 'Solicitud no permitida.' }, { status: 403 });
  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  if (typeof body?.id !== 'string' || !body.id) {
    return Response.json({ error: 'Registro inválido.' }, { status: 400 });
  }
  await ensureDatabase();
  await env.DB.prepare('DELETE FROM guests WHERE id = ?').bind(body.id).run();
  return Response.json({ ok: true });
}
