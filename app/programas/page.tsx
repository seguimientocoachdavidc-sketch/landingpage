export default function Programas() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <section className="relative py-32 px-6 text-center overflow-hidden">

        <div className="absolute inset-0">
          <img
            src="/Logo letra blanca arriba.jpg"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="text-primary uppercase tracking-[0.3em] text-sm">
            Programas
          </span>

          <h1 className="font-display text-5xl md:text-7xl uppercase mt-6">
            No diseño "rutinas" de gimnasio.<br />
            Construyo resultados a partir de programas de Entrenamiento basado en Ciencia
          </h1>

          <p className="mt-6 text-lg text-muted-foreground">
            Cada programa está diseñado con estructura, seguimiento y progresión. 
            No improvisamos. Ejecutamos de acuerdo con tus condiciones. 
          </p>
        </div>

      </section>

      {/* ENTRENAMIENTO */}
      <section className="py-24 border-t border-border px-6">

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          {/* TEXTO */}
          <div>
            <h2 className="font-display text-4xl md:text-6xl uppercase">
              Programa de entrenamiento Personalizado
            </h2>

            <p className="mt-6 text-muted-foreground leading-relaxed">
              Un sistema de Coaching Estructurado de forma Personalizada basado en la ciencia del Entrenamiento de Fuerza e Hipertrofia:
              Volumen, intensidad, tensión mecanica, sobrecarga progresiva.
            </p>

            <ul className="mt-8 space-y-3 text-muted-foreground">
              <li>✔ Recolección de Información (Historial Fisico y Médico)</li>
              <li>✔ Pruebas físicas diagnosticas</li>
              <li>✔ Programa estructurado por objetivos</li>
              <li>✔ Progresión planificada</li>
              <li>✔ Ajustes según rendimiento</li>
              <li>✔ Seguimiento 1 a 1 constantes</li>
              <li>✔ Aprenderás a Entrenar de forma optima</li>
            </ul>

            <div className="mt-10">
              <div className="text-4xl font-display text-primary">
                $140.000 <span className="text-sm text-muted-foreground">/mes</span>
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
              Estrategia/guía de alimentación
            </h2>

            <p className="mt-6 text-muted-foreground leading-relaxed">
              No es solo "una dieta" genérica. Es una estrategia de alimentación adaptada a tu contexto,
              hábitos y preferencias.
            </p>

            <ul className="mt-8 space-y-3 text-muted-foreground">
              <li>✔ Revisión de habitos alimenticios</li>
              <li>✔ Recolección de Información</li>
              <li>✔ Guía de alimentación adaptada a tus gustos</li>
              <li>✔ Ajustes constantes</li>
              <li>✔ Seguimientos continuo</li>
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
              <li>✔ Toda la guía de alimentación</li>
              <li>✔ Seguimiento completo</li>
              <li>✔ Ajustes constantes</li>
              <li>✔ Tips y recomendaciones Avanzadas</li>
            </ul>

            <div className="mt-10">

              <div className="text-sm line-through text-muted-foreground">
                $260.000
              </div>

              <div className="text-5xl font-display text-primary">
                $210.000 (20% off) <span className="text-sm text-muted-foreground">/mes</span>
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
          Quiero ayudarte a que lo hagas de forma correcta…<br />
          Avancemos a un nuevo nivel.
        </h2>

        <a
          href="/asesoria"
          className="inline-block mt-10 bg-primary text-primary-foreground px-8 py-4 font-bold uppercase"
        >
          Aplicar a asesoría aquí
        </a>

      </section>

    </main>
  )
}
