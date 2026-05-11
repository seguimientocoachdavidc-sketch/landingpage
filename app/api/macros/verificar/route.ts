import { NextResponse } from "next/server"

// Tabla de usuarios autorizados
// Formato: token → { nombre, activo }
// Para agregar un cliente: genera un token único y agrégalo aquí
const USUARIOS: Record<string, { nombre: string; activo: boolean }> = {
  // Ejemplo — reemplaza con tokens reales generados
  // "abc123xyz789": { nombre: "María García", activo: true },
  // "def456uvw012": { nombre: "Juan Pérez",   activo: true },
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

  return NextResponse.json({ valido: true, nombre: usuario.nombre })
}
