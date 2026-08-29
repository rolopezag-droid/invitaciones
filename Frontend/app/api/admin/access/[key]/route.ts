import {
  createAdminSessionCookie,
  createAdminSessionToken,
  validateAccessKey,
} from '@/lib/admin-auth';

type RouteContext = { params: Promise<{ key: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { key } = await context.params;
  if (!(await validateAccessKey(key))) {
    return Response.json({ error: 'El enlace administrativo no es válido.' }, { status: 401 });
  }

  const token = await createAdminSessionToken();
  const destination = new URL(`/admin#session=${encodeURIComponent(token)}`, request.url);
  return new Response(null, {
    status: 302,
    headers: {
      Location: destination.toString(),
      'Set-Cookie': createAdminSessionCookie(request, token),
      'Cache-Control': 'no-store',
    },
  });
}
