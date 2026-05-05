"use client"

import { useState, useEffect } from "react"

const R = "#E8000D"

const inputBase: React.CSSProperties = {
  width: "100%", padding: "14px 18px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff", fontFamily: "'Barlow', sans-serif",
  fontSize: 15, outline: "none",
  transition: "border-color 0.2s ease",
}

/* ── Hora del día para el saludo ──────────────────────────────── */
function getSaludo() {
  const h = new Date().getHours()
  if (h < 12) return "Buenos días"
  if (h < 19) return "Buenas tardes"
  return "Buenas noches"
}

/* ── Formato de fecha legible ─────────────────────────────────── */
function formatFecha(iso: string) {
  if (!iso) return ""
  const [y, m, d] = iso.split("-")
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
  return `${d} ${meses[parseInt(m) - 1]} ${y}`
}

/* ══ COMPONENTE PRINCIPAL ═════════════════════════════════════════ */
export default function DiarioComidas() {
  const hoy = new Date().toISOString().split("T")[0]
  const [heroIn, setHeroIn] = useState(false)
  const [phase, setPhase] = useState<"form" | "success">("form")
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: "error" | "warning"; msg: string } | null>(null)
  const [activeField, setActiveField] = useState<string | null>(null)

  const [form, setForm] = useState({
    nombre: "", fecha: hoy,
    comida1: "", comida2: "", comida3: "", comida4: "", comida5: "",
  })

  useEffect(() => { setTimeout(() => setHeroIn(true), 80) }, [])

  const showToast = (type: "error" | "warning", msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 5000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim()) return showToast("warning", "Ingresa tu nombre antes de continuar.")
    const vacias = [1,2,3,4,5].filter(n => !form[`comida${n}` as keyof typeof form].trim())
    if (vacias.length > 0) return showToast("warning", `Completa la comida ${vacias[0]} antes de enviar.`)

    setLoading(true)
    try {
      const res = await fetch("/api/diario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setPhase("success")
      } else {
        showToast("error", `Error del servidor (${res.status}). Intenta de nuevo en unos minutos.`)
      }
    } catch {
      showToast("error", "Sin conexión. Verifica tu internet e intenta de nuevo.")
    }
    setLoading(false)
  }

  if (phase === "success") return <SuccessScreen nombre={form.nombre} fecha={form.fecha} />

  const comidas = [
    { n: 1, label: "Primera comida", hint: "Desayuno o primer tiempo de comida del día" },
    { n: 2, label: "Segunda comida", hint: "Media mañana o almuerzo temprano" },
    { n: 3, label: "Tercera comida", hint: "Almuerzo principal" },
    { n: 4, label: "Cuarta comida", hint: "Merienda o post-entrenamiento" },
    { n: 5, label: "Quinta comida", hint: "Cena o última comida del día" },
  ]

  const filled = [1,2,3,4,5].filter(n => form[`comida${n}` as keyof typeof form].trim()).length
  const progress = ((filled + (form.nombre ? 1 : 0)) / 6) * 100

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Barlow', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${R}; color: #fff; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.18); }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.3); cursor: pointer; }
        option { background: #111; color: #fff; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulseR  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .bc { font-family: 'Barlow Condensed', Impact, sans-serif; }
        .b  { font-family: 'Barlow', sans-serif; }
        textarea { resize: vertical; }
      `}</style>

      {/* Grilla de fondo */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      {/* Resplandor rojo superior */}
      <div style={{ position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: `${R}0a`, borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />

      {/* ── Header fijo ─────────────────────────────────────── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        {/* Barra de progreso */}
        <div style={{ height: 2, background: "rgba(255,255,255,0.04)" }}>
          <div style={{
            height: "100%", background: `linear-gradient(to right, ${R}80, ${R})`,
            width: `${progress}%`, transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)",
          }} />
        </div>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 6, height: 6, background: R, borderRadius: "50%" }} />
            <span className="bc" style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
              Coach David · Diario de comidas
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="bc" style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              {filled}/5 comidas
            </span>
            <div style={{ width: 32, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(filled / 5) * 100}%`, background: R, transition: "width 0.3s ease" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenido ───────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "88px 32px 80px" }}>

        {/* Header de la página */}
        <div style={{
          marginBottom: 56,
          opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(32px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 2, background: R }} />
            <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>
              {getSaludo()} · {formatFecha(hoy)}
            </span>
          </div>

          <h1 className="bc" style={{ fontSize: "clamp(44px, 6vw, 80px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em", marginBottom: 20 }}>
            DIARIO DE<br /><span style={{ color: R, textShadow: `0 0 40px ${R}40` }}>COMIDAS</span>
          </h1>

          <p className="b" style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontWeight: 300, maxWidth: 480 }}>
            Registra cada tiempo de comida con el mayor detalle posible —
            cantidades, preparaciones y porciones. Esto permite ajustar tu plan con precisión.
          </p>
        </div>

        {/* Tip del día */}
        <div style={{
          padding: "16px 20px", border: `1px solid ${R}25`, background: `${R}06`,
          display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 48,
          opacity: heroIn ? 1 : 0, transition: "all 0.8s ease 0.35s",
          animation: heroIn ? "none" : "none",
        }}>
          <span style={{ color: R, fontSize: 16, flexShrink: 0, marginTop: 2 }}>◆</span>
          <p className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, fontWeight: 300 }}>
            <strong style={{ color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>Tip:</strong> Sé específico con las cantidades.
            En lugar de "pollo con arroz", escribe "150g pechuga a la plancha + 100g arroz blanco cocido + ensalada de tomate".
            Mientras más detalle, mejor el ajuste.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 32 }}>

          {/* Datos personales */}
          <div style={{
            opacity: heroIn ? 1 : 0, transform: heroIn ? "none" : "translateY(20px)",
            transition: "all 0.7s ease 0.25s",
          }}>
            <SectionDivider label="Datos" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>

              {/* Nombre */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="bc" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                  Nombre <span style={{ color: R }}>*</span>
                </label>
                <input
                  type="text" name="nombre" value={form.nombre} onChange={handleChange}
                  placeholder="Tu nombre completo" required
                  style={{ ...inputBase, borderColor: activeField === "nombre" ? R : "rgba(255,255,255,0.1)" }}
                  onFocus={() => setActiveField("nombre")}
                  onBlur={() => setActiveField(null)}
                />
              </div>

              {/* Fecha */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="bc" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                  Fecha <span style={{ color: R }}>*</span>
                </label>
                <input
                  type="date" name="fecha" value={form.fecha} onChange={handleChange} required
                  style={{ ...inputBase, borderColor: activeField === "fecha" ? R : "rgba(255,255,255,0.1)" }}
                  onFocus={() => setActiveField("fecha")}
                  onBlur={() => setActiveField(null)}
                />
              </div>
            </div>
          </div>

          {/* Comidas */}
          <div>
            <SectionDivider label="Registro de comidas" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
              {comidas.map(({ n, label, hint }, i) => {
                const key = `comida${n}`
                const val = form[key as keyof typeof form]
                const isFilled = val.trim().length > 0
                const isActive = activeField === key
                return (
                  <div key={n} style={{
                    opacity: heroIn ? 1 : 0,
                    transform: heroIn ? "none" : "translateY(20px)",
                    transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.07}s`,
                  }}>
                    <div style={{
                      border: `1px solid ${isActive ? R : isFilled ? `${R}30` : "rgba(255,255,255,0.07)"}`,
                      background: isActive ? `${R}06` : isFilled ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.015)",
                      transition: "all 0.25s ease", overflow: "hidden",
                    }}>
                      {/* Header de la comida */}
                      <div style={{
                        padding: "14px 18px",
                        borderBottom: `1px solid ${isActive ? `${R}30` : isFilled ? `${R}15` : "rgba(255,255,255,0.05)"}`,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: isActive ? `${R}08` : "transparent",
                        transition: "all 0.25s ease",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span className="bc" style={{ fontSize: 11, color: isActive || isFilled ? R : "rgba(255,255,255,0.2)", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", transition: "color 0.25s ease" }}>
                            0{n}
                          </span>
                          <span className="bc" style={{ fontSize: 16, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: isActive ? "#fff" : isFilled ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)", transition: "color 0.25s ease" }}>
                            {label}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {isFilled && !isActive && (
                            <span style={{ fontSize: 11, color: R, fontFamily: "'Barlow Condensed', Impact, sans-serif", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                              ✓ Registrado
                            </span>
                          )}
                          <span className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 300 }}>{hint}</span>
                        </div>
                      </div>

                      {/* Textarea */}
                      <textarea
                        name={key} value={val} onChange={handleChange}
                        placeholder={`Ej: 150g pechuga a la plancha + 100g arroz + ensalada verde con aceite de oliva...`}
                        required
                        style={{
                          ...inputBase, border: "none", minHeight: 96,
                          background: "transparent", display: "block",
                          borderRadius: 0,
                        }}
                        onFocus={() => setActiveField(key)}
                        onBlur={() => setActiveField(null)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Toast */}
          {toast && (
            <div style={{
              padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start",
              border: `1px solid ${toast.type === "error" ? `${R}50` : "#eab30850"}`,
              background: toast.type === "error" ? `${R}0d` : "#eab3080d",
              animation: "slideIn 0.3s ease",
            }}>
              <span style={{ fontWeight: 900, fontSize: 17, lineHeight: 1, marginTop: 1, color: toast.type === "error" ? R : "#eab308" }}>!</span>
              <span className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{toast.msg}</span>
            </div>
          )}

          {/* Resumen antes de enviar */}
          {filled === 5 && form.nombre && (
            <div style={{
              padding: "20px 24px", border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)", animation: "slideIn 0.4s ease",
            }}>
              <div className="bc" style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 12 }}>
                Resumen del diario
              </div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <div>
                  <div className="bc" style={{ fontSize: 28, fontWeight: 900, color: R }}>5</div>
                  <div className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Comidas registradas</div>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />
                <div>
                  <div className="bc" style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{formatFecha(form.fecha)}</div>
                  <div className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Fecha registrada</div>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />
                <div>
                  <div className="bc" style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{form.nombre.split(" ")[0]}</div>
                  <div className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Registrado por</div>
                </div>
              </div>
            </div>
          )}

          {/* Botón submit */}
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "20px",
            background: loading ? `${R}60` : R,
            color: "#fff", border: "none",
            fontFamily: "'Barlow Condensed', Impact, sans-serif",
            fontSize: 16, fontWeight: 900, letterSpacing: "0.25em",
            textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer",
            clipPath: "polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))",
            boxShadow: loading ? "none" : `0 0 40px ${R}35`,
            transition: "all 0.25s ease",
            opacity: heroIn ? 1 : 0,
          }}
            onMouseEnter={e => { if (!loading) (e.target as HTMLButtonElement).style.background = "#fff"; if (!loading) (e.target as HTMLButtonElement).style.color = "#000" }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = loading ? `${R}60` : R; (e.target as HTMLButtonElement).style.color = "#fff" }}
          >
            {loading ? "Enviando diario..." : "Registrar diario ✓"}
          </button>

          <p className="b" style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.18)", letterSpacing: "0.05em" }}>
            Tu diario llega directamente a Coach David para el seguimiento de tu plan.
          </p>
        </form>
      </div>

      {/* Marquee inferior */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", padding: "10px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", animation: "marquee 24s linear infinite", width: "max-content" }}>
          {Array(8).fill(null).map((_, i) => (
            <span key={i} className="bc" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.1)", paddingRight: 80, whiteSpace: "nowrap" }}>
              Plan de alimentación · Coach David · Seguimiento constante · Resultados reales ·&nbsp;
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Divisor de sección ───────────────────────────────────────── */
function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 4, height: 4, background: R, transform: "rotate(45deg)", flexShrink: 0 }} />
      <span style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
    </div>
  )
}

/* ══ SUCCESS SCREEN ═══════════════════════════════════════════════ */
function SuccessScreen({ nombre, fecha }: { nombre: string; fecha: string }) {
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"]
  const [y, m, d] = fecha.split("-")
  const fechaLegible = `${d} de ${meses[parseInt(m) - 1]} de ${y}`

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Barlow', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: "48px 32px", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=Barlow:wght@300;400&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseR { 0%,100%{box-shadow:0 0 0 0 rgba(232,0,13,0.5)} 50%{box-shadow:0 0 0 12px transparent} }
        .s1{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both}
        .s2{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both}
        .s3{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s both}
        .s4{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.55s both}
      `}</style>

      {/* Resplandor */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, ${R}0d 0%, transparent 60%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: R }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${R}40, transparent)` }} />

      {/* Círculo de éxito */}
      <div className="s1" style={{ width: 80, height: 80, border: `2px solid ${R}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40, animation: "pulseR 2s ease infinite, fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
        <span style={{ fontSize: 32, color: R }}>✓</span>
      </div>

      {/* Título */}
      <h2 className="s2" style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 20 }}>
        DIARIO<br /><span style={{ color: R }}>ENVIADO</span>
      </h2>

      {/* Descripción */}
      <p className="s3" style={{ fontFamily: "'Barlow', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.45)", maxWidth: 440, lineHeight: 1.75, fontWeight: 300, marginBottom: 40 }}>
        Recibí tu registro del <strong style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{fechaLegible}</strong>, {nombre.split(" ")[0]}.
        Lo revisaré para hacer los ajustes necesarios en tu plan.
      </p>

      {/* Resumen mini */}
      <div className="s3" style={{ display: "flex", gap: 2, marginBottom: 48, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { n: "5", label: "Comidas registradas" },
          { n: "✓", label: "Enviado correctamente" },
          { n: "1", label: "Plan activo" },
        ].map((s, i) => (
          <div key={i} style={{ padding: "20px 28px", background: i === 1 ? `${R}10` : "rgba(255,255,255,0.02)", border: `1px solid ${i === 1 ? `${R}30` : "rgba(255,255,255,0.07)"}` }}>
            <div style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 32, fontWeight: 900, color: i === 1 ? R : "#fff", lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.15em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="s4" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <a href="/diario-comidas" style={{
          fontFamily: "'Barlow Condensed', Impact, sans-serif",
          display: "inline-flex", alignItems: "center", gap: 10,
          background: R, color: "#fff", padding: "16px 40px",
          fontSize: 14, fontWeight: 900, letterSpacing: "0.22em",
          textTransform: "uppercase", textDecoration: "none",
          clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))",
          transition: "all 0.25s ease",
        }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "#fff"; el.style.color = "#000" }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = R; el.style.color = "#fff" }}
        >
          Registrar otro día →
        </a>
      </div>

      <div className="s4" style={{ marginTop: 32, padding: "14px 22px", border: "1px solid rgba(255,255,255,0.06)", display: "inline-flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 7, height: 7, background: R, borderRadius: "50%", animation: "pulseR 2s ease infinite" }} />
        <span style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.28em", textTransform: "uppercase", fontWeight: 700 }}>
          La consistencia es lo que genera resultados.
        </span>
      </div>
    </div>
  )
}
