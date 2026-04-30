import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { name, email, phone, goal } = await request.json()

    if (!name || !email || !phone || !goal) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    await resend.emails.send({
      from: 'Coach David Website <onboarding@resend.dev>',
      to: 'seguimiento.coachdavidc@gmail.com',
      subject: `Nuevo Diligenciamiento Cuestionario nutrición - ${name}`,
        html: `
          <h2>Nueva evaluación nutricional</h2>
        
          <p><strong>Nombre:</strong> ${data.nombre}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Objetivo:</strong> ${data.objetivo}</p>
          <p><strong>Alergias:</strong> ${data.alergias}</p>
          <p><strong>Comidas:</strong> ${data.comidas}</p>
          <p><strong>Horario:</strong> ${data.horario}</p>
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

