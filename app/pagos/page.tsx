"use client"

import { useEffect, useRef, useState } from "react"

const R = "#E8000D"
const WOMPI_KEY = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "pub_prod_cXRe0FNsCRAEba9ktkXCSG7U52gWqIxM"

/* ── Hook responsive ──────────────────────────────────────────── */
function useBreakpoint() {
  const [w, setW] = useState(1200)
  useEffect(() => {
    const check = () => setW(window.innerWidth)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return { isMobile: w < 768, isTablet: w < 1024 }
}

/* ── Programas disponibles ────────────────────────────────────── */
const PROGRAMAS = [
  {
    id: "entrenamiento",
    nombre: "Programa de Entrenamiento",
    precio: 140000,
    desc: "Plan personalizado de entrenamiento · Seguimiento 1 a 1 · Progresión planificada",
    tag: "01",
  },
  {
    id: "alimentacion",
    nombre: "Estrategia de Alimentación",
    precio: 130000,
    desc: "Plan nutricional personalizado · Ajustes constantes · Seguimiento continuo",
    tag: "02",
  },
  {
    id: "duo",
    nombre: "Programa DUO",
    precio: 220000,
    desc: "Entrenamiento + Alimentación integrados · Seguimiento completo · Máximos resultados",
    tag: "03",
    featured: true,
  },
  {
    id: "personalizado",
    nombre: "Monto personalizado",
    precio: 0,
    desc: "Para descuentos especiales o acuerdos particulares. Ingresa el valor acordado.",
    tag: "★",
    custom: true,
  },
]

/* ── Generar referencia única ─────────────────────────────────── */
function generarRef() {
  return `CD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

/* ── Formatear pesos colombianos ──────────────────────────────── */
function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n)
}

/* ══ COMPONENTE PRINCIPAL ═════════════════════════════════════════ */
export default function Pagos() {
  const { isMobile } = useBreakpoint()
  const [heroIn, setHeroIn] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [montoPersonalizado, setMontoPersonalizado] = useState("")
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"select" | "form" | "checkout">("select")
  const [error, setError] = useState<string | null>(null)
  const [referencia] = useState(generarRef)
  const widgetRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => { setTimeout(() => setHeroIn(true), 80) }, [])

  /* ── Programa seleccionado ──────────────────────────────────── */
  const programa = PROGRAMAS.find(p => p.id === selectedId)
  const monto = programa?.custom
    ? parseInt(montoPersonalizado.replace(/\D/g, "")) || 0
    : programa?.precio || 0
  const montoEnCentavos = monto * 100

  /* ── Validación y avance ────────────────────────────────────── */
  const irAFormulario = () => {
    if (!selectedId) return setError("Selecciona un programa para continuar.")
    if (programa?.custom && (!montoPersonalizado || monto < 10000))
      return setError("Ingresa un monto válido (mínimo $10.000).")
    setError(null)
    setStep("form")
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100)
  }

  const irACheckout = () => {
    if (!nombre.trim()) return setError("Ingresa tu nombre completo.")
    if (!email.trim() || !email.includes("@")) return setError("Ingresa un correo electrónico válido.")
    setError(null)
    setStep("checkout")
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
      cargarWidget()
    }, 200)
  }

  /* ── Cargar widget de Wompi ─────────────────────────────────── */
  const cargarWidget = () => {
    const container = widgetRef.current
    if (!container) return

    // Limpiar widget anterior
    container.innerHTML = ""
    if (scriptRef.current) scriptRef.current.remove()

    const script = document.createElement("script")
    script.src = "https://checkout.wompi.co/widget.js"
    script.dataset["render"] = "button"
    script.dataset["publicKey"] = WOMPI_KEY
    script.dataset["currency"] = "COP"
    script.dataset["amountInCents"] = String(montoEnCentavos)
    script.dataset["reference"] = referencia
    script.dataset["signatureIntegrity"] = "" // Ver nota abajo
    script.dataset["redirectUrl"] = `${typeof window !== "undefined" ? window.location.origin : ""}/pagos/confirmacion?ref=${referencia}`
    script.dataset["customerDataEmail"] = email
    script.dataset["customerDataFullName"] = nombre

    container.appendChild(script)
    scriptRef.current = script
  }

  const pad = isMobile ? "72px 20px" : "100px 64px"

  return (
    <div style={{ background: "#000", color: "#fff", fontFamily: "'Barlow', sans-serif", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${R}; color: #fff; }
        .bc { font-family: 'Barlow Condensed', Impact, sans-serif; }
        .b  { font-family: 'Barlow', sans-serif; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseR  { 0%,100%{box-shadow:0 0 0 0 ${R}40} 50%{box-shadow:0 0 0 8px transparent} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        /* Botón de Wompi */
        [data-wompi-widget] button,
        .wompi-button { width: 100% !important; }
      `}</style>

      {/* Línea roja top */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: R, zIndex: 50 }} />

      {/* ── HEADER ────────────────────────────────────────────── */}
      <header style={{ position: "fixed", top: 2, left: 0, right: 0, zIndex: 100, background: "rgba(0,0,0,0.94)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" className="bc" style={{ fontSize: isMobile ? 16 : 20, fontWeight: 900, letterSpacing: "0.05em", textDecoration: "none", color: "#fff" }}>
            COACH<span style={{ color: R }}>.</span>DAVID
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", animation: "blink 2s ease infinite" }} />
            <span className="bc" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.25em", textTransform: "uppercase" }}>Pago seguro · Wompi</span>
          </div>
        </div>
      </header>

      {/* ── STEPPER ───────────────────────────────────────────── */}
      <div style={{ position: "fixed", top: 58, left: 0, right: 0, zIndex: 99, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", gap: 0 }}>
          {[
            { n: "01", label: "Programa", key: "select" },
            { n: "02", label: "Tus datos", key: "form" },
            { n: "03", label: "Pago", key: "checkout" },
          ].map((s, i) => {
            const steps = ["select", "form", "checkout"]
            const current = steps.indexOf(step)
            const isActive = steps.indexOf(s.key as any) === current
            const isDone = steps.indexOf(s.key as any) < current
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "initial" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: isDone ? R : isActive ? "#fff" : "transparent",
                    border: `2px solid ${isDone ? R : isActive ? "#fff" : "rgba(255,255,255,0.15)"}`,
                    flexShrink: 0,
                  }}>
                    {isDone
                      ? <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>
                      : <span className="bc" style={{ fontSize: 12, fontWeight: 900, color: isActive ? "#000" : "rgba(255,255,255,0.3)" }}>{s.n}</span>
                    }
                  </div>
                  {!isMobile && (
                    <span className="bc" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: isActive ? "#fff" : isDone ? R : "rgba(255,255,255,0.25)" }}>
                      {s.label}
                    </span>
                  )}
                </div>
                {i < 2 && <div style={{ flex: 1, height: 1, background: isDone ? R : "rgba(255,255,255,0.08)", margin: "0 12px", minWidth: 20 }} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── CONTENIDO ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: pad, paddingTop: isMobile ? "130px" : "140px" }}>

        {/* ── STEP 1: Seleccionar programa ──────────────────── */}
        {step === "select" && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>

            {/* Header */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20,opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)", transition: "all 0.7s ease 0.1s" }}>
                <div style={{ width: 32, height: 2, background: R }} />
                <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Pago de mensualidad</span>
              </div>
              <h1 className="bc" style={{
                fontSize: isMobile ? "clamp(40px, 11vw, 60px)" : "clamp(48px, 5vw, 72px)",
                fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em",
                marginBottom: 16,
                opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(24px)", transition: "all 0.7s ease 0.2s",
              }}>
                ELIGE TU<br /><span style={{ color: R }}>PROGRAMA</span>
              </h1>
              <p className="b" style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontWeight: 300, maxWidth: 480, opacity: heroIn ? 1 : 0, transition: "opacity 0.7s ease 0.35s" }}>
                Selecciona el programa que vas a pagar. Si tienes un descuento especial, elige la opción de monto personalizado.
              </p>
            </div>

            {/* Cards de programa */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
              {PROGRAMAS.map((p, i) => {
                const isSelected = selectedId === p.id
                return (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedId(p.id); setError(null) }}
                    style={{
                      padding: isMobile ? "20px 18px" : "24px 28px",
                      border: `${isSelected ? "2px" : "1px"} solid ${isSelected ? R : p.featured && !isSelected ? `${R}30` : "rgba(255,255,255,0.08)"}`,
                      background: isSelected ? `${R}10` : p.featured ? `${R}04` : "rgba(255,255,255,0.02)",
                      cursor: "pointer", transition: "all 0.2s ease",
                      position: "relative", overflow: "hidden",
                      animation: `fadeUp 0.5s ease ${i * 80}ms both`,
                    }}
                  >
                    {p.featured && !isSelected && (
                      <div style={{ position: "absolute", top: 12, right: 12, background: `${R}20`, border: `1px solid ${R}40`, padding: "3px 8px" }}>
                        <span className="bc" style={{ fontSize: 10, color: R, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>Recomendado</span>
                      </div>
                    )}
                    {isSelected && (
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: R }} />
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>

                        {/* Radio */}
                        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${isSelected ? R : "rgba(255,255,255,0.2)"}`, background: isSelected ? R : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}>
                          {isSelected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                        </div>

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <span className="bc" style={{ fontSize: 10, color: isSelected ? R : "rgba(255,255,255,0.2)", fontWeight: 700, letterSpacing: "0.25em" }}>{p.tag}</span>
                            <span className="bc" style={{ fontSize: isMobile ? 17 : 20, fontWeight: 900, textTransform: "uppercase", color: isSelected ? "#fff" : "rgba(255,255,255,0.7)", letterSpacing: "-0.01em" }}>{p.nombre}</span>
                          </div>
                          <p className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 300, lineHeight: 1.4 }}>{p.desc}</p>
                        </div>
                      </div>

                      {/* Precio */}
                      {!p.custom && (
                        <div className="bc" style={{ fontSize: isMobile ? 24 : 30, fontWeight: 900, color: isSelected ? R : "rgba(255,255,255,0.4)", letterSpacing: "-0.02em", flexShrink: 0 }}>
                          {formatCOP(p.precio)}
                          <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginLeft: 4, fontWeight: 300 }}>/mes</span>
                        </div>
                      )}
                      {p.custom && (
                        <div className="bc" style={{ fontSize: 14, color: isSelected ? R : "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>
                          Tú defines el valor
                        </div>
                      )}
                    </div>

                    {/* Campo de monto personalizado */}
                    {p.custom && isSelected && (
                      <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${R}25`, animation: "slideIn 0.3s ease" }}>
                        <label className="bc" style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
                          Monto acordado (COP) <span style={{ color: R }}>*</span>
                        </label>
                        <div style={{ position: "relative" }}>
                          <span className="bc" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>$</span>
                          <input
                            type="text"
                            placeholder="Ej: 120.000"
                            value={montoPersonalizado}
                            onClick={e => e.stopPropagation()}
                            onChange={e => {
                              const raw = e.target.value.replace(/\D/g, "")
                              const num = parseInt(raw)
                              setMontoPersonalizado(raw ? num.toLocaleString("es-CO") : "")
                            }}
                            style={{ width: "100%", padding: "14px 16px 14px 32px", background: "rgba(255,255,255,0.06)", border: `1px solid ${R}40`, color: "#fff", fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 20, fontWeight: 700, outline: "none" }}
                          />
                        </div>
                        {monto > 0 && (
                          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 4, height: 4, background: R, transform: "rotate(45deg)" }} />
                            <span className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>
                              Pagarás <strong style={{ color: "#fff" }}>{formatCOP(monto)}</strong> pesos colombianos
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Resumen seleccionado */}
            {selectedId && programa && (
              <div style={{ padding: "16px 20px", border: `1px solid ${R}25`, background: `${R}08`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24, animation: "slideIn 0.3s ease" }}>
                <div className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", fontWeight: 300 }}>
                  {programa.nombre}
                </div>
                {monto > 0 && (
                  <div className="bc" style={{ fontSize: 24, fontWeight: 900, color: R }}>{formatCOP(monto)}</div>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ padding: "12px 16px", border: `1px solid ${R}40`, background: `${R}0d`, display: "flex", gap: 10, alignItems: "center", marginBottom: 20, animation: "slideIn 0.3s ease" }}>
                <span style={{ color: R, fontWeight: 900, fontSize: 16 }}>!</span>
                <span className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{error}</span>
              </div>
            )}

            {/* Botón continuar */}
            <ContinueBtn onClick={irAFormulario}>Continuar con mis datos →</ContinueBtn>

            {/* Info de seguridad */}
            <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
              <span style={{ fontSize: 14 }}>🔒</span>
              <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 300 }}>
                Pago 100% seguro procesado por Wompi · Bancolombia
              </span>
            </div>
          </div>
        )}

        {/* ── STEP 2: Datos del usuario ─────────────────────── */}
        {step === "form" && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>

            {/* Resumen del programa */}
            <div style={{ padding: "16px 20px", border: `1px solid ${R}25`, background: `${R}08`, marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>Pagando</div>
                <div className="bc" style={{ fontSize: 18, fontWeight: 800, textTransform: "uppercase" }}>{programa?.nombre}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="bc" style={{ fontSize: 28, fontWeight: 900, color: R }}>{formatCOP(monto)}</div>
                <button onClick={() => setStep("select")} className="b" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 12, cursor: "pointer", textDecoration: "underline", padding: 0, marginTop: 4 }}>
                  Cambiar programa
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 32, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Tus datos</span>
            </div>
            <h2 className="bc" style={{ fontSize: isMobile ? "clamp(36px, 10vw, 52px)" : "clamp(36px, 4vw, 56px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 32 }}>
              CONFIRMA<br /><span style={{ color: R }}>QUIÉN PAGA</span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
              <div>
                <label className="bc" style={{ display: "block", marginBottom: 8, fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                  Nombre completo <span style={{ color: R }}>*</span>
                </label>
                <input
                  type="text" value={nombre} placeholder="Tu nombre completo"
                  onChange={e => setNombre(e.target.value)}
                  style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: 15, outline: "none", transition: "border-color 0.2s ease" }}
                  onFocus={e => (e.target.style.borderColor = R)}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
              <div>
                <label className="bc" style={{ display: "block", marginBottom: 8, fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                  Correo electrónico <span style={{ color: R }}>*</span>
                </label>
                <input
                  type="email" value={email} placeholder="tu@correo.com"
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: 15, outline: "none", transition: "border-color 0.2s ease" }}
                  onFocus={e => (e.target.style.borderColor = R)}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <p className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 6, fontWeight: 300 }}>
                  Recibirás la confirmación de pago en este correo.
                </p>
              </div>
            </div>

            {error && (
              <div style={{ padding: "12px 16px", border: `1px solid ${R}40`, background: `${R}0d`, display: "flex", gap: 10, alignItems: "center", marginBottom: 20, animation: "slideIn 0.3s ease" }}>
                <span style={{ color: R, fontWeight: 900, fontSize: 16 }}>!</span>
                <span className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{error}</span>
              </div>
            )}

            <ContinueBtn onClick={irACheckout}>Ir al pago seguro →</ContinueBtn>

            <button onClick={() => setStep("select")} className="b" style={{ display: "block", margin: "16px auto 0", background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
              ← Volver
            </button>
          </div>
        )}

        {/* ── STEP 3: Checkout Wompi ────────────────────────── */}
        {step === "checkout" && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>

            {/* Resumen final */}
            <div style={{ padding: "20px 24px", border: `2px solid ${R}`, background: `${R}08`, marginBottom: 40, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: R }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>Resumen de pago</div>
                  <div className="bc" style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, textTransform: "uppercase", marginBottom: 4 }}>{programa?.nombre}</div>
                  <div className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>{nombre} · {email}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="bc" style={{ fontSize: isMobile ? 32 : 44, fontWeight: 900, color: R, lineHeight: 1 }}>{formatCOP(monto)}</div>
                  <div className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Ref: {referencia}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 32, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Selecciona tu método de pago</span>
            </div>
            <h2 className="bc" style={{ fontSize: isMobile ? "clamp(36px, 10vw, 52px)" : "clamp(36px, 4vw, 56px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 12 }}>
              ELIGE CÓMO<br /><span style={{ color: R }}>PAGAR</span>
            </h2>
            <p className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 32, fontWeight: 300, lineHeight: 1.6 }}>
              El checkout de Wompi te permite pagar con <strong style={{ color: "rgba(255,255,255,0.7)" }}>PSE</strong>, tarjeta débito/crédito, Nequi, Daviplata o Bancolombia.
            </p>

            {/* Métodos disponibles — visual */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
              {["PSE", "Tarjeta", "Nequi", "Daviplata", "Bancolombia"].map(m => (
                <div key={m} style={{ padding: "6px 14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                  <span className="bc" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>{m}</span>
                </div>
              ))}
            </div>

            {/* Widget de Wompi */}
            <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)", padding: isMobile ? "28px 20px" : "40px 40px", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: R }} />

              {/* Nota sobre integridad */}
              <div style={{ padding: "14px 18px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", marginBottom: 28, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "#eab308", fontSize: 14, flexShrink: 0, marginTop: 2 }}>⚠</span>
                <div className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, fontWeight: 300 }}>
                  Para activar el widget necesitas configurar la <strong style={{ color: "rgba(255,255,255,0.6)" }}>firma de integridad</strong> desde tu backend.
                  Mientras tanto, usa el enlace de pago directo abajo.
                </div>
              </div>

              {/* Contenedor del widget */}
              <div ref={widgetRef} style={{ minHeight: 60 }} />

              {/* Botón alternativo — enlace directo Wompi */}
              <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                  <span className="bc" style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em", textTransform: "uppercase" }}>O paga directo</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                </div>

                <a
                  href={`https://checkout.wompi.co/l/${WOMPI_KEY}?amount-in-cents=${montoEnCentavos}&currency=COP&reference=${referencia}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                    background: R, color: "#fff", padding: "18px", width: "100%",
                    fontFamily: "'Barlow Condensed', Impact, sans-serif",
                    fontSize: 16, fontWeight: 900, letterSpacing: "0.22em",
                    textTransform: "uppercase", textDecoration: "none",
                    clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))",
                    boxShadow: `0 12px 40px ${R}40`, transition: "all 0.25s ease",
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "#fff"; el.style.color = "#000" }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = R; el.style.color = "#fff" }}
                >
                  🔒 Pagar {formatCOP(monto)} ahora →
                </a>

                <p className="b" style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.2)", lineHeight: 1.5 }}>
                  Serás redirigido al checkout seguro de Wompi donde podrás elegir PSE, tarjeta, Nequi u otros métodos.
                </p>
              </div>
            </div>

            <button onClick={() => setStep("form")} className="b" style={{ display: "block", margin: "20px auto 0", background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
              ← Volver
            </button>
          </div>
        )}

        {/* ── Info de seguridad bottom ──────────────────────── */}
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" }}>
          {[
            { icon: "🔒", t: "Pago encriptado SSL" },
            { icon: "🏦", t: "Procesado por Wompi · Bancolombia" },
            { icon: "🛡️", t: "Datos protegidos" },
          ].map(item => (
            <div key={item.t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 300 }}>{item.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Botón continuar ──────────────────────────────────────────── */
function ContinueBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: "100%", padding: "19px",
        background: hover ? "#fff" : R, color: hover ? "#000" : "#fff",
        border: "none", fontFamily: "'Barlow Condensed', Impact, sans-serif",
        fontSize: 16, fontWeight: 900, letterSpacing: "0.25em",
        textTransform: "uppercase", cursor: "pointer",
        clipPath: "polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))",
        boxShadow: hover ? "none" : `0 0 40px ${R}35`,
        transition: "all 0.25s ease",
      }}
    >{children}</button>
  )
}
