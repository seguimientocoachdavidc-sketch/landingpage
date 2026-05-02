export default function SobreMi() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* HERO PRO */}
      <section className="relative h-[80vh] flex items-center justify-center text-center px-6">

        {/* VIDEO / IMAGEN FONDO */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="/gym-loop.mp4" type="video/mp4" />
        </video>

        {/* OVERLAY ROJO */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-red-900/60" />

        {/* CONTENIDO */}
        <div className="relative z-10 max-w-3xl">
          <h1 className="font-display text-5xl md:text-7xl uppercase leading-tight">
            Bienvenido al<br />
            <span className="text-red-500">cambio real</span>
          </h1>

          <p className="mt-6 text-lg text-white/70">
            No es motivación. No es suerte. Es estructura, ciencia y ejecución.
          </p>
        </div>

      </section>

      {/* QUIÉN SOY (MEJORADO) */}
      <section className="py-24 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          {/* TEXTO */}
          <div>
            <h2 className="font-display text-4xl md:text-6xl uppercase">
              Quién soy
            </h2>

            <div className="w-16 h-1 bg-red-500 mt-6 mb-6" />

            <p className="text-white/70 leading-relaxed">
              Soy David, coach especializado en hipertrofia y rendimiento físico.
              Mi enfoque no es improvisado. Está construido sobre evidencia científica,
              estructura y aplicación real en el gimnasio.
            </p>

            <p className="mt-4 text-white/70 leading-relaxed">
              Trabajo con variables medibles: volumen, intensidad, frecuencia y progresión.
              Nada queda al azar.
            </p>

            <p className="mt-4 text-white/70 leading-relaxed">
              Si entrenas conmigo, no solo entrenas más duro.
              Entrenas con propósito.
            </p>
          </div>

          {/* IMAGEN CON EFECTO */}
          <div className="relative">
            <img
              src="/Entrenando_2.jpeg"
              alt="Coach David"
              className="w-full rounded-sm border border-white/10"
            />

            <div className="absolute inset-0 border border-red-500/40 translate-x-4 translate-y-4" />
          </div>

        </div>
      </section>

      {/* EXPERIENCIA (MÁS IMPACTO) */}
      <section className="py-24 border-t border-white/10 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 text-center">

          <div className="p-8 bg-white/5 border border-white/10">
            <div className="text-5xl font-display text-red-500">+8</div>
            <p className="mt-2 text-white/60">Años entrenando</p>
          </div>

          <div className="p-8 bg-white/5 border border-white/10">
            <div className="text-5xl font-display text-red-500">+6</div>
            <p className="mt-2 text-white/60">Certificaciones</p>
          </div>

          <div className="p-8 bg-white/5 border border-white/10">
            <div className="text-5xl font-display text-red-500">100%</div>
            <p className="mt-2 text-white/60">Programación personalizada</p>
          </div>

        </div>
      </section>

      {/* FILOSOFÍA (MÁS AGRESIVA) */}
      <section className="py-32 border-t border-white/10 px-6 text-center">
        <h2 className="font-display text-4xl md:text-6xl uppercase">
          Filosofía
        </h2>

        <p className="mt-8 text-2xl max-w-3xl mx-auto font-semibold">
          Si no puedes medir tu progreso,<br />
          <span className="text-red-500">no puedes mejorarlo.</span>
        </p>

        <p className="mt-6 text-white/60 max-w-xl mx-auto">
          Entrenar sin estructura no es disciplina.
          Es simplemente perder el tiempo.
        </p>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 border-t border-white/10 text-center px-6">

        <h2 className="font-display text-4xl md:text-6xl uppercase">
          Deja de improvisar.
        </h2>

        <p className="mt-4 text-white/60">
          Empieza a entrenar con un sistema real.
        </p>

        <a
          href="/asesoria"
          className="inline-block mt-10 bg-red-500 hover:bg-red-600 text-white px-10 py-4 font-bold uppercase transition-all hover:scale-105"
        >
          Ver asesoría
        </a>

      </section>

    </main>
  )
}
