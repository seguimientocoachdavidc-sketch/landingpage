import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const data = await request.json()

    const {
      nombre,
      email,
      objetivo,
      alergias,
      comidas,
      horario,
    } = data

    // VALIDACIÓN
    if (!nombre || !email || !objetivo) {
      return NextResponse.json(
        { error: 'Campos obligatorios incompletos' },
        { status: 400 }
      )
    }

    await resend.emails.send({
      from: 'Coach David Website <onboarding@resend.dev>',
      to: 'seguimiento.coachdavidc@gmail.com',
      subject: `Nueva evaluación nutricional - ${nombre}`,

      html: `
        <div style="font-family: Arial; max-width: 600px; margin: auto;">
          
          <h2 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">
            Nueva Evaluación Nutricional
          </h2>

          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>

          <hr />

          <p><strong>Objetivo:</strong><br/> ${objetivo || "No especificado"}</p>
          <p><strong>Alergias:</strong><br/> ${alergias || "Ninguna"}</p>
          <p><strong>Comidas:</strong><br/> ${comidas || "No especificado"}</p>
          <p><strong>Horario:</strong><br/> ${horario || "No especificado"}</p>

        </div>
      `,
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error sending email:', error)

    return NextResponse.json(
      { error: 'Error al enviar el mensaje' },
      { status: 500 }
    )
  }
}
