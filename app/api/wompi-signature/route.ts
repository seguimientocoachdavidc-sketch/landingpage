import { NextResponse } from "next/server"
import { createHash } from "crypto"

export async function POST(req: Request) {
  try {
    const { reference, amountInCents, currency = "COP" } = await req.json()

    if (!reference || !amountInCents) {
      return NextResponse.json(
        { error: "Faltan parámetros: reference y amountInCents son obligatorios" },
        { status: 400 }
      )
    }

    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET

    if (!integritySecret) {
      return NextResponse.json(
        { error: "Llave de integridad no configurada en el servidor" },
        { status: 500 }
      )
    }

    // Cadena que Wompi exige: reference + amountInCents + currency + integritySecret
    const cadena = `${reference}${amountInCents}${currency}${integritySecret}`

    // Hash SHA256 en hexadecimal
    const firma = createHash("sha256").update(cadena).digest("hex")

    return NextResponse.json({ firma })

  } catch (error) {
    console.error("Error generando firma Wompi:", error)
    return NextResponse.json(
      { error: "Error interno al generar la firma" },
      { status: 500 }
    )
  }
}
