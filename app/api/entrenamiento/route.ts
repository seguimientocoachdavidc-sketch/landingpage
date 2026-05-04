import { Resend } from "resend"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Helper: evita "undefined" en el email
    const v = (val: string | undefined) => val?.trim() || "No indicó"

    const {
      // STEP 1
      nombre, celular, email, edad, peso, estatura, eps, ocupacion,
      // STEP 2
      horasSueno, problemasSueno, horasSentado, horasMovimiento, horasIntensas,
      // STEP 3
      cirugia, molestiaOsteomuscular, detalleMolestia,
      antecedentesDeportivos, detallDeportivos,
      antecedentesFamiliares, detalleFamiliares,
      antecedentesMetabolicos,
      alcohol, fumar, otrasSustancias, medicamentos, molestiasPecho,
      // STEP 4
      comidasDia, primeraComida, ultimaComida,
      alergiasComida, detalleAlergias,
      proteinas, carbohidratos, frutas, vegetales, legumbres,
      comidasNoGustan, comidasNoPuede, suplementacion,
      // STEP 5
      espacioEntrenamiento, equiposCasa,
      actividadFisica, tiempoEntrenando, consistencia,
      frecuenciaEjercicio, duracionSesion,
      ejerciciosPectoral, ejerciciosEspalda, ejerciciosBrazo,
      ejerciciosDeltoides, ejerciciosIsquios, ejerciciosCuadriceps,
      ejerciciosGluteo, ejerciciosMolestan, ejerciciosNoGustan,
      bandasResistencia, cardio, dispositivoFC,
      // STEP 6
      objetivo, otraObjetivo, motivacion, nivelMotivacion,
      disponibilidadHorario, expectativas, comentariosAdicionales,
    } = data

    // Validación mínima
    if (!nombre || !celular || !email) {
      return NextResponse.json(
        { error: "Faltan datos básicos" },
        { status: 400 }
      )
    }

    const R = "#E8000D"

    const section = (title: string, content: string) => `
      <tr>
        <td colspan="2" style="padding: 28px 0 12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:4px; height:4px; background:${R}; transform:rotate(45deg);"></div>
            <span style="font-family: Arial, sans-serif; font-size:11px; font-weight:700; letter-spacing:0.3em; text-transform:uppercase; color:#555;">
              ${title}
            </span>
            <div style="flex:1; height:1px; background:#222;"></div>
          </div>
        </td>
      </tr>
      ${content}
    `

    const row = (label: string, value: string) => `
      <tr>
        <td style="padding: 8px 16px 8px 0; font-family: Arial, sans-serif; font-size:12px; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:0.1em; vertical-align:top; white-space:nowrap; width:220px;">
          ${label}
        </td>
        <td style="padding: 8px 0; font-family: Arial, sans-serif; font-size:14px; color:#ddd; vertical-align:top; border-bottom: 1px solid #1a1a1a;">
          ${value}
        </td>
      </tr>
    `

    await resend.emails.send({
      from: "Coach David <onboarding@resend.dev>",
      to: "seguimiento.coachdavidc@gmail.com",
      subject: `Nuevo cuestionario de entrenamiento — ${v(nombre)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8" /></head>
        <body style="margin:0; padding:0; background:#000;">

          <div style="max-width:720px; margin:0 auto; background:#0a0a0a; border:1px solid #1a1a1a;">

            <!-- HEADER -->
            <div style="background:#000; border-top:3px solid ${R}; padding:40px 48px 32px;">
              <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                <div style="width:32px; height:2px; background:${R};"></div>
                <span style="font-family:Arial,sans-serif; font-size:11px; font-weight:700; letter-spacing:0.4em; text-transform:uppercase; color:${R};">
                  Nuevo cliente · Programa de entrenamiento
                </span>
              </div>
              <h1 style="font-family:Arial,sans-serif; font-size:36px; font-weight:900; text-transform:uppercase; color:#fff; margin:0; letter-spacing:-0.02em; line-height:1;">
                ${v(nombre)}
              </h1>
              <p style="font-family:Arial,sans-serif; font-size:13px; color:#555; margin:12px 0 0; letter-spacing:0.05em;">
                ${v(email)} &nbsp;·&nbsp; ${v(celular)}
              </p>
            </div>

            <!-- BODY -->
            <div style="padding:8px 48px 48px;">
              <table style="width:100%; border-collapse:collapse;">

                ${section("Datos personales", `
                  ${row("Edad", v(edad))}
                  ${row("Peso", v(peso) + " kg")}
                  ${row("Estatura", v(estatura) + " cm")}
                  ${row("EPS", v(eps))}
                  ${row("Ocupación", v(ocupacion))}
                `)}

                ${section("Estilo de vida", `
                  ${row("Horas de sueño", v(horasSueno))}
                  ${row("Problemas de sueño", v(problemasSueno))}
                  ${row("Horas sentado/día", v(horasSentado))}
                  ${row("Horas movimiento ligero", v(horasMovimiento))}
                  ${row("Horas movimiento intenso", v(horasIntensas))}
                `)}

                ${section("Salud", `
                  ${row("Cirugías", v(cirugia))}
                  ${row("Molestia osteomuscular", v(molestiaOsteomuscular))}
                  ${row("Detalle molestia", v(detalleMolestia))}
                  ${row("Antec. deportivos", v(antecedentesDeportivos))}
                  ${row("Detalle deportivos", v(detallDeportivos))}
                  ${row("Antec. familiares", v(antecedentesFamiliares))}
                  ${row("Detalle familiares", v(detalleFamiliares))}
                  ${row("Antec. metabólicos", v(antecedentesMetabolicos))}
                  ${row("Alcohol", v(alcohol))}
                  ${row("Fumar", v(fumar))}
                  ${row("Otras sustancias", v(otrasSustancias))}
                  ${row("Medicamentos", v(medicamentos))}
                  ${row("Molestias en el pecho", v(molestiasPecho))}
                `)}

                ${section("Nutrición", `
                  ${row("Comidas al día", v(comidasDia))}
                  ${row("Primera comida", v(primeraComida))}
                  ${row("Última comida", v(ultimaComida))}
                  ${row("Alergias alimentarias", v(alergiasComida))}
                  ${row("Detalle alergias", v(detalleAlergias))}
                  ${row("Proteínas favoritas", v(proteinas))}
                  ${row("Carbohidratos favoritos", v(carbohidratos))}
                  ${row("Frutas favoritas", v(frutas))}
                  ${row("Vegetales favoritos", v(vegetales))}
                  ${row("Legumbres favoritas", v(legumbres))}
                  ${row("Comidas que no le gustan", v(comidasNoGustan))}
                  ${row("Comidas que no puede comer", v(comidasNoPuede))}
                  ${row("Suplementación", v(suplementacion))}
                `)}

                ${section("Entrenamiento", `
                  ${row("Espacio de entrenamiento", v(espacioEntrenamiento))}
                  ${row("Equipos en casa/parque", v(equiposCasa))}
                  ${row("Actividad física actual", v(actividadFisica))}
                  ${row("Tiempo entrenando", v(tiempoEntrenando))}
                  ${row("Consistencia últimos 3 meses", v(consistencia))}
                  ${row("Frecuencia semanal", v(frecuenciaEjercicio))}
                  ${row("Duración de sesión", v(duracionSesion))}
                  ${row("Ejercicios pectoral", v(ejerciciosPectoral))}
                  ${row("Ejercicios espalda", v(ejerciciosEspalda))}
                  ${row("Ejercicios brazo", v(ejerciciosBrazo))}
                  ${row("Ejercicios deltoides", v(ejerciciosDeltoides))}
                  ${row("Ejercicios isquiotibiales", v(ejerciciosIsquios))}
                  ${row("Ejercicios cuádriceps", v(ejerciciosCuadriceps))}
                  ${row("Ejercicios glúteo", v(ejerciciosGluteo))}
                  ${row("Ejercicios que molestan", v(ejerciciosMolestan))}
                  ${row("Ejercicios que no quiere", v(ejerciciosNoGustan))}
                  ${row("Bandas de resistencia", v(bandasResistencia))}
                  ${row("Cardio", v(cardio))}
                  ${row("Dispositivo frec. cardíaca", v(dispositivoFC))}
                `)}

                ${section("Objetivos", `
                  ${row("Objetivo físico", v(objetivo))}
                  ${row("Objetivo alternativo", v(otraObjetivo))}
                  ${row("Motivación", v(motivacion))}
                  ${row("Nivel de motivación", v(nivelMotivacion) + " / 5")}
                  ${row("Disponibilidad horaria", v(disponibilidadHorario))}
                  ${row("Expectativas", v(expectativas))}
                  ${row("Comentarios adicionales", v(comentariosAdicionales))}
                `)}

              </table>
            </div>

            <!-- FOOTER -->
            <div style="padding:24px 48px; border-top:1px solid #1a1a1a; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-family:Arial,sans-serif; font-size:11px; color:#333; letter-spacing:0.2em; text-transform:uppercase;">
                Coach David · Sistema de valoración
              </span>
              <span style="font-family:Arial,sans-serif; font-size:11px; color:#333;">
                ${new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>

          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("Error enviando cuestionario de entrenamiento:", error)
    return NextResponse.json(
      { error: "Error al procesar el formulario" },
      { status: 500 }
    )
  }
}
