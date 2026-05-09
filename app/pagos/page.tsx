"use client"

import { useEffect, useRef, useState } from "react"

const R = "#E8000D"
const NEQUI_PHONE = "3058125122"
const NEQUI_LINK = `https://nequi.app.link/transfer?phone=${NEQUI_PHONE}`
const NEQUI_QR = "/qr-nequi.png.jpeg" // ← Sube tu QR a public/qr-nequi.png
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
  { id: "entrenamiento", nombre: "Programa de Entrenamiento", precio: 140000, desc: "Plan personalizado · Seguimiento 1 a 1 · Progresión planificada", tag: "01" },
  { id: "alimentacion",  nombre: "Estrategia de Alimentación", precio: 130000, desc: "Plan nutricional personalizado · Ajustes constantes · Seguimiento continuo", tag: "02" },
  { id: "duo",           nombre: "Programa DUO", precio: 220000, desc: "Entrenamiento + Alimentación integrados · Seguimiento completo", tag: "03", featured: true },
  { id: "personalizado", nombre: "Monto personalizado", precio: 0, desc: "Para descuentos especiales. Ingresa el valor acordado con Coach David.", tag: "★", custom: true },
]

function generarRef() {
  return `CD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n)
}

/* ── Botón continuar ──────────────────────────────────────────── */
function ContinueBtn({ onClick, children, disabled = false }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ width: "100%", padding: "19px", border: "none", background: disabled ? "rgba(232,0,13,0.4)" : hover ? "#fff" : R, color: disabled ? "rgba(255,255,255,0.5)" : hover ? "#000" : "#fff", fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 16, fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase", cursor: disabled ? "not-allowed" : "pointer", clipPath: "polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))", boxShadow: disabled || hover ? "none" : `0 0 40px ${R}35`, transition: "all 0.25s ease" }}>
      {children}
    </button>
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
  const [copiado, setCopiado] = useState(false)
  const [referencia] = useState(generarRef)
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => setHeroIn(true), 80)
    const params = new URLSearchParams(window.location.search)
    const prog = params.get("programa")
    if (prog && PROGRAMAS.find(p => p.id === prog)) setSelectedId(prog)
  }, [])

  const programa = PROGRAMAS.find(p => p.id === selectedId)
  const monto = programa?.custom ? parseInt(montoPersonalizado.replace(/\D/g, "")) || 0 : programa?.precio || 0
  const montoEnCentavos = monto * 100

  const irAFormulario = () => {
    if (!selectedId) return setError("Selecciona un programa para continuar.")
    if ((programa as any)?.custom && monto < 10000) return setError("Ingresa un monto válido (mínimo $10.000).")
    setError(null); setStep("form"); window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const irACheckout = async () => {
    if (!nombre.trim()) return setError("Ingresa tu nombre completo.")
    if (!email.trim() || !email.includes("@")) return setError("Ingresa un correo electrónico válido.")
    setError(null); setCargandoFirma(true)
    try {
      const res = await fetch("/api/wompi-signature", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: referencia, amountInCents: montoEnCentavos, currency: "COP" }),
      })
      if (!res.ok) throw new Error()
      const { firma } = await res.json()
      setStep("checkout"); window.scrollTo({ top: 0, behavior: "smooth" })
      setTimeout(() => cargarWidget(firma), 300)
    } catch { setError("Error al preparar el checkout. Intenta de nuevo.") }
    finally { setCargandoFirma(false) }
  }

  const cargarWidget = (firma: string) => {
    const container = widgetRef.current; if (!container) return
    container.innerHTML = ""
    const script = document.createElement("script")
    script.src = "https://checkout.wompi.co/widget.js"
    script.setAttribute("data-render", "button")
    script.setAttribute("data-public-key", WOMPI_PUBLIC_KEY)
    script.setAttribute("data-currency", "COP")
    script.setAttribute("data-amount-in-cents", String(montoEnCentavos))
    script.setAttribute("data-reference", referencia)
    script.setAttribute("data-signature:integrity", firma)
    script.setAttribute("data-redirect-url", `${window.location.origin}/pagos/confirmacion?ref=${referencia}`)
    script.setAttribute("data-customer-data:email", email)
    script.setAttribute("data-customer-data:full-name", nombre)
    container.appendChild(script)
  }

  const copiarNumero = () => {
    navigator.clipboard.writeText(NEQUI_PHONE)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
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
        #wompi-widget-container button,
        #wompi-widget-container .wf-button,
        #wompi-widget-container form { width: 100% !important; }
      `}</style>

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: R, zIndex: 200 }} />

      {/* ── HEADER ────────────────────────────────────────────── */}
      <header style={{ position: "fixed", top: 2, left: 0, right: 0, zIndex: 100, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" className="bc" style={{ fontSize: isMobile ? 16 : 20, fontWeight: 900, letterSpacing: "0.05em", textDecoration: "none", color: "#fff" }}>
            COACH<span style={{ color: R }}>.</span>DAVID
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", animation: "blink 2s ease infinite" }} />
            <span className="bc" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.25em", textTransform: "uppercase" }}>Pago seguro</span>
          </div>
        </div>
      </header>

      {/* ── STEPPER ───────────────────────────────────────────── */}
      <div style={{ position: "fixed", top: 58, left: 0, right: 0, zIndex: 99, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center" }}>
          {[{ label: "Programa", key: "select" }, { label: "Tus datos", key: "form" }, { label: "Pago", key: "checkout" }].map((s, i) => {
            const steps = ["select", "form", "checkout"]
            const cur = steps.indexOf(step), idx = steps.indexOf(s.key)
            const isActive = idx === cur, isDone = idx < cur
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "initial" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isDone ? R : isActive ? "#fff" : "transparent", border: `2px solid ${isDone ? R : isActive ? "#fff" : "rgba(255,255,255,0.15)"}`, flexShrink: 0, transition: "all 0.3s ease" }}>
                    {isDone ? <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>
                            : <span className="bc" style={{ fontSize: 12, fontWeight: 900, color: isActive ? "#000" : "rgba(255,255,255,0.3)" }}>{String(i + 1).padStart(2, "0")}</span>}
                  </div>
                  {!isMobile && <span className="bc" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: isActive ? "#fff" : isDone ? R : "rgba(255,255,255,0.25)", transition: "color 0.3s ease" }}>{s.label}</span>}
                </div>
                {i < 2 && <div style={{ flex: 1, height: 1, background: isDone ? R : "rgba(255,255,255,0.08)", margin: "0 12px", minWidth: 20, transition: "background 0.3s ease" }} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── CONTENIDO ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: pad, paddingTop: isMobile ? "132px" : "144px" }}>

        {/* ════ PASO 1 — Programa ══════════════════════════════════ */}
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

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
              {PROGRAMAS.map((p, i) => {
                const isSelected = selectedId === p.id
                return (
                  <div key={p.id} onClick={() => { setSelectedId(p.id); setError(null) }}
                    style={{ padding: isMobile ? "18px 16px" : "22px 26px", border: `${isSelected ? "2px" : "1px"} solid ${isSelected ? R : (p as any).featured && !isSelected ? `${R}28` : "rgba(255,255,255,0.08)"}`, background: isSelected ? `${R}10` : (p as any).featured ? `${R}04` : "rgba(255,255,255,0.02)", cursor: "pointer", transition: "all 0.2s ease", position: "relative", overflow: "hidden", animation: `fadeUp 0.5s ease ${i * 70}ms both` }}>
                    {isSelected && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: R }} />}
                    {(p as any).featured && !isSelected && (
                      <div style={{ position: "absolute", top: 10, right: 12, background: `${R}20`, border: `1px solid ${R}35`, padding: "3px 8px" }}>
                        <span className="bc" style={{ fontSize: 9, color: R, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>Recomendado</span>
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
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
                      {!(p as any).custom
                        ? <div className="bc" style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, color: isSelected ? R : "rgba(255,255,255,0.35)", letterSpacing: "-0.02em", flexShrink: 0, transition: "color 0.2s ease" }}>{formatCOP(p.precio)}<span className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginLeft: 4, fontWeight: 300 }}>/mes</span></div>
                        : <div className="bc" style={{ fontSize: 12, color: isSelected ? R : "rgba(255,255,255,0.22)", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>Tú defines el valor</div>
                      }
                    </div>
                    {(p as any).custom && isSelected && (
                      <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${R}22`, animation: "slideIn 0.3s ease" }}>
                        <label className="bc" style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: 8 }}>
                          Monto acordado (COP) <span style={{ color: R }}>*</span>
                        </label>
                        <div style={{ position: "relative" }}>
                          <span className="bc" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>$</span>
                          <input type="text" placeholder="Ej: 120.000" value={montoPersonalizado}
                            onClick={e => e.stopPropagation()}
                            onChange={e => { const raw = e.target.value.replace(/\D/g, ""); const num = parseInt(raw); setMontoPersonalizado(raw ? num.toLocaleString("es-CO") : "") }}
                            style={{ width: "100%", padding: "13px 16px 13px 32px", background: "rgba(255,255,255,0.06)", border: `1px solid ${R}35`, color: "#fff", fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 20, fontWeight: 700, outline: "none" }}
                          />
                        </div>
                        {monto >= 10000 && (
                          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 4, height: 4, background: R, transform: "rotate(45deg)" }} />
                            <span className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>Pagarás <strong style={{ color: "#fff" }}>{formatCOP(monto)}</strong></span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {selectedId && programa && monto > 0 && (
              <div style={{ padding: "14px 18px", border: `1px solid ${R}22`, background: `${R}08`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 20, animation: "slideIn 0.3s ease" }}>
                <span className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>{programa.nombre}</span>
                <span className="bc" style={{ fontSize: 22, fontWeight: 900, color: R }}>{formatCOP(monto)}</span>
              </div>
            )}

            {error && <ErrorBox msg={error} />}
            <ContinueBtn onClick={irAFormulario}>Continuar con mis datos →</ContinueBtn>
            <SecurityBadges />
          </div>
        )}

        {/* ════ PASO 2 — Datos ════════════════════════════════════ */}
        {step === "form" && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <ResumenBar programa={programa?.nombre || ""} monto={monto} onCambiar={() => setStep("select")} />

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 32, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Tus datos</span>
            </div>
            <h2 className="bc" style={{ fontSize: isMobile ? "clamp(36px, 10vw, 52px)" : "clamp(36px, 4vw, 56px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 32 }}>
              CONFIRMA<br /><span style={{ color: R }}>QUIÉN PAGA</span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 28 }}>
              {[
                { label: "Nombre completo", val: nombre, set: setNombre, type: "text", placeholder: "Tu nombre completo", hint: "" },
                { label: "Correo electrónico", val: email, set: setEmail, type: "email", placeholder: "tu@correo.com", hint: "Wompi enviará la confirmación del pago a este correo." },
              ].map(({ label, val, set, type, placeholder, hint }) => (
                <div key={label}>
                  <label className="bc" style={{ display: "block", marginBottom: 8, fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>
                    {label} <span style={{ color: R }}>*</span>
                  </label>
                  <input type={type} value={val} placeholder={placeholder} onChange={e => set(e.target.value)}
                    style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: 15, outline: "none", transition: "border-color 0.2s ease" }}
                    onFocus={e => (e.target.style.borderColor = R)} onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                  {hint && <p className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", marginTop: 6, fontWeight: 300 }}>{hint}</p>}
                </div>
              ))}
            </div>

            {error && <ErrorBox msg={error} />}
            <ContinueBtn onClick={irACheckout} disabled={cargandoFirma}>
              {cargandoFirma ? "Preparando checkout seguro..." : "Ir al pago seguro →"}
            </ContinueBtn>
            {cargandoFirma && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 16 }}>
                <div style={{ width: 16, height: 16, border: `2px solid ${R}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <span className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Generando firma de seguridad...</span>
              </div>
            )}
            <BackBtn onClick={() => setStep("select")} />
          </div>
        )}

        {/* ════ PASO 3 — Checkout ══════════════════════════════════ */}
        {step === "checkout" && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>

            {/* Resumen */}
            <div style={{ padding: "20px 24px", border: `2px solid ${R}`, background: `${R}08`, marginBottom: 40, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: R }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>Resumen</div>
                  <div className="bc" style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, textTransform: "uppercase", marginBottom: 4 }}>{programa?.nombre}</div>
                  <div className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>{nombre} · {email}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="bc" style={{ fontSize: isMobile ? 32 : 44, fontWeight: 900, color: R, lineHeight: 1 }}>{formatCOP(monto)}</div>
                  <div className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>Ref: {referencia}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 2, background: R }} />
              <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>Elige cómo pagar</span>
            </div>
            <h2 className="bc" style={{ fontSize: isMobile ? "clamp(36px, 10vw, 52px)" : "clamp(36px, 4vw, 56px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 32 }}>
              SELECCIONA<br /><span style={{ color: R }}>TU MÉTODO</span>
            </h2>

            {/* ── OPCIÓN 1: Wompi ─────────────────────────────── */}
            <div style={{ background: "#0a0a0a", border: `1px solid ${R}30`, padding: isMobile ? "24px 18px" : "32px 36px", position: "relative", marginBottom: 8 }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: R }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 4, height: 4, background: R, transform: "rotate(45deg)", flexShrink: 0 }} />
                <span className="bc" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
                  Opción 1 — PSE · Tarjeta · Nequi · Daviplata · Bancolombia
                </span>
              </div>
              <p className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 20, fontWeight: 300, lineHeight: 1.6 }}>
                Checkout seguro de Wompi. Elige el método que prefieras dentro del portal.
              </p>
              <div id="wompi-widget-container" ref={widgetRef} style={{ minHeight: 52 }} />
              <p className="b" style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.15)" }}>
                🔒 Cifrado SSL · Procesado por Wompi · Bancolombia
              </p>
            </div>

            {/* ── OPCIÓN 2: Nequi directo ─────────────────────── */}
            <div style={{ background: "#0a0a0a", border: "1px solid rgba(123,47,190,0.35)", padding: isMobile ? "24px 18px" : "32px 36px", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#7B2FBE" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 4, height: 4, background: "#7B2FBE", transform: "rotate(45deg)", flexShrink: 0 }} />
                <span className="bc" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
                  Opción 2 — Nequi directo · Sin comisión
                </span>
              </div>

              {/* Aviso monto */}
              <div style={{ padding: "12px 16px", border: "1px solid rgba(123,47,190,0.25)", background: "rgba(123,47,190,0.08)", marginBottom: 24, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>💜</span>
                <p className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, fontWeight: 300 }}>
                  Transfiere directamente a Nequi sin comisión. Ingresa el monto manualmente:{" "}
                  <strong style={{ color: "#fff", fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 16 }}>{formatCOP(monto)}</strong>
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, alignItems: "start" }}>

                {/* QR */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <div style={{ padding: 12, background: "#fff", display: "inline-block" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={NEQUI_QR}
                      alt="QR Nequi Coach David"
                      style={{ width: 160, height: 160, display: "block", imageRendering: "pixelated" }}
                      onError={e => {
                        // Si no se ha subido el QR aún, muestra placeholder
                        const target = e.currentTarget
                        target.style.opacity = "0.3"
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Crect width='160' height='160' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='12' fill='%23999'%3EQR próximamente%3C/text%3E%3C/svg%3E"
                      }}
                    />
                  </div>
                  <p className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.5 }}>
                    Escanea con tu app Nequi
                  </p>
                </div>

                {/* Acciones */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                  {/* Número con copiar */}
                  <div>
                    <label className="bc" style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
                      Número Nequi
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ flex: 1, padding: "12px 16px", background: "rgba(123,47,190,0.1)", border: "1px solid rgba(123,47,190,0.25)", display: "flex", alignItems: "center" }}>
                        <span className="bc" style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "0.05em" }}>{NEQUI_PHONE}</span>
                      </div>
                      <button onClick={copiarNumero} style={{ padding: "12px 16px", background: copiado ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${copiado ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`, color: copiado ? "#22c55e" : "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", transition: "all 0.2s ease", whiteSpace: "nowrap" }}>
                        {copiado ? "✓ Copiado" : "Copiar"}
                      </button>
                    </div>
                  </div>

                  {/* Botón abrir Nequi */}
                  <a href={NEQUI_LINK} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "15px 20px", background: "#7B2FBE", color: "#fff", fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 14, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none", transition: "background 0.25s ease" }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#9B4FDE"}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "#7B2FBE"}
                  >
                    💜 Abrir Nequi →
                  </a>

                  <p className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", lineHeight: 1.5, textAlign: "center" }}>
                    Al pagar, envía el comprobante a Coach David por WhatsApp para confirmar tu mensualidad.
                  </p>
                </div>
              </div>
            </div>

            <BackBtn onClick={() => setStep("form")} />
          </div>
        )}

        {/* Sellos */}
        <div style={{ marginTop: 52, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" }}>
          {[{ icon: "🔒", t: "Cifrado SSL" }, { icon: "🏦", t: "Wompi · Bancolombia" }, { icon: "💜", t: "Nequi sin comisión" }].map(item => (
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

/* ── Helpers pequeños ─────────────────────────────────────────── */
function ErrorBox({ msg }: { msg: string }) {
  return (
    <div style={{ padding: "12px 16px", border: `1px solid ${R}40`, background: `${R}0d`, display: "flex", gap: 10, alignItems: "center", marginBottom: 18, animation: "slideIn 0.3s ease" }}>
      <span style={{ color: R, fontWeight: 900, fontSize: 16 }}>!</span>
      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{msg}</span>
    </div>
  )
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "block", margin: "18px auto 0", background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontFamily: "'Barlow', sans-serif", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
      ← Volver
    </button>
  )
}

function ResumenBar({ programa, monto, onCambiar }: { programa: string; monto: number; onCambiar: () => void }) {
  return (
    <div style={{ padding: "16px 20px", border: `1px solid ${R}22`, background: `${R}08`, marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
      <div>
        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>Pagando</div>
        <div style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 18, fontWeight: 800, textTransform: "uppercase" }}>{programa}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 28, fontWeight: 900, color: R }}>{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(monto)}</div>
        <button onClick={onCambiar} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontFamily: "'Barlow', sans-serif", fontSize: 12, cursor: "pointer", textDecoration: "underline", padding: 0, marginTop: 4 }}>Cambiar programa</button>
      </div>
    </div>
  )
}

function SecurityBadges() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20 }}>
      <span style={{ fontSize: 14 }}>🔒</span>
      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 300 }}>Pago seguro · Wompi · Nequi sin comisión</span>
    </div>
  )
}
