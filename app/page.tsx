export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <section className="py-32 text-center px-6">
        <h1 className="font-display text-5xl md:text-7xl uppercase leading-tight">
          Entrena con<br />
          <span className="text-gradient">estructura</span>, no<br />
          con intuición.
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Programación basada en ciencia para desarrollar masa muscular con control real de volumen, intensidad y progresión.
        </p>

        <a
          href="/asesoria"
          className="inline-block mt-10 bg-primary text-primary-foreground px-8 py-4 font-bold uppercase"
        >
          Ver asesoría
        </a>
      </section>

      {/* FILTRO */}
      <section className="py-24 border-t border-border text-center px-6">
        <h2 className="font-display text-4xl md:text-6xl uppercase">
          Esto no es para todos.
        </h2>

        <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
          Si buscas rutinas genéricas o entrenar sin estructura, este no es tu lugar.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
          <div className="p-6 border border-border">
            No improvisación
          </div>
          <div className="p-6 border border-border">
            No entrenamiento sin progresión
          </div>
          <div className="p-6 border border-border">
            No programas sin estructura
          </div>
        </div>
      </section>

      {/* MÉTODO */}
      <section className="py-24 border-t border-border text-center px-6">
        <h2 className="font-display text-4xl md:text-6xl uppercase">
          Un sistema, no una rutina.
        </h2>

        <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
          El entrenamiento efectivo se basa en controlar variables. No en adivinar.
        </p>

        <div className="grid md:grid-cols-3 gap-10 mt-16 max-w-5xl mx-auto">
          <div>
            <h3 className="font-display text-xl uppercase">Volumen</h3>
            <p className="text-muted-foreground mt-2">
              Cantidad de trabajo efectiva planificada.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl uppercase">Intensidad</h3>
            <p className="text-muted-foreground mt-2">
              Proximidad al fallo controlada.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl uppercase">Progresión</h3>
            <p className="text-muted-foreground mt-2">
              Sobrecarga progresiva real.
            </p>
          </div>
        </div>
      </section>

      {/* AUTORIDAD */}
      <section className="py-24 border-t border-border text-center px-6">
        <h2 className="font-display text-4xl md:text-6xl uppercase">
          Basado en ciencia.<br />Aplicado en la práctica.
        </h2>

        <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
          Analizo evidencia científica y la traduzco en programación real de entrenamiento que funciona en el gimnasio.
        </p>

        <div className="mt-10 text-sm text-muted-foreground">
          Próximamente: artículos, análisis y contenido educativo.
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 text-center border-t border-border px-6">
        <h2 className="font-display text-4xl md:text-6xl uppercase">
          Si quieres resultados reales,<br />necesitas un sistema.
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
