import { NextResponse } from "next/server"
import { Resend } from "resend"
import { supabase } from "@/lib/supabase"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { token, diaData, totales } = await req.json()

    if (!token || !diaData) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const { nombre, fecha, entradas } = diaData
    const [y, m, d] = fecha.split("-")
    const meses = [
      "enero","febrero","marzo","abril","mayo","junio",
      "julio","agosto","septiembre","octubre","noviembre","diciembre",
    ]
    const fechaLegible = `${d} de ${meses[parseInt(m) - 1]} de ${y}`

    // ── Guardar el registro diario en Supabase (para calcular déficit
    //    semanal real después). Si falla, no bloquea el envío del email.
    const { error: errorRegistro } = await supabase
      .from("registros_diarios_macros")
      .upsert({
        cliente_token: token,
        fecha: fecha,
        kcal_total: totales.kcal,
        proteina_total: totales.proteina,
        lipidos_total: totales.lipidos,
        cho_total: totales.cho,
      }, { onConflict: "cliente_token,fecha" })

    if (errorRegistro) {
      console.error("Error guardando registro diario:", errorRegistro)
      // No se detiene el flujo — el email sigue enviándose normalmente
    }

    // Agrupar por comida
    const porComida = [1,2,3,4,5,6]
      .map(n => ({ num: n, entradas: entradas.filter((e: any) => e.comida === n) }))
      .filter((c: any) => c.entradas.length > 0)

    const tablaComidas = porComida.map((comida: any) => {
      const sub = comida.entradas.reduce((acc: any, e: any) => ({
        kcal:     acc.kcal + e.kcal,
        proteina: Math.round((acc.proteina + e.proteina) * 10) / 10,
        lipidos:  Math.round((acc.lipidos  + e.lipidos)  * 10) / 10,
        cho:      Math.round((acc.cho      + e.cho)      * 10) / 10,
      }), { kcal: 0, proteina: 0, lipidos: 0, cho: 0 })

      const filas = comida.entradas.map((e: any) => `
        <tr>
          <td style="padding:6px 10px;color:#ccc;font-size:13px;">${e.nombreAlimento}</td>
          <td style="padding:6px 10px;text-align:center;color:#aaa;font-size:12px;">${e.gramos}g</td>
          <td style="padding:6px 10px;text-align:center;color:#fff;font-size:12px;">${e.kcal}</td>
          <td style="padding:6px 10px;text-align:center;color:#22c55e;font-size:12px;">${e.proteina}g</td>
          <td style="padding:6px 10px;text-align:center;color:#eab308;font-size:12px;">${e.lipidos}g</td>
          <td style="padding:6px 10px;text-align:center;color:#3b82f6;font-size:12px;">${e.cho}g</td>
        </tr>
      `).join("")

      return `
        <div style="margin-bottom:24px;">
          <div style="background:#1a1a1a;padding:8px 12px;border-left:3px solid #E8000D;margin-bottom:2px;">
            <span style="font-family:Arial;font-size:12px;font-weight:700;color:#E8000D;
              text-transform:uppercase;letter-spacing:0.2em;">
              COMIDA ${comida.num}
            </span>
            <span style="font-family:Arial;font-size:11px;color:#555;margin-left:12px;">
              ${sub.kcal} kcal · P:${sub.proteina}g · L:${sub.lipidos}g · C:${sub.cho}g
            </span>
          </div>
          <table style="width:100%;border-collapse:collapse;background:#111;">
            <thead>
              <tr style="background:#0d0d0d;">
                <th style="padding:6px 10px;text-align:left;font-family:Arial;font-size:10px;
                  color:#555;text-transform:uppercase;letter-spacing:0.15em;">Alimento</th>
                <th style="padding:6px 10px;text-align:center;font-family:Arial;font-size:10px;
                  color:#555;text-transform:uppercase;letter-spacing:0.15em;">Gramos</th>
                <th style="padding:6px 10px;text-align:center;font-family:Arial;font-size:10px;
                  color:#555;text-transform:uppercase;letter-spacing:0.15em;">Kcal</th>
                <th style="padding:6px 10px;text-align:center;font-family:Arial;font-size:10px;
                  color:#22c55e;text-transform:uppercase;letter-spacing:0.15em;">Prot</th>
                <th style="padding:6px 10px;text-align:center;font-family:Arial;font-size:10px;
                  color:#eab308;text-transform:uppercase;letter-spacing:0.15em;">Lip</th>
                <th style="padding:6px 10px;text-align:center;font-family:Arial;font-size:10px;
                  color:#3b82f6;text-transform:uppercase;letter-spacing:0.15em;">Carbs</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
        </div>
      `
    }).join("")

    await resend.emails.send({
      from: "Coach David <onboarding@resend.dev>",
      to: "seguimiento.coachdavidc@gmail.com",
      subject: `📊 Macros — ${nombre} — ${fechaLegible}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#000;">
          <div style="max-width:680px;margin:0 auto;background:#0a0a0a;
            border:1px solid #1a1a1a;">

            <div style="background:#000;border-top:3px solid #E8000D;
              padding:32px 40px 24px;">
              <div style="font-family:Arial;font-size:11px;font-weight:700;
                letter-spacing:0.4em;text-transform:uppercase;color:#E8000D;
                margin-bottom:12px;">
                Diario de macronutrientes
              </div>
              <div style="font-family:Arial;font-size:28px;font-weight:900;
                text-transform:uppercase;color:#fff;margin-bottom:4px;">
                ${nombre}
              </div>
              <div style="font-family:Arial;font-size:13px;color:#555;">
                ${fechaLegible} · ${entradas.length} alimentos registrados
              </div>
            </div>

            <table style="width:100%;border-collapse:collapse;background:#111;
              border-top:1px solid #1a1a1a;border-bottom:1px solid #1a1a1a;">
              <tr>
                <td style="padding:20px;text-align:center;
                  border-right:1px solid #1a1a1a;">
                  <div style="font-family:Arial;font-size:36px;font-weight:900;
                    color:#fff;">${totales.kcal}</div>
                  <div style="font-family:Arial;font-size:10px;color:#555;
                    text-transform:uppercase;letter-spacing:0.15em;margin-top:4px;">
                    Calorías
                  </div>
                </td>
                <td style="padding:20px;text-align:center;
                  border-right:1px solid #1a1a1a;">
                  <div style="font-family:Arial;font-size:36px;font-weight:900;
                    color:#22c55e;">${totales.proteina}g</div>
                  <div style="font-family:Arial;font-size:10px;color:#555;
                    text-transform:uppercase;letter-spacing:0.15em;margin-top:4px;">
                    Proteína
                  </div>
                </td>
                <td style="padding:20px;text-align:center;
                  border-right:1px solid #1a1a1a;">
                  <div style="font-family:Arial;font-size:36px;font-weight:900;
                    color:#eab308;">${totales.lipidos}g</div>
                  <div style="font-family:Arial;font-size:10px;color:#555;
                    text-transform:uppercase;letter-spacing:0.15em;margin-top:4px;">
                    Lípidos
                  </div>
                </td>
                <td style="padding:20px;text-align:center;">
                  <div style="font-family:Arial;font-size:36px;font-weight:900;
                    color:#3b82f6;">${totales.cho}g</div>
                  <div style="font-family:Arial;font-size:10px;color:#555;
                    text-transform:uppercase;letter-spacing:0.15em;margin-top:4px;">
                    Carbos
                  </div>
                </td>
              </tr>
            </table>

            <div style="padding:24px 40px;">
              ${tablaComidas}
            </div>

            <div style="padding:16px 40px;border-top:1px solid #1a1a1a;">
              <span style="font-family:Arial;font-size:11px;color:#333;">
                Coach David · ${fechaLegible}
              </span>
            </div>

          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("Error cerrando día:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
