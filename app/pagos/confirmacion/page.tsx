"use client"

import { useEffect, useState } from "react"

const R = "#E8000D"

export default function ConfirmacionPago() {
  const [estado, setEstado] = useState<"loading" | "approved" | "pending" | "declined">("loading")
  const [transaccionId, setTransaccionId] = useState("")
  const [referencia, setReferencia] = useState("")

  useEffect(() => {
    // Wompi redirige con ?id=TRANSACTION_ID en la URL
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id") || ""
    const ref = params.get("ref") || ""
    setTransaccionId(id)
    setReferencia(ref)

    if (!id) { setEstado("pending"); return }

    // Consultar estado de la transacción a Wompi
    fetch(`https://production.wompi.co/v1/transactions/${id}`)
      .then(r => r.json())
      .then(data => {
        const status = data?.data?.status
        if (status === "APPROVED") setEstado("approved")
        else if (status === "PENDING") setEstado("pending")
        else setEstado("declined")
      })
      .catch(() => setEstado("pending"))
  }, [])

  const config = {
    loading:  { icon: "⏳", titulo: "VERIFICANDO\nEL PAGO",      color: "rgba(255,255,255,0.6)", msg: "Consultando el estado de tu transacción..." },
    approved: { icon: "✓",  titulo: "PAGO\nCONFIRMADO",          color: "#22c55e",               msg: "Tu pago fue procesado exitosamente. Coach David te contactará pronto para comenzar." },
    pending:  { icon: "⏱",  titulo: "PAGO EN\nPROCESO",          color: "#eab308",               msg: "Tu pago está siendo procesado. Recibirás una confirmación por correo en unos minutos." },
    declined: { icon: "✕",  titulo: "PAGO NO\nCOMPLETADO",       color: R,                       msg: "Hubo un problema con tu pago. Puedes intentarlo de nuevo o elegir otro método." },
  }[estado]

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "'Barlow', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=Barlow:wght@300;400&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .bc { font-family:'Barlow Condensed',Impact,sans-serif; }
        .b  { font-family:'Barlow',sans-serif; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseC  { 0%,100%{box-shadow:0 0 0 0 currentColor} 50%{box-shadow:0 0 0 10px transparent} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .s1{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both}
        .s2{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both}
        .s3{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s both}
        .s4{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.55s both}
      `}</style>

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: config.color }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, ${config.color}08 0%, transparent 60%)`, pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ position: "fixed", top: 2, left: 0, right: 0, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 24px", display: "flex", justifyContent: "center" }}>
        <a href="/" className="bc" style={{ fontSize: 18, fontWeight: 900, color: "#fff", textDecoration: "none" }}>
          COACH<span style={{ color: R }}>.</span>DAVID
        </a>
      </div>

      <div style={{ position: "relative", maxWidth: 560, width: "100%", textAlign: "center", marginTop: 60 }}>

        {/* Ícono de estado */}
        <div className="s1" style={{
          width: 80, height: 80, borderRadius: "50%",
          border: `2px solid ${config.color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 32px",
          fontSize: estado === "loading" ? 28 : 36,
          color: config.color,
          animation: estado === "loading" ? "spin 1s linear infinite" : "pulseC 2s ease infinite",
        }}>
          {config.icon}
        </div>

        {/* Título */}
        <h1 className="bc s2" style={{ fontSize: "clamp(44px, 8vw, 72px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 20, whiteSpace: "pre-line" }}>
          {config.titulo.split("\n").map((line, i) => (
            <span key={i} style={{ display: "block", color: i === 1 ? config.color : "#fff" }}>{line}</span>
          ))}
        </h1>

        {/* Mensaje */}
        <p className="b s3" style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontWeight: 300, marginBottom: 32 }}>
          {config.msg}
        </p>

        {/* Detalles de la transacción */}
        {(transaccionId || referencia) && estado !== "loading" && (
          <div className="s3" style={{ padding: "16px 20px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", marginBottom: 32, textAlign: "left" }}>
            {referencia && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Referencia</span>
                <span className="bc" style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>{referencia}</span>
              </div>
            )}
            {transaccionId && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>ID Transacción</span>
                <span className="bc" style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>{transaccionId}</span>
              </div>
            )}
          </div>
        )}

        {/* CTAs según estado */}
        <div className="s4" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {estado === "approved" && (
            <>
              <a href="https://wa.me/573243747367?text=Hola Coach David, acabo de realizar mi pago. Mi referencia es: " className="bc"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "#22c55e", color: "#fff", padding: "16px", fontSize: 14, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))", transition: "all 0.25s ease" }}>
                Confirmar pago por WhatsApp
              </a>
              <a href="/" className="bc"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", padding: "14px", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none" }}>
                Volver al inicio
              </a>
            </>
          )}
          {estado === "pending" && (
            <a href="/" className="bc"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", background: R, color: "#fff", padding: "16px", fontSize: 14, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))" }}>
              Volver al inicio
            </a>
          )}
          {estado === "declined" && (
            <>
              <a href="/pagos" className="bc"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", background: R, color: "#fff", padding: "16px", fontSize: 14, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))" }}>
                Intentar de nuevo →
              </a>
              <a href="https://wa.me/573243747367" target="_blank" rel="noopener noreferrer" className="bc"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", padding: "14px", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none" }}>
                Contactar por WhatsApp
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
