"use client"

import { useState } from "react"

export default function NutricionCuestionario() {

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    nombre: "",
    celular: "",
    eps: "",
    peso: "",
    altura: "",
    edad: "",

    sueno: "",
    problemasSueno: "",
    sedentario: "",
    actividadLigera: "",
    actividadFisica: "",
  })

  // VALIDACIÓN
  const validateStep = () => {
    if (step === 1) {
      if (!form.nombre || !form.celular || !form.peso || !form.altura || !form.edad) {
        alert("Completa todos los datos básicos")
        return false
      }
    }

    if (step === 2) {
      if (!form.sueno || !form.sedentario || !form.actividadFisica) {
        alert("Completa la información de estilo de vida")
        return false
      }
    }

    return true
  }

  // SUBMIT FINAL
  const handleSubmit = async () => {
    setLoading(true)

    try {
      const res = await fetch("/api/nutricion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        alert("Formulario enviado correctamente")
      } else {
        alert("Error al enviar el formulario")
      }

    } catch (error) {
      console.error(error)
      alert("Error de conexión")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex items-center justify-center px-4">

      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl">

        {/* PROGRESS BAR */}
        <div className="w-full bg-white/10 h-2 rounded-full mb-6">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Datos básicos</h2>

            <input placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full p-3 bg-black/40 border border-white/20 rounded"
            />

            <input placeholder="Celular"
              value={form.celular}
              onChange={(e) => setForm({ ...form, celular: e.target.value })}
              className="w-full p-3 bg-black/40 border border-white/20 rounded"
            />

            <input placeholder="EPS"
              value={form.eps}
              onChange={(e) => setForm({ ...form, eps: e.target.value })}
              className="w-full p-3 bg-black/40 border border-white/20 rounded"
            />

            <input placeholder="Peso (kg)"
              value={form.peso}
              onChange={(e) => setForm({ ...form, peso: e.target.value })}
              className="w-full p-3 bg-black/40 border border-white/20 rounded"
            />

            <input placeholder="Altura (cm)"
              value={form.altura}
              onChange={(e) => setForm({ ...form, altura: e.target.value })}
              className="w-full p-3 bg-black/40 border border-white/20 rounded"
            />

            <input placeholder="Edad"
              value={form.edad}
              onChange={(e) => setForm({ ...form, edad: e.target.value })}
              className="w-full p-3 bg-black/40 border border-white/20 rounded"
            />

            <button
              onClick={() => {
                if (validateStep()) setStep(2)
              }}
              className="w-full bg-primary py-3 rounded font-bold"
            >
              Siguiente
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Estilo de vida</h2>

            <input placeholder="¿Cuántas horas duermes?"
              value={form.sueno}
              onChange={(e) => setForm({ ...form, sueno: e.target.value })}
              className="w-full p-3 bg-black/40 border border-white/20 rounded"
            />

            <input placeholder="Horas sedentario"
              value={form.sedentario}
              onChange={(e) => setForm({ ...form, sedentario: e.target.value })}
              className="w-full p-3 bg-black/40 border border-white/20 rounded"
            />

            <input placeholder="Horas de actividad física"
              value={form.actividadFisica}
              onChange={(e) => setForm({ ...form, actividadFisica: e.target.value })}
              className="w-full p-3 bg-black/40 border border-white/20 rounded"
            />

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="w-full border border-white/20 py-3 rounded"
              >
                Atrás
              </button>

              <button
                onClick={handleSubmit}
                className="w-full bg-green-500 py-3 rounded font-bold"
              >
                {loading ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
