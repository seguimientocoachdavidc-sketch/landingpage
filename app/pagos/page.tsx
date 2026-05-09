"use client"

import { useEffect, useRef, useState } from "react"

const R = "#E8000D"
const WOMPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "pub_prod_cXRe0FNsCRAEba9ktkXCSG7U52gWqIxM"

/* ── Hook responsive ──────────────────────────────────────────── */
function useBreakpoint() {
  const [w, setW] = useState(1200)
  useEffect(() => {
    const check = () => setW(window.innerWidth)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return { isMobile: w < 768 }
}

/* ── Programas ────────────────────────────────────────────────── */
const PROGRAMAS = [
  {
    id: "entrenamiento",
    nombre: "Programa de Entrenamiento",
    precio: 140000,
    desc: "Plan personalizado · Seguimiento 1 a 1 · Progresión planificada",
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

function generarRef() {
  return `CD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(n)
}

/* ── Botón continuar ──────────────────────────────────────────── */
function ContinueBtn({ onClick, children, disabled = false }: {
  onClick: () => void; children: React.ReactNode; disabled?: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: "100%", padding: "19px", border: "none",
        background: disabled ? "rgba(232,0,13,0.4)" : hover ? "#fff" : R,
        color: disabled ? "rgba(255,255,255,0.5)" : hover ? "#000" : "#fff",
        fontFamily: "'Barlow Condensed', Impact, sans-serif",
        fontSize: 16, fontWeight: 900, letterSpacing: "0.25em",
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        clipPath: "polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))",
        boxShadow: disabled || hover ? "none" : `0 0 40px ${R}35`,
        transition: "all 0.25s ease",
      }}
    >{children}</button>
  )
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
  const [cargandoFirma, setCargandoFirma] = useState(false)
  const [referencia] = useState(generarRef)
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => setHeroIn(true), 80)

    // Leer programa preseleccionado desde URL (?programa=entrenamiento)
    const params = new URLSearchParams(window.location.search)
    const prog = params.get("programa")
    if (prog && PROGRAMAS.find(p => p.id === prog)) {
      setSelectedId(prog)
    }
  }, [])

  const programa = PROGRAMAS.find(p => p.id === selectedId)
  const monto = programa?.custom
    ? parseInt(montoPersonalizado.replace(/\D/g, "")) || 0
    : programa?.precio || 0
  const montoEnCentavos = monto * 100

  /* ── Validación paso 1 ──────────────────────────────────────── */
  const irAFormulario = () => {
    if (!selectedId) return setError("Selecciona un programa para continuar.")
    if (programa?.custom && monto < 10000)
      return setError("Ingresa un monto válido (mínimo $10.000).")
    setError(null)
    setStep("form")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /* ── Validación paso 2 + generación de firma ────────────────── */
  const irACheckout = async () => {
    if (!nombre.trim()) return setError("Ingresa tu nombre completo.")
    if (!email.trim() || !email.includes("@")) return setError("Ingresa un correo electrónico válido.")
    setError(null)
    setCargandoFirma(true)

    try {
      // Pedir la firma al backend
      const res = await fetch("/api/wompi-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: referencia,
          amountInCents: montoEnCentavos,
          currency: "COP",
        }),
      })

      if (!res.ok) throw new Error("Error generando firma")
      const { firma } = await res.json()

      setStep("checkout")
      window.scrollTo({ top: 0, behavior: "smooth" })

      // Dar tiempo al DOM para montar el contenedor antes de insertar el script
      setTimeout(() => cargarWidget(firma), 300)

    } catch (err) {
      console.error(err)
      setError("Error al preparar el checkout. Intenta de nuevo.")
    } finally {
      setCargandoFirma(false)
    }
  }

  /* ── Cargar widget de Wompi con firma válida ────────────────── */
  const cargarWidget = (firma: string) => {
    const container = widgetRef.current
    if (!container) return

    // Limpiar cualquier widget anterior
    container.innerHTML = ""

    const script = document.createElement("script")
    script.src = "https://checkout.wompi.co/widget.js"
    script.setAttribute("data-render", "button")
    script.setAttribute("data-public-key", WOMPI_PUBLIC_KEY)
    script.setAttribute("data-currency", "COP")
    script.setAttribute("data-amount-in-cents", String(montoEnCentavos))
    script.setAttribute("data-reference", referencia)
    script.setAttribute("data-signature:integrity", firma)
    script.setAttribute(
      "data-redirect-url",
      `${window.location.origin}/pagos/confirmacion?ref=${referencia}`
    )
    script.setAttribute("data-customer-data:email", email)
    script.setAttribute("data-customer-data:full-name", nombre)

    container.appendChild(script)
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
        @keyframes slideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes pulseR  { 0%,100%{box-shadow:0 0 0 0 ${R}40} 50%{box-shadow:0 0 0 8px transparent} }
        /* Fuerza al botón de Wompi a ocupar el ancho completo */
        #wompi-widget-container button,
        #wompi-widget-container .wf-button,
        #wompi-widget-container form { width: 100% !important; }
      `}</style>

      {/* Línea roja fija top */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: R, zIndex: 200 }} />

      {/* ── HEADER ────────────────────────────────────────────── */}
      <header style={{
        position: "fixed", top: 2, left: 0, right: 0, zIndex: 100,
        background: "rgba(0,0,0,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" className="bc" style={{ fontSize: isMobile ? 16 : 20, fontWeight: 900, letterSpacing: "0.05em", textDecoration: "none", color: "#fff" }}>
            COACH<span style={{ color: R }}>.</span>DAVID
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", animation: "blink 2s ease infinite" }} />
            <span className="bc" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.25em", textTransform: "uppercase" }}>
              Pago seguro · Wompi
            </span>
          </div>
        </div>
      </header>

      {/* ── STEPPER ───────────────────────────────────────────── */}
      <div style={{
        position: "fixed", top: 58, left: 0, right: 0, zIndex: 99,
        background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center" }}>
          {[
            { label: "Programa", key: "select" },
            { label: "Tus datos", key: "form" },
            { label: "Pago",     key: "checkout" },
          ].map((s, i) => {
            const steps = ["select", "form", "checkout"]
            const cur = steps.indexOf(step)
            const idx = steps.indexOf(s.key)
            const isActive = idx === cur
            const isDone   = idx < cur
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "initial" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isDone ? R : isActive ? "#fff" : "transparent",
                    border: `2px solid ${isDone ? R : isActive ? "#fff" : "rgba(255,255,255,0.15)"}`,
                    flexShrink: 0, transition: "all 0.3s ease",
                  }}>
                    {isDone
                      ? <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>
                      : <span className="bc" style={{ fontSize: 12, fontWeight: 900, color: isActive ? "#000" : "rgba(255,255,255,0.3)" }}>{String(i + 1).padStart(2, "0")}</span>
                    }
                  </div>
                  {!isMobile && (
                    <span className="bc" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: isActive ? "#fff" : isDone ? R : "rgba(255,255,255,0.25)", transition: "color 0.3s ease" }}>
                      {s.label}
                    </span>
                  )}
                </div>
                {i < 2 && <div style={{ flex: 1, height: 1, background: isDone ? R : "rgba(255,255,255,0.08)", margin: "0 12px", minWidth: 20, transition: "background 0.3s ease" }} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── CONTENIDO ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: pad, paddingTop: isMobile ? "132px" : "144px" }}>

        {/* ════ PASO 1 — Seleccionar programa ════════════════════ */}
        {step === "select" && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>

            <div style={{ marginBottom: 44 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, opacity: heroIn ? 1 : 0, transition: "all 0.7s ease 0.1s" }}>
                <div style={{ width: 32, height: 2, background: R }} />
                <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Pago de mensualidad</span>
              </div>
              <h1 className="bc" style={{ fontSize: isMobile ? "clamp(40px, 11vw, 60px)" : "clamp(48px, 5vw, 72px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 14, opacity: heroIn ? 1 : 0, transition: "all 0.7s ease 0.2s" }}>
                ELIGE TU<br /><span style={{ color: R }}>PROGRAMA</span>
              </h1>
              <p className="b" style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontWeight: 300, maxWidth: 480, opacity: heroIn ? 1 : 0, transition: "opacity 0.7s ease 0.35s" }}>
                Selecciona el programa a pagar. Si tienes un descuento especial, elige la opción de monto personalizado.
              </p>
            </div>

            {/* Cards de programa */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
              {PROGRAMAS.map((p, i) => {
                const isSelected = selectedId === p.id
                return (
                  <div key={p.id} onClick={() => { setSelectedId(p.id); setError(null) }}
                    style={{
                      padding: isMobile ? "18px 16px" : "22px 26px",
                      border: `${isSelected ? "2px" : "1px"} solid ${isSelected ? R : p.featured && !isSelected ? `${R}28` : "rgba(255,255,255,0.08)"}`,
                      background: isSelected ? `${R}10` : p.featured ? `${R}04` : "rgba(255,255,255,0.02)",
                      cursor: "pointer", transition: "all 0.2s ease", position: "relative", overflow: "hidden",
                      animation: `fadeUp 0.5s ease ${i * 70}ms both`,
                    }}
                  >
                    {isSelected && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: R }} />}
                    {p.featured && !isSelected && (
                      <div style={{ position: "absolute", top: 10, right: 12, background: `${R}20`, border: `1px solid ${R}35`, padding: "3px 8px" }}>
                        <span className="bc" style={{ fontSize: 9, color: R, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>Recomendado</span>
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
                        {/* Radio visual */}
                        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${isSelected ? R : "rgba(255,255,255,0.2)"}`, background: isSelected ? R : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}>
                          {isSelected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                            <span className="bc" style={{ fontSize: 10, color: isSelected ? R : "rgba(255,255,255,0.2)", fontWeight: 700, letterSpacing: "0.2em" }}>{p.tag}</span>
                            <span className="bc" style={{ fontSize: isMobile ? 16 : 19, fontWeight: 900, textTransform: "uppercase", color: isSelected ? "#fff" : "rgba(255,255,255,0.7)", letterSpacing: "-0.01em" }}>{p.nombre}</span>
                          </div>
                          <p className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.33)", fontWeight: 300, lineHeight: 1.4 }}>{p.desc}</p>
                        </div>
                      </div>
                      {/* Precio */}
                      {!p.custom && (
                        <div className="bc" style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, color: isSelected ? R : "rgba(255,255,255,0.35)", letterSpacing: "-0.02em", flexShrink: 0, transition: "color 0.2s ease" }}>
                          {formatCOP(p.precio)}
                          <span className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginLeft: 4, fontWeight: 300 }}>/mes</span>
                        </div>
                      )}
                      {p.custom && (
                        <div className="bc" style={{ fontSize: 12, color: isSelected ? R : "rgba(255,255,255,0.22)", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>Tú defines el valor</div>
                      )}
                    </div>

                    {/* Campo monto personalizado */}
                    {p.custom && isSelected && (
                      <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${R}22`, animation: "slideIn 0.3s ease" }}>
                        <label className="bc" style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: 8 }}>
                          Monto acordado (COP) <span style={{ color: R }}>*</span>
                        </label>
                        <div style={{ position: "relative" }}>
                          <span className="bc" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>$</span>
                          <input
                            type="text" placeholder="Ej: 120.000"
                            value={montoPersonalizado}
                            onClick={e => e.stopPropagation()}
                            onChange={e => {
                              const raw = e.target.value.replace(/\D/g, "")
                              const num = parseInt(raw)
                              setMontoPersonalizado(raw ? num.toLocaleString("es-CO") : "")
                            }}
                            style={{ width: "100%", padding: "13px 16px 13px 32px", background: "rgba(255,255,255,0.06)", border: `1px solid ${R}35`, color: "#fff", fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 20, fontWeight: 700, outline: "none" }}
                          />
                        </div>
                        {monto >= 10000 && (
                          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 4, height: 4, background: R, transform: "rotate(45deg)" }} />
                            <span className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>
                              Pagarás <strong style={{ color: "#fff" }}>{formatCOP(monto)}</strong>
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
            {selectedId && programa && monto > 0 && (
              <div style={{ padding: "14px 18px", border: `1px solid ${R}22`, background: `${R}08`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 20, animation: "slideIn 0.3s ease" }}>
                <span className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>{programa.nombre}</span>
                <span className="bc" style={{ fontSize: 22, fontWeight: 900, color: R }}>{formatCOP(monto)}</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ padding: "12px 16px", border: `1px solid ${R}40`, background: `${R}0d`, display: "flex", gap: 10, alignItems: "center", marginBottom: 18, animation: "slideIn 0.3s ease" }}>
                <span style={{ color: R, fontWeight: 900, fontSize: 16 }}>!</span>
                <span className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{error}</span>
              </div>
            )}

            <ContinueBtn onClick={irAFormulario}>Continuar con mis datos →</ContinueBtn>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20 }}>
              <span style={{ fontSize: 14 }}>🔒</span>
              <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 300 }}>Pago seguro procesado por Wompi · Bancolombia</span>
            </div>
          </div>
        )}

        {/* ════ PASO 2 — Datos del usuario ════════════════════════ */}
        {step === "form" && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>

            {/* Resumen programa */}
            <div style={{ padding: "16px 20px", border: `1px solid ${R}22`, background: `${R}08`, marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>Pagando</div>
                <div className="bc" style={{ fontSize: 18, fontWeight: 800, textTransform: "uppercase" }}>{programa?.nombre}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="bc" style={{ fontSize: 28, fontWeight: 900, color: R }}>{formatCOP(monto)}</div>
                <button onClick={() => setStep("select")} className="b" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 12, cursor: "pointer", textDecoration: "underline", padding: 0, marginTop: 4 }}>
                  Cambiar programa
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 32, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Tus datos</span>
            </div>
            <h2 className="bc" style={{ fontSize: isMobile ? "clamp(36px, 10vw, 52px)" : "clamp(36px, 4vw, 56px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 32 }}>
              CONFIRMA<br /><span style={{ color: R }}>QUIÉN PAGA</span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 28 }}>
              {[
                { label: "Nombre completo", val: nombre, set: setNombre, type: "text", placeholder: "Tu nombre completo" },
                { label: "Correo electrónico", val: email, set: setEmail, type: "email", placeholder: "tu@correo.com" },
              ].map(({ label, val, set, type, placeholder }) => (
                <div key={label}>
                  <label className="bc" style={{ display: "block", marginBottom: 8, fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>
                    {label} <span style={{ color: R }}>*</span>
                  </label>
                  <input
                    type={type} value={val} placeholder={placeholder}
                    onChange={e => set(e.target.value)}
                    style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: 15, outline: "none", transition: "border-color 0.2s ease" }}
                    onFocus={e => (e.target.style.borderColor = R)}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                  {label.includes("Correo") && (
                    <p className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", marginTop: 6, fontWeight: 300 }}>
                      Wompi enviará la confirmación del pago a este correo.
                    </p>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div style={{ padding: "12px 16px", border: `1px solid ${R}40`, background: `${R}0d`, display: "flex", gap: 10, alignItems: "center", marginBottom: 18, animation: "slideIn 0.3s ease" }}>
                <span style={{ color: R, fontWeight: 900, fontSize: 16 }}>!</span>
                <span className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{error}</span>
              </div>
            )}

            <ContinueBtn onClick={irACheckout} disabled={cargandoFirma}>
              {cargandoFirma ? "Preparando checkout seguro..." : "Ir al pago seguro →"}
            </ContinueBtn>

            {cargandoFirma && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 16 }}>
                <div style={{ width: 16, height: 16, border: `2px solid ${R}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <span className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Generando firma de seguridad...</span>
              </div>
            )}

            <button onClick={() => setStep("select")} className="b" style={{ display: "block", margin: "16px auto 0", background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
              ← Volver
            </button>
          </div>
        )}

        {/* ════ PASO 3 — Checkout Wompi ════════════════════════════ */}
        {step === "checkout" && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>

            {/* Resumen final */}
            <div style={{ padding: "20px 24px", border: `2px solid ${R}`, background: `${R}08`, marginBottom: 40, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: R }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>Resumen de pago</div>
                  <div className="bc" style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, textTransform: "uppercase", marginBottom: 4 }}>{programa?.nombre}</div>
                  <div className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>{nombre} · {email}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="bc" style={{ fontSize: isMobile ? 32 : 44, fontWeight: 900, color: R, lineHeight: 1 }}>{formatCOP(monto)}</div>
                  <div className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>Ref: {referencia}</div>
                </div>
              </div>
            </div>

            {/* Métodos disponibles */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 32, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Selecciona tu método de pago</span>
            </div>
            <h2 className="bc" style={{ fontSize: isMobile ? "clamp(36px, 10vw, 52px)" : "clamp(36px, 4vw, 56px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 16 }}>
              ELIGE CÓMO<br /><span style={{ color: R }}>PAGAR</span>
            </h2>
            <p className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 24, fontWeight: 300, lineHeight: 1.6 }}>
              Haz clic en el botón rojo para abrir el checkout seguro de Wompi y elegir tu método de pago.
            </p>

            {/* Badges de métodos */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
              {["PSE", "Tarjeta débito", "Tarjeta crédito", "Nequi", "Daviplata", "Bancolombia"].map(m => (
                <div key={m} style={{ padding: "5px 12px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                  <span className="bc" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>{m}</span>
                </div>
              ))}
            </div>

            {/* ✅ WIDGET DE WOMPI — aquí se inyecta el botón real */}
            <div style={{ background: "#0a0a0a", border: `1px solid ${R}30`, padding: isMobile ? "28px 20px" : "40px", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: R }} />

              <p className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 24, fontWeight: 300, lineHeight: 1.6 }}>
                Al hacer clic en el botón serás redirigido al entorno seguro de Wompi donde podrás completar tu pago con el método que prefieras.
              </p>

              {/* Contenedor donde Wompi inyecta el botón */}
              <div id="wompi-widget-container" ref={widgetRef} style={{ minHeight: 52 }} />

              <p className="b" style={{ textAlign: "center", marginTop: 18, fontSize: 12, color: "rgba(255,255,255,0.18)", lineHeight: 1.5 }}>
                🔒 Transacción cifrada SSL · Procesado por Wompi · Bancolombia
              </p>
            </div>

            <button onClick={() => setStep("form")} className="b" style={{ display: "block", margin: "20px auto 0", background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
              ← Volver
            </button>
          </div>
        )}

        {/* Sellos de seguridad */}
        <div style={{ marginTop: 52, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" }}>
          {[
            { icon: "🔒", t: "Encriptado SSL" },
            { icon: "🏦", t: "Wompi · Bancolombia" },
            { icon: "🛡️", t: "Datos protegidos" },
          ].map(item => (
            <div key={item.t} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 13 }}>{item.icon}</span>
              <span className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", fontWeight: 300 }}>{item.t}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
