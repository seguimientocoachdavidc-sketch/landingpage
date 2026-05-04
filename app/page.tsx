"use client"

import { useEffect, useRef, useState } from "react"

const R = "#E8000D"

/* ── FadeIn al scroll ─────────────────────────────────────────── */
function FadeIn({ children, delay = 0, from = "bottom", style = {} }: {
  children: React.ReactNode; delay?: number
  from?: "bottom" | "left" | "right"; style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    obs.observe(el); return () => obs.disconnect()
  }, [])
  const tx = from === "left" ? "-48px" : from === "right" ? "48px" : "0"
  const ty = from === "bottom" ? "44px" : "0"
  return (
    <div ref={ref} style={{
      transition: `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      opacity: v ? 1 : 0,
      transform: v ? "translate(0,0)" : `translate(${tx},${ty})`,
      ...style,
    }}>{children}</div>
  )
}

/* ── Contador animado ─────────────────────────────────────────── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [val, setVal] = useState(0)
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true
        const dur = 1600; const start = Date.now()
        const tick = () => {
          const p = Math.min((Date.now() - start) / dur, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          setVal(Math.round(ease * target))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    obs.observe(el); return () => obs.disconnect()
  }, [target])
  return <span ref={ref}>{val}{suffix}</span>
}

/* ══ HOME ═════════════════════════════════════════════════════════ */
export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [heroIn, setHeroIn] = useState(false)

  useEffect(() => {
    setTimeout(() => setHeroIn(true), 80)
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <main style={{ background: "#000", color: "#fff", fontFamily: "'Barlow', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,700;0,800;0,900;1,900&family=Barlow:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${R}; color: #fff; }
        .bc { font-family: 'Barlow Condensed', Impact, sans-serif; }
        .b  { font-family: 'Barlow', sans-serif; }
        @keyframes marquee  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulseR   { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes breathe  { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(1.04)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rotSlow  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* ══ HERO ════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", height: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>

        {/* Video con parallax */}
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${scrollY * 0.22}px)`, willChange: "transform" }}>
          <video autoPlay loop muted playsInline
            style={{ width: "100%", height: "110%", objectFit: "cover", filter: "grayscale(20%) contrast(1.1)", opacity: 0.45 }}>
            <source src="/0502.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, #000 38%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.15) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #000 0%, transparent 50%)" }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 80% 30%, ${R}14 0%, transparent 50%)` }} />

        {/* Línea roja vertical izquierda */}
        <div style={{
          position: "absolute", left: "max(32px, calc(50vw - 700px))",
          top: 0, bottom: 0, width: 2,
          background: `linear-gradient(to bottom, transparent, ${R} 20%, ${R} 80%, transparent)`,
          opacity: heroIn ? 1 : 0, transition: "opacity 1.2s ease 0.5s",
        }} />

        {/* Contenido hero */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 1400, margin: "0 auto", padding: "0 64px", width: "100%" }}>

          {/* Eyebrow */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 28,
            opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)",
            transition: "all 0.7s ease 0.2s",
          }}>
            <div style={{ width: 40, height: 2, background: R }} />
            <span className="bc" style={{ color: R, fontSize: 12, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>
              Entrenamiento basado en evidencia
            </span>
          </div>

          {/* Título principal */}
          <div style={{ overflow: "hidden", marginBottom: 8 }}>
            {["ENTRENA CON", "ESTRUCTURA,"].map((line, i) => (
              <div key={line} style={{
                display: "block",
                opacity: heroIn ? 1 : 0,
                transform: heroIn ? "translateY(0)" : "translateY(100%)",
                transition: `all 0.9s cubic-bezier(0.16,1,0.3,1) ${0.28 + i * 0.12}s`,
              }}>
                <span className="bc" style={{ fontSize: "clamp(64px, 10vw, 150px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.87, letterSpacing: "-0.02em", display: "block" }}>
                  {line}
                </span>
              </div>
            ))}
            <div style={{
              display: "block",
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? "translateY(0)" : "translateY(100%)",
              transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.52s",
            }}>
              <span className="bc" style={{ fontSize: "clamp(64px, 10vw, 150px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.87, letterSpacing: "-0.02em", color: R, textShadow: `0 0 80px ${R}50`, display: "block" }}>
                NO CON
              </span>
            </div>
            <div style={{
              display: "block",
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? "translateY(0)" : "translateY(100%)",
              transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.64s",
            }}>
              <span className="bc" style={{ fontSize: "clamp(64px, 10vw, 150px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.87, letterSpacing: "-0.02em", display: "block" }}>
                INTUICIÓN.
              </span>
            </div>
          </div>

          {/* Subtítulo + CTA */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 32, marginTop: 40 }}>
            <p className="b" style={{
              fontSize: "clamp(15px, 1.3vw, 18px)", color: "rgba(255,255,255,0.5)",
              maxWidth: 420, lineHeight: 1.7, fontWeight: 300,
              opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)",
              transition: "all 0.7s ease 0.85s",
            }}>
              Programación de hipertrofia basada en ciencia, aplicada en la práctica real.
              Sin improvisación. Sin rutinas genéricas.
            </p>

            <div style={{
              display: "flex", gap: 14, flexWrap: "wrap",
              opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)",
              transition: "all 0.7s ease 1s",
            }}>
              <CTAButton href="/asesoria" primary>Ver asesoría</CTAButton>
              <CTAButton href="/programas">Ver programas</CTAButton>
            </div>
          </div>

          {/* Stats hero */}
          <div style={{
            position: "absolute", right: 64, top: "50%", transform: "translateY(-50%)",
            display: "flex", flexDirection: "column", gap: 28, textAlign: "right",
            opacity: heroIn ? 1 : 0, transition: "opacity 1s ease 1.3s",
          }}>
            {[
              { n: "+8", label: "Años entrenando" },
              { n: "+6", label: "Certificaciones" },
              { n: "0", label: "Improvisación" },
            ].map(s => (
              <div key={s.label}>
                <div className="bc" style={{ fontSize: 40, fontWeight: 900, color: R, lineHeight: 1 }}>{s.n}</div>
                <div className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.18em", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee inferior */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
          padding: "13px 0", overflow: "hidden",
          opacity: heroIn ? 1 : 0, transition: "opacity 1s ease 1.6s",
        }}>
          <div style={{ display: "flex", animation: "marquee 20s linear infinite", width: "max-content" }}>
            {Array(6).fill(null).map((_, i) => (
              <span key={i} className="bc" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.13)", paddingRight: 80, whiteSpace: "nowrap" }}>
                Hipertrofia · Ciencia Aplicada · Progresión Real · Sin Atajos · Coach David · Resultados Medibles ·&nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FILOSOFÍA — "No es para todos" ═════════════════════════ */}
      <section style={{ position: "relative", padding: "140px 64px", overflow: "hidden" }}>

        {/* Número de fondo */}
        <div className="bc" style={{
          position: "absolute", right: -60, top: "50%", transform: "translateY(-50%)",
          fontSize: "45vw", fontWeight: 900, color: "rgba(255,255,255,0.013)",
          lineHeight: 1, pointerEvents: "none", userSelect: "none", letterSpacing: "-0.05em",
        }}>NO</div>

        <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 100, alignItems: "center" }}>

          <FadeIn from="left">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div style={{ width: 36, height: 2, background: "rgba(255,255,255,0.2)" }} />
              <span className="bc" style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Filosofía</span>
            </div>

            <h2 className="bc" style={{ fontSize: "clamp(52px, 5.5vw, 88px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em", marginBottom: 32 }}>
              SI BUSCAS<br />
              <span style={{ color: R }}>ATAJOS,</span><br />
              ESTE NO ES<br />TU LUGAR.
            </h2>

            <p className="b" style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, fontWeight: 300, maxWidth: 400, marginBottom: 40 }}>
              El progreso real viene de estructura, consistencia y ejecución.
              No de improvisar cada semana.
            </p>

            <a href="/sobre-mi" className="bc" style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              color: R, fontSize: 14, fontWeight: 800, letterSpacing: "0.25em",
              textTransform: "uppercase", textDecoration: "none",
              borderBottom: `2px solid ${R}`, paddingBottom: 4,
              transition: "gap 0.3s ease",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.gap = "20px"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.gap = "12px"}
            >Conocer la filosofía →</a>
          </FadeIn>

          {/* Cards de principios */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { n: "01", t: "Sin improvisación", b: "Cada entrenamiento responde a planificación previa. Nada está al azar." },
              { n: "02", t: "Sin progresión = sin resultados", b: "Si no aumentas cargas o volumen, tu cuerpo no tiene razón para adaptarse." },
              { n: "03", t: "Sin estructura no hay control", b: "Volumen, intensidad y frecuencia definidos. No es intuición, es sistema." },
            ].map((c, i) => (
              <FadeIn key={c.n} delay={i * 100}>
                <PrincipioCard {...c} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ EL MÉTODO ══════════════════════════════════════════════ */}
      <section style={{ position: "relative", padding: "140px 64px", background: "#080808", overflow: "hidden" }}>

        {/* Grilla */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.35,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${R}60, transparent)` }} />

        <div style={{ position: "relative", maxWidth: 1400, margin: "0 auto" }}>

          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>El método</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 72 }}>
              <h2 className="bc" style={{ fontSize: "clamp(48px, 5.5vw, 88px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em" }}>
                UN SISTEMA,<br /><span style={{ color: R }}>NO UNA RUTINA.</span>
              </h2>
              <p className="b" style={{ color: "rgba(255,255,255,0.35)", maxWidth: 300, fontSize: 15, lineHeight: 1.65, fontWeight: 300 }}>
                Cada decisión tiene un propósito: estímulo, adaptación y progresión continua.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2 }}>
            {[
              { letra: "V", label: "Variable 01", title: "Volumen", body: "Trabajo efectivo semanal por grupo muscular. Ajustado según tu capacidad de recuperación y nivel actual." },
              { letra: "I", label: "Variable 02", title: "Intensidad", body: "Proximidad al fallo muscular. Controlada para maximizar el estímulo sin comprometer la recuperación." },
              { letra: "P", label: "Variable 03", title: "Progresión", body: "Sobrecarga progresiva planificada. Aumentos en carga, repeticiones o volumen para generar adaptación continua." },
            ].map((v, i) => (
              <FadeIn key={v.letra} delay={i * 130}>
                <MetodoCard {...v} />
              </FadeIn>
            ))}
          </div>

          {/* Frase final del método */}
          <FadeIn delay={200}>
            <div style={{ marginTop: 72, padding: "40px 48px", borderLeft: `4px solid ${R}`, background: `${R}06` }}>
              <p className="bc" style={{ fontSize: "clamp(20px, 2.5vw, 36px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 1.1, color: "rgba(255,255,255,0.8)" }}>
                Si no controlas estas variables, no estás entrenando…{" "}
                <span style={{ color: R }}>estás improvisando.</span>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ ESTADÍSTICAS ════════════════════════════════════════════ */}
      <section style={{ background: R, padding: "72px 64px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2 }}>
          {[
            { target: 8, suffix: "+", label: "Años entrenando" },
            { target: 6, suffix: "+", label: "Certificaciones" },
            { target: 100, suffix: "%", label: "Personalizado" },
            { target: 0, suffix: "", label: "Improvisación" },
          ].map((s, i) => (
            <FadeIn key={s.label} delay={i * 80}>
              <div style={{ padding: "36px 32px", borderRight: i < 3 ? "1px solid rgba(0,0,0,0.15)" : "none", background: i === 1 || i === 3 ? "rgba(0,0,0,0.12)" : "transparent" }}>
                <div className="bc" style={{ fontSize: "clamp(52px, 5vw, 76px)", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.03em" }}>
                  <Counter target={s.target} suffix={s.suffix} />
                </div>
                <div className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 8, fontWeight: 400 }}>{s.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══ SERVICIOS ═══════════════════════════════════════════════ */}
      <section style={{ padding: "140px 64px", background: "#000", position: "relative", overflow: "hidden" }}>

        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${R}, transparent)` }} />

        <div style={{ maxWidth: 1400, margin: "0 auto" }}>

          <FadeIn>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 72 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 2, background: "rgba(255,255,255,0.15)" }} />
                  <span className="bc" style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Servicios</span>
                </div>
                <h2 className="bc" style={{ fontSize: "clamp(48px, 5.5vw, 88px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em" }}>
                  ELIGE CÓMO<br /><span style={{ color: R }}>ENTRENAR.</span>
                </h2>
              </div>
              <a href="/programas" className="bc" style={{
                display: "inline-flex", alignItems: "center", gap: 12,
                color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 700,
                letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none",
                borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 4,
                transition: "all 0.25s ease",
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = "#fff"; el.style.borderColor = R }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = "rgba(255,255,255,0.4)"; el.style.borderColor = "rgba(255,255,255,0.15)" }}
              >Ver todos los programas →</a>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2 }}>
            <FadeIn delay={0}>
              <ServicioCard
                n="01" title="Entrenamiento" price="$140.000"
                desc="Programa estructurado para hipertrofia, pérdida de grasa o rendimiento físico."
                items={["Plan personalizado", "Progresión planificada", "Ajustes semanales", "Soporte 1 a 1"]}
                href="/asesoria" cta="Aplicar" featured={false}
              />
            </FadeIn>
            <FadeIn delay={130}>
              <ServicioCard
                n="02" title="Alimentación" price="$130.000"
                desc="Plan nutricional adaptado a tus hábitos, gustos y contexto real."
                items={["Plan personalizado", "Seguimiento continuo", "Ajustes constantes", "Valoración inicial"]}
                href="/nutricion-cuestionario" cta="Iniciar evaluación" featured={false}
              />
            </FadeIn>
            <FadeIn delay={260}>
              <ServicioCard
                n="03" title="Programa DUO" price="$220.000"
                desc="Entrenamiento + alimentación integrados como un sistema para maximizar resultados."
                items={["Todo el programa de entrenamiento", "Todo el plan de alimentación", "Seguimiento completo", "Mayor velocidad de progreso"]}
                href="https://wa.me/573243747367?text=Hola Coach David, quiero el programa DUO."
                cta="Empezar ahora" featured={true}
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ SPLIT IMAGE — "Lo que enseño" ══════════════════════════ */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "80vh", position: "relative" }}>

        {/* Imagen */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img src="/Entrenando_1.jpeg" alt="Coach David entrenando"
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              filter: "grayscale(20%) contrast(1.05)",
              transform: `scale(1.04) translateY(${(scrollY - 2600) * 0.06}px)`,
            }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 55%, #000)" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${R}20 0%, transparent 40%)` }} />

          {/* Marco esquinas */}
          <div style={{ position: "absolute", top: 24, left: 24, width: 36, height: 36, borderTop: `2px solid ${R}`, borderLeft: `2px solid ${R}` }} />
          <div style={{ position: "absolute", bottom: 24, left: 24, width: 36, height: 36, borderBottom: `2px solid ${R}`, borderLeft: `2px solid ${R}` }} />
        </div>

        {/* Texto */}
        <div style={{ background: "#050505", display: "flex", alignItems: "center", padding: "80px 72px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "40%", right: -60, width: 280, height: 280, background: `${R}07`, borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />

          <FadeIn from="right">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div style={{ width: 36, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Lo que enseño</span>
            </div>

            <h2 className="bc" style={{ fontSize: "clamp(40px, 4vw, 68px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 40 }}>
              TEORÍA<br />APLICADA<br /><span style={{ color: R }}>AL GIMNASIO.</span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 44 }}>
              {[
                { n: "01", t: "Volumen de entrenamiento", b: "Cuántas series necesita cada músculo para crecer según tu nivel y recuperación." },
                { n: "02", t: "Proximidad al fallo", b: "Cómo medir la intensidad real y cuándo acercarse al límite sin quemarse." },
                { n: "03", t: "Frecuencia y progresión", b: "Con qué frecuencia entrenar y cómo progresar semana a semana sin estancarte." },
              ].map((item, i) => (
                <div key={item.n} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span className="bc" style={{ fontSize: 11, color: R, fontWeight: 700, letterSpacing: "0.2em", flexShrink: 0, marginTop: 3 }}>{item.n}</span>
                  <div>
                    <div className="bc" style={{ fontSize: 17, fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.8)", letterSpacing: "0.03em" }}>{item.t}</div>
                    <div className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 4, lineHeight: 1.5, fontWeight: 300 }}>{item.b}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 20px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ width: 7, height: 7, background: R, borderRadius: "50%", animation: "pulseR 2s ease infinite" }} />
              <span className="bc" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700 }}>
                Próximamente: artículos y análisis
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ PRODUCTOS DIGITALES — Escalable ════════════════════════ */}
      <section style={{ padding: "140px 64px", background: "#080808", position: "relative", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.04)" }}>

        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 50%, ${R}07 0%, transparent 65%)` }} />

        <div style={{ position: "relative", maxWidth: 1400, margin: "0 auto" }}>

          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Próximamente</span>
              <div style={{ padding: "4px 10px", background: `${R}20`, border: `1px solid ${R}40` }}>
                <span className="bc" style={{ fontSize: 10, color: R, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase" }}>En desarrollo</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 64 }}>
              <h2 className="bc" style={{ fontSize: "clamp(44px, 5vw, 80px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em" }}>
                MÁS FORMAS<br />DE <span style={{ color: R }}>CRECER.</span>
              </h2>
              <p className="b" style={{ color: "rgba(255,255,255,0.3)", maxWidth: 320, fontSize: 15, lineHeight: 1.65, fontWeight: 300 }}>
                El conocimiento aplicado al entrenamiento también puede llegar en otros formatos. Esto viene pronto.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2 }}>
            {[
              {
                icon: "◈",
                title: "Guías digitales",
                desc: "Recursos descargables de entrenamiento, hipertrofia y nutrición. Todo lo que necesitas en un solo lugar.",
                tag: "Próximamente",
                active: false,
              },
              {
                icon: "◉",
                title: "Contenido educativo",
                desc: "Artículos, análisis y explicaciones de conceptos científicos aplicados al entrenamiento real.",
                tag: "En construcción",
                active: false,
              },
              {
                icon: "◆",
                title: "Programas online",
                desc: "Acceso a programas de entrenamiento estructurados sin necesidad de asesoría 1 a 1.",
                tag: "Próximamente",
                active: false,
              },
            ].map((p, i) => (
              <FadeIn key={p.title} delay={i * 120}>
                <ProductoCard {...p} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ═══════════════════════════════════════════════ */}
      <section style={{ position: "relative", padding: "160px 64px", background: "#000", overflow: "hidden", textAlign: "center" }}>

        {/* Imagen de fondo tenue */}
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${(scrollY - 4000) * 0.12}px)` }}>
          <img src="/Entrenando_1.jpeg" alt=""
            style={{ width: "100%", height: "110%", objectFit: "cover", opacity: 0.06, filter: "grayscale(60%)" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, ${R}10 0%, #000 65%)` }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${R}70, transparent)` }} />

        <div style={{ position: "relative", maxWidth: 1000, margin: "0 auto" }}>
          <FadeIn>
            <span className="bc" style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700 }}>El siguiente paso</span>

            <h2 className="bc" style={{ fontSize: "clamp(52px, 7.5vw, 120px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.87, letterSpacing: "-0.02em", marginTop: 20 }}>
              ENTRENAR<br />BIEN NO<br />
              <span style={{ color: R, textShadow: `0 0 80px ${R}60` }}>ES OPCIONAL.</span>
            </h2>

            <p className="b" style={{ marginTop: 32, fontSize: 18, color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>
              Con un sistema real. Sin improvisación.
            </p>

            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: 56 }}>
              <CTAButton href="/asesoria" primary large>Aplicar a asesoría</CTAButton>
              <CTAButton href="/programas" large>Ver programas</CTAButton>
            </div>

            <p className="b" style={{ marginTop: 28, fontSize: 12, color: "rgba(255,255,255,0.18)", letterSpacing: "0.05em" }}>
              Sin compromisos. Una conversación para ver si hay fit.
            </p>
          </FadeIn>
        </div>
      </section>

    </main>
  )
}

/* ── Botón CTA reutilizable ───────────────────────────────────── */
function CTAButton({ href, children, primary = false, large = false }: {
  href: string; children: React.ReactNode; primary?: boolean; large?: boolean
}) {
  const isExt = href.startsWith("http")
  const pad = large ? "22px 64px" : "18px 44px"
  const fs = large ? 16 : 15
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 12,
    padding: pad, fontSize: fs, fontWeight: 900,
    fontFamily: "'Barlow Condensed', Impact, sans-serif",
    letterSpacing: "0.22em", textTransform: "uppercase", textDecoration: "none",
    transition: "all 0.25s ease", cursor: "pointer",
  }
  const [hover, setHover] = useState(false)
  const style: React.CSSProperties = primary
    ? { ...base, background: hover ? "#fff" : R, color: hover ? "#000" : "#fff", boxShadow: hover ? "none" : `0 12px 40px ${R}40`, clipPath: "polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))" }
    : { ...base, border: `1px solid ${hover ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)"}`, color: hover ? "#fff" : "rgba(255,255,255,0.55)" }
  return (
    <a href={href} target={isExt ? "_blank" : undefined} rel={isExt ? "noopener noreferrer" : undefined}
      style={style} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {children}
    </a>
  )
}

/* ── Card de principio ───────────────────────────────────────── */
function PrincipioCard({ n, t, b }: { n: string; t: string; b: string }) {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ padding: "28px 36px", background: hover ? "#0d0d0d" : "#050505", borderLeft: `3px solid ${hover ? R : "rgba(255,255,255,0.05)"}`, transition: "all 0.3s ease", cursor: "default", marginBottom: 2 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <span className="bc" style={{ fontSize: 44, fontWeight: 900, color: hover ? R : "rgba(255,255,255,0.05)", lineHeight: 1, flexShrink: 0, transition: "color 0.3s ease" }}>{n}</span>
        <div>
          <h3 className="bc" style={{ fontSize: 20, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.01em", color: hover ? "#fff" : "rgba(255,255,255,0.8)", transition: "color 0.3s ease" }}>{t}</h3>
          <p className="b" style={{ marginTop: 6, color: "rgba(255,255,255,0.35)", fontSize: 13, lineHeight: 1.6, fontWeight: 300 }}>{b}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Card del método ─────────────────────────────────────────── */
function MetodoCard({ letra, label, title, body }: { letra: string; label: string; title: string; body: string }) {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: hover ? "#111" : "#0a0a0a", border: `1px solid ${hover ? R + "50" : "rgba(255,255,255,0.05)"}`, padding: "48px 40px", position: "relative", overflow: "hidden", transition: "all 0.35s ease", cursor: "default" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: hover ? R : "transparent", transition: "background 0.3s ease" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <span className="bc" style={{ fontSize: 92, fontWeight: 900, lineHeight: 1, color: hover ? `${R}22` : "rgba(255,255,255,0.03)", transition: "color 0.3s ease" }}>{letra}</span>
        <span className="bc" style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700 }}>{label}</span>
      </div>
      <h3 className="bc" style={{ fontSize: 34, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em" }}>{title}</h3>
      <p className="b" style={{ marginTop: 14, color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.7, fontWeight: 300 }}>{body}</p>
      <div style={{ marginTop: 28, height: 2, background: R, width: hover ? "100%" : 28, transition: "width 0.5s ease" }} />
    </div>
  )
}

/* ── Card de servicio ─────────────────────────────────────────── */
function ServicioCard({ n, title, price, desc, items, href, cta, featured }: {
  n: string; title: string; price: string; desc: string
  items: string[]; href: string; cta: string; featured: boolean
}) {
  const [hover, setHover] = useState(false)
  const isExt = href.startsWith("http")
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: featured ? `${R}06` : hover ? "#0d0d0d" : "#080808",
        border: `${featured ? "2" : "1"}px solid ${featured ? R : hover ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`,
        padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "relative", overflow: "hidden", transition: "all 0.3s ease",
        boxShadow: featured ? `0 0 60px ${R}15` : "none",
      }}>
      {featured && (
        <div style={{ position: "absolute", top: 20, right: 20, background: R, padding: "4px 12px" }}>
          <span className="bc" style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#fff" }}>Recomendado</span>
        </div>
      )}
      <div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 28 }}>
          <span className="bc" style={{ fontSize: 11, color: R, fontWeight: 700, letterSpacing: "0.3em" }}>{n}</span>
          <div style={{ flex: 1, height: 1, background: featured ? `${R}30` : "rgba(255,255,255,0.06)" }} />
        </div>
        <h3 className="bc" style={{ fontSize: 36, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 12 }}>{title}</h3>
        <p className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, fontWeight: 300, marginBottom: 28 }}>{desc}</p>
        <ul style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 36 }}>
          {items.map(item => (
            <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'Barlow', sans-serif", fontWeight: 300 }}>
              <div style={{ width: 5, height: 5, background: R, flexShrink: 0, transform: "rotate(45deg)" }} />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="bc" style={{ fontSize: 44, fontWeight: 900, color: R, lineHeight: 1, marginBottom: 4 }}>{price}</div>
        <div className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>por mes</div>
        <a href={href} target={isExt ? "_blank" : undefined} rel={isExt ? "noopener noreferrer" : undefined} className="bc"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "16px", fontSize: 14, fontWeight: 900, letterSpacing: "0.2em",
            textTransform: "uppercase", textDecoration: "none", transition: "all 0.25s ease",
            background: featured ? R : "transparent",
            color: featured ? "#fff" : "rgba(255,255,255,0.5)",
            border: featured ? "none" : "1px solid rgba(255,255,255,0.12)",
            clipPath: featured ? "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))" : "none",
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = R; el.style.color = "#fff"; el.style.background = featured ? "#fff" : `${R}12`; if (featured) el.style.color = "#000" }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = featured ? "none" : "rgba(255,255,255,0.12)"; el.style.color = featured ? "#fff" : "rgba(255,255,255,0.5)"; el.style.background = featured ? R : "transparent" }}
        >{cta} →</a>
      </div>
    </div>
  )
}

/* ── Card de producto digital ─────────────────────────────────── */
function ProductoCard({ icon, title, desc, tag }: { icon: string; title: string; desc: string; tag: string }) {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: hover ? "#0d0d0d" : "#0a0a0a", border: `1px solid ${hover ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}`, padding: "48px 40px", position: "relative", overflow: "hidden", transition: "all 0.3s ease", cursor: "default" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: hover ? `${R}60` : "transparent", transition: "background 0.3s ease" }} />

      {/* Tag */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32, padding: "6px 12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ width: 5, height: 5, background: R, borderRadius: "50%", animation: "pulseR 2.5s ease infinite" }} />
        <span className="bc" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700 }}>{tag}</span>
      </div>

      <div className="bc" style={{ fontSize: 44, color: hover ? R : "rgba(255,255,255,0.08)", marginBottom: 16, lineHeight: 1, transition: "color 0.3s ease" }}>{icon}</div>
      <h3 className="bc" style={{ fontSize: 28, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: hover ? "#fff" : "rgba(255,255,255,0.6)", transition: "color 0.3s ease", marginBottom: 12 }}>{title}</h3>
      <p className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", lineHeight: 1.65, fontWeight: 300 }}>{desc}</p>
    </div>
  )
}
