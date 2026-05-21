"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"

/* ── Tipos ─────────────────────────────────────────── */
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
const G = "#22c55e"
const B = "#3b82f6"
const O = "#f59e0b"

/* ── Distribución semanal hardcodeada del Excel ──── */
const DISTRIBUCION = [
  { dia: "NA",    label: "Descanso",                  tipo: "descanso",   color: "#374151", icono: "😴" },
  { dia: "Día 1", label: "Tren Superior + Easy Run Z2", tipo: "mixto",    color: "#7c3aed", icono: "🏋️🏃" },
  { dia: "Día 2", label: "Tren Inferior",              tipo: "muscu",      color: R,         icono: "🏋️" },
  { dia: "Día 3", label: "Cycling Continuo Z2 + CORE", tipo: "cycling",   color: B,         icono: "🚴🎯" },
  { dia: "Día 4", label: "Tren Superior + Pliometría", tipo: "muscu",      color: R,         icono: "🏋️⚡" },
  { dia: "Día 5", label: "Cycling Z2 + Carrera",       tipo: "cycling",   color: B,         icono: "🚴🏃" },
  { dia: "Día 6", label: "Bricks (Bici + Carrera)",    tipo: "bricks",    color: O,         icono: "🚴🏃🔥" },
]

/* ── Calentamiento tren superior ───────────────────── */
const CAL_SUPERIOR = [
  { nombre: "Circunducción de hombro",    series: "2 × 15 reps",         link: "https://www.youtube.com/watch?v=aXR9dM8TZvc" },
  { nombre: "Rotación externa de hombro", series: "2 × 10 reps",         link: "https://www.youtube.com/watch?v=m5t2BqBJW9w" },
  { nombre: "Rotación interna de hombro", series: "2 × 10 reps",         link: "https://www.youtube.com/watch?v=96uCABKiHXU" },
  { nombre: "Abducción horizontal",       series: "1 × 15 reps",         link: "https://www.youtube.com/watch?v=k4SJcYp3cuk" },
  { nombre: "Flexión de brazo",           series: "1 × 15 reps c/brazo", link: "https://www.youtube.com/watch?v=treKYMELQHY" },
  { nombre: "Rotación de hombro a 90°",  series: "1 × 15 reps c/brazo", link: "https://www.youtube.com/shorts/iNn_sNA6TbU" },
]

const CAL_INFERIOR = [
  { nombre: "Rotación de cadera",         series: "2 × 10 reps",          link: "https://www.youtube.com/watch?v=qkrJXGVj_OQ" },
  { nombre: "Flexo/Extensión de cadera",  series: "2 × 15 reps",          link: "https://www.youtube.com/watch?v=UezSaXf9mtI" },
  { nombre: "Abducción de cadera",        series: "2 × 15 reps",          link: "https://www.youtube.com/shorts/TAHk1yccDmM" },
  { nombre: "Aperturas de cadera",        series: "1 × 15 reps",          link: "https://www.youtube.com/watch?v=Zv1wILGzeec" },
  { nombre: "Movilidad de tobillo I",     series: "1 × 15 reps c/pierna", link: "https://www.youtube.com/shorts/D-IYqUE92PI" },
  { nombre: "Movilidad de tobillo II",    series: "1 × 15 reps",          link: "https://www.youtube.com/watch?v=EG4YKX3-Ygk" },
]

/* ── CORE (igual que Anderson) ─────────────────────── */
const CORE = [
  { num: 1, ejercicios: [
    { nombre: "Flexión de abdomen en máquina", protocolo: "2 × RIR 2 · 2 × Fallo", descanso: "60 seg", link: null },
    { nombre: "Russian Twist", protocolo: "3 × RIR 2", descanso: "60 seg", link: "https://www.youtube.com/shorts/-cPtvFdT8dc" },
    { nombre: "Crunch Abdominal", protocolo: "2 × RIR 2 · 1 × Fallo", descanso: "60 seg", link: null },
  ]},
  { num: 2, ejercicios: [
    { nombre: "Plancha Dinámica (arrastre lateral)", protocolo: "3 × RIR 2", descanso: "60 seg", link: "https://www.youtube.com/watch?v=zS0f6nCmwrI" },
    { nombre: "Crunch abdominal en polea", protocolo: "2 × RIR 2 · 2 × Fallo", descanso: "60 seg", link: null },
    { nombre: "Caminata del Granjero Unilateral", protocolo: "2 × 20 pasos", descanso: "60 seg", link: "https://www.youtube.com/watch?v=P9EgrAyp1UA" },
  ]},
  { num: 3, ejercicios: [
    { nombre: "Caminata del Granjero Unilateral", protocolo: "2 × 20 pasos", descanso: "60 seg", link: "https://www.youtube.com/watch?v=P9EgrAyp1UA" },
    { nombre: "PallOff Press", protocolo: "3 × 10 reps", descanso: "60 seg", link: "https://www.youtube.com/watch?v=AH_QZLm_0-s" },
    { nombre: "Flexión de abdomen en máquina", protocolo: "2 × RIR 2 · 2 × Fallo", descanso: "60 seg", link: null },
    { nombre: "Crunch Abdominal", protocolo: "2 × RIR 2 · 1 × Fallo", descanso: "60 seg", link: null },
  ]},
]

function parsearSeg(descanso: string | null): number {
  if (!descanso) return 60
  if (descanso.includes("2 min") || descanso.includes("120")) return 120
  if (descanso.includes("1:30") || descanso.includes("90")) return 90
  return 60
}

function parsearPorSerie(texto: string | null, serie: number): string {
  if (!texto) return "—"
  const partes = texto.split(" / ").map(s => s.trim())
  if (partes.length === 1) return partes[0]
  return partes[serie - 1] ?? partes[partes.length - 1]
}

function colorRIR(rir: string): string {
  const r = rir.toLowerCase()
  if (r.includes("fallo")) return "#ef4444"
  if (r.includes("rir 1")) return "#f97316"
  if (r.includes("rir 2")) return "#eab308"
  if (r.includes("rir 3") || r.includes("rir 4")) return "#22c55e"
  if (r === "na") return "#6b7280"
  return "rgba(255,255,255,0.5)"
}

function formatFecha(iso: string) {
  const [, m, d] = iso.split("-")
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${d} ${meses[parseInt(m)-1]}`
}

/* ══ PÁGINA PRINCIPAL ══════════════════════════════════ */
export default function PlanRivsPage() {
  const [token, setToken]           = useState<string | null>(null)
  const [cliente, setCliente]       = useState<Cliente | null>(null)
  const [denegado, setDenegado]     = useState(false)
  const [cargando, setCargando]     = useState(true)

  // Vista activa: "semana" | "muscu" | "running" | "cycling" | "core"
  const [vista, setVista]           = useState<"semana"|"muscu"|"running"|"cycling"|"core">("semana")

  // Musculación
  const [dias, setDias]             = useState<Dia[]>([])
  const [diaActivo, setDiaActivo]   = useState<Dia | null>(null)
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [sesionId, setSesionId]     = useState<string | null>(null)
  const [regs, setRegs]             = useState<Record<string, Record<number,{kg:string;reps:string}>>>({})
  const [ants, setAnts]             = useState<Record<string, {fecha:string; data:RegAnterior[]}>>({})
  const [sesionCerrada, setSesionCerrada] = useState(false)
  const [imgError, setImgError]     = useState<Record<string, boolean>>({})

  // Running
  const [semanasRun, setSemanasRun]   = useState<any[]>([])
  const [semanaRunActiva, setSemanaRunActiva] = useState<any>(null)
  const [sesionesRun, setSesionesRun] = useState<any[]>([])
  const [sesionRunAbierta, setSesionRunAbierta] = useState<number|null>(null)

  // Cycling
  const [semanasCyc, setSemanasCyc]   = useState<any[]>([])
  const [semanaCycActiva, setSemanaCycActiva] = useState<any>(null)
  const [sesionesCyc, setSesionesCyc] = useState<any[]>([])
  const [sesionCycAbierta, setSesionCycAbierta] = useState<number|null>(null)

  // CORE
  const [coreOpcion, setCoreOpcion] = useState<number|null>(null)

  // Cronómetro
  const [cronSeg, setCronSeg]       = useState(0)
  const [cronActivo, setCronActivo] = useState(false)

  // Toast
  const [toast, setToast]           = useState<string|null>(null)
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3500) }

  /* ── Auth ── */
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token")
    if (!t) { setDenegado(true); setCargando(false); return }
    setToken(t)
    supabase.from("clientes").select("token,nombre").eq("token", t).eq("activo", true).single()
      .then(({ data, error }) => {
        if (error || !data) { setDenegado(true); setCargando(false); return }
        setCliente(data)
        cargarTodo(t)
      })
  }, [])

  const cargarTodo = async (tok: string) => {
    // Musculación
    const { data: prog } = await supabase
      .from("programas").select("id").eq("cliente_token", tok).eq("activo", true).single()
    if (prog) {
      const { data: ds } = await supabase
        .from("dias").select("id,numero,nombre").eq("programa_id", prog.id).order("numero")
      if (ds) setDias(ds)
    }

    // Running
    const { data: progRun } = await supabase
      .from("programas_running").select("id").eq("cliente_token", tok).eq("activo", true).single()
    if (progRun) {
      const { data: sems } = await supabase
        .from("semanas_running").select("*").eq("programa_id", progRun.id).order("numero")
      if (sems) { setSemanasRun(sems); setSemanaRunActiva(sems[0]) }
    }

    // Cycling
    const { data: progCyc } = await supabase
      .from("programas_cycling").select("id").eq("cliente_token", tok).eq("activo", true).single()
    if (progCyc) {
      const { data: sems } = await supabase
        .from("semanas_cycling").select("*").eq("programa_id", progCyc.id).order("numero")
      if (sems) { setSemanasCyc(sems); setSemanaCycActiva(sems[0]) }
    }

    setCargando(false)
  }

  /* ── Seleccionar día musculación ── */
  const seleccionarDia = useCallback(async (dia: Dia) => {
    if (!token) return
    setDiaActivo(dia); setEjercicios([]); setRegs({}); setAnts({})
    setSesionId(null); setSesionCerrada(false); setImgError({})

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
    showToast("✓ Sesión enviada al coach")
  }

  /* ── Running: cargar sesiones de semana ── */
  const cargarSesionesRun = useCallback(async (semanaId: string) => {
    if (!token) return
    const { data } = await supabase
      .from("sesiones_running").select("*")
      .eq("cliente_token", token).eq("semana_id", semanaId).order("numero_sesion")
    if (data) setSesionesRun(data)
  }, [token])

  useEffect(() => { if (semanaRunActiva) cargarSesionesRun(semanaRunActiva.id) }, [semanaRunActiva, cargarSesionesRun])

  /* ── Cycling: cargar sesiones de semana ── */
  const cargarSesionesCyc = useCallback(async (semanaId: string) => {
    if (!token) return
    const { data } = await supabase
      .from("sesiones_cycling").select("*")
      .eq("cliente_token", token).eq("semana_cycling_id", semanaId).order("numero_sesion")
    if (data) setSesionesCyc(data)
  }, [token])

  useEffect(() => { if (semanaCycActiva) cargarSesionesCyc(semanaCycActiva.id) }, [semanaCycActiva, cargarSesionesCyc])

  /* ── Cronómetro ── */
  useEffect(() => {
    if (!cronActivo) return
    const i = setInterval(() => setCronSeg(s => {
      if (s <= 1) { setCronActivo(false); showToast("¡Fin del descanso!"); return 0 }
      return s - 1
    }), 1000)
    return () => clearInterval(i)
  }, [cronActivo])

  const fmtCron = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`

  /* ── Guardar sesión running ── */
  const guardarSesionRun = async (numSesion: number, form: any, completar: boolean) => {
    if (!token || !semanaRunActiva) return
    const existing = sesionesRun.find(s => s.numero_sesion === numSesion)
    const payload = {
      cliente_token: token, semana_id: semanaRunActiva.id, numero_sesion: numSesion,
      fecha: new Date().toISOString().split("T")[0],
      tiempo_min: parseFloat(form.tiempo_min)||null,
      distancia_km: parseFloat(form.distancia_km)||null,
      ritmo_min_km: form.ritmo_min_km||null,
      pulsaciones_prom: parseInt(form.pulsaciones_prom)||null,
      zona: form.zona||null, nota: form.nota||null, completada: completar
    }
    if (existing) {
      await supabase.from("sesiones_running").update(payload).eq("id", existing.id)
    } else {
      await supabase.from("sesiones_running").insert(payload)
    }
    showToast(completar ? "✓ Sesión completada" : "✓ Datos guardados")
    cargarSesionesRun(semanaRunActiva.id)
  }

  /* ── Guardar sesión cycling ── */
  const guardarSesionCyc = async (numSesion: number, form: any, completar: boolean) => {
    if (!token || !semanaCycActiva) return
    const existing = sesionesCyc.find(s => s.numero_sesion === numSesion)
    const payload = {
      cliente_token: token, semana_cycling_id: semanaCycActiva.id, numero_sesion: numSesion,
      fecha: new Date().toISOString().split("T")[0],
      tiempo_min: parseFloat(form.tiempo_min)||null,
      distancia_km: parseFloat(form.distancia_km)||null,
      ritmo_promedio: form.ritmo_promedio||null,
      pulsaciones_prom: parseInt(form.pulsaciones_prom)||null,
      zona: form.zona||null, nota: form.nota||null, completada: completar
    }
    if (existing) {
      await supabase.from("sesiones_cycling").update(payload).eq("id", existing.id)
    } else {
      await supabase.from("sesiones_cycling").insert(payload)
    }
    showToast(completar ? "✓ Sesión completada" : "✓ Datos guardados")
    cargarSesionesCyc(semanaCycActiva.id)
  }

  if (denegado) return (
    <div style={{background:"#000",minHeight:"100vh",display:"flex",alignItems:"center",
      justifyContent:"center",flexDirection:"column",color:"#fff",textAlign:"center",padding:32}}>
      <div style={{fontSize:48,color:R,marginBottom:16}}>🔒</div>
      <h1 style={{fontSize:28,fontWeight:900,marginBottom:12}}>Acceso restringido</h1>
      <p style={{fontSize:14,color:"rgba(255,255,255,0.45)",maxWidth:340}}>
        Esta página es exclusiva para clientes de Coach David.
      </p>
    </div>
  )

  if (cargando) return (
    <div style={{background:"#000",minHeight:"100vh",display:"flex",
      alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"sans-serif"}}>
      Cargando programa de Rivs...
    </div>
  )

  const isTipo = (t: string) => vista === t

  return (
    <div style={{background:"#000",minHeight:"100vh",color:"#fff",
      fontFamily:"'Barlow',sans-serif",paddingBottom:80}}>

      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        input[type=number]{-moz-appearance:textfield}
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        textarea{box-sizing:border-box}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
      `}</style>

      {/* Header */}
      <div style={{position:"sticky",top:0,background:"rgba(0,0,0,0.97)",
        backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,0.06)",zIndex:100}}>
        <div style={{height:2,background:`linear-gradient(90deg,${R},${B},${G})`}}/>
        <div style={{maxWidth:720,margin:"0 auto",padding:"0 16px",height:52,
          display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:900}}>
              COACH<span style={{color:R}}>.</span>DAVID
            </span>
            <span style={{width:1,height:14,background:"rgba(255,255,255,0.15)"}}/>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.4)",letterSpacing:"0.2em",textTransform:"uppercase"}}>
              Triatlón
            </span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:6,height:6,background:G,borderRadius:"50%",animation:"blink 2s infinite"}}/>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>{cliente?.nombre}</span>
          </div>
        </div>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"24px 16px"}}>

        {/* Saludo */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:R,letterSpacing:"0.4em",textTransform:"uppercase",marginBottom:6}}>
            Plan completo
          </div>
          <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,fontWeight:900,
            textTransform:"uppercase",lineHeight:1}}>
            Hola, <span style={{color:R}}>{cliente?.nombre}</span>
          </h1>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginTop:6}}>
            Programa triatlón · Musculación · Running · Cycling
          </p>
        </div>

        {/* Navegación principal */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:24}}>
          {[
            {k:"semana", l:"📅 Semana", c:"rgba(255,255,255,0.8)"},
            {k:"muscu",  l:"🏋️ Musculación", c:R},
            {k:"running",l:"🏃 Running", c:G},
            {k:"cycling",l:"🚴 Cycling", c:B},
            {k:"core",   l:"🎯 CORE", c:"#818cf8"},
          ].map(tab => (
            <button key={tab.k} onClick={() => setVista(tab.k as any)} style={{
              padding:"9px 14px", flex:1, minWidth:80,
              border:`1px solid ${vista===tab.k ? tab.c : "rgba(255,255,255,0.1)"}`,
              background:vista===tab.k ? `${tab.c}18` : "transparent",
              color:vista===tab.k ? tab.c : "rgba(255,255,255,0.45)",
              fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,
              cursor:"pointer",textAlign:"center",transition:"all 0.2s"
            }}>{tab.l}</button>
          ))}
        </div>

        {/* ═══ VISTA SEMANA ═══ */}
        {vista === "semana" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em",
              textTransform:"uppercase",marginBottom:14}}>Distribución semanal</div>

            {DISTRIBUCION.map((d, i) => (
              <div key={i} style={{marginBottom:8,padding:"14px 16px",
                border:`1px solid ${d.color}30`,
                background:`${d.color}08`,
                display:"flex",alignItems:"center",gap:14}}>
                <div style={{fontSize:24,flexShrink:0}}>{d.icono}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,
                      fontWeight:700,color:d.color,letterSpacing:"0.1em",
                      textTransform:"uppercase",minWidth:40}}>{d.dia}</span>
                    <span style={{fontSize:15,color:"#fff",fontWeight:500}}>{d.label}</span>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {d.tipo === "muscu" && (
                      <span style={{fontSize:10,padding:"2px 8px",background:`${R}20`,
                        color:R,fontFamily:"'Barlow Condensed',sans-serif",
                        fontWeight:700,letterSpacing:"0.08em"}}>MUSCULACIÓN</span>
                    )}
                    {d.tipo === "mixto" && (
                      <>
                        <span style={{fontSize:10,padding:"2px 8px",background:`${R}20`,color:R,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:"0.08em"}}>MUSCULACIÓN</span>
                        <span style={{fontSize:10,padding:"2px 8px",background:`${G}20`,color:G,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:"0.08em"}}>RUNNING</span>
                      </>
                    )}
                    {(d.tipo === "cycling" || d.tipo === "bricks") && (
                      <span style={{fontSize:10,padding:"2px 8px",background:`${B}20`,
                        color:B,fontFamily:"'Barlow Condensed',sans-serif",
                        fontWeight:700,letterSpacing:"0.08em"}}>CYCLING</span>
                    )}
                    {d.tipo === "cycling" && d.label.includes("CORE") && (
                      <span style={{fontSize:10,padding:"2px 8px",background:"rgba(129,140,248,0.2)",
                        color:"#818cf8",fontFamily:"'Barlow Condensed',sans-serif",
                        fontWeight:700,letterSpacing:"0.08em"}}>CORE</span>
                    )}
                    {d.tipo === "bricks" && (
                      <span style={{fontSize:10,padding:"2px 8px",background:`${O}20`,
                        color:O,fontFamily:"'Barlow Condensed',sans-serif",
                        fontWeight:700,letterSpacing:"0.08em"}}>BRICKS</span>
                    )}
                    {d.tipo === "descanso" && (
                      <span style={{fontSize:10,padding:"2px 8px",background:"rgba(55,65,81,0.4)",
                        color:"rgba(255,255,255,0.4)",fontFamily:"'Barlow Condensed',sans-serif",
                        fontWeight:700,letterSpacing:"0.08em"}}>DESCANSO</span>
                    )}
                  </div>
                </div>
                {d.tipo !== "descanso" && (
                  <button onClick={() => {
                    if (d.tipo === "muscu" || d.tipo === "mixto") setVista("muscu")
                    else if (d.tipo === "cycling" || d.tipo === "bricks") setVista("cycling")
                  }} style={{padding:"6px 12px",background:"rgba(255,255,255,0.06)",
                    border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.6)",
                    fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,
                    cursor:"pointer",letterSpacing:"0.08em",flexShrink:0}}>
                    VER →
                  </button>
                )}
              </div>
            ))}

            {/* Zonas de referencia */}
            <div style={{marginTop:20,padding:"14px 16px",
              border:"1px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.02)"}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em",
                textTransform:"uppercase",marginBottom:10}}>Zonas de referencia (lpm)</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[["Z1","120",G],["Z2","139",G],["Z3","152",O],["Z4","165","#f97316"],["Z5","177",R]].map(([z,v,c]) => (
                  <div key={z} style={{padding:"6px 12px",background:`${c}15`,
                    border:`1px solid ${c}30`,textAlign:"center",flex:1,minWidth:60}}>
                    <div style={{fontSize:11,color:c as string,fontWeight:700,
                      fontFamily:"'Barlow Condensed',sans-serif"}}>{z}</div>
                    <div style={{fontSize:14,color:"#fff",fontWeight:500}}>{v}</div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>ppm</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ VISTA MUSCULACIÓN ═══ */}
        {vista === "muscu" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>

            {/* Calentamiento dinámico según día */}
            {diaActivo && (
              <div style={{marginBottom:16,padding:"12px 16px",
                border:"1px solid rgba(245,158,11,0.2)",background:"rgba(245,158,11,0.04)"}}>
                <div style={{fontSize:11,color:O,letterSpacing:"0.1em",
                  textTransform:"uppercase",marginBottom:10,fontWeight:700}}>
                  Calentamiento — {diaActivo.nombre.includes("Inferior") ? "Tren Inferior" : "Tren Superior"}
                </div>
                {(diaActivo.nombre.includes("Inferior") ? CAL_INFERIOR : CAL_SUPERIOR).map((ej,i) => (
                  <a key={i} href={ej.link} target="_blank" rel="noopener noreferrer"
                    style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                      padding:"9px 12px",marginBottom:5,background:"rgba(255,255,255,0.03)",
                      border:"1px solid rgba(255,255,255,0.06)",textDecoration:"none"}}>
                    <div>
                      <div style={{fontSize:13,color:"#fff",fontWeight:500}}>{ej.nombre}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{ej.series}</div>
                    </div>
                    <div style={{width:24,height:24,background:O,borderRadius:"50%",
                      display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{color:"#000",fontSize:9,fontWeight:900,marginLeft:2}}>▶</span>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Selector días */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
              {dias.map(d => (
                <button key={d.id} onClick={() => seleccionarDia(d)} style={{
                  padding:"11px 10px", flex:1,
                  border:`1px solid ${diaActivo?.id===d.id ? R : "rgba(255,255,255,0.1)"}`,
                  background:diaActivo?.id===d.id ? `${R}18` : "transparent",
                  color:diaActivo?.id===d.id ? "#fff" : "rgba(255,255,255,0.45)",
                  fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,
                  cursor:"pointer",textAlign:"center",lineHeight:1.4,transition:"all 0.2s"
                }}>
                  <div style={{fontSize:10,color:diaActivo?.id===d.id?R:"rgba(255,255,255,0.3)",
                    marginBottom:3,letterSpacing:"0.1em"}}>DÍA {d.numero}</div>
                  {d.nombre.replace(/Día \d+ — /,"")}
                </button>
              ))}
            </div>

            {/* Cronómetro sticky */}
            {cronActivo && (
              <div style={{position:"sticky",top:54,zIndex:90,marginBottom:14,
                background:cronSeg<=10?"#7f1d1d":cronSeg<=30?"#78350f":"#052e16",
                border:`1px solid ${cronSeg<=10?R:cronSeg<=30?O:G}`,
                padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",
                animation:"fadeUp 0.2s ease"}}>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,
                  letterSpacing:"0.15em",textTransform:"uppercase",
                  color:cronSeg<=10?"#fca5a5":cronSeg<=30?"#fcd34d":"#86efac"}}>
                  {cronSeg<=10?"¡Última!":cronSeg<=30?"Preparándose...":"Descansando"}
                </span>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:36,fontWeight:900,
                  color:cronSeg<=10?R:cronSeg<=30?O:G}}>{fmtCron(cronSeg)}</span>
                <button onClick={()=>setCronActivo(false)}
                  style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:20}}>✕</button>
              </div>
            )}

            {/* Ejercicios */}
            {diaActivo && ejercicios.map((ej, idx) => {
              const ant = ants[ej.id]
              const tieneImg = ej.video_url && !imgError[ej.id]
              return (
                <div key={ej.id} style={{marginBottom:18,border:"1px solid rgba(255,255,255,0.08)",background:"#0a0a0a"}}>
                  {tieneImg && (
                    <div style={{width:"100%",height:160,overflow:"hidden",borderBottom:"1px solid rgba(255,255,255,0.06)",position:"relative"}}>
                      <img src={ej.video_url!} alt={ej.nombre}
                        onError={()=>setImgError(e=>({...e,[ej.id]:true}))}
                        style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                      <div style={{position:"absolute",bottom:0,left:0,right:0,height:40,background:"linear-gradient(to top,#0a0a0a,transparent)"}}/>
                    </div>
                  )}
                  <div style={{padding:"14px 16px 10px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:900,
                      textTransform:"uppercase",lineHeight:1,marginBottom:6}}>
                      <span style={{color:R,marginRight:8,opacity:0.5,fontSize:14}}>{String(idx+1).padStart(2,"0")}</span>
                      {ej.nombre}
                    </div>
                    {ej.nota_tecnica && (
                      <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:10,lineHeight:1.5}}>
                        {ej.nota_tecnica}
                      </div>
                    )}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      {ej.descanso && (
                        <div style={{padding:"8px 10px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)"}}>
                          <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>Descanso</div>
                          <div style={{fontSize:13,color:"#fff",fontWeight:500}}>⏱ {ej.descanso.split(" / ")[0]}</div>
                        </div>
                      )}
                      {ej.series_calentamiento > 0 && (
                        <div style={{padding:"8px 10px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)"}}>
                          <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>Calentamiento</div>
                          <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",fontWeight:500}}>
                            {ej.series_calentamiento} × {ej.reps_calentamiento}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {ant && (
                    <div style={{padding:"8px 16px",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.015)"}}>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>
                        Última sesión · {formatFecha(ant.fecha)}
                      </div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        {ant.data.sort((a,b)=>a.serie_num-b.serie_num).map(r => (
                          <div key={r.serie_num} style={{display:"flex",flexDirection:"column",
                            alignItems:"center",padding:"5px 10px",background:"rgba(255,255,255,0.04)",
                            border:"1px solid rgba(255,255,255,0.08)",minWidth:50}}>
                            <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:2}}>S{r.serie_num}</div>
                            <div style={{fontSize:14,color:"#fff",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>{r.kg ?? "—"}</div>
                            <div style={{fontSize:10,color:"rgba(255,255,255,0.5)"}}>{r.reps ? `${r.reps}r` : "—"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Series 4 columnas */}
                  <div style={{padding:"12px 16px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 72px 1fr 1fr",gap:6,
                      marginBottom:8,fontSize:9,color:"rgba(255,255,255,0.25)",
                      letterSpacing:"0.1em",textTransform:"uppercase"}}>
                      <span>Reps objetivo</span><span>RIR</span><span>Peso kg</span><span>Reps</span>
                    </div>
                    {Array.from({length:ej.series_trabajo},(_,i)=>i+1).map(serie => {
                      const val = regs[ej.id]?.[serie]||{kg:"",reps:""}
                      const ok = !!val.kg && !!val.reps
                      const repsObj = parsearPorSerie(ej.reps_objetivo, serie)
                      const rirObj  = parsearPorSerie(ej.rir_objetivo, serie)
                      const rc = colorRIR(rirObj)
                      return (
                        <div key={serie} style={{marginBottom:10}}>
                          <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:5,
                            fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>
                            SERIE {serie} {ok && <span style={{color:G}}>✓</span>}
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 72px 1fr 1fr",gap:6,alignItems:"stretch"}}>
                            <div style={{padding:"10px 8px",background:"rgba(255,255,255,0.03)",
                              border:"1px solid rgba(255,255,255,0.07)",display:"flex",
                              alignItems:"center",justifyContent:"center",textAlign:"center"}}>
                              <span style={{fontSize:12,color:"rgba(255,255,255,0.75)",fontWeight:500}}>{repsObj}</span>
                            </div>
                            <div style={{padding:"10px 6px",background:`${rc}12`,
                              border:`1px solid ${rc}35`,display:"flex",
                              alignItems:"center",justifyContent:"center",textAlign:"center"}}>
                              <span style={{fontSize:12,color:rc,fontWeight:700,
                                fontFamily:"'Barlow Condensed',sans-serif"}}>{rirObj}</span>
                            </div>
                            <input type="number" inputMode="decimal" placeholder="0"
                              value={val.kg} disabled={sesionCerrada}
                              onChange={e=>setRegs(r=>({...r,[ej.id]:{...r[ej.id],[serie]:{...r[ej.id][serie],kg:e.target.value}}}))}
                              onBlur={()=>guardarSerie(ej.id,serie)}
                              style={{padding:"10px 8px",background:"rgba(255,255,255,0.04)",
                                border:`1px solid ${val.kg?"rgba(232,0,13,0.5)":"rgba(255,255,255,0.1)"}`,
                                color:"#fff",fontSize:18,fontFamily:"'Barlow Condensed',sans-serif",
                                fontWeight:900,outline:"none",textAlign:"center",width:"100%"}}
                            />
                            <input type="number" inputMode="numeric" placeholder="0"
                              value={val.reps} disabled={sesionCerrada}
                              onChange={e=>setRegs(r=>({...r,[ej.id]:{...r[ej.id],[serie]:{...r[ej.id][serie],reps:e.target.value}}}))}
                              onBlur={()=>guardarSerie(ej.id,serie)}
                              style={{padding:"10px 8px",background:"rgba(255,255,255,0.04)",
                                border:`1px solid ${val.reps?"rgba(232,0,13,0.5)":"rgba(255,255,255,0.1)"}`,
                                color:"#fff",fontSize:18,fontFamily:"'Barlow Condensed',sans-serif",
                                fontWeight:900,outline:"none",textAlign:"center",width:"100%"}}
                            />
                          </div>
                          <button onClick={()=>{setCronSeg(parsearSeg(ej.descanso));setCronActivo(true)}}
                            disabled={sesionCerrada}
                            style={{width:"100%",marginTop:5,padding:"6px",
                              background:"rgba(255,255,255,0.03)",
                              border:"1px solid rgba(255,255,255,0.07)",
                              color:"rgba(255,255,255,0.35)",cursor:"pointer",fontSize:11,
                              fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.1em",
                              textTransform:"uppercase",display:"flex",alignItems:"center",
                              justifyContent:"center",gap:6}}>
                            <span>⏱</span> Iniciar descanso
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {diaActivo && ejercicios.length > 0 && (
              <div style={{marginTop:8,padding:18,
                border:`1px solid ${sesionCerrada?"rgba(34,197,94,0.2)":"rgba(255,255,255,0.08)"}`,
                background:sesionCerrada?"rgba(34,197,94,0.04)":"rgba(232,0,13,0.03)"}}>
                {sesionCerrada ? (
                  <div style={{textAlign:"center",color:G,fontFamily:"'Barlow Condensed',sans-serif",
                    fontSize:14,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase"}}>
                    ✓ Sesión enviada al coach
                  </div>
                ) : (
                  <>
                    <p style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginBottom:14,fontWeight:300,lineHeight:1.6}}>
                      Al cerrar la sesión el resumen se envía automáticamente a Coach David.
                    </p>
                    <button onClick={cerrarSesion} style={{width:"100%",padding:16,
                      background:G,border:"none",color:"#fff",
                      fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:900,
                      letterSpacing:"0.2em",textTransform:"uppercase",cursor:"pointer"}}>
                      Cerrar sesión y enviar al coach ✓
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ VISTA RUNNING ═══ */}
        {vista === "running" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{fontSize:11,color:G,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14}}>
              Plan running · 7 semanas
            </div>

            {/* Selector semanas */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
              {semanasRun.map(s => (
                <button key={s.id} onClick={()=>{setSemanaRunActiva(s);setSesionRunAbierta(null)}}
                  style={{padding:"8px 12px",minWidth:48,
                    border:`1px solid ${semanaRunActiva?.id===s.id ? G : "rgba(255,255,255,0.1)"}`,
                    background:semanaRunActiva?.id===s.id ? "rgba(34,197,94,0.15)" : "transparent",
                    color:semanaRunActiva?.id===s.id ? G : "rgba(255,255,255,0.4)",
                    fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,
                    cursor:"pointer",transition:"all 0.15s"}}>
                  S{s.numero}
                </button>
              ))}
            </div>

            {semanaRunActiva && [
              {num:1,dia:"Día 1",tipo:"Easy Run / Técnica",icono:"🏃",
                desc:semanaRunActiva.sesion_1_descripcion,
                obj:semanaRunActiva.sesion_1_objetivo_min ? `${semanaRunActiva.sesion_1_objetivo_min}` : semanaRunActiva.sesion_1_objetivo},
              {num:2,dia:"Día 2",tipo:"Intervalos / Técnica",icono:"⚡",
                desc:semanaRunActiva.sesion_2_descripcion,
                obj:semanaRunActiva.sesion_2_objetivo},
              {num:3,dia:"Día 3",tipo:"Rodada Larga",icono:"🛤️",
                desc:semanaRunActiva.sesion_3_descripcion,
                obj:semanaRunActiva.sesion_3_objetivo_min ? `${semanaRunActiva.sesion_3_objetivo_min}` : semanaRunActiva.sesion_3_objetivo},
            ].map(ses => {
              const existing = sesionesRun.find(s => s.numero_sesion === ses.num)
              const abierta = sesionRunAbierta === ses.num
              return <SesionCardRun key={ses.num} ses={ses} existing={existing}
                abierta={abierta} onToggle={()=>setSesionRunAbierta(abierta?null:ses.num)}
                onGuardar={(form,completar)=>guardarSesionRun(ses.num,form,completar)} accentColor={G}/>
            })}
          </div>
        )}

        {/* ═══ VISTA CYCLING ═══ */}
        {vista === "cycling" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{fontSize:11,color:B,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14}}>
              Plan cycling · 6 semanas
            </div>

            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
              {semanasCyc.map(s => (
                <button key={s.id} onClick={()=>{setSemanaCycActiva(s);setSesionCycAbierta(null)}}
                  style={{padding:"8px 12px",minWidth:48,
                    border:`1px solid ${semanaCycActiva?.id===s.id ? B : "rgba(255,255,255,0.1)"}`,
                    background:semanaCycActiva?.id===s.id ? "rgba(59,130,246,0.15)" : "transparent",
                    color:semanaCycActiva?.id===s.id ? B : "rgba(255,255,255,0.4)",
                    fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,
                    cursor:"pointer",transition:"all 0.15s"}}>
                  S{s.numero}
                </button>
              ))}
            </div>

            {semanaCycActiva && [
              {num:1,dia:"Día 3",tipo:"Continuo Z2",icono:"🚴",
                desc:semanaCycActiva.sesion_1_descripcion, obj:semanaCycActiva.sesion_1_objetivo},
              {num:2,dia:"Día 5",tipo:"Bricks Z2-Z3",icono:"🔥",
                desc:semanaCycActiva.sesion_2_descripcion, obj:semanaCycActiva.sesion_2_objetivo},
              {num:3,dia:"Día 6",tipo:"Opcional",icono:"✨",
                desc:semanaCycActiva.sesion_3_descripcion, obj:semanaCycActiva.sesion_3_objetivo},
            ].map(ses => {
              const existing = sesionesCyc.find(s => s.numero_sesion === ses.num)
              const abierta = sesionCycAbierta === ses.num
              return <SesionCardCyc key={ses.num} ses={ses} existing={existing}
                abierta={abierta} onToggle={()=>setSesionCycAbierta(abierta?null:ses.num)}
                onGuardar={(form,completar)=>guardarSesionCyc(ses.num,form,completar)} accentColor={B}/>
            })}
          </div>
        )}

        {/* ═══ VISTA CORE ═══ */}
        {vista === "core" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{fontSize:11,color:"#818cf8",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14}}>
              Entrenamiento CORE · 3 opciones
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:20}}>
              {CORE.map(op => (
                <button key={op.num} onClick={()=>setCoreOpcion(coreOpcion===op.num?null:op.num)}
                  style={{padding:"12px 8px",textAlign:"center",
                    border:`1px solid ${coreOpcion===op.num?"#818cf8":"rgba(255,255,255,0.1)"}`,
                    background:coreOpcion===op.num?"rgba(99,102,241,0.15)":"transparent",
                    color:coreOpcion===op.num?"#a5b4fc":"rgba(255,255,255,0.45)",
                    fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,
                    cursor:"pointer",transition:"all 0.2s"}}>
                  <div style={{fontSize:10,color:coreOpcion===op.num?"#818cf8":"rgba(255,255,255,0.25)",
                    marginBottom:2,letterSpacing:"0.1em"}}>OPCIÓN</div>
                  {op.num}
                </button>
              ))}
            </div>
            {coreOpcion !== null && CORE.find(o=>o.num===coreOpcion)?.ejercicios.map((ej,i) => (
              <div key={i} style={{marginBottom:10,padding:"12px 14px",
                background:"rgba(99,102,241,0.04)",border:"1px solid rgba(99,102,241,0.15)"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,
                      fontWeight:800,textTransform:"uppercase",color:"#fff",marginBottom:6}}>
                      <span style={{color:"#818cf8",marginRight:8,opacity:0.6,fontSize:12}}>{String(i+1).padStart(2,"0")}</span>
                      {ej.nombre}
                    </div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      <div style={{padding:"5px 10px",background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)"}}>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>Protocolo</div>
                        <div style={{fontSize:13,color:"#e0e7ff",fontWeight:500}}>{ej.protocolo}</div>
                      </div>
                      <div style={{padding:"5px 10px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>Descanso</div>
                        <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",fontWeight:500}}>⏱ {ej.descanso}</div>
                      </div>
                    </div>
                  </div>
                  {ej.link && (
                    <a href={ej.link} target="_blank" rel="noopener noreferrer"
                      style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",
                        gap:4,textDecoration:"none",padding:"8px 10px",
                        background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)"}}>
                      <div style={{width:26,height:26,background:"#818cf8",borderRadius:"50%",
                        display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={{color:"#fff",fontSize:10,marginLeft:2}}>▶</span>
                      </div>
                      <span style={{fontSize:9,color:"#818cf8",letterSpacing:"0.05em",textTransform:"uppercase"}}>Video</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",
          padding:"12px 20px",background:"rgba(34,197,94,0.15)",border:"1px solid rgba(34,197,94,0.4)",
          color:"#86efac",fontSize:14,zIndex:200,backdropFilter:"blur(8px)",
          animation:"fadeUp 0.3s ease",whiteSpace:"nowrap"}}>
          {toast}
        </div>
      )}
    </div>
  )
}

/* ── Componente sesión Running ─────────────────────── */
function SesionCardRun({ses,existing,abierta,onToggle,onGuardar,accentColor}:any) {
  const [form,setForm] = useState({
    tiempo_min:existing?.tiempo_min?.toString()??"",
    distancia_km:existing?.distancia_km?.toString()??"",
    ritmo_min_km:existing?.ritmo_min_km??"",
    pulsaciones_prom:existing?.pulsaciones_prom?.toString()??"",
    zona:existing?.zona??"", nota:existing?.nota??""
  })
  const [guardando,setGuardando] = useState(false)
  const [localToast,setLocalToast] = useState<string|null>(null)

  const guardar = async (completar=false) => {
    setGuardando(true)
    await onGuardar(form,completar)
    setGuardando(false)
    setLocalToast(completar?"✓ Completada":"✓ Guardado")
    setTimeout(()=>setLocalToast(null),2500)
  }

  return (
    <div style={{marginBottom:12,border:`1px solid ${existing?.completada?"rgba(34,197,94,0.3)":"rgba(255,255,255,0.08)"}`,
      background:existing?.completada?"rgba(34,197,94,0.03)":"#0a0a0a"}}>
      <button onClick={onToggle}
        style={{width:"100%",padding:"13px 16px",display:"flex",alignItems:"center",
          justifyContent:"space-between",background:"transparent",border:"none",cursor:"pointer",
          borderBottom:abierta?"1px solid rgba(255,255,255,0.06)":"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
          <div style={{width:34,height:34,borderRadius:"50%",
            background:existing?.completada?"rgba(34,197,94,0.15)":"rgba(255,255,255,0.05)",
            border:`1px solid ${existing?.completada?accentColor:"rgba(255,255,255,0.1)"}`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>
            {existing?.completada?"✓":ses.icono}
          </div>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:800,
              textTransform:"uppercase",color:existing?.completada?accentColor:"#fff"}}>
              {ses.label||ses.tipo} · {ses.dia}
            </div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:1}}>
              {ses.tipo}
              {existing?.completada && existing?.distancia_km && ` · ${existing.distancia_km}km`}
              {existing?.completada && existing?.tiempo_min && ` · ${existing.tiempo_min}min`}
            </div>
          </div>
        </div>
        <span style={{color:"rgba(255,255,255,0.3)",fontSize:12,flexShrink:0}}>{abierta?"▲":"▼"}</span>
      </button>

      {abierta && (
        <div style={{padding:"14px 16px"}}>
          {/* Protocolo */}
          {(ses.desc || ses.obj) && (
            <div style={{marginBottom:14,padding:"10px 12px",
              background:`${accentColor}08`,border:`1px solid ${accentColor}20`}}>
              <div style={{fontSize:10,color:`${accentColor}`,letterSpacing:"0.1em",
                textTransform:"uppercase",marginBottom:5,fontWeight:700}}>Protocolo</div>
              {ses.desc && <div style={{fontSize:13,color:"rgba(255,255,255,0.8)",marginBottom:4,lineHeight:1.5}}>{ses.desc}</div>}
              {ses.obj && <div style={{fontSize:13,color:accentColor,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>🎯 {ses.obj}</div>}
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {[["tiempo_min","Tiempo (min)","45"],["distancia_km","Distancia (km)","10"],
              ["ritmo_min_km","Ritmo (min/km)","5:30"],["pulsaciones_prom","Puls. prom","145"]].map(([k,l,p])=>(
              <div key={k}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:5,letterSpacing:"0.08em",textTransform:"uppercase"}}>{l}</div>
                <input type={k==="ritmo_min_km"?"text":"number"} inputMode={k==="ritmo_min_km"?"text":"decimal"}
                  placeholder={p} value={(form as any)[k]}
                  onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  style={{width:"100%",padding:"10px 12px",background:"rgba(255,255,255,0.04)",
                    border:`1px solid ${(form as any)[k]?`${accentColor}50`:"rgba(255,255,255,0.1)"}`,
                    color:"#fff",fontSize:18,fontFamily:"'Barlow Condensed',sans-serif",
                    fontWeight:900,outline:"none",textAlign:"center"}}/>
              </div>
            ))}
          </div>

          {/* Zona */}
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:6,letterSpacing:"0.08em",textTransform:"uppercase"}}>Zona</div>
            <div style={{display:"flex",gap:6}}>
              {["Z1","Z2","Z3","Z4","Z5"].map(z=>(
                <button key={z} onClick={()=>setForm(f=>({...f,zona:f.zona===z?"":z}))}
                  style={{flex:1,padding:"7px 4px",textAlign:"center",
                    border:`1px solid ${form.zona===z?accentColor:"rgba(255,255,255,0.1)"}`,
                    background:form.zona===z?`${accentColor}20`:"transparent",
                    color:form.zona===z?accentColor:"rgba(255,255,255,0.4)",
                    fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* Nota */}
          <textarea value={form.nota} placeholder="Sensaciones, condiciones..."
            onChange={e=>setForm(f=>({...f,nota:e.target.value}))} rows={2}
            style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.04)",
              border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.8)",
              fontSize:13,fontFamily:"'Barlow',sans-serif",outline:"none",resize:"none",marginBottom:12}}/>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <button onClick={()=>guardar(false)} disabled={guardando}
              style={{padding:"11px",background:"rgba(255,255,255,0.06)",
                border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.6)",
                fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,
                letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>Guardar borrador</button>
            <button onClick={()=>guardar(true)} disabled={guardando}
              style={{padding:"11px",background:accentColor,border:"none",color:"#fff",
                fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:900,
                letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>
              {guardando?"Guardando...":"✓ Completar"}
            </button>
          </div>
          {localToast && <div style={{marginTop:8,padding:"8px",background:`${accentColor}15`,
            border:`1px solid ${accentColor}30`,color:accentColor,fontSize:12,textAlign:"center"}}>{localToast}</div>}
        </div>
      )}
    </div>
  )
}

/* ── Componente sesión Cycling ─────────────────────── */
function SesionCardCyc({ses,existing,abierta,onToggle,onGuardar,accentColor}:any) {
  const [form,setForm] = useState({
    tiempo_min:existing?.tiempo_min?.toString()??"",
    distancia_km:existing?.distancia_km?.toString()??"",
    ritmo_promedio:existing?.ritmo_promedio??"",
    pulsaciones_prom:existing?.pulsaciones_prom?.toString()??"",
    zona:existing?.zona??"", nota:existing?.nota??""
  })
  const [guardando,setGuardando] = useState(false)
  const [localToast,setLocalToast] = useState<string|null>(null)

  const guardar = async (completar=false) => {
    setGuardando(true)
    await onGuardar(form,completar)
    setGuardando(false)
    setLocalToast(completar?"✓ Completada":"✓ Guardado")
    setTimeout(()=>setLocalToast(null),2500)
  }

  return (
    <div style={{marginBottom:12,border:`1px solid ${existing?.completada?"rgba(59,130,246,0.3)":"rgba(255,255,255,0.08)"}`,
      background:existing?.completada?"rgba(59,130,246,0.03)":"#0a0a0a"}}>
      <button onClick={onToggle}
        style={{width:"100%",padding:"13px 16px",display:"flex",alignItems:"center",
          justifyContent:"space-between",background:"transparent",border:"none",cursor:"pointer",
          borderBottom:abierta?"1px solid rgba(255,255,255,0.06)":"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
          <div style={{width:34,height:34,borderRadius:"50%",
            background:existing?.completada?"rgba(59,130,246,0.15)":"rgba(255,255,255,0.05)",
            border:`1px solid ${existing?.completada?accentColor:"rgba(255,255,255,0.1)"}`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>
            {existing?.completada?"✓":ses.icono}
          </div>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:800,
              textTransform:"uppercase",color:existing?.completada?accentColor:"#fff"}}>
              {ses.tipo} · {ses.dia}
            </div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:1}}>
              {existing?.completada && existing?.distancia_km && `${existing.distancia_km}km`}
              {existing?.completada && existing?.tiempo_min && ` · ${existing.tiempo_min}min`}
              {existing?.completada && existing?.ritmo_promedio && ` · ${existing.ritmo_promedio}km/h`}
            </div>
          </div>
        </div>
        <span style={{color:"rgba(255,255,255,0.3)",fontSize:12,flexShrink:0}}>{abierta?"▲":"▼"}</span>
      </button>

      {abierta && (
        <div style={{padding:"14px 16px"}}>
          {(ses.desc||ses.obj) && (
            <div style={{marginBottom:14,padding:"10px 12px",
              background:`${accentColor}08`,border:`1px solid ${accentColor}20`}}>
              <div style={{fontSize:10,color:accentColor,letterSpacing:"0.1em",
                textTransform:"uppercase",marginBottom:5,fontWeight:700}}>Protocolo</div>
              {ses.desc && <div style={{fontSize:13,color:"rgba(255,255,255,0.8)",marginBottom:4,lineHeight:1.5}}>{ses.desc}</div>}
              {ses.obj && <div style={{fontSize:13,color:accentColor,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>🎯 {ses.obj}</div>}
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {[["tiempo_min","Tiempo (min)","60"],["distancia_km","Distancia (km)","25"],
              ["ritmo_promedio","Velocidad (km/h)","22"],["pulsaciones_prom","Puls. prom","135"]].map(([k,l,p])=>(
              <div key={k}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:5,letterSpacing:"0.08em",textTransform:"uppercase"}}>{l}</div>
                <input type="number" inputMode="decimal" placeholder={p}
                  value={(form as any)[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  style={{width:"100%",padding:"10px 12px",background:"rgba(255,255,255,0.04)",
                    border:`1px solid ${(form as any)[k]?`${accentColor}50`:"rgba(255,255,255,0.1)"}`,
                    color:"#fff",fontSize:18,fontFamily:"'Barlow Condensed',sans-serif",
                    fontWeight:900,outline:"none",textAlign:"center"}}/>
              </div>
            ))}
          </div>

          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:6,letterSpacing:"0.08em",textTransform:"uppercase"}}>Zona</div>
            <div style={{display:"flex",gap:6}}>
              {["Z1","Z2","Z3","Z4","Z5"].map(z=>(
                <button key={z} onClick={()=>setForm(f=>({...f,zona:f.zona===z?"":z}))}
                  style={{flex:1,padding:"7px 4px",textAlign:"center",
                    border:`1px solid ${form.zona===z?accentColor:"rgba(255,255,255,0.1)"}`,
                    background:form.zona===z?`${accentColor}20`:"transparent",
                    color:form.zona===z?accentColor:"rgba(255,255,255,0.4)",
                    fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  {z}
                </button>
              ))}
            </div>
          </div>

          <textarea value={form.nota} placeholder="Sensaciones, ritmo, condiciones..."
            onChange={e=>setForm(f=>({...f,nota:e.target.value}))} rows={2}
            style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.04)",
              border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.8)",
              fontSize:13,fontFamily:"'Barlow',sans-serif",outline:"none",resize:"none",marginBottom:12}}/>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <button onClick={()=>guardar(false)} disabled={guardando}
              style={{padding:"11px",background:"rgba(255,255,255,0.06)",
                border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.6)",
                fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,
                letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>Guardar borrador</button>
            <button onClick={()=>guardar(true)} disabled={guardando}
              style={{padding:"11px",background:accentColor,border:"none",color:"#fff",
                fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:900,
                letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>
              {guardando?"Guardando...":"✓ Completar"}
            </button>
          </div>
          {localToast && <div style={{marginTop:8,padding:"8px",background:`${accentColor}15`,
            border:`1px solid ${accentColor}30`,color:accentColor,fontSize:12,textAlign:"center"}}>{localToast}</div>}
        </div>
      )}
    </div>
  )
}
