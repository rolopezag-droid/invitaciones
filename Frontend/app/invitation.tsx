'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, DraftingCompass, LoaderCircle, MapPin, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { eventDetails } from '@/lib/event';

type EventDetails = {
  title: string;
  degree: string;
  start: string | null;
  end: string | null;
  venue: string | null;
  address: string | null;
  mapsUrl: string | null;
};

type Confirmation = { guest: string; alreadyConfirmed: boolean; event: EventDetails };

function Countdown({ target }: { target: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setRemaining(Math.max(0, new Date(target).getTime() - Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  if (remaining === null) return <div className="mt-7 h-20 animate-pulse bg-muted" />;

  const totalSeconds = Math.floor(remaining / 1000);
  const values = [
    { label: 'Días', value: Math.floor(totalSeconds / 86400) },
    { label: 'Horas', value: Math.floor((totalSeconds % 86400) / 3600) },
    { label: 'Min', value: Math.floor((totalSeconds % 3600) / 60) },
    { label: 'Seg', value: totalSeconds % 60 },
  ];

  return (
    <div className="mt-7 grid grid-cols-4 border-y" aria-label="Tiempo restante para el evento">
      {values.map((item) => (
        <div key={item.label} className="border-r px-2 py-4 text-center last:border-r-0">
          <span className="font-heading text-3xl font-semibold tabular-nums sm:text-4xl">{String(item.value).padStart(2, '0')}</span>
          <span className="mt-1 block text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Invitation() {
  const [view, setView] = useState<'intro' | 'form' | 'success'>('intro');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  async function confirmAttendance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = (await response.json()) as Confirmation & { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'No pudimos registrar tu asistencia.');
      setConfirmation(data);
      setView('success');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Ocurrió un error. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative min-h-[45vh] overflow-hidden lg:min-h-screen">
          <img src="/adela-arquitectura.png" alt="Maqueta arquitectónica, planos y herramientas de dibujo sobre una mesa de trabajo" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#18272a]/75 via-transparent to-[#18272a]/10 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#18272a]/18" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white sm:p-10 lg:p-12">
            <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.2em] uppercase">
              <span className="grid size-10 place-items-center border border-white/40 bg-black/10 backdrop-blur"><DraftingCompass className="size-5" /></span>
              Arquitectura · Generación 2022–2026
            </div>
            <span className="hidden text-xs tracking-[0.18em] uppercase sm:block">Proyecto concluido</span>
          </div>
        </div>

        <div className="relative flex items-center overflow-hidden px-6 py-12 sm:px-12 lg:px-14 xl:px-20">
          <div aria-hidden="true" className="blueprint-lines pointer-events-none absolute inset-0 opacity-35" />
          <div className="relative mx-auto w-full max-w-xl">
            {view === 'intro' && (
              <>
                <div className="mb-10 flex items-center gap-4"><span className="h-px w-12 bg-accent" /><p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">Invitación de graduación</p></div>
                <p className="font-heading text-xl italic text-muted-foreground">Con enorme alegría celebramos a</p>
                <h1 className="mt-3 font-heading text-5xl leading-[0.92] font-semibold tracking-[-0.035em] sm:text-6xl xl:text-7xl">Adela<br />Sánchez Dueñas</h1>
                <div className="mt-7 flex items-center gap-3 text-sm font-semibold tracking-[0.16em] text-primary uppercase"><Ruler className="size-4" /> Licenciatura en Arquitectura</div>
                <p className="mt-8 max-w-lg leading-7 text-muted-foreground">Después de tantos planos, ideas y noches de trabajo, llegó el momento de celebrar el comienzo de una nueva etapa. Tu presencia hará este día todavía más especial.</p>
                <Countdown target={eventDetails.start!} />
                <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                  <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 size-5 shrink-0 text-accent" /><span><strong className="block text-foreground">Sábado 12 de diciembre</strong>7:00 p. m.</span></div>
                  <div className="flex items-start gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-accent" /><span><strong className="block text-foreground">{eventDetails.venue}</strong>Tepic, Nayarit</span></div>
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <Button variant="outline" size="lg" className="h-12 rounded-none" nativeButton={false} render={<a href={eventDetails.mapsUrl!} target="_blank" rel="noreferrer" />}><MapPin /> Ver en Google Maps</Button>
                  <Button size="lg" className="h-12 justify-between rounded-none px-5 text-base" onClick={() => setView('form')}>Confirmar asistencia <ArrowRight className="size-5" /></Button>
                </div>
              </>
            )}

            {view === 'form' && (
              <form onSubmit={confirmAttendance}>
                <button type="button" onClick={() => { setView('intro'); setError(''); }} className="mb-10 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Volver a la invitación</button>
                <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">Confirmación</p>
                <h2 className="mt-4 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">Nos encantará contar contigo.</h2>
                <p className="mt-4 leading-7 text-muted-foreground">Escribe tu nombre completo para registrar que nos acompañarás.</p>
                <Field className="mt-8" data-invalid={Boolean(error)}>
                  <FieldLabel htmlFor="guest-name">Nombre completo</FieldLabel>
                  <Input id="guest-name" name="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre y apellidos" className="h-12 rounded-none bg-card px-4" aria-invalid={Boolean(error)} required minLength={3} maxLength={120} autoFocus />
                  <FieldDescription>Sólo guardaremos tu nombre y la fecha de confirmación.</FieldDescription>
                  <FieldError>{error}</FieldError>
                </Field>
                <Button type="submit" size="lg" className="mt-7 h-12 w-full rounded-none text-base" disabled={loading || name.trim().length < 3}>
                  {loading ? <><LoaderCircle className="animate-spin" /> Verificando invitación</> : <>Sí, confirmo mi asistencia <Check /></>}
                </Button>
              </form>
            )}

            {view === 'success' && confirmation && (
              <div aria-live="polite">
                <span className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-7" /></span>
                <p className="mt-8 text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">Asistencia confirmada</p>
                <h2 className="mt-3 font-heading text-4xl font-semibold sm:text-5xl">¡Gracias, {confirmation.guest}!</h2>
                <p className="mt-4 leading-7 text-muted-foreground">{confirmation.alreadyConfirmed ? 'Tu asistencia ya estaba registrada. Aquí tienes nuevamente los detalles.' : 'Tu asistencia quedó registrada. Nos dará mucho gusto celebrar contigo.'}</p>
                {confirmation.event.venue && (
                  <div className="mt-8 border-y py-6">
                    <p className="font-semibold">{confirmation.event.venue}</p>
                    {confirmation.event.address && <p className="mt-1 text-sm text-muted-foreground">{confirmation.event.address}</p>}
                    {confirmation.event.mapsUrl && <a href={confirmation.event.mapsUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 font-semibold text-primary underline underline-offset-4"><MapPin className="size-4" /> Abrir en Google Maps</a>}
                  </div>
                )}
                {!confirmation.event.venue && <p className="mt-8 border-y py-6 text-sm text-muted-foreground">La ubicación y el horario se publicarán próximamente.</p>}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
