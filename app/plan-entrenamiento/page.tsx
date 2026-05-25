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
interface SemanaRun {
  id: string; numero: number
  sesion_1_descripcion: string | null; sesion_1_objetivo_min: string | null
  sesion_2_descripcion: string | null; sesion_2_objetivo: string | null
  sesion_3_descripcion: string | null; sesion_3_objetivo_min: string | null
}
interface SemanaCyc {
  id: string; numero: number
  sesion_1_descripcion: string | null; sesion_1_objetivo: string | null
  sesion_2_descripcion: string | null; sesion_2_objetivo: string | null
  sesion_3_descripcion: string | null; sesion_3_objetivo: string | null
}
interface Modulos {
  musculacion: boolean
  running: boolean
  cycling: boolean
}

/* ── Colores ────────────────────────────────────────── */
const R = "#E8000D"
const G = "#22c55e"
const B = "#3b82f6"
const O = "#f59e0b"
const P = "#818cf8"

/* ── Distribución semanal Rivs (solo cuando cycling=true) ── */
const DISTRIBUCION_RIVS = [
  { dia: "NA",    label: "Descanso",                    icono: "😴", tags: [] },
  { dia: "Día 1", label: "Tren Superior + Easy Run Z2", icono: "🏋️🏃", tags: ["MUSCULACIÓN","RUNNING"] },
  { dia: "Día 2", label: "Tren Inferior",               icono: "🏋️",   tags: ["MUSCULACIÓN"] },
  { dia: "Día 3", label: "Cycling Continuo Z2 + CORE",  icono: "🚴🎯", tags: ["CYCLING","CORE"] },
  { dia: "Día 4", label: "Tren Superior + Pliometría",  icono: "🏋️⚡", tags: ["MUSCULACIÓN"] },
  { dia: "Día 5", label: "Cycling Z2 + Carrera",        icono: "🚴🏃", tags: ["CYCLING"] },
  { dia: "Día 6", label: "Bricks — Bici + Carrera",     icono: "🔥",   tags: ["CYCLING","RUNNING"] },
]
const TAG_COLORS: Record<string, string> = {
  "MUSCULACIÓN": R, "RUNNING": G, "CYCLING": B, "CORE": P,
}

/* ── Calentamientos ─────────────────────────────────── */
const CAL_SUP = [
  { nombre: "Circunducción de hombro",    series: "2 × 15 reps",         link: "https://www.youtube.com/watch?v=aXR9dM8TZvc" },
  { nombre: "Rotación externa de hombro", series: "2 × 10 reps",         link: "https://www.youtube.com/watch?v=m5t2BqBJW9w" },
  { nombre: "Rotación interna de hombro", series: "2 × 10 reps",         link: "https://www.youtube.com/watch?v=96uCABKiHXU" },
  { nombre: "Abducción horizontal",       series: "1 × 15 reps",         link: "https://www.youtube.com/watch?v=k4SJcYp3cuk" },
  { nombre: "Flexión de brazo",           series: "1 × 15 reps c/brazo", link: "https://www.youtube.com/watch?v=treKYMELQHY" },
  { nombre: "Rotación de hombro a 90°",  series: "1 × 15 reps c/brazo", link: "https://www.youtube.com/shorts/iNn_sNA6TbU" },
]
const CAL_INF = [
  { nombre: "Rotación de cadera",         series: "2 × 10 reps",          link: "https://www.youtube.com/watch?v=qkrJXGVj_OQ" },
  { nombre: "Flexo/Extensión de cadera",  series: "2 × 15 reps",          link: "https://www.youtube.com/watch?v=UezSaXf9mtI" },
  { nombre: "Abducción de cadera",        series: "2 × 15 reps",          link: "https://www.youtube.com/shorts/TAHk1yccDmM" },
  { nombre: "Aperturas de cadera",        series: "1 × 15 reps",          link: "https://www.youtube.com/watch?v=Zv1wILGzeec" },
  { nombre: "Movilidad de tobillo I",     series: "1 × 15 reps c/pierna", link: "https://www.youtube.com/shorts/D-IYqUE92PI" },
  { nombre: "Movilidad de tobillo II",    series: "1 × 15 reps",          link: "https://www.youtube.com/watch?v=EG4YKX3-Ygk" },
]

/* ── CORE ───────────────────────────────────────────── */
const CORE_OPS = [
  { num: 1, ejercicios: [
    { nombre: "Plancha Estática",              protocolo: "3 × 40 seg",               descanso: "60 seg", link: null },
    { nombre: "Russian Twist",                 protocolo: "3 × RIR 2",                descanso: "60 seg", link: "https://www.youtube.com/shorts/-cPtvFdT8dc" },
    { nombre: "Crunch Abdominal",              protocolo: "3 × RIR 2",                descanso: "60 seg", link: null },
    { nombre: "Flexión abdomen en máquina",    protocolo: "2 × RIR 2 · 1 × Fallo",   descanso: "60 seg", link: null },
  ]},
  { num: 2, ejercicios: [
    { nombre: "Plancha Dinámica (arrastre lateral)", protocolo: "3 × RIR 4",          descanso: "60 seg", link: "https://www.youtube.com/watch?v=zS0f6nCmwrI" },
    { nombre: "Plancha Lateral",               protocolo: "3 × 40 seg",               descanso: "60 seg", link: "https://www.youtube.com/shorts/sLazig0sm8Q" },
    { nombre: "Caminata del Granjero Unilateral", protocolo: "2 × 20 pasos",          descanso: "60 seg", link: "https://www.youtube.com/watch?v=P9EgrAyp1UA" },
    { nombre: "Flexión abdomen en máquina",    protocolo: "2 × RIR 2 · 1 × Fallo",   descanso: "60 seg", link: null },
  ]},
  { num: 3, ejercicios: [
    { nombre: "Caminata del Granjero Unilateral", protocolo: "2 × 20 pasos",          descanso: "60 seg", link: "https://www.youtube.com/watch?v=P9EgrAyp1UA" },
    { nombre: "PallOff Press",                 protocolo: "3 × 10 reps",              descanso: "60 seg", link: "https://www.youtube.com/watch?v=AH_QZLm_0-s" },
    { nombre: "Plancha Estática",              protocolo: "4 × 40 seg",               descanso: "60 seg", link: null },
    { nombre: "Crunch Abdominal",              protocolo: "3 × RIR 2",                descanso: "60 seg", link: null },
  ]},
]

/* ── Helpers ────────────────────────────────────────── */
function parseSerie(txt: string | null, serie: number): string {
  if (!txt) return "—"
  const p = txt.split(" / ").map(s => s.trim())
  return p[serie - 1] ?? p[p.length - 1]
}
function colorRIR(r: string): string {
  const v = r.toLowerCase()
  if (v.includes("fallo")) return "#ef4444"
  if (v.includes("rir 1")) return "#f97316"
  if (v.includes("rir 2")) return "#eab308"
  if (v.includes("rir 3") || v.includes("rir 4")) return G
  if (v === "na") return "#6b7280"
  return "rgba(255,255,255,0.4)"
}
function parseSeg(d: string | null): number {
  if (!d) return 60
  if (d.includes("120") || d.includes("2 min")) return 120
  if (d.includes("90") || d.includes("1:30")) return 90
  return 60
}
function fmtFecha(iso: string) {
  const [, m, d] = iso.split("-")
  const mes = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${d} ${mes[parseInt(m)-1]}`
}
function fmtCron(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

/* ══ PÁGINA PRINCIPAL ══════════════════════════════════ */
export default function PlanEntrenamientoPage() {
  const [token, setToken]           = useState<string | null>(null)
  const [cliente, setCliente]       = useState<Cliente | null>(null)
  const [denegado, setDenegado]     = useState(false)
  const [cargando, setCargando]     = useState(true)
  const [modulos, setModulos]       = useState<Modulos>({ musculacion: false, running: false, cycling: false })
  const [vista, setVista]           = useState<string>("muscu")

  // Musculación
  const [dias, setDias]             = useState<Dia[]>([])
  const [diaActivo, setDiaActivo]   = useState<Dia | null>(null)
  const [ejercicios, setEjers]      = useState<Ejercicio[]>([])
  const [sesionId, setSesionId]     = useState<string | null>(null)
  const [sesionCerrada, setSesionCerrada] = useState(false)
  const [regs, setRegs]             = useState<Record<string, Record<number, { kg: string; reps: string }>>>({})
  const [ants, setAnts]             = useState<Record<string, { fecha: string; data: RegAnterior[] }>>({})
  const [imgErr, setImgErr]         = useState<Record<string, boolean>>({})

  // Running
  const [semanasRun, setSemanasRun]   = useState<SemanaRun[]>([])
  const [semanaRun, setSemanaRun]     = useState<SemanaRun | null>(null)
  const [sesRun, setSesRun]           = useState<any[]>([])
  const [abiertaRun, setAbiertaRun]   = useState<number | null>(null)

  // Cycling
  const [semanasCyc, setSemanasCyc]   = useState<SemanaCyc[]>([])
  const [semanaCyc, setSemanaCyc]     = useState<SemanaCyc | null>(null)
  const [sesCyc, setSesCyc]           = useState<any[]>([])
  const [abiertaCyc, setAbiertaCyc]   = useState<number | null>(null)

  // CORE
  const [coreOp, setCoreOp]         = useState<number | null>(null)

  // Cronómetro
  const [cronSeg, setCronSeg]       = useState(0)
  const [cronOn, setCronOn]         = useState(false)

  // Toast
  const [toast, setToast]           = useState<string | null>(null)
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  /* ── Auth + carga ── */
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token")
    if (!t) { setDenegado(true); setCargando(false); return }
    setToken(t)
    supabase.from("clientes").select("token,nombre").eq("token", t).eq("activo", true).single()
      .then(({ data, error }) => {
        if (error || !data) { setDenegado(true); setCargando(false); return }
        setCliente(data)
        cargarModulos(t)
      })
  }, [])

  const cargarModulos = async (tok: string) => {
    const m: Modulos = { musculacion: false, running: false, cycling: false }

    // Musculación
    const { data: prog } = await supabase.from("programas").select("id")
      .eq("cliente_token", tok).eq("activo", true).single()
    if (prog) {
      m.musculacion = true
      const { data: ds } = await supabase.from("dias").select("id,numero,nombre")
        .eq("programa_id", prog.id).order("numero")
      if (ds) setDias(ds)
    }

    // Running
    const { data: pRun } = await supabase.from("programas_running").select("id")
      .eq("cliente_token", tok).eq("activo", true).single()
    if (pRun) {
      m.running = true
      const { data: sems } = await supabase.from("semanas_running").select("*")
        .eq("programa_id", pRun.id).order("numero")
      if (sems?.length) { setSemanasRun(sems); setSemanaRun(sems[0]) }
    }

    // Cycling
    const { data: pCyc } = await supabase.from("programas_cycling").select("id")
      .eq("cliente_token", tok).eq("activo", true).single()
    if (pCyc) {
      m.cycling = true
      const { data: sems } = await supabase.from("semanas_cycling").select("*")
        .eq("programa_id", pCyc.id).order("numero")
      if (sems?.length) { setSemanasCyc(sems); setSemanaCyc(sems[0]) }
    }

    setModulos(m)
    // Vista inicial: semana si tiene cycling, muscu en otro caso
    setVista(m.cycling ? "semana" : "muscu")
    setCargando(false)
  }

  /* ── Sesiones running ── */
  const cargarSesRun = useCallback(async (semId: string) => {
    if (!token) return
    const { data } = await supabase.from("sesiones_running").select("*")
      .eq("cliente_token", token).eq("semana_id", semId).order("numero_sesion")
    if (data) setSesRun(data)
  }, [token])

  useEffect(() => { if (semanaRun) cargarSesRun(semanaRun.id) }, [semanaRun, cargarSesRun])

  /* ── Sesiones cycling ── */
  const cargarSesCyc = useCallback(async (semId: string) => {
    if (!token) return
    const { data } = await supabase.from("sesiones_cycling").select("*")
      .eq("cliente_token", token).eq("semana_cycling_id", semId).order("numero_sesion")
    if (data) setSesCyc(data)
  }, [token])

  useEffect(() => { if (semanaCyc) cargarSesCyc(semanaCyc.id) }, [semanaCyc, cargarSesCyc])

  /* ── Seleccionar día musculación ── */
  const selDia = useCallback(async (dia: Dia) => {
    if (!token) return
    setDiaActivo(dia); setEjers([]); setRegs({}); setAnts({})
    setSesionId(null); setSesionCerrada(false); setImgErr({})

    const { data: ejs } = await supabase.from("ejercicios").select("*")
      .eq("dia_id", dia.id).order("orden")
    if (!ejs) return
    setEjers(ejs)

    const base: Record<string, Record<number, { kg: string; reps: string }>> = {}
    ejs.forEach(e => {
      base[e.id] = {}
      for (let s = 1; s <= e.series_trabajo; s++) base[e.id][s] = { kg: "", reps: "" }
    })
    setRegs(base)

    const hoy = new Date().toISOString().split("T")[0]
    let { data: ses } = await supabase.from("sesiones").select("id,completada")
      .eq("cliente_token", token).eq("dia_id", dia.id).eq("fecha", hoy).single()
    if (!ses) {
      const { data: n } = await supabase.from("sesiones")
        .insert({ cliente_token: token, dia_id: dia.id, fecha: hoy })
        .select("id,completada").single()
      ses = n
    }
    if (ses) {
      setSesionId(ses.id); setSesionCerrada(ses.completada ?? false)
      const { data: rHoy } = await supabase.from("registros")
        .select("ejercicio_id,serie_num,kg,reps").eq("sesion_id", ses.id)
      if (rHoy) {
        const m = { ...base }
        rHoy.forEach(r => {
          if (m[r.ejercicio_id]) m[r.ejercicio_id][r.serie_num] = { kg: r.kg?.toString() ?? "", reps: r.reps?.toString() ?? "" }
        })
        setRegs(m)
      }
    }

    const { data: ant } = await supabase.from("sesiones").select("id,fecha")
      .eq("cliente_token", token).eq("dia_id", dia.id).eq("completada", true)
      .neq("fecha", hoy).order("fecha", { ascending: false }).limit(1)
    if (ant?.length) {
      const { data: rAnt } = await supabase.from("registros")
        .select("ejercicio_id,serie_num,kg,reps").eq("sesion_id", ant[0].id)
      if (rAnt) {
        const ma: Record<string, { fecha: string; data: RegAnterior[] }> = {}
        rAnt.forEach(r => {
          if (!ma[r.ejercicio_id]) ma[r.ejercicio_id] = { fecha: ant[0].fecha, data: [] }
          ma[r.ejercicio_id].data.push({ serie_num: r.serie_num, kg: r.kg, reps: r.reps })
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
        kg: parseFloat(val.kg) || null, reps: parseInt(val.reps) || null },
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

  /* ── Guardar running ── */
  const guardarRun = async (numSesion: number, form: any, completar: boolean) => {
    if (!token || !semanaRun) return
    const ex = sesRun.find(s => s.numero_sesion === numSesion)
    const payload = {
      cliente_token: token, semana_id: semanaRun.id, numero_sesion: numSesion,
      fecha: new Date().toISOString().split("T")[0],
      tiempo_min: parseFloat(form.tiempo_min) || null,
      distancia_km: parseFloat(form.distancia_km) || null,
      ritmo_min_km: form.ritmo_min_km || null,
      pulsaciones_prom: parseInt(form.pulsaciones_prom) || null,
      zona: form.zona || null, nota: form.nota || null, completada: completar
    }
    if (ex) await supabase.from("sesiones_running").update(payload).eq("id", ex.id)
    else await supabase.from("sesiones_running").insert(payload)
    cargarSesRun(semanaRun.id)
    showToast(completar ? "✓ Sesión completada" : "✓ Guardado")
  }

  /* ── Guardar cycling ── */
  const guardarCyc = async (numSesion: number, form: any, completar: boolean) => {
    if (!token || !semanaCyc) return
    const ex = sesCyc.find(s => s.numero_sesion === numSesion)
    const payload = {
      cliente_token: token, semana_cycling_id: semanaCyc.id, numero_sesion: numSesion,
      fecha: new Date().toISOString().split("T")[0],
      tiempo_min: parseFloat(form.tiempo_min) || null,
      distancia_km: parseFloat(form.distancia_km) || null,
      ritmo_promedio: form.ritmo_promedio || null,
      pulsaciones_prom: parseInt(form.pulsaciones_prom) || null,
      zona: form.zona || null, nota: form.nota || null, completada: completar
    }
    if (ex) await supabase.from("sesiones_cycling").update(payload).eq("id", ex.id)
    else await supabase.from("sesiones_cycling").insert(payload)
    cargarSesCyc(semanaCyc.id)
    showToast(completar ? "✓ Sesión completada" : "✓ Guardado")
  }

  /* ── Cronómetro ── */
  useEffect(() => {
    if (!cronOn) return
    const i = setInterval(() => setCronSeg(s => {
      if (s <= 1) { setCronOn(false); showToast("¡Fin del descanso!"); return 0 }
      return s - 1
    }), 1000)
    return () => clearInterval(i)
  }, [cronOn])

  /* ── Tabs disponibles según módulos ── */
  const tabs = [
    ...(modulos.cycling ? [{ k: "semana", l: "📅 Semana", c: "rgba(255,255,255,0.8)" }] : []),
    ...(modulos.musculacion ? [{ k: "muscu", l: "🏋️ Muscu", c: R }] : []),
    ...(modulos.running ? [{ k: "running", l: "🏃 Running", c: G }] : []),
    ...(modulos.cycling ? [{ k: "cycling", l: "🚴 Cycling", c: B }] : []),
    { k: "core", l: "🎯 CORE", c: P },
  ]

  /* ── Definición de sesiones running según cliente ── */
  // David: 3 sesiones (martes, miércoles, domingo)
  // Rivs: 2 sesiones (día 1 easy run, día 6 bricks-carrera)
  const sesionesRunConfig = modulos.cycling
    ? [
        { num: 1, titulo: "Sesión 1 · Día 1", subtitulo: "Easy Run", icono: "🏃",
          getDesc: (s: SemanaRun) => s.sesion_1_descripcion,
          getObj:  (s: SemanaRun) => s.sesion_1_objetivo_min,
          campos: [
            { k: "tiempo_min", l: "Tiempo (min)", p: "45", tipo: "number" },
            { k: "distancia_km", l: "Distancia (km)", p: "8", tipo: "number" },
            { k: "ritmo_min_km", l: "Ritmo (min/km)", p: "5:30", tipo: "text" },
            { k: "pulsaciones_prom", l: "Puls. prom", p: "145", tipo: "number" },
          ], notaBricks: undefined, color: G },
        { num: 2, titulo: "Sesión 2 · Día 6 — Fondo", subtitulo: "Fondo continuo", icono: "🔥🏃",
          getDesc: (s: SemanaRun) => s.sesion_2_descripcion,
          getObj:  (s: SemanaRun) => s.sesion_2_objetivo,
          campos: [
            { k: "tiempo_min", l: "Tiempo carrera (min)", p: "20", tipo: "number" },
            { k: "distancia_km", l: "Distancia (km)", p: "4", tipo: "number" },
            { k: "ritmo_min_km", l: "Ritmo (min/km)", p: "5:00", tipo: "text" },
            { k: "pulsaciones_prom", l: "Puls. prom", p: "155", tipo: "number" },
          ], notaBricks: ".", color: O },
      ]
    : [
        { num: 1, titulo: "Sesión 1 · Martes", subtitulo: "Zona 2", icono: "🏃",
          getDesc: (s: SemanaRun) => s.sesion_1_descripcion,
          getObj:  (s: SemanaRun) => s.sesion_1_objetivo_min ? `${s.sesion_1_objetivo_min} min` : null,
          campos: [
            { k: "tiempo_min", l: "Tiempo (min)", p: "30", tipo: "number" },
            { k: "distancia_km", l: "Distancia (km)", p: "5", tipo: "number" },
            { k: "ritmo_min_km", l: "Ritmo (min/km)", p: "5:30", tipo: "text" },
            { k: "pulsaciones_prom", l: "Puls. prom", p: "135", tipo: "number" },
          ], notaBricks: undefined, color: G },
        { num: 2, titulo: "Sesión 2 · Miércoles", subtitulo: "Intervalos", icono: "⚡",
          getDesc: (s: SemanaRun) => s.sesion_2_descripcion,
          getObj:  (s: SemanaRun) => s.sesion_2_objetivo,
          campos: [
            { k: "tiempo_min", l: "Tiempo (min)", p: "45", tipo: "number" },
            { k: "distancia_km", l: "Distancia (km)", p: "8", tipo: "number" },
            { k: "ritmo_min_km", l: "Ritmo (min/km)", p: "5:00", tipo: "text" },
            { k: "pulsaciones_prom", l: "Puls. prom", p: "155", tipo: "number" },
          ], notaBricks: undefined, color: G },
        { num: 3, titulo: "Sesión 3 · Domingo", subtitulo: "Fondo largo", icono: "🛤️",
          getDesc: (s: SemanaRun) => s.sesion_3_descripcion,
          getObj:  (s: SemanaRun) => s.sesion_3_objetivo_min ? `${s.sesion_3_objetivo_min} min` : null,
          campos: [
            { k: "tiempo_min", l: "Tiempo (min)", p: "60", tipo: "number" },
            { k: "distancia_km", l: "Distancia (km)", p: "12", tipo: "number" },
            { k: "ritmo_min_km", l: "Ritmo (min/km)", p: "5:30", tipo: "text" },
            { k: "pulsaciones_prom", l: "Puls. prom", p: "140", tipo: "number" },
          ], notaBricks: undefined, color: G },
      ]

  /* ── Renders ── */
  if (denegado) return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", flexDirection: "column", color: "#fff", textAlign: "center", padding: 32 }}>
      <div style={{ fontSize: 48, color: R, marginBottom: 16 }}>🔒</div>
      <h1 style={{ fontSize: 24, fontWeight: 900 }}>Acceso restringido</h1>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 8, maxWidth: 320 }}>
        Esta página es exclusiva para clientes de Coach David.
      </p>
    </div>
  )

  if (cargando) return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "sans-serif" }}>
      Cargando programa...
    </div>
  )

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#fff",
      fontFamily: "'Barlow', sans-serif", paddingBottom: 80 }}>

      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=number] { -moz-appearance: textfield; }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        textarea { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(0,0,0,0.97)",
        backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ height: 2, background: modulos.cycling
          ? `linear-gradient(90deg,${R},${B},${G})` : R }} />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 16px", height: 52,
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 900 }}>
              COACH<span style={{ color: R }}>.</span>DAVID
            </span>
            <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.15)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {modulos.cycling ? "Triatlón" : "Entrenamiento"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, background: G, borderRadius: "50%", animation: "blink 2s infinite" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{cliente?.nombre}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>

        {/* Saludo */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: R, letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: 6 }}>
            Tu programa
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 900,
            textTransform: "uppercase", lineHeight: 1 }}>
            Hola, <span style={{ color: R }}>{cliente?.nombre.split(" ")[0]}</span>
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${tabs.length},1fr)`, gap: 6, marginBottom: 24 }}>
          {tabs.map(tab => (
            <button key={tab.k} onClick={() => setVista(tab.k)} style={{
              padding: "10px 6px",
              border: `1px solid ${vista === tab.k ? tab.c : "rgba(255,255,255,0.1)"}`,
              background: vista === tab.k ? `${tab.c}18` : "transparent",
              color: vista === tab.k ? tab.c : "rgba(255,255,255,0.4)",
              fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700,
              cursor: "pointer", textAlign: "center", transition: "all 0.2s", lineHeight: 1.4
            }}>{tab.l}</button>
          ))}
        </div>

        {/* ══ SEMANA (solo Rivs) ══ */}
        {vista === "semana" && modulos.cycling && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em",
              textTransform: "uppercase", marginBottom: 14 }}>Distribución semanal</div>
            {DISTRIBUCION_RIVS.map((d, i) => (
              <div key={i} style={{ marginBottom: 8, padding: "14px 16px",
                border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)",
                display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{d.icono}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11,
                      color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em",
                      textTransform: "uppercase", minWidth: 36 }}>{d.dia}</span>
                    <span style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>{d.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {d.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 10, padding: "2px 8px",
                        background: `${TAG_COLORS[tag]}20`, color: TAG_COLORS[tag],
                        fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                        letterSpacing: "0.08em" }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {/* Zonas FC */}
            <div style={{ marginTop: 16, padding: "14px 16px",
              border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em",
                textTransform: "uppercase", marginBottom: 10 }}>Zonas FC (lpm)</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[["Z1","120",G],["Z2","139",G],["Z3","152",O],["Z4","165","#f97316"],["Z5","177",R]].map(([z,v,c]) => (
                  <div key={z} style={{ flex: 1, padding: "8px 4px", background: `${c}10`,
                    border: `1px solid ${c}25`, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: c as string, fontWeight: 700,
                      fontFamily: "'Barlow Condensed',sans-serif" }}>{z}</div>
                    <div style={{ fontSize: 15, color: "#fff", fontWeight: 700 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ MUSCULACIÓN ══ */}
        {vista === "muscu" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            {/* Calentamiento */}
            {diaActivo && (
              <div style={{ marginBottom: 16, border: "1px solid rgba(245,158,11,0.2)",
                background: "rgba(245,158,11,0.03)" }}>
                <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(245,158,11,0.1)",
                  fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 900,
                  textTransform: "uppercase", color: O }}>
                  Calentamiento · Tren {diaActivo.nombre.includes("Inferior") ? "Inferior" : "Superior"}
                </div>
                <div style={{ padding: "10px 16px" }}>
                  {(diaActivo.nombre.includes("Inferior") ? CAL_INF : CAL_SUP).map((e, i) => (
                    <a key={i} href={e.link} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "9px 12px", marginBottom: 5, background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)", textDecoration: "none" }}>
                      <div>
                        <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{e.nombre}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{e.series}</div>
                      </div>
                      <div style={{ width: 24, height: 24, background: O, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "#000", fontSize: 9, fontWeight: 900, marginLeft: 2 }}>▶</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Selector días */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {dias.map(d => (
                <button key={d.id} onClick={() => selDia(d)} style={{
                  flex: 1, padding: "12px 8px",
                  border: `1px solid ${diaActivo?.id === d.id ? R : "rgba(255,255,255,0.1)"}`,
                  background: diaActivo?.id === d.id ? `${R}18` : "transparent",
                  color: diaActivo?.id === d.id ? "#fff" : "rgba(255,255,255,0.45)",
                  fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", textAlign: "center", lineHeight: 1.4, transition: "all 0.2s"
                }}>
                  <div style={{ fontSize: 10, color: diaActivo?.id === d.id ? R : "rgba(255,255,255,0.3)",
                    marginBottom: 3, letterSpacing: "0.1em" }}>DÍA {d.numero}</div>
                  {d.nombre.replace(/Día \d+ — /, "")}
                </button>
              ))}
            </div>

            {/* Cronómetro sticky */}
            {cronOn && (
              <div style={{ position: "sticky", top: 54, zIndex: 90, marginBottom: 14,
                background: cronSeg <= 10 ? "#7f1d1d" : cronSeg <= 30 ? "#78350f" : "#052e16",
                border: `1px solid ${cronSeg <= 10 ? R : cronSeg <= 30 ? O : G}`,
                padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
                animation: "fadeUp 0.2s ease" }}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12,
                  color: cronSeg <= 10 ? "#fca5a5" : cronSeg <= 30 ? "#fcd34d" : "#86efac",
                  letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {cronSeg <= 10 ? "¡Última!" : cronSeg <= 30 ? "Preparándose..." : "Descansando"}
                </span>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 34, fontWeight: 900,
                  color: cronSeg <= 10 ? R : cronSeg <= 30 ? O : G }}>{fmtCron(cronSeg)}</span>
                <button onClick={() => setCronOn(false)}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18 }}>✕</button>
              </div>
            )}

            {/* Ejercicios */}
            {diaActivo && ejercicios.map((ej, idx) => {
              const ant = ants[ej.id]
              return (
                <div key={ej.id} style={{ marginBottom: 18, border: "1px solid rgba(255,255,255,0.08)", background: "#0a0a0a" }}>
                  {ej.video_url && !imgErr[ej.id] && (
                    <div style={{ height: 160, overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
                      <img src={ej.video_url} alt={ej.nombre}
                        onError={() => setImgErr(e => ({ ...e, [ej.id]: true }))}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
                        background: "linear-gradient(to top,#0a0a0a,transparent)" }} />
                    </div>
                  )}
                  {/* Cabecera */}
                  <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 900,
                      textTransform: "uppercase", lineHeight: 1, marginBottom: 6 }}>
                      <span style={{ color: R, marginRight: 8, opacity: 0.5, fontSize: 13 }}>{String(idx + 1).padStart(2, "0")}</span>
                      {ej.nombre}
                    </div>
                    {ej.nota_tecnica && (
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 10, lineHeight: 1.5 }}>
                        {ej.nota_tecnica}
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {ej.reps_objetivo && (
                        <div style={{ padding: "8px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Reps objetivo</div>
                          <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{ej.reps_objetivo.split(" / ")[0]}{ej.series_trabajo > 1 ? " ..." : ""}</div>
                        </div>
                      )}
                      {ej.descanso && (
                        <div style={{ padding: "8px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Descanso</div>
                          <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>⏱ {ej.descanso.split(" / ")[0]}</div>
                        </div>
                      )}
                      {ej.series_calentamiento > 0 && (
                        <div style={{ padding: "8px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Calentamiento</div>
                          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
                            {ej.series_calentamiento}× {ej.reps_calentamiento}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Semana anterior */}
                  {ant && (
                    <div style={{ padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                        Última sesión · {fmtFecha(ant.fecha)}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {ant.data.sort((a, b) => a.serie_num - b.serie_num).map(r => (
                          <div key={r.serie_num} style={{ display: "flex", flexDirection: "column",
                            alignItems: "center", padding: "5px 10px", background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)", minWidth: 48 }}>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>S{r.serie_num}</div>
                            <div style={{ fontSize: 14, color: "#fff", fontWeight: 700, fontFamily: "'Barlow Condensed',sans-serif" }}>{r.kg ?? "—"}</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{r.reps ? `${r.reps}r` : "—"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Series 4 columnas */}
                  <div style={{ padding: "12px 16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 1fr 1fr", gap: 6,
                      marginBottom: 8, fontSize: 9, color: "rgba(255,255,255,0.25)",
                      letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      <span>Reps obj.</span><span>RIR</span><span>Peso kg</span><span>Reps</span>
                    </div>
                    {Array.from({ length: ej.series_trabajo }, (_, i) => i + 1).map(serie => {
                      const val = regs[ej.id]?.[serie] || { kg: "", reps: "" }
                      const ok = !!val.kg && !!val.reps
                      const repsObj = parseSerie(ej.reps_objetivo, serie)
                      const rirObj = parseSerie(ej.rir_objetivo, serie)
                      const rc = colorRIR(rirObj)
                      return (
                        <div key={serie} style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 5,
                            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700 }}>
                            SERIE {serie} {ok && <span style={{ color: G }}>✓</span>}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 1fr 1fr", gap: 6, alignItems: "stretch" }}>
                            <div style={{ padding: "10px 8px", background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.07)", display: "flex",
                              alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{repsObj}</span>
                            </div>
                            <div style={{ padding: "10px 4px", background: `${rc}12`, border: `1px solid ${rc}35`,
                              display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                              <span style={{ fontSize: 11, color: rc, fontWeight: 700, fontFamily: "'Barlow Condensed',sans-serif" }}>{rirObj}</span>
                            </div>
                            <input type="number" inputMode="decimal" placeholder="0"
                              value={val.kg} disabled={sesionCerrada}
                              onChange={e => setRegs(r => ({ ...r, [ej.id]: { ...r[ej.id], [serie]: { ...r[ej.id][serie], kg: e.target.value } } }))}
                              onBlur={() => guardarSerie(ej.id, serie)}
                              style={{ padding: "10px 8px", background: "rgba(255,255,255,0.04)",
                                border: `1px solid ${val.kg ? "rgba(232,0,13,0.5)" : "rgba(255,255,255,0.1)"}`,
                                color: "#fff", fontSize: 18, fontFamily: "'Barlow Condensed',sans-serif",
                                fontWeight: 900, outline: "none", textAlign: "center", width: "100%" }}
                            />
                            <input type="number" inputMode="numeric" placeholder="0"
                              value={val.reps} disabled={sesionCerrada}
                              onChange={e => setRegs(r => ({ ...r, [ej.id]: { ...r[ej.id], [serie]: { ...r[ej.id][serie], reps: e.target.value } } }))}
                              onBlur={() => guardarSerie(ej.id, serie)}
                              style={{ padding: "10px 8px", background: "rgba(255,255,255,0.04)",
                                border: `1px solid ${val.reps ? "rgba(232,0,13,0.5)" : "rgba(255,255,255,0.1)"}`,
                                color: "#fff", fontSize: 18, fontFamily: "'Barlow Condensed',sans-serif",
                                fontWeight: 900, outline: "none", textAlign: "center", width: "100%" }}
                            />
                          </div>
                          <button onClick={() => { setCronSeg(parseSeg(ej.descanso)); setCronOn(true) }}
                            disabled={sesionCerrada}
                            style={{ width: "100%", marginTop: 5, padding: "6px",
                              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                              color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 11,
                              fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            ⏱ Iniciar descanso
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {diaActivo && ejercicios.length > 0 && (
              <div style={{ marginTop: 8, padding: 18,
                border: `1px solid ${sesionCerrada ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}`,
                background: sesionCerrada ? "rgba(34,197,94,0.04)" : "rgba(232,0,13,0.03)" }}>
                {sesionCerrada ? (
                  <div style={{ textAlign: "center", color: G, fontFamily: "'Barlow Condensed',sans-serif",
                    fontSize: 14, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                    ✓ Sesión enviada al coach
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 14, fontWeight: 300, lineHeight: 1.6 }}>
                      Al cerrar la sesión el resumen se envía automáticamente a Coach David.
                    </p>
                    <button onClick={cerrarSesion} style={{ width: "100%", padding: 16,
                      background: G, border: "none", color: "#fff",
                      fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 900,
                      letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>
                      Cerrar sesión y enviar al coach ✓
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ RUNNING ══ */}
        {vista === "running" && modulos.running && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ fontSize: 11, color: G, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
              Running · {semanasRun.length} semanas · {sesionesRunConfig.length} sesiones por semana
            </div>
            {/* Selector semana */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {semanasRun.map(s => (
                <button key={s.id} onClick={() => { setSemanaRun(s); setAbiertaRun(null) }}
                  style={{ padding: "7px 12px", minWidth: 44,
                    border: `1px solid ${semanaRun?.id === s.id ? G : "rgba(255,255,255,0.1)"}`,
                    background: semanaRun?.id === s.id ? "rgba(34,197,94,0.15)" : "transparent",
                    color: semanaRun?.id === s.id ? G : "rgba(255,255,255,0.4)",
                    fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", transition: "all 0.15s" }}>
                  S{s.numero}
                </button>
              ))}
            </div>
            {semanaRun && sesionesRunConfig.map(cfg => (
              <SesionCard key={cfg.num}
                color={cfg.color}
                titulo={cfg.titulo}
                subtitulo={cfg.subtitulo}
                icono={cfg.icono}
                descripcion={cfg.getDesc(semanaRun)}
                objetivo={cfg.getObj(semanaRun)}
                existing={sesRun.find(s => s.numero_sesion === cfg.num) ?? null}
                abierta={abiertaRun === cfg.num}
                onToggle={() => setAbiertaRun(abiertaRun === cfg.num ? null : cfg.num)}
                onGuardar={(form, c) => guardarRun(cfg.num, form, c)}
                campos={cfg.campos}
                notaBricks={cfg.notaBricks}
              />
            ))}
          </div>
        )}

        {/* ══ CYCLING ══ */}
        {vista === "cycling" && modulos.cycling && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ fontSize: 11, color: B, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
              Cycling · {semanasCyc.length} semanas · 3 sesiones por semana
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {semanasCyc.map(s => (
                <button key={s.id} onClick={() => { setSemanaCyc(s); setAbiertaCyc(null) }}
                  style={{ padding: "7px 12px", minWidth: 44,
                    border: `1px solid ${semanaCyc?.id === s.id ? B : "rgba(255,255,255,0.1)"}`,
                    background: semanaCyc?.id === s.id ? "rgba(59,130,246,0.15)" : "transparent",
                    color: semanaCyc?.id === s.id ? B : "rgba(255,255,255,0.4)",
                    fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", transition: "all 0.15s" }}>
                  S{s.numero}
                </button>
              ))}
            </div>
            {semanaCyc && [
              { num: 1, titulo: "Sesión 1 · Día 3", subtitulo: "Continuo Z2", icono: "🚴", color: B,
                desc: semanaCyc.sesion_1_descripcion, obj: semanaCyc.sesion_1_objetivo },
              { num: 2, titulo: "Sesión 2 · Día 5", subtitulo: "Cycling Continuo", icono: "🚴", color: B,
                desc: semanaCyc.sesion_2_descripcion, obj: semanaCyc.sesion_2_objetivo },
            ].map(cfg => (
              <SesionCard key={cfg.num}
                color={cfg.color}
                titulo={cfg.titulo}
                subtitulo={cfg.subtitulo}
                icono={cfg.icono}
                descripcion={cfg.desc}
                objetivo={cfg.obj}
                existing={sesCyc.find(s => s.numero_sesion === cfg.num) ?? null}
                abierta={abiertaCyc === cfg.num}
                onToggle={() => setAbiertaCyc(abiertaCyc === cfg.num ? null : cfg.num)}
                onGuardar={(form, c) => guardarCyc(cfg.num, form, c)}
                campos={[
                  { k: "tiempo_min", l: "Tiempo (min)", p: "60", tipo: "number" },
                  { k: "distancia_km", l: "Distancia (km)", p: "25", tipo: "number" },
                  { k: "ritmo_promedio", l: "Vel. prom (km/h)", p: "22", tipo: "number" },
                  { k: "pulsaciones_prom", l: "Puls. prom", p: "130", tipo: "number" },
                ]}
                notaBricks={(cfg as any).notaBricks}
              />
            ))}
          </div>
        )}

        {/* ══ CORE ══ */}
        {vista === "core" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ fontSize: 11, color: P, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
              CORE · 3 opciones · Disponible cualquier día
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
              {CORE_OPS.map(op => (
                <button key={op.num} onClick={() => setCoreOp(coreOp === op.num ? null : op.num)}
                  style={{ padding: "12px 8px", textAlign: "center",
                    border: `1px solid ${coreOp === op.num ? P : "rgba(255,255,255,0.1)"}`,
                    background: coreOp === op.num ? "rgba(99,102,241,0.15)" : "transparent",
                    color: coreOp === op.num ? "#a5b4fc" : "rgba(255,255,255,0.45)",
                    fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700,
                    cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ fontSize: 10, color: coreOp === op.num ? P : "rgba(255,255,255,0.25)",
                    marginBottom: 2, letterSpacing: "0.1em" }}>OPCIÓN</div>
                  {op.num}
                </button>
              ))}
            </div>
            {coreOp !== null && CORE_OPS.find(o => o.num === coreOp)?.ejercicios.map((ej, i) => (
              <div key={i} style={{ marginBottom: 10, padding: "12px 14px",
                background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.15)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 800,
                      textTransform: "uppercase", color: "#fff", marginBottom: 6 }}>
                      <span style={{ color: P, marginRight: 8, opacity: 0.6, fontSize: 12 }}>{String(i + 1).padStart(2, "0")}</span>
                      {ej.nombre}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ padding: "5px 10px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Protocolo</div>
                        <div style={{ fontSize: 13, color: "#e0e7ff", fontWeight: 500 }}>{ej.protocolo}</div>
                      </div>
                      <div style={{ padding: "5px 10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Descanso</div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>⏱ {ej.descanso}</div>
                      </div>
                    </div>
                  </div>
                  {ej.link && (
                    <a href={ej.link} target="_blank" rel="noopener noreferrer"
                      style={{ flexShrink: 0, textDecoration: "none", padding: "8px 10px",
                        background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 26, height: 26, background: P, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#fff", fontSize: 10, marginLeft: 2 }}>▶</span>
                      </div>
                      <span style={{ fontSize: 9, color: P, letterSpacing: "0.05em", textTransform: "uppercase" }}>Video</span>
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
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          padding: "12px 20px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)",
          color: "#86efac", fontSize: 14, zIndex: 200, backdropFilter: "blur(8px)",
          animation: "fadeUp 0.3s ease", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  )
}

/* ══ COMPONENTE: Tarjeta de sesión reutilizable ════════ */
interface Campo { k: string; l: string; p: string; tipo: string }
interface SesionCardProps {
  color: string; titulo: string; subtitulo: string; icono: string
  descripcion: string | null; objetivo: string | null
  existing: any; abierta: boolean
  onToggle: () => void
  onGuardar: (form: any, completar: boolean) => Promise<void>
  campos: Campo[]
  notaBricks?: string
}

function SesionCard({ color, titulo, subtitulo, icono, descripcion, objetivo,
  existing, abierta, onToggle, onGuardar, campos, notaBricks }: SesionCardProps) {

  const init = () => {
    const f: Record<string, string> = { zona: existing?.zona ?? "", nota: existing?.nota ?? "" }
    campos.forEach(c => { f[c.k] = existing?.[c.k]?.toString() ?? "" })
    return f
  }
  const [form, setForm] = useState<Record<string, string>>(init)
  const [guardando, setGuardando] = useState(false)
  const [ok, setOk] = useState<string | null>(null)

  useEffect(() => { setForm(init()) }, [existing?.id])

  const guardar = async (completar: boolean) => {
    setGuardando(true)
    await onGuardar(form, completar)
    setGuardando(false)
    setOk(completar ? "✓ Completada" : "✓ Guardado")
    setTimeout(() => setOk(null), 2500)
  }

  const completada = existing?.completada ?? false
  const G = "#22c55e"

  return (
    <div style={{ marginBottom: 12,
      border: `1px solid ${completada ? `${color}40` : "rgba(255,255,255,0.08)"}`,
      background: completada ? `${color}05` : "#0a0a0a" }}>
      <button onClick={onToggle} style={{ width: "100%", padding: "13px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
        borderBottom: abierta ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: completada ? `${color}20` : "rgba(255,255,255,0.05)",
            border: `1px solid ${completada ? color : "rgba(255,255,255,0.1)"}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
            {completada ? "✓" : icono}
          </div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 800,
              textTransform: "uppercase", color: completada ? color : "#fff" }}>{titulo}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              {subtitulo}
              {completada && existing?.distancia_km && ` · ${existing.distancia_km}km`}
              {completada && existing?.tiempo_min && ` · ${existing.tiempo_min}min`}
            </div>
          </div>
        </div>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, flexShrink: 0 }}>{abierta ? "▲" : "▼"}</span>
      </button>

      {abierta && (
        <div style={{ padding: "14px 16px" }}>
          {notaBricks && (
            <div style={{ marginBottom: 12, padding: "8px 12px",
              background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <div style={{ fontSize: 12, color: "#fcd34d", lineHeight: 1.5 }}>⚡ {notaBricks}</div>
            </div>
          )}
          {(descripcion || objetivo) && (
            <div style={{ marginBottom: 14, padding: "10px 12px",
              background: `${color}08`, border: `1px solid ${color}20` }}>
              <div style={{ fontSize: 10, color: color, letterSpacing: "0.1em",
                textTransform: "uppercase", marginBottom: 5, fontWeight: 700 }}>Protocolo de la semana</div>
              {descripcion && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)",
                marginBottom: objetivo ? 5 : 0, lineHeight: 1.5 }}>{descripcion}</div>}
              {objetivo && <div style={{ fontSize: 13, color: color, fontWeight: 700,
                fontFamily: "'Barlow Condensed',sans-serif" }}>🎯 {objetivo}</div>}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {campos.map(({ k, l, p, tipo }) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 5,
                  letterSpacing: "0.08em", textTransform: "uppercase" }}>{l}</div>
                <input type={tipo} inputMode={tipo === "text" ? "text" : "decimal"}
                  placeholder={p} value={form[k] ?? ""}
                  onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${form[k] ? `${color}50` : "rgba(255,255,255,0.1)"}`,
                    color: "#fff", fontSize: 18, fontFamily: "'Barlow Condensed',sans-serif",
                    fontWeight: 900, outline: "none", textAlign: "center" }} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 6,
              letterSpacing: "0.08em", textTransform: "uppercase" }}>Zona predominante</div>
            <div style={{ display: "flex", gap: 6 }}>
              {["Z1", "Z2", "Z3", "Z4", "Z5"].map(z => (
                <button key={z} onClick={() => setForm(f => ({ ...f, zona: f.zona === z ? "" : z }))}
                  style={{ flex: 1, padding: "7px 4px", textAlign: "center",
                    border: `1px solid ${form.zona === z ? color : "rgba(255,255,255,0.1)"}`,
                    background: form.zona === z ? `${color}20` : "transparent",
                    color: form.zona === z ? color : "rgba(255,255,255,0.4)",
                    fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {z}
                </button>
              ))}
            </div>
          </div>
          <textarea value={form.nota ?? ""} placeholder="Sensaciones, condiciones, observaciones..."
            onChange={e => setForm(f => ({ ...f, nota: e.target.value }))} rows={2}
            style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)",
              fontSize: 13, fontFamily: "'Barlow',sans-serif", outline: "none", resize: "none", marginBottom: 12 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button onClick={() => guardar(false)} disabled={guardando}
              style={{ padding: "11px", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)",
                fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
              Guardar borrador
            </button>
            <button onClick={() => guardar(true)} disabled={guardando}
              style={{ padding: "11px", background: color, border: "none", color: "#fff",
                fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 900,
                letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
              {guardando ? "Guardando..." : "✓ Completar"}
            </button>
          </div>
          {ok && (
            <div style={{ marginTop: 8, padding: "8px", textAlign: "center",
              background: `${color}12`, border: `1px solid ${color}30`, color: color, fontSize: 12 }}>{ok}</div>
          )}
        </div>
      )}
    </div>
  )
}
