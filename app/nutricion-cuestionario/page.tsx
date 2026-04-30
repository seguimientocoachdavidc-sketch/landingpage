"use client"

import { useState } from "react"

export default function NutricionForm() {

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    objetivo: "",
    alergias: "",
    comidas: "",
    horario: "",
  })

  const [loading, setLoading] = useState(false)

const handleSubmit = async (e: any) => {
  e.preventDefault()
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
      setForm({
        nombre: "",
        email: "",
        objetivo: "",
        alergias: "",
        comidas: "",
        horario: "",
      })
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
    <main className="min-h-screen px-6 py-24">

      <div className="max-w-3xl mx-auto">

        <h1 className="font-display text-4xl md:text-6xl uppercase">
          Evaluación Nutricional
        </h1>

        <p className="mt-4 text-muted-foreground">
          Completa este formulario para diseñar tu plan de alimentación personalizado.
        </p>

        <form onSubmit={handleSubmit} className="mt-12 space-y-6">

          <input
            placeholder="Nombre"
            className="w-full border p-3"
            value={form.nombre}
            onChange={(e) => setForm({...form, nombre: e.target.value})}
          />

          <input
            placeholder="Email"
            className="w-full border p-3"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
          />

          <textarea
            placeholder="¿Cuál es tu objetivo?"
            className="w-full border p-3"
            value={form.objetivo}
            onChange={(e) => setForm({...form, objetivo: e.target.value})}
          />

          <textarea
            placeholder="¿Tienes alergias o restricciones?"
            className="w-full border p-3"
            value={form.alergias}
            onChange={(e) => setForm({...form, alergias: e.target.value})}
          />

          <textarea
            placeholder="Comidas que te gustan / no te gustan"
            className="w-full border p-3"
            value={form.comidas}
            onChange={(e) => setForm({...form, comidas: e.target.value})}
          />

          <textarea
            placeholder="Describe tu horario diario"
            className="w-full border p-3"
            value={form.horario}
            onChange={(e) => setForm({...form, horario: e.target.value})}
          />

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 font-bold"
          >
            {loading ? "Enviando..." : "Enviar evaluación"}
          </button>

        </form>

      </div>

    </main>
  )
}
