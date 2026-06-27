import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { nombre, token, resultados, nota } = await req.json()

    if (!resultados || !Array.isArray(resultados)) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const filas = resultados.map((r: any) => `
      <tr>
        <td style="padding:10px 14px;color:#fff;font-size:14px;border-bottom:1px solid #1a1a1a;">${r.prueba}</td>
        <td style="padding:10px 14px;text-align:center;color:#22c55e;font-size:18px;font-weight:900;border-bottom:1px solid #1a1a1a;">${r.reps}</td>
      </tr>
    `).join("")

    await resend.emails.send({
      from: "Coach David <onboarding@resend.dev>",
      to: "seguimiento.coachdavidc@gmail.com",
      subject: `🧪 Valoración física — ${nombre}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#000;">
          <div style="max-width:600px;margin:0 auto;background:#0a0a0a;border:1px solid #1a1a1a;">

            <div style="background:#000;border-top:3px solid #E8000D;padding:28px 36px 22px;">
              <div style="font-family:Arial;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#E8000D;margin-bottom:10px;">
                Resultados de valoración física
              </div>
              <div style="font-family:Arial;font-size:26px;font-weight:900;text-transform:uppercase;color:#fff;">
                ${nombre}
              </div>
              ${token ? `<div style="font-family:Arial;font-size:12px;color:#555;margin-top:4px;">Token: ${token}</div>` : ""}
            </div>

            <div style="padding:24px 36px;">
              <table style="width:100%;border-collapse:collapse;background:#111;">
                <thead>
                  <tr style="background:#0d0d0d;">
                    <th style="padding:10px 14px;text-align:left;font-family:Arial;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.15em;">Prueba</th>
                    <th style="padding:10px 14px;text-align:center;font-family:Arial;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.15em;">Reps en 1 min</th>
                  </tr>
                </thead>
                <tbody>${filas}</tbody>
              </table>

              ${nota ? `
                <div style="margin-top:20px;padding:14px 16px;background:rgba(232,0,13,0.06);border-left:3px solid #E8000D;">
                  <div style="font-family:Arial;font-size:10px;color:#E8000D;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:6px;">Nota del cliente</div>
                  <div style="font-family:Arial;font-size:13px;color:#ccc;line-height:1.6;">${nota}</div>
                </div>
              ` : ""}
            </div>

            <div style="padding:14px 36px;border-top:1px solid #1a1a1a;">
              <span style="font-family:Arial;font-size:11px;color:#333;">Coach David · Protocolo de valoración inicial</span>
            </div>

          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("Error enviando valoración:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
