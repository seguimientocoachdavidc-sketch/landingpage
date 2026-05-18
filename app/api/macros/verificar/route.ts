import { NextResponse } from "next/server"

// ── Tabla de usuarios autorizados ─────────────────────────────
// plan: identifica qué datos cargar en la página de plan de alimentación
//   "sofi"     → MENUS_PLAN     (lib/menus-data.ts)
//   "anderson" → MENUS_ANDERSON (lib/menus-anderson.ts)
//
// Para agregar un cliente nuevo:
//   1. Genera un token: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
//   2. Agrégalo aquí con su nombre, plan y activo: true
//   3. Envíale el link: tusitio.com/plan-alimentacion?token=TOKEN
//      o para macros:   tusitio.com/macros?token=TOKEN

const USUARIOS: Record<string, {
  nombre: string
  activo: boolean
  plan?: "Sofi" | "Anderson"  // undefined = solo tiene acceso a macros
}> = {
  // ── Agrega aquí los tokens de tus clientes ──────────────────
  "UsuarioSofiqazwsx123": { nombre: "Sofi", activo: true, plan: "sofi" },
  "UsuarioAndersona1s2d3": { nombre: "Anderson", activo: true, plan: "anderson" }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ valido: false, error: "Token requerido" }, { status: 400 })
  }

  const usuario = USUARIOS[token]

  if (!usuario || !usuario.activo) {
    return NextResponse.json({ valido: false, error: "Token inválido o inactivo" })
  }

  return NextResponse.json({
    valido: true,
    nombre: usuario.nombre,
    plan: usuario.plan ?? null,
  })
}
