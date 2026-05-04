export default function Programas() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <section className="relative py-32 px-6 text-center overflow-hidden">

        <div className="absolute inset-0">
          <img
            src="/Logo Letra negra.jpg"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="text-primary uppercase tracking-[0.3em] text-sm">
            Programas
          </span>

          <h1 className="font-display text-5xl md:text-7xl uppercase mt-6">
            No vendes rutinas.<br />
            Construyes resultados.
          </h1>

          <p className="mt-6 text-lg text-muted-foreground">
            Cada programa está diseñado con estructura, seguimiento y progresión real.
            Aquí no improvisas. Ejecutas.
          </p>
        </div>

      </section>

      {/* ENTRENAMIENTO */}
      <section className="py-24 border-t border-border px-6">

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          {/* TEXTO */}
          <div>
            <h2 className="font-display text-4xl md:text-6xl uppercase">
              Programa de entrenamiento
            </h2>

            <p className="mt-6 text-muted-foreground leading-relaxed">
              Un sistema estructurado basado en variables reales de entrenamiento:
              volumen, intensidad y progresión.
            </p>

            <ul className="mt-8 space-y-3 text-muted-foreground">
              <li>✔ Plan completamente personalizado</li>
              <li>✔ Rutina estructurada por objetivos</li>
              <li>✔ Progresión semanal planificada</li>
              <li>✔ Ajustes según rendimiento</li>
              <li>✔ Seguimiento 1 a 1</li>
            </ul>

            <div className="mt-10">
              <div className="text-4xl font-display text-primary">
                $135.000 <span className="text-sm text-muted-foreground">/mes</span>
              </div>

              <a
                href="/asesoria"
                className="inline-block mt-6 bg-primary text-primary-foreground px-8 py-4 font-bold uppercase"
              >
                Aplicar
              </a>
            </div>
          </div>

          {/* IMAGEN */}
          <div>
            <img
              src="/Entrenando_1.jpeg"
              className="w-full border border-border"
            />
          </div>

        </div>

      </section>

      {/* ALIMENTACIÓN */}
      <section className="py-24 border-t border-border px-6">

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          {/* IMAGEN */}
          <div className="order-2 md:order-1">
            <img
              src="/comida.jpg"
              className="w-full border border-border"
            />
          </div>

          {/* TEXTO */}
          <div className="order-1 md:order-2">
            <h2 className="font-display text-4xl md:text-6xl uppercase">
              Plan de alimentación
            </h2>

            <p className="mt-6 text-muted-foreground leading-relaxed">
              No es una dieta genérica. Es un sistema adaptado a tu contexto,
              hábitos y preferencias reales.
            </p>

            <ul className="mt-8 space-y-3 text-muted-foreground">
              <li>✔ Evaluación nutricional completa</li>
              <li>✔ Plan adaptado a tus gustos</li>
              <li>✔ Ajustes constantes</li>
              <li>✔ Educación nutricional real</li>
              <li>✔ Seguimiento continuo</li>
            </ul>

            <div className="mt-10">
              <div className="text-4xl font-display text-primary">
                $125.000 <span className="text-sm text-muted-foreground">/mes</span>
              </div>

              <a
                href="/nutricion-cuestionario"
                className="inline-block mt-6 border border-border px-8 py-4 font-semibold uppercase"
              >
                Iniciar evaluación
              </a>
            </div>
          </div>

        </div>

      </section>

      {/* DUO */}
      <section className="py-32 border-t border-border px-6 text-center relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />

        <div className="relative max-w-4xl mx-auto">

          <span className="text-primary uppercase tracking-[0.3em] text-sm">
            Programa completo
          </span>

          <h2 className="font-display text-5xl md:text-7xl uppercase mt-6">
            Entrena y come<br />
            como un sistema.
          </h2>

          <p className="mt-6 text-lg text-muted-foreground">
            El progreso real ocurre cuando entrenamiento y nutrición trabajan juntos.
          </p>

          <div className="mt-12 border border-primary p-10">

            <div className="text-sm uppercase text-primary mb-4">
              Recomendado
            </div>

            <h3 className="font-display text-3xl uppercase">
              Programa Duo
            </h3>

            <p className="mt-4 text-muted-foreground">
              Entrenamiento + alimentación integrados en un solo sistema.
            </p>

            <ul className="mt-6 space-y-2 text-muted-foreground">
              <li>✔ Todo el programa de entrenamiento</li>
              <li>✔ Todo el plan de alimentación</li>
              <li>✔ Seguimiento completo</li>
              <li>✔ Ajustes constantes</li>
            </ul>

            <div className="mt-10">

              <div className="text-sm line-through text-muted-foreground">
                $260.000
              </div>

              <div className="text-5xl font-display text-primary">
                $210.000 <span className="text-sm text-muted-foreground">/mes</span>
              </div>

              <a
                href="https://wa.me/573243747367?text=Hola Coach David, quiero el programa DUO."
                target="_blank"
                className="inline-block mt-6 bg-primary text-primary-foreground px-8 py-4 font-bold uppercase"
              >
                Empezar ahora
              </a>

            </div>

          </div>

        </div>

      </section>

      {/* CTA FINAL */}
      <section className="py-32 border-t border-border text-center px-6">

        <h2 className="font-display text-4xl md:text-6xl uppercase">
          Puedes seguir improvisando…<br />
          o empezar a hacerlo bien.
        </h2>

        <a
          href="/asesoria"
          className="inline-block mt-10 bg-primary text-primary-foreground px-8 py-4 font-bold uppercase"
        >
          Aplicar a asesoría
        </a>

      </section>

    </main>
  )
}
