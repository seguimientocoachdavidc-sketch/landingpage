"use client"

import { useState } from "react"

export default function Calculadora() {
  const [form, setForm] = useState({
    sexo: "",
    peso: "",
    altura: "",
    edad: "",
    actividad: "",
  })

  const [resultado, setResultado] = useState<any>(null)

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const calcular = () => {
    const { sexo, peso, altura, edad, actividad } = form

    if (!sexo || !peso || !altura || !edad || !actividad) {
      alert("Completa todos los campos")
      return
    }

    let tmb = 0

    if (sexo === "hombre") {
      tmb = 10 * peso + 6.25 * altura - 5 * edad + 5
    } else {
      tmb = 10 * peso + 6.25 * altura - 5 * edad - 161
    }

    const factores: any = {
      ligera: 1.2,
      moderada: 1.375,
      activa: 1.55,
      muy_activa: 1.725,
      extrema: 1.9,
    }

    const gasto = tmb * factores[actividad]

    setResultado({
      tmb: Math.round(tmb),
      gasto: Math.round(gasto),
    })
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">

      {/* HERO */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-display uppercase">
          Calculadora<br />
          <span className="text-red-500">Gasto Energético</span>
        </h1>

        <p className="mt-6 text-white/60">
          Descubre cuántas calorías necesitas realmente para alcanzar tu objetivo.
        </p>
      </div>

      {/* FORM */}
      <div className="max-w-xl mx-auto mt-16 space-y-6">

        {/* SEXO */}
        <select name="sexo" onChange={handleChange} className="input">
          <option value="">Sexo</option>
          <option value="hombre">Hombre</option>
          <option value="mujer">Mujer</option>
        </select>

        <input name="peso" type="number" placeholder="Peso (kg)" onChange={handleChange} className="input" />
        <input name="altura" type="number" placeholder="Altura (cm)" onChange={handleChange} className="input" />
        <input name="edad" type="number" placeholder="Edad" onChange={handleChange} className="input" />

        {/* ACTIVIDAD */}
        <select name="actividad" onChange={handleChange} className="input">
          <option value="">Nivel de actividad</option>
          <option value="ligera">Muy ligera (poco o ningún ejercicio)</option>
          <option value="moderada">Ligera (1-3 días/semana)</option>
          <option value="activa">Moderada (3-5 días/semana)</option>
          <option value="muy_activa">Activa (6-7 días)</option>
          <option value="extrema">Muy activa (doble sesión / físico demandante)</option>
        </select>

        <button onClick={calcular} className="btn bg-red-500">
          Calcular
        </button>
      </div>

      {/* RESULTADO */}
      {resultado && (
        <div className="max-w-xl mx-auto mt-16 p-8 border border-white/10 bg-white/5 text-center">

          <h2 className="text-3xl font-display uppercase mb-6">
            Tus resultados
          </h2>

          <p className="text-white/70">
            Tasa metabólica basal:
          </p>
          <div className="text-4xl text-red-500 font-bold">
            {resultado.tmb} kcal
          </div>

          <p className="text-white/70 mt-6">
            Gasto energético diario:
          </p>
          <div className="text-5xl text-white font-bold">
            {resultado.gasto} kcal
          </div>

          {/* CTA */}
          <div className="mt-10">
            <p className="text-white/60 mb-4">
              Esto es solo el punto de partida.
              <br />
              Si quieres resultados reales…
            </p>

            <a
              href="/asesoria"
              className="inline-block bg-red-500 px-8 py-4 font-bold uppercase hover:scale-105 transition"
            >
              Aplicar a asesoría
            </a>
          </div>

        </div>
      )}

    </main>
  )
}
