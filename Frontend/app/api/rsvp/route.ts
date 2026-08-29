import { env } from 'cloudflare:workers';
import { eventDetails } from '@/lib/event';

function normalizeName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

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
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS rsvp_rate_limits (
      key TEXT PRIMARY KEY,
      attempts INTEGER NOT NULL,
      reset_at INTEGER NOT NULL
    )
  `).run();
}

async function checkRateLimit(request: Request) {
  const identifier = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ?? 'local';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(identifier));
  const key = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  const now = Math.floor(Date.now() / 1000);
  const windowSeconds = 10 * 60;
  const current = await env.DB.prepare('SELECT attempts, reset_at FROM rsvp_rate_limits WHERE key = ?').bind(key).first<{ attempts: number; reset_at: number }>();
  if (!current || current.reset_at <= now) {
    await env.DB.prepare('INSERT INTO rsvp_rate_limits (key, attempts, reset_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET attempts = 1, reset_at = excluded.reset_at').bind(key, now + windowSeconds).run();
    return true;
  }
  if (current.attempts >= 10) return false;
  await env.DB.prepare('UPDATE rsvp_rate_limits SET attempts = attempts + 1 WHERE key = ?').bind(key).run();
  return true;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('Content-Length') ?? 0);
  if (contentLength > 2048) return Response.json({ error: 'Solicitud demasiado grande.' }, { status: 413 });
  await ensureDatabase();
  if (!(await checkRateLimit(request))) {
    return Response.json({ error: 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.' }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as { name?: unknown } | null;
  const name = typeof body?.name === 'string' ? body.name.trim() : '';

  if (name.length < 3 || name.length > 120) {
    return Response.json({ error: 'Escribe tu nombre completo.' }, { status: 400 });
  }

  const normalizedName = normalizeName(name);
  const existingGuest = await env.DB.prepare('SELECT id, name, confirmed_at FROM guests WHERE normalized_name = ? LIMIT 1')
    .bind(normalizedName)
    .first<{ id: string; name: string; confirmed_at: string | null }>();

  if (existingGuest) {
    return Response.json({
      guest: existingGuest.name,
      confirmedAt: existingGuest.confirmed_at,
      alreadyConfirmed: true,
      event: eventDetails,
    });
  }

  const confirmedAt = new Date().toISOString();
  await env.DB.prepare('INSERT INTO guests (id, name, normalized_name, confirmed_at) VALUES (?, ?, ?, ?)')
    .bind(crypto.randomUUID(), name, normalizedName, confirmedAt)
    .run();

  return Response.json({ guest: name, confirmedAt, alreadyConfirmed: false, event: eventDetails });
}
