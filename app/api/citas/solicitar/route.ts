import { NextResponse } from "next/server"
import { Resend } from "resend"
import { supabase } from "@/lib/supabase"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { token, nombre, fecha, hora, duracion_horas, nota } = await req.json()

    if (!token || !fecha || !hora) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    // 1. Guardar la solicitud en Supabase
    const { error: insertError } = await supabase
      .from("citas_presenciales")
      .insert({ cliente_token: token, fecha, hora, duracion_horas: duracion_horas || 1, nota: nota || null })

    if (insertError) {
      console.error("Error guardando cita:", insertError)
      return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }

    // 2. Formatear fecha legible para el correo
    const [y, m, d] = fecha.split("-")
    const meses = ["enero","febrero","marzo","abril","mayo","junio",
      "julio","agosto","septiembre","octubre","noviembre","diciembre"]
    const fechaLegible = `${d} de ${meses[parseInt(m) - 1]} de ${y}`

    // 3. Enviar notificación por correo (si falla, la cita ya quedó
    //    guardada de todas formas — no se pierde la solicitud)
    try {
      await resend.emails.send({
        from: "Coach David <onboarding@resend.dev>",
        to: "seguimiento.coachdavidc@gmail.com",
        subject: `📅 Nueva solicitud de cita — ${nombre}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#000;font-family:Arial,sans-serif;">
            <div style="max-width:560px;margin:0 auto;background:#0a0a0a;border:1px solid #1a1a1a;padding:40px 32px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#E8000D;margin-bottom:16px;">
                Nueva solicitud
              </div>
              <h1 style="font-size:24px;color:#fff;margin:0 0 20px;">📅 Cita presencial</h1>
              <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                <tr>
                  <td style="padding:8px 0;color:#888;font-size:13px;">Cliente</td>
                  <td style="padding:8px 0;color:#fff;font-size:14px;font-weight:600;">${nombre}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#888;font-size:13px;">Fecha solicitada</td>
                  <td style="padding:8px 0;color:#fff;font-size:14px;font-weight:600;">${fechaLegible}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#888;font-size:13px;">Hora solicitada</td>
                  <td style="padding:8px 0;color:#fff;font-size:14px;font-weight:600;">${hora}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#888;font-size:13px;">Duración</td>
                  <td style="padding:8px 0;color:#fff;font-size:14px;font-weight:600;">${duracion_horas || 1} ${(duracion_horas || 1) === 1 ? "hora" : "horas"}</td>
                </tr>
                ${nota ? `
                <tr>
                  <td style="padding:8px 0;color:#888;font-size:13px;vertical-align:top;">Nota</td>
                  <td style="padding:8px 0;color:#fff;font-size:14px;">${nota}</td>
                </tr>` : ""}
              </table>
              <p style="font-size:13px;color:#888;line-height:1.6;">
                Verifica si esta fecha y hora te funcionan, y confirma directamente con el cliente.
              </p>
            </div>
          </body>
          </html>
        `,
      })
    } catch (emailError) {
      console.error("Error enviando correo de cita (la solicitud sí quedó guardada):", emailError)
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("Error procesando solicitud de cita:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
