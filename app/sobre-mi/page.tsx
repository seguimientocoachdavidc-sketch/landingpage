export default function SobreMi() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* HERO CON VIDEO */}
      <section className="relative h-[80vh] flex items-center justify-center text-center px-6 overflow-hidden">
        
        {/* VIDEO */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="/0502.mp4" type="video/mp4" />
        </video>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-red-900/60" />

        {/* CONTENIDO */}
        <div className="relative z-10 max-w-3xl">
          <h1 className="font-display text-5xl md:text-7xl uppercase leading-tight">
            Bienvenido al<br />
            <span className="text-red-500">cambio real</span>
          </h1>

          <p className="mt-6 text-lg text-white/70">
            No es motivación. Es estructura, ciencia y ejecución.
          </p>
        </div>

      </section>

      {/* QUIÉN SOY */}
      <section className="relative py-24 px-6 border-t border-white/10 overflow-hidden">

        {/* FONDO */}
        <div className="absolute inset-0">
          <img
            src="/gym-2.jpg"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        <div className="absolute inset-0 bg-black/80" />

        {/* CONTENIDO GRID (FIX CLAVE) */}
        <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          {/* TEXTO */}
          <div>
            <h2 className="font-display text-4xl md:text-6xl uppercase">
              Conoce al Coach
            </h2>

            <div className="w-16 h-1 bg-red-500 mt-6 mb-8" />

            <p className="text-white/70 leading-relaxed max-w-xl">
              Soy David, Coach especializado en hipertrofia y rendimiento físico.
              Mi enfoque combina formación estructurada con aplicación práctica real.
            </p>

            {/* ESTUDIOS */}
            <div className="mt-10 space-y-6">

              <div className="p-6 border border-white/10 bg-white/5 backdrop-blur">
                <p className="text-sm uppercase tracking-widest text-white/40 mb-3">
                  Formación técnica
                </p>
                <ul className="space-y-2 text-white/80">
                  <li>✔ Técnico en Entrenamiento de Gimnasio — CCAPF</li>
                  <li>✔ Técnico en Entrenamiento Personalizado — CCAPF</li>
                </ul>
              </div>

              <div className="p-6 border border-white/10 bg-white/5 backdrop-blur">
                <p className="text-sm uppercase tracking-widest text-white/40 mb-3">
                  Especializaciones
                </p>
                <ul className="space-y-2 text-white/80">
                  <li>✔ Hipertrofia muscular — ECEP</li>
                  <li>✔ Entrenamiento en mujeres — ECEP</li>
                  <li>✔ Biomecánica deportiva — Fitness & Health Institute</li>
                  <li>✔ Nutrición deportiva — Fitness & Health Institute</li>
                </ul>
              </div>

              <div className="p-6 border border-red-500/30 bg-red-500/5">
                <p className="text-sm uppercase tracking-widest text-red-400 mb-3">
                  Formación actual
                </p>
                <ul className="space-y-2 text-white/80">
                  <li>→ Nutrición y suplementación — INAF</li>
                  <li>→ Certificación profesional en musculación — INAF</li>
                </ul>
              </div>

            </div>

            <p className="mt-8 text-white/70 leading-relaxed max-w-xl">
              Trabajo con una estructura clara y que funciona. 
              Y si no funciona, la ajustamos. 
            </p>

            <p className="mt-4 text-white/70 leading-relaxed max-w-xl">
              Si entrenas conmigo, no entrenas más duro.
              <span className="text-red-500"> Entrenas mejor.</span>
            </p>
          </div>

          {/* IMAGEN */}
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

      {/* EXPERIENCIA */}
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

      {/* FILOSOFÍA */}
      <section className="relative py-32 border-t border-white/10 px-6 text-center overflow-hidden">

        <div className="absolute inset-0">
          <img
            src="/gym-dark.jpg"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        <div className="absolute inset-0 bg-black/85" />

        <div className="relative z-10">
          <h2 className="font-display text-4xl md:text-6xl uppercase">
            Filosofía
          </h2>

          <p className="mt-8 text-2xl max-w-3xl mx-auto font-semibold">
            Si no puedes medir tu progreso,<br />
            <span className="text-red-500">no puedes mejorarlo.</span>
          </p>

          <p className="mt-6 text-white/60 max-w-xl mx-auto">
            Aprende a entrenar y enamorate del proceso. 
            Vamos a lograr un nuevo nivel. 
          </p>
        </div>

      </section>

      {/* CTA */}
      <section className="py-32 border-t border-white/10 text-center px-6">

        <h2 className="font-display text-4xl md:text-6xl uppercase">
          Aprende a entrenar de verdad. 
        </h2>

        <p className="mt-4 text-white/60">
          Con un sistema real.
        </p>

        <a
          href="/programas"
          className="inline-block mt-10 bg-red-500 hover:bg-red-600 text-white px-10 py-4 font-bold uppercase transition-all hover:scale-105"
        >
          Ver detalle de programas 
        </a>

      </section>

    </main>
  )
}
