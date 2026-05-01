import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const data = await request.json()

    const {
      nombre, celular, eps, peso, altura, edad,
      sueno, problemasSueno, sedentario, actividadLigera, actividadFisica,
      experiencia, frecuencia, alcohol, fumar,
      enfermedades, patologias, restricciones,
      comidasDia, primeraComida, ultimaComida,
      proteinas, vegetales, frutas, carbs,
      comidaRapida, legumbres, noGusta,
      restriccionesExtra, suplementos,
      objetivo, motivacion, nivelMotivacion, comentariosFinales,
    } = data

    if (!nombre || !celular || !peso || !altura || !edad) {
      return NextResponse.json(
        { error: 'Faltan datos básicos' },
        { status: 400 }
      )
    }

    // Helper para evitar "undefined" en el email
    const v = (val: string | undefined) => val || 'No indicó'

    await resend.emails.send({
      // ✅ FIX 1: Email sin formato Markdown
      from: 'Coach David Website <onboarding@resend.dev>',
      // ✅ FIX 2: Email destino limpio, sin Markdown
      to: 'seguimiento.coachdavidc@gmail.com',
      subject: `Nuevo cuestionario nutrición - ${nombre}`,
      html: `
        <div style="font-family: Arial; max-width: 700px; margin: auto; color: #111;">
          <h2 style="border-bottom: 2px solid #eee; padding-bottom: 8px;">
            Nuevo cliente — Evaluación completa
          </h2>

          <h3>Datos básicos</h3>
          <p><b>Nombre:</b> ${v(nombre)}</p>
          <p><b>Celular:</b> ${v(celular)}</p>
          <p><b>EPS:</b> ${v(eps)}</p>
          <p><b>Peso:</b> ${v(peso)} kg</p>
          <p><b>Altura:</b> ${v(altura)} cm</p>
          <p><b>Edad:</b> ${v(edad)}</p>

          <hr/>
          <h3>Estilo de vida</h3>
          <p><b>Sueño:</b> ${v(sueno)}</p>
          <p><b>Problemas de sueño:</b> ${v(problemasSueno)}</p>
          <p><b>Horas sedentario:</b> ${v(sedentario)}</p>
          <p><b>Actividad ligera:</b> ${v(actividadLigera)}</p>
          <p><b>Actividad física:</b> ${v(actividadFisica)}</p>

          <hr/>
          <h3>Entrenamiento</h3>
          <p><b>Experiencia:</b> ${v(experiencia)}</p>
          <p><b>Frecuencia:</b> ${v(frecuencia)}</p>
          <p><b>Alcohol:</b> ${v(alcohol)}</p>
          <p><b>Fumar:</b> ${v(fumar)}</p>

          <hr/>
          <h3>Salud</h3>
          <p><b>Enfermedades:</b> ${v(enfermedades)}</p>
          <p><b>Patologías:</b> ${v(patologias)}</p>
          <p><b>Restricciones:</b> ${v(restricciones)}</p>

          <hr/>
          <h3>Nutrición</h3>
          <p><b>Comidas al día:</b> ${v(comidasDia)}</p>
          <p><b>Primera comida:</b> ${v(primeraComida)}</p>
          <p><b>Última comida:</b> ${v(ultimaComida)}</p>
          <p><b>Proteínas favoritas:</b> ${v(proteinas)}</p>
          <p><b>Vegetales:</b> ${v(vegetales)}</p>
          <p><b>Frutas:</b> ${v(frutas)}</p>
          <p><b>Carbohidratos:</b> ${v(carbs)}</p>
          <p><b>Comida rápida:</b> ${v(comidaRapida)}</p>
          <p><b>Legumbres:</b> ${v(legumbres)}</p>
          <p><b>No le gusta:</b> ${v(noGusta)}</p>
          <p><b>Restricciones extra:</b> ${v(restriccionesExtra)}</p>
          <p><b>Suplementos:</b> ${v(suplementos)}</p>

          <hr/>
          <h3>Objetivo y mentalidad</h3>
          <p><b>Objetivo:</b> ${v(objetivo)}</p>
          <p><b>Motivación:</b> ${v(motivacion)}</p>
          <p><b>Nivel de compromiso:</b> ${v(nivelMotivacion)}</p>
          <p><b>Comentarios:</b> ${v(comentariosFinales)}</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al enviar formulario' },
      { status: 500 }
    )
  }
}
