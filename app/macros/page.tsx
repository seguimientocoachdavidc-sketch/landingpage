"use client"

import { useEffect, useState, useRef } from "react"
import { ALIMENTOS } from "@/lib/alimentos"

const R = "#E8000D"

/* ── Tipos ───────────────────────────────────────────────────── */
interface EntradaComida {
  id: string
  alimentoId: number
  nombreAlimento: string
  gramos: number
  kcal: number
  proteina: number
  lipidos: number
  cho: number
  comida: number // 1-6
  hora: string
}

interface DiaData {
  fecha: string
  nombre: string
  entradas: EntradaComida[]
  cerrado: boolean
}

/* ── Hook responsive ─────────────────────────────────────────── */
function useBreakpoint() {
  const [w, setW] = useState(1200)
  useEffect(() => {
    const check = () => setW(window.innerWidth)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return { isMobile: w < 768 }
}

/* ── Calcular macros por gramos ──────────────────────────────── */
function calcular(alimentoId: number, gramos: number) {
  const a = ALIMENTOS.find(x => x.id === alimentoId)
  if (!a) return { kcal: 0, proteina: 0, lipidos: 0, cho: 0 }
  const f = gramos / 100
  return {
    kcal:     Math.round(a.kcal * f),
    proteina: Math.round(a.proteina * f * 10) / 10,
    lipidos:  Math.round(a.lipidos * f * 10) / 10,
    cho:      Math.round(a.cho * f * 10) / 10,
  }
}

/* ── Fecha hoy ───────────────────────────────────────────────── */
function hoy() { return new Date().toISOString().split("T")[0] }
function horaActual() { return new Date().toTimeString().slice(0, 5) }
function formatFecha(iso: string) {
  const [y, m, d] = iso.split("-")
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${d} de ${meses[parseInt(m)-1]} de ${y}`
}

/* ── Storage key por usuario ─────────────────────────────────── */
function getStorageKey(token: string, fecha: string) {
  return `macros_${token}_${fecha}`
}

/* ══ COMPONENTE PRINCIPAL ════════════════════════════════════════ */
export default function MacrosPage() {
  const { isMobile } = useBreakpoint()
  const [token, setToken] = useState<string | null>(null)
  const [nombreUsuario, setNombreUsuario] = useState("")
  const [accesoDenegado, setAccesoDenegado] = useState(false)
  const [diaData, setDiaData] = useState<DiaData | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [resultados, setResultados] = useState<typeof ALIMENTOS[number][]>([])
  const [alimentoSel, setAlimentoSel] = useState<typeof ALIMENTOS[number] | null>(null)
  const [gramos, setGramos] = useState("100")
  const [comidaNum, setComidaNum] = useState(1)
  const [enviando, setEnviando] = useState(false)
  const [toast, setToast] = useState<{ tipo: "ok" | "err"; msg: string } | null>(null)
  const [vistaActiva, setVistaActiva] = useState<"agregar" | "resumen">("agregar")
  const busquedaRef = useRef<HTMLInputElement>(null)

  /* ── Verificar token al cargar ──────────────────────────────── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get("token")
    if (!t) { setAccesoDenegado(true); return }

    // Verificar token contra el API
    fetch(`/api/macros/verificar?token=${t}`)
      .then(r => r.json())
      .then(data => {
        if (data.valido) {
          setToken(t)
          setNombreUsuario(data.nombre || "")
          cargarDia(t, hoy(), data.nombre || "")
        } else {
          setAccesoDenegado(true)
        }
      })
      .catch(() => setAccesoDenegado(true))
  }, [])

  /* ── Cargar día desde localStorage ─────────────────────────── */
  const cargarDia = (tok: string, fecha: string, nombre: string) => {
    const key = getStorageKey(tok, fecha)
    const guardado = localStorage.getItem(key)
    if (guardado) {
      setDiaData(JSON.parse(guardado))
    } else {
      const nuevo: DiaData = { fecha, nombre, entradas: [], cerrado: false }
      setDiaData(nuevo)
      localStorage.setItem(key, JSON.stringify(nuevo))
    }
  }

  /* ── Buscar alimentos ───────────────────────────────────────── */
  useEffect(() => {
    if (busqueda.trim().length < 2) { setResultados([]); return }
    const q = busqueda.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const r = ALIMENTOS.filter(a => {
      const n = a.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      return n.includes(q)
    }).slice(0, 8)
    setResultados(r)
  }, [busqueda])

  /* ── Agregar entrada ────────────────────────────────────────── */
  const agregarEntrada = () => {
    if (!alimentoSel || !diaData || !token) return
    const g = parseFloat(gramos)
    if (isNaN(g) || g <= 0) { showToast("err", "Ingresa un peso válido en gramos."); return }

    const macros = calcular(alimentoSel.id, g)
    const entrada: EntradaComida = {
      id: `${Date.now()}`,
      alimentoId: alimentoSel.id,
      nombreAlimento: alimentoSel.nombre,
      gramos: g,
      comida: comidaNum,
      hora: horaActual(),
      ...macros,
    }

    const nuevaData: DiaData = {
      ...diaData,
      entradas: [...diaData.entradas, entrada],
    }

    setDiaData(nuevaData)
    localStorage.setItem(getStorageKey(token, diaData.fecha), JSON.stringify(nuevaData))
    setBusqueda("")
    setAlimentoSel(null)
    setGramos("100")
    setResultados([])
    showToast("ok", `${alimentoSel.nombre} agregado a Comida ${comidaNum}`)
    busquedaRef.current?.focus()
  }

  /* ── Eliminar entrada ───────────────────────────────────────── */
  const eliminarEntrada = (id: string) => {
    if (!diaData || !token) return
    const nuevaData = { ...diaData, entradas: diaData.entradas.filter(e => e.id !== id) }
    setDiaData(nuevaData)
    localStorage.setItem(getStorageKey(token, diaData.fecha), JSON.stringify(nuevaData))
  }

  /* ── Totales del día ────────────────────────────────────────── */
  const totales = diaData?.entradas.reduce((acc, e) => ({
    kcal:     acc.kcal + e.kcal,
    proteina: Math.round((acc.proteina + e.proteina) * 10) / 10,
    lipidos:  Math.round((acc.lipidos + e.lipidos) * 10) / 10,
    cho:      Math.round((acc.cho + e.cho) * 10) / 10,
  }), { kcal: 0, proteina: 0, lipidos: 0, cho: 0 }) ?? { kcal: 0, proteina: 0, lipidos: 0, cho: 0 }

  /* ── Cerrar día y enviar resumen ────────────────────────────── */
  const cerrarDia = async () => {
    if (!diaData || !token || enviando) return
    setEnviando(true)
    try {
      const res = await fetch("/api/macros/cerrar-dia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, diaData, totales }),
      })
      if (res.ok) {
        const nuevaData = { ...diaData, cerrado: true }
        setDiaData(nuevaData)
        localStorage.setItem(getStorageKey(token, diaData.fecha), JSON.stringify(nuevaData))
        showToast("ok", "Resumen enviado correctamente a Coach David ✓")
      } else {
        showToast("err", "Error al enviar. Intenta de nuevo.")
      }
    } catch { showToast("err", "Sin conexión. Intenta de nuevo.") }
    setEnviando(false)
  }

  const showToast = (tipo: "ok" | "err", msg: string) => {
    setToast({ tipo, msg })
    setTimeout(() => setToast(null), 4000)
  }

  /* ── Vista de acceso denegado ───────────────────────────────── */
  if (accesoDenegado) return <AccesoDenegado />

  /* ── Loading ───────────────────────────────────────────────── */
  if (!token || !diaData) return <Loading />

  /* ── Agrupar entradas por comida ────────────────────────────── */
  const entradasPorComida = [1,2,3,4,5,6].map(n => ({
    num: n,
    entradas: diaData.entradas.filter(e => e.comida === n),
  })).filter(c => c.entradas.length > 0 || c.num === comidaNum)

  const macrosPreview = alimentoSel ? calcular(alimentoSel.id, parseFloat(gramos) || 0) : null

  return (
    <div style={{ background: "#000", color: "#fff", fontFamily: "'Barlow', sans-serif", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${R}; color: #fff; }
        .bc { font-family: 'Barlow Condensed', Impact, sans-serif; }
        .b  { font-family: 'Barlow', sans-serif; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .entrada-row:hover { background: rgba(255,255,255,0.04) !important; }
      `}</style>

      {/* Línea roja top */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: R, zIndex: 200 }} />

      {/* ── HEADER ──────────────────────────────────────────── */}
      <header style={{ position: "fixed", top: 2, left: 0, right: 0, zIndex: 100, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: isMobile ? "0 16px" : "0 32px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="/" className="bc" style={{ fontSize: 16, fontWeight: 900, textDecoration: "none", color: "#fff" }}>
              COACH<span style={{ color: R }}>.</span>DAVID
            </a>
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.15)" }} />
            <span className="bc" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Macros
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", animation: "blink 2s ease infinite" }} />
            {!isMobile && <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{nombreUsuario}</span>}
          </div>
        </div>
      </header>

      {/* ── TABS de navegación ──────────────────────────────── */}
      <div style={{ position: "fixed", top: 56, left: 0, right: 0, zIndex: 99, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px", display: "flex" }}>
          {[{ key: "agregar", label: "Registrar comida" }, { key: "resumen", label: `Resumen del día (${diaData.entradas.length})` }].map(tab => (
            <button key={tab.key} onClick={() => setVistaActiva(tab.key as any)}
              className="bc"
              style={{ padding: "12px 20px", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", color: vistaActiva === tab.key ? "#fff" : "rgba(255,255,255,0.35)", borderBottom: `2px solid ${vistaActiva === tab.key ? R : "transparent"}`, transition: "all 0.2s ease", whiteSpace: "nowrap" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENIDO ───────────────────────────────────────── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: isMobile ? "108px 16px 80px" : "108px 32px 80px" }}>

        {/* Fecha y nombre */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="bc" style={{ fontSize: 11, color: R, letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: 6 }}>
              {formatFecha(diaData.fecha)}
            </div>
            <div className="bc" style={{ fontSize: isMobile ? 28 : 36, fontWeight: 900, textTransform: "uppercase", lineHeight: 1 }}>
              Hola, <span style={{ color: R }}>{nombreUsuario.split(" ")[0]}</span>
            </div>
          </div>
          {diaData.cerrado && (
            <div style={{ padding: "8px 16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#22c55e", fontSize: 14 }}>✓</span>
              <span className="bc" style={{ fontSize: 12, color: "#22c55e", letterSpacing: "0.2em", textTransform: "uppercase" }}>Día cerrado</span>
            </div>
          )}
        </div>

        {/* ── Totales siempre visibles arriba ─────────────── */}
        <TotalesBar totales={totales} isMobile={isMobile} />

        {/* ════ VISTA: AGREGAR ════════════════════════════════ */}
        {vistaActiva === "agregar" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>

            {diaData.cerrado ? (
              <div style={{ padding: "24px", border: "1px solid rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.05)", marginBottom: 24, textAlign: "center" }}>
                <p className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                  El día ya fue cerrado. El resumen fue enviado a Coach David. Mañana el registro se reinicia automáticamente.
                </p>
              </div>
            ) : (
              <>
                {/* Selector de comida */}
                <div style={{ marginBottom: 20 }}>
                  <label className="bc" style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: 10 }}>
                    ¿A qué comida pertenece? <span style={{ color: R }}>*</span>
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {[1,2,3,4,5,6].map(n => (
                      <button key={n} onClick={() => setComidaNum(n)}
                        className="bc"
                        style={{ padding: "10px 18px", border: `1px solid ${comidaNum === n ? R : "rgba(255,255,255,0.1)"}`, background: comidaNum === n ? `${R}18` : "transparent", color: comidaNum === n ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.2s ease" }}>
                        Comida {n}
                        {diaData.entradas.filter(e => e.comida === n).length > 0 && (
                          <span style={{ marginLeft: 6, fontSize: 11, color: comidaNum === n ? R : "rgba(255,255,255,0.3)" }}>
                            ({diaData.entradas.filter(e => e.comida === n).length})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buscador de alimentos */}
                <div style={{ marginBottom: 16, position: "relative" }}>
                  <label className="bc" style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: 8 }}>
                    Buscar alimento <span style={{ color: R }}>*</span>
                  </label>
                  <input
                    ref={busquedaRef}
                    type="text" value={busqueda} placeholder="Escribe el nombre del alimento..."
                    onChange={e => { setBusqueda(e.target.value); setAlimentoSel(null) }}
                    style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.04)", border: `1px solid ${alimentoSel ? R : "rgba(255,255,255,0.12)"}`, color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: 15, outline: "none", transition: "border-color 0.2s ease" }}
                    onFocus={e => (e.target.style.borderColor = R)}
                    onBlur={e => { if (!alimentoSel) e.target.style.borderColor = "rgba(255,255,255,0.12)" }}
                  />

                  {/* Dropdown resultados */}
                  {resultados.length > 0 && !alimentoSel && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#111", border: `1px solid ${R}40`, borderTop: "none", maxHeight: 280, overflowY: "auto", animation: "slideIn 0.15s ease" }}>
                      {resultados.map(a => (
                        <button key={a.id} onClick={() => { setAlimentoSel(a); setBusqueda(a.nombre); setResultados([]) }}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "11px 16px", background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", textAlign: "left", transition: "background 0.15s ease" }}
                          onMouseEnter={e => (e.currentTarget.style.background = `${R}12`)}
                          onMouseLeave={e => (e.currentTarget.style.background = "none")}
                        >
                          <div>
                            <div className="b" style={{ fontSize: 14, color: "#fff", fontWeight: 400 }}>{a.nombre}</div>
                            <div className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                              {a.kcal} kcal · P: {a.proteina}g · L: {a.lipidos}g · C: {a.cho}g
                            </div>
                          </div>
                          <span className="bc" style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>por 100g</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cantidad en gramos */}
                {alimentoSel && (
                  <div style={{ animation: "slideIn 0.2s ease", marginBottom: 16 }}>
                    <label className="bc" style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: 8 }}>
                      Cantidad (gramos) <span style={{ color: R }}>*</span>
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                      <input type="number" value={gramos} min="1" max="2000"
                        onChange={e => setGramos(e.target.value)}
                        style={{ padding: "13px 16px", background: "rgba(255,255,255,0.04)", border: `1px solid ${R}`, color: "#fff", fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 22, fontWeight: 700, outline: "none" }}
                      />
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {[50, 100, 150, 200].map(g => (
                          <button key={g} onClick={() => setGramos(String(g))}
                            className="bc"
                            style={{ padding: "4px 12px", background: gramos === String(g) ? R : "rgba(255,255,255,0.06)", border: `1px solid ${gramos === String(g) ? R : "rgba(255,255,255,0.1)"}`, color: gramos === String(g) ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s ease" }}>
                            {g}g
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preview de macros */}
                    {macrosPreview && parseFloat(gramos) > 0 && (
                      <div style={{ marginTop: 12, padding: "14px 16px", background: `${R}08`, border: `1px solid ${R}25`, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, animation: "slideIn 0.2s ease" }}>
                        {[
                          { label: "Kcal", val: macrosPreview.kcal, unit: "" },
                          { label: "Proteína", val: macrosPreview.proteina, unit: "g" },
                          { label: "Lípidos", val: macrosPreview.lipidos, unit: "g" },
                          { label: "Carbs", val: macrosPreview.cho, unit: "g" },
                        ].map(m => (
                          <div key={m.label} style={{ textAlign: "center" }}>
                            <div className="bc" style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: R }}>{m.val}{m.unit}</div>
                            <div className="b" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Botón agregar */}
                <AgregarBtn onClick={agregarEntrada} disabled={!alimentoSel || !gramos} />

                {/* Entradas de la comida actual */}
                {diaData.entradas.filter(e => e.comida === comidaNum).length > 0 && (
                  <div style={{ marginTop: 28 }}>
                    <div className="bc" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 12 }}>
                      Comida {comidaNum} — {diaData.entradas.filter(e => e.comida === comidaNum).length} alimentos
                    </div>
                    {diaData.entradas.filter(e => e.comida === comidaNum).map(entrada => (
                      <EntradaRow key={entrada.id} entrada={entrada} onEliminar={() => eliminarEntrada(entrada.id)} isMobile={isMobile} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ════ VISTA: RESUMEN ════════════════════════════════ */}
        {vistaActiva === "resumen" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            {diaData.entradas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.3)" }}>
                <div className="bc" style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>◎</div>
                <p className="b" style={{ fontSize: 15, fontWeight: 300 }}>Aún no has registrado alimentos hoy.</p>
              </div>
            ) : (
              <>
                {[1,2,3,4,5,6].map(n => {
                  const entries = diaData.entradas.filter(e => e.comida === n)
                  if (entries.length === 0) return null
                  const subtotal = entries.reduce((acc, e) => ({
                    kcal: acc.kcal + e.kcal,
                    proteina: Math.round((acc.proteina + e.proteina) * 10) / 10,
                    lipidos: Math.round((acc.lipidos + e.lipidos) * 10) / 10,
                    cho: Math.round((acc.cho + e.cho) * 10) / 10,
                  }), { kcal: 0, proteina: 0, lipidos: 0, cho: 0 })

                  return (
                    <div key={n} style={{ marginBottom: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${R}30`, marginBottom: 8 }}>
                        <span className="bc" style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: R }}>
                          Comida {n}
                        </span>
                        <span className="bc" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                          {subtotal.kcal} kcal · P:{subtotal.proteina}g · L:{subtotal.lipidos}g · C:{subtotal.cho}g
                        </span>
                      </div>
                      {entries.map(entrada => (
                        <EntradaRow key={entrada.id} entrada={entrada} onEliminar={() => eliminarEntrada(entrada.id)} isMobile={isMobile} />
                      ))}
                    </div>
                  )
                })}

                {/* Botón cerrar día */}
                {!diaData.cerrado && (
                  <div style={{ marginTop: 32, padding: "24px", border: `1px solid ${R}25`, background: `${R}06` }}>
                    <p className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 16, fontWeight: 300 }}>
                      Al cerrar el día, el resumen completo de tus macros se envía automáticamente a Coach David para el seguimiento de tu plan.
                    </p>
                    <CerrarDiaBtn onClick={cerrarDia} enviando={enviando} cerrado={diaData.cerrado} />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 300,
            padding: "14px 20px", background: toast.tipo === "ok" ? "rgba(34,197,94,0.15)" : `${R}15`,
            border: `1px solid ${toast.tipo === "ok" ? "rgba(34,197,94,0.4)" : `${R}40`}`,
            display: "flex", gap: 10, alignItems: "center", minWidth: 260, maxWidth: "90vw",
            animation: "slideIn 0.3s ease", backdropFilter: "blur(8px)",
          }}>
            <span style={{ color: toast.tipo === "ok" ? "#22c55e" : R, fontWeight: 900, fontSize: 16 }}>
              {toast.tipo === "ok" ? "✓" : "!"}
            </span>
            <span className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{toast.msg}</span>
          </div>
        )}

      </div>
    </div>
  )
}

/* ── Sub-componentes ─────────────────────────────────────────── */
function TotalesBar({ totales, isMobile }: { totales: { kcal: number; proteina: number; lipidos: number; cho: number }; isMobile: boolean }) {
  const items = [
    { label: "Calorías", val: totales.kcal, unit: "kcal", color: "#fff" },
    { label: "Proteína", val: totales.proteina, unit: "g", color: "#22c55e" },
    { label: "Lípidos", val: totales.lipidos, unit: "g", color: "#eab308" },
    { label: "Carbos", val: totales.cho, unit: "g", color: "#3b82f6" },
  ]
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2, marginBottom: 28 }}>
      {items.map(item => (
        <div key={item.label} style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", padding: isMobile ? "14px 10px" : "18px 20px", textAlign: "center" }}>
          <div className="bc" style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: item.color, lineHeight: 1 }}>
            {item.val}<span style={{ fontSize: isMobile ? 12 : 14 }}>{item.unit}</span>
          </div>
          <div className="b" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{item.label}</div>
        </div>
      ))}
    </div>
  )
}

function EntradaRow({ entrada, onEliminar, isMobile }: { entrada: EntradaComida; onEliminar: () => void; isMobile: boolean }) {
  return (
    <div className="entrada-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s ease" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {entrada.nombreAlimento}
        </div>
        <div className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
          {entrada.gramos}g · {entrada.hora} · {entrada.kcal} kcal
        </div>
      </div>
      {!isMobile && (
        <div style={{ display: "flex", gap: 16, marginRight: 16 }}>
          <MacroChip label="P" val={entrada.proteina} color="#22c55e" />
          <MacroChip label="L" val={entrada.lipidos} color="#eab308" />
          <MacroChip label="C" val={entrada.cho} color="#3b82f6" />
        </div>
      )}
      <button onClick={onEliminar} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", padding: "4px 8px", fontSize: 16, transition: "color 0.15s ease" }}
        onMouseEnter={e => (e.currentTarget.style.color = R)}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
      >✕</button>
    </div>
  )
}

function MacroChip({ label, val, color }: { label: string; val: number; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="bc" style={{ fontSize: 14, fontWeight: 800, color }}>{val}g</div>
      <div className="b" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>{label}</div>
    </div>
  )
}

function AgregarBtn({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ width: "100%", padding: "16px", border: "none", background: disabled ? "rgba(232,0,13,0.3)" : hover ? "#fff" : R, color: disabled ? "rgba(255,255,255,0.4)" : hover ? "#000" : "#fff", fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 15, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", cursor: disabled ? "not-allowed" : "pointer", clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))", boxShadow: disabled || hover ? "none" : `0 0 30px ${R}30`, transition: "all 0.2s ease" }}>
      + Agregar a Comida
    </button>
  )
}

function CerrarDiaBtn({ onClick, enviando, cerrado }: { onClick: () => void; enviando: boolean; cerrado: boolean }) {
  const [hover, setHover] = useState(false)
  if (cerrado) return (
    <div style={{ textAlign: "center", padding: "14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
      <span className="bc" style={{ fontSize: 14, color: "#22c55e", letterSpacing: "0.2em", textTransform: "uppercase" }}>✓ Resumen enviado a Coach David</span>
    </div>
  )
  return (
    <button onClick={onClick} disabled={enviando}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ width: "100%", padding: "16px", border: "none", background: enviando ? "rgba(34,197,94,0.3)" : hover ? "#fff" : "#22c55e", color: hover && !enviando ? "#000" : "#fff", fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 15, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", cursor: enviando ? "not-allowed" : "pointer", transition: "all 0.2s ease" }}>
      {enviando ? "Enviando resumen..." : "Cerrar día y enviar a Coach David ✓"}
    </button>
  )
}

function AccesoDenegado() {
  return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: 32, fontFamily: "'Barlow', sans-serif", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=Barlow:wght@300&display=swap'); * { box-sizing:border-box; margin:0; padding:0; }`}</style>
      <div style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 60, fontWeight: 900, color: "#E8000D", marginBottom: 16 }}>🔒</div>
      <h1 style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 36, fontWeight: 900, textTransform: "uppercase", marginBottom: 12 }}>Acceso restringido</h1>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", maxWidth: 380, lineHeight: 1.7, fontWeight: 300 }}>
        Esta herramienta es exclusiva para clientes de Coach David con un plan de alimentación activo. Contacta a tu coach para obtener acceso.
      </p>
      <a href="https://wa.me/573243747367" target="_blank" rel="noopener noreferrer"
        style={{ marginTop: 32, padding: "14px 32px", background: "#22c55e", color: "#fff", fontFamily: "'Barlow Condensed', Impact, sans-serif", fontSize: 14, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none" }}>
        Contactar por WhatsApp
      </a>
    </div>
  )
}

function Loading() {
  return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Barlow', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid #E8000D", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Verificando acceso...</p>
      </div>
    </div>
  )
}
