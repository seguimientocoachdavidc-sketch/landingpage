"use client"

import { useState } from "react"

const R = "#E8000D"

/* ── Formatear COP ────────────────────────────────────────────── */
function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n)
}

interface WompiButtonProps {
  programa: string       // Nombre del programa (para la URL)
  monto: number          // Monto en pesos (no en centavos)
  label?: string         // Texto del botón (opcional)
  variant?: "primary" | "outline"  // Estilo del botón
}

/**
 * Botón de pago Wompi reutilizable.
 * Lleva al usuario a la página /pagos con el programa preseleccionado.
 *
 * Uso dentro de programas:
 *   <WompiButton programa="entrenamiento" monto={140000} />
 *   <WompiButton programa="alimentacion"  monto={130000} variant="outline" />
 *   <WompiButton programa="duo"           monto={220000} label="Empezar ahora" />
 */
export function WompiButton({ programa, monto, label, variant = "primary" }: WompiButtonProps) {
  const [hover, setHover] = useState(false)
  const texto = label || `Pagar ${formatCOP(monto)} →`
  const href = `/pagos?programa=${programa}`

  const baseStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
    padding: "17px 36px", width: "100%",
    fontFamily: "'Barlow Condensed', Impact, sans-serif",
    fontSize: 15, fontWeight: 900, letterSpacing: "0.2em",
    textTransform: "uppercase", textDecoration: "none",
    cursor: "pointer", transition: "all 0.25s ease",
  }

  const primaryStyle: React.CSSProperties = {
    ...baseStyle,
    background: hover ? "#fff" : R,
    color: hover ? "#000" : "#fff",
    border: "none",
    clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))",
    boxShadow: hover ? "none" : `0 10px 36px ${R}38`,
  }

  const outlineStyle: React.CSSProperties = {
    ...baseStyle,
    background: hover ? `${R}10` : "transparent",
    color: hover ? "#fff" : "rgba(255,255,255,0.65)",
    border: `1px solid ${hover ? R : "rgba(255,255,255,0.18)"}`,
  }

  return (
    <a
      href={href}
      style={variant === "primary" ? primaryStyle : outlineStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      🔒 {texto}
    </a>
  )
}

/**
 * Versión compacta: sección de pago con precio + botón.
 * Reemplaza el bloque de precio + CTA en cada programa.
 */
export function PrecioConPago({ monto, programa, ctaLabel }: { monto: number; programa: string; ctaLabel?: string }) {
  return (
    <div>
      {/* Precio */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: "clamp(44px, 4vw, 64px)", fontWeight: 900, color: R, lineHeight: 1 }}>
          {formatCOP(monto)}
        </div>
        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>
          por mes
        </div>
      </div>

      {/* Botón de pago */}
      <WompiButton programa={programa} monto={monto} label={ctaLabel} />

      {/* Seguridad */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, justifyContent: "center" }}>
        <span style={{ fontSize: 12 }}>🔒</span>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 300 }}>
          Pago seguro · PSE · Tarjeta · Nequi · Wompi
        </span>
      </div>
    </div>
  )
}
