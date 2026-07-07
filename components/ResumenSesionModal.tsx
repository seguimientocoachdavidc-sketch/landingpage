"use client"

/* ══ Tipos ═══════════════════════════════════════════ */
export interface PRLogrado {
  ejercicio: string
  tipo: "peso" | "reps"
  kg: number
  reps: number
}

export interface ResumenSesionData {
  diaNombre: string
  duracionMin: number | null
  totalEjercicios: number
  totalSeries: number
  volumenTotal: number
  volumenAnterior: number | null
  prs: PRLogrado[]
  racha: number
}

/* ── Colores (mismos tokens que el resto de la app) ── */
const R = "#E8000D"
const G = "#22c55e"
const O = "#f59e0b"

interface Props {
  data: ResumenSesionData
  onClose: () => void
}

export default function ResumenSesionModal({ data, onClose }: Props) {
  const {
    diaNombre, duracionMin, totalEjercicios, totalSeries,
    volumenTotal, volumenAnterior, prs, racha,
  } = data

  const deltaVolumen = volumenAnterior != null
    ? Math.round(((volumenTotal - volumenAnterior) / Math.max(volumenAnterior, 1)) * 100)
    : null

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      animation: "fadeUp 0.2s ease",
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
      `}</style>

      <div style={{
        width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto",
        background: "#0a0a0a", borderTop: `1px solid ${R}40`,
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        animation: "popIn 0.25s ease", padding: "28px 20px 20px",
      }}>
        {/* Barra superior decorativa */}
        <div style={{
          width: 40, height: 3, background: R, margin: "0 auto 20px", borderRadius: 2,
        }} />

        {/* Encabezado */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>💪</div>
          <h2 style={{
            fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 900,
            textTransform: "uppercase", color: "#fff", lineHeight: 1.1,
          }}>
            ¡Bien! Terminaste tu <span style={{ color: R }}>{diaNombre}</span>
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, fontWeight: 300 }}>
            Esto es lo que hiciste hoy
          </p>
        </div>

        {/* Stats grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: prs.length ? 20 : 8,
        }}>
          {[
            { label: "Duración", val: duracionMin ? `${duracionMin} min` : "—", color: "#fff" },
            { label: "Ejercicios", val: `${totalEjercicios}`, color: "#fff" },
            { label: "Series", val: `${totalSeries}`, color: "#fff" },
            {
              label: "Volumen total",
              val: `${volumenTotal.toLocaleString()} kg`,
              color: deltaVolumen == null ? "#fff" : deltaVolumen >= 0 ? G : R,
              sub: deltaVolumen == null ? undefined : `${deltaVolumen >= 0 ? "↑" : "↓"} ${Math.abs(deltaVolumen)}% vs. anterior`,
            },
          ].map(s => (
            <div key={s.label} style={{
              padding: "14px 12px", background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)", textAlign: "center",
            }}>
              <div style={{
                fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 900,
                color: s.color, lineHeight: 1,
              }}>{s.val}</div>
              <div style={{
                fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
                letterSpacing: "0.1em", marginTop: 5,
              }}>{s.label}</div>
              {s.sub && (
                <div style={{ fontSize: 10, color: s.color, marginTop: 4, fontWeight: 700 }}>{s.sub}</div>
              )}
            </div>
          ))}
        </div>

        {/* PRs */}
        {prs.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 11, color: O, letterSpacing: "0.12em", textTransform: "uppercase",
              marginBottom: 10, fontWeight: 700,
            }}>
              🏆 Nuevos récords personales
            </div>
            {prs.map((pr, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                marginBottom: 6, background: `${O}0d`, border: `1px solid ${O}35`,
              }}>
                <span style={{ fontSize: 18 }}>🔥</span>
                <div>
                  <div style={{
                    fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 800,
                    color: "#fff", textTransform: "uppercase",
                  }}>{pr.ejercicio}</div>
                  <div style={{ fontSize: 12, color: O, fontWeight: 600 }}>
                    {pr.tipo === "peso"
                      ? `Nuevo peso máximo: ${pr.kg}kg × ${pr.reps} reps`
                      : `Nuevo máximo de reps: ${pr.reps} reps a ${pr.kg}kg`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Racha */}
        {racha >= 2 && (
          <div style={{
            marginBottom: 20, padding: "12px 16px", textAlign: "center",
            background: `${G}0d`, border: `1px solid ${G}30`,
          }}>
            <span style={{ fontSize: 13, color: G, fontWeight: 600 }}>
              🔥 ¡Racha de {racha} semanas seguidas en {diaNombre}!
            </span>
          </div>
        )}

        <button onClick={onClose} style={{
          width: "100%", padding: 16, background: R, border: "none", color: "#fff",
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 900,
          letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer",
        }}>
          Listo ✓
        </button>
      </div>
    </div>
  )
}
