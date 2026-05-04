"use client"

import { useState } from "react"

const R = "#E8000D"

const inputBase: React.CSSProperties = {
  width: "100%", padding: "14px 18px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff", fontFamily: "'Barlow', sans-serif",
  fontSize: 15, outline: "none",
  transition: "border-color 0.2s ease",
}

function Field({ label, hint, required = true, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontFamily: "'Barlow Condensed', Impact, sans-serif",
        fontSize: 12, fontWeight: 700, letterSpacing: "0.22em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.45)",
      }}>
        {label}{required && <span style={{ color: R, marginLeft: 4 }}>*</span>}
      </label>
      {hint && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "'Barlow', sans-serif" }}>{hint}</span>}
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input type={type} value={value} placeholder={placeholder || ""}
      onChange={e => onChange(e.target.value)} style={inputBase}
      onFocus={e => (e.target.style.borderColor = R)}
      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
  )
}

function Textarea({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <textarea value={value} placeholder={placeholder || ""}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputBase, resize: "vertical", minHeight: 88 }}
      onFocus={e => (e.target.style.borderColor = R)}
      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
  )
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: string[]
}) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ ...inputBase, appearance: "none", cursor: "pointer" }}
        onFocus={e => (e.target.style.borderColor = R)}
        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}>
        <option value="">Selecciona una opción</option>
        {options.map(o => <option key={o} value={o} style={{ background: "#111" }}>{o}</option>)}
      </select>
      <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: R, pointerEvents: "none", fontSize: 11 }}>▼</div>
    </div>
  )
}

function RadioGroup({ options, value, onChange }: {
  options: string[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)} style={{
          padding: "10px 20px",
          border: `1px solid ${value === opt ? R : "rgba(255,255,255,0.12)"}`,
          background: value === opt ? `${R}18` : "transparent",
          color: value === opt ? "#fff" : "rgba(255,255,255,0.4)",
          fontFamily: "'Barlow Condensed', Impact, sans-serif",
          fontSize: 13, fontWeight: 700, letterSpacing: "0.15em",
          textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s ease",
        }}>{opt}</button>
      ))}
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
      <div style={{ width: 4, height: 4, background: R, transform: "rotate(45deg)", flexShrink: 0 }} />
      <span style={{
        fontFamily: "'Barlow Condensed', Impact, sans-serif",
        fontSize: 11, fontWeight: 700, letterSpacing: "0.4em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.22)",
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
    </div>
  )
}

const INIT = {
  nombre: "", celular: "", eps: "", peso: "", altura: "", edad: "",
  sueno: "", problemasSueno: "", sedentario: "", actividadLigera: "", actividadFisica: "",
  experiencia: "", frecuencia: "", alcohol: "", fumar: "",
  enfermedades: "", patologias: "", restricciones: "",
  comidasDia: "", primeraComida: "", ultimaComida: "",
  proteinas: "", vegetales: "", frutas: "", carbs: "",
  comidaRapida: "", legumbres: "", noGusta: "", restriccionesExtra: "", suplementos: "",
  objetivo: "", motivacion: "", nivelMotivacion: "", comentariosFinales: "",
}
type Form = typeof INIT

const STEPS = [
  { n: 1, label: "Datos básicos" },
  { n: 2, label: "Estilo de vida" },
  { n: 3, label: "Hábitos" },
  { n: 4, label: "Salud" },
  { n: 5, label: "Nutrición" },
  { n: 6, label: "Objetivos" },
]

export default function NutricionCuestionario() {
  const [phase, setPhase] = useState<"intro" | "form" | "success">("intro")
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Form>(INIT)
  const [toast, setToast] = useState<{ type: "success" | "error" | "warning"; msg: string } | null>(null)
  const [animDir, setAnimDir] = useState<"in" | "out">("in")

  const set = (key: keyof Form) => (v: string) => setForm(f => ({ ...f, [key]: v }))

  const showToast = (type: "success" | "error" | "warning", msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 5000)
  }

  const validate = (): boolean => {
    if (step === 1) {
      if (!form.nombre || !form.celular || !form.peso || !form.altura || !form.edad)
        return showToast("warning", "Completa todos los datos básicos antes de continuar."), false
    }
    if (step === 2) {
      if (!form.sueno || !form.sedentario || !form.actividadFisica)
        return showToast("warning", "Completa la información de estilo de vida."), false
    }
    if (step === 3) {
      if (!form.experiencia || !form.frecuencia || !form.alcohol || !form.fumar)
        return showToast("warning", "Completa todos tus hábitos antes de continuar."), false
    }
    if (step === 4) {
      if (!form.enfermedades)
        return showToast("warning", "Completa la información de salud."), false
    }
    if (step === 5) {
      if (!form.comidasDia || !form.primeraComida || !form.proteinas)
        return showToast("warning", "Completa la sección de nutrición."), false
    }
    if (step === 6) {
      if (!form.objetivo || !form.nivelMotivacion)
        return showToast("warning", "Selecciona tu objetivo y nivel de compromiso."), false
    }
    return true
  }

  const goNext = () => {
    if (!validate()) return
    setAnimDir("out")
    setTimeout(() => { setStep(s => s + 1); setAnimDir("in") }, 180)
  }

  const goPrev = () => {
    setAnimDir("out")
    setTimeout(() => { setStep(s => s - 1); setAnimDir("in") }, 180)
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch("/api/nutricion", {
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

  if (phase === "intro") return <IntroScreen onStart={() => setPhase("form")} />
  if (phase === "success") return <SuccessScreen />

  const progress = (step / 6) * 100

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Barlow', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${R}; color: #fff; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
        option { background: #111; color: #fff; }
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.3); }
        @keyframes slideIn  { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideOut { from { opacity:1; transform:translateY(0) } to { opacity:0; transform:translateY(-14px) } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(32px) } to { opacity:1; transform:translateY(0) } }
        .s-in  { animation: slideIn  0.32s cubic-bezier(0.16,1,0.3,1) forwards; }
        .s-out { animation: slideOut 0.18s ease forwards; }
      `}</style>

      {/* Header fijo */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ height: 3, background: "rgba(255,255,255,0.05)" }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            background: `linear-gradient(to right, ${R}80, ${R})`,
            transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)",
          }} />
        </div>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "13px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 6, height: 6, background: R, borderRadius: "50%" }} />
            <span style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
              Coach David · Nutrición
            </span>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {STEPS.map(s => (
              <div key={s.n} style={{
                height: 6, width: s.n === step ? 24 : 6,
                background: s.n < step ? R : s.n === step ? "#fff" : "rgba(255,255,255,0.1)",
                borderRadius: 3, transition: "all 0.3s ease",
              }} />
            ))}
          </div>
          <span style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 13, fontWeight: 700, color: R, letterSpacing: "0.2em" }}>
            {step} / 6
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "96px 32px 80px" }}>
        <div className={animDir === "in" ? "s-in" : "s-out"}>

          {/* Cabecera del step */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 28, height: 2, background: R }} />
              <span style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: R }}>
                Paso {step} de 6
              </span>
            </div>
            <h2 style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: "clamp(36px, 5vw, 58px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 0.92 }}>
              {STEPS[step - 1].label.toUpperCase()}
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {step === 1 && <Step1 form={form} set={set} />}
            {step === 2 && <Step2 form={form} set={set} />}
            {step === 3 && <Step3 form={form} set={set} />}
            {step === 4 && <Step4 form={form} set={set} />}
            {step === 5 && <Step5 form={form} set={set} />}
            {step === 6 && <Step6 form={form} set={set} />}
          </div>

          {/* Toast */}
          {toast && (
            <div style={{
              marginTop: 28, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start",
              border: `1px solid ${toast.type === "success" ? "#22c55e50" : toast.type === "error" ? `${R}50` : "#eab30850"}`,
              background: toast.type === "success" ? "#22c55e0d" : toast.type === "error" ? `${R}0d` : "#eab3080d",
              animation: "fadeUp 0.3s ease",
            }}>
              <span style={{ fontWeight: 900, fontSize: 17, lineHeight: 1, marginTop: 1, color: toast.type === "success" ? "#22c55e" : toast.type === "error" ? R : "#eab308" }}>
                {toast.type === "success" ? "✓" : "!"}
              </span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{toast.msg}</span>
            </div>
          )}

          {/* Navegación */}
          <div style={{ display: "flex", gap: 10, marginTop: 44 }}>
            {step > 1 && (
              <button onClick={goPrev} style={{
                flex: 1, padding: "17px", border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent", color: "rgba(255,255,255,0.45)",
                fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 14, fontWeight: 800,
                letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.target as HTMLButtonElement).style.color = "#fff" }}
                onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.target as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)" }}
              >← Atrás</button>
            )}
            {step < 6 ? (
              <button onClick={goNext} style={{
                flex: 2, padding: "17px", background: R, color: "#fff", border: "none",
                fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 15, fontWeight: 900,
                letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer",
                clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))",
                transition: "background 0.2s ease",
              }}
                onMouseEnter={e => (e.target as HTMLButtonElement).style.background = "#fff"}
                onMouseLeave={e => (e.target as HTMLButtonElement).style.background = R}
              >Siguiente →</button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={{
                flex: 2, padding: "17px", background: loading ? `${R}80` : R,
                color: "#fff", border: "none",
                fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 15, fontWeight: 900,
                letterSpacing: "0.22em", textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))",
                boxShadow: loading ? "none" : `0 0 40px ${R}35`,
                transition: "all 0.2s ease",
              }}>{loading ? "Enviando..." : "Finalizar y enviar ✓"}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Barlow', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::selection { background: ${R}; color:#fff; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)} }
        @keyframes marquee { from{transform:translateX(0)}to{transform:translateX(-50%)} }
        .f1{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both}
        .f2{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both}
        .f3{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s both}
        .f4{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.55s both}
        .f5{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.7s both}
      `}</style>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 20% 60%, ${R}0a 0%, transparent 55%)` }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: R }} />

      <div style={{ position: "relative", maxWidth: 860, margin: "0 auto", padding: "80px 48px 120px" }}>
        <div className="f1" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{ width: 40, height: 2, background: R }} />
          <span style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: R }}>
            Valoración inicial · Plan de alimentación
          </span>
        </div>

        <h1 className="f2" style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: "clamp(62px, 9vw, 116px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.87, letterSpacing: "-0.02em", marginBottom: 36 }}>
          CUESTIONARIO<br />
          <span style={{ color: R, textShadow: `0 0 60px ${R}40` }}>DE NUTRICIÓN</span>
        </h1>

        <div className="f3" style={{ maxWidth: 600, marginBottom: 40 }}>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, fontWeight: 300, marginBottom: 16 }}>
            Este formulario recopila la información necesaria para diseñar tu plan de alimentación personalizado. Nos permite entender tus hábitos, preferencias y objetivos para crear una estrategia que realmente funcione.
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.28)", lineHeight: 1.6, fontWeight: 300 }}>
            No te tomará más de <strong style={{ color: "rgba(255,255,255,0.55)" }}>10 minutos</strong>. Toda la información será tratada de forma confidencial.
          </p>
        </div>

        <div className="f3" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 40 }}>
          {["Datos básicos", "Estilo de vida", "Hábitos", "Salud", "Nutrición", "Objetivos"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: "1px solid rgba(255,255,255,0.07)", fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
              <span style={{ color: R, fontWeight: 900 }}>{String(i + 1).padStart(2, "0")}</span>{s}
            </div>
          ))}
        </div>

        <div className="f4" style={{ padding: "20px 24px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)", marginBottom: 44 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", lineHeight: 1.7, fontWeight: 300 }}>
            Al continuar, <strong style={{ color: "rgba(255,255,255,0.45)" }}>autorizo a Coach David</strong> para hacer uso de mi información para el diseño y seguimiento de un plan de alimentación personalizado. La información compartida es confidencial y no será usada para ningún otro fin.
          </p>
        </div>

        <div className="f5">
          <button onClick={onStart} style={{ padding: "20px 60px", background: R, color: "#fff", border: "none", fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 16, fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase", cursor: "pointer", clipPath: "polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px))", boxShadow: `0 20px 50px ${R}40`, transition: "all 0.25s ease" }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = "#fff"; (e.target as HTMLButtonElement).style.color = "#000" }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = R; (e.target as HTMLButtonElement).style.color = "#fff" }}>
            Comenzar cuestionario →
          </button>
          <p style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.18)", fontFamily: "'Barlow', sans-serif" }}>
            Acepto el uso de mis datos para los fines mencionados.
          </p>
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", padding: "12px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", animation: "marquee 20s linear infinite", width: "max-content" }}>
          {Array(8).fill(null).map((_, i) => (
            <span key={i} style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.12)", paddingRight: 80, whiteSpace: "nowrap" }}>
              Plan de alimentación · Personalizado · Basado en ciencia · Resultados reales ·&nbsp;
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function SuccessScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: 48 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=Barlow:wght@300&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseR{0%,100%{box-shadow:0 0 0 0 ${R}50}50%{box-shadow:0 0 0 10px transparent}}
        .su1{animation:fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both}
        .su2{animation:fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.25s both}
        .su3{animation:fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s both}
      `}</style>
      <div className="su1" style={{ width: 72, height: 72, border: `2px solid ${R}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 36, animation: "pulseR 2s ease infinite, fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
        <span style={{ fontSize: 30, color: R }}>✓</span>
      </div>
      <h2 className="su2" style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: "clamp(44px, 6vw, 72px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 20 }}>
        CUESTIONARIO<br /><span style={{ color: R }}>ENVIADO</span>
      </h2>
      <p className="su3" style={{ fontFamily: "'Barlow', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.4)", maxWidth: 420, lineHeight: 1.75, fontWeight: 300 }}>
        Recibí tus respuestas correctamente. Me pondré en contacto contigo pronto para comenzar a diseñar tu plan de alimentación personalizado.
      </p>
      <div className="su3" style={{ marginTop: 40, padding: "14px 22px", border: "1px solid rgba(255,255,255,0.07)", display: "inline-flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 7, height: 7, background: R, borderRadius: "50%" }} />
        <span style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: "0.28em", textTransform: "uppercase", fontWeight: 700 }}>
          No todos completan este proceso. Tú ya diste el primer paso.
        </span>
      </div>
    </div>
  )
}

function Step1({ form, set }: { form: Form; set: (k: keyof Form) => (v: string) => void }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="Nombre completo"><Input value={form.nombre} onChange={set("nombre")} placeholder="Tu nombre" /></Field>
        <Field label="Celular"><Input value={form.celular} onChange={set("celular")} placeholder="+57 300..." /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        <Field label="Edad"><Input value={form.edad} onChange={set("edad")} placeholder="25" /></Field>
        <Field label="Peso (kg)"><Input value={form.peso} onChange={set("peso")} placeholder="70" /></Field>
        <Field label="Altura (cm)"><Input value={form.altura} onChange={set("altura")} placeholder="175" /></Field>
      </div>
      <Field label="EPS"><Input value={form.eps} onChange={set("eps")} placeholder="Sura, Colsanitas..." /></Field>
    </>
  )
}

function Step2({ form, set }: { form: Form; set: (k: keyof Form) => (v: string) => void }) {
  return (
    <>
      <SectionDivider label="Sueño" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="Horas de sueño al día">
          <Select value={form.sueno} onChange={set("sueno")} options={["Menos de 5h", "5 - 6h", "6 - 7h", "7 - 8h", "Más de 8h"]} />
        </Field>
        <Field label="¿Problemas para conciliar el sueño?">
          <RadioGroup options={["Sí", "No"]} value={form.problemasSueno} onChange={set("problemasSueno")} />
        </Field>
      </div>
      <SectionDivider label="Actividad diaria" />
      <Field label="Horas sentado/a al día">
        <Select value={form.sedentario} onChange={set("sedentario")} options={["Menos de 2h", "2 - 4h", "4 - 6h", "6 - 8h", "Más de 8h"]} />
      </Field>
      <Field label="Horas en movimiento ligero" hint="Caminando, haciendo aseo — diferente al entrenamiento">
        <Select value={form.actividadLigera} onChange={set("actividadLigera")} options={["Menos de 1h", "1 - 2h", "2 - 4h", "Más de 4h"]} />
      </Field>
      <Field label="Horas de actividad física intensa" hint="Entrenamiento, deporte, cardio">
        <Select value={form.actividadFisica} onChange={set("actividadFisica")} options={["Ninguna", "Menos de 1h", "1 - 2h", "Más de 2h"]} />
      </Field>
    </>
  )
}

function Step3({ form, set }: { form: Form; set: (k: keyof Form) => (v: string) => void }) {
  return (
    <>
      <SectionDivider label="Entrenamiento" />
      <Field label="¿Hace cuánto entrenas?">
        <Select value={form.experiencia} onChange={set("experiencia")} options={["No entreno", "Menos de 6 meses", "6 meses - 1 año", "1 - 3 años", "Más de 3 años"]} />
      </Field>
      <Field label="¿Entrenas 3 o más veces por semana?">
        <RadioGroup options={["Sí", "No"]} value={form.frecuencia} onChange={set("frecuencia")} />
      </Field>
      <SectionDivider label="Sustancias" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="¿Consumes alcohol?">
          <Select value={form.alcohol} onChange={set("alcohol")} options={["Nunca", "1 vez al mes", "1 vez por semana", "Más de una vez por semana"]} />
        </Field>
        <Field label="¿Fumas?">
          <Select value={form.fumar} onChange={set("fumar")} options={["Nunca", "Ocasional", "Frecuente"]} />
        </Field>
      </div>
    </>
  )
}

function Step4({ form, set }: { form: Form; set: (k: keyof Form) => (v: string) => void }) {
  return (
    <>
      <Field label="¿Tienes enfermedades cardiovasculares?" hint="Escribe Sí o No y especifica si aplica">
        <Input value={form.enfermedades} onChange={set("enfermedades")} placeholder="NA si no aplica" />
      </Field>
      <Field label="Patologías o condiciones médicas" required={false}>
        <Textarea value={form.patologias} onChange={set("patologias")} placeholder="Diabetes, hipertensión... NA si no aplica" />
      </Field>
      <Field label="Restricciones alimentarias o alergias" required={false}>
        <Textarea value={form.restricciones} onChange={set("restricciones")} placeholder="Intolerancia a la lactosa, gluten... NA si no aplica" />
      </Field>
    </>
  )
}

function Step5({ form, set }: { form: Form; set: (k: keyof Form) => (v: string) => void }) {
  return (
    <>
      <SectionDivider label="Hábitos alimenticios" />
      <Field label="¿Cuántas comidas haces al día?">
        <RadioGroup options={["1", "2", "3", "4", "5", "6", "+6"]} value={form.comidasDia} onChange={set("comidasDia")} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="Primera comida del día">
          <input type="time" value={form.primeraComida} onChange={e => set("primeraComida")(e.target.value)}
            style={inputBase} onFocus={e => (e.target.style.borderColor = R)} onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
        </Field>
        <Field label="Última comida del día">
          <input type="time" value={form.ultimaComida} onChange={e => set("ultimaComida")(e.target.value)}
            style={inputBase} onFocus={e => (e.target.style.borderColor = R)} onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
        </Field>
      </div>
      <SectionDivider label="Preferencias" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="5 proteínas favoritas"><Textarea value={form.proteinas} onChange={set("proteinas")} placeholder="Pollo, huevo, atún, carne..." /></Field>
        <Field label="5 vegetales favoritos"><Textarea value={form.vegetales} onChange={set("vegetales")} placeholder="Brócoli, zanahoria, espinaca..." /></Field>
        <Field label="10 frutas favoritas"><Textarea value={form.frutas} onChange={set("frutas")} placeholder="Banano, mango, naranja..." /></Field>
        <Field label="Carbohidratos favoritos"><Textarea value={form.carbs} onChange={set("carbs")} placeholder="Arroz, papa, avena, pasta..." /></Field>
        <Field label="Comida rápida favorita" required={false}><Textarea value={form.comidaRapida} onChange={set("comidaRapida")} placeholder="Pizza, hamburguesa..." /></Field>
        <Field label="Legumbres favoritas" required={false}><Textarea value={form.legumbres} onChange={set("legumbres")} placeholder="Lentejas, garbanzos, fríjoles..." /></Field>
      </div>
      <SectionDivider label="Restricciones" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="Comidas que NO te gustan"><Textarea value={form.noGusta} onChange={set("noGusta")} placeholder="Lista todas..." /></Field>
        <Field label="Comidas que no puedes comer" hint="Por alergias, salud u otros motivos"><Textarea value={form.restriccionesExtra} onChange={set("restriccionesExtra")} placeholder="NA si no aplica" /></Field>
      </div>
      <Field label="Suplementación actual" required={false}>
        <Textarea value={form.suplementos} onChange={set("suplementos")} placeholder="Proteína, creatina, vitaminas... NA si no aplica" />
      </Field>
    </>
  )
}

function Step6({ form, set }: { form: Form; set: (k: keyof Form) => (v: string) => void }) {
  return (
    <>
      <Field label="¿Cuál es tu objetivo con el plan de alimentación?">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["Ganar masa muscular", "Perder grasa corporal", "Recomposición corporal", "Mejorar hábitos alimenticios", "Otro"].map(opt => (
            <button key={opt} type="button" onClick={() => set("objetivo")(opt)} style={{
              padding: "14px 20px", textAlign: "left",
              border: `1px solid ${form.objetivo === opt ? R : "rgba(255,255,255,0.08)"}`,
              background: form.objetivo === opt ? `${R}10` : "rgba(255,255,255,0.01)",
              color: form.objetivo === opt ? "#fff" : "rgba(255,255,255,0.4)",
              fontFamily: "'Barlow', sans-serif", fontSize: 15, cursor: "pointer",
              transition: "all 0.2s ease", display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{ width: 8, height: 8, flexShrink: 0, border: `2px solid ${form.objetivo === opt ? R : "rgba(255,255,255,0.2)"}`, background: form.objetivo === opt ? R : "transparent", transition: "all 0.2s ease" }} />
              {opt}
            </button>
          ))}
        </div>
      </Field>
      <Field label="¿Por qué quieres lograrlo?" hint="Sé específico — esto es clave para el diseño de tu plan">
        <Textarea value={form.motivacion} onChange={set("motivacion")} placeholder="Tu motivación real..." />
      </Field>
      <Field label="¿Qué tan comprometido/a estás?">
        <div style={{ display: "flex", gap: 8 }}>
          {[{ v: "1-2", label: "Poco" }, { v: "3-5", label: "Regular" }, { v: "6-8", label: "Alto" }, { v: "9-10", label: "Total" }].map(({ v, label }) => (
            <button key={v} type="button" onClick={() => set("nivelMotivacion")(v)} style={{
              flex: 1, padding: "16px 8px",
              border: `1px solid ${form.nivelMotivacion === v ? R : "rgba(255,255,255,0.08)"}`,
              background: form.nivelMotivacion === v ? `${R}15` : "transparent",
              color: form.nivelMotivacion === v ? "#fff" : "rgba(255,255,255,0.3)",
              fontFamily: "'Barlow Condensed', Impact, sans-serif",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s ease",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: form.nivelMotivacion === v ? R : "rgba(255,255,255,0.2)" }}>{v}</span>
              {label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Comentarios finales" hint="Algo importante que deba saber. NA si no aplica" required={false}>
        <Textarea value={form.comentariosFinales} onChange={set("comentariosFinales")} placeholder="NA si no aplica" />
      </Field>
      <div style={{ padding: "16px 20px", border: `1px solid ${R}20`, background: `${R}08`, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ color: R, fontSize: 16, lineHeight: 1, marginTop: 2 }}>◆</span>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
          Este es el punto donde decides si realmente quieres cambiar. No todos llegan hasta aquí — tú ya diste el primer paso.
        </p>
      </div>
    </>
  )
}
