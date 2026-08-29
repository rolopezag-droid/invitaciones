import { env } from 'cloudflare:workers';

const COOKIE_NAME = 'adela_admin_session';
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function bytesToHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function secureEqual(left: string, right: string) {
  const encoder = new TextEncoder();
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(left)),
    crypto.subtle.digest('SHA-256', encoder.encode(right)),
  ]);
  const leftBytes = new Uint8Array(leftHash);
  const rightBytes = new Uint8Array(rightHash);
  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) difference |= leftBytes[index] ^ rightBytes[index];
  return difference === 0;
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.ADMIN_SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return bytesToHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
}

export function adminSecretsConfigured() {
  return Boolean(env.ADMIN_ACCESS_KEY?.length >= 24 && env.ADMIN_SESSION_SECRET?.length >= 32);
}

export async function validateAccessKey(candidate: string) {
  return adminSecretsConfigured() && candidate.length <= 256 && secureEqual(candidate, env.ADMIN_ACCESS_KEY);
}

export async function createAdminSession(request: Request) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = String(expires);
  const token = `${payload}.${await sign(payload)}`;
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure}`;
}

export async function hasAdminSession(request: Request) {
  if (!adminSecretsConfigured()) return false;
  const cookie = request.headers.get('Cookie') ?? '';
  const token = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!token) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature || Number(expires) <= Math.floor(Date.now() / 1000)) return false;
  return secureEqual(signature, await sign(expires));
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get('Origin');
  return Boolean(origin && origin === new URL(request.url).origin);
}
