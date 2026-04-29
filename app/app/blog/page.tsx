export default function Blog() {
  return (
    <main className="min-h-screen px-6 py-24">

      <div className="max-w-5xl mx-auto">

        <h1 className="font-display text-5xl md:text-7xl uppercase">
          Blog
        </h1>

        <p className="mt-6 text-muted-foreground max-w-2xl">
          Explicaciones claras sobre entrenamiento basado en ciencia.
          Sin mitos. Sin ruido.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mt-16">

          <a href="/blog/que-es-la-intensidad" className="p-6 border border-border hover:border-primary transition">
            <h2 className="font-display text-2xl uppercase">
              ¿Qué es la intensidad?
            </h2>
            <p className="text-muted-foreground mt-3">
              Cómo entender la proximidad al fallo y su impacto en la hipertrofia.
            </p>
          </a>

        </div>

      </div>

    </main>
  )
}
