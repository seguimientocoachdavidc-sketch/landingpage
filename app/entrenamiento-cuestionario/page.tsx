"use client"

import { useState } from "react"

export default function CuestionarioEntrenamiento() {
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    nombre: "",
    celular: "",
    email: "",
    edad: "",
    peso: "",
    estatura: "",
    eps: "",
    ocupacion: "",

    sueno: "",
    problemaSueno: "",
    horasSentado: "",
    horasActivo: "",
    horasIntenso: "",

    cirugias: "",
    molestias: "",
    detalleMolestia: "",
    dolorPecho: "",

    alcohol: "",
    fumar: "",
    medicamentos: "",

    comidas: "",
    horaPrimera: "",
    horaUltima: "",
    alergias: "",
    suplementos: "",

    lugarEntreno: "",
    experiencia: "",
    frecuencia: "",
    duracion: "",

    ejerciciosMolestos: "",
    ejerciciosNoGusta: "",

    objetivo: "",
    motivacion: "",
    compromiso: "",
    disponibilidad: "",
    expectativas: "",
  })

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    const res = await fetch("/api/entrenamiento", {
      method: "POST",
      body: JSON.stringify(form),
    })

    if (res.ok) {
      alert("Formulario enviado correctamente")
    } else {
      alert("Error al enviar")
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">

      <h1 className="text-4xl font-display text-center mb-10">
        Evaluación de Entrenamiento
      </h1>

      <div className="max-w-2xl mx-auto space-y-6">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <input name="nombre" placeholder="Nombre" onChange={handleChange} required className="input" />
            <input name="celular" placeholder="Celular" onChange={handleChange} className="input" />
            <input name="email" placeholder="Email" onChange={handleChange} className="input" />
            <input name="edad" placeholder="Edad" onChange={handleChange} className="input" />
            <input name="peso" placeholder="Peso" onChange={handleChange} className="input" />
            <input name="estatura" placeholder="Estatura" onChange={handleChange} className="input" />
            <input name="eps" placeholder="EPS" onChange={handleChange} className="input" />
            <input name="ocupacion" placeholder="Ocupación" onChange={handleChange} className="input" />

            <button onClick={() => setStep(2)} className="btn">Siguiente</button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <input name="sueno" placeholder="Horas de sueño" onChange={handleChange} className="input" />
            <input name="horasSentado" placeholder="Horas sentado" onChange={handleChange} className="input" />
            <input name="horasActivo" placeholder="Horas activo" onChange={handleChange} className="input" />
            <input name="horasIntenso" placeholder="Horas intenso" onChange={handleChange} className="input" />

            <button onClick={() => setStep(3)} className="btn">Siguiente</button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <input name="cirugias" placeholder="Cirugías" onChange={handleChange} className="input" />
            <input name="detalleMolestia" placeholder="Molestias" onChange={handleChange} className="input" />
            <input name="medicamentos" placeholder="Medicamentos" onChange={handleChange} className="input" />

            <button onClick={() => setStep(4)} className="btn">Siguiente</button>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-4">
            <input name="lugarEntreno" placeholder="Lugar de entrenamiento" onChange={handleChange} className="input" />
            <input name="experiencia" placeholder="Experiencia" onChange={handleChange} className="input" />
            <input name="frecuencia" placeholder="Frecuencia semanal" onChange={handleChange} className="input" />
            <input name="duracion" placeholder="Duración sesiones" onChange={handleChange} className="input" />

            <button onClick={() => setStep(5)} className="btn">Siguiente</button>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div className="space-y-4">
            <input name="objetivo" placeholder="Objetivo" onChange={handleChange} className="input" />
            <input name="motivacion" placeholder="Motivación" onChange={handleChange} className="input" />
            <input name="compromiso" placeholder="Nivel de compromiso" onChange={handleChange} className="input" />
            <input name="disponibilidad" placeholder="Disponibilidad" onChange={handleChange} className="input" />
            <input name="expectativas" placeholder="Expectativas" onChange={handleChange} className="input" />

            <button onClick={handleSubmit} className="btn bg-red-500">
              Enviar
            </button>
          </div>
        )}

      </div>
    </main>
  )
}
