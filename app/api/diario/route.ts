import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const data = await request.json()

    const {
      nombre,
      fecha,
      comida1,
      comida2,
      comida3,
      comida4,
      comida5
    } = data

    // VALIDACIÓN
    if (
      !nombre ||
      !fecha ||
      !comida1 ||
      !comida2 ||
      !comida3 ||
      !comida4 ||
      !comida5
    ) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      )
    }

    await resend.emails.send({
      from: 'Coach David Website <onboarding@resend.dev>',
      to: 'seguimiento.coachdavidc@gmail.com',
      subject: `📊 Diario - ${nombre} - ${fecha}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          
          <h2 style="color: #dc2626;">Nuevo Diario de Comidas</h2>
          
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Fecha:</strong> ${fecha}</p>

          <hr/>

          <p><strong>Comida 1:</strong><br/>${comida1}</p>
          <p><strong>Comida 2:</strong><br/>${comida2}</p>
          <p><strong>Comida 3:</strong><br/>${comida3}</p>
          <p><strong>Comida 4:</strong><br/>${comida4}</p>
          <p><strong>Comida 5:</strong><br/>${comida5}</p>

        </div>
      `,
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error:', error)

    return NextResponse.json(
      { error: 'Error al enviar el diario' },
      { status: 500 }
    )
  }
}
