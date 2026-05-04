"use client"

import { useEffect, useRef, useState } from "react"

const R = "#E8000D"

/* ── FadeIn al scroll ─────────────────────────────────────────── */
function FadeIn({ children, delay = 0, from = "bottom", className = "" }: {
  children: React.ReactNode; delay?: number
  from?: "bottom" | "left" | "right"; className?: string
}) {
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
  const tx = from === "left" ? "-50px" : from === "right" ? "50px" : "0"
  const ty = from === "bottom" ? "40px" : "0"
  return (
    <div ref={ref} className={className} style={{
      transition: `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      opacity: v ? 1 : 0,
      transform: v ? "translate(0,0)" : `translate(${tx},${ty})`,
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

/* ══ COMPONENTE PRINCIPAL ═════════════════════════════════════════ */
export default function SobreMi() {
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
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulseR  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .bc { font-family: 'Barlow Condensed', Impact, sans-serif; }
        .b  { font-family: 'Barlow', sans-serif; }
      `}</style>

      {/* ══ HERO ════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", height: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>

        {/* Video con parallax */}
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${scrollY * 0.2}px)`, willChange: "transform" }}>
          <video autoPlay loop muted playsInline
            style={{ width: "100%", height: "110%", objectFit: "cover", filter: "grayscale(25%) contrast(1.1)" }}>
            <source src="/0502.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Overlays en capas */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #000 40%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.2) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #000 0%, transparent 50%)" }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 80% 50%, ${R}15 0%, transparent 50%)` }} />

        {/* Línea roja vertical */}
        <div style={{
          position: "absolute", left: "max(32px, calc(50vw - 700px))",
          top: 0, bottom: 0, width: 2,
          background: `linear-gradient(to bottom, transparent, ${R} 25%, ${R} 75%, transparent)`,
          opacity: heroIn ? 1 : 0, transition: "opacity 1.2s ease 0.4s",
        }} />

        {/* Contenido */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 1400, margin: "0 auto", padding: "0 64px", width: "100%" }}>

          {/* Eyebrow */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14, marginBottom: 28,
            opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)",
            transition: "all 0.7s ease 0.2s",
          }}>
            <div style={{ width: 40, height: 2, background: R }} />
            <span className="bc" style={{ color: R, fontSize: 12, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>
              Coach · Entrenador especializado
            </span>
          </div>

          {/* Nombre */}
          <div style={{ overflow: "hidden" }}>
            <h1 className="bc" style={{
              fontSize: "clamp(72px, 12vw, 180px)", fontWeight: 900,
              textTransform: "uppercase", lineHeight: 0.85, letterSpacing: "-0.02em",
            }}>
              <span style={{
                display: "block",
                opacity: heroIn ? 1 : 0, transform: heroIn ? "translateY(0)" : "translateY(100%)",
                transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.3s",
              }}>COACH</span>
              <span style={{
                display: "block", color: R, textShadow: `0 0 80px ${R}50`,
                opacity: heroIn ? 1 : 0, transform: heroIn ? "translateY(0)" : "translateY(100%)",
                transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.45s",
              }}>DAVID</span>
            </h1>
          </div>

          {/* Tagline */}
          <p className="b" style={{
            marginTop: 32, fontSize: "clamp(15px, 1.4vw, 19px)",
            color: "rgba(255,255,255,0.5)", maxWidth: 420, lineHeight: 1.65, fontWeight: 300,
            opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)",
            transition: "all 0.7s ease 0.75s",
          }}>
            No es motivación. Es estructura, ciencia y ejecución.<br />
            <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>Hipertrofia y rendimiento físico basado en evidencia.</span>
          </p>

          {/* Scroll indicator */}
          <div style={{
            position: "absolute", bottom: 48, left: 64,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            opacity: heroIn ? 0.4 : 0, transition: "opacity 1s ease 1.5s",
          }}>
            <span className="bc" style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", writingMode: "vertical-rl" }}>Scroll</span>
            <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)" }} />
          </div>
        </div>

        {/* Marquee inferior */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
          padding: "13px 0", overflow: "hidden",
          opacity: heroIn ? 1 : 0, transition: "opacity 1s ease 1.8s",
        }}>
          <div style={{ display: "flex", animation: "marquee 22s linear infinite", width: "max-content" }}>
            {Array(6).fill(null).map((_, i) => (
              <span key={i} className="bc" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.15)", paddingRight: 80, whiteSpace: "nowrap" }}>
                Hipertrofia · Ciencia Aplicada · Entrenamiento Real · Resultados Medibles · Sin Atajos ·&nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ QUIÉN SOY — Split layout ════════════════════════════════ */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "90vh", position: "relative" }}>

        {/* Columna imagen */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img src="/Entrenando_2.jpeg" alt="Coach David"
            style={{
              width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top",
              filter: "grayscale(15%) contrast(1.05)",
              transform: `scale(1.04) translateY(${(scrollY - 700) * 0.06}px)`,
              transition: "transform 0.1s linear",
            }} />
          {/* Overlay lateral */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 50%, #000)" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${R}20 0%, transparent 40%)` }} />

          {/* Marco decorativo rojo */}
          <div style={{
            position: "absolute", top: 32, left: 32, right: 64, bottom: 32,
            border: `1px solid ${R}30`, pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: 20, left: 20, width: 32, height: 32,
            borderTop: `2px solid ${R}`, borderLeft: `2px solid ${R}`,
          }} />
          <div style={{
            position: "absolute", bottom: 20, right: 52, width: 32, height: 32,
            borderBottom: `2px solid ${R}`, borderRight: `2px solid ${R}`,
          }} />
        </div>

        {/* Columna texto */}
        <div style={{ background: "#050505", padding: "80px 72px 80px 64px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>

          {/* Brillo de fondo */}
          <div style={{ position: "absolute", top: "30%", right: -60, width: 300, height: 300, background: `${R}06`, borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />

          <FadeIn from="right">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 36, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Quién soy</span>
            </div>

            <h2 className="bc" style={{ fontSize: "clamp(44px, 4vw, 68px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 32 }}>
              CONOCE<br />AL <span style={{ color: R }}>COACH</span>
            </h2>

            <p className="b" style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, fontWeight: 300, marginBottom: 24, maxWidth: 440 }}>
              Soy David, Coach especializado en hipertrofia y rendimiento físico. Mi enfoque combina formación estructurada con aplicación práctica real — cada decisión tiene un fundamento científico.
            </p>

            <p className="b" style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, fontWeight: 300, marginBottom: 40, maxWidth: 440 }}>
              Trabajo con una estructura clara que funciona. Y si no funciona, la ajustamos. Si entrenas conmigo, no entrenas más duro —{" "}
              <span style={{ color: "#fff", fontWeight: 500 }}>entrenas mejor.</span>
            </p>

            {/* Quote */}
            <div style={{ borderLeft: `3px solid ${R}`, paddingLeft: 20, marginBottom: 0 }}>
              <p className="bc" style={{ fontSize: "clamp(18px, 1.8vw, 24px)", fontWeight: 800, textTransform: "uppercase", lineHeight: 1.2, color: "rgba(255,255,255,0.75)" }}>
                "Si no puedes medir<br />tu progreso, no puedes<br />
                <span style={{ color: R }}>mejorarlo."</span>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ ESTADÍSTICAS ════════════════════════════════════════════ */}
      <section style={{ background: R, padding: "80px 64px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2 }}>
          {[
            { target: 8, suffix: "+", label: "Años entrenando", sub: "Experiencia práctica acumulada" },
            { target: 6, suffix: "+", label: "Certificaciones", sub: "Formación técnica y especializada" },
            { target: 100, suffix: "%", label: "Personalizado", sub: "Cada programa diseñado desde cero" },
          ].map((s, i) => (
            <FadeIn key={s.label} delay={i * 120}>
              <div style={{
                padding: "48px 40px",
                borderRight: i < 2 ? "1px solid rgba(0,0,0,0.15)" : "none",
                background: i === 1 ? "rgba(0,0,0,0.12)" : "transparent",
              }}>
                <div className="bc" style={{ fontSize: "clamp(64px, 7vw, 96px)", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.03em" }}>
                  <Counter target={s.target} suffix={s.suffix} />
                </div>
                <div className="bc" style={{ fontSize: 20, fontWeight: 800, textTransform: "uppercase", color: "#fff", letterSpacing: "0.05em", marginTop: 8 }}>{s.label}</div>
                <div className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 6, fontWeight: 300 }}>{s.sub}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══ FORMACIÓN ═══════════════════════════════════════════════ */}
      <section style={{ background: "#080808", padding: "120px 64px", borderTop: "1px solid rgba(255,255,255,0.04)", position: "relative", overflow: "hidden" }}>

        {/* Grilla de fondo */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.3,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${R}60, transparent)` }} />

        <div style={{ position: "relative", maxWidth: 1400, margin: "0 auto" }}>

          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Formación</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 72 }}>
              <h2 className="bc" style={{ fontSize: "clamp(44px, 5vw, 76px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em" }}>
                PREPARADO<br />PARA <span style={{ color: R }}>RESULTADOS.</span>
              </h2>
              <p className="b" style={{ color: "rgba(255,255,255,0.35)", maxWidth: 300, fontSize: 15, lineHeight: 1.65, fontWeight: 300 }}>
                Cada certificación respalda decisiones de programación reales, no solo títulos en un papel.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>

            {/* Formación técnica */}
            <FadeIn delay={0}>
              <FormacionCard
                tag="Formación técnica"
                tagColor="rgba(255,255,255,0.3)"
                items={[
                  { icon: "◈", text: "Técnico en Entrenamiento de Gimnasio", inst: "CCAPF" },
                  { icon: "◈", text: "Técnico en Entrenamiento Personalizado", inst: "CCAPF" },
                ]}
              />
            </FadeIn>

            {/* Especializaciones */}
            <FadeIn delay={120}>
              <FormacionCard
                tag="Especializaciones"
                tagColor="rgba(255,255,255,0.3)"
                items={[
                  { icon: "◈", text: "Hipertrofia muscular", inst: "ECEP" },
                  { icon: "◈", text: "Entrenamiento en mujeres", inst: "ECEP" },
                  { icon: "◈", text: "Biomecánica deportiva", inst: "Fitness & Health Institute" },
                  { icon: "◈", text: "Nutrición deportiva", inst: "Fitness & Health Institute" },
                ]}
              />
            </FadeIn>

            {/* En curso */}
            <FadeIn delay={240}>
              <FormacionCard
                tag="Formación actual"
                tagColor={R}
                accent={R}
                items={[
                  { icon: "→", text: "Nutrición y suplementación", inst: "INAF" },
                  { icon: "→", text: "Certificación profesional en musculación", inst: "INAF" },
                ]}
                badge="En curso"
              />
            </FadeIn>

          </div>
        </div>
      </section>

      {/* ══ FILOSOFÍA — full bleed ══════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "70vh", display: "flex", alignItems: "center", overflow: "hidden" }}>

        {/* Imagen con parallax */}
        <div style={{
          position: "absolute", inset: 0,
          transform: `translateY(${(scrollY - 2200) * 0.15}px)`,
        }}>
          <img src="/Entrenando_1.jpeg" alt=""
            style={{ width: "100%", height: "110%", objectFit: "cover", filter: "grayscale(40%) contrast(1.1)", opacity: 0.25 }} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #000, rgba(0,0,0,0.85) 50%, #000)" }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, ${R}0d 0%, transparent 60%)` }} />

        <div style={{ position: "relative", zIndex: 10, maxWidth: 1400, margin: "0 auto", padding: "100px 64px", width: "100%" }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <div style={{ width: 36, height: 2, background: "rgba(255,255,255,0.2)" }} />
              <span className="bc" style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Filosofía</span>
            </div>

            <h2 className="bc" style={{ fontSize: "clamp(52px, 7vw, 110px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em", maxWidth: 900 }}>
              APRENDE A<br />ENTRENAR.<br />
              <span style={{ color: R, textShadow: `0 0 60px ${R}50` }}>ENAMÓRATE</span><br />
              DEL PROCESO.
            </h2>

            <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, maxWidth: 900 }}>
              {[
                { n: "01", t: "Medir", b: "Si no puedes medir tu progreso, no puedes mejorarlo. Todo se registra." },
                { n: "02", t: "Ajustar", b: "Un programa que no se ajusta no funciona. La programación es un proceso vivo." },
                { n: "03", t: "Progresar", b: "El objetivo no es sudar más. Es mover más peso, más veces, con mejor técnica." },
              ].map((p, i) => (
                <FadeIn key={p.n} delay={i * 120}>
                  <div style={{ padding: "32px 28px", borderTop: `2px solid ${i === 0 ? R : "rgba(255,255,255,0.08)"}`, background: "rgba(255,255,255,0.02)" }}>
                    <div className="bc" style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: 12 }}>{p.n}</div>
                    <div className="bc" style={{ fontSize: 28, fontWeight: 900, textTransform: "uppercase", color: "#fff", marginBottom: 12 }}>{p.t}</div>
                    <p className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, fontWeight: 300 }}>{p.b}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ CTA FINAL ═══════════════════════════════════════════════ */}
      <section style={{ position: "relative", padding: "140px 64px", background: "#000", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, ${R}0f 0%, transparent 60%)` }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${R}70, transparent)` }} />

        <div style={{ position: "relative", maxWidth: 900, margin: "0 auto" }}>
          <FadeIn>
            <span className="bc" style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700 }}>
              El siguiente paso
            </span>

            <h2 className="bc" style={{ fontSize: "clamp(48px, 7vw, 100px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em", marginTop: 20 }}>
              APRENDE A<br />ENTRENAR<br />
              <span style={{ color: R, textShadow: `0 0 60px ${R}60` }}>DE VERDAD.</span>
            </h2>

            <p className="b" style={{ marginTop: 28, fontSize: 17, color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>
              Con un sistema real. Sin improvisación.
            </p>

            <div style={{ marginTop: 52 }}>
              <a href="/asesoria" className="bc" style={{
                display: "inline-flex", alignItems: "center", gap: 16,
                background: R, color: "#fff", padding: "20px 60px",
                fontSize: 16, fontWeight: 900, letterSpacing: "0.22em",
                textTransform: "uppercase", textDecoration: "none",
                boxShadow: `0 20px 60px ${R}45`,
                clipPath: "polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px))",
                transition: "all 0.25s ease",
              }}
                onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = "#fff"; a.style.color = "#000"; a.style.boxShadow = "none" }}
                onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = R; a.style.color = "#fff"; a.style.boxShadow = `0 20px 60px ${R}45` }}
              >
                Ver detalle de programas <span style={{ fontSize: 22 }}>→</span>
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

/* ── Card de formación ────────────────────────────────────────── */
function FormacionCard({ tag, tagColor, items, badge, accent }: {
  tag: string; tagColor: string; accent?: string
  items: { icon: string; text: string; inst: string }[]
  badge?: string
}) {
  const [hover, setHover] = useState(false)
  const a = accent || "rgba(255,255,255,0.15)"
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "#0f0f0f" : "#0a0a0a",
        border: `1px solid ${hover ? (accent || "rgba(255,255,255,0.12)") : "rgba(255,255,255,0.05)"}`,
        padding: "44px 36px", position: "relative", overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      {/* Línea superior de color */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: hover ? a : "transparent", transition: "background 0.3s ease" }} />

      {badge && (
        <div style={{
          position: "absolute", top: 20, right: 20,
          background: R, color: "#fff", padding: "4px 10px",
          fontFamily: "'Barlow Condensed', Impact, sans-serif",
          fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
          animation: "pulseR 2s ease infinite",
        }}>{badge}</div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
        <div style={{ width: 4, height: 4, background: accent || "rgba(255,255,255,0.3)", transform: "rotate(45deg)" }} />
        <span style={{
          fontFamily: "'Barlow Condensed', Impact, sans-serif",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.35em",
          textTransform: "uppercase", color: tagColor,
        }}>{tag}</span>
      </div>

      <ul style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ color: accent || R, fontWeight: 900, fontSize: 14, lineHeight: 1, marginTop: 3, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.4, fontWeight: 400 }}>
                {item.text}
              </div>
              <div style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4 }}>
                {item.inst}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
