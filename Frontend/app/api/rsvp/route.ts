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
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { name?: unknown } | null;
  const name = typeof body?.name === 'string' ? body.name.trim() : '';

  if (name.length < 3 || name.length > 120) {
    return Response.json({ error: 'Escribe tu nombre completo.' }, { status: 400 });
  }

  await ensureDatabase();
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
