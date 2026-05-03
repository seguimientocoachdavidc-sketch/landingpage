export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* FONDO */}
        <div className="absolute inset-0">
          <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* CONTENIDO */}
        <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">

          <span className="text-primary uppercase tracking-widest text-sm">
            Entrenamiento basado en evidencia
          </span>

          <h1 className="font-display text-5xl md:text-7xl uppercase leading-tight mt-6">
            Entrena con <span className="text-gradient">estructura</span>,<br />
            no con intuición.
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Programación de hipertrofia basada en ciencia, aplicada en la práctica real.
            Sin improvisación. Sin rutinas genéricas.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/asesoria" className="bg-primary text-primary-foreground px-8 py-4 font-bold uppercase">
              Ver asesoría
            </a>

            <a href="/blog" className="border border-border px-8 py-4 font-semibold uppercase">
              Ver contenido
            </a>
          </div>

        </div>
      </section>

      {/* SISTEMA */}
      <section className="py-24 border-t border-border px-6 text-center">
        <h2 className="font-display text-4xl md:text-6xl uppercase">
          Un sistema. No una rutina.
        </h2>

        <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
          Entrenar no es hacer ejercicios al azar. Es manipular variables para generar adaptación.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">

          <div className="p-8 border border-border bg-card">
            <h3 className="text-xl font-bold">Volumen</h3>
            <p className="mt-2 text-muted-foreground">
              Trabajo efectivo necesario para estimular crecimiento muscular.
            </p>
          </div>

          <div className="p-8 border border-border bg-card">
            <h3 className="text-xl font-bold">Intensidad</h3>
            <p className="mt-2 text-muted-foreground">
              Proximidad al fallo y calidad del estímulo.
            </p>
          </div>

          <div className="p-8 border border-border bg-card">
            <h3 className="text-xl font-bold">Progresión</h3>
            <p className="mt-2 text-muted-foreground">
              Sin sobrecarga progresiva, no hay resultados.
            </p>
          </div>

        </div>
      </section>

      {/* FILTRO */}
      <section className="py-24 border-t border-border px-6 text-center">
        <h2 className="font-display text-4xl md:text-6xl uppercase">
          Esto no es para todos.
        </h2>

        <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
          Si buscas atajos, este no es tu lugar.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto text-sm text-muted-foreground">

          <div className="p-6 border border-border">
            No improvisación
          </div>

          <div className="p-6 border border-border">
            Sin progresión = sin resultados
          </div>

          <div className="p-6 border border-border">
            Sin estructura no hay control
          </div>

        </div>
      </section>

      {/* SERVICIOS */}
      <section className="py-24 border-t border-border px-6">

        <div className="max-w-6xl mx-auto">

          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display text-4xl md:text-6xl uppercase">
              Servicios
            </h2>

            <p className="mt-6 text-muted-foreground">
              Elige cómo quieres entrenar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">

            <div className="p-8 border border-border bg-card">
              <h3 className="font-display text-2xl uppercase">
                Entrenamiento
              </h3>

              <p className="mt-4 text-muted-foreground">
                Programación estructurada para hipertrofia.
              </p>
            </div>

            <div className="p-8 border border-border bg-card">
              <h3 className="font-display text-2xl uppercase">
                Alimentación
              </h3>

              <p className="mt-4 text-muted-foreground">
                Plan nutricional adaptado a tu contexto.
              </p>
            </div>

            <div className="p-8 border border-primary bg-card">
              <h3 className="font-display text-2xl uppercase">
                Programa Duo
              </h3>

              <p className="mt-4 text-muted-foreground">
                Entrenamiento + nutrición + seguimiento completo.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CONTENIDO */}
      <section className="py-24 border-t border-border px-6 text-center">

        <h2 className="font-display text-4xl md:text-6xl uppercase">
          Contenido basado en ciencia
        </h2>

        <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
          Aprende cómo entrenar correctamente.
        </p>

        <a
          href="/blog"
          className="inline-block mt-10 bg-primary text-primary-foreground px-8 py-4 font-bold uppercase"
        >
          Ir al blog
        </a>

      </section>

      {/* CTA FINAL */}
      <section className="py-24 border-t border-border text-center px-6">

        <h2 className="font-display text-4xl md:text-6xl uppercase">
          Entrenar bien no es opcional.
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
