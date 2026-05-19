"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"

/* ── Tipos ─────────────────────────────────────────── */
interface Cliente { token: string; nombre: string }
interface SemanaRunning {
  id: string; numero: number
  sesion_1_descripcion: string | null; sesion_1_objetivo_min: string | null
  sesion_2_descripcion: string | null; sesion_2_objetivo: string | null
  sesion_3_descripcion: string | null; sesion_3_objetivo_min: string | null
}
interface SesionRunning {
  id: string; numero_sesion: number; fecha: string
  tiempo_min: number | null; distancia_km: number | null
  ritmo_min_km: string | null; pulsaciones_prom: number | null
  zona: string | null; nota: string | null; completada: boolean
}
interface FormData {
  tiempo_min: string; distancia_km: string
  ritmo_min_km: string; pulsaciones_prom: string
  zona: string; nota: string
}

const V = "#22c55e"   // verde running
const VA = "#16a34a"  // verde activo
const R = "#E8000D"

const ZONAS = ["Z1","Z2","Z3","Z4","Z5"]

const SESION_INFO = [
  { num: 1, label: "Sesión 1", dia: "Martes", tipo: "Zona 2", icon: "🏃" },
  { num: 2, label: "Sesión 2", dia: "Miércoles", tipo: "Intervalos", icon: "⚡" },
  { num: 3, label: "Sesión 3", dia: "Domingo", tipo: "Fondo", icon: "🛤️" },
]

function formatTiempo(min: number | null): string {
  if (!min) return "—"
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return h > 0 ? `${h}h ${m}min` : `${m} min`
}

function fmtFecha(iso: string): string {
  const [, m, d] = iso.split("-")
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${d} ${meses[parseInt(m)-1]}`
}

/* ── Componente form de sesión ─────────────────────── */
function FormSesion({
  semana, numSesion, existing, clienteToken, semanaId,
  onGuardado
}: {
  semana: SemanaRunning; numSesion: number
  existing: SesionRunning | null
  clienteToken: string; semanaId: string
  onGuardado: () => void
}) {
  const [form, setForm] = useState<FormData>({
    tiempo_min: existing?.tiempo_min?.toString() ?? "",
    distancia_km: existing?.distancia_km?.toString() ?? "",
    ritmo_min_km: existing?.ritmo_min_km ?? "",
    pulsaciones_prom: existing?.pulsaciones_prom?.toString() ?? "",
    zona: existing?.zona ?? "",
    nota: existing?.nota ?? "",
  })
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast] = useState<string|null>(null)

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  const guardar = async (completar = false) => {
    setGuardando(true)
    const payload = {
      cliente_token: clienteToken,
      semana_id: semanaId,
      numero_sesion: numSesion,
      fecha: new Date().toISOString().split("T")[0],
      tiempo_min: parseFloat(form.tiempo_min) || null,
      distancia_km: parseFloat(form.distancia_km) || null,
      ritmo_min_km: form.ritmo_min_km || null,
      pulsaciones_prom: parseInt(form.pulsaciones_prom) || null,
      zona: form.zona || null,
      nota: form.nota || null,
      completada: completar,
    }

    if (existing) {
      await supabase.from("sesiones_running").update(payload).eq("id", existing.id)
    } else {
      await supabase.from("sesiones_running").insert(payload)
    }

    setGuardando(false)
    showToast(completar ? "✓ Sesión completada y guardada" : "✓ Datos guardados")
    onGuardado()
  }

  const descripcion = numSesion === 1 ? semana.sesion_1_descripcion
    : numSesion === 2 ? semana.sesion_2_descripcion
    : semana.sesion_3_descripcion
  const objetivo = numSesion === 1 ? (semana.sesion_1_objetivo_min ? `${semana.sesion_1_objetivo_min} min` : null)
    : numSesion === 2 ? semana.sesion_2_objetivo
    : (semana.sesion_3_objetivo_min ? `${semana.sesion_3_objetivo_min} min` : null)

  return (
    <div style={{ padding: "14px 16px" }}>

      {/* Protocolo */}
      <div style={{ marginBottom: 16, padding: "12px 14px",
        background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
        <div style={{ fontSize: 10, color: "rgba(34,197,94,0.7)", letterSpacing: "0.12em",
          textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>Protocolo de la semana</div>
        {descripcion && (
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", marginBottom: objetivo ? 6 : 0,
            lineHeight: 1.5, fontWeight: 500 }}>{descripcion}</div>
        )}
        {objetivo && (
          <div style={{ fontSize: 13, color: "rgba(34,197,94,0.8)", fontWeight: 700,
            fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.05em" }}>
            🎯 {objetivo}
          </div>
        )}
      </div>

      {/* Campos de registro */}
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em",
        textTransform: "uppercase", marginBottom: 12 }}>Registra tu sesión</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>

        {/* Tiempo */}
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 5,
            letterSpacing: "0.08em", textTransform: "uppercase" }}>Tiempo (min)</div>
          <input type="number" inputMode="decimal" placeholder="45"
            value={form.tiempo_min}
            onChange={e => setForm(f => ({...f, tiempo_min: e.target.value}))}
            style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)",
              border: `1px solid ${form.tiempo_min ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.1)"}`,
              color: "#fff", fontSize: 20, fontFamily: "'Barlow Condensed',sans-serif",
              fontWeight: 900, outline: "none", textAlign: "center" }}
          />
        </div>

        {/* Distancia */}
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 5,
            letterSpacing: "0.08em", textTransform: "uppercase" }}>Distancia (km)</div>
          <input type="number" inputMode="decimal" placeholder="8.5"
            value={form.distancia_km}
            onChange={e => setForm(f => ({...f, distancia_km: e.target.value}))}
            style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)",
              border: `1px solid ${form.distancia_km ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.1)"}`,
              color: "#fff", fontSize: 20, fontFamily: "'Barlow Condensed',sans-serif",
              fontWeight: 900, outline: "none", textAlign: "center" }}
          />
        </div>

        {/* Ritmo */}
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 5,
            letterSpacing: "0.08em", textTransform: "uppercase" }}>Ritmo (min/km)</div>
          <input type="text" inputMode="text" placeholder="5:30"
            value={form.ritmo_min_km}
            onChange={e => setForm(f => ({...f, ritmo_min_km: e.target.value}))}
            style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)",
              border: `1px solid ${form.ritmo_min_km ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.1)"}`,
              color: "#fff", fontSize: 20, fontFamily: "'Barlow Condensed',sans-serif",
              fontWeight: 900, outline: "none", textAlign: "center" }}
          />
        </div>

        {/* Pulsaciones */}
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 5,
            letterSpacing: "0.08em", textTransform: "uppercase" }}>Puls. prom (lpm)</div>
          <input type="number" inputMode="numeric" placeholder="145"
            value={form.pulsaciones_prom}
            onChange={e => setForm(f => ({...f, pulsaciones_prom: e.target.value}))}
            style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)",
              border: `1px solid ${form.pulsaciones_prom ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.1)"}`,
              color: "#fff", fontSize: 20, fontFamily: "'Barlow Condensed',sans-serif",
              fontWeight: 900, outline: "none", textAlign: "center" }}
          />
        </div>
      </div>

      {/* Zona */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 8,
          letterSpacing: "0.08em", textTransform: "uppercase" }}>Zona predominante</div>
        <div style={{ display: "flex", gap: 6 }}>
          {ZONAS.map(z => (
            <button key={z} onClick={() => setForm(f => ({...f, zona: f.zona === z ? "" : z}))}
              style={{ flex: 1, padding: "8px 4px", textAlign: "center",
                border: `1px solid ${form.zona === z ? V : "rgba(255,255,255,0.1)"}`,
                background: form.zona === z ? "rgba(34,197,94,0.15)" : "transparent",
                color: form.zona === z ? V : "rgba(255,255,255,0.4)",
                fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700,
                cursor: "pointer", transition: "all 0.15s" }}>
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* Nota */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 6,
          letterSpacing: "0.08em", textTransform: "uppercase" }}>Nota / Sensaciones</div>
        <textarea value={form.nota} placeholder="Cómo te sentiste, condiciones, observaciones..."
          onChange={e => setForm(f => ({...f, nota: e.target.value}))}
          rows={2}
          style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)",
            fontSize: 13, fontFamily: "'Barlow',sans-serif", outline: "none", resize: "none" }}
        />
      </div>

      {/* Botones */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button onClick={() => guardar(false)} disabled={guardando}
          style={{ padding: "12px", background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)",
            fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
          Guardar borrador
        </button>
        <button onClick={() => guardar(true)} disabled={guardando}
          style={{ padding: "12px", background: V, border: "none", color: "#fff",
            fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 900,
            letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
          {guardando ? "Guardando..." : "✓ Completar sesión"}
        </button>
      </div>

      {toast && (
        <div style={{ marginTop: 10, padding: "10px 12px",
          background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)",
          color: "#86efac", fontSize: 13, textAlign: "center" }}>
          {toast}
        </div>
      )}
    </div>
  )
}

/* ══ PÁGINA PRINCIPAL ══════════════════════════════════ */
export default function RunningPage() {
  const [token, setToken]         = useState<string | null>(null)
  const [cliente, setCliente]     = useState<Cliente | null>(null)
  const [denegado, setDenegado]   = useState(false)
  const [cargando, setCargando]   = useState(true)
  const [semanas, setSemanas]     = useState<SemanaRunning[]>([])
  const [semanaActiva, setSemanaActiva] = useState<SemanaRunning | null>(null)
  const [sesiones, setSesiones]   = useState<SesionRunning[]>([])
  const [sesionAbierta, setSesionAbierta] = useState<number | null>(null)
  const [progId, setProgId]       = useState<string | null>(null)

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token")
    if (!t) { setDenegado(true); setCargando(false); return }
    setToken(t)
    supabase.from("clientes").select("token,nombre").eq("token", t).eq("activo", true).single()
      .then(({ data, error }) => {
        if (error || !data) { setDenegado(true); setCargando(false); return }
        setCliente(data)
        cargarPrograma(t)
      })
  }, [])

  const cargarPrograma = async (tok: string) => {
    const { data: prog } = await supabase
      .from("programas_running").select("id")
      .eq("cliente_token", tok).eq("activo", true).single()
    if (!prog) { setCargando(false); return }
    setProgId(prog.id)

    const { data: sems } = await supabase
      .from("semanas_running").select("*")
      .eq("programa_id", prog.id).order("numero")
    if (sems) {
      setSemanas(sems)
      // Semana activa = la última con menos de 3 sesiones completadas, o la primera
      setSemanaActiva(sems[0])
    }
    setCargando(false)
  }

  const cargarSesiones = useCallback(async (semanaId: string) => {
    if (!token) return
    const { data } = await supabase
      .from("sesiones_running").select("*")
      .eq("cliente_token", token).eq("semana_id", semanaId)
      .order("numero_sesion")
    if (data) setSesiones(data)
  }, [token])

  useEffect(() => {
    if (semanaActiva) cargarSesiones(semanaActiva.id)
  }, [semanaActiva, cargarSesiones])

  const getSesion = (num: number) => sesiones.find(s => s.numero_sesion === num) ?? null

  const progresoPct = semanas.length > 0 && semanaActiva
    ? ((semanaActiva.numero - 1) / semanas.length) * 100 : 0

  /* ── Acceso denegado ── */
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
      Cargando plan de running...
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
        textarea{box-sizing:border-box}
      `}</style>

      {/* Header */}
      <div style={{ position:"sticky", top:0, background:"rgba(0,0,0,0.95)",
        backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.06)", zIndex:100 }}>
        <div style={{ height:2, background:V }}/>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"0 16px", height:52,
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <a href={`/plan-entrenamiento?token=${token}`}
              style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, fontWeight:900,
                textDecoration:"none", color:"#fff" }}>
              COACH<span style={{ color:R }}>.</span>DAVID
            </a>
            <span style={{ width:1, height:14, background:"rgba(255,255,255,0.15)" }}/>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", letterSpacing:"0.2em",
              textTransform:"uppercase" }}>Running</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:6, height:6, background:V, borderRadius:"50%", animation:"blink 2s infinite" }}/>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{cliente?.nombre}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"24px 16px" }}>

        {/* Saludo */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, color:V, letterSpacing:"0.4em",
            textTransform:"uppercase", marginBottom:6 }}>Plan de running</div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:34, fontWeight:900,
            textTransform:"uppercase", lineHeight:1 }}>
            <span style={{ color:V }}>{cliente?.nombre.split(" ")[0]}</span> · 12 semanas
          </h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:6 }}>
            Selecciona la semana activa y registra cada sesión
          </p>
        </div>

        {/* Progreso */}
        {semanaActiva && (
          <div style={{ marginBottom:24, padding:"14px 16px",
            background:"rgba(34,197,94,0.05)", border:"1px solid rgba(34,197,94,0.15)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>
                Semana {semanaActiva.numero} de {semanas.length}
              </span>
              <span style={{ fontSize:12, color:V, fontWeight:700 }}>
                {Math.round(progresoPct)}% completado
              </span>
            </div>
            <div style={{ height:4, background:"rgba(255,255,255,0.08)", borderRadius:2 }}>
              <div style={{ height:"100%", background:V, borderRadius:2,
                width:`${progresoPct}%`, transition:"width 0.5s ease" }}/>
            </div>
          </div>
        )}

        {/* Selector de semanas */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em",
            textTransform:"uppercase", marginBottom:10 }}>Selecciona la semana</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {semanas.map(s => (
              <button key={s.id} onClick={() => { setSemanaActiva(s); setSesionAbierta(null) }}
                style={{ padding:"8px 12px", minWidth:52,
                  border:`1px solid ${semanaActiva?.id===s.id ? V : "rgba(255,255,255,0.1)"}`,
                  background:semanaActiva?.id===s.id ? "rgba(34,197,94,0.15)" : "transparent",
                  color:semanaActiva?.id===s.id ? V : "rgba(255,255,255,0.4)",
                  fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700,
                  cursor:"pointer", transition:"all 0.15s" }}>
                S{s.numero}
              </button>
            ))}
          </div>
        </div>

        {/* Sesiones de la semana activa */}
        {semanaActiva && (
          <div style={{ animation:"fadeUp 0.3s ease" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ width:3, height:32, background:V }}/>
              <div>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, fontWeight:900,
                  textTransform:"uppercase", color:"rgba(255,255,255,0.9)" }}>
                  Semana {semanaActiva.numero}
                </div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:1 }}>
                  3 sesiones · Martes · Miércoles · Domingo
                </div>
              </div>
            </div>

            {SESION_INFO.map(info => {
              const sesion = getSesion(info.num)
              const completada = sesion?.completada ?? false
              const abierta = sesionAbierta === info.num

              return (
                <div key={info.num} style={{ marginBottom:14,
                  border:`1px solid ${completada ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                  background:completada ? "rgba(34,197,94,0.03)" : "#0a0a0a" }}>

                  {/* Cabecera de sesión */}
                  <button onClick={() => setSesionAbierta(abierta ? null : info.num)}
                    style={{ width:"100%", padding:"14px 16px", display:"flex",
                      alignItems:"center", justifyContent:"space-between",
                      background:"transparent", border:"none", cursor:"pointer",
                      borderBottom: abierta ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, textAlign:"left" }}>
                      <div style={{ width:36, height:36, borderRadius:"50%",
                        background:completada?"rgba(34,197,94,0.15)":"rgba(255,255,255,0.05)",
                        border:`1px solid ${completada?V:"rgba(255,255,255,0.1)"}`,
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                        {completada ? "✓" : info.icon}
                      </div>
                      <div>
                        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:16,
                          fontWeight:800, textTransform:"uppercase", color:completada?V:"#fff" }}>
                          {info.label} · {info.dia}
                        </div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:1 }}>
                          {info.tipo}
                          {completada && sesion && (
                            <span style={{ marginLeft:8, color:V }}>
                              {sesion.distancia_km ? `· ${sesion.distancia_km}km` : ""}
                              {sesion.tiempo_min ? ` · ${formatTiempo(sesion.tiempo_min)}` : ""}
                              {sesion.pulsaciones_prom ? ` · ${sesion.pulsaciones_prom}lpm` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      {completada && (
                        <span style={{ fontSize:10, padding:"3px 8px",
                          background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)",
                          color:V, fontFamily:"'Barlow Condensed',sans-serif",
                          fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>
                          Completada
                        </span>
                      )}
                      <span style={{ color:"rgba(255,255,255,0.3)", fontSize:14 }}>
                        {abierta ? "▲" : "▼"}
                      </span>
                    </div>
                  </button>

                  {/* Form expandible */}
                  {abierta && (
                    <FormSesion
                      semana={semanaActiva}
                      numSesion={info.num}
                      existing={sesion}
                      clienteToken={token!}
                      semanaId={semanaActiva.id}
                      onGuardado={() => cargarSesiones(semanaActiva.id)}
                    />
                  )}
                </div>
              )
            })}

            {/* Resumen de semanas anteriores */}
            {semanas.filter(s => s.numero < semanaActiva.numero).length > 0 && (
              <div style={{ marginTop:28 }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", letterSpacing:"0.1em",
                  textTransform:"uppercase", marginBottom:12 }}>Historial de semanas</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:8 }}>
                  {semanas.filter(s => s.numero < semanaActiva.numero).map(s => (
                    <button key={s.id} onClick={() => { setSemanaActiva(s); setSesionAbierta(null) }}
                      style={{ padding:"12px", background:"rgba(255,255,255,0.03)",
                        border:"1px solid rgba(255,255,255,0.07)", cursor:"pointer", textAlign:"left" }}>
                      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14,
                        fontWeight:700, color:"rgba(255,255,255,0.6)", marginBottom:2 }}>
                        Semana {s.numero}
                      </div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>
                        Ver registros →
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enlace de vuelta */}
        <div style={{ marginTop:32, textAlign:"center" }}>
          <a href={`/plan-entrenamiento?token=${token}`}
            style={{ fontSize:13, color:"rgba(255,255,255,0.3)", textDecoration:"none" }}>
            ← Volver al plan de musculación
          </a>
        </div>

      </div>
    </div>
  )
}
