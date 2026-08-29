import { CalendarDays, GraduationCap, MapPin, Sparkles } from 'lucide-react';

export default function Invitation() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-5 py-8 text-foreground sm:px-8 sm:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 invitation-grid opacity-40" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-8 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-accent/35 blur-3xl" />

      <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/60 bg-card/90 shadow-[0_32px_100px_rgba(45,29,20,0.14)] backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative flex flex-col justify-between overflow-hidden bg-primary px-7 py-8 text-primary-foreground sm:px-12 sm:py-11">
          <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/15" />
          <div aria-hidden="true" className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/15" />
          <div className="relative flex items-center gap-3 text-sm font-medium tracking-[0.18em] text-white/80 uppercase">
            <span className="grid size-10 place-items-center rounded-full border border-white/20 bg-white/10"><GraduationCap className="size-5" /></span>
            Mi graduación
          </div>
          <div className="relative my-14 max-w-xl lg:my-8">
            <p className="mb-5 flex items-center gap-2 font-medium text-white/70"><Sparkles className="size-4" /> Un día que quiero compartir contigo</p>
            <h1 className="font-heading text-5xl leading-[0.96] font-semibold tracking-[-0.045em] text-balance sm:text-6xl xl:text-7xl">¡Lo logramos!</h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-white/78 sm:text-lg">Gracias por ser parte de mi historia. Me dará mucha alegría celebrar este logro contigo.</p>
          </div>
          <div className="relative grid gap-4 border-t border-white/15 pt-6 text-sm text-white/75 sm:grid-cols-2">
            <div className="flex items-center gap-3"><CalendarDays className="size-5 text-accent" /><span>Fecha por confirmar</span></div>
            <div className="flex items-center gap-3"><MapPin className="size-5 text-accent" /><span>Lugar por confirmar</span></div>
          </div>
        </div>
        <div className="flex items-center px-7 py-10 sm:px-12 lg:px-14">
          <div className="w-full">
            <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold tracking-[0.12em] text-accent-foreground uppercase">Invitación personal</span>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">¿Nos acompañas a celebrar?</h2>
            <p className="mt-4 max-w-md leading-7 text-muted-foreground">Confirma tu asistencia para reservar tu lugar. El registro sólo tomará un momento.</p>
            <div className="mt-8 rounded-2xl border bg-muted/45 p-5">
              <p className="text-sm font-medium">Tu respuesta nos ayudará a preparar cada detalle.</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Podrás indicar si asistirás, agregar acompañantes y dejarnos cualquier observación importante.</p>
            </div>
            <button type="button" className="mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Confirmar mi asistencia <span aria-hidden="true">→</span></button>
            <p className="mt-4 text-center text-xs text-muted-foreground">Con cariño, Roberto López Águila</p>
          </div>
        </div>
      </section>
    </main>
  );
}
