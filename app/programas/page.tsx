"use client"

import { useEffect, useRef, useState } from "react"

const R = "#E8000D"

/* ── Hook responsive ──────────────────────────────────────────── */
function useBreakpoint() {
  const [w, setW] = useState(1200)
  useEffect(() => {
    const check = () => setW(window.innerWidth)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return { isMobile: w < 768, isTablet: w < 1024, w }
}

/* ── FadeIn ───────────────────────────────────────────────────── */
function FadeIn({ children, delay = 0, from = "bottom" }: {
  children: React.ReactNode; delay?: number; from?: "bottom" | "left" | "right"
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } },
      { threshold: 0.06 }
    )
    obs.observe(el); return () => obs.disconnect()
  }, [])
  const tx = from === "left" ? "-32px" : from === "right" ? "32px" : "0"
  const ty = from === "bottom" ? "36px" : "0"
  return (
    <div ref={ref} style={{
      transition: `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      opacity: v ? 1 : 0, transform: v ? "translate(0,0)" : `translate(${tx},${ty})`,
    }}>{children}</div>
  )
}

/* ── BenefitRow ───────────────────────────────────────────────── */
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
      display: "flex", alignItems: "center", gap: 12,
      padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      opacity: v ? 1 : 0, transform: v ? "translateX(0)" : "translateX(-16px)",
    }}>
      <div style={{ width: 5, height: 5, background: R, flexShrink: 0, transform: "rotate(45deg)" }} />
      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.6)", fontWeight: 300 }}>{text}</span>
    </div>
  )
}

/* ══ COMPONENTE PRINCIPAL ═════════════════════════════════════════ */
export default function Programas() {
  const { isMobile, isTablet } = useBreakpoint()
  const [scrollY, setScrollY] = useState(0)
  const [heroIn, setHeroIn] = useState(false)

  useEffect(() => {
    setTimeout(() => setHeroIn(true), 80)
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const pad = isMobile ? "72px 20px" : isTablet ? "100px 32px" : "140px 64px"
  const titleSize = isMobile ? "clamp(40px, 11vw, 60px)" : "clamp(48px, 5vw, 80px)"

  return (
    <main style={{ background: "#000", color: "#fff", fontFamily: "'Barlow', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,900&family=Barlow:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${R}; color: #fff; }
        .bc { font-family: 'Barlow Condensed', Impact, sans-serif; }
        .b  { font-family: 'Barlow', sans-serif; }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes breathe { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes glow    { 0%,100%{box-shadow:0 0 20px ${R}30} 50%{box-shadow:0 0 50px ${R}55} }
      `}</style>

      {/* ══ HERO ════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>

        {/* Imagen — parallax solo en desktop */}
        <div style={{ position: "absolute", inset: 0, transform: isMobile ? "none" : `translateY(${scrollY * 0.25}px)`, willChange: "transform" }}>
          <img src="/gym-2.jpg" alt="" style={{ width: "100%", height: "110%", objectFit: "cover", filter: "grayscale(30%) contrast(1.1)", opacity: isMobile ? 0.25 : 0.35 }} />
        </div>

        {/* Overlays */}
        <div style={{ position: "absolute", inset: 0, background: isMobile ? "linear-gradient(to bottom, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.78) 100%)" : "linear-gradient(to right, #000 45%, rgba(0,0,0,0.65) 70%, rgba(0,0,0,0.25) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #000 0%, transparent 55%)" }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 75% 40%, ${R}10 0%, transparent 50%)` }} />

        {/* Línea vertical — solo desktop */}
        {!isMobile && (
          <div style={{ position: "absolute", left: "max(32px, calc(50vw - 700px))", top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, transparent, ${R} 25%, ${R} 75%, transparent)`, opacity: heroIn ? 1 : 0, transition: "opacity 1.2s ease 0.5s" }} />
        )}

        {/* Contenido */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 1400, margin: "0 auto", padding: isMobile ? "100px 20px 80px" : "140px 64px 100px", width: "100%" }}>

          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)", transition: "all 0.7s ease 0.2s" }}>
            <div style={{ width: 32, height: 2, background: R }} />
            <span className="bc" style={{ color: R, fontSize: isMobile ? 11 : 12, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase" }}>
              Programas · Estructura · Resultados
            </span>
          </div>

          {/* Título */}
          <div style={{ marginBottom: isMobile ? 24 : 32 }}>
            {["NO DISEÑO", '"RUTINAS".', "CONSTRUYO", "RESULTADOS."].map((line, i) => (
              <div key={line} style={{ opacity: heroIn ? 1 : 0, transform: heroIn ? "translateY(0)" : "translateY(80px)", transition: `all 0.9s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.12}s` }}>
                <span className="bc" style={{
                  display: "block",
                  fontSize: isMobile ? "clamp(48px, 13vw, 68px)" : "clamp(56px, 9vw, 140px)",
                  fontWeight: 900, textTransform: "uppercase", lineHeight: 0.87, letterSpacing: "-0.02em",
                  color: i === 2 ? R : "#fff",
                  textShadow: i === 2 ? `0 0 60px ${R}45` : "none",
                }}>{line}</span>
              </div>
            ))}
          </div>

          {/* Subtítulo */}
          <p className="b" style={{ fontSize: isMobile ? 15 : 17, color: "rgba(255,255,255,0.5)", maxWidth: 460, lineHeight: 1.7, fontWeight: 300, opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)", transition: "all 0.7s ease 0.9s", marginBottom: isMobile ? 32 : 48 }}>
            Cada programa está diseñado con estructura, seguimiento y progresión real. No improvisamos.
          </p>

          {/* Anclas */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)", transition: "all 0.7s ease 1.1s" }}>
            {[{ label: "Entrenamiento", href: "#entrenamiento" }, { label: "Alimentación", href: "#alimentacion" }, { label: "Programa Duo", href: "#duo" }].map((a, i) => (
              <a key={a.href} href={a.href} className="bc" style={{
                display: "flex", alignItems: "center", gap: 8, padding: isMobile ? "10px 16px" : "12px 24px",
                border: `1px solid ${i === 2 ? R : "rgba(255,255,255,0.15)"}`,
                background: i === 2 ? `${R}18` : "transparent",
                color: i === 2 ? "#fff" : "rgba(255,255,255,0.5)",
                fontSize: isMobile ? 12 : 13, fontWeight: 700, letterSpacing: "0.18em",
                textTransform: "uppercase", textDecoration: "none", transition: "all 0.25s ease",
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
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", padding: "11px 0", overflow: "hidden", opacity: heroIn ? 1 : 0, transition: "opacity 1s ease 1.5s" }}>
          <div style={{ display: "flex", animation: "marquee 22s linear infinite", width: "max-content" }}>
            {Array(6).fill(null).map((_, i) => (
              <span key={i} className="bc" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.12)", paddingRight: 60, whiteSpace: "nowrap" }}>
                Entrenamiento · Alimentación · Seguimiento · Progresión · Sin Improvisación ·&nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROGRAMA 01 — ENTRENAMIENTO ════════════════════════════ */}
      <section id="entrenamiento" style={{ position: "relative", overflow: "hidden" }}>
        {!isMobile && (
          <div className="bc" style={{ position: "absolute", right: -40, top: "50%", transform: "translateY(-50%)", fontSize: "40vw", fontWeight: 900, color: "rgba(255,255,255,0.012)", lineHeight: 1, pointerEvents: "none", userSelect: "none", letterSpacing: "-0.05em" }}>01</div>
        )}

        <div style={{ position: "relative", maxWidth: 1400, margin: "0 auto", padding: pad }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: isMobile ? 36 : 64 }}>
              <div style={{ width: 32, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Programa 01</span>
            </div>
          </FadeIn>

          {/* Grid — columna única en móvil, imagen abajo */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 48 : 80, alignItems: "center" }}>

            <FadeIn from={isMobile ? "bottom" : "left"}>
              <div>
                <h2 className="bc" style={{ fontSize: titleSize, fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em", marginBottom: 24 }}>
                  PROGRAMA DE<br />ENTRENAMIENTO<br /><span style={{ color: R }}>PERSONALIZADO</span>
                </h2>
                <p className="b" style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, fontWeight: 300, marginBottom: 32 }}>
                  Un sistema de coaching estructurado basado en la ciencia del entrenamiento de fuerza e hipertrofia: volumen, intensidad, tensión mecánica y sobrecarga progresiva.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 40 }}>
                  {["Recolección de información (historial físico y médico)", "Pruebas físicas diagnósticas", "Programa estructurado por objetivos", "Progresión planificada semana a semana", "Ajustes según rendimiento real", "Seguimiento 1 a 1 constante", "Aprenderás a entrenar de forma óptima"].map((item, i) => (
                    <BenefitRow key={i} text={item} delay={i * 50} />
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 20 : 32, flexWrap: "wrap" }}>
                  <div>
                    <div className="bc" style={{ fontSize: isMobile ? 48 : "clamp(44px, 4vw, 64px)", fontWeight: 900, color: R, lineHeight: 1 }}>$140.000</div>
                    <div className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>por mes</div>
                  </div>
                  <CTABtn href="/asesoria" primary>Aplicar →</CTABtn>
                </div>
              </div>
            </FadeIn>

            <FadeIn from={isMobile ? "bottom" : "right"} delay={isMobile ? 0 : 150}>
              <div style={{ position: "relative" }}>
                <img src="/Entrenando_1.jpeg" alt="Programa de entrenamiento" style={{ width: "100%", objectFit: "cover", filter: "grayscale(15%) contrast(1.05)", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 60%, ${R}15)` }} />
                {!isMobile && <div style={{ position: "absolute", top: -16, right: -16, bottom: 16, left: 16, border: `1px solid ${R}25`, pointerEvents: "none" }} />}
                <div style={{ position: "absolute", top: 20, left: 20, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", border: `1px solid ${R}40`, padding: "10px 16px" }}>
                  <div className="bc" style={{ fontSize: 11, color: R, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700 }}>Hipertrofia · Fuerza</div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${R}40, transparent)` }} />

      {/* ══ PROGRAMA 02 — ALIMENTACIÓN ═════════════════════════════ */}
      <section id="alimentacion" style={{ position: "relative", background: "#050505", overflow: "hidden" }}>
        {!isMobile && (
          <div className="bc" style={{ position: "absolute", left: -40, top: "50%", transform: "translateY(-50%)", fontSize: "40vw", fontWeight: 900, color: "rgba(255,255,255,0.012)", lineHeight: 1, pointerEvents: "none", userSelect: "none", letterSpacing: "-0.05em" }}>02</div>
        )}

        <div style={{ position: "relative", maxWidth: 1400, margin: "0 auto", padding: pad }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: isMobile ? 36 : 64 }}>
              <div style={{ width: 32, height: 2, background: "rgba(255,255,255,0.2)" }} />
              <span className="bc" style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Programa 02</span>
            </div>
          </FadeIn>

          {/* En móvil: texto primero, imagen abajo. En desktop: imagen izq, texto der */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 48 : 80, alignItems: "center" }}>

            {/* Imagen — en móvil va después del texto via order */}
            <div style={{ order: isMobile ? 2 : 1, position: "relative" }}>
              <FadeIn from={isMobile ? "bottom" : "left"} delay={isMobile ? 0 : 150}>
                <div style={{ position: "relative" }}>
                  <img src="/comida.jpg" alt="Plan de alimentación" style={{ width: "100%", objectFit: "cover", filter: "grayscale(10%) contrast(1.05)", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 50%, rgba(5,5,5,0.8))` }} />
                  {!isMobile && <div style={{ position: "absolute", top: 16, left: -16, bottom: -16, right: 16, border: `1px solid rgba(255,255,255,0.08)`, pointerEvents: "none" }} />}
                  <div style={{ position: "absolute", bottom: 20, right: 20, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 16px" }}>
                    <div className="bc" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700 }}>Adherencia · Resultados</div>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Texto */}
            <div style={{ order: isMobile ? 1 : 2 }}>
              <FadeIn from={isMobile ? "bottom" : "right"}>
                <div>
                  <h2 className="bc" style={{ fontSize: titleSize, fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em", marginBottom: 24 }}>
                    ESTRATEGIA DE<br /><span style={{ color: R }}>ALIMENTACIÓN</span><br />PERSONALIZADA
                  </h2>
                  <p className="b" style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, fontWeight: 300, marginBottom: 32 }}>
                    No es una dieta genérica. Es una estrategia adaptada a tu contexto, hábitos y preferencias reales — diseñada para que puedas sostenerla en el tiempo.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 40 }}>
                    {["Revisión de hábitos alimenticios actuales", "Recolección de información detallada", "Guía adaptada a tus gustos y preferencias", "Ajustes constantes según evolución", "Seguimiento continuo"].map((item, i) => (
                      <BenefitRow key={i} text={item} delay={i * 50} />
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 20 : 32, flexWrap: "wrap" }}>
                    <div>
                      <div className="bc" style={{ fontSize: isMobile ? 48 : "clamp(44px, 4vw, 64px)", fontWeight: 900, color: R, lineHeight: 1 }}>$130.000</div>
                      <div className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>por mes</div>
                    </div>
                    <CTABtn href="/nutricion-cuestionario" outline>Iniciar evaluación →</CTABtn>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${R}40, transparent)` }} />

      {/* ══ PROGRAMA 03 — DUO ══════════════════════════════════════ */}
      <section id="duo" style={{ position: "relative", overflow: "hidden", background: "#000" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.35, backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)`, backgroundSize: "60px 60px" }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 50%, ${R}10 0%, transparent 65%)` }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right, transparent, ${R}, transparent)` }} />

        <div style={{ position: "relative", maxWidth: 1400, margin: "0 auto", padding: pad }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div style={{ width: 32, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Programa 03 · Recomendado</span>
            </div>
            <h2 className="bc" style={{ fontSize: isMobile ? "clamp(48px, 12vw, 72px)" : "clamp(56px, 7vw, 110px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.87, letterSpacing: "-0.02em", marginBottom: 16 }}>
              ENTRENA Y<br />COME COMO<br /><span style={{ color: R, textShadow: `0 0 60px ${R}45` }}>UN SISTEMA.</span>
            </h2>
            <p className="b" style={{ fontSize: isMobile ? 15 : 17, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontWeight: 300, maxWidth: 520, marginBottom: isMobile ? 40 : 64 }}>
              El progreso real ocurre cuando entrenamiento y nutrición trabajan juntos — como un sistema integrado.
            </p>
          </FadeIn>

          {/* Card DUO — en móvil: columna única */}
          <FadeIn delay={100}>
            <div style={{ border: `2px solid ${R}`, background: "rgba(232,0,13,0.04)", position: "relative", overflow: "hidden", boxShadow: `0 0 60px ${R}15, inset 0 0 60px ${R}06`, animation: "glow 3s ease infinite" }}>
              <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: `${R}12`, borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none" }} />

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 0 }}>

                {/* Columna izquierda — beneficios */}
                <div style={{ padding: isMobile ? "36px 24px" : "56px 48px", borderRight: isMobile ? "none" : `1px solid ${R}20`, borderBottom: isMobile ? `1px solid ${R}15` : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
                    <div style={{ width: 7, height: 7, background: R, animation: "breathe 2s ease infinite" }} />
                    <span className="bc" style={{ fontSize: 11, color: R, letterSpacing: "0.35em", textTransform: "uppercase", fontWeight: 700 }}>Programa DUO — Todo incluido</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {[
                      { cat: "Entrenamiento", items: ["Programa personalizado completo", "Progresión planificada", "Ajustes según rendimiento"] },
                      { cat: "Alimentación", items: ["Guía adaptada a tus gustos", "Ajustes constantes", "Seguimiento continuo"] },
                      { cat: "Beneficios exclusivos", items: ["Seguimiento completo integrado", "Tips y recomendaciones avanzadas", "Mayor velocidad de progreso"] },
                    ].map((group) => (
                      <div key={group.cat} style={{ marginBottom: 24 }}>
                        <div className="bc" style={{ fontSize: 11, color: R, letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>{group.cat}</div>
                        {group.items.map((item, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <div style={{ width: 5, height: 5, background: R, flexShrink: 0, transform: "rotate(45deg)" }} />
                            <span className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", fontWeight: 300 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Columna derecha — precio */}
                <div style={{ padding: isMobile ? "36px 24px" : "56px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ marginBottom: 8 }}>
                    <span className="bc" style={{ fontSize: isMobile ? 20 : 24, color: "rgba(255,255,255,0.2)", textDecoration: "line-through", fontWeight: 700 }}>$270.000</span>
                    <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginLeft: 8 }}>/mes</span>
                  </div>
                  <div className="bc" style={{ fontSize: isMobile ? "clamp(52px, 14vw, 72px)" : "clamp(52px, 5vw, 76px)", fontWeight: 900, color: R, lineHeight: 1, letterSpacing: "-0.02em" }}>$220.000</div>
                  <div className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 6, marginBottom: 20 }}>por mes</div>

                  {/* Badge descuento */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: R, color: "#fff", padding: "8px 14px", width: "fit-content", marginBottom: isMobile ? 24 : 36 }}>
                    <span className="bc" style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900 }}>20%</span>
                    <span className="bc" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>de descuento</span>
                  </div>

                  {/* Ahorro */}
                  <div style={{ padding: "14px 18px", border: "1px solid rgba(255,255,255,0.07)", marginBottom: isMobile ? 28 : 36, background: "rgba(255,255,255,0.02)" }}>
                    <div className="bc" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 4 }}>Ahorro mensual</div>
                    <div className="bc" style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>$50.000</div>
                  </div>

                  {/* CTA */}
                  <a href="https://wa.me/573243747367?text=Hola Coach David, quiero el programa DUO." target="_blank" rel="noopener noreferrer" className="bc"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: R, color: "#fff", padding: "18px", fontSize: 15, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", boxShadow: `0 16px 48px ${R}45`, clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))", transition: "all 0.25s ease" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "#fff"; el.style.color = "#000"; el.style.boxShadow = "none" }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = R; el.style.color = "#fff"; el.style.boxShadow = `0 16px 48px ${R}45` }}
                  >Empezar ahora →</a>
                  <p className="b" style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Vía WhatsApp · Respuesta inmediata</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ COMPARATIVA ════════════════════════════════════════════ */}
      <section style={{ background: "#080808", padding: isMobile ? "64px 20px" : "100px 64px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 32, height: 2, background: "rgba(255,255,255,0.15)" }} />
              <span className="bc" style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Comparativa</span>
            </div>
            <h2 className="bc" style={{ fontSize: isMobile ? "clamp(36px, 10vw, 52px)" : "clamp(36px, 4vw, 60px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: isMobile ? 36 : 52 }}>
              ¿CUÁL ES EL<br /><span style={{ color: R }}>INDICADO PARA TI?</span>
            </h2>
          </FadeIn>

          {/* Tabla — en móvil: versión simplificada en cards */}
          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { title: "Entrenamiento", price: "$140.000", color: "rgba(255,255,255,0.6)", items: ["✓ Programa personalizado", "✓ Seguimiento 1 a 1", "✓ Progresión planificada", "✓ Ajustes constantes", "— Plan de alimentación", "— Tips avanzados"], href: "/asesoria", cta: "Aplicar" },
                { title: "Alimentación", price: "$130.000", color: "rgba(255,255,255,0.6)", items: ["— Programa de entrenamiento", "✓ Plan de alimentación", "✓ Seguimiento 1 a 1", "— Progresión planificada", "✓ Ajustes constantes", "— Tips avanzados"], href: "/nutricion-cuestionario", cta: "Iniciar evaluación" },
                { title: "DUO ★", price: "$220.000", color: R, items: ["✓ Programa personalizado", "✓ Plan de alimentación", "✓ Seguimiento 1 a 1", "✓ Progresión planificada", "✓ Ajustes constantes", "✓ Tips avanzados exclusivos"], href: "https://wa.me/573243747367?text=Hola Coach David, quiero el programa DUO.", cta: "Empezar ahora", featured: true },
              ].map((card) => (
                <FadeIn key={card.title}>
                  <div style={{ background: card.featured ? `${R}08` : "#0a0a0a", border: `${card.featured ? "2px" : "1px"} solid ${card.featured ? R : "rgba(255,255,255,0.07)"}`, padding: "28px 22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                      <h3 className="bc" style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", color: card.color }}>{card.title}</h3>
                      <div className="bc" style={{ fontSize: 22, fontWeight: 900, color: card.featured ? R : "#fff" }}>{card.price}<span className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>/mes</span></div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                      {card.items.map((item, i) => (
                        <div key={i} className="b" style={{ fontSize: 13, color: item.startsWith("✓") ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.2)", fontWeight: 300 }}>{item}</div>
                      ))}
                    </div>
                    <a href={card.href} target={card.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="bc"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "14px", fontSize: 13, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none", background: card.featured ? R : "transparent", color: card.featured ? "#fff" : "rgba(255,255,255,0.5)", border: card.featured ? "none" : "1px solid rgba(255,255,255,0.12)" }}>
                      {card.cta} →
                    </a>
                  </div>
                </FadeIn>
              ))}
            </div>
          ) : (
            /* Tabla desktop — sin cambios */
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 1, background: "rgba(255,255,255,0.04)" }}>
              {["", "Entrenamiento", "Alimentación", "DUO ★"].map((h, i) => (
                <div key={i} style={{ padding: "20px 24px", background: i === 3 ? `${R}15` : "#080808", borderBottom: `2px solid ${i === 3 ? R : "rgba(255,255,255,0.06)"}` }}>
                  <span className="bc" style={{ fontSize: i === 0 ? 11 : 16, fontWeight: 800, textTransform: "uppercase", letterSpacing: i === 0 ? "0.3em" : "0.05em", color: i === 3 ? R : i === 0 ? "rgba(255,255,255,0.25)" : "#fff" }}>{h}</span>
                </div>
              ))}
              {[
                { feat: "Programa de entrenamiento", e: true, a: false, d: true },
                { feat: "Plan de alimentación", e: false, a: true, d: true },
                { feat: "Seguimiento 1 a 1", e: true, a: true, d: true },
                { feat: "Progresión planificada", e: true, a: false, d: true },
                { feat: "Ajustes constantes", e: true, a: true, d: true },
                { feat: "Tips avanzados exclusivos", e: false, a: false, d: true },
                { feat: "Mayor velocidad de progreso", e: false, a: false, d: true },
                { feat: "Precio mensual", e: "$140.000", a: "$130.000", d: "$220.000" },
              ].map((row, ri) => ([
                <div key={`f${ri}`} style={{ padding: "15px 24px", background: "#080808", display: "flex", alignItems: "center" }}>
                  <span className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>{row.feat}</span>
                </div>,
                ...[row.e, row.a, row.d].map((val, ci) => (
                  <div key={`${ri}-${ci}`} style={{ padding: "15px 24px", display: "flex", alignItems: "center", justifyContent: "center", background: ci === 2 ? `${R}08` : "#080808", borderLeft: "1px solid rgba(255,255,255,0.04)" }}>
                    {typeof val === "boolean"
                      ? val ? <span style={{ color: R, fontSize: 17, fontWeight: 900 }}>◈</span> : <span style={{ color: "rgba(255,255,255,0.1)", fontSize: 17 }}>—</span>
                      : <span className="bc" style={{ fontSize: 15, fontWeight: 800, color: ci === 2 ? R : "rgba(255,255,255,0.7)" }}>{val}</span>
                    }
                  </div>
                ))
              ]))}
            </div>
          )}
        </div>
      </section>

      {/* ══ CTA FINAL ═══════════════════════════════════════════════ */}
      <section style={{ position: "relative", padding: isMobile ? "80px 20px" : "140px 64px", background: "#000", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, ${R}0d 0%, transparent 60%)` }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${R}70, transparent)` }} />

        <div style={{ position: "relative", maxWidth: 900, margin: "0 auto" }}>
          <FadeIn>
            <span className="bc" style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700 }}>El siguiente paso</span>
            <h2 className="bc" style={{ fontSize: isMobile ? "clamp(40px, 11vw, 60px)" : "clamp(48px, 7vw, 100px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em", marginTop: 16 }}>
              QUIERO AYUDARTE<br />A QUE LO HAGAS<br /><span style={{ color: R, textShadow: `0 0 50px ${R}55` }}>DE FORMA CORRECTA.</span>
            </h2>
            <p className="b" style={{ marginTop: 24, fontSize: isMobile ? 15 : 17, color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>Avancemos a un nuevo nivel. Con un sistema real.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 44 }}>
              <CTABtn href="/asesoria" primary>Aplicar a asesoría →</CTABtn>
              <CTABtn href="https://wa.me/573243747367" ext outline>Escribir por WhatsApp</CTABtn>
            </div>
            <p className="b" style={{ marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.18)" }}>Sin compromisos. Una conversación para ver si hay fit.</p>
          </FadeIn>
        </div>
      </section>

    </main>
  )
}

/* ── Botón CTA reutilizable ───────────────────────────────────── */
function CTABtn({ href, children, primary = false, outline = false, ext = false }: {
  href: string; children: React.ReactNode; primary?: boolean; outline?: boolean; ext?: boolean
}) {
  const [hover, setHover] = useState(false)
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 10,
    padding: "16px 36px", fontSize: 14, fontWeight: 900,
    fontFamily: "'Barlow Condensed', Impact, sans-serif",
    letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none",
    transition: "all 0.25s ease", cursor: "pointer",
  }
  const style: React.CSSProperties = primary
    ? { ...base, background: hover ? "#fff" : R, color: hover ? "#000" : "#fff", boxShadow: hover ? "none" : `0 10px 36px ${R}38`, clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))" }
    : { ...base, border: `1px solid ${hover ? R : "rgba(255,255,255,0.15)"}`, color: hover ? "#fff" : "rgba(255,255,255,0.55)", background: hover ? `${R}10` : "transparent" }
  return (
    <a href={href} target={ext ? "_blank" : undefined} rel={ext ? "noopener noreferrer" : undefined}
      style={style} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {children}
    </a>
  )
}
