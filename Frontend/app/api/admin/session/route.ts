import { createAdminSessionCookie, createAdminSessionToken, isSameOrigin, validateAccessKey } from '@/lib/admin-auth';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: 'Solicitud no permitida.' }, { status: 403 });
  const contentLength = Number(request.headers.get('Content-Length') ?? 0);
  if (contentLength > 1024) return Response.json({ error: 'Solicitud demasiado grande.' }, { status: 413 });
  const body = (await request.json().catch(() => null)) as { accessKey?: unknown } | null;
  const accessKey = typeof body?.accessKey === 'string' ? body.accessKey : '';
  if (!(await validateAccessKey(accessKey))) {
    return Response.json({ error: 'El enlace administrativo no es válido o expiró.' }, { status: 401 });
  }
  const token = await createAdminSessionToken();
  return Response.json(
    { ok: true, token },
    { headers: { 'Set-Cookie': createAdminSessionCookie(request, token), 'Cache-Control': 'no-store' } },
  );
}
