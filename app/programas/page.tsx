"use client"

import { useEffect, useRef, useState } from "react"

const R = "#E8000D"

function FadeIn({ children, delay = 0, from = "bottom" }: {
  children: React.ReactNode; delay?: number; from?: "bottom" | "left" | "right"
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
    }}>{children}</div>
  )
}

export default function Programas() {
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
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,900&family=Barlow:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${R}; color: #fff; }
        .bc { font-family: 'Barlow Condensed', Impact, sans-serif; }
        .b  { font-family: 'Barlow', sans-serif; }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulseR  { 0%,100%{box-shadow:0 0 0 0 ${R}50} 50%{box-shadow:0 0 0 10px transparent} }
        @keyframes breathe { 0%,100%{opacity:0.6} 50%{opacity:1} }
      `}</style>

      {/* ══ HERO ════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>

        {/* Imagen parallax */}
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${scrollY * 0.25}px)`, willChange: "transform" }}>
          <img src="/gym-2.jpg" alt=""
            style={{ width: "100%", height: "110%", objectFit: "cover", filter: "grayscale(30%) contrast(1.1)", opacity: 0.35 }} />
        </div>

        {/* Overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #000 45%, rgba(0,0,0,0.65) 70%, rgba(0,0,0,0.25) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #000 0%, transparent 55%)" }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 75% 40%, ${R}12 0%, transparent 50%)` }} />

        {/* Línea roja vertical */}
        <div style={{
          position: "absolute", left: "max(32px, calc(50vw - 700px))",
          top: 0, bottom: 0, width: 2,
          background: `linear-gradient(to bottom, transparent, ${R} 25%, ${R} 75%, transparent)`,
          opacity: heroIn ? 1 : 0, transition: "opacity 1.2s ease 0.5s",
        }} />

        {/* Contenido */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 1400, margin: "0 auto", padding: "140px 64px 100px", width: "100%" }}>

          <div style={{
            display: "flex", alignItems: "center", gap: 14, marginBottom: 28,
            opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)",
            transition: "all 0.7s ease 0.2s",
          }}>
            <div style={{ width: 40, height: 2, background: R }} />
            <span className="bc" style={{ color: R, fontSize: 12, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>
              Programas · Estructura · Resultados
            </span>
          </div>

          <div style={{ overflow: "hidden" }}>
            <h1 className="bc" style={{ fontSize: "clamp(56px, 9vw, 140px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.87, letterSpacing: "-0.02em" }}>
              <span style={{
                display: "block",
                opacity: heroIn ? 1 : 0, transform: heroIn ? "translateY(0)" : "translateY(100%)",
                transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.3s",
              }}>NO DISEÑO</span>
              <span style={{
                display: "block",
                opacity: heroIn ? 1 : 0, transform: heroIn ? "translateY(0)" : "translateY(100%)",
                transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.42s",
              }}>"RUTINAS".</span>
              <span style={{
                display: "block", color: R, textShadow: `0 0 80px ${R}50`,
                opacity: heroIn ? 1 : 0, transform: heroIn ? "translateY(0)" : "translateY(100%)",
                transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.54s",
              }}>CONSTRUYO</span>
              <span style={{
                display: "block",
                opacity: heroIn ? 1 : 0, transform: heroIn ? "translateY(0)" : "translateY(100%)",
                transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.66s",
              }}>RESULTADOS.</span>
            </h1>
          </div>

          <p className="b" style={{
            marginTop: 36, fontSize: "clamp(15px, 1.4vw, 19px)",
            color: "rgba(255,255,255,0.5)", maxWidth: 460, lineHeight: 1.7, fontWeight: 300,
            opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)",
            transition: "all 0.7s ease 0.9s",
          }}>
            Cada programa está diseñado con estructura, seguimiento y progresión real.
            No improvisamos — ejecutamos de acuerdo con tus condiciones.
          </p>

          {/* Anclas a secciones */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 12, marginTop: 52,
            opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)",
            transition: "all 0.7s ease 1.1s",
          }}>
            {[
              { label: "Entrenamiento", href: "#entrenamiento" },
              { label: "Alimentación", href: "#alimentacion" },
              { label: "Programa Duo", href: "#duo" },
            ].map((a, i) => (
              <a key={a.href} href={a.href} className="bc" style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 24px",
                border: `1px solid ${i === 2 ? R : "rgba(255,255,255,0.15)"}`,
                background: i === 2 ? `${R}18` : "transparent",
                color: i === 2 ? "#fff" : "rgba(255,255,255,0.5)",
                fontSize: 13, fontWeight: 700, letterSpacing: "0.2em",
                textTransform: "uppercase", textDecoration: "none",
                transition: "all 0.25s ease",
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = R; el.style.color = "#fff" }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = i === 2 ? R : "rgba(255,255,255,0.15)"; el.style.color = i === 2 ? "#fff" : "rgba(255,255,255,0.5)" }}
              >
                <span style={{ color: R }}>0{i + 1}</span> {a.label}
              </a>
            ))}
          </div>
        </div>

        {/* Marquee */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
          padding: "13px 0", overflow: "hidden",
          opacity: heroIn ? 1 : 0, transition: "opacity 1s ease 1.5s",
        }}>
          <div style={{ display: "flex", animation: "marquee 22s linear infinite", width: "max-content" }}>
            {Array(6).fill(null).map((_, i) => (
              <span key={i} className="bc" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.13)", paddingRight: 80, whiteSpace: "nowrap" }}>
                Entrenamiento · Alimentación · Seguimiento · Progresión · Sin Improvisación ·&nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROGRAMA 01 — ENTRENAMIENTO ════════════════════════════ */}
      <section id="entrenamiento" style={{ position: "relative", overflow: "hidden" }}>

        {/* Número decorativo de fondo */}
        <div className="bc" style={{
          position: "absolute", right: -40, top: "50%", transform: "translateY(-50%)",
          fontSize: "40vw", fontWeight: 900, color: "rgba(255,255,255,0.012)",
          lineHeight: 1, pointerEvents: "none", userSelect: "none", letterSpacing: "-0.05em",
        }}>01</div>

        <div style={{ position: "relative", maxWidth: 1400, margin: "0 auto", padding: "140px 64px" }}>

          {/* Header sección */}
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 80 }}>
              <div style={{ width: 40, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 12, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>
                Programa 01
              </span>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

            {/* Texto */}
            <FadeIn from="left">
              <div>
                <h2 className="bc" style={{ fontSize: "clamp(48px, 5vw, 80px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em", marginBottom: 32 }}>
                  PROGRAMA DE<br />ENTRENAMIENTO<br />
                  <span style={{ color: R }}>PERSONALIZADO</span>
                </h2>

                <p className="b" style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, fontWeight: 300, marginBottom: 40, maxWidth: 460 }}>
                  Un sistema de coaching estructurado basado en la ciencia del entrenamiento de fuerza e hipertrofia: volumen, intensidad, tensión mecánica y sobrecarga progresiva.
                </p>

                {/* Lista de beneficios */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 48 }}>
                  {[
                    "Recolección de información (historial físico y médico)",
                    "Pruebas físicas diagnósticas",
                    "Programa estructurado por objetivos",
                    "Progresión planificada semana a semana",
                    "Ajustes según rendimiento real",
                    "Seguimiento 1 a 1 constante",
                    "Aprenderás a entrenar de forma óptima",
                  ].map((item, i) => (
                    <BenefitRow key={i} text={item} delay={i * 60} />
                  ))}
                </div>

                {/* Precio + CTA */}
                <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
                  <div>
                    <div className="bc" style={{ fontSize: "clamp(44px, 4vw, 64px)", fontWeight: 900, color: R, lineHeight: 1 }}>
                      $140.000
                    </div>
                    <div className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>
                      por mes
                    </div>
                  </div>

                  <a href="/asesoria" className="bc" style={{
                    display: "inline-flex", alignItems: "center", gap: 12,
                    background: R, color: "#fff", padding: "18px 44px",
                    fontSize: 15, fontWeight: 900, letterSpacing: "0.22em",
                    textTransform: "uppercase", textDecoration: "none",
                    clipPath: "polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))",
                    boxShadow: `0 12px 40px ${R}40`,
                    transition: "all 0.25s ease",
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "#fff"; el.style.color = "#000"; el.style.boxShadow = "none" }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = R; el.style.color = "#fff"; el.style.boxShadow = `0 12px 40px ${R}40` }}
                  >
                    Aplicar <span style={{ fontSize: 18 }}>→</span>
                  </a>
                </div>
              </div>
            </FadeIn>

            {/* Imagen */}
            <FadeIn from="right" delay={150}>
              <div style={{ position: "relative" }}>
                <img src="/Entrenando_1.jpeg" alt="Programa de entrenamiento"
                  style={{ width: "100%", objectFit: "cover", filter: "grayscale(15%) contrast(1.05)", display: "block" }} />

                {/* Overlays decorativos */}
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 60%, ${R}15)` }} />
                <div style={{ position: "absolute", top: -16, right: -16, bottom: 16, left: 16, border: `1px solid ${R}25`, pointerEvents: "none" }} />

                {/* Badge flotante */}
                <div style={{
                  position: "absolute", top: 24, left: 24,
                  background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
                  border: `1px solid ${R}40`, padding: "12px 20px",
                }}>
                  <div className="bc" style={{ fontSize: 11, color: R, letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700 }}>
                    Hipertrofia · Fuerza
                  </div>
                </div>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* Divisor */}
      <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${R}40, transparent)` }} />

      {/* ══ PROGRAMA 02 — ALIMENTACIÓN ═════════════════════════════ */}
      <section id="alimentacion" style={{ position: "relative", background: "#050505", overflow: "hidden" }}>

        <div className="bc" style={{
          position: "absolute", left: -40, top: "50%", transform: "translateY(-50%)",
          fontSize: "40vw", fontWeight: 900, color: "rgba(255,255,255,0.012)",
          lineHeight: 1, pointerEvents: "none", userSelect: "none", letterSpacing: "-0.05em",
        }}>02</div>

        <div style={{ position: "relative", maxWidth: 1400, margin: "0 auto", padding: "140px 64px" }}>

          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 80 }}>
              <div style={{ width: 40, height: 2, background: "rgba(255,255,255,0.2)" }} />
              <span className="bc" style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>
                Programa 02
              </span>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

            {/* Imagen izquierda */}
            <FadeIn from="left" delay={150}>
              <div style={{ position: "relative" }}>
                <img src="/comida.jpg" alt="Plan de alimentación"
                  style={{ width: "100%", objectFit: "cover", filter: "grayscale(10%) contrast(1.05)", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 50%, rgba(5,5,5,0.8))` }} />
                <div style={{ position: "absolute", top: 16, left: -16, bottom: -16, right: 16, border: `1px solid rgba(255,255,255,0.08)`, pointerEvents: "none" }} />

                {/* Badge */}
                <div style={{
                  position: "absolute", bottom: 24, right: 24,
                  background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.1)", padding: "12px 20px",
                }}>
                  <div className="bc" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700 }}>
                    Adherencia · Resultados
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Texto derecha */}
            <FadeIn from="right">
              <div>
                <h2 className="bc" style={{ fontSize: "clamp(48px, 5vw, 80px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em", marginBottom: 32 }}>
                  ESTRATEGIA DE<br />
                  <span style={{ color: R }}>ALIMENTACIÓN</span><br />
                  PERSONALIZADA
                </h2>

                <p className="b" style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, fontWeight: 300, marginBottom: 40, maxWidth: 460 }}>
                  No es una dieta genérica. Es una estrategia de alimentación adaptada a tu contexto, hábitos y preferencias reales — diseñada para que puedas sostenerla en el tiempo.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 48 }}>
                  {[
                    "Revisión de hábitos alimenticios actuales",
                    "Recolección de información detallada",
                    "Guía adaptada a tus gustos y preferencias",
                    "Ajustes constantes según evolución",
                    "Seguimiento continuo",
                  ].map((item, i) => (
                    <BenefitRow key={i} text={item} delay={i * 60} />
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
                  <div>
                    <div className="bc" style={{ fontSize: "clamp(44px, 4vw, 64px)", fontWeight: 900, color: R, lineHeight: 1 }}>
                      $130.000
                    </div>
                    <div className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>
                      por mes
                    </div>
                  </div>

                  <a href="/nutricion-cuestionario" className="bc" style={{
                    display: "inline-flex", alignItems: "center", gap: 12,
                    border: `1px solid rgba(255,255,255,0.2)`, color: "rgba(255,255,255,0.7)",
                    padding: "18px 44px", fontSize: 15, fontWeight: 900,
                    letterSpacing: "0.22em", textTransform: "uppercase", textDecoration: "none",
                    transition: "all 0.25s ease",
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = R; el.style.color = "#fff"; el.style.background = `${R}10` }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "rgba(255,255,255,0.2)"; el.style.color = "rgba(255,255,255,0.7)"; el.style.background = "transparent" }}
                  >
                    Iniciar evaluación <span style={{ fontSize: 18 }}>→</span>
                  </a>
                </div>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* Divisor */}
      <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${R}40, transparent)` }} />

      {/* ══ PROGRAMA 03 — DUO ══════════════════════════════════════ */}
      <section id="duo" style={{ position: "relative", overflow: "hidden", background: "#000" }}>

        {/* Fondo con grilla */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.4,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 50%, ${R}10 0%, transparent 65%)` }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right, transparent, ${R}, transparent)` }} />

        <div style={{ position: "relative", maxWidth: 1400, margin: "0 auto", padding: "140px 64px" }}>

          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40 }}>
              <div style={{ width: 40, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 12, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>
                Programa 03 · Recomendado
              </span>
            </div>

            <h2 className="bc" style={{ fontSize: "clamp(56px, 7vw, 110px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.87, letterSpacing: "-0.02em", marginBottom: 20 }}>
              ENTRENA Y<br />COME COMO<br />
              <span style={{ color: R, textShadow: `0 0 80px ${R}50` }}>UN SISTEMA.</span>
            </h2>

            <p className="b" style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontWeight: 300, maxWidth: 560, marginBottom: 72 }}>
              El progreso real ocurre cuando entrenamiento y nutrición trabajan juntos. No como dos cosas separadas — como un sistema integrado.
            </p>
          </FadeIn>

          {/* Card DUO */}
          <FadeIn delay={150}>
            <div style={{
              border: `2px solid ${R}`, background: "rgba(232,0,13,0.04)",
              position: "relative", overflow: "hidden",
              boxShadow: `0 0 80px ${R}18, inset 0 0 80px ${R}08`,
            }}>

              {/* Brillo esquina */}
              <div style={{ position: "absolute", top: -80, right: -80, width: 240, height: 240, background: `${R}15`, borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>

                {/* Columna izquierda — detalles */}
                <div style={{ padding: "64px 56px", borderRight: `1px solid ${R}20` }}>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
                    <div style={{ width: 8, height: 8, background: R, animation: "breathe 2s ease infinite" }} />
                    <span className="bc" style={{ fontSize: 11, color: R, letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700 }}>
                      Programa DUO — Todo incluido
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 52 }}>
                    {[
                      { cat: "Entrenamiento", items: ["Programa personalizado completo", "Progresión planificada", "Ajustes según rendimiento"] },
                      { cat: "Alimentación", items: ["Guía adaptada a tus gustos", "Ajustes constantes", "Seguimiento continuo"] },
                      { cat: "Beneficios exclusivos", items: ["Seguimiento completo integrado", "Tips y recomendaciones avanzadas", "Mayor velocidad de progreso"] },
                    ].map((group, gi) => (
                      <div key={group.cat} style={{ marginBottom: 28 }}>
                        <div className="bc" style={{ fontSize: 11, color: R, letterSpacing: "0.35em", textTransform: "uppercase", fontWeight: 700, marginBottom: 14 }}>
                          {group.cat}
                        </div>
                        {group.items.map((item, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <div style={{ width: 5, height: 5, background: R, flexShrink: 0, transform: "rotate(45deg)" }} />
                            <span className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", fontWeight: 300 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Columna derecha — precio */}
                <div style={{ padding: "64px 56px", display: "flex", flexDirection: "column", justifyContent: "center" }}>

                  {/* Precio tachado */}
                  <div style={{ marginBottom: 8 }}>
                    <span className="bc" style={{ fontSize: 24, color: "rgba(255,255,255,0.2)", textDecoration: "line-through", fontWeight: 700 }}>
                      $270.000
                    </span>
                    <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginLeft: 8 }}>/mes</span>
                  </div>

                  {/* Precio real */}
                  <div className="bc" style={{ fontSize: "clamp(56px, 5vw, 80px)", fontWeight: 900, color: R, lineHeight: 1, letterSpacing: "-0.02em" }}>
                    $220.000
                  </div>
                  <div className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 6, marginBottom: 24 }}>
                    por mes
                  </div>

                  {/* Badge descuento */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: R, color: "#fff", padding: "8px 16px",
                    width: "fit-content", marginBottom: 40,
                  }}>
                    <span className="bc" style={{ fontSize: 22, fontWeight: 900 }}>20%</span>
                    <span className="bc" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>de descuento</span>
                  </div>

                  {/* Ahorro */}
                  <div style={{ padding: "16px 20px", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 40, background: "rgba(255,255,255,0.02)" }}>
                    <div className="bc" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>Ahorro mensual</div>
                    <div className="bc" style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>$50.000</div>
                  </div>

                  {/* CTA */}
                  <a
                    href="https://wa.me/573243747367?text=Hola Coach David, quiero el programa DUO."
                    target="_blank" rel="noopener noreferrer"
                    className="bc"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
                      background: R, color: "#fff", padding: "20px",
                      fontSize: 16, fontWeight: 900, letterSpacing: "0.22em",
                      textTransform: "uppercase", textDecoration: "none",
                      boxShadow: `0 20px 60px ${R}50`,
                      clipPath: "polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))",
                      transition: "all 0.25s ease",
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "#fff"; el.style.color = "#000"; el.style.boxShadow = "none" }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = R; el.style.color = "#fff"; el.style.boxShadow = `0 20px 60px ${R}50` }}
                  >
                    Empezar ahora <span style={{ fontSize: 22 }}>→</span>
                  </a>

                  <p className="b" style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.2)", letterSpacing: "0.05em" }}>
                    Vía WhatsApp · Respuesta inmediata
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ COMPARATIVA ════════════════════════════════════════════ */}
      <section style={{ background: "#080808", padding: "100px 64px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>

          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 36, height: 2, background: "rgba(255,255,255,0.15)" }} />
              <span className="bc" style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Comparativa</span>
            </div>
            <h2 className="bc" style={{ fontSize: "clamp(36px, 4vw, 60px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 56 }}>
              ¿CUÁL ES EL<br /><span style={{ color: R }}>INDICADO PARA TI?</span>
            </h2>
          </FadeIn>

          {/* Tabla comparativa */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 1, background: "rgba(255,255,255,0.04)" }}>

            {/* Header */}
            {["", "Entrenamiento", "Alimentación", "DUO ★"].map((h, i) => (
              <div key={h} style={{
                padding: "20px 24px",
                background: i === 3 ? `${R}15` : "#080808",
                borderBottom: `2px solid ${i === 3 ? R : "rgba(255,255,255,0.06)"}`,
              }}>
                <span className="bc" style={{
                  fontSize: i === 0 ? 12 : 16, fontWeight: 800,
                  textTransform: "uppercase", letterSpacing: i === 0 ? "0.3em" : "0.05em",
                  color: i === 3 ? R : i === 0 ? "rgba(255,255,255,0.25)" : "#fff",
                }}>{h}</span>
              </div>
            ))}

            {/* Filas */}
            {[
              { feat: "Programa de entrenamiento",    e: true,  a: false, d: true },
              { feat: "Plan de alimentación",         e: false, a: true,  d: true },
              { feat: "Seguimiento 1 a 1",            e: true,  a: true,  d: true },
              { feat: "Progresión planificada",       e: true,  a: false, d: true },
              { feat: "Ajustes constantes",           e: true,  a: true,  d: true },
              { feat: "Tips avanzados exclusivos",    e: false, a: false, d: true },
              { feat: "Mayor velocidad de progreso",  e: false, a: false, d: true },
              { feat: "Precio mensual",               e: "$140.000", a: "$130.000", d: "$220.000" },
            ].map((row, ri) => (
              [
                <div key={`f${ri}`} style={{ padding: "16px 24px", background: "#080808", display: "flex", alignItems: "center" }}>
                  <span className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>{row.feat}</span>
                </div>,
                ...[row.e, row.a, row.d].map((val, ci) => (
                  <div key={`${ri}-${ci}`} style={{
                    padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "center",
                    background: ci === 2 ? `${R}08` : "#080808",
                    borderLeft: `1px solid rgba(255,255,255,0.04)`,
                  }}>
                    {typeof val === "boolean" ? (
                      val
                        ? <span style={{ color: R, fontSize: 18, fontWeight: 900 }}>◈</span>
                        : <span style={{ color: "rgba(255,255,255,0.1)", fontSize: 18 }}>—</span>
                    ) : (
                      <span className="bc" style={{ fontSize: 16, fontWeight: 800, color: ci === 2 ? R : "rgba(255,255,255,0.7)" }}>{val}</span>
                    )}
                  </div>
                ))
              ]
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ═══════════════════════════════════════════════ */}
      <section style={{ position: "relative", padding: "140px 64px", background: "#000", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, ${R}0e 0%, transparent 60%)` }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${R}70, transparent)` }} />

        <div style={{ position: "relative", maxWidth: 900, margin: "0 auto" }}>
          <FadeIn>
            <span className="bc" style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700 }}>
              El siguiente paso
            </span>

            <h2 className="bc" style={{ fontSize: "clamp(48px, 7vw, 100px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em", marginTop: 20 }}>
              QUIERO AYUDARTE<br />A QUE LO HAGAS<br />
              <span style={{ color: R, textShadow: `0 0 60px ${R}60` }}>DE FORMA CORRECTA.</span>
            </h2>

            <p className="b" style={{ marginTop: 28, fontSize: 17, color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>
              Avancemos a un nuevo nivel. Con un sistema real.
            </p>

            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: 52 }}>
              <a href="/asesoria" className="bc" style={{
                display: "inline-flex", alignItems: "center", gap: 14,
                background: R, color: "#fff", padding: "20px 56px",
                fontSize: 15, fontWeight: 900, letterSpacing: "0.22em",
                textTransform: "uppercase", textDecoration: "none",
                boxShadow: `0 20px 60px ${R}45`,
                clipPath: "polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))",
                transition: "all 0.25s ease",
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "#fff"; el.style.color = "#000"; el.style.boxShadow = "none" }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = R; el.style.color = "#fff"; el.style.boxShadow = `0 20px 60px ${R}45` }}
              >
                Aplicar a asesoría <span style={{ fontSize: 20 }}>→</span>
              </a>

              <a href="https://wa.me/573243747367" target="_blank" rel="noopener noreferrer" className="bc" style={{
                display: "inline-flex", alignItems: "center", gap: 14,
                border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.55)",
                padding: "20px 56px", fontSize: 15, fontWeight: 900,
                letterSpacing: "0.22em", textTransform: "uppercase", textDecoration: "none",
                transition: "all 0.25s ease",
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = R; el.style.color = "#fff" }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "rgba(255,255,255,0.15)"; el.style.color = "rgba(255,255,255,0.55)" }}
              >
                Escribir por WhatsApp
              </a>
            </div>

            <p className="b" style={{ marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.18)", letterSpacing: "0.05em" }}>
              Sin compromisos. Una conversación para ver si hay fit.
            </p>
          </FadeIn>
        </div>
      </section>

    </main>
  )
}

/* ── Fila de beneficio con animación ──────────────────────────── */
function BenefitRow({ text, delay }: { text: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el); return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      opacity: v ? 1 : 0, transform: v ? "translateX(0)" : "translateX(-20px)",
    }}>
      <div style={{ width: 5, height: 5, background: R, flexShrink: 0, transform: "rotate(45deg)" }} />
      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.6)", fontWeight: 300 }}>{text}</span>
    </div>
  )
}
