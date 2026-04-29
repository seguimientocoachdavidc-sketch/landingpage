export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* HERO */}
     <section className="relative min-h-screen flex items-center overflow-hidden">

  {/* FONDO */}
  <div className="absolute inset-0">
    <img
      src="/Entrenando_1.jpeg" // 👈 aquí pondrás tu imagen
      alt="Coach David entrenando"
      className="w-full h-full object-cover opacity-40"
    />
    <div className="absolute inset-0 bg-black/60" />
  </div>

  {/* CONTENIDO */}
  <div className="relative z-10 container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">

    {/* TEXTO */}
    <div>
      <span className="text-primary uppercase tracking-widest text-sm">
        Bienvenido al cambio
      </span>

      <h1 className="font-display text-5xl md:text-7xl uppercase leading-tight mt-4">
        Coach David
      </h1>

      <p className="mt-6 text-lg text-muted-foreground max-w-lg">
        Entrenador especializado en hipertrofia basado en ciencia. 
        Desarrollo programas estructurados que convierten teoría en resultados reales en el gimnasio.
      </p>

      <div className="mt-10 flex gap-4">
        <a
          href="/asesoria"
          className="bg-primary text-primary-foreground px-8 py-4 font-bold uppercase"
        >
          Ver asesoría
        </a>

        <a
          href="/asesoria"
          className="border border-border px-8 py-4 font-semibold uppercase"
        >
          Cómo funciona
        </a>
      </div>
    </div>

    {/* IMAGEN / LOGO */}
    <div className="hidden lg:flex justify-center">
      <div className="relative">
        <img
          src="/Logo letra blanca al lado.jpg" // 👈 tu logo
          alt="Coach David logo"
          className="w-64 opacity-80"
        />
      </div>
    </div>

  </div>
</section>

  {/* SOBRE MI */}

      <section className="py-24 border-t border-border px-6">
  <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">

    <div>
      <h2 className="font-display text-4xl md:text-6xl uppercase">
        No soy otro entrenador.
      </h2>

      <p className="mt-6 text-muted-foreground">
        Soy David, Coach especializado en hipertrofia y rendimiento físico. 
        Mi enfoque y campo de acción combina análisis estructurado con Evidencia Científica para diseñar programas que realmente generan resultados.
      </p>

      <p className="mt-4 text-muted-foreground">
        No trabajo con intuición. Trabajo con variables.
      </p>
    </div>

    <div>
      <img
        src="/Entrenando_2.jpeg"
        className="w-full border border-border"
        alt="Coach David"
      />
    </div>

  </div>
</section>

      
      {/* FILTRO */}
      <section className="relative py-32 border-t border-border overflow-hidden">

  {/* BACKGROUND */}
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

  <div className="container mx-auto px-6 relative">

    {/* HEADER */}
    <div className="text-center max-w-4xl mx-auto">
      <span className="text-primary text-sm uppercase tracking-[0.3em]">
        No es para todos
      </span>

      <h2 className="font-display text-5xl md:text-7xl uppercase mt-6 leading-tight">
        Si buscas <span className="text-destructive">atajos</span>,<br />
        este no es tu lugar.
      </h2>

      <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
        El progreso real viene de estructura, consistencia y ejecución. No de improvisar cada semana.
      </p>
    </div>

    {/* CARDS */}
    <div className="grid md:grid-cols-3 gap-8 mt-20">

      {/* CARD 1 */}
      <div className="group relative p-8 border border-border bg-card/50 backdrop-blur hover:-translate-y-2 transition-all duration-300">

        <div className="absolute inset-0 bg-gradient-to-br from-destructive/0 to-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative">
          <div className="text-5xl font-display text-destructive mb-4">01</div>

          <h3 className="font-display text-2xl uppercase">
            No improvisación
          </h3>

          <p className="mt-4 text-muted-foreground leading-relaxed">
            Cada entrenamiento responde a una planificación previa. Nada está al azar.
          </p>
        </div>
      </div>

      {/* CARD 2 */}
      <div className="group relative p-8 border border-border bg-card/50 backdrop-blur hover:-translate-y-2 transition-all duration-300">

        <div className="absolute inset-0 bg-gradient-to-br from-destructive/0 to-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative">
          <div className="text-5xl font-display text-destructive mb-4">02</div>

          <h3 className="font-display text-2xl uppercase">
            Sin progresión = sin resultados
          </h3>

          <p className="mt-4 text-muted-foreground leading-relaxed">
            Si no aumentas cargas, repeticiones o volumen, tu cuerpo no tiene razón para adaptarse.
          </p>
        </div>
      </div>

      {/* CARD 3 */}
      <div className="group relative p-8 border border-border bg-card/50 backdrop-blur hover:-translate-y-2 transition-all duration-300">

        <div className="absolute inset-0 bg-gradient-to-br from-destructive/0 to-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative">
          <div className="text-5xl font-display text-destructive mb-4">03</div>

          <h3 className="font-display text-2xl uppercase">
            Sin estructura no hay control
          </h3>

          <p className="mt-4 text-muted-foreground leading-relaxed">
            Volumen, intensidad y frecuencia deben estar definidos. No es intuición, es sistema.
          </p>
        </div>
      </div>

    </div>

  </div>
</section>

      
      {/* MÉTODO */}
      <section className="relative py-32 border-t border-border overflow-hidden">

  {/* BACKGROUND */}
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

  <div className="container mx-auto px-6 relative">

    {/* HEADER */}
    <div className="max-w-4xl">
      <span className="text-primary text-sm uppercase tracking-[0.3em]">
        El método
      </span>

      <h2 className="font-display text-5xl md:text-7xl uppercase mt-6 leading-tight">
        Un sistema,<br />
        no una <span className="text-gradient">rutina</span>.
      </h2>

      <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
        La mayoría entrena sin control de variables. Aquí cada decisión tiene un propósito: 
        estímulo, adaptación y progresión.
      </p>
    </div>

    {/* BLOQUE VISUAL */}
    <div className="grid lg:grid-cols-3 gap-8 mt-20">

      {/* VOLUMEN */}
      <div className="group relative p-10 border border-border bg-card/50 backdrop-blur transition-all duration-300 hover:border-primary/40">

        <div className="absolute top-6 right-6 text-xs tracking-widest text-muted-foreground">
          VARIABLE 01
        </div>

        <div className="text-6xl font-display text-primary mb-6">
          V
        </div>

        <h3 className="font-display text-3xl uppercase">
          Volumen
        </h3>

        <p className="mt-4 text-muted-foreground leading-relaxed">
          Cantidad de trabajo efectivo semanal por grupo muscular. 
          Ajustado según tu capacidad de recuperación y nivel.
        </p>

        <div className="mt-6 h-[2px] w-12 bg-primary group-hover:w-20 transition-all" />
      </div>

      {/* INTENSIDAD */}
      <div className="group relative p-10 border border-border bg-card/50 backdrop-blur transition-all duration-300 hover:border-primary/40">

        <div className="absolute top-6 right-6 text-xs tracking-widest text-muted-foreground">
          VARIABLE 02
        </div>

        <div className="text-6xl font-display text-primary mb-6">
          I
        </div>

        <h3 className="font-display text-3xl uppercase">
          Intensidad
        </h3>

        <p className="mt-4 text-muted-foreground leading-relaxed">
          Proximidad al fallo muscular. Controlada para maximizar estímulo 
          sin comprometer la recuperación.
        </p>

        <div className="mt-6 h-[2px] w-12 bg-primary group-hover:w-20 transition-all" />
      </div>

      {/* PROGRESIÓN */}
      <div className="group relative p-10 border border-border bg-card/50 backdrop-blur transition-all duration-300 hover:border-primary/40">

        <div className="absolute top-6 right-6 text-xs tracking-widest text-muted-foreground">
          VARIABLE 03
        </div>

        <div className="text-6xl font-display text-primary mb-6">
          P
        </div>

        <h3 className="font-display text-3xl uppercase">
          Progresión
        </h3>

        <p className="mt-4 text-muted-foreground leading-relaxed">
          Sobrecarga progresiva real. Aumentos planificados en carga, repeticiones 
          o volumen para generar adaptación continua.
        </p>

        <div className="mt-6 h-[2px] w-12 bg-primary group-hover:w-20 transition-all" />
      </div>

    </div>

    {/* FRASE FINAL */}
    <div className="mt-24 text-center max-w-3xl mx-auto">
      <p className="text-xl md:text-2xl font-display uppercase leading-relaxed">
        Si no controlas estas variables,<br />
        no estás entrenando… estás improvisando.
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

      {/* CONTENIDO */}
<section className="py-24 border-t border-border px-6">
  <div className="max-w-5xl mx-auto">

    <h2 className="font-display text-4xl md:text-6xl uppercase text-center">
      Lo que enseño
    </h2>

    <p className="text-center text-muted-foreground mt-6 max-w-2xl mx-auto">
      Explico entrenamiento con base científica, aplicado a la práctica real.
    </p>

    <div className="grid md:grid-cols-3 gap-6 mt-16">

      <div className="p-6 border border-border">
        Volumen de entrenamiento
      </div>

      <div className="p-6 border border-border">
        Proximidad al fallo
      </div>

      <div className="p-6 border border-border">
        Frecuencia y progresión
      </div>

    </div>

  </div>
</section>

      
    </main>
  )
}
