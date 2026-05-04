import { Resend } from "resend"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const data = await req.json()

  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: "Coach David <onboarding@resend.dev>",
    to: "seguimiento.coachdavidc@gmail.com",
    subject: "Nuevo cuestionario de entrenamiento",
    html: `
      <h2>Nuevo cliente</h2>
      <p><b>Nombre:</b> ${data.nombre}</p>
      <p><b>Email:</b> ${data.email}</p>
      <p><b>Objetivo:</b> ${data.objetivo}</p>
      <p><b>Motivación:</b> ${data.motivacion}</p>
      <p><b>Disponibilidad:</b> ${data.disponibilidad}</p>
    `,
  })

  return NextResponse.json({ ok: true })
}
