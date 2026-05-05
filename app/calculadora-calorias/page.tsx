"use client"

import { useState, useEffect, useRef } from "react"

const R = "#E8000D"

/* ── Contador animado ─────────────────────────────────────────── */
function AnimCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const from = prev.current
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(from + (target - from) * ease))
      if (p < 1) requestAnimationFrame(tick)
      else prev.current = target
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return <>{val.toLocaleString("es-CO")}</>
}

/* ── FadeIn ───────────────────────────────────────────────────── */
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
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
      transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(36px)",
    }}>{children}</div>
  )
}

/* ── Datos de actividad ───────────────────────────────────────── */
const ACTIVIDADES = [
  { value: "sedentaria",  label: "Sedentaria",         desc: "Poco o ningún ejercicio",               factor: 1.2   },
  { value: "ligera",      label: "Ligera",              desc: "Ejercicio 1-3 días/semana",             factor: 1.375 },
  { value: "moderada",    label: "Moderada",            desc: "Ejercicio 3-5 días/semana",             factor: 1.55  },
  { value: "activa",      label: "Activa",              desc: "Ejercicio 6-7 días/semana",             factor: 1.725 },
  { value: "muy_activa",  label: "Muy activa",          desc: "Doble sesión / trabajo físico intenso", factor: 1.9   },
]

/* ── Interpretación del resultado ────────────────────────────── */
function getInterpretacion(gasto: number) {
  if (gasto < 1600) return { tag: "Metabolismo bajo", color: "#eab308", desc: "Tu gasto es relativamente bajo. La composición corporal y la actividad son claves para optimizarlo." }
  if (gasto < 2200) return { tag: "Rango normal",     color: "#22c55e", desc: "Tu gasto está en rango saludable. Con la estrategia correcta, los resultados son alcanzables." }
  if (gasto < 3000) return { tag: "Metabolismo alto",  color: R,        desc: "Tu gasto energético es alto. Requiere una estrategia precisa para mantener o ganar masa muscular." }
  return              { tag: "Metabolismo muy alto",   color: R,        desc: "Gasto extremo. La nutrición y el volumen de entrenamiento son determinantes absolutos." }
}

/* ── Objetivos calóricos ──────────────────────────────────────── */
function getObjetivos(gasto: number) {
  return [
    { label: "Déficit (perder grasa)",        kcal: Math.round(gasto * 0.82), color: "#3b82f6", pct: "-18%" },
    { label: "Mantenimiento",                 kcal: gasto,                    color: "#fff",    pct: "Base" },
    { label: "Superávit (ganar músculo)",     kcal: Math.round(gasto * 1.12), color: R,         pct: "+12%" },
  ]
}

/* ══ COMPONENTE PRINCIPAL ═════════════════════════════════════════ */
export default function Calculadora() {
  const [heroIn, setHeroIn] = useState(false)
  const [form, setForm] = useState({ sexo: "", peso: "", altura: "", edad: "", actividad: "" })
  const [resultado, setResultado] = useState<{ tmb: number; gasto: number } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [activeField, setActiveField] = useState<string | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setTimeout(() => setHeroIn(true), 80) }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000) }

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "14px 18px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff", fontFamily: "'Barlow', sans-serif",
    fontSize: 15, outline: "none", transition: "border-color 0.2s ease",
  }

  const calcular = () => {
    const { sexo, peso, altura, edad, actividad } = form
    if (!sexo || !peso || !altura || !edad || !actividad)
      return showToast("Completa todos los campos antes de calcular.")

    const p = parseFloat(peso), h = parseFloat(altura), e = parseFloat(edad)
    const tmb = sexo === "hombre"
      ? 10 * p + 6.25 * h - 5 * e + 5
      : 10 * p + 6.25 * h - 5 * e - 161

    const act = ACTIVIDADES.find(a => a.value === actividad)!
    const gasto = Math.round(tmb * act.factor)

    setResultado({ tmb: Math.round(tmb), gasto })
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100)
  }

  const interp = resultado ? getInterpretacion(resultado.gasto) : null
  const objetivos = resultado ? getObjetivos(resultado.gasto) : []
  const actividadLabel = ACTIVIDADES.find(a => a.value === form.actividad)?.label || ""

  return (
    <main style={{ background: "#000", color: "#fff", fontFamily: "'Barlow', sans-serif", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,900&family=Barlow:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${R}; color: #fff; }
        .bc { font-family: 'Barlow Condensed', Impact, sans-serif; }
        .b  { font-family: 'Barlow', sans-serif; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        option { background: #111; color: #fff; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulseR  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes glow    { 0%,100%{box-shadow:0 0 20px ${R}30} 50%{box-shadow:0 0 50px ${R}60} }
        @keyframes slideIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Grilla de fondo */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <div style={{ position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)", width: 700, height: 500, background: `${R}08`, borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: R, zIndex: 50 }} />

      <div style={{ position: "relative", maxWidth: 860, margin: "0 auto", padding: "80px 32px 120px" }}>

        {/* ══ HERO ══════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 80 }}>

          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 28,
            opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)",
            transition: "all 0.7s ease 0.1s",
          }}>
            <div style={{ width: 36, height: 2, background: R }} />
            <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>
              Herramienta gratuita · Coach David
            </span>
          </div>

          <h1 className="bc" style={{
            fontSize: "clamp(52px, 8vw, 110px)", fontWeight: 900,
            textTransform: "uppercase", lineHeight: 0.87, letterSpacing: "-0.02em",
            opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(32px)",
            transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s",
            marginBottom: 24,
          }}>
            CALCULA TU<br />
            <span style={{ color: R, textShadow: `0 0 60px ${R}40` }}>GASTO</span><br />
            ENERGÉTICO
          </h1>

          <p className="b" style={{
            fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontWeight: 300,
            maxWidth: 520,
            opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)",
            transition: "all 0.7s ease 0.45s",
          }}>
            Descubre cuántas calorías necesitas realmente. Basado en formulas usadas indirectas usadas mundialmente, el estándar científico actual.
          </p>

          {/* Badges informativos */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 10, marginTop: 32,
            opacity: heroIn ? 1 : 0, transition: "opacity 0.7s ease 0.6s",
          }}>
            {["Fórmula TMB modificada", "Resultado instantáneo", "3 objetivos calculados", "100% gratuito"].map((b, i) => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ width: 4, height: 4, background: R, transform: "rotate(45deg)" }} />
                <span className="bc" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══ FORMULARIO ════════════════════════════════════════════ */}
        <div style={{
          opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(24px)",
          transition: "all 0.8s ease 0.5s",
        }}>
          <SectionDivider label="Tus datos" />

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>

            {/* Sexo — botones */}
            <div>
              <FieldLabel>Sexo biológico</FieldLabel>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ v: "hombre", l: "Hombre" }, { v: "mujer", l: "Mujer" }].map(({ v, l }) => (
                  <button key={v} type="button" onClick={() => setForm(f => ({ ...f, sexo: v }))} style={{
                    flex: 1, padding: "14px 20px",
                    border: `1px solid ${form.sexo === v ? R : "rgba(255,255,255,0.1)"}`,
                    background: form.sexo === v ? `${R}18` : "rgba(255,255,255,0.02)",
                    color: form.sexo === v ? "#fff" : "rgba(255,255,255,0.4)",
                    fontFamily: "'Barlow Condensed', Impact, sans-serif",
                    fontSize: 16, fontWeight: 800, letterSpacing: "0.15em",
                    textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s ease",
                  }}>
                    {form.sexo === v && <span style={{ color: R, marginRight: 8 }}>◈</span>}
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Peso / Altura / Edad en grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { name: "peso",   placeholder: "Peso (kg)",   label: "Peso" },
                { name: "altura", placeholder: "Altura (cm)", label: "Altura" },
                { name: "edad",   placeholder: "Edad",        label: "Edad" },
              ].map(({ name, placeholder, label }) => (
                <div key={name}>
                  <FieldLabel>{label}</FieldLabel>
                  <input
                    type="number" name={name} placeholder={placeholder}
                    value={form[name as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                    style={{ ...inputBase, borderColor: activeField === name ? R : "rgba(255,255,255,0.1)" }}
                    onFocus={() => setActiveField(name)}
                    onBlur={() => setActiveField(null)}
                  />
                </div>
              ))}
            </div>

            {/* Nivel de actividad — tarjetas */}
            <div>
              <FieldLabel>Nivel de actividad física</FieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                {ACTIVIDADES.map(act => (
                  <button key={act.value} type="button"
                    onClick={() => setForm(f => ({ ...f, actividad: act.value }))}
                    style={{
                      padding: "14px 18px", textAlign: "left",
                      border: `1px solid ${form.actividad === act.value ? R : "rgba(255,255,255,0.07)"}`,
                      background: form.actividad === act.value ? `${R}10` : "rgba(255,255,255,0.015)",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      cursor: "pointer", transition: "all 0.2s ease",
                    }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 8, height: 8, flexShrink: 0,
                        border: `2px solid ${form.actividad === act.value ? R : "rgba(255,255,255,0.2)"}`,
                        background: form.actividad === act.value ? R : "transparent",
                        transition: "all 0.2s ease",
                      }} />
                      <div>
                        <div className="bc" style={{ fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: form.actividad === act.value ? "#fff" : "rgba(255,255,255,0.6)" }}>
                          {act.label}
                        </div>
                        <div className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 300, marginTop: 2 }}>{act.desc}</div>
                      </div>
                    </div>
                    <span className="bc" style={{ fontSize: 12, color: form.actividad === act.value ? R : "rgba(255,255,255,0.15)", fontWeight: 700, letterSpacing: "0.1em", flexShrink: 0 }}>
                      ×{act.factor}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toast */}
            {toast && (
              <div style={{
                padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start",
                border: `1px solid #eab30850`, background: "#eab3080d",
                animation: "slideIn 0.3s ease",
              }}>
                <span style={{ color: "#eab308", fontWeight: 900, fontSize: 17, lineHeight: 1 }}>!</span>
                <span className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{toast}</span>
              </div>
            )}

            {/* Botón calcular */}
            <CalcButton onClick={calcular} />
          </div>
        </div>

        {/* ══ RESULTADO ═════════════════════════════════════════════ */}
        {resultado && (
          <div ref={resultRef} style={{ marginTop: 72, animation: "slideIn 0.5s cubic-bezier(0.16,1,0.3,1)" }}>

            <SectionDivider label="Tus resultados" />

            {/* TMB + TDEE principales */}
            <FadeIn>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginTop: 24 }}>

                {/* TMB */}
                <div style={{ padding: "40px 36px", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.06)" }} />
                  <div className="bc" style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: 16 }}>
                    Tasa metabólica basal
                  </div>
                  <div className="bc" style={{ fontSize: "clamp(44px, 6vw, 72px)", fontWeight: 900, color: "rgba(255,255,255,0.7)", lineHeight: 1, letterSpacing: "-0.02em" }}>
                    <AnimCounter target={resultado.tmb} />
                  </div>
                  <div className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginTop: 8, fontWeight: 300 }}>
                    kcal/día · En reposo absoluto
                  </div>
                  <p className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", lineHeight: 1.5, marginTop: 12, fontWeight: 300 }}>
                    Lo que tu cuerpo necesita solo para mantenerse vivo sin ninguna actividad.
                  </p>
                </div>

                {/* TDEE — principal */}
                <div style={{
                  padding: "40px 36px", background: `${R}08`,
                  border: `2px solid ${R}`, position: "relative", overflow: "hidden",
                  animation: "glow 3s ease infinite",
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: R }} />
                  <div style={{ position: "absolute", top: 16, right: 16, background: R, padding: "4px 10px" }}>
                    <span className="bc" style={{ fontSize: 10, color: "#fff", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase" }}>Tu número</span>
                  </div>
                  <div className="bc" style={{ fontSize: 11, color: R, letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: 16 }}>
                    Gasto energético diario
                  </div>
                  <div className="bc" style={{ fontSize: "clamp(52px, 7vw, 88px)", fontWeight: 900, color: R, lineHeight: 1, letterSpacing: "-0.02em", textShadow: `0 0 40px ${R}50` }}>
                    <AnimCounter target={resultado.gasto} />
                  </div>
                  <div className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8, fontWeight: 300 }}>
                    kcal/día · Con tu nivel de actividad <strong style={{ color: "rgba(255,255,255,0.8)" }}>({actividadLabel})</strong>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Interpretación */}
            <FadeIn delay={100}>
              <div style={{ marginTop: 2, padding: "24px 32px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 3, background: interp!.color, alignSelf: "stretch", flexShrink: 0, borderRadius: 2 }} />
                <div>
                  <div className="bc" style={{ fontSize: 16, fontWeight: 800, textTransform: "uppercase", color: interp!.color, letterSpacing: "0.05em", marginBottom: 6 }}>
                    {interp!.tag}
                  </div>
                  <p className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, fontWeight: 300 }}>{interp!.desc}</p>
                </div>
              </div>
            </FadeIn>

            {/* Objetivos calóricos */}
            <FadeIn delay={150}>
              <div style={{ marginTop: 32 }}>
                <div className="bc" style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: 16 }}>
                  Calorías según tu objetivo
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2 }}>
                  {objetivos.map((obj, i) => (
                    <div key={obj.label} style={{
                      padding: "28px 24px", background: i === 1 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)",
                      border: `1px solid ${i === 1 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}`,
                      borderTop: `2px solid ${obj.color}`,
                    }}>
                      <div className="bc" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8 }}>
                        {obj.label}
                      </div>
                      <div className="bc" style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 900, color: obj.color, lineHeight: 1, letterSpacing: "-0.02em" }}>
                        <AnimCounter target={obj.kcal} />
                      </div>
                      <div className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>kcal/día</div>
                      <div style={{ marginTop: 10, display: "inline-block", padding: "3px 8px", background: `${obj.color}15`, border: `1px solid ${obj.color}30` }}>
                        <span className="bc" style={{ fontSize: 11, color: obj.color, fontWeight: 700, letterSpacing: "0.15em" }}>{obj.pct}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Advertencia educativa */}
            <FadeIn delay={200}>
              <div style={{ marginTop: 16, padding: "16px 20px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14, flexShrink: 0, marginTop: 2 }}>◉</span>
                <p className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", lineHeight: 1.6, fontWeight: 300 }}>
                  Estos valores son un punto de partida calculados con formulas Indirectas modificadas. El gasto real varía según composición corporal, genética y metabolismo individual. Una asesoría personalizada permite afinar estos números con datos reales.
                </p>
              </div>
            </FadeIn>

            {/* ── CTA VENDIBLE ──────────────────────────────────── */}
            <FadeIn delay={250}>
              <div style={{ marginTop: 56, position: "relative", overflow: "hidden" }}>

                {/* Fondo con resplandor */}
                <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 30% 50%, ${R}12 0%, transparent 60%)`, pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right, ${R}, transparent)` }} />

                <div style={{ border: `1px solid ${R}30`, background: `${R}06`, padding: "48px 44px", position: "relative" }}>

                  {/* Gancho */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 32, height: 2, background: R }} />
                    <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>
                      El siguiente paso
                    </span>
                  </div>

                  <h2 className="bc" style={{ fontSize: "clamp(32px, 4vw, 58px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 20 }}>
                    CONOCER TU GASTO<br />ES SOLO EL<br />
                    <span style={{ color: R }}>PUNTO DE PARTIDA.</span>
                  </h2>

                  <p className="b" style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontWeight: 300, maxWidth: 520, marginBottom: 32 }}>
                    El número que acabas de ver te dice <em style={{ color: "rgba(255,255,255,0.75)", fontStyle: "normal", fontWeight: 500 }}>cuánto</em> necesitas.
                    Lo que no te dice es <em style={{ color: "rgba(255,255,255,0.75)", fontStyle: "normal", fontWeight: 500 }}>cómo</em> estructurar tu alimentación,
                    qué alimentos priorizar, cómo ajustar según tu progreso real — ni cómo combinar esto con un programa de entrenamiento que realmente funcione.
                  </p>

                  {/* Bullets de valor */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 40 }}>
                    {[
                      "Plan de alimentación personalizado",
                      "Ajustes según tu progreso real",
                      "Programa de entrenamiento integrado",
                      "Seguimiento 1 a 1 constante",
                      "Estrategia específica para tu objetivo",
                      "Sin conjeturas — todo con datos reales",
                    ].map(item => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 5, height: 5, background: R, flexShrink: 0, transform: "rotate(45deg)" }} />
                        <span className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 300 }}>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Testimonial sutil */}
                  <div style={{ padding: "16px 20px", borderLeft: `3px solid ${R}`, background: "rgba(255,255,255,0.02)", marginBottom: 36 }}>
                    <p className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, fontStyle: "italic", fontWeight: 300 }}>
                      "La diferencia entre saber tu gasto y saber qué hacer con él es exactamente lo que separa a quien progresa de quien se estanca."
                    </p>
                    <div className="bc" style={{ fontSize: 12, color: R, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 10 }}>
                      — Coach David
                    </div>
                  </div>

                  {/* CTAs */}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
                      Quiero asesoría personalizada <span style={{ fontSize: 20 }}>→</span>
                    </a>
                    <a href="https://wa.me/573243747367?text=Hola Coach David, usé la calculadora y me interesa una asesoría personalizada."
                      target="_blank" rel="noopener noreferrer" className="bc"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 10,
                        border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.55)",
                        padding: "18px 32px", fontSize: 14, fontWeight: 800,
                        letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none",
                        transition: "all 0.25s ease",
                      }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = R; el.style.color = "#fff" }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "rgba(255,255,255,0.15)"; el.style.color = "rgba(255,255,255,0.55)" }}
                    >
                      Escribir por WhatsApp
                    </a>
                  </div>

                  <p className="b" style={{ marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.2)", letterSpacing: "0.05em" }}>
                    Sin compromisos. Una conversación para ver si hay fit.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Recalcular */}
            <FadeIn delay={300}>
              <div style={{ marginTop: 24, textAlign: "center" }}>
                <button onClick={() => { setResultado(null); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                  className="bc" style={{
                    background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.35)", padding: "12px 28px",
                    fontSize: 13, fontWeight: 700, letterSpacing: "0.2em",
                    textTransform: "uppercase", cursor: "pointer", transition: "all 0.25s ease",
                  }}
                  onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.target as HTMLButtonElement).style.color = "#fff" }}
                  onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.target as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)" }}
                >
                  ← Recalcular con otros datos
                </button>
              </div>
            </FadeIn>
          </div>
        )}
      </div>

      {/* Marquee inferior */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", padding: "10px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", animation: "marquee 24s linear infinite", width: "max-content" }}>
          {Array(8).fill(null).map((_, i) => (
            <span key={i} className="bc" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.1)", paddingRight: 80, whiteSpace: "nowrap" }}>
              Gasto energético · Coach David · Nutrición aplicada · Resultados reales ·&nbsp;
            </span>
          ))}
        </div>
      </div>
    </main>
  )
}

/* ── Helpers ──────────────────────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display: "block", marginBottom: 7,
      fontFamily: "'Barlow Condensed', Impact, sans-serif",
      fontSize: 11, fontWeight: 700, letterSpacing: "0.25em",
      textTransform: "uppercase", color: "rgba(255,255,255,0.38)",
    }}>{children} <span style={{ color: R }}>*</span></label>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
      <div style={{ width: 4, height: 4, background: R, transform: "rotate(45deg)", flexShrink: 0 }} />
      <span style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
    </div>
  )
}

function CalcButton({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick} type="button"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: "100%", padding: "20px",
        background: hover ? "#fff" : R, color: hover ? "#000" : "#fff",
        border: "none", fontFamily: "'Barlow Condensed', Impact, sans-serif",
        fontSize: 16, fontWeight: 900, letterSpacing: "0.25em",
        textTransform: "uppercase", cursor: "pointer",
        clipPath: "polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))",
        boxShadow: hover ? "none" : `0 0 40px ${R}35`,
        transition: "all 0.25s ease",
      }}>
      Calcular mi gasto energético →
    </button>
  )
}
