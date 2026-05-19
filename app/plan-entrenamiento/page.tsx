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

function formatFecha(iso: string) {
  const [y, m, d] = iso.split("-")
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${d} ${meses[parseInt(m)-1]}`
}

function parsearSegundos(descanso: string | null): number {
  if (!descanso) return 60
  if (descanso.includes("2 min")) return 120
  if (descanso.includes("1:30")) return 90
  return 60
}

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
  const [guardando, setGuardando]   = useState<string|null>(null)
  const [toast, setToast]           = useState<string|null>(null)
  const [cronSeg, setCronSeg]       = useState(0)
  const [cronActivo, setCronActivo] = useState(false)
  const [sesionCerrada, setSesionCerrada] = useState(false)

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
    setDiaActivo(dia)
    setEjercicios([])
    setRegs({})
    setAnts({})
    setSesionId(null)
    setSesionCerrada(false)

    const { data: ejs } = await supabase
      .from("ejercicios").select("*").eq("dia_id", dia.id).order("orden")
    if (!ejs) return
    setEjercicios(ejs)

    const base: Record<string, Record<number,{kg:string;reps:string}>> = {}
    ejs.forEach(e => {
      base[e.id] = {}
      for (let s = 1; s <= e.series_trabajo; s++) base[e.id][s] = { kg: "", reps: "" }
    })
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
      setSesionId(ses.id)
      setSesionCerrada(ses.completada ?? false)
      const { data: rHoy } = await supabase
        .from("registros").select("ejercicio_id,serie_num,kg,reps").eq("sesion_id", ses.id)
      if (rHoy) {
        const m = { ...base }
        rHoy.forEach(r => {
          if (m[r.ejercicio_id]) {
            m[r.ejercicio_id][r.serie_num] = { kg: r.kg?.toString() ?? "", reps: r.reps?.toString() ?? "" }
          }
        })
        setRegs(m)
      }
    }

    const { data: sesAnt } = await supabase
      .from("sesiones").select("id,fecha")
      .eq("cliente_token", token).eq("dia_id", dia.id).eq("completada", true)
      .neq("fecha", hoy).order("fecha", { ascending: false }).limit(1)
    if (sesAnt && sesAnt.length > 0) {
      const { data: rAnt } = await supabase
        .from("registros").select("ejercicio_id,serie_num,kg,reps").eq("sesion_id", sesAnt[0].id)
      if (rAnt) {
        const ma: Record<string, {fecha:string; data:RegAnterior[]}> = {}
        rAnt.forEach(r => {
          if (!ma[r.ejercicio_id]) ma[r.ejercicio_id] = { fecha: sesAnt[0].fecha, data: [] }
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
    const key = `${ejId}-${serie}`
    setGuardando(key)
    await supabase.from("registros").upsert(
      { sesion_id: sesionId, ejercicio_id: ejId, serie_num: serie,
        kg: parseFloat(val.kg) || null, reps: parseInt(val.reps) || null },
      { onConflict: "sesion_id,ejercicio_id,serie_num" }
    )
    setGuardando(null)
    showToast("✓ Serie guardada")
  }

  const cerrarSesion = async () => {
    if (!sesionId) return
    await supabase.from("sesiones")
      .update({ completada: true, completada_en: new Date().toISOString() })
      .eq("id", sesionId)
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
  const fmtCron = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

  if (denegado) return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", flexDirection: "column", color: "#fff",
      fontFamily: "sans-serif", textAlign: "center", padding: 32 }}>
      <div style={{ fontSize: 48, color: R, marginBottom: 16 }}>🔒</div>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Acceso restringido</h1>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 340 }}>
        Esta página es exclusiva para clientes de Coach David. Contacta a tu coach para obtener tu enlace personalizado.
      </p>
    </div>
  )

  if (cargando) return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", color: "#fff", fontFamily: "sans-serif" }}>
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
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, background: "rgba(0,0,0,0.95)",
        backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", zIndex: 100 }}>
        <div style={{ height: 2, background: R }} />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 16px", height: 52,
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 900 }}>
              COACH<span style={{ color: R }}>.</span>DAVID
            </span>
            <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.15)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Entrenamiento
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", animation: "blink 2s infinite" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{cliente?.nombre}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>

        {/* Título */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: R, letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: 6 }}>
            Tu programa
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 900,
            textTransform: "uppercase", lineHeight: 1 }}>
            Hola, <span style={{ color: R }}>{cliente?.nombre.split(" ")[0]}</span>
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
            Selecciona el día que vas a entrenar hoy
          </p>
        </div>

        {/* Selector días */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8, marginBottom: 28 }}>
          {dias.map(d => (
            <button key={d.id} onClick={() => seleccionarDia(d)} style={{
              padding: "12px 8px",
              border: `1px solid ${diaActivo?.id === d.id ? R : "rgba(255,255,255,0.1)"}`,
              background: diaActivo?.id === d.id ? `${R}18` : "transparent",
              color: diaActivo?.id === d.id ? "#fff" : "rgba(255,255,255,0.5)",
              fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.05em", textAlign: "center", lineHeight: 1.3,
              transition: "all 0.2s"
            }}>
              <div style={{ fontSize: 10, color: diaActivo?.id === d.id ? R : "rgba(255,255,255,0.3)", marginBottom: 4 }}>
                DÍA {d.numero}
              </div>
              {d.nombre.replace(/Día \d+ — /, "")}
            </button>
          ))}
        </div>

        {/* Cronómetro sticky */}
        {cronActivo && (
          <div style={{
            position: "sticky", top: 54, zIndex: 90,
            background: cronSeg <= 10 ? "#7f1d1d" : cronSeg <= 30 ? "#78350f" : "#052e16",
            border: `1px solid ${cronSeg <= 10 ? R : cronSeg <= 30 ? "#d97706" : "#16a34a"}`,
            padding: "10px 16px", marginBottom: 16,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            animation: "fadeUp 0.2s ease"
          }}>
            <span style={{
              fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13,
              letterSpacing: "0.15em", textTransform: "uppercase",
              color: cronSeg <= 10 ? "#fca5a5" : cronSeg <= 30 ? "#fcd34d" : "#86efac"
            }}>
              {cronSeg <= 10 ? "¡Última!" : cronSeg <= 30 ? "Preparándose..." : "Descansando"}
            </span>
            <span style={{
              fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 900,
              color: cronSeg <= 10 ? R : cronSeg <= 30 ? "#f59e0b" : "#22c55e"
            }}>
              {fmtCron(cronSeg)}
            </span>
            <button onClick={() => setCronActivo(false)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18 }}>
              ✕
            </button>
          </div>
        )}

        {/* Ejercicios */}
        {diaActivo && ejercicios.length > 0 && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            {ejercicios.map((ej, idx) => {
              const ant = ants[ej.id]
              return (
                <div key={ej.id} style={{ marginBottom: 20, border: "1px solid rgba(255,255,255,0.08)", background: "#0a0a0a" }}>

                  {/* Cabecera */}
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: ej.es_biserie ? "rgba(232,0,13,0.06)" : "transparent" }}>
                    {ej.es_biserie && (
                      <span style={{ fontSize: 10, background: `${R}20`, color: R, padding: "2px 8px",
                        letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700,
                        marginBottom: 6, display: "inline-block" }}>
                        Biserie
                      </span>
                    )}
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 800,
                      textTransform: "uppercase", lineHeight: 1 }}>
                      <span style={{ color: R, marginRight: 8, opacity: 0.5 }}>{String(idx + 1).padStart(2, "0")}</span>
                      {ej.nombre}
                    </div>
                    {ej.nota_tecnica && (
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{ej.nota_tecnica}</div>
                    )}

                    {/* Tags protocolo */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                      {ej.reps_objetivo && (
                        <span style={{ fontSize: 11, padding: "3px 8px", background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                          {ej.reps_objetivo}
                        </span>
                      )}
                      {ej.rir_objetivo && (
                        <span style={{ fontSize: 11, padding: "3px 8px", background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                          {ej.rir_objetivo}
                        </span>
                      )}
                      {ej.descanso && (
                        <span style={{ fontSize: 11, padding: "3px 8px", background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                          ⏱ {ej.descanso}
                        </span>
                      )}
                    </div>

                    {/* Calentamiento */}
                    {ej.series_calentamiento > 0 && (
                      <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em",
                          textTransform: "uppercase", marginBottom: 2 }}>Calentamiento</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                          {ej.series_calentamiento} serie{ej.series_calentamiento > 1 ? "s" : ""} × {ej.reps_calentamiento}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Semana anterior */}
                  {ant && (
                    <div style={{ padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                      background: "rgba(255,255,255,0.02)" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em",
                        textTransform: "uppercase", marginBottom: 6 }}>
                        Semana anterior · {formatFecha(ant.fecha)}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {ant.data.sort((a, b) => a.serie_num - b.serie_num).map(r => (
                          <div key={r.serie_num} style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                            S{r.serie_num}: <span style={{ color: "rgba(255,255,255,0.8)" }}>
                              {r.kg ? `${r.kg}kg` : "—"} × {r.reps ?? "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Series */}
                  <div style={{ padding: "12px 16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 1fr 36px", gap: 8, marginBottom: 8,
                      fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      <span>Serie</span><span>Kg</span><span>Reps</span><span></span>
                    </div>
                    {Array.from({ length: ej.series_trabajo }, (_, i) => i + 1).map(serie => {
                      const val = regs[ej.id]?.[serie] || { kg: "", reps: "" }
                      return (
                        <div key={serie} style={{ display: "grid", gridTemplateColumns: "56px 1fr 1fr 36px",
                          gap: 8, marginBottom: 8, alignItems: "center" }}>
                          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13,
                            color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>
                            S{serie}
                          </div>
                          <input type="number" inputMode="decimal" placeholder="kg"
                            value={val.kg} disabled={sesionCerrada}
                            onChange={e => setRegs(r => ({ ...r, [ej.id]: { ...r[ej.id], [serie]: { ...r[ej.id][serie], kg: e.target.value } } }))}
                            onBlur={() => guardarSerie(ej.id, serie)}
                            style={{ padding: "10px 12px", background: "rgba(255,255,255,0.04)",
                              border: `1px solid ${val.kg ? "rgba(232,0,13,0.5)" : "rgba(255,255,255,0.1)"}`,
                              color: "#fff", fontSize: 16, fontFamily: "'Barlow Condensed',sans-serif",
                              fontWeight: 700, outline: "none", width: "100%" }}
                          />
                          <input type="number" inputMode="numeric" placeholder="reps"
                            value={val.reps} disabled={sesionCerrada}
                            onChange={e => setRegs(r => ({ ...r, [ej.id]: { ...r[ej.id], [serie]: { ...r[ej.id][serie], reps: e.target.value } } }))}
                            onBlur={() => guardarSerie(ej.id, serie)}
                            style={{ padding: "10px 12px", background: "rgba(255,255,255,0.04)",
                              border: `1px solid ${val.reps ? "rgba(232,0,13,0.5)" : "rgba(255,255,255,0.1)"}`,
                              color: "#fff", fontSize: 16, fontFamily: "'Barlow Condensed',sans-serif",
                              fontWeight: 700, outline: "none", width: "100%" }}
                          />
                          <button onClick={() => iniciarCron(parsearSegundos(ej.descanso))}
                            title="Iniciar descanso" disabled={sesionCerrada}
                            style={{ width: 36, height: 36, background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)",
                              cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            ⏱
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Cerrar sesión */}
            <div style={{ marginTop: 8, padding: 20,
              border: `1px solid ${sesionCerrada ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}`,
              background: sesionCerrada ? "rgba(34,197,94,0.05)" : "rgba(232,0,13,0.04)" }}>
              {sesionCerrada ? (
                <div style={{ textAlign: "center", color: "#22c55e",
                  fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14,
                  fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  ✓ Sesión enviada al coach
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 14, fontWeight: 300, lineHeight: 1.6 }}>
                    Al cerrar la sesión, el resumen se envía automáticamente a Coach David para el seguimiento de tu progreso.
                  </p>
                  <button onClick={cerrarSesion} style={{
                    width: "100%", padding: 16, background: "#22c55e", border: "none", color: "#fff",
                    fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 900,
                    letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"
                  }}>
                    Cerrar sesión y enviar al coach ✓
                  </button>
                </>
              )}
            </div>
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
