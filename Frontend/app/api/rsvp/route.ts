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
  const guest = await env.DB.prepare('SELECT id, name, confirmed_at FROM guests WHERE normalized_name = ? LIMIT 1')
    .bind(normalizedName)
    .first<{ id: string; name: string; confirmed_at: string | null }>();

  if (!guest) {
    return Response.json(
      { error: 'No encontramos ese nombre en la lista. Revisa cómo está escrito o comunícate con los anfitriones.' },
      { status: 404 },
    );
  }

  const confirmedAt = guest.confirmed_at ?? new Date().toISOString();
  if (!guest.confirmed_at) {
    await env.DB.prepare('UPDATE guests SET confirmed_at = ? WHERE id = ?').bind(confirmedAt, guest.id).run();
  }

  return Response.json({ guest: guest.name, confirmedAt, alreadyConfirmed: Boolean(guest.confirmed_at), event: eventDetails });
}
