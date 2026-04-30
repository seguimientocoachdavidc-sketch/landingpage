import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const data = await request.json()

    const {
      // STEP 1
      nombre,
      celular,
      eps,
      peso,
      altura,
      edad,

      // STEP 2
      sueno,
      problemasSueno,
      sedentario,
      actividadLigera,
      actividadFisica,

      // STEP 3
      experiencia,
      frecuencia,
      alcohol,
      fumar,

      // STEP 4
      enfermedades,
      patologias,
      restricciones,

      // STEP 5
      comidasDia,
      primeraComida,
      ultimaComida,
      proteinas,
      vegetales,
      frutas,
      carbs,
      comidaRapida,
      legumbres,
      noGusta,
      restriccionesExtra,
      suplementos,

    } = data

    // VALIDACIÓN MÍNIMA (puedes endurecer luego)
    if (!nombre || !celular || !peso || !altura || !edad) {
      return NextResponse.json(
        { error: 'Faltan datos básicos' },
        { status: 400 }
      )
    }

    await resend.emails.send({
      from: 'Coach David Website <onboarding@resend.dev>',
      to: 'seguimiento.coachdavidc@gmail.com',
      subject: `Nuevo cuestionario nutrición - ${nombre}`,

      html: `
      <div style="font-family: Arial; max-width: 700px; margin: auto;">

        <h2>Nuevo cliente - Evaluación completa</h2>

        <h3>Datos básicos</h3>
        <p><b>Nombre:</b> ${nombre}</p>
        <p><b>Celular:</b> ${celular}</p>
        <p><b>EPS:</b> ${eps}</p>
        <p><b>Peso:</b> ${peso} kg</p>
        <p><b>Altura:</b> ${altura} cm</p>
        <p><b>Edad:</b> ${edad}</p>

        <hr/>

        <h3>Estilo de vida</h3>
        <p><b>Sueño:</b> ${sueno}</p>
        <p><b>Problemas sueño:</b> ${problemasSueno}</p>
        <p><b>Horas sedentario:</b> ${sedentario}</p>
        <p><b>Actividad ligera:</b> ${actividadLigera}</p>
        <p><b>Actividad física:</b> ${actividadFisica}</p>

        <hr/>

        <h3>Entrenamiento</h3>
        <p><b>Experiencia:</b> ${experiencia}</p>
        <p><b>Frecuencia:</b> ${frecuencia}</p>
        <p><b>Alcohol:</b> ${alcohol}</p>
        <p><b>Fumar:</b> ${fumar}</p>

        <hr/>

        <h3>Salud</h3>
        <p><b>Enfermedades:</b> ${enfermedades}</p>
        <p><b>Patologías:</b> ${patologias}</p>
        <p><b>Restricciones:</b> ${restricciones}</p>

        <hr/>

        <h3>Nutrición</h3>
        <p><b>Comidas al día:</b> ${comidasDia}</p>
        <p><b>Primera comida:</b> ${primeraComida}</p>
        <p><b>Última comida:</b> ${ultimaComida}</p>

        <p><b>Proteínas:</b> ${proteinas}</p>
        <p><b>Vegetales:</b> ${vegetales}</p>
        <p><b>Frutas:</b> ${frutas}</p>
        <p><b>Carbs:</b> ${carbs}</p>
        <p><b>Comida rápida:</b> ${comidaRapida}</p>
        <p><b>Legumbres:</b> ${legumbres}</p>

        <p><b>No le gusta:</b> ${noGusta}</p>
        <p><b>Restricciones extra:</b> ${restriccionesExtra}</p>
        <p><b>Suplementos:</b> ${suplementos}</p>

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
