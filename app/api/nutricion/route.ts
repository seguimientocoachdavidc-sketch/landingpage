import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const data = await request.json()

    const {
      nombre,
      celular,
      eps,
      peso,
      altura,
      edad,
      sueno,
      sedentario,
      actividadFisica,
    } = data

    // VALIDACIÓN (adaptada a tu nuevo form)
    if (!nombre || !celular || !peso || !altura || !edad) {
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
          
          <h2>Nueva Evaluación Nutricional</h2>

          <h3>Datos básicos</h3>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Celular:</strong> ${celular}</p>
          <p><strong>EPS:</strong> ${eps}</p>
          <p><strong>Peso:</strong> ${peso} kg</p>
          <p><strong>Altura:</strong> ${altura} cm</p>
          <p><strong>Edad:</strong> ${edad}</p>

          <hr />

          <h3>Estilo de vida</h3>
          <p><strong>Sueño:</strong> ${sueno}</p>
          <p><strong>Horas sedentario:</strong> ${sedentario}</p>
          <p><strong>Actividad física:</strong> ${actividadFisica}</p>

        </div>
      `,
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error sending email:', error)

    return NextResponse.json(
      { error: 'Error al enviar el formulario' },
      { status: 500 }
    )
  }
}
