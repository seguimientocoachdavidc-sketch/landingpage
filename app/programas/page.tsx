"use client"

import { useEffect, useRef, useState } from "react"

/* ── Identidad de marca (consistente con el resto de la app) ── */
const R = "#E8000D"
const G = "#22c55e"
const B = "#3b82f6"
const O = "#f59e0b"

/* ══════════════════════════════════════════════════════════
   DATOS DE LOS DEMOS INTERACTIVOS
   ══════════════════════════════════════════════════════════ */

// Demo 1 — Progresión de volumen real (Sentadilla, 8 semanas)
const VOLUMEN_SEMANAS = [
  { semana: 1, volumen: 1240 },
  { semana: 2, volumen: 1310 },
  { semana: 3, volumen: 1290 },
  { semana: 4, volumen: 1480, pr: true },
  { semana: 5, volumen: 1520 },
  { semana: 6, volumen: 1610 },
  { semana: 7, volumen: 1590 },
  { semana: 8, volumen: 1780, pr: true },
]

// Demo 2 — Alimentos de ejemplo para el mini registrador
const ALIMENTOS_DEMO = [
  { id: 1, nombre: "Pechuga de pollo 150g", kcal: 246, p: 44.6, c: 0.3, g: 7.4 },
  { id: 2, nombre: "Arroz blanco 200g",     kcal: 322, p: 4.6,  c: 65.0, g: 4.2 },
  { id: 3, nombre: "Aguacate 50g",          kcal: 111, p: 0.7,  c: 6.8, g: 8.2 },
  { id: 4, nombre: "Whey Protein · 1 scoop",kcal: 120, p: 24.0, c: 3.0, g: 1.0 },
]
const META_DEMO = { kcal: 2100, p: 160, c: 220, g: 65 }

export default function ProgramasPage() {
  return (
    <div style={{ background: "#050507", minHeight: "100vh", color: "#fff",
      fontFamily: "'Barlow', sans-serif", overflowX: "hidden" }}>
      <Estilos />
      <Nav />
      <Hero />
      <DemoVolumen />
      <SeccionPlanes />
      <DemoMacros />
      <CierreCTA />
      <Footer />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   NAV
   ══════════════════════════════════════════════════════════ */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100,
      background: scrolled ? "rgba(5,5,7,0.9)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      transition: "all 0.3s ease" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="bc" style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.01em" }}>
          COACH<span style={{ color: R }}>.</span>DAVID
        </span>
        <a href="https://wa.me/573243747367" target="_blank" rel="noopener noreferrer"
          className="bc" style={{ padding: "10px 20px", background: R, color: "#fff",
            textDecoration: "none", fontSize: 13, fontWeight: 800, letterSpacing: "0.1em",
            textTransform: "uppercase" }}>
          Empezar →
        </a>
      </div>
    </nav>
  )
}

/* ══════════════════════════════════════════════════════════
   HERO
   ══════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <header style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 24px 40px", position: "relative" }}>
      <div style={{ position: "absolute", top: "10%", left: "50%", width: 600, height: 600,
        background: `radial-gradient(circle, ${R}12 0%, transparent 70%)`,
        transform: "translateX(-50%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{ width: 40, height: 2, background: R }} />
        <span className="bc" style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.35em",
          textTransform: "uppercase", color: R }}>
          Dos servicios, un mismo sistema
        </span>
      </div>
      <h1 className="bc" style={{ position: "relative", fontSize: "clamp(34px,6vw,68px)",
        fontWeight: 900, textTransform: "uppercase", lineHeight: 1.02, letterSpacing: "-0.02em",
        marginBottom: 24 }}>
        Programas interactivos, con <span style={{ color: R }}>seguimiento continuo,</span> basados en evidencia, personalizados, para que logres tus objetivos
      </h1>
      <p className="b" style={{ position: "relative", fontSize: 18, color: "rgba(255,255,255,0.5)",
        maxWidth: 600, lineHeight: 1.7, fontWeight: 300 }}>
        Construimos un sistema de seguimiento en tiempo real de nivel mundial, capaz de
        registrar y actualizar tu progreso, mostrarnos los puntos de mejora e incluso
        motivarnos a entrenar más duro.
      </p>
    </header>
  )
}

/* ══════════════════════════════════════════════════════════
   DEMO 1 — Progresión de volumen (animada, autoplay una vez)
   ══════════════════════════════════════════════════════════ */
function DemoVolumen() {
  const [visibles, setVisibles] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [enViewport, setEnViewport] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setEnViewport(true)
    }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!enViewport) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) { setVisibles(VOLUMEN_SEMANAS.length); return }
    let i = 0
    const t = setInterval(() => {
      i++
      setVisibles(i)
      if (i >= VOLUMEN_SEMANAS.length) clearInterval(t)
    }, 220)
    return () => clearInterval(t)
  }, [enViewport])

  const maxVol = Math.max(...VOLUMEN_SEMANAS.map(s => s.volumen))
  const primero = VOLUMEN_SEMANAS[0].volumen
  const ultimo = VOLUMEN_SEMANAS[VOLUMEN_SEMANAS.length - 1].volumen
  const mejora = Math.round(((ultimo - primero) / primero) * 100)

  return (
    <section ref={ref} style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.015)",
        padding: "36px 28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <div>
            <span className="bc" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.25em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
              Esto es lo que ve un cliente real — Sentadilla, 8 semanas
            </span>
            <h3 className="bc" style={{ fontSize: 28, fontWeight: 900, textTransform: "uppercase",
              marginTop: 6 }}>
              Su volumen, semana a semana
            </h3>
          </div>
          {visibles >= VOLUMEN_SEMANAS.length && (
            <div style={{ textAlign: "right", animation: "fadeUp 0.4s ease" }}>
              <div className="bc" style={{ fontSize: 36, fontWeight: 900, color: G, lineHeight: 1 }}>
                +{mejora}%
              </div>
              <div className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                de volumen en 8 semanas
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 200 }}>
          {VOLUMEN_SEMANAS.map((s, i) => {
            const mostrar = i < visibles
            const alturaPct = (s.volumen / maxVol) * 100
            return (
              <div key={s.semana} style={{ flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", height: "100%", justifyContent: "flex-end", position: "relative" }}>
                {mostrar && s.pr && (
                  <div style={{ position: "absolute", top: -28,
                    fontSize: 10, fontWeight: 800, color: R, letterSpacing: "0.1em",
                    animation: "fadeUp 0.3s ease" }} className="bc">
                    PR 🔥
                  </div>
                )}
                <div style={{
                  width: "100%",
                  height: mostrar ? `${alturaPct}%` : "0%",
                  background: s.pr ? R : "rgba(255,255,255,0.15)",
                  transition: "height 0.5s cubic-bezier(0.22,1,0.36,1)",
                  boxShadow: s.pr && mostrar ? `0 0 20px ${R}70` : "none",
                }} />
                <span className="bc" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)",
                  marginTop: 8, letterSpacing: "0.05em" }}>
                  S{s.semana}
                </span>
              </div>
            )
          })}
        </div>

        <p className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 24,
          lineHeight: 1.6, maxWidth: 480 }}>
          Cada barra sale directo del historial real de registros — no es una proyección.
          El sistema detecta el PR automáticamente y se lo muestra al cliente el mismo día que ocurre.
        </p>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════
   PLANES
   ══════════════════════════════════════════════════════════ */
function SeccionPlanes() {
  const PRECIO_ENTRENAMIENTO = 150000
  const PRECIO_ENTRENAMIENTO_PREMIUM = 170000
  const PRECIO_MACROS = 140000
  const PRECIO_DUO_ESTANDAR = 230000
  const PRECIO_DUO_PREMIUM = 250000
  const AHORRO_DUO_ESTANDAR = (PRECIO_ENTRENAMIENTO + PRECIO_MACROS) - PRECIO_DUO_ESTANDAR
  const AHORRO_DUO_PREMIUM = (PRECIO_ENTRENAMIENTO_PREMIUM + PRECIO_MACROS) - PRECIO_DUO_PREMIUM

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40 }}>
        <div style={{ width: 40, height: 2, background: R }} />
        <span className="bc" style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.3em",
          textTransform: "uppercase", color: R }}>
          Elige tu mundo
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
        <PlanCard
          icono="🏋️"
          nombre="Entrenamiento"
          tagline="Tu programa, ejecutado con precisión"
          color={R}
          precio={PRECIO_ENTRENAMIENTO}
          items={[
            "App web personalizada — tu programa, tus ejercicios, tu progreso",
            "Registra cada serie en segundos: peso y repeticiones",
            "Historial completo por ejercicio, incluso cuando cambiamos tu rutina",
            "Detección automática de PRs — sabes el mismo día que superaste tu marca",
            "Racha semanal de consistencia por cada día de tu split",
            "Mensaje distinto antes de cada sesión, según tu historial real",
            "Nota semanal mía, siempre visible, con el foco de esa semana",
            "Biblioteca de ejercicios con video guía — técnica a un clic",
            "CORE y calentamiento guiados para cualquier día",
            "Seguimiento de medidas con gráfica de evolución",
            "Resumen de cada sesión directo a mi WhatsApp — te reviso de verdad",
          ]}
        />
        <PlanCard
          icono="🏆"
          nombre="Entrenamiento Premium"
          tagline="Todo lo online + acompañamiento presencial"
          color={R}
          precio={PRECIO_ENTRENAMIENTO_PREMIUM}
          items={[
            "Todo lo del plan de Entrenamiento online",
            "3 sesiones presenciales al mes — ajuste de técnica en vivo, entrenamiento conmigo y consejos",
            "Ideal si vives cerca y quieres supervisión directa además del seguimiento en la app",
          ]}
        />
        <PlanCard
          icono="🍽️"
          nombre="Macros"
          tagline="Tu alimentación, sin adivinar"
          color={G}
          precio={PRECIO_MACROS}
          items={[
            "Menú calculado según tu objetivo — déficit, mantenimiento o superávit",
            "App de registro diario con cerca de 500 alimentos colombianos y de marca",
            "Metas visuales en tiempo real: calorías, proteína, grasas y carbos",
            "También fibra, sodio, azúcares, hierro, calcio y potasio",
            "Déficit real de la semana, calculado con lo que de verdad comiste",
            "Recetario con video de preparación — variedad sin salirte del plan",
            "Seguimiento de medidas incluido",
            "Acompañamiento directo conmigo, no un chatbot",
          ]}
        />
        <PlanCard
          icono="⚡"
          nombre="Dúo Estándar"
          tagline="Entrenamiento online + Macros, un solo acceso"
          color={O}
          precio={PRECIO_DUO_ESTANDAR}
          ahorro={AHORRO_DUO_ESTANDAR}
          items={[
            "Todo lo del plan de Entrenamiento (online)",
            "Todo lo del plan de Macros",
            "Un solo acceso, un solo seguimiento",
          ]}
        />
        <PlanCard
          icono="👑"
          nombre="Dúo Premium"
          tagline="Entrenamiento con presenciales + Macros"
          color={O}
          destacado
          precio={PRECIO_DUO_PREMIUM}
          ahorro={AHORRO_DUO_PREMIUM}
          items={[
            "Todo lo del plan de Entrenamiento Premium",
            "3 sesiones presenciales al mes incluidas",
            "Todo lo del plan de Macros",
            "Un solo acceso, un solo seguimiento",
          ]}
        />
      </div>
    </section>
  )
}

function PlanCard({ icono, nombre, tagline, color, items, precio, ahorro, destacado }: {
  icono: string; nombre: string; tagline: string; color: string
  items: string[]; precio: number; ahorro?: number; destacado?: boolean
}) {
  const precioFmt = precio.toLocaleString("es-CO")
  return (
    <div style={{ padding: "32px 26px", background: destacado ? `${color}08` : "rgba(255,255,255,0.015)",
      border: `1px solid ${destacado ? color + "40" : "rgba(255,255,255,0.08)"}`,
      display: "flex", flexDirection: "column", position: "relative" }}>
      {destacado && (
        <div className="bc" style={{ position: "absolute", top: -1, right: 20,
          background: color, color: "#000", fontSize: 10, fontWeight: 900,
          letterSpacing: "0.1em", padding: "5px 12px", textTransform: "uppercase" }}>
          Más pedido
        </div>
      )}
      <span style={{ fontSize: 32, marginBottom: 16 }}>{icono}</span>
      <h3 className="bc" style={{ fontSize: 26, fontWeight: 900, textTransform: "uppercase",
        marginBottom: 4, letterSpacing: "-0.01em" }}>
        {nombre}
      </h3>
      <p className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 18,
        fontWeight: 300 }}>
        {tagline}
      </p>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
        <span className="bc" style={{ fontSize: 34, fontWeight: 900, color: "#fff" }}>
          ${precioFmt}
        </span>
        <span className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          / mes
        </span>
      </div>

      {ahorro && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20,
          padding: "6px 12px", background: `${G}15`, border: `1px solid ${G}40`, width: "fit-content" }}>
          <span style={{ color: G, fontSize: 12 }}>↓</span>
          <span className="bc" style={{ fontSize: 12, fontWeight: 800, color: G,
            letterSpacing: "0.03em" }}>
            Ahorras ${ahorro.toLocaleString("es-CO")}/mes vs. contratarlos por separado
          </span>
        </div>
      )}
      {!ahorro && <div style={{ marginBottom: 24 }} />}

      <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 28, flex: 1 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10,
            marginBottom: 13, fontSize: 13.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
            <span style={{ color, flexShrink: 0, marginTop: 2, fontSize: 12 }}>✓</span>
            <span className="b" style={{ fontWeight: 300 }}>{item}</span>
          </li>
        ))}
      </ul>
      <a href="https://wa.me/573243747367" target="_blank" rel="noopener noreferrer"
        className="bc" style={{ padding: "14px", background: destacado ? color : "transparent",
          border: `1px solid ${color}`, color: destacado ? "#000" : color,
          textAlign: "center", textDecoration: "none", fontSize: 13, fontWeight: 800,
          letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Escríbeme por este plan →
      </a>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   DEMO 2 — Mini registrador de macros interactivo
   ══════════════════════════════════════════════════════════ */
function DemoMacros() {
  const [seleccionados, setSeleccionados] = useState<number[]>([])

  const toggle = (id: number) => {
    setSeleccionados(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  const totales = ALIMENTOS_DEMO
    .filter(a => seleccionados.includes(a.id))
    .reduce((acc, a) => ({
      kcal: acc.kcal + a.kcal, p: acc.p + a.p, c: acc.c + a.c, g: acc.g + a.g
    }), { kcal: 0, p: 0, c: 0, g: 0 })

  const barras = [
    { label: "Calorías", val: totales.kcal, meta: META_DEMO.kcal, unit: "kcal", color: "#fff" },
    { label: "Proteína", val: totales.p, meta: META_DEMO.p, unit: "g", color: G },
    { label: "Carbos", val: totales.c, meta: META_DEMO.c, unit: "g", color: B },
    { label: "Grasas", val: totales.g, meta: META_DEMO.g, unit: "g", color: O },
  ]

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 90px" }}>
      <div style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.015)",
        padding: "36px 28px" }}>
        <span className="bc" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.25em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
          Pruébalo — toca los alimentos de abajo
        </span>
        <h3 className="bc" style={{ fontSize: 28, fontWeight: 900, textTransform: "uppercase",
          marginTop: 6, marginBottom: 28 }}>
          Así se registra un día real
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32,
          alignItems: "start" }} className="demo-macros-grid">

          {/* Chips de alimentos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ALIMENTOS_DEMO.map(a => {
              const activo = seleccionados.includes(a.id)
              return (
                <button key={a.id} onClick={() => toggle(a.id)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 16px", background: activo ? `${R}15` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${activo ? R + "60" : "rgba(255,255,255,0.08)"}`,
                    cursor: "pointer", transition: "all 0.15s", textAlign: "left" }}>
                  <div>
                    <div className="bc" style={{ fontSize: 15, fontWeight: 700, color: "#fff",
                      textTransform: "uppercase" }}>
                      {a.nombre}
                    </div>
                    <div className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                      {a.kcal} kcal · P {a.p}g · C {a.c}g · G {a.g}g
                    </div>
                  </div>
                  <span style={{ fontSize: 20, color: activo ? R : "rgba(255,255,255,0.2)",
                    flexShrink: 0, marginLeft: 12 }}>
                    {activo ? "✓" : "+"}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Barras de totales */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 4 }}>
            {barras.map(b => {
              const pct = Math.min(Math.round((b.val / b.meta) * 100), 100)
              return (
                <div key={b.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span className="bc" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                      textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
                      {b.label}
                    </span>
                    <span className="bc" style={{ fontSize: 12, fontWeight: 700, color: b.color }}>
                      {Math.round(b.val)}{b.unit} <span style={{ color: "rgba(255,255,255,0.3)" }}>/ {b.meta}{b.unit}</span>
                    </span>
                  </div>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4,
                    overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: b.color,
                      borderRadius: 4, transition: "width 0.4s cubic-bezier(0.22,1,0.36,1)" }} />
                  </div>
                </div>
              )
            })}
            {seleccionados.length === 0 && (
              <p className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8,
                fontStyle: "italic" }}>
                Toca uno o varios alimentos de la izquierda para ver esto en acción.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════
   CTA FINAL
   ══════════════════════════════════════════════════════════ */
function CierreCTA() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px", textAlign: "center" }}>
      <h2 className="bc" style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 900,
        textTransform: "uppercase", lineHeight: 1.05, marginBottom: 20 }}>
        Deja de adivinar.<br/><span style={{ color: R }}>Empieza a medir.</span>
      </h2>
      <a href="https://wa.me/573243747367" target="_blank" rel="noopener noreferrer"
        className="bc" style={{ display: "inline-block", padding: "18px 40px", background: R,
          color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 900,
          letterSpacing: "0.15em", textTransform: "uppercase" }}>
        Hablemos por WhatsApp →
      </a>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex",
        justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <span className="bc" style={{ fontSize: 15, fontWeight: 900 }}>
          COACH<span style={{ color: R }}>.</span>DAVID
        </span>
        <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          Bogotá, Colombia · @coachfitdavid
        </span>
      </div>
    </footer>
  )
}

/* ══════════════════════════════════════════════════════════
   ESTILOS
   ══════════════════════════════════════════════════════════ */
function Estilos() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      html{scroll-behavior:smooth}
      .bc{font-family:'Barlow Condensed',Impact,sans-serif}
      .b{font-family:'Barlow',sans-serif}
      button{font-family:inherit}
      @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @media (max-width: 720px){
        .demo-macros-grid{grid-template-columns:1fr !important}
      }
      @media (prefers-reduced-motion: reduce){
        *{animation-duration:0.01ms !important;transition-duration:0.01ms !important}
      }
    `}</style>
  )
}
