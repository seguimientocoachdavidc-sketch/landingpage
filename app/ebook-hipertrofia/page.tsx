"use client"

import { useState } from "react"

const R = "#E8000D"
const G = "#22c55e"

export default function EbookHipertrofiaPage() {
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [linkDescarga, setLinkDescarga] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const enviar = async () => {
    if (!nombre.trim() || !email.trim() || !whatsapp.trim()) {
      setError("Completa los 3 campos para recibir tu ebook.")
      return
    }
    setError(null)
    setEnviando(true)
    try {
      const res = await fetch("/api/leads/capturar-ebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ebook: "hipertrofia-basada-en-ciencia",
          nombre, email, whatsapp,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setEnviado(true)
        setLinkDescarga(data.link)
      } else {
        setError("Algo falló. Intenta de nuevo en un momento.")
      }
    } catch {
      setError("Sin conexión. Intenta de nuevo.")
    }
    setEnviando(false)
  }

  return (
    <div style={{ background: "#050507", minHeight: "100vh", color: "#fff",
      fontFamily: "'Barlow', sans-serif" }}>
      <Estilos />

      {/* Nav mínima */}
      <nav style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="bc" style={{ fontSize: 16, fontWeight: 900 }}>
          COACH<span style={{ color: R }}>.</span>DAVID
        </span>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 24px 100px",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}
        className="ebook-grid">

        {/* Columna izquierda — copy + mockup de portada */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 2, background: R }} />
            <span className="bc" style={{ fontSize: 11, color: R, letterSpacing: "0.3em",
              textTransform: "uppercase", fontWeight: 700 }}>Ebook gratuito</span>
          </div>

          <h1 className="bc" style={{ fontSize: "clamp(32px,4.5vw,52px)", fontWeight: 900,
            textTransform: "uppercase", lineHeight: 0.98, letterSpacing: "-0.01em",
            marginBottom: 20 }}>
            HIPERTROFIA<br/>BASADA EN <span style={{ color: R }}>CIENCIA.</span>
          </h1>

          <p className="b" style={{ fontSize: 16, color: "rgba(255,255,255,0.55)",
            lineHeight: 1.7, fontWeight: 300, marginBottom: 32, maxWidth: 440 }}>
            La guía corta que resume lo que de verdad funciona para ganar músculo —
            sin mitos, sin rutinas de revista. Directo al punto, en 15 páginas.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 8 }}>
            {[
              "Los principios de entrenamiento con más evidencia real",
              "Cómo estructurar tu volumen e intensidad semana a semana",
              "Los errores más comunes que frenan el progreso",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ color: R, fontSize: 13, marginTop: 2, flexShrink: 0 }}>✓</span>
                <span className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Columna derecha — mockup de portada + formulario */}
        <div>
          {/* Mockup de portada del ebook */}
          <div style={{ position: "relative", width: 200, margin: "0 auto 36px" }}>
            <div style={{ position: "absolute", top: 6, left: 6, width: "100%", aspectRatio: "3/4",
              background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" }} />
            <div style={{ position: "relative", width: "100%", aspectRatio: "3/4",
              background: "#0a0a0a", border: `1px solid ${R}40`,
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              padding: 18, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
              <div>
                <div style={{ width: 24, height: 2, background: R, marginBottom: 10 }} />
                <span className="bc" style={{ fontSize: 9, color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.2em", textTransform: "uppercase" }}>Coach David</span>
              </div>
              <div>
                <div className="bc" style={{ fontSize: 22, fontWeight: 900, color: "#fff",
                  textTransform: "uppercase", lineHeight: 0.95 }}>
                  HIPER<br/>TROFIA
                </div>
                <div className="bc" style={{ fontSize: 11, color: R, fontWeight: 800,
                  textTransform: "uppercase", marginTop: 6, letterSpacing: "0.05em" }}>
                  Basada en ciencia
                </div>
              </div>
            </div>
          </div>

          {/* Formulario / estado enviado */}
          {!enviado ? (
            <div style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)",
              padding: "28px 24px" }}>
              <div className="bc" style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "#fff", marginBottom: 18 }}>
                Descárgalo gratis
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                <input type="text" placeholder="Tu nombre" value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  style={{ padding: "13px 14px", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)", color: "#fff",
                    fontFamily: "'Barlow',sans-serif", fontSize: 14, outline: "none" }} />
                <input type="email" placeholder="Tu correo" value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ padding: "13px 14px", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)", color: "#fff",
                    fontFamily: "'Barlow',sans-serif", fontSize: 14, outline: "none" }} />
                <input type="tel" placeholder="Tu WhatsApp" value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  style={{ padding: "13px 14px", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)", color: "#fff",
                    fontFamily: "'Barlow',sans-serif", fontSize: 14, outline: "none" }} />
              </div>
              {error && (
                <p className="b" style={{ fontSize: 12, color: R, marginBottom: 12 }}>{error}</p>
              )}
              <button onClick={enviar} disabled={enviando}
                style={{ width: "100%", padding: 15, background: enviando ? `${R}70` : R,
                  border: "none", color: "#fff", fontFamily: "'Barlow Condensed',sans-serif",
                  fontSize: 14, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase",
                  cursor: enviando ? "not-allowed" : "pointer" }}>
                {enviando ? "Enviando..." : "Quiero mi ebook gratis →"}
              </button>
              <p className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.25)",
                marginTop: 14, lineHeight: 1.5, textAlign: "center" }}>
                Sin spam. Solo el ebook y, de vez en cuando, contenido útil de entrenamiento.
              </p>
            </div>
          ) : (
            <div style={{ border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.06)",
              padding: "32px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
              <div className="bc" style={{ fontSize: 18, fontWeight: 900, textTransform: "uppercase",
                color: G, marginBottom: 8 }}>
                ¡Ya está listo!
              </div>
              <p className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.55)",
                lineHeight: 1.6, marginBottom: 20 }}>
                También te lo enviamos a tu correo, por si lo quieres guardar ahí.
              </p>
              {linkDescarga && (
                <a href={linkDescarga} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-block", padding: "13px 26px", background: G,
                    color: "#000", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13,
                    fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase",
                    textDecoration: "none" }}>
                  Descargar PDF ahora →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Estilos() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      .bc{font-family:'Barlow Condensed',Impact,sans-serif}
      .b{font-family:'Barlow',sans-serif}
      input::placeholder{color:rgba(255,255,255,0.3)}
      input:focus{border-color:${R}80 !important}
      button:focus-visible, input:focus-visible{outline:2px solid ${R};outline-offset:2px}
      @media (max-width: 760px){
        .ebook-grid{grid-template-columns:1fr !important}
      }
      @media (prefers-reduced-motion: reduce){
        *{transition-duration:0.01ms !important}
      }
    `}</style>
  )
}
