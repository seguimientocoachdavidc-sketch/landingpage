"use client"

import { useState } from "react"

export default function NutricionCuestionario() {

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [toast, setToast] = useState<{type: 'success' | 'error' | 'warning', msg: string} | null>(null)

  const showToast = (type: 'success' | 'error' | 'warning', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 5000)
  }

  const [form, setForm] = useState({
    nombre: "", celular: "", eps: "", peso: "", altura: "", edad: "",
    sueno: "", problemasSueno: "", sedentario: "", actividadLigera: "", actividadFisica: "",
    experiencia: "", frecuencia: "", alcohol: "", fumar: "",
    enfermedades: "", patologias: "", restricciones: "",
    comidasDia: "", primeraComida: "", ultimaComida: "",
    proteinas: "", vegetales: "", frutas: "", carbs: "",
    comidaRapida: "", legumbres: "", noGusta: "", restriccionesExtra: "", suplementos: "",
    objetivo: "", motivacion: "", nivelMotivacion: "", comentariosFinales: "",
  })

      const validateStep = () => {
      if (step === 1) {
        if (!form.nombre || !form.celular || !form.peso || !form.altura || !form.edad) {
          showToast('warning', 'Completa todos los datos básicos antes de continuar.')
          return false
        }
      }
      if (step === 2) {
        if (!form.sueno || !form.sedentario || !form.actividadFisica) {
          showToast('warning', 'Completa la información de estilo de vida.')
          return false
        }
      }
      if (step === 3) {
        if (!form.experiencia || !form.frecuencia || !form.alcohol || !form.fumar) {
          showToast('warning', 'Completa todos tus hábitos antes de continuar.')
          return false
        }
      }
      if (step === 4) {
        if (!form.enfermedades) {
          showToast('warning', 'Completa la información de salud.')
          return false
        }
      }
      if (step === 5) {
        if (!form.comidasDia || !form.primeraComida || !form.proteinas) {
          showToast('warning', 'Completa la sección de nutrición.')
          return false
        }
      }
      if (step === 6) {
        if (!form.objetivo || !form.nivelMotivacion) {
          showToast('warning', 'Selecciona tu objetivo y nivel de compromiso.')
          return false
        }
      }
      return true
    }

    const handleSubmit = async () => {
      if (!validateStep()) return
      setLoading(true)
      try {
        const res = await fetch("/api/nutricion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        if (res.ok) {
          showToast('success', 'Tus respuestas llegaron correctamente. Te contactaré pronto.')
        } else {
          const status = res.status
          showToast('error', `Hubo un problema al procesar tu formulario (código ${status}). Intenta en unos minutos.`)
        }
      } catch (error) {
        console.error(error)
        showToast('error', 'No se pudo enviar el formulario. Verifica tu internet e intenta de nuevo.')
      }
      setLoading(false)
    }

  const inputClass = "w-full p-3 bg-black/40 border border-white/20 rounded text-white placeholder-white/40"
  const btnBack = "w-full border border-white/20 py-3 rounded text-white"
  const btnNext = "w-full bg-primary py-3 rounded font-bold text-white"

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-black text-white">

      {/* BACKGROUNDS */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* ✅ FIX 1: div del card ya NO se cierra antes de los steps */}
        <div className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]">

          {/* PROGRESS BAR */}
          <div className="w-full bg-white/10 h-2 rounded-full mb-6">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Datos básicos</h2>
              <input placeholder="Nombre" value={form.nombre}
                onChange={(e) => setForm({...form, nombre: e.target.value})} className={inputClass} />
              <input placeholder="Celular" value={form.celular}
                onChange={(e) => setForm({...form, celular: e.target.value})} className={inputClass} />
              <input placeholder="EPS" value={form.eps}
                onChange={(e) => setForm({...form, eps: e.target.value})} className={inputClass} />
              <input placeholder="Peso (kg)" value={form.peso}
                onChange={(e) => setForm({...form, peso: e.target.value})} className={inputClass} />
              <input placeholder="Altura (cm)" value={form.altura}
                onChange={(e) => setForm({...form, altura: e.target.value})} className={inputClass} />
              <input placeholder="Edad" value={form.edad}
                onChange={(e) => setForm({...form, edad: e.target.value})} className={inputClass} />
              <button onClick={() => { if (validateStep()) setStep(2) }} className={btnNext}>Siguiente →</button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Estilo de vida</h2>
              <input placeholder="¿Cuántas horas duermes?" value={form.sueno}
                onChange={(e) => setForm({...form, sueno: e.target.value})} className={inputClass} />
              <input placeholder="¿Tienes problemas para dormir?" value={form.problemasSueno}
                onChange={(e) => setForm({...form, problemasSueno: e.target.value})} className={inputClass} />
              <input placeholder="Horas sedentario al día" value={form.sedentario}
                onChange={(e) => setForm({...form, sedentario: e.target.value})} className={inputClass} />
              <input placeholder="Actividad ligera (caminatas, etc.)" value={form.actividadLigera}
                onChange={(e) => setForm({...form, actividadLigera: e.target.value})} className={inputClass} />
              <input placeholder="Horas de actividad física intensa" value={form.actividadFisica}
                onChange={(e) => setForm({...form, actividadFisica: e.target.value})} className={inputClass} />
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className={btnBack}>← Atrás</button>
                {/* ✅ FIX 2: Botón dice "Siguiente" no "Enviar" */}
                <button onClick={() => { if (validateStep()) setStep(3) }} className={btnNext}>Siguiente →</button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Hábitos y entrenamiento</h2>
              <select value={form.experiencia}
                onChange={(e) => setForm({...form, experiencia: e.target.value})} className={inputClass}>
                <option value="">¿Hace cuánto entrenas?</option>
                <option>Menos de 6 meses</option>
                <option>6 meses - 1 año</option>
                <option>1 - 3 años</option>
                <option>Más de 3 años</option>
                <option>No entreno</option>
              </select>
              <select value={form.frecuencia}
                onChange={(e) => setForm({...form, frecuencia: e.target.value})} className={inputClass}>
                <option value="">¿Entrenas 3+ veces por semana?</option>
                <option>Si</option>
                <option>No</option>
              </select>
              <select value={form.alcohol}
                onChange={(e) => setForm({...form, alcohol: e.target.value})} className={inputClass}>
                <option value="">¿Consumes alcohol?</option>
                <option>Nunca</option>
                <option>1 vez al mes</option>
                <option>1 vez por semana</option>
                <option>Más de una vez por semana</option>
              </select>
              <select value={form.fumar}
                onChange={(e) => setForm({...form, fumar: e.target.value})} className={inputClass}>
                <option value="">¿Fumas?</option>
                <option>Nunca</option>
                <option>Ocasional</option>
                <option>Frecuente</option>
              </select>
              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className={btnBack}>← Atrás</button>
                <button onClick={() => { if (validateStep()) setStep(4) }} className={btnNext}>Siguiente →</button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Salud</h2>
              <input placeholder="¿Tienes enfermedades cardiovasculares?" value={form.enfermedades}
                onChange={(e) => setForm({...form, enfermedades: e.target.value})} className={inputClass} />
              <textarea placeholder="Patologías o condiciones médicas" value={form.patologias}
                onChange={(e) => setForm({...form, patologias: e.target.value})} className={inputClass} />
              <textarea placeholder="Restricciones alimentarias / alergias" value={form.restricciones}
                onChange={(e) => setForm({...form, restricciones: e.target.value})} className={inputClass} />
              <div className="flex gap-4">
                <button onClick={() => setStep(3)} className={btnBack}>← Atrás</button>
                {/* ✅ FIX 2: Botón dice "Siguiente" no "Enviar" */}
                <button onClick={() => { if (validateStep()) setStep(5) }} className={btnNext}>Siguiente →</button>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Nutrición</h2>
              <input placeholder="¿Cuántas comidas haces al día?" value={form.comidasDia}
                onChange={(e) => setForm({...form, comidasDia: e.target.value})} className={inputClass} />
              <label className="text-sm text-white/60">Primera comida del día</label>
              <input type="time" value={form.primeraComida}
                onChange={(e) => setForm({...form, primeraComida: e.target.value})} className={inputClass} />
              <label className="text-sm text-white/60">Última comida del día</label>
              <input type="time" value={form.ultimaComida}
                onChange={(e) => setForm({...form, ultimaComida: e.target.value})} className={inputClass} />
              <textarea placeholder="5 proteínas favoritas" value={form.proteinas}
                onChange={(e) => setForm({...form, proteinas: e.target.value})} className={inputClass} />
              <textarea placeholder="5 vegetales favoritos" value={form.vegetales}
                onChange={(e) => setForm({...form, vegetales: e.target.value})} className={inputClass} />
              <textarea placeholder="10 frutas favoritas" value={form.frutas}
                onChange={(e) => setForm({...form, frutas: e.target.value})} className={inputClass} />
              <textarea placeholder="Carbohidratos favoritos" value={form.carbs}
                onChange={(e) => setForm({...form, carbs: e.target.value})} className={inputClass} />
              <textarea placeholder="Comida rápida favorita" value={form.comidaRapida}
                onChange={(e) => setForm({...form, comidaRapida: e.target.value})} className={inputClass} />
              <textarea placeholder="Legumbres favoritas" value={form.legumbres}
                onChange={(e) => setForm({...form, legumbres: e.target.value})} className={inputClass} />
              <textarea placeholder="10 comidas que NO te gustan" value={form.noGusta}
                onChange={(e) => setForm({...form, noGusta: e.target.value})} className={inputClass} />
              <textarea placeholder="Restricciones (alergias)" value={form.restriccionesExtra}
                onChange={(e) => setForm({...form, restriccionesExtra: e.target.value})} className={inputClass} />
              <textarea placeholder="Suplementos que consumes" value={form.suplementos}
                onChange={(e) => setForm({...form, suplementos: e.target.value})} className={inputClass} />
              <div className="flex gap-4">
                <button onClick={() => setStep(4)} className={btnBack}>← Atrás</button>
                {/* ✅ FIX 2: Botón dice "Siguiente" no "Enviar" */}
                <button onClick={() => { if (validateStep()) setStep(6) }} className={btnNext}>Siguiente →</button>
              </div>
            </div>
          )}

          {/* STEP 6 */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Último paso</h2>
              <p className="text-sm text-white/70">Este es el punto donde decides si realmente quieres cambiar.</p>
              <label className="text-sm text-white/70">¿Cuál es tu objetivo?</label>
              <select value={form.objetivo}
                onChange={(e) => setForm({...form, objetivo: e.target.value})} className={inputClass}>
                <option value="">Selecciona una opción</option>
                <option>Ganar masa muscular</option>
                <option>Perder grasa</option>
                <option>Recomposición corporal</option>
                <option>Mejorar hábitos</option>
                <option>Otro</option>
              </select>
              <textarea placeholder="¿Por qué quieres lograrlo? (sé específico)" value={form.motivacion}
                onChange={(e) => setForm({...form, motivacion: e.target.value})} className={inputClass} />
              <label className="text-sm text-white/70">¿Qué tan comprometido estás?</label>
              <select value={form.nivelMotivacion}
                onChange={(e) => setForm({...form, nivelMotivacion: e.target.value})} className={inputClass}>
                <option value="">Selecciona nivel</option>
                <option>1-2 (poco compromiso)</option>
                <option>3-5 (intermedio)</option>
                <option>6-8 (alto)</option>
                <option>9-10 (total compromiso)</option>
              </select>
              <textarea placeholder="Algo más que deba saber (si no, escribe NA)" value={form.comentariosFinales}
                onChange={(e) => setForm({...form, comentariosFinales: e.target.value})} className={inputClass} />
              <div className="flex gap-4">
                <button onClick={() => setStep(5)} className={btnBack}>← Atrás</button>
                {/* ✅ FIX 3: handleSubmit valida antes de enviar */}
                <button onClick={handleSubmit} disabled={loading}
                  className="w-full bg-green-500 py-3 rounded font-bold text-black disabled:opacity-50">
                  {loading ? "Enviando..." : "Finalizar y enviar ✓"}
                </button>
              </div>
              <p className="text-center text-xs text-white/50 pt-4">
                No todos completan este proceso. Si lo hiciste, ya estás un paso adelante.
              </p>
            </div>
          )}

        </div> {/* ✅ FIX 1: Aquí cierra correctamente el card principal */}

        {/* TOAST DE NOTIFICACIONES */}
        {toast && (
          <div className={`mt-4 p-4 rounded-lg border text-sm flex gap-3 items-start
            ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : ''}
            ${toast.type === 'error'   ? 'bg-red-500/10   border-red-500/30   text-red-400'   : ''}
            ${toast.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : ''}
          `}>
            <span className="font-bold text-base leading-none mt-0.5">
              {toast.type === 'success' ? '✓' : '!'}
            </span>
            <span>{toast.msg}</span>
          </div>
        )}
        
      </div>
    </div>
  )
}
