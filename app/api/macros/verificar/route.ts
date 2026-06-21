import { NextResponse } from "next/server"
// ── Tabla de usuarios autorizados ─────────────────────────────
// plan: identifica qué datos cargar en la página de plan de alimentación
//   "sofi"     → MENUS_PLAN     (lib/menus-data.ts)
//   "anderson" → MENUS_ANDERSON (lib/menus-anderson.ts)
//
// IMPORTANTE: estos tokens deben coincidir con los usados en Supabase
// (tabla `clientes`) para que /panel_control funcione correctamente
// con un solo link por persona.
//
// Para agregar un cliente nuevo:
//   1. Genera un token: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
//   2. Agrégalo aquí con su nombre, plan y activo: true
//   3. Si también tendrá entrenamiento, usa el MISMO token al crearlo en Supabase
//   4. Envíale el link único: tusitio.com/panel_control?token=TOKEN
const USUARIOS: Record<string, {
  nombre: string
  activo: boolean
  plan?: "sofi" | "anderson"  // undefined = solo tiene acceso a macros
}> = {
  // ── Tokens unificados con Supabase ──────────────────────────
  "UsuarioSofi":   { nombre: "Sofi",     activo: true, plan: "sofi" },
  "anderson-2024": { nombre: "Anderson", activo: true, plan: "anderson" },
  "UsuarioRivs":   { nombre: "Rivs",     activo: true },
  "UsuarioCoach":  { nombre: "Coach",    activo: true },
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
