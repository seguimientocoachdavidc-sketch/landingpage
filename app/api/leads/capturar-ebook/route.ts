import { NextResponse } from "next/server"
import { Resend } from "resend"
import { supabase } from "@/lib/supabase"

const resend = new Resend(process.env.RESEND_API_KEY)

// ============================================================
// Mapeo de ebooks disponibles — agrega uno nuevo aquí cuando
// tengas el segundo ("Ciencia vs Experiencia")
// ============================================================
const EBOOKS: Record<string, { titulo: string; archivo: string }> = {
  "hipertrofia-basada-en-ciencia": {
    titulo: "Hipertrofia Basada en Ciencia",
    archivo: "/ebooks/hipertrofia-basada-en-ciencia.pdf",
  },
}

export async function POST(req: Request) {
  try {
    const { ebook, nombre, email, whatsapp } = await req.json()

    if (!ebook || !nombre || !email || !whatsapp) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const info = EBOOKS[ebook]
    if (!info) {
      return NextResponse.json({ error: "Ebook no reconocido" }, { status: 400 })
    }

    // 1. Guardar el lead en Supabase
    const { error: insertError } = await supabase
      .from("leads_ebook")
      .insert({ ebook, nombre, email, whatsapp })

    if (insertError) {
      console.error("Error guardando lead:", insertError)
      return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }

    // 2. Link completo de descarga
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://coachdavidfitness.com"
    const linkDescarga = `${baseUrl}${info.archivo}`

    // 3. Enviar el correo con el link (si falla, el lead ya quedó
    //    guardado y la página igual muestra el botón de descarga directa)
    try {
      await resend.emails.send({
        from: "Coach David <onboarding@resend.dev>",
        to: email,
        subject: `📘 Tu ebook "${info.titulo}" ya está listo`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#000;font-family:Arial,sans-serif;">
            <div style="max-width:560px;margin:0 auto;background:#0a0a0a;border:1px solid #1a1a1a;padding:40px 32px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#E8000D;margin-bottom:16px;">
                Coach David
              </div>
              <h1 style="font-size:24px;color:#fff;margin:0 0 16px;">¡Hola ${nombre}!</h1>
              <p style="font-size:15px;color:#aaa;line-height:1.6;margin-bottom:24px;">
                Gracias por tu interés — aquí tienes tu copia de <strong style="color:#fff;">"${info.titulo}"</strong>.
              </p>
              <a href="${linkDescarga}" style="display:inline-block;background:#E8000D;color:#fff;padding:14px 28px;text-decoration:none;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;font-size:14px;">
                Descargar PDF →
              </a>
              <p style="font-size:12px;color:#555;margin-top:32px;">
                Si tienes dudas sobre entrenamiento o alimentación, escríbenos por WhatsApp.
              </p>
            </div>
          </body>
          </html>
        `,
      })
    } catch (emailError) {
      console.error("Error enviando correo (el lead sí quedó guardado):", emailError)
    }

    // 4. Devolver el link para que la página muestre el botón de
    //    descarga inmediata también, sin depender de que revisen el correo
    return NextResponse.json({ ok: true, link: linkDescarga })

  } catch (error) {
    console.error("Error procesando lead de ebook:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
