"use client"

import { useState, useEffect } from "react"

const R = "#E8000D"
const G = "#22c55e"

/* ── Configuración de las 3 pruebas ──────────────────────────── */
const PRUEBAS = [
  {
    num: "01",
    id: "crunch",
    nombre: "Crunch abdominal",
    objetivo: "Resistencia de core",
    youtubeId: "lpskW-lWhFg",
    descripcion: "Realiza la mayor cantidad de repeticiones posibles en 1 minuto, manteniendo control y técnica completa en cada repetición.",
    indicaciones: [
      "Espalda baja en contacto con el piso, rodillas flexionadas",
      "Sube solo hasta despegar los omóplatos del suelo",
      "Exhala en la subida, no jalones del cuello",
      "Si pierdes la técnica, detente — cuenta solo reps limpias",
    ],
  },
  {
    num: "02",
    id: "sentadilla",
    nombre: "Sentadilla con peso corporal",
    objetivo: "Fuerza y patrón de tren inferior",
    youtubeId: "l83R5PblSMA",
    descripcion: "Realiza la mayor cantidad de repeticiones posibles en 1 minuto con rango completo y buena técnica.",
    indicaciones: [
      "Pies al ancho de cadera, rodillas siguen la dirección de los pies",
      "Desciende hasta que el pliegue de cadera pase la línea de rodilla",
      "Talones siempre en contacto con el piso",
      "Espalda neutra durante todo el movimiento",
    ],
  },
  {
    num: "03",
    id: "pushups",
    nombre: "Push ups (rodillas apoyadas)",
    objetivo: "Fuerza de tren superior",
    youtubeId: "KFxW5amBbsw",
    descripcion: "Realiza la mayor cantidad de repeticiones posibles en 1 minuto, con rodillas apoyadas en el piso.",
    indicaciones: [
      "Rodillas, cadera y hombros alineados — sin quebrar la cadera",
      "Desciende hasta que el pecho casi toque el piso",
      "Codos a 45° del torso, no completamente abiertos",
      "Ante cualquier molestia o dolor detener el ejercicio",
    ],
  },
]

/* ── Calentamiento previo: activación + movilidad ────────────── */
const CALENTAMIENTO = [
  { nombre: "Trote suave en el sitio o jumping jacks", duracion: "2 min", tipo: "Activación aeróbica" },
  { nombre: "Círculos de brazos (adelante y atrás)", duracion: "30 seg c/dirección", tipo: "Movilidad de hombro" },
  { nombre: "Rotación de cadera (círculos amplios)", duracion: "30 seg c/dirección", tipo: "Movilidad de cadera" },
  { nombre: "Sentadillas sin peso, ritmo controlado", duracion: "10 reps", tipo: "Activación de tren inferior" },
  { nombre: "Gato-camello (movilidad de columna)", duracion: "8 reps", tipo: "Movilidad de columna" },
  { nombre: "Zancadas alternas caminando", duracion: "8 reps c/lado", tipo: "Activación dinámica" },
]


export default function ValoracionFisicaPage() {
  const [nombreCliente, setNombreCliente] = useState("")
  const [token, setToken] = useState<string|null>(null)
  const [resultados, setResultados] = useState<Record<string,string>>({})
  const [notaGeneral, setNotaGeneral] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState("")
  const [pruebaActiva, setPruebaActiva] = useState<string|null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setNombreCliente(params.get("nombre") || "")
    setToken(params.get("token"))
  }, [])

  const completadas = PRUEBAS.filter(p => resultados[p.id]?.trim()).length
  const todasCompletas = completadas === PRUEBAS.length

  const enviar = async () => {
    if (!todasCompletas) {
      setError("Registra el resultado de las 3 pruebas antes de enviar.")
      return
    }
    setError("")
    setEnviando(true)
    try {
      const res = await fetch("/api/valoracion-fisica/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreCliente || "Cliente sin nombre",
          token,
          resultados: PRUEBAS.map(p => ({
            prueba: p.nombre,
            reps: resultados[p.id],
          })),
          nota: notaGeneral,
        }),
      })
      if (res.ok) setEnviado(true)
      else setError("Hubo un error al enviar. Intenta de nuevo.")
    } catch {
      setError("Sin conexión. Intenta de nuevo.")
    }
    setEnviando(false)
  }

  if (enviado) return <Confirmacion nombre={nombreCliente} />

  return (
    <div style={{ background:"#050505", minHeight:"100vh", color:"#fff",
      fontFamily:"'Barlow',sans-serif", overflowX:"hidden" }}>

      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:${R};color:#fff}
        .bc{font-family:'Barlow Condensed',Impact,sans-serif}
        .b{font-family:'Barlow',sans-serif}
        .mono{font-family:'JetBrains Mono',monospace}
        input[type=number]{-moz-appearance:textfield}
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}
        .prueba-card{transition:border-color 0.25s ease, background 0.25s ease}
        .prueba-card.completa{border-color:rgba(34,197,94,0.4)!important}
      `}</style>

      {/* Barra superior tipo "escáner" */}
      <div style={{ height:3, background:`linear-gradient(90deg, ${R}, transparent, ${R})`,
        position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"100%",
          background:`linear-gradient(90deg, transparent, #fff, transparent)`,
          width:"30%", animation:"scanline 3s linear infinite" }}/>
      </div>

      {/* Header */}
      <div style={{ borderBottom:"1px solid rgba(255,255,255,0.06)",
        background:"rgba(5,5,5,0.95)", backdropFilter:"blur(12px)" }}>
        <div style={{ maxWidth:760, margin:"0 auto", padding:"0 20px", height:54,
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span className="bc" style={{ fontSize:16, fontWeight:900 }}>
            COACH<span style={{ color:R }}>.</span>DAVID
          </span>
          <span className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.3)",
            letterSpacing:"0.15em", textTransform:"uppercase" }}>
            Protocolo de valoración
          </span>
        </div>
      </div>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"48px 20px 90px" }}>

        {/* Hero */}
        <div style={{ marginBottom:48, animation:"fadeUp 0.4s ease" }}>
          <div className="mono" style={{ display:"inline-flex", alignItems:"center", gap:8,
            fontSize:11, color:R, letterSpacing:"0.2em", textTransform:"uppercase",
            marginBottom:18, padding:"5px 12px", border:`1px solid ${R}40`,
            background:`${R}0a` }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:R,
              display:"inline-block" }}/>
            Valoración física inicial
          </div>

          <h1 className="bc" style={{ fontSize:"clamp(36px,7vw,58px)", fontWeight:900,
            textTransform:"uppercase", lineHeight:0.95, letterSpacing:"-0.01em",
            marginBottom:18 }}>
            {nombreCliente
              ? <>Hola, <span style={{ color:R }}>{nombreCliente.split(" ")[0]}</span></>
              : <>Tu línea<br/><span style={{ color:R }}>base de fuerza</span></>
            }
          </h1>

          <p className="b" style={{ fontSize:16, color:"rgba(255,255,255,0.5)",
            lineHeight:1.75, fontWeight:300, maxWidth:560 }}>
            Antes de diseñar tu programa, estas pruebas nos ayudan a conocer tu nivel actual
            de fuerza y técnica. Vas a realizar <strong style={{ color:"#fff" }}>3 pruebas
            de 1 minuto cada una</strong> — para calibrar tu punto de partida
            de mejor forma. 
          </p>

          {/* Progreso */}
          <div style={{ marginTop:28, display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.08)",
              position:"relative", overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(completadas/PRUEBAS.length)*100}%`,
                background:G, transition:"width 0.4s ease" }}/>
            </div>
            <span className="mono" style={{ fontSize:12, color:"rgba(255,255,255,0.4)",
              flexShrink:0 }}>
              {completadas}/{PRUEBAS.length} completas
            </span>
          </div>
        </div>

        {/* Calentamiento previo */}
        <div style={{ marginBottom:40, animation:"fadeUp 0.45s ease",
          border:"1px solid rgba(255,255,255,0.08)",
          background:"rgba(255,255,255,0.02)" }}>

          <div style={{ padding:"18px 22px",
            borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.35)",
              letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:6 }}>
              Antes de empezar
            </div>
            <div className="bc" style={{ fontSize:20, fontWeight:900,
              textTransform:"uppercase", color:"#fff" }}>
              Activación y movilidad — 4 a 5 minutos
            </div>
            <p className="b" style={{ fontSize:13.5, color:"rgba(255,255,255,0.45)",
              lineHeight:1.6, fontWeight:300, marginTop:8 }}>
              Realiza esta breve rutina antes de las pruebas. Te ayuda a sentirte
              más cómoda y hace que el resultado refleje mejor tu capacidad real.
            </p>
          </div>

          <div style={{ padding:"16px 22px" }}>
            {CALENTAMIENTO.map((c, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:14,
                padding:"10px 0",
                borderBottom: i < CALENTAMIENTO.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <span className="mono" style={{ fontSize:11, color:"rgba(255,255,255,0.25)",
                  flexShrink:0, minWidth:18 }}>
                  {String(i+1).padStart(2,"0")}
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="b" style={{ fontSize:14, color:"rgba(255,255,255,0.85)",
                    fontWeight:400 }}>
                    {c.nombre}
                  </div>
                  <div className="b" style={{ fontSize:11.5, color:"rgba(255,255,255,0.3)",
                    marginTop:1 }}>
                    {c.tipo}
                  </div>
                </div>
                <span className="bc" style={{ fontSize:13, fontWeight:700, color:G,
                  flexShrink:0, whiteSpace:"nowrap" }}>
                  {c.duracion}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mensaje de grabación + WhatsApp */}
        <div style={{ marginBottom:32, animation:"fadeUp 0.5s ease",
          padding:"20px 22px", background:`${R}06`, border:`1px solid ${R}25` }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
            <span style={{ fontSize:22, flexShrink:0 }}>🎥</span>
            <div style={{ flex:1 }}>
              <div className="bc" style={{ fontSize:15, fontWeight:900,
                textTransform:"uppercase", color:"#fff", marginBottom:6 }}>
                Grábate haciendo cada prueba
              </div>
              <p className="b" style={{ fontSize:13.5, color:"rgba(255,255,255,0.55)",
                lineHeight:1.65, fontWeight:300, marginBottom:14 }}>
                Necesito ver tu técnica para calibrar bien tu programa. Grábate
                de perfil o tres cuartos durante cada prueba y envíame los
                3 videos por WhatsApp — junto con el formulario de abajo.
              </p>
              <a href={`https://wa.me/573243747367?text=${encodeURIComponent(
                `Hola Coach David, aquí están mis videos de la valoración física${nombreCliente ? ` (${nombreCliente})` : ""}`
              )}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-flex", alignItems:"center", gap:10,
                  padding:"12px 22px", background:"#22c55e", color:"#fff",
                  textDecoration:"none", fontFamily:"'Barlow Condensed',sans-serif",
                  fontSize:13, fontWeight:900, letterSpacing:"0.15em",
                  textTransform:"uppercase" }}>
                Enviar videos por WhatsApp →
              </a>
            </div>
          </div>
        </div>


        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {PRUEBAS.map((p, i) => {
            const completa = !!resultados[p.id]?.trim()
            const abierta = pruebaActiva === p.id
            return (
              <div key={p.id}
                className={`prueba-card${completa ? " completa" : ""}`}
                style={{
                  border:`1px solid ${completa ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`,
                  background: completa ? "rgba(34,197,94,0.04)" : "rgba(255,255,255,0.02)",
                  animation:`fadeUp 0.4s ease ${i*0.08}s both`,
                }}>

                {/* Header de la prueba */}
                <button onClick={() => setPruebaActiva(abierta ? null : p.id)}
                  style={{ width:"100%", padding:"20px 22px", background:"transparent",
                    border:"none", cursor:"pointer", textAlign:"left",
                    display:"flex", alignItems:"center", gap:18 }}>

                  <span className="mono" style={{ fontSize:13, color: completa ? G : "rgba(255,255,255,0.25)",
                    fontWeight:500, flexShrink:0, minWidth:24 }}>
                    {completa ? "✓" : p.num}
                  </span>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="bc" style={{ fontSize:20, fontWeight:900,
                      textTransform:"uppercase", letterSpacing:"-0.01em",
                      color:"#fff", marginBottom:3 }}>
                      {p.nombre}
                    </div>
                    <div className="b" style={{ fontSize:13,
                      color:"rgba(255,255,255,0.4)", fontWeight:300 }}>
                      {p.objetivo}
                      {completa && (
                        <span style={{ color:G, marginLeft:10, fontWeight:500 }}>
                          · {resultados[p.id]} reps registradas
                        </span>
                      )}
                    </div>
                  </div>

                  <span style={{ color:"rgba(255,255,255,0.3)", fontSize:13,
                    flexShrink:0, transform: abierta ? "rotate(180deg)" : "none",
                    transition:"transform 0.2s ease" }}>▾</span>
                </button>

                {/* Contenido expandido */}
                {abierta && (
                  <div style={{ padding:"0 22px 24px", animation:"fadeUp 0.25s ease" }}>

                    {/* Video */}
                    <div style={{ position:"relative", width:"100%",
                      paddingBottom:"56.25%", marginBottom:18,
                      background:"#000", border:"1px solid rgba(255,255,255,0.08)" }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${p.youtubeId}`}
                        title={p.nombre}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ position:"absolute", top:0, left:0,
                          width:"100%", height:"100%", border:"none" }}
                      />
                    </div>

                    {/* Descripción */}
                    <p className="b" style={{ fontSize:14, color:"rgba(255,255,255,0.6)",
                      lineHeight:1.7, fontWeight:300, marginBottom:16 }}>
                      {p.descripcion}
                    </p>

                    {/* Indicaciones técnicas */}
                    <div style={{ marginBottom:20, padding:"14px 16px",
                      background:"rgba(255,255,255,0.02)",
                      border:"1px solid rgba(255,255,255,0.06)" }}>
                      <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.3)",
                        letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:10 }}>
                        Puntos técnicos
                      </div>
                      {p.indicaciones.map((ind, ii) => (
                        <div key={ii} style={{ display:"flex", gap:10,
                          marginBottom: ii < p.indicaciones.length-1 ? 8 : 0 }}>
                          <span style={{ color:R, fontSize:13, flexShrink:0,
                            marginTop:1 }}>—</span>
                          <span className="b" style={{ fontSize:13.5,
                            color:"rgba(255,255,255,0.65)", lineHeight:1.55,
                            fontWeight:300 }}>{ind}</span>
                        </div>
                      ))}
                    </div>

                    {/* Input de resultado */}
                    <div>
                      <label className="bc" style={{ display:"block", fontSize:11,
                        fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase",
                        color:"rgba(255,255,255,0.4)", marginBottom:8 }}>
                        Repeticiones completadas en 1 minuto
                      </label>
                      <input type="number" min="0" max="200" placeholder="Ej. 24"
                        value={resultados[p.id] || ""}
                        onChange={e => setResultados(r => ({ ...r, [p.id]: e.target.value }))}
                        style={{ width:"100%", padding:"14px 16px",
                          background:"rgba(255,255,255,0.04)",
                          border:`1px solid ${resultados[p.id] ? `${G}60` : "rgba(255,255,255,0.12)"}`,
                          color:"#fff", fontSize:24, fontFamily:"'Barlow Condensed',sans-serif",
                          fontWeight:900, outline:"none", textAlign:"center" }}/>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Nota general */}
        <div style={{ marginTop:24 }}>
          <label className="bc" style={{ display:"block", fontSize:11,
            fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase",
            color:"rgba(255,255,255,0.4)", marginBottom:8 }}>
            ¿Algo que deba saber? (opcional)
          </label>
          <textarea rows={3}
            placeholder="Molestias durante alguna prueba, dificultad con la técnica, etc."
            value={notaGeneral}
            onChange={e => setNotaGeneral(e.target.value)}
            style={{ width:"100%", padding:"13px 16px",
              background:"rgba(255,255,255,0.04)",
              border:"1px solid rgba(255,255,255,0.12)",
              color:"rgba(255,255,255,0.85)", fontSize:14,
              fontFamily:"'Barlow',sans-serif", outline:"none", resize:"none" }}/>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginTop:16, padding:"12px 16px",
            background:`${R}10`, border:`1px solid ${R}35`,
            fontSize:13, color:"#fca5a5" }}>
            {error}
          </div>
        )}

        {/* Botón enviar */}
        <button onClick={enviar} disabled={enviando}
          style={{ width:"100%", marginTop:24, padding:"18px",
            background: enviando ? `${R}50` : todasCompletas ? R : "rgba(232,0,13,0.3)",
            border:"none", color: todasCompletas ? "#fff" : "rgba(255,255,255,0.5)",
            fontFamily:"'Barlow Condensed',sans-serif", fontSize:15, fontWeight:900,
            letterSpacing:"0.2em", textTransform:"uppercase",
            cursor: enviando ? "not-allowed" : "pointer", transition:"all 0.2s ease" }}>
          {enviando ? "Enviando resultados..." : "Enviar mi valoración →"}
        </button>

        <p className="b" style={{ marginTop:14, fontSize:12,
          color:"rgba(255,255,255,0.25)", textAlign:"center", lineHeight:1.6 }}>
          Coach David revisará tus resultados para calibrar tu programa de entrenamiento.
          <br/>No olvides enviar también los 3 videos por WhatsApp ↑
        </p>
      </div>
    </div>
  )
}

/* ══ Confirmación ════════════════════════════════════════════════ */
function Confirmacion({ nombre }: { nombre: string }) {
  return (
    <div style={{ background:"#050505", minHeight:"100vh", color:"#fff",
      fontFamily:"'Barlow',sans-serif", display:"flex", alignItems:"center",
      justifyContent:"center", padding:32 }}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=Barlow:wght@300&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ textAlign:"center", maxWidth:420, animation:"fadeUp 0.4s ease" }}>
        <div style={{ width:64, height:64, borderRadius:"50%",
          border:"2px solid #22c55e", display:"flex", alignItems:"center",
          justifyContent:"center", margin:"0 auto 24px", fontSize:28, color:"#22c55e" }}>
          ✓
        </div>
        <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:30,
          fontWeight:900, textTransform:"uppercase", marginBottom:14, lineHeight:1.1 }}>
          {nombre ? `Listo, ${nombre.split(" ")[0]}` : "Valoración enviada"}
        </h1>
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", lineHeight:1.7,
          fontWeight:300, marginBottom:24 }}>
          Tus resultados fueron enviados a Coach David. Con esta información
          se calibrará tu programa de entrenamiento.
        </p>
        <div style={{ padding:"14px 18px", background:"rgba(232,0,13,0.06)",
          border:"1px solid rgba(232,0,13,0.25)", textAlign:"left" }}>
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.6 }}>
            🎥 <strong style={{ color:"#fff" }}>Recuerda:</strong> si aún no lo has
            hecho, envía tus 3 videos por WhatsApp para que pueda revisar tu técnica.
          </span>
        </div>
      </div>
    </div>
  )
}
