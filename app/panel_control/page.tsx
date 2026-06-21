"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const R = "#E8000D"
const G = "#22c55e"
const B = "#3b82f6"
const O = "#f59e0b"
const P = "#818cf8"
const WA = "#25D366"

interface Modulos {
  musculacion: boolean
  running: boolean
  cycling: boolean
  macros: boolean
}

export default function PanelControlPage() {
  const [token, setToken]         = useState<string|null>(null)
  const [nombre, setNombre]       = useState("")
  const [denegado, setDenegado]   = useState(false)
  const [cargando, setCargando]   = useState(true)
  const [modulos, setModulos]     = useState<Modulos>({
    musculacion:false, running:false, cycling:false, macros:false,
  })

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token")
    if (!t) { setDenegado(true); setCargando(false); return }
    setToken(t)
    verificarYcargar(t)
  }, [])

  const verificarYcargar = async (tok: string) => {
    const { data: cliente, error } = await supabase
      .from("clientes").select("token,nombre")
      .eq("token", tok).eq("activo", true).single()

    if (error || !cliente) { setDenegado(true); setCargando(false); return }
    setNombre(cliente.nombre)

    const m: Modulos = { musculacion:false, running:false, cycling:false, macros:false }

    const [{ data: prog }, { data: pRun }, { data: pCyc }, { data: metas }] = await Promise.all([
      supabase.from("programas").select("id").eq("cliente_token", tok).eq("activo", true).maybeSingle(),
      supabase.from("programas_running").select("id").eq("cliente_token", tok).eq("activo", true).maybeSingle(),
      supabase.from("programas_cycling").select("id").eq("cliente_token", tok).eq("activo", true).maybeSingle(),
      supabase.from("metas_macros").select("id").eq("cliente_token", tok).limit(1),
    ])

    if (prog)  m.musculacion = true
    if (pRun)  m.running = true
    if (pCyc)  m.cycling = true
    if (metas?.length) m.macros = true

    setModulos(m)
    setCargando(false)
  }

  if (denegado) return <AccesoDenegado/>
  if (cargando) return <Loading/>

  const tieneEntrenamiento = modulos.musculacion || modulos.running || modulos.cycling

  const tarjetas = [
    ...(tieneEntrenamiento ? [{
      key: "entrenamiento",
      href: `/plan-entrenamiento?token=${token}`,
      icono: "🏋️",
      titulo: "Plan de Entrenamiento",
      desc: [
        modulos.musculacion && "Musculación",
        modulos.running && "Running",
        modulos.cycling && "Cycling",
      ].filter(Boolean).join(" · "),
      color: R,
    }] : []),
    ...(modulos.macros ? [{
      key: "macros",
      href: `/macros?token=${token}`,
      icono: "🍽️",
      titulo: "Registro de Macros",
      desc: "Comidas, seguimiento de medidas y progreso",
      color: B,
    }] : []),
    {
      key: "whatsapp",
      href: "https://wa.me/573243747367",
      externo: true,
      icono: "💬",
      titulo: "Hablar con Coach David",
      desc: "Dudas, ajustes al plan o consultas directas",
      color: WA,
    },
  ]

  return (
    <div style={{ background:"#000", color:"#fff", fontFamily:"'Barlow',sans-serif",
      minHeight:"100vh", overflowX:"hidden" }}>

      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:${R};color:#fff}
        .bc{font-family:'Barlow Condensed',Impact,sans-serif}
        .b{font-family:'Barlow',sans-serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        .card-hover:hover{border-color:var(--hover-color)!important;background:var(--hover-bg)!important}
        .card-hover:hover .arrow{transform:translateX(4px)}
        .arrow{transition:transform 0.2s ease}
      `}</style>

      {/* Barra superior */}
      <div style={{ height:2, background:R }}/>

      {/* Header */}
      <div style={{ borderBottom:"1px solid rgba(255,255,255,0.06)",
        background:"rgba(0,0,0,0.95)", backdropFilter:"blur(12px)" }}>
        <div style={{ maxWidth:600, margin:"0 auto", padding:"0 20px", height:54,
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span className="bc" style={{ fontSize:16, fontWeight:900 }}>
            COACH<span style={{ color:R }}>.</span>DAVID
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:6, height:6, background:G, borderRadius:"50%",
              animation:"blink 2s ease infinite" }}/>
            <span className="b" style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>
              {nombre}
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:600, margin:"0 auto", padding:"48px 20px 60px" }}>

        {/* Saludo */}
        <div style={{ marginBottom:40, animation:"fadeUp 0.4s ease" }}>
          <div className="bc" style={{ fontSize:11, color:R, letterSpacing:"0.4em",
            textTransform:"uppercase", marginBottom:10 }}>
            Panel de control
          </div>
          <h1 className="bc" style={{ fontSize:"clamp(32px,7vw,44px)", fontWeight:900,
            textTransform:"uppercase", lineHeight:1, marginBottom:10 }}>
            Hola, <span style={{ color:R }}>{nombre.split(" ")[0]}</span>
          </h1>
          <p className="b" style={{ fontSize:15, color:"rgba(255,255,255,0.45)",
            fontWeight:300, lineHeight:1.6 }}>
            Aquí está todo lo que tienes activo. Selecciona a dónde quieres ir.
          </p>
        </div>

        {/* Tarjetas de navegación */}
        <div style={{ display:"flex", flexDirection:"column", gap:12,
          animation:"fadeUp 0.5s ease" }}>
          {tarjetas.map((t, i) => (
            <a key={t.key} href={t.href}
              target={t.externo ? "_blank" : undefined}
              rel={t.externo ? "noopener noreferrer" : undefined}
              className="card-hover"
              style={{
                ['--hover-color' as any]: `${t.color}60`,
                ['--hover-bg' as any]: `${t.color}10`,
                display:"flex", alignItems:"center", gap:16,
                padding:"22px 20px",
                background:`${t.color}06`,
                border:`1px solid ${t.color}25`,
                textDecoration:"none", transition:"all 0.2s ease",
                animationDelay:`${i*0.06}s`,
              }}>
              <div style={{ width:50, height:50, flexShrink:0,
                background:`${t.color}15`, border:`1px solid ${t.color}35`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:24 }}>
                {t.icono}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div className="bc" style={{ fontSize:18, fontWeight:900,
                  textTransform:"uppercase", color:"#fff", marginBottom:3,
                  display:"flex", alignItems:"center", gap:8 }}>
                  {t.titulo}
                  {t.externo && (
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>↗</span>
                  )}
                </div>
                <div className="b" style={{ fontSize:13,
                  color:"rgba(255,255,255,0.45)", lineHeight:1.4 }}>
                  {t.desc}
                </div>
              </div>
              <span className="arrow" style={{ color:t.color, fontSize:20,
                flexShrink:0 }}>→</span>
            </a>
          ))}
        </div>

        {/* Mensaje si no tiene módulos activos (caso borde) */}
        {!tieneEntrenamiento && !modulos.macros && (
          <div style={{ marginTop:8, padding:"20px",
            border:"1px solid rgba(255,255,255,0.08)",
            background:"rgba(255,255,255,0.02)", textAlign:"center" }}>
            <p className="b" style={{ fontSize:13, color:"rgba(255,255,255,0.4)",
              lineHeight:1.6 }}>
              Aún no tienes planes activos. Escríbele a Coach David para comenzar.
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:56, textAlign:"center",
          borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:24 }}>
          <p className="bc" style={{ fontSize:13, fontWeight:900, marginBottom:4 }}>
            COACH<span style={{ color:R }}>.</span>DAVID
          </p>
          <p className="b" style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>
            Guarda este link — es tu acceso único a todo tu programa
          </p>
        </div>
      </div>
    </div>
  )
}

function AccesoDenegado() {
  return (
    <div style={{ background:"#000", minHeight:"100vh", display:"flex",
      alignItems:"center", justifyContent:"center", flexDirection:"column",
      textAlign:"center", padding:32, fontFamily:"'Barlow',sans-serif", color:"#fff" }}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=Barlow:wght@300&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ fontFamily:"'Barlow Condensed',Impact,sans-serif", fontSize:60,
        fontWeight:900, color:"#E8000D", marginBottom:16 }}>🔒</div>
      <h1 style={{ fontFamily:"'Barlow Condensed',Impact,sans-serif", fontSize:32,
        fontWeight:900, textTransform:"uppercase", marginBottom:12 }}>
        Acceso restringido
      </h1>
      <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", maxWidth:360,
        lineHeight:1.7, fontWeight:300 }}>
        Este panel es exclusivo para clientes activos de Coach David.
      </p>
      <a href="https://wa.me/573243747367" target="_blank" rel="noopener noreferrer"
        style={{ marginTop:32, padding:"14px 32px", background:"#22c55e",
          color:"#fff", fontFamily:"'Barlow Condensed',Impact,sans-serif",
          fontSize:14, fontWeight:900, letterSpacing:"0.2em",
          textTransform:"uppercase", textDecoration:"none" }}>
        Contactar por WhatsApp
      </a>
    </div>
  )
}

function Loading() {
  return (
    <div style={{ background:"#000", minHeight:"100vh", display:"flex",
      alignItems:"center", justifyContent:"center", color:"#fff",
      fontFamily:"'Barlow',sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:32, height:32, border:"2px solid #E8000D",
          borderTopColor:"transparent", borderRadius:"50%",
          animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)" }}>Cargando tu panel...</p>
      </div>
    </div>
  )
}
