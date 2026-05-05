"use client"
import { useState } from "react"

export default function DiarioComidas() {

  const hoy = new Date().toISOString().split("T")[0]

  const [form, setForm] = useState({
    nombre: "",
    fecha: hoy,
    comida1: "",
    comida2: "",
    comida3: "",
    comida4: "",
    comida5: ""
  })

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

const handleSubmit = async (e) => {
  e.preventDefault()

  const res = await fetch("/api/diario", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(form)
  })

  if (res.ok) {
    alert("Diario enviado ✅")
  } else {
    alert("Error ❌")
  }
}

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">

      {/* HEADER */}
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold uppercase">
          Diario de comidas
        </h1>

        <p className="mt-4 text-white/70">
          Diligencia tu diario de comidas para avanzar correctamente en tu plan de alimentación.
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto mt-12 space-y-6"
      >

        {/* NOMBRE */}
        <div>
          <label className="block text-sm text-white/60 mb-2">
            Nombre completo *
          </label>
          <input
            type="text"
            name="nombre"
            required
            value={form.nombre}
            onChange={handleChange}
            className="w-full p-4 bg-white/10 border border-white/20"
          />
        </div>

        {/* FECHA */}
        <div>
          <label className="block text-sm text-white/60 mb-2">
            Fecha *
          </label>
          <input
            type="date"
            name="fecha"
            required
            value={form.fecha}
            onChange={handleChange}
            className="w-full p-4 bg-white/10 border border-white/20"
          />
        </div>

        {/* COMIDAS */}
        {[1,2,3,4,5].map((num) => (
          <div key={num}>
            <label className="block text-sm text-white/60 mb-2">
              Comida {num} *
            </label>

            <textarea
              name={`comida${num}`}
              required
              value={form[`comida${num}`]}
              onChange={handleChange}
              placeholder="Ej: 150g pollo + 100g arroz + ensalada..."
              className="w-full p-4 bg-white/10 border border-white/20 min-h-[100px]"
            />
          </div>
        ))}

        {/* BOTÓN */}
        <button
          type="submit"
          className="w-full bg-red-500 py-4 font-bold uppercase hover:bg-red-600 transition"
        >
          Registrar diario
        </button>

      </form>

    </main>
  )
}
