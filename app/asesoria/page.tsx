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

/* ── FadeIn al scroll ─────────────────────────────────────────── */
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

/* ── Datos ────────────────────────────────────────────────────── */
const PROBLEMAS = [
  { n: "01", t: "Entrenas sin estructura", d: "Cambias de rutina cada semana, copias lo que ves en redes y nunca sabes si lo que haces realmente funciona. El caos no genera resultados." },
  { n: "02", t: "No aplicas progresión", d: "Levantas el mismo peso, las mismas repeticiones, los mismos ejercicios. Sin sobrecarga progresiva, no hay crecimiento muscular. Punto." },
  { n: "03", t: "Ignoras la ciencia", d: "Te dejas llevar por mitos, influencers y rutinas mágicas. Tu cuerpo responde a estímulos específicos, no a modas del momento." },
]
const PILARES = [
  { n: "01", t: "Plan 100% personalizado", d: "Diseñado para tu nivel, disponibilidad y morfología. Cada ejercicio tiene un propósito dentro del sistema." },
  { n: "02", t: "Programación con evidencia", d: "Volumen, frecuencia e intensidad calibrados según la literatura científica más actual en hipertrofia." },
  { n: "03", t: "Seguimiento semanal real", d: "Reviso tu progreso cada semana y ajusto el plan. No estás solo — estás guiado en cada paso." },
]
const BENEFICIOS = [
  { n: "01", t: "Construye músculo de verdad", d: "Estímulos específicos para hipertrofia. Cada serie cuenta, cada repetición tiene una razón científica." },
  { n: "02", t: "Entrena con estructura", d: "Mesociclos planificados, deloads programados, progresión clara. Sabes exactamente qué hacer cada día." },
  { n: "03", t: "Deja de perder el tiempo", d: "Sesiones eficientes de 45–75 min. Sin ejercicios inútiles, sin volumen basura." },
  { n: "04", t: "Entrena seguro", d: "Técnica priorizada, cargas inteligentes y prevención de lesiones desde el día uno." },
]
const PASOS = [
  { n: "01", t: "Aplicas", d: "Rellenas el formulario con tu nivel, objetivos y disponibilidad. Si hay fit, avanzamos." },
  { n: "02", t: "Recibes tu programa", d: "En 24–72 horas tienes tu programa completo con guía de ejecución y plantilla de seguimiento." },
  { n: "03", t: "Seguimiento semanal", d: "Cada semana revisamos tu progreso, ajustamos cargas y resolvemos dudas. Sin estancamientos." },
  { n: "04", t: "Progresión constante", d: "Plantilla de clase mundial para detectar tendencias, aplicar sobrecarga y acelerar resultados." },
]

/* ══ COMPONENTE PRINCIPAL ═════════════════════════════════════════ */
export default function Asesoria() {
  const { isMobile, isTablet } = useBreakpoint()
  const [scrollY, setScrollY] = useState(0)
  const [heroIn, setHeroIn] = useState(false)
  const [showWA, setShowWA] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", goal: "" })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [toast, setToast] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setTimeout(() => setHeroIn(true), 80)
    const onScroll = () => { setScrollY(window.scrollY); setShowWA(window.scrollY > 400) }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone || !formData.goal)
      return setFormError("Completa todos los campos antes de aplicar.")
    setFormError(null); setSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setSubmitted(true); setToast(true)
        setFormData({ name: "", email: "", phone: "", goal: "" })
        setTimeout(() => setToast(false), 5000)
      } else { setFormError(`Error del servidor (${res.status}). Intenta de nuevo.`) }
    } catch { setFormError("Sin conexión. Verifica tu internet e intenta de nuevo.") }
    setSubmitting(false)
  }

  const pad = isMobile ? "80px 20px" : isTablet ? "100px 32px" : "120px 64px"

  return (
    <div style={{ background: "#000", color: "#fff", fontFamily: "'Barlow', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,700;0,800;0,900;1,900&family=Barlow:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${R}; color: #fff; }
        .bc { font-family: 'Barlow Condensed', Impact, sans-serif; }
        .b  { font-family: 'Barlow', sans-serif; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
        option { background: #111; color: #fff; }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulseR  { 0%,100%{box-shadow:0 0 0 0 ${R}50} 50%{box-shadow:0 0 0 10px transparent} }
        @keyframes pulseG  { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)} 50%{box-shadow:0 0 0 10px transparent} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow    { 0%,100%{box-shadow:0 0 20px ${R}30} 50%{box-shadow:0 0 50px ${R}55} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ══ NAVBAR ════════════════════════════════════════════════ */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: R }} />
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          <a href="/" className="bc" style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, letterSpacing: "0.05em", textDecoration: "none", color: "#fff" }}>
            COACH<span style={{ color: R }}>.</span>DAVID
          </a>

          {/* Desktop nav */}
          {!isMobile && (
            <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
              {[{ label: "Problema", href: "#problema" }, { label: "Método", href: "#metodo" }, { label: "Resultados", href: "#resultados" }, { label: "Proceso", href: "#proceso" }, { label: "Sobre mí", href: "/sobre-mi" }].map(({ label, href }) => (
                <a key={href} href={href} className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 0.2s ease" }}
                  onMouseEnter={e => (e.target as HTMLAnchorElement).style.color = "#fff"}
                  onMouseLeave={e => (e.target as HTMLAnchorElement).style.color = "rgba(255,255,255,0.45)"}
                >{label}</a>
              ))}
            </nav>
          )}

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href="#contacto" className="bc" style={{ background: R, color: "#fff", padding: isMobile ? "9px 16px" : "10px 24px", fontSize: isMobile ? 12 : 13, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", clipPath: "polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px))", animation: "glow 3s ease infinite" }}>
              {isMobile ? "Aplicar" : "Quiero aplicar"}
            </a>

            {/* Hamburger móvil */}
            {isMobile && (
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: 5 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 22, height: 2, background: "#fff", transition: "all 0.2s ease", transform: menuOpen && i === 0 ? "rotate(45deg) translate(5px,5px)" : menuOpen && i === 2 ? "rotate(-45deg) translate(5px,-5px)" : "none", opacity: menuOpen && i === 1 ? 0 : 1 }} />)}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMobile && menuOpen && (
          <div style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px", animation: "slideDown 0.2s ease" }}>
            {[{ label: "Problema", href: "#problema" }, { label: "Método", href: "#metodo" }, { label: "Resultados", href: "#resultados" }, { label: "Proceso", href: "#proceso" }, { label: "Sobre mí", href: "/sobre-mi" }].map(({ label, href }) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="bc" style={{ display: "block", padding: "14px 0", fontSize: 18, fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", letterSpacing: "0.1em" }}>
                {label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* ══ HERO ════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: 60 }}>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${scrollY * (isMobile ? 0 : 0.2)}px)`, willChange: "transform" }}>
          <img src="/Entrenando_1.jpeg" alt="Atleta entrenando" style={{ width: "100%", height: "110%", objectFit: "cover", objectPosition: "center top", filter: "grayscale(25%) contrast(1.1)", opacity: isMobile ? 0.35 : 0.5 }} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: isMobile ? "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.75) 100%)" : "linear-gradient(110deg, #000 40%, rgba(0,0,0,0.6) 68%, rgba(0,0,0,0.15) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #000 0%, transparent 55%)" }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 80% 35%, ${R}12 0%, transparent 50%)` }} />

        {!isMobile && (
          <div style={{ position: "absolute", left: "max(32px, calc(50vw - 700px))", top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, transparent, ${R} 20%, ${R} 80%, transparent)`, opacity: heroIn ? 1 : 0, transition: "opacity 1.2s ease 0.5s" }} />
        )}

        <div style={{ position: "relative", zIndex: 10, maxWidth: 1400, margin: "0 auto", padding: isMobile ? "60px 20px 80px" : "80px 64px 100px", width: "100%" }}>

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", border: `1px solid ${R}40`, background: `${R}12`, marginBottom: 24, opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)", transition: "all 0.7s ease 0.2s" }}>
            <div style={{ width: 6, height: 6, background: R, borderRadius: "50%", animation: "blink 1.5s ease infinite" }} />
            <span className="bc" style={{ fontSize: isMobile ? 11 : 12, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: R }}>Plazas limitadas cada mes</span>
          </div>

          {/* Título */}
          <div style={{ marginBottom: 28 }}>
            {[{ text: "ENTRENA CON", red: false }, { text: "ESTRUCTURA,", red: false }, { text: "NO CON", red: true }, { text: "INTUICIÓN.", red: false }].map(({ text, red }, i) => (
              <div key={i} style={{ opacity: heroIn ? 1 : 0, transform: heroIn ? "translateY(0)" : "translateY(60px)", transition: `all 0.9s cubic-bezier(0.16,1,0.3,1) ${0.28 + i * 0.11}s` }}>
                <span className="bc" style={{ display: "block", fontSize: isMobile ? "clamp(48px, 14vw, 72px)" : "clamp(56px, 8.5vw, 128px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.87, letterSpacing: "-0.02em", color: red ? R : "#fff", textShadow: red ? `0 0 60px ${R}40` : "none" }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Subtítulo */}
          <p className="b" style={{ fontSize: isMobile ? 15 : 17, color: "rgba(255,255,255,0.55)", maxWidth: 480, lineHeight: 1.7, fontWeight: 300, marginBottom: 36, opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)", transition: "all 0.7s ease 0.8s" }}>
            Programas 100% personalizados, diseñados con evidencia científica real. Deja de improvisar y empieza a ver resultados con métodos probados y medibles.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)", transition: "all 0.7s ease 1s" }}>
            <HeroBtn href="#contacto" primary isMobile={isMobile}>Empieza tu transformación →</HeroBtn>
            <HeroBtn href="#proceso" isMobile={isMobile}>Cómo funciona</HeroBtn>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? "24px 32px" : "0 48px", marginTop: 52, opacity: heroIn ? 1 : 0, transition: "opacity 1s ease 1.3s" }}>
            {[{ n: "+6", l: "Certificaciones" }, { n: "+8", l: "Años de experiencia" }, { n: "100%", l: "Basado en ciencia" }].map((s, i) => (
              <div key={i} style={{ borderLeft: !isMobile && i > 0 ? "1px solid rgba(255,255,255,0.1)" : "none", paddingLeft: !isMobile && i > 0 ? 48 : 0 }}>
                <div className="bc" style={{ fontSize: isMobile ? 32 : 40, fontWeight: 900, color: R, lineHeight: 1 }}>{s.n}</div>
                <div className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 5 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", padding: "11px 0", overflow: "hidden", opacity: heroIn ? 1 : 0, transition: "opacity 1s ease 1.6s" }}>
          <div style={{ display: "flex", animation: "marquee 22s linear infinite", width: "max-content" }}>
            {Array(6).fill(null).map((_, i) => (
              <span key={i} className="bc" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.12)", paddingRight: 60, whiteSpace: "nowrap" }}>
                Hipertrofia · Ciencia Aplicada · Progresión Real · Sin Atajos · Coach David ·&nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FILTRO ══════════════════════════════════════════════════ */}
      <section style={{ padding: pad, position: "relative", overflow: "hidden" }}>
        {!isMobile && <div className="bc" style={{ position: "absolute", right: -60, top: "50%", transform: "translateY(-50%)", fontSize: "38vw", fontWeight: 900, color: "rgba(255,255,255,0.013)", lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>NO</div>}

        <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 48 : 80, alignItems: "center" }}>
          <FadeIn from={isMobile ? "bottom" : "left"}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 32, height: 2, background: "rgba(255,255,255,0.15)" }} />
              <span className="bc" style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>No es para todos</span>
            </div>
            <h2 className="bc" style={{ fontSize: isMobile ? "clamp(40px, 11vw, 60px)" : "clamp(44px, 5vw, 80px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em", marginBottom: 24 }}>
              ESTO NO ES<br />PARA QUIEN<br /><span style={{ color: R }}>BUSCA ATAJOS.</span>
            </h2>
            <p className="b" style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, fontWeight: 300 }}>
              Si quieres resultados reales, necesitas estructura. No más improvisación, no más entrenar sin dirección ni propósito.
            </p>
          </FadeIn>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { n: "01", t: "Sin improvisación", b: "Cada sesión tiene un objetivo claro dentro de un sistema estructurado." },
              { n: "02", t: "Sin entrenar sin progresión", b: "Sin sobrecarga progresiva no hay crecimiento muscular. Así de simple." },
              { n: "03", t: "Sin programas genéricos", b: "Volumen, intensidad y frecuencia diseñados con intención, no al azar." },
            ].map((c, i) => (
              <FadeIn key={c.n} delay={i * 80}>
                <MiniCard {...c} isMobile={isMobile} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROBLEMA ════════════════════════════════════════════════ */}
      <section id="problema" style={{ padding: pad, background: "#080808", position: "relative", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${R}50, transparent)` }} />

        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 32, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>El problema</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: isMobile ? 40 : 64 }}>
              <h2 className="bc" style={{ fontSize: isMobile ? "clamp(40px, 11vw, 60px)" : "clamp(44px, 5vw, 80px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em" }}>
                LLEVAS AÑOS<br />EN EL GYM Y<br /><span style={{ color: R }}>SIGUES IGUAL.</span>
              </h2>
              {!isMobile && <p className="b" style={{ color: "rgba(255,255,255,0.4)", maxWidth: 300, fontSize: 15, lineHeight: 1.65, fontWeight: 300 }}>No es falta de esfuerzo. Es falta de método.</p>}
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3,1fr)", gap: isMobile ? 12 : 2 }}>
            {PROBLEMAS.map((p, i) => (
              <FadeIn key={p.n} delay={isMobile ? 0 : i * 100}>
                <ProblemaCard {...p} isMobile={isMobile} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SOLUCIÓN ════════════════════════════════════════════════ */}
      <section id="metodo" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", minHeight: isMobile ? "auto" : "80vh", position: "relative" }}>

        {/* Imagen — oculta en móvil o como fondo */}
        {!isMobile ? (
          <div style={{ position: "relative", overflow: "hidden", minHeight: 500 }}>
            <img src="/Entrenando_2.jpeg" alt="Coach David" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", filter: "grayscale(15%) contrast(1.05)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 55%, #000)" }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${R}15 0%, transparent 40%)` }} />
            <div style={{ position: "absolute", top: 20, left: 20, width: 32, height: 32, borderTop: `2px solid ${R}`, borderLeft: `2px solid ${R}` }} />
            <div style={{ position: "absolute", bottom: 20, left: 20, width: 32, height: 32, borderBottom: `2px solid ${R}`, borderLeft: `2px solid ${R}` }} />
          </div>
        ) : (
          <div style={{ position: "relative", height: 260, overflow: "hidden" }}>
            <img src="/Entrenando_2.jpeg" alt="Coach David" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", filter: "grayscale(15%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, #050505)" }} />
          </div>
        )}

        {/* Texto */}
        <div style={{ background: "#050505", padding: isMobile ? "48px 20px" : "72px 64px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "35%", right: -60, width: 260, height: 260, background: `${R}06`, borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />

          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 32, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>La solución</span>
            </div>
            <h2 className="bc" style={{ fontSize: isMobile ? "clamp(40px, 11vw, 60px)" : "clamp(40px, 4vw, 68px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 24 }}>
              UN MÉTODO<br />PROBADO.<br /><span style={{ color: R }}>SIN ATAJOS.</span>
            </h2>
            <p className="b" style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, fontWeight: 300, marginBottom: 32 }}>
              Soy David, Coach especializado en hipertrofia y entrenamiento basado en ciencia. He guiado a personas a construir un físico estético de forma correcta, con método y sin improvisación.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 36 }}>
              {PILARES.map((p) => (
                <div key={p.n} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="bc" style={{ fontSize: 11, color: R, fontWeight: 700, letterSpacing: "0.2em", flexShrink: 0, marginTop: 3 }}>{p.n}</span>
                  <div>
                    <div className="bc" style={{ fontSize: 16, fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>{p.t}</div>
                    <div className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 4, lineHeight: 1.5, fontWeight: 300 }}>{p.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <a href="#contacto" className="bc" style={{ display: "inline-flex", alignItems: "center", gap: 12, background: R, color: "#fff", padding: "17px 36px", fontSize: 14, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))", boxShadow: `0 10px 36px ${R}38`, transition: "all 0.25s ease", alignSelf: "flex-start" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "#fff"; el.style.color = "#000"; el.style.boxShadow = "none" }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = R; el.style.color = "#fff"; el.style.boxShadow = `0 10px 36px ${R}38` }}
            >Quiero mi programa →</a>
          </FadeIn>
        </div>
      </section>

      {/* ══ ESTADÍSTICAS ════════════════════════════════════════════ */}
      <section style={{ background: R, padding: isMobile ? "52px 20px" : "72px 64px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: isMobile ? 0 : 2 }}>
          {[
            { target: 8, suffix: "+", label: "Años", sub: "Experiencia real" },
            { target: 6, suffix: "+", label: "Certificaciones", sub: "Formación especializada" },
            { target: 24, suffix: "h", label: "Respuesta", sub: "Tiempo máximo" },
            { target: 72, suffix: "h", label: "Tu programa", sub: "Desde que aplicas" },
          ].map((s, i) => (
            <FadeIn key={s.label} delay={i * 60}>
              <div style={{ padding: isMobile ? "28px 16px" : "36px 32px", borderRight: !isMobile && i < 3 ? "1px solid rgba(0,0,0,0.15)" : "none", borderBottom: isMobile && i < 2 ? "1px solid rgba(0,0,0,0.15)" : "none", background: i % 2 === 1 ? "rgba(0,0,0,0.1)" : "transparent", textAlign: isMobile ? "center" : "left" }}>
                <div className="bc" style={{ fontSize: isMobile ? "clamp(40px, 10vw, 56px)" : "clamp(44px, 4.5vw, 64px)", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.03em" }}>
                  <Counter target={s.target} suffix={s.suffix} />
                </div>
                <div className="bc" style={{ fontSize: isMobile ? 14 : 17, fontWeight: 800, textTransform: "uppercase", color: "#fff", marginTop: 6 }}>{s.label}</div>
                <div className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 3, fontWeight: 300 }}>{s.sub}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══ BENEFICIOS ══════════════════════════════════════════════ */}
      <section id="resultados" style={{ padding: pad, background: "#000", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${R}50, transparent)` }} />

        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 32, height: 2, background: "rgba(255,255,255,0.15)" }} />
              <span className="bc" style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Resultados reales</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: isMobile ? 36 : 64 }}>
              <h2 className="bc" style={{ fontSize: isMobile ? "clamp(40px, 11vw, 60px)" : "clamp(44px, 5vw, 80px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em" }}>
                LO QUE VAS<br /><span style={{ color: R }}>A CONSEGUIR.</span>
              </h2>
              {!isMobile && (
                <a href="#contacto" className="bc" style={{ display: "inline-flex", alignItems: "center", gap: 10, color: R, fontSize: 13, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", borderBottom: `2px solid ${R}`, paddingBottom: 3, transition: "gap 0.3s ease" }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.gap = "18px"}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.gap = "10px"}
                >Empezar ahora →</a>
              )}
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 12 : 2 }}>
            {BENEFICIOS.map((b, i) => (
              <FadeIn key={b.n} delay={isMobile ? 0 : i * 80}>
                <BeneficioCard {...b} isMobile={isMobile} />
              </FadeIn>
            ))}
          </div>

          {isMobile && (
            <div style={{ marginTop: 32, textAlign: "center" }}>
              <a href="#contacto" className="bc" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: R, color: "#fff", padding: "16px 36px", fontSize: 14, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))" }}>
                Empezar ahora →
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ══ PROCESO ═════════════════════════════════════════════════ */}
      <section id="proceso" style={{ padding: pad, background: "#080808", position: "relative", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.25, backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)`, backgroundSize: "60px 60px" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${R}50, transparent)` }} />

        <div style={{ position: "relative", maxWidth: 1400, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 32, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>El proceso</span>
            </div>
            <h2 className="bc" style={{ fontSize: isMobile ? "clamp(40px, 11vw, 60px)" : "clamp(44px, 5vw, 80px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em", marginBottom: isMobile ? 36 : 72 }}>
              EMPEZAR ES<br /><span style={{ color: R }}>SIMPLE.</span>
            </h2>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(4,1fr)", gap: isMobile ? 12 : 2, position: "relative" }}>
            {/* Línea conectora solo desktop */}
            {!isMobile && !isTablet && (
              <div style={{ position: "absolute", top: 44, left: "12.5%", right: "12.5%", height: 1, background: `linear-gradient(to right, ${R}60, rgba(255,255,255,0.1), ${R}60)`, zIndex: 0 }} />
            )}
            {PASOS.map((p, i) => (
              <FadeIn key={p.n} delay={isMobile ? 0 : i * 100}>
                <div style={{ background: "#0a0a0a", border: `1px solid ${isMobile ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.06)"}`, padding: isMobile ? "28px 24px" : "36px 28px", position: "relative", display: isMobile ? "flex" : "block", gap: isMobile ? 20 : 0, alignItems: isMobile ? "flex-start" : "initial" }}>
                  <div style={{ width: 48, height: 48, border: `2px solid ${R}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: isMobile ? 0 : 24, background: "#000", flexShrink: 0, position: "relative", zIndex: 1 }}>
                    <span className="bc" style={{ fontSize: 18, fontWeight: 900, color: R }}>{p.n}</span>
                  </div>
                  <div>
                    <h3 className="bc" style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 8, marginTop: isMobile ? 4 : 0 }}>{p.t}</h3>
                    <p className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, fontWeight: 300 }}>{p.d}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACTO ════════════════════════════════════════════════ */}
      <section id="contacto" style={{ padding: pad, background: "#000", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${R}0c 0%, transparent 55%)` }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right, transparent, ${R}, transparent)` }} />

        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>

          {/* Header */}
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: isMobile ? 48 : 72 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 28, height: 2, background: "rgba(255,255,255,0.15)" }} />
                <span className="bc" style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Es tu momento</span>
                <div style={{ width: 28, height: 2, background: "rgba(255,255,255,0.15)" }} />
              </div>
              <h2 className="bc" style={{ fontSize: isMobile ? "clamp(40px, 12vw, 64px)" : "clamp(48px, 6vw, 88px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em", marginBottom: 18 }}>
                EMPIEZA HOY.<br />CONSTRUYE EL FÍSICO<br /><span style={{ color: R, textShadow: `0 0 50px ${R}45` }}>QUE QUIERES.</span>
              </h2>
              <p className="b" style={{ fontSize: isMobile ? 15 : 17, color: "rgba(255,255,255,0.4)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7, fontWeight: 300 }}>
                Plazas limitadas cada mes. Aplica ahora y empieza la próxima semana.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr", gap: isMobile ? 16 : 2 }}>

            {/* Formulario */}
            <FadeIn from={isMobile ? "bottom" : "left"}>
              <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)", padding: isMobile ? "32px 20px" : "48px 44px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: R }} />
                <h3 className="bc" style={{ fontSize: 26, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 6 }}>Solicita tu plan</h3>
                <p className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 32, fontWeight: 300 }}>Te respondo en menos de 24 horas — personalmente, sin bots.</p>

                {submitted ? (
                  <div style={{ textAlign: "center", padding: "40px 0", animation: "fadeUp 0.5s ease" }}>
                    <div style={{ width: 60, height: 60, border: `2px solid ${R}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", animation: "pulseR 2s ease infinite" }}>
                      <span style={{ fontSize: 26, color: R }}>✓</span>
                    </div>
                    <h4 className="bc" style={{ fontSize: 26, fontWeight: 900, textTransform: "uppercase", marginBottom: 10 }}>¡SOLICITUD ENVIADA!</h4>
                    <p className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, fontWeight: 300 }}>Te contactaré en menos de 24 horas para hablar sobre tu proceso.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    {[
                      { id: "name", label: "Nombre", placeholder: "Tu nombre completo", type: "text", key: "name" },
                      { id: "email", label: "Email", placeholder: "tu@email.com", type: "email", key: "email" },
                      { id: "phone", label: "WhatsApp / Teléfono", placeholder: "+57 300 123 4567", type: "tel", key: "phone" },
                    ].map(({ id, label, placeholder, type, key }) => (
                      <div key={id}>
                        <FormLabel>{label}</FormLabel>
                        <input id={id} type={type} required placeholder={placeholder}
                          value={formData[key as keyof typeof formData]}
                          onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                          style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: 15, outline: "none", transition: "border-color 0.2s ease" }}
                          onFocus={e => (e.target.style.borderColor = R)}
                          onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                        />
                      </div>
                    ))}
                    <div>
                      <FormLabel>Objetivo y nivel actual</FormLabel>
                      <textarea required rows={isMobile ? 3 : 4} placeholder="Cuéntame qué quieres conseguir, cuánto llevas entrenando y cuál es tu mayor obstáculo…"
                        value={formData.goal} onChange={e => setFormData({ ...formData, goal: e.target.value })}
                        style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: 15, outline: "none", resize: "vertical", transition: "border-color 0.2s ease" }}
                        onFocus={e => (e.target.style.borderColor = R)}
                        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                    {formError && (
                      <div style={{ padding: "11px 14px", border: `1px solid ${R}50`, background: `${R}0d`, display: "flex", gap: 10, alignItems: "center", animation: "slideIn 0.3s ease" }}>
                        <span style={{ color: R, fontWeight: 900, fontSize: 15 }}>!</span>
                        <span className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{formError}</span>
                      </div>
                    )}
                    <button type="submit" disabled={submitting} style={{ width: "100%", padding: "18px", background: submitting ? `${R}70` : R, color: "#fff", border: "none", fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 15, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", cursor: submitting ? "not-allowed" : "pointer", clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))", boxShadow: submitting ? "none" : `0 0 36px ${R}30`, transition: "all 0.25s ease" }}
                      onMouseEnter={e => { if (!submitting) { (e.target as HTMLButtonElement).style.background = "#fff"; (e.target as HTMLButtonElement).style.color = "#000" } }}
                      onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = submitting ? `${R}70` : R; (e.target as HTMLButtonElement).style.color = "#fff" }}
                    >{submitting ? "Enviando..." : "Aplicar ahora →"}</button>
                  </form>
                )}
              </div>
            </FadeIn>

            {/* Columna derecha */}
            <FadeIn from={isMobile ? "bottom" : "right"} delay={100}>
              <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 12 : 2 }}>

                {/* WhatsApp */}
                <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", padding: isMobile ? "28px 20px" : "40px 36px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, background: "rgba(34,197,94,0.06)", borderRadius: "50%", filter: "blur(40px)" }} />
                  <div style={{ width: 48, height: 48, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#22c55e"><path d="M20.52 3.48A11.9 11.9 0 0012.01 0C5.38 0 .01 5.37.01 12c0 2.12.56 4.19 1.62 6.02L0 24l6.15-1.61A11.93 11.93 0 0012.01 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.49-8.52z"/></svg>
                  </div>
                  <h3 className="bc" style={{ fontSize: 24, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 10 }}>¿Prefieres WhatsApp?</h3>
                  <p className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, fontWeight: 300, marginBottom: 24 }}>Escríbeme directamente. Sin bots — te respondo personalmente.</p>
                  <a href="https://wa.me/573243747367?text=Hola%20Coach%20David%2C%20quiero%20empezar%20un%20plan%20personalizado.%20Mi%20objetivo%20es%20_____" target="_blank" rel="noopener noreferrer" className="bc"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, border: "1px solid rgba(34,197,94,0.35)", color: "#22c55e", padding: "15px", fontSize: 13, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", transition: "all 0.25s ease" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "#22c55e"; el.style.color = "#000" }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "transparent"; el.style.color = "#22c55e" }}
                  >Hablar por WhatsApp →</a>
                </div>

                {/* Stats */}
                <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", padding: isMobile ? "24px 20px" : "28px 36px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: isMobile ? 16 : 20 }}>
                    {[{ n: "24h", l: "Respuesta garantizada" }, { n: "72h", l: "Tu programa listo" }, { n: "1 a 1", l: "Seguimiento directo" }, { n: "0", l: "Bots o automatizaciones" }].map((s, i) => (
                      <div key={i} style={{ borderLeft: `2px solid ${i < 2 ? R : "rgba(255,255,255,0.07)"}`, paddingLeft: 14 }}>
                        <div className="bc" style={{ fontSize: 26, fontWeight: 900, color: i < 2 ? R : "#fff", lineHeight: 1 }}>{s.n}</div>
                        <div className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, lineHeight: 1.3 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Garantía */}
                <div style={{ padding: isMobile ? "20px" : "22px 26px", border: `1px solid ${R}22`, background: `${R}06`, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: R, fontSize: 18, flexShrink: 0, marginTop: 2 }}>◆</span>
                  <div>
                    <div className="bc" style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Sin compromisos</div>
                    <p className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, fontWeight: 300 }}>Una conversación para ver si hay fit. Solo trabajo con personas realmente comprometidas.</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════ */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: isMobile ? "32px 20px" : "36px 64px", background: "#000" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 16 }}>
          <div className="bc" style={{ fontSize: 20, fontWeight: 900, letterSpacing: "0.05em" }}>COACH<span style={{ color: R }}>.</span>DAVID</div>
          <p className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontWeight: 300 }}>© {new Date().getFullYear()} Coach David · Entrenamiento basado en ciencia.</p>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ l: "Instagram", h: "https://www.instagram.com/coachfitdavid/" }, { l: "YouTube", h: "#" }].map(({ l, h }) => (
              <a key={l} href={h} target={h !== "#" ? "_blank" : undefined} rel="noopener noreferrer" className="b"
                style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s ease" }}
                onMouseEnter={e => (e.target as HTMLAnchorElement).style.color = "#fff"}
                onMouseLeave={e => (e.target as HTMLAnchorElement).style.color = "rgba(255,255,255,0.3)"}
              >{l}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* ══ TOAST ═══════════════════════════════════════════════════ */}
      <div style={{ position: "fixed", bottom: isMobile ? 88 : 96, right: isMobile ? 12 : 24, zIndex: 200, background: "#0a0a0a", border: `1px solid ${R}40`, padding: "18px 20px", maxWidth: isMobile ? "calc(100vw - 24px)" : 320, transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)", opacity: toast ? 1 : 0, transform: toast ? "translateY(0)" : "translateY(40px)", pointerEvents: toast ? "auto" : "none", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: R }} />
        <div className="bc" style={{ fontSize: 17, fontWeight: 900, textTransform: "uppercase", marginBottom: 5 }}>¡Solicitud enviada!</div>
        <div className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.55, fontWeight: 300 }}>Te contactaré en menos de 24 horas para empezar tu transformación.</div>
      </div>

      {/* ══ WHATSAPP FLOTANTE ════════════════════════════════════════ */}
      <a href="https://wa.me/573243747367?text=Hola%20Coach%20David,%20quiero%20estructurar%20mi%20entrenamiento%20correctamente." target="_blank" rel="noopener noreferrer"
        style={{ position: "fixed", bottom: isMobile ? 16 : 24, right: isMobile ? 16 : 24, zIndex: 200, display: "flex", alignItems: "center", gap: isMobile ? 0 : 10, background: "#22c55e", color: "#fff", padding: isMobile ? "14px" : "13px 20px", borderRadius: 40, boxShadow: "0 8px 28px rgba(34,197,94,0.4)", textDecoration: "none", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)", opacity: showWA ? 1 : 0, transform: showWA ? "translateY(0) scale(1)" : "translateY(20px) scale(0.9)", pointerEvents: showWA ? "auto" : "none", animation: showWA ? "pulseG 2.5s ease infinite" : "none" }}>
        <svg width={isMobile ? 24 : 20} height={isMobile ? 24 : 20} viewBox="0 0 24 24" fill="white"><path d="M20.52 3.48A11.9 11.9 0 0012.01 0C5.38 0 .01 5.37.01 12c0 2.12.56 4.19 1.62 6.02L0 24l6.15-1.61A11.93 11.93 0 0012.01 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.49-8.52z"/></svg>
        {!isMobile && <span className="bc" style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Hablar por WhatsApp</span>}
      </a>
    </div>
  )
}

/* ── Sub-componentes ──────────────────────────────────────────── */
function HeroBtn({ href, children, primary = false, isMobile }: { href: string; children: React.ReactNode; primary?: boolean; isMobile: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <a href={href} className="bc" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: isMobile ? "15px 28px" : "18px 40px", fontSize: isMobile ? 13 : 15, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", transition: "all 0.25s ease", ...(primary ? { background: hover ? "#fff" : R, color: hover ? "#000" : "#fff", boxShadow: hover ? "none" : `0 10px 36px ${R}38`, clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))" } : { border: `1px solid ${hover ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)"}`, color: hover ? "#fff" : "rgba(255,255,255,0.55)" }) }}
    >{children}</a>
  )
}

function MiniCard({ n, t, b, isMobile }: { n: string; t: string; b: string; isMobile: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ padding: isMobile ? "20px 18px" : "22px 28px", background: hover ? "#0d0d0d" : "#050505", borderLeft: `3px solid ${hover ? R : "rgba(255,255,255,0.06)"}`, transition: "all 0.3s ease", marginBottom: 2 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <span className="bc" style={{ fontSize: 36, fontWeight: 900, color: hover ? R : "rgba(255,255,255,0.05)", lineHeight: 1, flexShrink: 0, transition: "color 0.3s ease" }}>{n}</span>
        <div>
          <h3 className="bc" style={{ fontSize: 17, fontWeight: 800, textTransform: "uppercase", color: hover ? "#fff" : "rgba(255,255,255,0.75)", transition: "color 0.3s ease" }}>{t}</h3>
          <p className="b" style={{ marginTop: 4, color: "rgba(255,255,255,0.3)", fontSize: 13, lineHeight: 1.55, fontWeight: 300 }}>{b}</p>
        </div>
      </div>
    </div>
  )
}

function ProblemaCard({ n, t, d, isMobile }: { n: string; t: string; d: string; isMobile: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: hover ? "#0f0f0f" : "#0a0a0a", border: `1px solid ${hover ? `${R}50` : "rgba(255,255,255,0.06)"}`, padding: isMobile ? "28px 22px" : "40px 32px", transition: "all 0.3s ease", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: hover ? R : "transparent", transition: "background 0.3s ease" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div style={{ width: 32, height: 32, border: `1px solid ${hover ? R : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.3s ease", flexShrink: 0 }}>
          <span style={{ color: hover ? R : "rgba(255,255,255,0.3)", fontSize: 16, fontWeight: 900 }}>✕</span>
        </div>
        <span className="bc" style={{ fontSize: 24, fontWeight: 900, color: hover ? R : "rgba(255,255,255,0.1)", transition: "color 0.3s ease" }}>{n}</span>
      </div>
      <h3 className="bc" style={{ fontSize: isMobile ? 22 : 24, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 10 }}>{t}</h3>
      <p className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, fontWeight: 300 }}>{d}</p>
    </div>
  )
}

function BeneficioCard({ n, t, d, isMobile }: { n: string; t: string; d: string; isMobile: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: hover ? "#0d0d0d" : "#080808", borderTop: `2px solid ${hover ? R : "rgba(255,255,255,0.06)"}`, padding: isMobile ? "28px 22px" : "40px 36px", transition: "all 0.3s ease" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, background: hover ? `${R}18` : "rgba(255,255,255,0.03)", border: `1px solid ${hover ? R : "rgba(255,255,255,0.07)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s ease" }}>
          <span style={{ color: hover ? R : "rgba(255,255,255,0.2)", fontSize: 13, fontWeight: 900, transition: "color 0.3s ease" }}>↗</span>
        </div>
        <span className="bc" style={{ fontSize: 40, fontWeight: 900, color: hover ? `${R}28` : "rgba(255,255,255,0.04)", transition: "color 0.3s ease", lineHeight: 1 }}>{n}</span>
      </div>
      <h3 className="bc" style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 8 }}>{t}</h3>
      <p className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, fontWeight: 300 }}>{d}</p>
    </div>
  )
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 6, fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>
      {children} <span style={{ color: R }}>*</span>
    </label>
  )
}
