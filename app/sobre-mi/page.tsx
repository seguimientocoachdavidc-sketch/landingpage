export default function SobreMi() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <section className="py-32 px-6 text-center">
        <h1 className="font-display text-5xl md:text-7xl uppercase">
          No soy otro entrenador.
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Trabajo con estructura, evidencia y ejecución real.
        </p>
      </section>

      {/* BLOQUE PRINCIPAL */}
      <section className="py-24 border-t border-border px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* TEXTO */}
          <div>
            <h2 className="font-display text-4xl md:text-6xl uppercase">
              Quién soy
            </h2>

            <p className="mt-6 text-muted-foreground leading-relaxed">
              Soy David, Coach especializado en hipertrofia y Rendimiento Físico. 
              Mi enfoque combina análisis estructurado con evidencia científica y años de experiencia
              para diseñar programas de entrenamiento que realmente generan resultados y no improvisen.
            </p>

            <p className="mt-4 text-muted-foreground leading-relaxed">
              No trabajo con intuición ni con rutinas genéricas. Trabajo con variables:
              Volumen, intensidad y progresión.
            </p>

            <p className="mt-4 text-muted-foreground leading-relaxed">
              Mi objetivo es que dejes de improvisar en el gimnasio y empieces a
              entrenar con un sistema claro y efectivo. 
            </p>
          </div>

          {/* IMAGEN */}
          <div>
            <img
              src="/Entrenando_2.jpeg"
              alt="Coach David"
              className="w-full border border-border"
            />
          </div>

        </div>
      </section>

      {/* EXPERIENCIA */}
      <section className="py-24 border-t border-border px-6 text-center">
        <h2 className="font-display text-4xl md:text-6xl uppercase">
          Experiencia
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div>
            <div className="text-4xl font-display text-primary">+8</div>
            <p className="text-muted-foreground mt-2">Años entrenando</p>
          </div>

          <div>
            <div className="text-4xl font-display text-primary">+6</div>
            <p className="text-muted-foreground mt-2">Certificaciones</p>
          </div>

          <div>
            <div className="text-4xl font-display text-primary">100%</div>
            <p className="text-muted-foreground mt-2">Programas personalizados</p>
          </div>
        </div>
      </section>

      {/* FILOSOFÍA */}
      <section className="py-32 border-t border-border px-6 text-center">
        <h2 className="font-display text-4xl md:text-6xl uppercase">
          Filosofía
        </h2>

        <p className="mt-6 text-xl max-w-3xl mx-auto">
          Si no puedes medir tu progreso, no puedes mejorarlo.
          Entrenar sin estructura es perder tiempo.
        </p>
      </section>

      {/* CTA */}
      <section className="py-32 border-t border-border text-center px-6">
        <h2 className="font-display text-4xl md:text-6xl uppercase">
          Si quieres hacerlo bien,<br />hazlo con estructura.
        </h2>

        <a
          href="/asesoria"
          className="inline-block mt-10 bg-primary text-primary-foreground px-8 py-4 font-bold uppercase"
        >
          Ver asesoría
        </a>
      </section>

    </main>
  )
}
