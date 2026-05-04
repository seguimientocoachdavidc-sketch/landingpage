"use client"

import { useState, useEffect } from "react"

/* ── Constantes de color ──────────────────────────────────────── */
const R = "#E8000D"

/* ── Tipos ────────────────────────────────────────────────────── */
type ToastType = "success" | "error" | "warning"
interface Toast { type: ToastType; msg: string }

/* ── Utilidades de estilo ─────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "14px 18px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 0, color: "#fff",
  fontFamily: "'Barlow', sans-serif", fontSize: 15,
  outline: "none", transition: "border-color 0.2s ease",
}
const selectStyle: React.CSSProperties = { ...inputStyle, appearance: "none", cursor: "pointer" }
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: "vertical", minHeight: 90 }

const labelStyle: React.CSSProperties = {
  display: "block", marginBottom: 8,
  fontFamily: "'Barlow Condensed', Impact, sans-serif",
  fontSize: 13, fontWeight: 700, letterSpacing: "0.2em",
  textTransform: "uppercase", color: "rgba(255,255,255,0.5)",
}
const requiredDot = <span style={{ color: R, marginLeft: 4 }}>*</span>

/* ── Componentes UI ───────────────────────────────────────────── */
function Field({ label, required = true, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={labelStyle}>{label}{required && requiredDot}</label>
      {children}
    </div>
  )
}

function RadioGroup({ name, options, value, onChange }: { name: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          style={{
            padding: "10px 20px", border: `1px solid ${value === opt ? R : "rgba(255,255,255,0.12)"}`,
            background: value === opt ? `${R}18` : "transparent",
            color: value === opt ? "#fff" : "rgba(255,255,255,0.45)",
            fontFamily: "'Barlow Condensed', Impact, sans-serif",
            fontSize: 13, fontWeight: 700, letterSpacing: "0.15em",
            textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s ease",
          }}
        >{opt}</button>
      ))}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} placeholder={placeholder || ""}
      onChange={e => onChange(e.target.value)}
      style={inputStyle}
      onFocus={e => (e.target.style.borderColor = R)}
      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
    />
  )
}

function Textarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea value={value} placeholder={placeholder || ""}
      onChange={e => onChange(e.target.value)}
      style={textareaStyle}
      onFocus={e => (e.target.style.borderColor = R)}
      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
    />
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={selectStyle}
        onFocus={e => (e.target.style.borderColor = R)}
        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
      >
        <option value="">Selecciona una opción</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: R, pointerEvents: "none", fontSize: 12 }}>▼</div>
    </div>
  )
}

/* ── Estado inicial del formulario ────────────────────────────── */
const initialForm = {
  // STEP 1 - Datos personales
  nombre: "", celular: "", email: "", edad: "", peso: "", estatura: "", eps: "", ocupacion: "",
  // STEP 2 - Estilo de vida
  horasSueno: "", problemasSueno: "", horasSentado: "", horasMovimiento: "", horasIntensas: "",
  // STEP 3 - Salud
  cirugia: "", molestiaOsteomuscular: "", detalleMolestia: "",
  antecedentesDeportivos: "", detallDeportivos: "",
  antecedentesFamiliares: "", detalleFamiliares: "",
  antecedentesMetabolicos: "",
  alcohol: "", fumar: "", otrasSustancias: "", medicamentos: "",
  molestiasPecho: "",
  // STEP 4 - Nutrición
  comidasDia: "", primeraComida: "", ultimaComida: "",
  alergiasComida: "", detalleAlergias: "",
  proteinas: "", carbohidratos: "", frutas: "", vegetales: "", legumbres: "",
  comidasNoGustan: "", comidasNoPuede: "", suplementacion: "",
  // STEP 5 - Entrenamiento
  espacioEntrenamiento: "", equiposCasa: "",
  actividadFisica: "", tiempoEntrenando: "", consistencia: "",
  frecuenciaEjercicio: "", duracionSesion: "",
  ejerciciosPectoral: "", ejerciciosEspalda: "", ejerciciosBrazo: "",
  ejerciciosDeltoides: "", ejerciciosIsquios: "", ejerciciosCuadriceps: "",
  ejerciciosGluteo: "", ejerciciosMolestan: "", ejerciciosNoGustan: "",
  bandasResistencia: "", cardio: "", dispositivoFC: "",
  // STEP 6 - Objetivos
  objetivo: "", otraObjetivo: "", motivacion: "", nivelMotivacion: "",
  disponibilidadHorario: "", expectativas: "", comentariosAdicionales: "",
}

type FormState = typeof initialForm

/* ── Secciones del formulario ─────────────────────────────────── */
const STEPS = [
  { n: 1, label: "Datos personales", icon: "◈" },
  { n: 2, label: "Estilo de vida",   icon: "◉" },
  { n: 3, label: "Salud",            icon: "◎" },
  { n: 4, label: "Nutrición",        icon: "◆" },
  { n: 5, label: "Entrenamiento",    icon: "◐" },
  { n: 6, label: "Objetivos",        icon: "◑" },
]

/* ═══════════════════════════════════════════════════════════════ */
export default function CuestionarioEntrenamiento() {
  const [step, setStep] = useState(0) // 0 = intro
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [animDir, setAnimDir] = useState<"in" | "out">("in")

  const set = (key: keyof FormState) => (v: string) => setForm(f => ({ ...f, [key]: v }))

  const showToast = (type: ToastType, msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 5000)
  }

  /* ── Validación por step ─────────────────────────────────────── */
  const validate = (): boolean => {
    const f = form
    if (step === 1) {
      if (!f.nombre || !f.celular || !f.email || !f.edad || !f.peso || !f.estatura || !f.eps || !f.ocupacion)
        return showToast("warning", "Completa todos los datos personales antes de continuar."), false
    }
    if (step === 2) {
      if (!f.horasSueno || !f.problemasSueno || !f.horasSentado || !f.horasMovimiento || !f.horasIntensas)
        return showToast("warning", "Completa la información de estilo de vida."), false
    }
    if (step === 3) {
      if (!f.cirugia || !f.molestiaOsteomuscular || !f.detalleMolestia || !f.antecedentesDeportivos || !f.antecedentesFamiliares || !f.antecedentesMetabolicos || !f.alcohol || !f.fumar || !f.otrasSustancias || !f.medicamentos || !f.molestiasPecho)
        return showToast("warning", "Completa toda la información de salud."), false
    }
    if (step === 4) {
      if (!f.comidasDia || !f.primeraComida || !f.ultimaComida || !f.alergiasComida || !f.proteinas || !f.carbohidratos || !f.frutas || !f.vegetales || !f.legumbres || !f.comidasNoGustan || !f.comidasNoPuede || !f.suplementacion)
        return showToast("warning", "Completa la sección de nutrición."), false
    }
    if (step === 5) {
      if (!f.espacioEntrenamiento || !f.actividadFisica || !f.tiempoEntrenando || !f.consistencia || !f.frecuenciaEjercicio || !f.duracionSesion || !f.bandasResistencia || !f.cardio || !f.dispositivoFC)
        return showToast("warning", "Completa los datos de entrenamiento."), false
    }
    if (step === 6) {
      if (!f.objetivo || !f.motivacion || !f.nivelMotivacion || !f.disponibilidadHorario || !f.expectativas)
        return showToast("warning", "Completa tu objetivo y motivación para finalizar."), false
    }
    return true
  }

  const goNext = () => {
    if (!validate()) return
    setAnimDir("out")
    setTimeout(() => { setStep(s => s + 1); setAnimDir("in") }, 200)
  }

  const goPrev = () => {
    setAnimDir("out")
    setTimeout(() => { setStep(s => s - 1); setAnimDir("in") }, 200)
  }

  /* ── Submit ──────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch("/api/entrenamiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        showToast("error", `Error del servidor (${res.status}). Intenta de nuevo en unos minutos.`)
      }
    } catch {
      showToast("error", "Sin conexión. Verifica tu internet e intenta de nuevo.")
    }
    setLoading(false)
  }

  /* ── Pantalla de éxito ───────────────────────────────────────── */
  if (submitted) return <SuccessScreen />

  const currentStep = step // 0 = intro, 1-6 = steps
  const progress = step === 0 ? 0 : (step / 6) * 100

  return (
    <div style={{
      minHeight: "100vh", background: "#000", color: "#fff",
      fontFamily: "'Barlow', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,900&family=Barlow:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: ${R}; color: #fff; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.3); }
        option { background: #111; color: #fff; }
        @keyframes slideIn  { from { opacity:0; transform: translateY(24px) } to { opacity:1; transform: translateY(0) } }
        @keyframes slideOut { from { opacity:1; transform: translateY(0) } to { opacity:0; transform: translateY(-16px) } }
        @keyframes pulseRed { 0%,100% { box-shadow: 0 0 0 0 ${R}50 } 50% { box-shadow: 0 0 0 8px transparent } }
        @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
        .step-content { animation: slideIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        .step-out     { animation: slideOut 0.2s ease forwards; }
        input:focus, textarea:focus, select:focus { border-color: ${R} !important; }
      `}</style>

      {/* ── Header fijo ─────────────────────────────────────── */}
      {step > 0 && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          {/* Barra de progreso */}
          <div style={{ height: 3, background: "rgba(255,255,255,0.05)", position: "relative" }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${progress}%`,
              background: `linear-gradient(to right, ${R}90, ${R})`,
              transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)",
            }} />
          </div>

          <div style={{ maxWidth: 900, margin: "0 auto", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 6, height: 6, background: R, borderRadius: "50%" }} />
              <span style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
                Coach David
              </span>
            </div>

            {/* Steps nav */}
            <div style={{ display: "flex", gap: 4 }}>
              {STEPS.map(s => (
                <div key={s.n} style={{
                  width: s.n === step ? 28 : 8, height: 8,
                  background: s.n < step ? R : s.n === step ? "#fff" : "rgba(255,255,255,0.12)",
                  borderRadius: 4, transition: "all 0.3s ease",
                }} />
              ))}
            </div>

            <span style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 13, fontWeight: 700, color: R, letterSpacing: "0.2em" }}>
              {step} / 6
            </span>
          </div>
        </div>
      )}

      {/* ── Contenido principal ──────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: step === 0 ? "0" : "100px 32px 80px" }}>

        {/* ── INTRO ─────────────────────────────────────────── */}
        {step === 0 && <IntroScreen onStart={() => { setAnimDir("in"); setStep(1) }} />}

        {/* ── STEPS ─────────────────────────────────────────── */}
        {step > 0 && (
          <div className={animDir === "in" ? "step-content" : "step-out"}>

            {/* Cabecera del step */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 32, height: 2, background: R }} />
                <span style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: R }}>
                  Paso {step} de 6
                </span>
              </div>
              <h2 style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 0.95 }}>
                {STEPS[step - 1].label.toUpperCase()}
              </h2>
            </div>

            {/* Contenido del step */}
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
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
                marginTop: 32, padding: "16px 20px", display: "flex", gap: 12, alignItems: "flex-start",
                border: `1px solid ${toast.type === "success" ? "#22c55e50" : toast.type === "error" ? `${R}50` : "#eab30850"}`,
                background: toast.type === "success" ? "#22c55e10" : toast.type === "error" ? `${R}10` : "#eab30810",
                animation: "fadeIn 0.3s ease",
              }}>
                <span style={{ fontWeight: 900, fontSize: 18, color: toast.type === "success" ? "#22c55e" : toast.type === "error" ? R : "#eab308", lineHeight: 1, marginTop: 2 }}>
                  {toast.type === "success" ? "✓" : "!"}
                </span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "'Barlow', sans-serif" }}>{toast.msg}</span>
              </div>
            )}

            {/* Navegación */}
            <div style={{ display: "flex", gap: 12, marginTop: 48 }}>
              {step > 1 && (
                <button onClick={goPrev} style={{
                  flex: 1, padding: "18px", border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent", color: "rgba(255,255,255,0.5)",
                  fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 14, fontWeight: 800,
                  letterSpacing: "0.25em", textTransform: "uppercase", cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                  onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.target as HTMLButtonElement).style.color = "#fff" }}
                  onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.target as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)" }}
                >
                  ← Atrás
                </button>
              )}

              {step < 6 ? (
                <button onClick={goNext} style={{
                  flex: 2, padding: "18px", background: R, color: "#fff", border: "none",
                  fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 15, fontWeight: 900,
                  letterSpacing: "0.25em", textTransform: "uppercase", cursor: "pointer",
                  clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                  transition: "all 0.2s ease",
                }}
                  onMouseEnter={e => (e.target as HTMLButtonElement).style.background = "#fff"}
                  onMouseLeave={e => (e.target as HTMLButtonElement).style.background = R}
                >
                  Siguiente →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} style={{
                  flex: 2, padding: "18px", background: loading ? "rgba(232,0,13,0.5)" : R,
                  color: "#fff", border: "none",
                  fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 15, fontWeight: 900,
                  letterSpacing: "0.25em", textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                  transition: "all 0.2s ease",
                  boxShadow: loading ? "none" : `0 0 40px ${R}40`,
                }}>
                  {loading ? "Enviando..." : "Finalizar y enviar ✓"}
                </button>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

/* ══ INTRO SCREEN ═════════════════════════════════════════════════ */
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

      {/* Fondo con grilla */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 50%, rgba(232,0,13,0.08) 0%, transparent 60%)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: R }} />

      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 900, margin: "0 auto", padding: "80px 48px", animation: "slideIn 0.8s cubic-bezier(0.16,1,0.3,1)" }}>

        {/* Eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 40, height: 2, background: R }} />
          <span style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: R }}>
            Valoración inicial · Programa de entrenamiento
          </span>
        </div>

        {/* Título */}
        <h1 style={{
          fontFamily: "'Barlow Condensed', Impact, sans-serif",
          fontSize: "clamp(60px, 8vw, 110px)", fontWeight: 900,
          textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em",
          marginBottom: 40,
        }}>
          DATOS DE<br />
          <span style={{ color: R, textShadow: `0 0 60px ${R}40` }}>VALORACIÓN</span>
        </h1>

        {/* Descripción */}
        <div style={{ maxWidth: 620, marginBottom: 48 }}>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, fontWeight: 300, marginBottom: 24 }}>
            Este formulario recopila información relevante previa al diseño de tu programa
            de entrenamiento. Nos permite identificar tus limitaciones, estado actual
            y características específicas.
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", lineHeight: 1.7, fontWeight: 300 }}>
            No te tomará más de <strong style={{ color: "rgba(255,255,255,0.6)" }}>10 minutos</strong> y será de mucha utilidad.
          </p>
        </div>

        {/* Aviso legal */}
        <div style={{
          padding: "24px 28px", border: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.02)", marginBottom: 48,
        }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.7, fontWeight: 300 }}>
            Al diligenciar este formulario, <strong style={{ color: "rgba(255,255,255,0.5)" }}>autorizo a Coach David</strong> para hacer uso de mi información para el diseño y seguimiento de un programa de entrenamiento personalizado. Declaro ser consciente de que la actividad física conlleva ciertos riesgos, incluyendo posibles lesiones, y que mi participación es bajo mi responsabilidad. El programa no reemplaza el diagnóstico ni tratamiento médico profesional.
          </p>
        </div>

        {/* Steps preview */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 48 }}>
          {[
            "Datos personales", "Estilo de vida", "Salud",
            "Nutrición", "Entrenamiento", "Objetivos"
          ].map((s, i) => (
            <div key={s} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "'Barlow Condensed', Impact, sans-serif",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
            }}>
              <span style={{ color: R, fontWeight: 900 }}>{String(i + 1).padStart(2, "0")}</span>
              {s}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div>
          <button onClick={onStart} style={{
            padding: "20px 64px", background: R, color: "#fff", border: "none",
            fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 16, fontWeight: 900,
            letterSpacing: "0.25em", textTransform: "uppercase", cursor: "pointer",
            clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
            boxShadow: `0 20px 50px ${R}40`, transition: "all 0.25s ease",
          }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = "#fff"; (e.target as HTMLButtonElement).style.color = "#000" }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = R; (e.target as HTMLButtonElement).style.color = "#fff" }}
          >
            Comenzar valoración →
          </button>
          <p style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'Barlow', sans-serif" }}>
            Acepto el tratamiento de mis datos para los fines mencionados.
          </p>
        </div>

      </div>
    </div>
  )
}

/* ══ SUCCESS SCREEN ═══════════════════════════════════════════════ */
function SuccessScreen() {
  return (
    <div style={{
      minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", textAlign: "center", padding: 48,
      animation: "fadeIn 0.6s ease",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=Barlow:wght@300;400&display=swap');`}</style>
      <div style={{ width: 80, height: 80, border: `3px solid ${R}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40, animation: "pulseRed 2s ease infinite", borderRadius: "50%" }}>
        <span style={{ fontSize: 36, color: R }}>✓</span>
      </div>
      <h2 style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: "clamp(48px, 6vw, 80px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 24 }}>
        FORMULARIO<br /><span style={{ color: R }}>ENVIADO</span>
      </h2>
      <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 17, color: "rgba(255,255,255,0.45)", maxWidth: 460, lineHeight: 1.7, fontWeight: 300 }}>
        Recibí tus datos correctamente. Me pondré en contacto contigo pronto para comenzar a diseñar tu programa personalizado.
      </p>
      <div style={{ marginTop: 48, padding: "16px 24px", border: "1px solid rgba(255,255,255,0.08)", display: "inline-flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 8, height: 8, background: R, borderRadius: "50%" }} />
        <span style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.3)", letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700 }}>
          No todos completan este proceso. Tú ya diste el primer paso.
        </span>
      </div>
    </div>
  )
}

/* ══ STEP 1 — Datos personales ════════════════════════════════════ */
function Step1({ form, set }: { form: FormState; set: (k: keyof FormState) => (v: string) => void }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="Nombre completo"><Input value={form.nombre} onChange={set("nombre")} placeholder="Tu nombre" /></Field>
        <Field label="Celular de contacto"><Input value={form.celular} onChange={set("celular")} placeholder="+57 300..." /></Field>
      </div>
      <Field label="Correo electrónico" required>
        <Input value={form.email} onChange={set("email")} type="email" placeholder="tu@correo.com" />
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 6, fontFamily: "'Barlow', sans-serif" }}>Se usará para compartir la plantilla de seguimiento</span>
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        <Field label="Edad"><Input value={form.edad} onChange={set("edad")} placeholder="25" /></Field>
        <Field label="Peso (kg)"><Input value={form.peso} onChange={set("peso")} placeholder="70" /></Field>
        <Field label="Estatura (cm)"><Input value={form.estatura} onChange={set("estatura")} placeholder="175" /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="EPS"><Input value={form.eps} onChange={set("eps")} placeholder="Sura, Colsanitas..." /></Field>
        <Field label="Ocupación"><Input value={form.ocupacion} onChange={set("ocupacion")} placeholder="Tu trabajo o estudio" /></Field>
      </div>
    </>
  )
}

/* ══ STEP 2 — Estilo de vida ══════════════════════════════════════ */
function Step2({ form, set }: { form: FormState; set: (k: keyof FormState) => (v: string) => void }) {
  return (
    <>
      <SectionTitle>Sueño</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="¿Cuántas horas duermes al día?">
          <Select value={form.horasSueno} onChange={set("horasSueno")} options={["Menos de 5h", "5 - 6h", "6 - 7h", "7 - 8h", "Más de 8h"]} />
        </Field>
        <Field label="¿Tienes problemas para conciliar el sueño?">
          <RadioGroup name="sueno" options={["Sí", "No"]} value={form.problemasSueno} onChange={set("problemasSueno")} />
        </Field>
      </div>

      <SectionTitle>Actividad diaria</SectionTitle>
      <Field label="¿Cuántas horas pasas sentado/a al día?">
        <Select value={form.horasSentado} onChange={set("horasSentado")} options={["Menos de 2h", "2 - 4h", "4 - 6h", "6 - 8h", "Más de 8h"]} />
      </Field>
      <Field label="¿Cuántas horas al día estás en movimiento ligero?" required>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginBottom: 8, display: "block" }}>Caminando, haciendo aseo, cargando cosas — diferente al entrenamiento</span>
        <Select value={form.horasMovimiento} onChange={set("horasMovimiento")} options={["Menos de 1h", "1 - 2h", "2 - 4h", "Más de 4h"]} />
      </Field>
      <Field label="¿Cuántas horas al día realizas movimientos intensos?" required>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginBottom: 8, display: "block" }}>Corriendo, pulsaciones elevadas — diferente al entrenamiento</span>
        <Select value={form.horasIntensas} onChange={set("horasIntensas")} options={["Ninguna", "Menos de 1h", "1 - 2h", "Más de 2h"]} />
      </Field>
    </>
  )
}

/* ══ STEP 3 — Salud ═══════════════════════════════════════════════ */
function Step3({ form, set }: { form: FormState; set: (k: keyof FormState) => (v: string) => void }) {
  return (
    <>
      <SectionTitle>Condición física actual</SectionTitle>
      <Field label="¿Tienes alguna cirugía? Especifica el detalle">
        <Input value={form.cirugia} onChange={set("cirugia")} placeholder="NA si no aplica" />
      </Field>
      <Field label="¿Tienes alguna molestia osteomuscular actualmente?">
        <RadioGroup name="molestia" options={["Sí", "No"]} value={form.molestiaOsteomuscular} onChange={set("molestiaOsteomuscular")} />
      </Field>
      <Field label="En caso afirmativo, especifica la molestia">
        <Input value={form.detalleMolestia} onChange={set("detalleMolestia")} placeholder="NA si no aplica" />
      </Field>

      <SectionTitle>Antecedentes</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="Deportivos (lesiones, molestias, cirugías musculares/articulares)">
          <RadioGroup name="antDep" options={["Sí", "No"]} value={form.antecedentesDeportivos} onChange={set("antecedentesDeportivos")} />
        </Field>
        <Field label="Especifica">
          <Input value={form.detallDeportivos} onChange={set("detallDeportivos")} placeholder="NA si no aplica" />
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="Familiares (Diabetes, enfermedades cardiovasculares, etc.)">
          <RadioGroup name="antFam" options={["Sí", "No"]} value={form.antecedentesFamiliares} onChange={set("antecedentesFamiliares")} />
        </Field>
        <Field label="Especifica">
          <Input value={form.detalleFamiliares} onChange={set("detalleFamiliares")} placeholder="NA si no aplica" />
        </Field>
      </div>
      <Field label="Antecedentes metabólicos (Obesidad)">
        <RadioGroup name="antMet" options={["Sí", "No"]} value={form.antecedentesMetabolicos} onChange={set("antecedentesMetabolicos")} />
      </Field>

      <SectionTitle>Hábitos y medicamentos</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="¿Consumes alcohol?">
          <Select value={form.alcohol} onChange={set("alcohol")} options={["Nunca", "1 o menos veces al mes", "2 a 4 veces al mes", "2 a 4 veces por semana"]} />
        </Field>
        <Field label="¿Fumas?">
          <Select value={form.fumar} onChange={set("fumar")} options={["Nunca", "1 o 2 cigarrillos al día", "Una vez por semana", "Una vez por mes"]} />
        </Field>
      </div>
      <Field label="¿Consumes alguna otra sustancia? Especifica cuál">
        <Input value={form.otrasSustancias} onChange={set("otrasSustancias")} placeholder="NA si no aplica" />
      </Field>
      <Field label="¿Consumes algún medicamento para enfermedad crónica?">
        <Input value={form.medicamentos} onChange={set("medicamentos")} placeholder="NA si no aplica" />
      </Field>
      <Field label="¿Has sentido molestias en el pecho en reposo o al hacer actividad física?">
        <RadioGroup name="pecho" options={["Sí", "No"]} value={form.molestiasPecho} onChange={set("molestiasPecho")} />
      </Field>
    </>
  )
}

/* ══ STEP 4 — Nutrición ═══════════════════════════════════════════ */
function Step4({ form, set }: { form: FormState; set: (k: keyof FormState) => (v: string) => void }) {
  return (
    <>
      <SectionTitle>Hábitos alimenticios</SectionTitle>
      <Field label="¿Cuántas comidas haces al día?">
        <RadioGroup name="comidas" options={["1", "2", "3", "4", "5", "6", "+6"]} value={form.comidasDia} onChange={set("comidasDia")} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="¿A qué hora es tu primera comida?">
          <input type="time" value={form.primeraComida} onChange={e => set("primeraComida")(e.target.value)}
            style={inputStyle} onFocus={e => (e.target.style.borderColor = R)} onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
        </Field>
        <Field label="¿A qué hora es tu última comida?">
          <input type="time" value={form.ultimaComida} onChange={e => set("ultimaComida")(e.target.value)}
            style={inputStyle} onFocus={e => (e.target.style.borderColor = R)} onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
        </Field>
      </div>
      <Field label="¿Eres alérgic@ a alguna comida?">
        <RadioGroup name="alergias" options={["Sí", "No"]} value={form.alergiasComida} onChange={set("alergiasComida")} />
      </Field>
      {form.alergiasComida === "Sí" && (
        <Field label="Describe las alergias en detalle">
          <Textarea value={form.detalleAlergias} onChange={set("detalleAlergias")} placeholder="Especifica los alimentos..." />
        </Field>
      )}

      <SectionTitle>Preferencias alimenticias</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="Tus 5 proteínas favoritas">
          <Textarea value={form.proteinas} onChange={set("proteinas")} placeholder="Pollo, huevo, atún, carne, salmón..." />
        </Field>
        <Field label="Tus 5 carbohidratos favoritos">
          <Textarea value={form.carbohidratos} onChange={set("carbohidratos")} placeholder="Arroz, papa, avena, pasta, pan..." />
        </Field>
        <Field label="Tus 10 frutas favoritas">
          <Textarea value={form.frutas} onChange={set("frutas")} placeholder="Banano, mango, naranja..." />
        </Field>
        <Field label="Tus 10 vegetales favoritos">
          <Textarea value={form.vegetales} onChange={set("vegetales")} placeholder="Brócoli, zanahoria, espinaca..." />
        </Field>
      </div>
      <Field label="Tus 5 legumbres favoritas">
        <Input value={form.legumbres} onChange={set("legumbres")} placeholder="Lentejas, garbanzos, fríjoles..." />
      </Field>

      <SectionTitle>Restricciones</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="Comidas que NO te gustan">
          <Textarea value={form.comidasNoGustan} onChange={set("comidasNoGustan")} placeholder="Lista todas..." />
        </Field>
        <Field label="Comidas que NO puedes comer (por salud, alergias, etc.)">
          <Textarea value={form.comidasNoPuede} onChange={set("comidasNoPuede")} placeholder="NA si no aplica" />
        </Field>
      </div>
      <Field label="¿Usas suplementación? Especifica cuál, dosis, marca y frecuencia">
        <Textarea value={form.suplementacion} onChange={set("suplementacion")} placeholder="NA si no aplica" />
      </Field>
    </>
  )
}

/* ══ STEP 5 — Entrenamiento ═══════════════════════════════════════ */
function Step5({ form, set }: { form: FormState; set: (k: keyof FormState) => (v: string) => void }) {
  return (
    <>
      <SectionTitle>Espacio y experiencia</SectionTitle>
      <Field label="¿En qué espacio tienes disponibilidad para entrenar?">
        <RadioGroup name="espacio" options={["Gimnasio", "Casa", "Parque"]} value={form.espacioEntrenamiento} onChange={set("espacioEntrenamiento")} />
      </Field>
      {(form.espacioEntrenamiento === "Casa" || form.espacioEntrenamiento === "Parque") && (
        <Field label="¿Qué equipos tienes disponibles?">
          <Input value={form.equiposCasa} onChange={set("equiposCasa")} placeholder="Bandas, mancuernas, pesas, discos..." />
        </Field>
      )}
      <Field label="¿Realizas ejercicio actualmente? Especifica cuál">
        <Input value={form.actividadFisica} onChange={set("actividadFisica")} placeholder="Pesas, deporte, caminatas..." />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="¿Hace cuánto realizas ejercicio?">
          <Select value={form.tiempoEntrenando} onChange={set("tiempoEntrenando")}
            options={["No realizo, apenas empezaré", "Hace 1 mes", "Entre 1 y 6 meses", "Entre 6 meses y 1 año", "Entre 1 y 2 años", "Más de 2 años"]} />
        </Field>
        <Field label="¿Has entrenado consistentemente los últimos 3 meses? (3+ veces/semana)">
          <RadioGroup name="consistencia" options={["Sí", "No"]} value={form.consistencia} onChange={set("consistencia")} />
        </Field>
        <Field label="¿Con qué frecuencia entrenas?">
          <Select value={form.frecuenciaEjercicio} onChange={set("frecuenciaEjercicio")}
            options={["No realizo", "1 a 3 veces por semana", "4 a 5 veces por semana", "6 veces por semana"]} />
        </Field>
        <Field label="¿Cuánto dura tu sesión?">
          <Select value={form.duracionSesion} onChange={set("duracionSesion")}
            options={["30 minutos", "Entre 30min y 1h", "Entre 1h y 2h", "Más de 2h"]} />
        </Field>
      </div>

      <SectionTitle>Ejercicios favoritos por grupo muscular</SectionTitle>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: -12, fontFamily: "'Barlow', sans-serif", fontWeight: 300 }}>
        Escribe NA si no conoces ejercicios del grupo muscular
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="Pectoral — tus 5 favoritos">
          <Textarea value={form.ejerciciosPectoral} onChange={set("ejerciciosPectoral")} placeholder="Press banca, aperturas..." />
        </Field>
        <Field label="Espalda (cadena posterior tren superior)">
          <Textarea value={form.ejerciciosEspalda} onChange={set("ejerciciosEspalda")} placeholder="Jalón, remo, dominadas..." />
        </Field>
        <Field label="Brazo (Bíceps, Tríceps, Antebrazo)">
          <Textarea value={form.ejerciciosBrazo} onChange={set("ejerciciosBrazo")} placeholder="Curl, extensiones..." />
        </Field>
        <Field label="Deltoides (Hombro)">
          <Textarea value={form.ejerciciosDeltoides} onChange={set("ejerciciosDeltoides")} placeholder="Press militar, elevaciones..." />
        </Field>
        <Field label="Isquiotibiales">
          <Textarea value={form.ejerciciosIsquios} onChange={set("ejerciciosIsquios")} placeholder="Curl femoral, peso muerto..." />
        </Field>
        <Field label="Cuádriceps">
          <Textarea value={form.ejerciciosCuadriceps} onChange={set("ejerciciosCuadriceps")} placeholder="Sentadilla, prensa, extensiones..." />
        </Field>
        <Field label="Glúteo">
          <Textarea value={form.ejerciciosGluteo} onChange={set("ejerciciosGluteo")} placeholder="Hip thrust, sentadilla sumo..." />
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="Ejercicios que te generan molestia">
          <Textarea value={form.ejerciciosMolestan} onChange={set("ejerciciosMolestan")} placeholder="NA si no aplica" />
        </Field>
        <Field label="Ejercicios que no te gustan o no quieres hacer">
          <Textarea value={form.ejerciciosNoGustan} onChange={set("ejerciciosNoGustan")} placeholder="Lista todos..." />
        </Field>
      </div>

      <SectionTitle>Cardio y dispositivos</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        <Field label="¿Tienes bandas de resistencia?">
          <RadioGroup name="bandas" options={["Sí", "No"]} value={form.bandasResistencia} onChange={set("bandasResistencia")} />
        </Field>
        <Field label="¿Realizas actividad cardiovascular?">
          <Select value={form.cardio} onChange={set("cardio")}
            options={["Nunca", "1 vez al mes o menos", "1 vez por semana", "2 a 3 veces por semana", "Más de 3 veces por semana"]} />
        </Field>
        <Field label="¿Tienes dispositivo para medir frecuencia cardíaca?">
          <RadioGroup name="dispFC" options={["Sí", "No"]} value={form.dispositivoFC} onChange={set("dispositivoFC")} />
        </Field>
      </div>
    </>
  )
}

/* ══ STEP 6 — Objetivos ═══════════════════════════════════════════ */
function Step6({ form, set }: { form: FormState; set: (k: keyof FormState) => (v: string) => void }) {
  return (
    <>
      <SectionTitle>Tu objetivo</SectionTitle>
      <Field label="¿Cuál es tu objetivo físico?">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "Reducir % de grasa (objetivo estético)",
            "Incrementar masa muscular (objetivo estético)",
            "Incrementar capacidades físicas — Resistencia, Fuerza, ADM (rendimiento)",
            "Otro",
          ].map(opt => (
            <button key={opt} type="button" onClick={() => set("objetivo")(opt)} style={{
              padding: "14px 20px", border: `1px solid ${form.objetivo === opt ? R : "rgba(255,255,255,0.1)"}`,
              background: form.objetivo === opt ? `${R}12` : "rgba(255,255,255,0.02)",
              color: form.objetivo === opt ? "#fff" : "rgba(255,255,255,0.45)",
              textAlign: "left", fontFamily: "'Barlow', sans-serif", fontSize: 15,
              cursor: "pointer", transition: "all 0.2s ease",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ width: 8, height: 8, border: `2px solid ${form.objetivo === opt ? R : "rgba(255,255,255,0.2)"}`, background: form.objetivo === opt ? R : "transparent", flexShrink: 0, transition: "all 0.2s ease" }} />
              {opt}
            </button>
          ))}
        </div>
      </Field>
      {form.objetivo === "Otro" && (
        <Field label="Describe tu objetivo">
          <Input value={form.otraObjetivo} onChange={set("otraObjetivo")} placeholder="Especifica tu objetivo..." />
        </Field>
      )}

      <Field label="¿Qué te motiva a hacer ejercicio?">
        <Textarea value={form.motivacion} onChange={set("motivacion")} placeholder="Sé específico, esto ayuda al diseño del programa..." />
      </Field>

      <Field label="¿Qué tan motivado/a te sientes para comenzar?">
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { v: "1", label: "Poco" },
            { v: "2", label: "No tanto" },
            { v: "3", label: "Regular" },
            { v: "4", label: "Motivado" },
            { v: "5", label: "¡Vamos!" },
          ].map(({ v, label }) => (
            <button key={v} type="button" onClick={() => set("nivelMotivacion")(v)} style={{
              flex: 1, padding: "16px 8px", border: `1px solid ${form.nivelMotivacion === v ? R : "rgba(255,255,255,0.1)"}`,
              background: form.nivelMotivacion === v ? `${R}18` : "transparent",
              color: form.nivelMotivacion === v ? "#fff" : "rgba(255,255,255,0.35)",
              fontFamily: "'Barlow Condensed', Impact, sans-serif",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s ease",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: form.nivelMotivacion === v ? R : "rgba(255,255,255,0.3)" }}>{v}</span>
              {label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="¿Qué disponibilidad tienes para entrenar? (horario y horas al día)">
        <Textarea value={form.disponibilidadHorario} onChange={set("disponibilidadHorario")} placeholder="Ej: tardes de 6pm a 8pm, entre semana..." />
      </Field>
      <Field label="¿Qué expectativas tienes con esta asesoría?">
        <Textarea value={form.expectativas} onChange={set("expectativas")} placeholder="Sé honesto, esto nos ayuda a alinear el proceso..." />
      </Field>
      <Field label="¿Algún comentario adicional importante?" required={false}>
        <Textarea value={form.comentariosAdicionales} onChange={set("comentariosAdicionales")} placeholder="NA si no aplica" />
      </Field>
    </>
  )
}

/* ── Helper ───────────────────────────────────────────────────── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
      <div style={{ width: 4, height: 4, background: R, transform: "rotate(45deg)", flexShrink: 0 }} />
      <span style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
        {children}
      </span>
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
    </div>
  )
}
