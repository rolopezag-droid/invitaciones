'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { CalendarCheck, Copy, Download, LoaderCircle, QrCode, RefreshCw, Search, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Guest = { id: string; name: string; confirmedAt: string };

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function AdminDashboard() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publicUrl, setPublicUrl] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [activating, setActivating] = useState(true);

  const loadGuests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/guests', { cache: 'no-store' });
      const data = (await response.json()) as { guests?: Guest[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? 'No pudimos cargar las confirmaciones.');
      setGuests(data.guests ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos cargar las confirmaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const url = window.location.origin;
    setPublicUrl(url);
    QRCode.toDataURL(url, { width: 420, margin: 2, color: { dark: '#123f43', light: '#fffdf8' } }).then(setQrUrl);
    const accessKey = new URLSearchParams(window.location.search).get('access');
    async function activateAndLoad() {
      if (accessKey) {
        const response = await fetch('/api/admin/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessKey }),
        });
        window.history.replaceState(null, '', '/admin');
        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          setError(data.error ?? 'El enlace administrativo no es válido.');
          setLoading(false);
          setActivating(false);
          return;
        }
      }
      setActivating(false);
      await loadGuests();
    }
    activateAndLoad();
  }, [loadGuests]);

  const filteredGuests = useMemo(() => {
    const normalizedQuery = query.toLocaleLowerCase('es-MX').trim();
    return normalizedQuery ? guests.filter((guest) => guest.name.toLocaleLowerCase('es-MX').includes(normalizedQuery)) : guests;
  }, [guests, query]);

  async function removeGuest(guest: Guest) {
    if (!window.confirm(`¿Eliminar la confirmación de ${guest.name}?`)) return;
    const response = await fetch('/api/admin/guests', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: guest.id }),
    });
    if (response.ok) setGuests((current) => current.filter((item) => item.id !== guest.id));
  }

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function shareOrDownloadQr() {
    if (!qrUrl) return;
    const blob = await (await fetch(qrUrl)).blob();
    const file = new File([blob], 'qr-invitacion-adela.png', { type: 'image/png' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Invitación de graduación de Adela',
        text: 'Escanea este código para abrir la invitación.',
      }).catch((caught) => {
        if (caught instanceof DOMException && caught.name === 'AbortError') return;
        throw caught;
      });
      return;
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  function exportText() {
    const lines = [
      'CONFIRMACIONES · GRADUACIÓN DE ADELA',
      '======================================',
      '',
      ...guests.map((guest, index) => `${index + 1}. ${guest.name}\n   Confirmó: ${formatDate(guest.confirmedAt)}`),
      '',
      `Total de confirmados: ${guests.length}`,
    ];
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/plain;charset=utf-8' }));
    link.download = 'confirmaciones-adela.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-7 lg:px-10 lg:py-9">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">Graduación de Adela</p>
            <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">Panel de confirmaciones</h1>
            <p className="mt-2 text-sm text-muted-foreground">Acceso privado · la sesión administrativa se protege durante siete días.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-10 flex-1 sm:flex-none" onClick={loadGuests} disabled={loading}><RefreshCw className={loading ? 'animate-spin' : ''} /> Actualizar</Button>
            <Button className="h-10 flex-1 sm:flex-none" onClick={exportText} disabled={!guests.length}><Download /> Descargar lista</Button>
          </div>
        </header>

        <section className="mt-7 grid gap-4 md:grid-cols-3">
          <article className="border bg-card p-5 md:col-span-1">
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-muted-foreground">Confirmados</span><Users className="size-5 text-accent" /></div>
            <p className="mt-5 font-heading text-5xl font-semibold">{guests.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">Personas registradas hasta ahora</p>
          </article>
          <article className="border bg-card p-5 md:col-span-2">
            <div className="flex items-center gap-2 text-sm font-medium"><QrCode className="size-5 text-accent" /> Enlace para invitados</div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Input readOnly value={publicUrl} className="h-10 rounded-none bg-background" aria-label="Enlace público" />
              <Button variant="outline" className="h-10 rounded-none" onClick={copyLink}><Copy /> {copied ? 'Copiado' : 'Copiar enlace'}</Button>
            </div>
          </article>
        </section>

        <section className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre" className="h-11 rounded-none bg-card pl-10" />
            </div>

            {error && <div role="alert" className="mt-4 border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}
            {(loading || activating) && <div className="mt-8 flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" /> {activating ? 'Verificando acceso' : 'Cargando confirmaciones'}</div>}
            {!loading && !filteredGuests.length && <div className="mt-8 border bg-card px-6 py-16 text-center"><CalendarCheck className="mx-auto size-9 text-muted-foreground" /><p className="mt-4 font-semibold">{query ? 'No encontramos coincidencias' : 'Todavía no hay confirmaciones'}</p><p className="mt-1 text-sm text-muted-foreground">{query ? 'Prueba con otra parte del nombre.' : 'Los nombres aparecerán aquí automáticamente.'}</p></div>}

            {!loading && filteredGuests.length > 0 && (
              <>
                <div className="mt-5 grid gap-3 md:hidden">
                  {filteredGuests.map((guest) => (
                    <article key={guest.id} className="border bg-card p-4">
                      <div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{guest.name}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(guest.confirmedAt)}</p></div><Button variant="ghost" size="icon" aria-label={`Eliminar a ${guest.name}`} onClick={() => removeGuest(guest)}><Trash2 className="text-destructive" /></Button></div>
                    </article>
                  ))}
                </div>
                <div className="mt-5 hidden overflow-hidden border bg-card md:block">
                  <table className="w-full text-left text-sm"><thead className="border-b bg-muted/60 text-xs tracking-wide text-muted-foreground uppercase"><tr><th className="px-5 py-3 font-semibold">Invitado</th><th className="px-5 py-3 font-semibold">Confirmación</th><th className="w-16 px-5 py-3"><span className="sr-only">Acciones</span></th></tr></thead><tbody className="divide-y">{filteredGuests.map((guest) => <tr key={guest.id}><td className="px-5 py-4 font-medium">{guest.name}</td><td className="px-5 py-4 text-muted-foreground">{formatDate(guest.confirmedAt)}</td><td className="px-5 py-2"><Button variant="ghost" size="icon" aria-label={`Eliminar a ${guest.name}`} onClick={() => removeGuest(guest)}><Trash2 className="text-destructive" /></Button></td></tr>)}</tbody></table>
                </div>
              </>
            )}
          </div>

          <aside className="border bg-card p-5 lg:sticky lg:top-6 lg:self-start">
            <p className="text-sm font-semibold">Código QR</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Descárgalo y compártelo con los invitados para abrir la invitación pública.</p>
            {qrUrl && <img src={qrUrl} alt="Código QR del enlace de invitación" className="mx-auto mt-5 aspect-square w-full max-w-52" />}
            {qrUrl && <Button type="button" variant="outline" className="mt-4 h-10 w-full rounded-none" onClick={shareOrDownloadQr}><Download className="size-4" /> Guardar o compartir QR</Button>}
          </aside>
        </section>
      </div>
    </main>
  );
}
