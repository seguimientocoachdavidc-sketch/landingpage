"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"

interface Cliente { token: string; nombre: string }
interface Dia { id: string; numero: number; nombre: string }
interface Ejercicio {
  id: string; orden: number; nombre: string
  nota_tecnica: string | null; es_biserie: boolean
  series_calentamiento: number; reps_calentamiento: string | null
  series_trabajo: number; reps_objetivo: string | null
  rir_objetivo: string | null; descanso: string | null
  video_url: string | null
}
interface RegAnterior { serie_num: number; kg: number | null; reps: number | null }

const R = "#E8000D"

/* ── Calentamiento ─────────────────────────────────── */
const CAL_GENERAL = { descripcion: "5 minutos de cardio suave a elección", zona: "Zona 1 — baja intensidad" }

const CAL_SUPERIOR = [
  { nombre: "Circunducción de hombro",     series: "2 × 15 reps",          link: "https://www.youtube.com/watch?v=aXR9dM8TZvc" },
  { nombre: "Rotación externa de hombro",  series: "2 × 10 reps",          link: "https://www.youtube.com/watch?v=m5t2BqBJW9w" },
  { nombre: "Rotación interna de hombro",  series: "2 × 10 reps",          link: "https://www.youtube.com/watch?v=96uCABKiHXU" },
  { nombre: "Abducción horizontal",        series: "1 × 15 reps",          link: "https://www.youtube.com/watch?v=k4SJcYp3cuk" },
  { nombre: "Flexión de brazo",            series: "1 × 15 reps c/brazo",  link: "https://www.youtube.com/watch?v=treKYMELQHY" },
  { nombre: "Rotación de hombro a 90°",   series: "1 × 15 reps c/brazo",  link: "https://www.youtube.com/shorts/iNn_sNA6TbU" },
]

const CAL_INFERIOR = [
  { nombre: "Rotación de cadera",          series: "2 × 10 reps",          link: "https://www.youtube.com/watch?v=qkrJXGVj_OQ" },
  { nombre: "Flexo/Extensión de cadera",   series: "2 × 15 reps",          link: "https://www.youtube.com/watch?v=UezSaXf9mtI" },
  { nombre: "Abducción de cadera",         series: "2 × 15 reps",          link: "https://www.youtube.com/shorts/TAHk1yccDmM" },
  { nombre: "Aperturas de cadera",         series: "1 × 15 reps",          link: "https://www.youtube.com/watch?v=Zv1wILGzeec" },
  { nombre: "Movilidad de tobillo I",      series: "1 × 15 reps c/pierna", link: "https://www.youtube.com/shorts/D-IYqUE92PI" },
  { nombre: "Movilidad de tobillo II",     series: "1 × 15 reps",          link: "https://www.youtube.com/watch?v=EG4YKX3-Ygk" },
]

function getTipo(nombreDia: string): "superior" | "inferior" {
  return nombreDia.toLowerCase().includes("inferior") ? "inferior" : "superior"
}

/* ── CORE ──────────────────────────────────────────── */
const CORE_OPCIONES = [
  {
    num: 1,
    ejercicios: [
      { nombre: "Plancha Estática",              protocolo: "3 series × 40 seg",                    descanso: "60 seg", link: null },
      { nombre: "Russian Twist",                 protocolo: "3 series × RIR 2",                     descanso: "60 seg", link: "https://www.youtube.com/shorts/-cPtvFdT8dc" },
      { nombre: "Crunch Abdominal",              protocolo: "3 series × RIR 2",                     descanso: "60 seg", link: null },
      { nombre: "Flexión de abdomen en máquina", protocolo: "2 series × RIR 2 · 1 serie × Fallo",  descanso: "60 seg", link: null },
    ],
  },
  {
    num: 2,
    ejercicios: [
      { nombre: "Plancha Dinámica (arrastre lateral)", protocolo: "3 series × RIR 4",                    descanso: "60 seg", link: "https://www.youtube.com/watch?v=zS0f6nCmwrI" },
      { nombre: "Plancha Lateral",                     protocolo: "3 series × 40 seg",                    descanso: "60 seg", link: "https://www.youtube.com/shorts/sLazig0sm8Q" },
      { nombre: "Caminata del Granjero Unilateral",    protocolo: "2 series × 20 pasos",                  descanso: "60 seg", link: "https://www.youtube.com/watch?v=P9EgrAyp1UA" },
      { nombre: "Flexión de abdomen en máquina",       protocolo: "2 series × RIR 2 · 1 serie × Fallo",  descanso: "60 seg", link: null },
    ],
  },
  {
    num: 3,
    ejercicios: [
      { nombre: "Caminata del Granjero Unilateral", protocolo: "2 series × 20 pasos",                  descanso: "60 seg", link: "https://www.youtube.com/watch?v=P9EgrAyp1UA" },
      { nombre: "PallOff Press",                    protocolo: "3 series × 10 reps",                   descanso: "60 seg", link: "https://www.youtube.com/watch?v=AH_QZLm_0-s" },
      { nombre: "Plancha Estática",                 protocolo: "4 series × 40 seg",                    descanso: "60 seg", link: null },
      { nombre: "Crunch Abdominal",                 protocolo: "3 series × RIR 2",                     descanso: "60 seg", link: null },
    ],
  },
]

/* ── Helpers ───────────────────────────────────────── */
function formatFecha(iso: string) {
  const [, m, d] = iso.split("-")
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${d} ${meses[parseInt(m)-1]}`
}
function parsearSeg(descanso: string | null): number {
  if (!descanso) return 60
  if (descanso.includes("2 min")) return 120
  if (descanso.includes("1:30")) return 90
  return 60
}

/* ── Subcomponente: Calentamiento ──────────────────── */
function SeccionCalentamiento({ nombreDia }: { nombreDia: string }) {
  const tipo = getTipo(nombreDia)
  const lista = tipo === "superior" ? CAL_SUPERIOR : CAL_INFERIOR
  return (
    <div style={{ marginBottom: 20, border: "1px solid rgba(255,255,255,0.1)", background: "#0a0a0a" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 3, height: 32, background: "#f59e0b", flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 900,
            textTransform: "uppercase", color: "#fcd34d", letterSpacing: "0.05em" }}>Calentamiento</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>
            Hazlo antes de empezar · Tren {tipo}
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(245,158,11,0.04)" }}>
        <div style={{ fontSize: 11, color: "#f59e0b", letterSpacing: "0.12em",
          textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>Aeróbico general</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{CAL_GENERAL.descripcion}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{CAL_GENERAL.zona}</div>
      </div>
      <div style={{ padding: "12px 16px 8px" }}>
        <div style={{ fontSize: 11, color: "#f59e0b", letterSpacing: "0.12em",
          textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>
          Dinámico — tren {tipo}
        </div>
        {lista.map((ej, i) => (
          <a key={i} href={ej.link} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "11px 12px", marginBottom: 6, background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)", textDecoration: "none" }}>
            <div>
              <div style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>{ej.nombre}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{ej.series}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: "#f59e0b" }}>Ver video</span>
              <div style={{ width: 26, height: 26, background: "#f59e0b", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#000", fontSize: 9, fontWeight: 900, marginLeft: 2 }}>▶</span>
              </div>
            </div>
          </a>
        ))}
      </div>
      <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
          ↓ Cuando termines el calentamiento, comienza con los ejercicios
        </div>
      </div>
    </div>
  )
}

/* ── Subcomponente: CORE ───────────────────────────── */
function SeccionCore() {
  const [opcion, setOpcion] = useState<number | null>(null)
  return (
    <div style={{ marginTop: 32, border: "1px solid rgba(99,102,241,0.3)", background: "#0a0a0a" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(99,102,241,0.15)",
        background: "rgba(99,102,241,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 3, height: 32, background: "#818cf8", flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 900,
            textTransform: "uppercase", color: "#a5b4fc", letterSpacing: "0.05em" }}>
            Entrenamiento CORE
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>
            Disponible cualquier día de la semana · Elige una opción
          </div>
        </div>
      </div>

      {/* Selector de opción */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em",
          textTransform: "uppercase", marginBottom: 10 }}>Selecciona la opción de hoy</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {CORE_OPCIONES.map(op => (
            <button key={op.num} onClick={() => setOpcion(opcion === op.num ? null : op.num)}
              style={{ padding: "12px 8px", textAlign: "center",
                border: `1px solid ${opcion === op.num ? "#818cf8" : "rgba(255,255,255,0.1)"}`,
                background: opcion === op.num ? "rgba(99,102,241,0.15)" : "transparent",
                color: opcion === op.num ? "#a5b4fc" : "rgba(255,255,255,0.45)",
                fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700,
                cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ fontSize: 10, color: opcion === op.num ? "#818cf8" : "rgba(255,255,255,0.25)",
                marginBottom: 2, letterSpacing: "0.1em" }}>OPCIÓN</div>
              {op.num}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de ejercicios de la opción seleccionada */}
      {opcion !== null && (
        <div style={{ padding: "14px 16px" }}>
          {CORE_OPCIONES.find(o => o.num === opcion)?.ejercicios.map((ej, i) => (
            <div key={i} style={{ marginBottom: 10, padding: "12px 14px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.1)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17,
                    fontWeight: 800, textTransform: "uppercase", color: "#fff", marginBottom: 6 }}>
                    <span style={{ color: "#818cf8", marginRight: 8, opacity: 0.6, fontSize: 13 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {ej.nombre}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ padding: "6px 10px", background: "rgba(99,102,241,0.08)",
                      border: "1px solid rgba(99,102,241,0.2)" }}>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em",
                        textTransform: "uppercase", marginBottom: 2 }}>Protocolo</div>
                      <div style={{ fontSize: 13, color: "#e0e7ff", fontWeight: 500 }}>{ej.protocolo}</div>
                    </div>
                    <div style={{ padding: "6px 10px", background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em",
                        textTransform: "uppercase", marginBottom: 2 }}>Descanso</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                        ⏱ {ej.descanso}
                      </div>
                    </div>
                  </div>
                </div>
                {ej.link && (
                  <a href={ej.link} target="_blank" rel="noopener noreferrer"
                    style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center",
                      gap: 4, textDecoration: "none", padding: "8px 10px",
                      background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    <div style={{ width: 28, height: 28, background: "#818cf8", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#fff", fontSize: 10, marginLeft: 2 }}>▶</span>
                    </div>
                    <span style={{ fontSize: 9, color: "#818cf8", letterSpacing: "0.05em",
                      textTransform: "uppercase" }}>Video</span>
                  </a>
                )}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: "10px 12px",
            background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)" }}>
            <div style={{ fontSize: 12, color: "rgba(165,180,252,0.6)", textAlign: "center" }}>
              Descansa 60 seg entre series · Mantén tensión en el core durante todo el movimiento
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══ PÁGINA PRINCIPAL ══════════════════════════════════ */
export default function PlanEntrenamientoPage() {
  const [token, setToken]           = useState<string | null>(null)
  const [cliente, setCliente]       = useState<Cliente | null>(null)
  const [denegado, setDenegado]     = useState(false)
  const [dias, setDias]             = useState<Dia[]>([])
  const [diaActivo, setDiaActivo]   = useState<Dia | null>(null)
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [sesionId, setSesionId]     = useState<string | null>(null)
  const [regs, setRegs]             = useState<Record<string, Record<number,{kg:string;reps:string}>>>({})
  const [ants, setAnts]             = useState<Record<string, {fecha:string; data:RegAnterior[]}>>({})
  const [cargando, setCargando]     = useState(true)
  const [toast, setToast]           = useState<string|null>(null)
  const [cronSeg, setCronSeg]       = useState(0)
  const [cronActivo, setCronActivo] = useState(false)
  const [sesionCerrada, setSesionCerrada] = useState(false)
  const [imgError, setImgError]     = useState<Record<string, boolean>>({})
  const [vistaCore, setVistaCore]   = useState(false)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500) }

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token")
    if (!t) { setDenegado(true); setCargando(false); return }
    setToken(t)
    supabase.from("clientes").select("token,nombre").eq("token", t).eq("activo", true).single()
      .then(({ data, error }) => {
        if (error || !data) { setDenegado(true); setCargando(false); return }
        setCliente(data)
        cargarDias(t)
      })
  }, [])

  const cargarDias = async (tok: string) => {
    const { data: prog } = await supabase
      .from("programas").select("id").eq("cliente_token", tok).eq("activo", true).single()
    if (!prog) { setCargando(false); return }
    const { data: ds } = await supabase
      .from("dias").select("id,numero,nombre").eq("programa_id", prog.id).order("numero")
    if (ds) setDias(ds)
    setCargando(false)
  }

  const seleccionarDia = useCallback(async (dia: Dia) => {
    if (!token) return
    setDiaActivo(dia); setEjercicios([]); setRegs({}); setAnts({})
    setSesionId(null); setSesionCerrada(false); setImgError({}); setVistaCore(false)

    const { data: ejs } = await supabase
      .from("ejercicios").select("*").eq("dia_id", dia.id).order("orden")
    if (!ejs) return
    setEjercicios(ejs)

    const base: Record<string, Record<number,{kg:string;reps:string}>> = {}
    ejs.forEach(e => { base[e.id] = {}; for (let s=1; s<=e.series_trabajo; s++) base[e.id][s]={kg:"",reps:""} })
    setRegs(base)

    const hoy = new Date().toISOString().split("T")[0]
    let { data: ses } = await supabase
      .from("sesiones").select("id,completada")
      .eq("cliente_token", token).eq("dia_id", dia.id).eq("fecha", hoy).single()
    if (!ses) {
      const { data: nueva } = await supabase
        .from("sesiones").insert({ cliente_token: token, dia_id: dia.id, fecha: hoy })
        .select("id,completada").single()
      ses = nueva
    }
    if (ses) {
      setSesionId(ses.id); setSesionCerrada(ses.completada ?? false)
      const { data: rHoy } = await supabase
        .from("registros").select("ejercicio_id,serie_num,kg,reps").eq("sesion_id", ses.id)
      if (rHoy) {
        const m = { ...base }
        rHoy.forEach(r => { if (m[r.ejercicio_id]) m[r.ejercicio_id][r.serie_num]={kg:r.kg?.toString()??"",reps:r.reps?.toString()??""} })
        setRegs(m)
      }
    }

    const { data: sesAnt } = await supabase
      .from("sesiones").select("id,fecha")
      .eq("cliente_token", token).eq("dia_id", dia.id).eq("completada", true)
      .neq("fecha", hoy).order("fecha", { ascending: false }).limit(1)
    if (sesAnt?.length) {
      const { data: rAnt } = await supabase
        .from("registros").select("ejercicio_id,serie_num,kg,reps").eq("sesion_id", sesAnt[0].id)
      if (rAnt) {
        const ma: Record<string, {fecha:string; data:RegAnterior[]}> = {}
        rAnt.forEach(r => {
          if (!ma[r.ejercicio_id]) ma[r.ejercicio_id]={fecha:sesAnt[0].fecha,data:[]}
          ma[r.ejercicio_id].data.push({serie_num:r.serie_num,kg:r.kg,reps:r.reps})
        })
        setAnts(ma)
      }
    }
  }, [token])

  const guardarSerie = async (ejId: string, serie: number) => {
    if (!sesionId || sesionCerrada) return
    const val = regs[ejId]?.[serie]
    if (!val?.kg && !val?.reps) return
    await supabase.from("registros").upsert(
      { sesion_id: sesionId, ejercicio_id: ejId, serie_num: serie,
        kg: parseFloat(val.kg)||null, reps: parseInt(val.reps)||null },
      { onConflict: "sesion_id,ejercicio_id,serie_num" }
    )
    showToast("✓ Serie guardada")
  }

  const cerrarSesion = async () => {
    if (!sesionId) return
    await supabase.from("sesiones")
      .update({ completada: true, completada_en: new Date().toISOString() }).eq("id", sesionId)
    setSesionCerrada(true)
    showToast("✓ Sesión cerrada y enviada al coach")
  }

  useEffect(() => {
    if (!cronActivo) return
    const i = setInterval(() => setCronSeg(s => {
      if (s <= 1) { setCronActivo(false); showToast("¡Fin del descanso! Siguiente serie"); return 0 }
      return s - 1
    }), 1000)
    return () => clearInterval(i)
  }, [cronActivo])

  const iniciarCron = (seg: number) => { setCronSeg(seg); setCronActivo(true) }
  const fmtCron = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`

  if (denegado) return (
    <div style={{ background:"#000", minHeight:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", flexDirection:"column", color:"#fff",
      fontFamily:"sans-serif", textAlign:"center", padding:32 }}>
      <div style={{ fontSize:48, color:R, marginBottom:16 }}>🔒</div>
      <h1 style={{ fontSize:28, fontWeight:900, marginBottom:12 }}>Acceso restringido</h1>
      <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)", maxWidth:340 }}>
        Esta página es exclusiva para clientes de Coach David.
      </p>
    </div>
  )

  if (cargando) return (
    <div style={{ background:"#000", minHeight:"100vh", display:"flex",
      alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:"sans-serif" }}>
      Cargando programa...
    </div>
  )

  return (
    <div style={{ background:"#000", minHeight:"100vh", color:"#fff",
      fontFamily:"'Barlow',sans-serif", paddingBottom:80 }}>

      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        input[type=number]{-moz-appearance:textfield}
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
      `}</style>

      {/* Header */}
      <div style={{ position:"sticky", top:0, background:"rgba(0,0,0,0.95)",
        backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.06)", zIndex:100 }}>
        <div style={{ height:2, background:R }}/>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"0 16px", height:52,
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, fontWeight:900 }}>
              COACH<span style={{ color:R }}>.</span>DAVID
            </span>
            <span style={{ width:1, height:14, background:"rgba(255,255,255,0.15)" }}/>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", letterSpacing:"0.2em", textTransform:"uppercase" }}>
              Entrenamiento
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:6, height:6, background:"#22c55e", borderRadius:"50%", animation:"blink 2s infinite" }}/>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{cliente?.nombre}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"24px 16px" }}>

        {/* Saludo */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, color:R, letterSpacing:"0.4em", textTransform:"uppercase", marginBottom:6 }}>
            Tu programa
          </div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:34, fontWeight:900,
            textTransform:"uppercase", lineHeight:1 }}>
            Hola, <span style={{ color:R }}>{cliente?.nombre.split(" ")[0]}</span>
          </h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:6 }}>
            Selecciona el día que vas a entrenar hoy
          </p>
        </div>

        {/* Tabs: días + CORE */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:6 }}>
            {dias.map(d => (
              <button key={d.id} onClick={() => { seleccionarDia(d); setVistaCore(false) }} style={{
                padding:"12px 10px", minWidth:100,
                border:`1px solid ${diaActivo?.id===d.id && !vistaCore ? R : "rgba(255,255,255,0.1)"}`,
                background:diaActivo?.id===d.id && !vistaCore ? `${R}18` : "transparent",
                color:diaActivo?.id===d.id && !vistaCore ? "#fff" : "rgba(255,255,255,0.45)",
                fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, fontWeight:700,
                cursor:"pointer", textAlign:"center", lineHeight:1.4, transition:"all 0.2s"
              }}>
                <div style={{ fontSize:10, color:diaActivo?.id===d.id && !vistaCore ? R : "rgba(255,255,255,0.3)",
                  marginBottom:3, letterSpacing:"0.1em" }}>DÍA {d.numero}</div>
                {d.nombre.replace(/Día \d+ — /,"")}
              </button>
            ))}
            {/* Botón CORE */}
            <button onClick={() => { setVistaCore(true); setDiaActivo(null) }} style={{
              padding:"12px 10px", minWidth:80,
              border:`1px solid ${vistaCore ? "#818cf8" : "rgba(255,255,255,0.1)"}`,
              background:vistaCore ? "rgba(99,102,241,0.15)" : "transparent",
              color:vistaCore ? "#a5b4fc" : "rgba(255,255,255,0.45)",
              fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, fontWeight:700,
              cursor:"pointer", textAlign:"center", lineHeight:1.4, transition:"all 0.2s"
            }}>
              <div style={{ fontSize:10, color:vistaCore ? "#818cf8" : "rgba(255,255,255,0.3)",
                marginBottom:3, letterSpacing:"0.1em" }}>ZONA</div>
              CORE
            </button>
          </div>
        </div>

        {/* Cronómetro sticky */}
        {cronActivo && (
          <div style={{ position:"sticky", top:54, zIndex:90, marginBottom:16,
            background:cronSeg<=10?"#7f1d1d":cronSeg<=30?"#78350f":"#052e16",
            border:`1px solid ${cronSeg<=10?R:cronSeg<=30?"#d97706":"#16a34a"}`,
            padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between",
            animation:"fadeUp 0.2s ease" }}>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13,
              letterSpacing:"0.15em", textTransform:"uppercase",
              color:cronSeg<=10?"#fca5a5":cronSeg<=30?"#fcd34d":"#86efac" }}>
              {cronSeg<=10?"¡Última!":cronSeg<=30?"Preparándose...":"Descansando"}
            </span>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:36, fontWeight:900,
              color:cronSeg<=10?R:cronSeg<=30?"#f59e0b":"#22c55e" }}>
              {fmtCron(cronSeg)}
            </span>
            <button onClick={()=>setCronActivo(false)}
              style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:20 }}>✕</button>
          </div>
        )}

        {/* ── Vista CORE ── */}
        {vistaCore && (
          <div style={{ animation:"fadeUp 0.3s ease" }}>
            <SeccionCore />
          </div>
        )}

        {/* ── Vista día de entrenamiento ── */}
        {diaActivo && !vistaCore && ejercicios.length > 0 && (
          <div style={{ animation:"fadeUp 0.3s ease" }}>

            <SeccionCalentamiento nombreDia={diaActivo.nombre} />

            {/* Label ejercicios */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ width:3, height:32, background:R }}/>
              <div>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, fontWeight:900,
                  textTransform:"uppercase", color:"rgba(255,255,255,0.9)", letterSpacing:"0.05em" }}>
                  Ejercicios de trabajo
                </div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:1 }}>
                  Ingresa kg y reps al terminar cada serie
                </div>
              </div>
            </div>

            {ejercicios.map((ej, idx) => {
              const ant = ants[ej.id]
              const tieneImg = ej.video_url && !imgError[ej.id]
              return (
                <div key={ej.id} style={{ marginBottom:20, border:"1px solid rgba(255,255,255,0.08)", background:"#0a0a0a" }}>

                  {tieneImg && (
                    <div style={{ width:"100%", height:170, overflow:"hidden",
                      borderBottom:"1px solid rgba(255,255,255,0.06)", position:"relative" }}>
                      <img src={ej.video_url!} alt={ej.nombre}
                        onError={() => setImgError(e=>({...e,[ej.id]:true}))}
                        style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", display:"block" }}/>
                      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:50,
                        background:"linear-gradient(to top, #0a0a0a, transparent)" }}/>
                    </div>
                  )}

                  {/* Cabecera */}
                  <div style={{ padding:"16px 16px 12px", borderBottom:"1px solid rgba(255,255,255,0.06)",
                    background:ej.es_biserie?"rgba(232,0,13,0.05)":"transparent" }}>
                    {ej.es_biserie && (
                      <div style={{ fontSize:10, background:`${R}25`, color:R, padding:"3px 10px",
                        letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:700,
                        marginBottom:8, display:"inline-block" }}>Biserie</div>
                    )}
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:900,
                      textTransform:"uppercase", lineHeight:1, marginBottom:6 }}>
                      <span style={{ color:R, marginRight:8, opacity:0.5, fontSize:16 }}>{String(idx+1).padStart(2,"0")}</span>
                      {ej.nombre}
                    </div>
                    {ej.nota_tecnica && (
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:12, lineHeight:1.5 }}>
                        {ej.nota_tecnica}
                      </div>
                    )}
                    {/* Protocolo */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8 }}>
                      {ej.reps_objetivo && (
                        <div style={{ padding:"10px 12px", background:"rgba(255,255,255,0.04)",
                          border:"1px solid rgba(255,255,255,0.1)" }}>
                          <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:"0.1em",
                            textTransform:"uppercase", marginBottom:3 }}>Reps objetivo</div>
                          <div style={{ fontSize:14, color:"#fff", fontWeight:500 }}>{ej.reps_objetivo}</div>
                        </div>
                      )}
                      {ej.rir_objetivo && (
                        <div style={{ padding:"10px 12px", background:"rgba(255,255,255,0.04)",
                          border:"1px solid rgba(255,255,255,0.1)" }}>
                          <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:"0.1em",
                            textTransform:"uppercase", marginBottom:3 }}>RIR / Intensidad</div>
                          <div style={{ fontSize:14, color:"#fff", fontWeight:500 }}>{ej.rir_objetivo}</div>
                        </div>
                      )}
                      {ej.descanso && (
                        <div style={{ padding:"10px 12px", background:"rgba(255,255,255,0.04)",
                          border:"1px solid rgba(255,255,255,0.1)",
                          gridColumn:ej.reps_objetivo&&ej.rir_objetivo?"1 / -1":"auto" }}>
                          <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:"0.1em",
                            textTransform:"uppercase", marginBottom:3 }}>Descanso</div>
                          <div style={{ fontSize:14, color:"#fff", fontWeight:500 }}>⏱ {ej.descanso}</div>
                        </div>
                      )}
                      {ej.series_calentamiento > 0 && (
                        <div style={{ padding:"10px 12px", background:"rgba(255,255,255,0.04)",
                          border:"1px solid rgba(255,255,255,0.1)" }}>
                          <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:"0.1em",
                            textTransform:"uppercase", marginBottom:3 }}>Calentamiento</div>
                          <div style={{ fontSize:14, color:"rgba(255,255,255,0.6)", fontWeight:500 }}>
                            {ej.series_calentamiento} serie{ej.series_calentamiento>1?"s":""} × {ej.reps_calentamiento}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Semana anterior */}
                  {ant && (
                    <div style={{ padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.05)",
                      background:"rgba(255,255,255,0.015)" }}>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em",
                        textTransform:"uppercase", marginBottom:8 }}>
                        Última sesión · {formatFecha(ant.fecha)}
                      </div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        {ant.data.sort((a,b)=>a.serie_num-b.serie_num).map(r => (
                          <div key={r.serie_num} style={{ display:"flex", flexDirection:"column",
                            alignItems:"center", padding:"6px 10px", background:"rgba(255,255,255,0.04)",
                            border:"1px solid rgba(255,255,255,0.08)", minWidth:52 }}>
                            <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginBottom:2 }}>S{r.serie_num}</div>
                            <div style={{ fontSize:14, color:"#fff", fontWeight:700,
                              fontFamily:"'Barlow Condensed',sans-serif" }}>{r.kg ?? "—"}</div>
                            <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>
                              {r.reps ? `${r.reps} reps` : "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Series */}
                  <div style={{ padding:"14px 16px" }}>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em",
                      textTransform:"uppercase", marginBottom:12 }}>Registra tu sesión de hoy</div>
                    {Array.from({length:ej.series_trabajo},(_,i)=>i+1).map(serie => {
                      const val = regs[ej.id]?.[serie]||{kg:"",reps:""}
                      const ok = !!val.kg && !!val.reps
                      return (
                        <div key={serie} style={{ marginBottom:10 }}>
                          <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginBottom:6,
                            fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, letterSpacing:"0.05em" }}>
                            SERIE {serie}
                            {ok && <span style={{ color:"#22c55e", marginLeft:8, fontSize:11 }}>✓</span>}
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 44px", gap:8 }}>
                            <div>
                              <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", marginBottom:4,
                                letterSpacing:"0.05em" }}>PESO (KG)</div>
                              <input type="number" inputMode="decimal" placeholder="0"
                                value={val.kg} disabled={sesionCerrada}
                                onChange={e => setRegs(r=>({...r,[ej.id]:{...r[ej.id],[serie]:{...r[ej.id][serie],kg:e.target.value}}}))}
                                onBlur={() => guardarSerie(ej.id, serie)}
                                style={{ width:"100%", padding:"12px 14px", background:"rgba(255,255,255,0.04)",
                                  border:`1px solid ${val.kg?"rgba(232,0,13,0.5)":"rgba(255,255,255,0.1)"}`,
                                  color:"#fff", fontSize:20, fontFamily:"'Barlow Condensed',sans-serif",
                                  fontWeight:900, outline:"none" }}
                              />
                            </div>
                            <div>
                              <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", marginBottom:4,
                                letterSpacing:"0.05em" }}>REPS</div>
                              <input type="number" inputMode="numeric" placeholder="0"
                                value={val.reps} disabled={sesionCerrada}
                                onChange={e => setRegs(r=>({...r,[ej.id]:{...r[ej.id],[serie]:{...r[ej.id][serie],reps:e.target.value}}}))}
                                onBlur={() => guardarSerie(ej.id, serie)}
                                style={{ width:"100%", padding:"12px 14px", background:"rgba(255,255,255,0.04)",
                                  border:`1px solid ${val.reps?"rgba(232,0,13,0.5)":"rgba(255,255,255,0.1)"}`,
                                  color:"#fff", fontSize:20, fontFamily:"'Barlow Condensed',sans-serif",
                                  fontWeight:900, outline:"none" }}
                              />
                            </div>
                            <div>
                              <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", marginBottom:4 }}>⏱</div>
                              <button onClick={()=>iniciarCron(parsearSeg(ej.descanso))}
                                disabled={sesionCerrada} title="Iniciar descanso"
                                style={{ width:"100%", height:46, background:"rgba(255,255,255,0.04)",
                                  border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)",
                                  cursor:"pointer", fontSize:18, display:"flex",
                                  alignItems:"center", justifyContent:"center" }}>▶</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Cerrar sesión */}
            <div style={{ marginTop:12, padding:20,
              border:`1px solid ${sesionCerrada?"rgba(34,197,94,0.2)":"rgba(255,255,255,0.08)"}`,
              background:sesionCerrada?"rgba(34,197,94,0.05)":"rgba(232,0,13,0.03)" }}>
              {sesionCerrada ? (
                <div style={{ textAlign:"center", color:"#22c55e",
                  fontFamily:"'Barlow Condensed',sans-serif", fontSize:15,
                  fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase" }}>
                  ✓ Sesión enviada al coach
                </div>
              ) : (
                <>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:16,
                    fontWeight:300, lineHeight:1.6 }}>
                    Al cerrar la sesión el resumen se envía automáticamente a Coach David.
                  </p>
                  <button onClick={cerrarSesion} style={{ width:"100%", padding:18,
                    background:"#22c55e", border:"none", color:"#fff",
                    fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, fontWeight:900,
                    letterSpacing:"0.2em", textTransform:"uppercase", cursor:"pointer" }}>
                    Cerrar sesión y enviar al coach ✓
                  </button>
                </>
              )}
            </div>

          </div>
        )}
      </div>

      {toast && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
          padding:"12px 20px", background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.4)",
          color:"#86efac", fontSize:14, zIndex:200, backdropFilter:"blur(8px)",
          animation:"fadeUp 0.3s ease", whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  )
}
