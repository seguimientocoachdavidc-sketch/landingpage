"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { ALIMENTOS } from "@/lib/alimentos"
import { supabase } from "@/lib/supabase"

const R = "#E8000D"
const G = "#22c55e"
const B = "#3b82f6"
const O = "#f59e0b"
const P = "#818cf8"
const WA = "#25D366"

/* ── Tipos ───────────────────────────────────────────────────── */
interface EntradaComida {
  id: string; alimentoId: number; nombreAlimento: string
  gramos: number; kcal: number; proteina: number
  lipidos: number; cho: number; comida: number; hora: string
}
interface DiaData {
  fecha: string; nombre: string
  entradas: EntradaComida[]; cerrado: boolean
}
interface Seguimiento {
  id?: string; cliente_token: string; fecha: string
  peso_kg: number | null; cintura_cm: number | null
  cadera_cm: number | null; pecho_cm: number | null
  brazo_cm: number | null; muslo_cm: number | null
  nota: string | null
}

/* ── Hook responsive ─────────────────────────────────────────── */
function useBreakpoint() {
  const [w, setW] = useState(1200)
  useEffect(() => {
    const check = () => setW(window.innerWidth)
    check(); window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return { isMobile: w < 768 }
}

/* ── Helpers ─────────────────────────────────────────────────── */
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
function horaActual() {
  return new Date().toLocaleTimeString("en-GB", {
    timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit",
  })
}
function formatFecha(iso: string) {
  if (!iso) return ""
  const [y, m, d] = iso.split("-")
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${d} de ${meses[parseInt(m)-1]} de ${y}`
}
function formatFechaCorta(iso: string) {
  if (!iso) return ""
  const [, m, d] = iso.split("-")
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${d} ${meses[parseInt(m)-1]}`
}
function getStorageKey(token: string, fecha: string) {
  return `macros_v2_${token}_${fecha}`
}
function listarDiasGuardados(token: string): string[] {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(`macros_v2_${token}_`)) {
      keys.push(key.replace(`macros_v2_${token}_`, ""))
    }
  }
  return keys.sort().reverse()
}

/* ══ PÁGINA PRINCIPAL ════════════════════════════════════════════ */
export default function MacrosPage() {
  const { isMobile } = useBreakpoint()
  const [token, setToken]                 = useState<string|null>(null)
  const [nombreUsuario, setNombreUsuario] = useState("")
  const [accesoDenegado, setAccesoDenegado] = useState(false)

  // Navegación principal
  const [vistaGlobal, setVistaGlobal] = useState<"inicio"|"macros"|"seguimiento">("inicio")

  // Macros
  const [fechaSel, setFechaSel]     = useState("")
  const [diasGuardados, setDiasGuardados] = useState<string[]>([])
  const [diaData, setDiaData]       = useState<DiaData|null>(null)
  const [busqueda, setBusqueda]     = useState("")
  const [resultados, setResultados] = useState<typeof ALIMENTOS[number][]>([])
  const [alimentoSel, setAlimentoSel] = useState<typeof ALIMENTOS[number]|null>(null)
  const [gramos, setGramos]         = useState("100")
  const [comidaNum, setComidaNum]   = useState(1)
  const [enviando, setEnviando]     = useState(false)
  const [vistaTab, setVistaTab]     = useState<"agregar"|"resumen">("agregar")
  const busquedaRef = useRef<HTMLInputElement>(null)

  // Seguimiento medidas
  const [seguimientos, setSeguimientos]   = useState<Seguimiento[]>([])
  const [cargandoSegs, setCargandoSegs]   = useState(false)
  const [formSeg, setFormSeg]             = useState<Partial<Seguimiento>>({})
  const [fechaSeg, setFechaSeg]           = useState("")
  const [guardandoSeg, setGuardandoSeg]   = useState(false)
  const [segEditando, setSegEditando]     = useState<string|null>(null)

  const [toast, setToast] = useState<{tipo:"ok"|"err"; msg:string}|null>(null)
  const showToast = (tipo:"ok"|"err", msg:string) => {
    setToast({tipo,msg}); setTimeout(()=>setToast(null),4000)
  }

  /* ── Auth ── */
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token")
    if (!t) { setAccesoDenegado(true); return }
    fetch(`/api/macros/verificar?token=${t}`)
      .then(r=>r.json())
      .then(data => {
        if (data.valido) {
          setToken(t); setNombreUsuario(data.nombre||"")
          setDiasGuardados(listarDiasGuardados(t))
        } else setAccesoDenegado(true)
      })
      .catch(()=>setAccesoDenegado(true))
  }, [])

  /* ── Cargar seguimientos ── */
  const cargarSeguimientos = useCallback(async (tok: string) => {
    setCargandoSegs(true)
    const { data } = await supabase
      .from("seguimientos_medidas")
      .select("*")
      .eq("cliente_token", tok)
      .order("fecha", { ascending: false })
      .limit(20)
    if (data) setSeguimientos(data)
    setCargandoSegs(false)
  }, [])

  useEffect(() => {
    if (token && vistaGlobal==="seguimiento") cargarSeguimientos(token)
  }, [token, vistaGlobal, cargarSeguimientos])

  /* ── Macros: abrir día ── */
  const abrirDia = (tok: string, fecha: string, nombre: string) => {
    const key = getStorageKey(tok, fecha)
    const guardado = localStorage.getItem(key)
    let data: DiaData
    if (guardado) data = JSON.parse(guardado)
    else {
      data = { fecha, nombre, entradas:[], cerrado:false }
      localStorage.setItem(key, JSON.stringify(data))
    }
    setDiaData(data); setVistaGlobal("macros")
    setVistaTab("agregar"); setDiasGuardados(listarDiasGuardados(tok))
  }

  const guardarLocal = (data: DiaData) => {
    if (!token) return
    localStorage.setItem(getStorageKey(token, data.fecha), JSON.stringify(data))
  }

  /* ── Búsqueda alimentos ── */
  useEffect(() => {
    if (busqueda.trim().length < 2) { setResultados([]); return }
    const q = busqueda.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    setResultados(
      ALIMENTOS.filter(a =>
        a.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").includes(q)
      ).slice(0,8)
    )
  }, [busqueda])

  /* ── Agregar entrada ── */
  const agregarEntrada = () => {
    if (!alimentoSel||!diaData||!token) return
    const g = parseFloat(gramos)
    if (isNaN(g)||g<=0) { showToast("err","Ingresa un peso válido."); return }
    const macros = calcular(alimentoSel.id, g)
    const entrada: EntradaComida = {
      id:`${Date.now()}`, alimentoId:alimentoSel.id,
      nombreAlimento:alimentoSel.nombre, gramos:g,
      comida:comidaNum, hora:horaActual(), ...macros,
    }
    const nuevaData = { ...diaData, entradas:[...diaData.entradas, entrada] }
    setDiaData(nuevaData); guardarLocal(nuevaData)
    setBusqueda(""); setAlimentoSel(null); setGramos("100"); setResultados([])
    showToast("ok",`${alimentoSel.nombre} agregado a Comida ${comidaNum}`)
    busquedaRef.current?.focus()
  }

  const eliminarEntrada = (id: string) => {
    if (!diaData) return
    const nuevaData = { ...diaData, entradas:diaData.entradas.filter(e=>e.id!==id) }
    setDiaData(nuevaData); guardarLocal(nuevaData)
  }

  const totales = diaData?.entradas.reduce((acc,e) => ({
    kcal:     acc.kcal+e.kcal,
    proteina: Math.round((acc.proteina+e.proteina)*10)/10,
    lipidos:  Math.round((acc.lipidos+e.lipidos)*10)/10,
    cho:      Math.round((acc.cho+e.cho)*10)/10,
  }), {kcal:0,proteina:0,lipidos:0,cho:0}) ?? {kcal:0,proteina:0,lipidos:0,cho:0}

  const cerrarDia = async () => {
    if (!diaData||!token||enviando) return
    setEnviando(true)
    try {
      const res = await fetch("/api/macros/cerrar-dia", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({token, diaData, totales}),
      })
      if (res.ok) {
        const nuevaData = { ...diaData, cerrado:true }
        setDiaData(nuevaData); guardarLocal(nuevaData)
        showToast("ok","✓ Resumen enviado a Coach David")
      } else showToast("err","Error al enviar. Intenta de nuevo.")
    } catch { showToast("err","Sin conexión. Intenta de nuevo.") }
    setEnviando(false)
  }

  /* ── Guardar seguimiento ── */
  const guardarSeguimiento = async () => {
    if (!token||!fechaSeg) { showToast("err","Selecciona la fecha del registro."); return }
    const tieneDato = Object.entries(formSeg).some(([k,v]) =>
      k !== "nota" && v !== null && v !== undefined && v !== ""
    )
    if (!tieneDato) { showToast("err","Ingresa al menos una medida."); return }

    setGuardandoSeg(true)
    const payload: any = {
      cliente_token: token,
      fecha: fechaSeg,
      peso_kg:    formSeg.peso_kg    ? parseFloat(String(formSeg.peso_kg))   : null,
      cintura_cm: formSeg.cintura_cm ? parseFloat(String(formSeg.cintura_cm)): null,
      cadera_cm:  formSeg.cadera_cm  ? parseFloat(String(formSeg.cadera_cm)) : null,
      pecho_cm:   formSeg.pecho_cm   ? parseFloat(String(formSeg.pecho_cm))  : null,
      brazo_cm:   formSeg.brazo_cm   ? parseFloat(String(formSeg.brazo_cm))  : null,
      muslo_cm:   formSeg.muslo_cm   ? parseFloat(String(formSeg.muslo_cm))  : null,
      nota:       formSeg.nota || null,
    }

    let error
    if (segEditando) {
      ;({ error } = await supabase.from("seguimientos_medidas")
        .update(payload).eq("id", segEditando))
    } else {
      ;({ error } = await supabase.from("seguimientos_medidas")
        .upsert(payload, { onConflict:"cliente_token,fecha" }))
    }

    setGuardandoSeg(false)
    if (error) { showToast("err","Error al guardar. Intenta de nuevo."); return }
    showToast("ok","✓ Medidas guardadas")
    setFormSeg({}); setFechaSeg(""); setSegEditando(null)
    cargarSeguimientos(token)
  }

  const editarSeguimiento = (seg: Seguimiento) => {
    setSegEditando(seg.id||null)
    setFechaSeg(seg.fecha)
    setFormSeg({
      peso_kg:    seg.peso_kg,    cintura_cm: seg.cintura_cm,
      cadera_cm:  seg.cadera_cm,  pecho_cm:   seg.pecho_cm,
      brazo_cm:   seg.brazo_cm,   muslo_cm:   seg.muslo_cm,
      nota:       seg.nota,
    })
    window.scrollTo({top:0, behavior:"smooth"})
  }

  const macrosPreview = alimentoSel ? calcular(alimentoSel.id, parseFloat(gramos)||0) : null

  if (accesoDenegado) return <AccesoDenegado/>
  if (!token) return <Loading/>

  /* ══ PANTALLA INICIO ═════════════════════════════════════════ */
  if (vistaGlobal==="inicio") return (
    <Pantalla>
      <div style={{marginBottom:48}}>
        <div className="bc" style={{fontSize:11,color:R,letterSpacing:"0.4em",
          textTransform:"uppercase",marginBottom:8}}>Tu programa</div>
        <h1 className="bc" style={{fontSize:36,fontWeight:900,
          textTransform:"uppercase",lineHeight:1,marginBottom:6}}>
          Hola, <span style={{color:R}}>{nombreUsuario.split(" ")[0]}</span>
        </h1>
        <p className="b" style={{fontSize:14,color:"rgba(255,255,255,0.4)",
          fontWeight:300}}>¿Qué quieres hacer hoy?</p>
      </div>

      {/* Módulos */}
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:32}}>

        {/* Macros */}
        <button onClick={()=>setVistaGlobal("macros")}
          style={{padding:"20px",background:"rgba(232,0,13,0.06)",
            border:`1px solid ${R}30`,cursor:"pointer",textAlign:"left",
            transition:"all 0.2s"}}
          onMouseEnter={e=>(e.currentTarget.style.background=`rgba(232,0,13,0.1)`)}
          onMouseLeave={e=>(e.currentTarget.style.background=`rgba(232,0,13,0.06)`)}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:28}}>🍽️</span>
            <div style={{flex:1}}>
              <div className="bc" style={{fontSize:18,fontWeight:900,
                textTransform:"uppercase",color:"#fff",marginBottom:3}}>
                Registro de Macros
              </div>
              <div className="b" style={{fontSize:13,color:"rgba(255,255,255,0.45)"}}>
                Registra tus comidas del día y lleva el control de tus macros
              </div>
            </div>
            <span style={{color:R,fontSize:20}}>→</span>
          </div>
        </button>

        {/* Seguimiento */}
        <button onClick={()=>setVistaGlobal("seguimiento")}
          style={{padding:"20px",background:"rgba(59,130,246,0.06)",
            border:`1px solid ${B}30`,cursor:"pointer",textAlign:"left",
            transition:"all 0.2s"}}
          onMouseEnter={e=>(e.currentTarget.style.background=`rgba(59,130,246,0.1)`)}
          onMouseLeave={e=>(e.currentTarget.style.background=`rgba(59,130,246,0.06)`)}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:28}}>📊</span>
            <div style={{flex:1}}>
              <div className="bc" style={{fontSize:18,fontWeight:900,
                textTransform:"uppercase",color:"#fff",marginBottom:3}}>
                Seguimiento de Medidas
              </div>
              <div className="b" style={{fontSize:13,color:"rgba(255,255,255,0.45)"}}>
                Registra tu peso y medidas semanales · Ve tu progreso en gráficas
              </div>
            </div>
            <span style={{color:B,fontSize:20}}>→</span>
          </div>
        </button>

        {/* WhatsApp Coach */}
        <a href="https://wa.me/573243747367"
          target="_blank" rel="noopener noreferrer"
          style={{padding:"20px",background:"rgba(37,211,102,0.06)",
            border:`1px solid ${WA}30`,textDecoration:"none",
            display:"block",transition:"all 0.2s"}}
          onMouseEnter={e=>(e.currentTarget.style.background=`rgba(37,211,102,0.1)`)}
          onMouseLeave={e=>(e.currentTarget.style.background=`rgba(37,211,102,0.06)`)}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:28}}>💬</span>
            <div style={{flex:1}}>
              <div className="bc" style={{fontSize:18,fontWeight:900,
                textTransform:"uppercase",color:"#fff",marginBottom:3}}>
                Hablar con Coach David
              </div>
              <div className="b" style={{fontSize:13,color:"rgba(255,255,255,0.45)"}}>
                Dudas, ajustes al plan o consultas · Respuesta en menos de 24h
              </div>
            </div>
            <span style={{color:WA,fontSize:20}}>↗</span>
          </div>
        </a>
      </div>

      {/* Días recientes */}
      {diasGuardados.length > 0 && (
        <div>
          <div className="bc" style={{fontSize:11,color:"rgba(255,255,255,0.3)",
            letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:10}}>
            Últimos registros de macros
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {diasGuardados.slice(0,3).map(fecha => {
              const raw = localStorage.getItem(getStorageKey(token,fecha))
              const data = raw ? JSON.parse(raw) as DiaData : null
              return (
                <button key={fecha}
                  onClick={()=>abrirDia(token,fecha,nombreUsuario)}
                  style={{display:"flex",alignItems:"center",
                    justifyContent:"space-between",padding:"12px 14px",
                    background:"rgba(255,255,255,0.02)",
                    border:"1px solid rgba(255,255,255,0.07)",
                    cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}
                  onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(232,0,13,0.3)")}
                  onMouseLeave={e=>(e.currentTarget.style.borderColor="rgba(255,255,255,0.07)")}>
                  <div>
                    <div className="bc" style={{fontSize:14,fontWeight:700,
                      color:"#fff",textTransform:"uppercase",marginBottom:2}}>
                      {formatFecha(fecha)}
                    </div>
                    <div className="b" style={{fontSize:12,color:"rgba(255,255,255,0.35)"}}>
                      {data?.entradas.length??0} alimentos ·{" "}
                      {data?.cerrado
                        ? <span style={{color:G}}>✓ Cerrado</span>
                        : <span style={{color:R}}>En progreso</span>}
                    </div>
                  </div>
                  <span style={{color:"rgba(255,255,255,0.2)",fontSize:16}}>→</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
      {toast && <Toast toast={toast}/>}
    </Pantalla>
  )

  /* ══ PANTALLA MACROS ═════════════════════════════════════════ */
  if (vistaGlobal==="macros") return (
    <div style={{background:"#000",color:"#fff",fontFamily:"'Barlow',sans-serif",
      minHeight:"100vh",overflowX:"hidden"}}>
      <Estilos/>

      <div style={{position:"fixed",top:0,left:0,right:0,height:2,background:R,zIndex:200}}/>

      {/* Header macros */}
      <header style={{position:"fixed",top:2,left:0,right:0,zIndex:100,
        background:"rgba(0,0,0,0.95)",backdropFilter:"blur(12px)",
        borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:960,margin:"0 auto",
          padding:isMobile?"0 16px":"0 32px",height:54,
          display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>{ setDiaData(null); setVistaGlobal("inicio") }}
              style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",
                cursor:"pointer",fontSize:18,padding:"4px 8px"}}
              onMouseEnter={e=>(e.currentTarget.style.color="#fff")}
              onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.4)")}>
              ←
            </button>
            <span className="bc" style={{fontSize:16,fontWeight:900}}>
              COACH<span style={{color:R}}>.</span>DAVID
            </span>
            <span style={{width:1,height:14,background:"rgba(255,255,255,0.15)"}}/>
            <span className="bc" style={{fontSize:12,color:"rgba(255,255,255,0.4)",
              letterSpacing:"0.2em",textTransform:"uppercase"}}>Macros</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:6,height:6,
              background:diaData?.cerrado?G:R,
              borderRadius:"50%",animation:"blink 2s ease infinite"}}/>
            {!isMobile && <span className="b" style={{fontSize:12,
              color:"rgba(255,255,255,0.4)"}}>{nombreUsuario}</span>}
          </div>
        </div>
      </header>

      {/* Selector fecha si no hay día abierto */}
      {!diaData ? (
        <div style={{maxWidth:560,margin:"0 auto",padding:"80px 20px 40px"}}>
          <div className="bc" style={{fontSize:11,color:R,letterSpacing:"0.3em",
            textTransform:"uppercase",marginBottom:10}}>Registro de macros</div>
          <h2 className="bc" style={{fontSize:28,fontWeight:900,
            textTransform:"uppercase",marginBottom:20}}>
            ¿Qué día registras?
          </h2>
          <input type="date" value={fechaSel}
            onChange={e=>setFechaSel(e.target.value)}
            max={new Date().toLocaleDateString("en-CA",{timeZone:"America/Bogota"})}
            style={{width:"100%",padding:"14px 16px",
              background:"rgba(255,255,255,0.04)",
              border:`1px solid ${fechaSel?R:"rgba(255,255,255,0.12)"}`,
              color:"#fff",fontFamily:"'Barlow',sans-serif",
              fontSize:16,outline:"none",colorScheme:"dark",marginBottom:14}}/>
          <button disabled={!fechaSel}
            onClick={()=>abrirDia(token,fechaSel,nombreUsuario)}
            style={{width:"100%",padding:"15px",
              background:fechaSel?R:"rgba(232,0,13,0.25)",
              border:"none",color:fechaSel?"#fff":"rgba(255,255,255,0.3)",
              fontFamily:"'Barlow Condensed',Impact,sans-serif",
              fontSize:15,fontWeight:900,letterSpacing:"0.2em",
              textTransform:"uppercase",
              cursor:fechaSel?"pointer":"not-allowed",marginBottom:28}}>
            {fechaSel?`Abrir ${formatFecha(fechaSel)} →`:"Selecciona una fecha"}
          </button>
          {diasGuardados.length>0 && (
            <div>
              <div className="bc" style={{fontSize:11,color:"rgba(255,255,255,0.3)",
                letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:10}}>
                Días anteriores
              </div>
              {diasGuardados.map(fecha=>{
                const raw = localStorage.getItem(getStorageKey(token,fecha))
                const data = raw ? JSON.parse(raw) as DiaData : null
                return (
                  <button key={fecha}
                    onClick={()=>abrirDia(token,fecha,nombreUsuario)}
                    style={{display:"flex",alignItems:"center",
                      justifyContent:"space-between",width:"100%",
                      padding:"12px 14px",marginBottom:6,
                      background:"rgba(255,255,255,0.02)",
                      border:"1px solid rgba(255,255,255,0.07)",
                      cursor:"pointer",textAlign:"left"}}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(232,0,13,0.3)")}
                    onMouseLeave={e=>(e.currentTarget.style.borderColor="rgba(255,255,255,0.07)")}>
                    <div>
                      <div className="bc" style={{fontSize:14,fontWeight:700,
                        color:"#fff",textTransform:"uppercase",marginBottom:2}}>
                        {formatFecha(fecha)}
                      </div>
                      <div className="b" style={{fontSize:12,color:"rgba(255,255,255,0.35)"}}>
                        {data?.entradas.length??0} alimentos ·{" "}
                        {data?.cerrado
                          ?<span style={{color:G}}>✓ Cerrado</span>
                          :<span style={{color:R}}>En progreso</span>}
                      </div>
                    </div>
                    <span style={{color:"rgba(255,255,255,0.2)"}}>→</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── Día abierto ── */
        <>
          {/* Tabs */}
          <div style={{position:"fixed",top:56,left:0,right:0,zIndex:99,
            background:"rgba(0,0,0,0.92)",backdropFilter:"blur(8px)",
            borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            <div style={{maxWidth:960,margin:"0 auto",padding:"0 16px",display:"flex"}}>
              {[{k:"agregar",l:"Registrar comida"},
                {k:"resumen",l:`Resumen (${diaData.entradas.length})`}
              ].map(tab=>(
                <button key={tab.k} onClick={()=>setVistaTab(tab.k as any)}
                  className="bc"
                  style={{padding:"12px 20px",fontSize:13,fontWeight:700,
                    letterSpacing:"0.15em",textTransform:"uppercase",
                    background:"none",border:"none",cursor:"pointer",
                    color:vistaTab===tab.k?"#fff":"rgba(255,255,255,0.35)",
                    borderBottom:`2px solid ${vistaTab===tab.k?R:"transparent"}`,
                    transition:"all 0.2s",whiteSpace:"nowrap"}}>
                  {tab.l}
                </button>
              ))}
            </div>
          </div>

          <div style={{maxWidth:960,margin:"0 auto",
            padding:isMobile?"108px 16px 80px":"108px 32px 80px"}}>

            {/* Fecha + estado */}
            <div style={{marginBottom:24,display:"flex",alignItems:"flex-start",
              justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
              <div>
                <div className="bc" style={{fontSize:11,color:R,
                  letterSpacing:"0.4em",textTransform:"uppercase",marginBottom:6}}>
                  {formatFecha(diaData.fecha)}
                </div>
                <div className="bc" style={{fontSize:isMobile?26:34,fontWeight:900,
                  textTransform:"uppercase",lineHeight:1}}>
                  Hola, <span style={{color:R}}>{nombreUsuario.split(" ")[0]}</span>
                </div>
              </div>
              {diaData.cerrado && (
                <div style={{padding:"8px 14px",
                  background:"rgba(34,197,94,0.1)",
                  border:"1px solid rgba(34,197,94,0.3)",
                  display:"flex",alignItems:"center",gap:8}}>
                  <span style={{color:G,fontSize:14}}>✓</span>
                  <span className="bc" style={{fontSize:12,color:G,
                    letterSpacing:"0.2em",textTransform:"uppercase"}}>Día cerrado</span>
                </div>
              )}
            </div>

            <TotalesBar totales={totales} isMobile={isMobile}/>

            {/* Vista agregar */}
            {vistaTab==="agregar" && (
              <div style={{animation:"fadeUp 0.3s ease"}}>
                {diaData.cerrado ? (
                  <div style={{padding:"32px 24px",
                    border:"1px solid rgba(34,197,94,0.2)",
                    background:"rgba(34,197,94,0.04)",textAlign:"center"}}>
                    <div style={{fontSize:36,marginBottom:12}}>✓</div>
                    <div className="bc" style={{fontSize:22,fontWeight:900,
                      textTransform:"uppercase",color:G,marginBottom:8}}>
                      Día cerrado correctamente
                    </div>
                    <p className="b" style={{fontSize:14,
                      color:"rgba(255,255,255,0.45)",marginBottom:24,
                      lineHeight:1.6,fontWeight:300}}>
                      El resumen fue enviado a Coach David.
                    </p>
                    <button onClick={()=>{setDiaData(null);setFechaSel("")}}
                      style={{padding:"14px 28px",background:R,border:"none",
                        color:"#fff",fontFamily:"'Barlow Condensed',Impact,sans-serif",
                        fontSize:14,fontWeight:900,letterSpacing:"0.2em",
                        textTransform:"uppercase",cursor:"pointer"}}>
                      Registrar otro día →
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Selector comida */}
                    <div style={{marginBottom:20}}>
                      <label className="bc" style={{display:"block",fontSize:11,
                        fontWeight:700,letterSpacing:"0.25em",textTransform:"uppercase",
                        color:"rgba(255,255,255,0.38)",marginBottom:10}}>
                        ¿A qué comida pertenece? <span style={{color:R}}>*</span>
                      </label>
                      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                        {[1,2,3,4,5,6].map(n=>(
                          <button key={n} onClick={()=>setComidaNum(n)}
                            className="bc"
                            style={{padding:"10px 18px",
                              border:`1px solid ${comidaNum===n?R:"rgba(255,255,255,0.1)"}`,
                              background:comidaNum===n?`${R}18`:"transparent",
                              color:comidaNum===n?"#fff":"rgba(255,255,255,0.4)",
                              fontSize:14,fontWeight:700,letterSpacing:"0.1em",
                              cursor:"pointer",transition:"all 0.2s"}}>
                            Comida {n}
                            {(diaData.entradas.filter(e=>e.comida===n).length)>0 && (
                              <span style={{marginLeft:6,fontSize:11,
                                color:comidaNum===n?R:"rgba(255,255,255,0.3)"}}>
                                ({diaData.entradas.filter(e=>e.comida===n).length})
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Buscador */}
                    <div style={{marginBottom:16,position:"relative"}}>
                      <label className="bc" style={{display:"block",fontSize:11,
                        fontWeight:700,letterSpacing:"0.25em",textTransform:"uppercase",
                        color:"rgba(255,255,255,0.38)",marginBottom:8}}>
                        Buscar alimento <span style={{color:R}}>*</span>
                      </label>
                      <input ref={busquedaRef} type="text" value={busqueda}
                        placeholder="Escribe el nombre del alimento..."
                        onChange={e=>{setBusqueda(e.target.value);setAlimentoSel(null)}}
                        style={{width:"100%",padding:"13px 16px",
                          background:"rgba(255,255,255,0.04)",
                          border:`1px solid ${alimentoSel?R:"rgba(255,255,255,0.12)"}`,
                          color:"#fff",fontFamily:"'Barlow',sans-serif",
                          fontSize:15,outline:"none"}}
                        onFocus={e=>(e.target.style.borderColor=R)}
                        onBlur={e=>{if(!alimentoSel)e.target.style.borderColor="rgba(255,255,255,0.12)"}}
                      />
                      {resultados.length>0&&!alimentoSel&&(
                        <div style={{position:"absolute",top:"100%",left:0,right:0,
                          zIndex:50,background:"#111",
                          border:`1px solid ${R}40`,borderTop:"none",
                          maxHeight:280,overflowY:"auto",
                          animation:"slideIn 0.15s ease"}}>
                          {resultados.map(a=>(
                            <button key={a.id}
                              onClick={()=>{setAlimentoSel(a);setBusqueda(a.nombre);setResultados([])}}
                              style={{display:"flex",alignItems:"center",
                                justifyContent:"space-between",width:"100%",
                                padding:"11px 16px",background:"none",border:"none",
                                borderBottom:"1px solid rgba(255,255,255,0.05)",
                                cursor:"pointer",textAlign:"left"}}
                              onMouseEnter={e=>(e.currentTarget.style.background=`${R}12`)}
                              onMouseLeave={e=>(e.currentTarget.style.background="none")}>
                              <div>
                                <div className="b" style={{fontSize:14,color:"#fff",fontWeight:400}}>
                                  {a.nombre}
                                </div>
                                <div className="b" style={{fontSize:11,
                                  color:"rgba(255,255,255,0.35)",marginTop:2}}>
                                  {a.kcal} kcal · P:{a.proteina}g · L:{a.lipidos}g · C:{a.cho}g
                                </div>
                              </div>
                              <span className="bc" style={{fontSize:11,
                                color:"rgba(255,255,255,0.25)",letterSpacing:"0.1em"}}>
                                por 100g
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Gramos */}
                    {alimentoSel&&(
                      <div style={{animation:"slideIn 0.2s ease",marginBottom:16}}>
                        <label className="bc" style={{display:"block",fontSize:11,
                          fontWeight:700,letterSpacing:"0.25em",textTransform:"uppercase",
                          color:"rgba(255,255,255,0.38)",marginBottom:8}}>
                          Cantidad (gramos) <span style={{color:R}}>*</span>
                        </label>
                        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8}}>
                          <input type="number" value={gramos} min="1" max="2000"
                            onChange={e=>setGramos(e.target.value)}
                            style={{padding:"13px 16px",
                              background:"rgba(255,255,255,0.04)",
                              border:`1px solid ${R}`,color:"#fff",
                              fontFamily:"'Barlow Condensed',Impact,sans-serif",
                              fontSize:22,fontWeight:700,outline:"none"}}/>
                          <div style={{display:"flex",flexDirection:"column",gap:4}}>
                            {[50,100,150,200].map(g=>(
                              <button key={g} onClick={()=>setGramos(String(g))}
                                className="bc"
                                style={{padding:"4px 12px",
                                  background:gramos===String(g)?R:"rgba(255,255,255,0.06)",
                                  border:`1px solid ${gramos===String(g)?R:"rgba(255,255,255,0.1)"}`,
                                  color:gramos===String(g)?"#fff":"rgba(255,255,255,0.4)",
                                  fontSize:12,fontWeight:700,cursor:"pointer"}}>
                                {g}g
                              </button>
                            ))}
                          </div>
                        </div>
                        {macrosPreview&&parseFloat(gramos)>0&&(
                          <div style={{marginTop:12,padding:"14px 16px",
                            background:`${R}08`,border:`1px solid ${R}25`,
                            display:"grid",gridTemplateColumns:"repeat(4,1fr)",
                            gap:8,animation:"slideIn 0.2s ease"}}>
                            {[
                              {label:"Kcal",val:macrosPreview.kcal,unit:""},
                              {label:"Proteína",val:macrosPreview.proteina,unit:"g"},
                              {label:"Lípidos",val:macrosPreview.lipidos,unit:"g"},
                              {label:"Carbs",val:macrosPreview.cho,unit:"g"},
                            ].map(m=>(
                              <div key={m.label} style={{textAlign:"center"}}>
                                <div className="bc" style={{fontSize:isMobile?20:24,
                                  fontWeight:900,color:R}}>{m.val}{m.unit}</div>
                                <div className="b" style={{fontSize:10,
                                  color:"rgba(255,255,255,0.3)",textTransform:"uppercase",
                                  letterSpacing:"0.1em",marginTop:2}}>{m.label}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <AgregarBtn onClick={agregarEntrada} disabled={!alimentoSel||!gramos}/>

                    {diaData.entradas.filter(e=>e.comida===comidaNum).length>0&&(
                      <div style={{marginTop:28}}>
                        <div className="bc" style={{fontSize:11,
                          color:"rgba(255,255,255,0.3)",letterSpacing:"0.3em",
                          textTransform:"uppercase",marginBottom:12}}>
                          Comida {comidaNum} — {diaData.entradas.filter(e=>e.comida===comidaNum).length} alimentos
                        </div>
                        {diaData.entradas.filter(e=>e.comida===comidaNum).map(entrada=>(
                          <EntradaRow key={entrada.id} entrada={entrada}
                            onEliminar={()=>eliminarEntrada(entrada.id)}
                            isMobile={isMobile}/>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Vista resumen */}
            {vistaTab==="resumen"&&(
              <div style={{animation:"fadeUp 0.3s ease"}}>
                {diaData.entradas.length===0?(
                  <div style={{textAlign:"center",padding:"60px 20px",
                    color:"rgba(255,255,255,0.3)"}}>
                    <div className="bc" style={{fontSize:48,marginBottom:12,opacity:0.3}}>◎</div>
                    <p className="b" style={{fontSize:15,fontWeight:300}}>
                      Aún no has registrado alimentos.
                    </p>
                  </div>
                ):(
                  <>
                    {[1,2,3,4,5,6].map(n=>{
                      const entries=diaData.entradas.filter(e=>e.comida===n)
                      if(entries.length===0) return null
                      const sub=entries.reduce((acc,e)=>({
                        kcal:acc.kcal+e.kcal,
                        proteina:Math.round((acc.proteina+e.proteina)*10)/10,
                        lipidos:Math.round((acc.lipidos+e.lipidos)*10)/10,
                        cho:Math.round((acc.cho+e.cho)*10)/10,
                      }),{kcal:0,proteina:0,lipidos:0,cho:0})
                      return (
                        <div key={n} style={{marginBottom:24}}>
                          <div style={{display:"flex",alignItems:"center",
                            justifyContent:"space-between",padding:"10px 0",
                            borderBottom:`1px solid ${R}30`,marginBottom:8}}>
                            <span className="bc" style={{fontSize:14,fontWeight:800,
                              textTransform:"uppercase",letterSpacing:"0.15em",color:R}}>
                              Comida {n}
                            </span>
                            <span className="bc" style={{fontSize:13,
                              color:"rgba(255,255,255,0.4)"}}>
                              {sub.kcal} kcal · P:{sub.proteina}g · L:{sub.lipidos}g · C:{sub.cho}g
                            </span>
                          </div>
                          {entries.map(entrada=>(
                            <EntradaRow key={entrada.id} entrada={entrada}
                              onEliminar={()=>eliminarEntrada(entrada.id)}
                              isMobile={isMobile}/>
                          ))}
                        </div>
                      )
                    })}

                    {!diaData.cerrado&&(
                      <div style={{marginTop:32,padding:"24px",
                        border:`1px solid ${R}25`,background:`${R}06`}}>
                        <p className="b" style={{fontSize:14,
                          color:"rgba(255,255,255,0.5)",lineHeight:1.6,
                          marginBottom:16,fontWeight:300}}>
                          Al cerrar el día el resumen se envía automáticamente a Coach David.
                        </p>
                        <CerrarDiaBtn onClick={cerrarDia} enviando={enviando}
                          cerrado={diaData.cerrado}/>
                      </div>
                    )}

                    {diaData.cerrado&&(
                      <div style={{marginTop:24,textAlign:"center"}}>
                        <button onClick={()=>{setDiaData(null);setFechaSel("")}}
                          style={{padding:"14px 28px",background:R,border:"none",
                            color:"#fff",fontFamily:"'Barlow Condensed',Impact,sans-serif",
                            fontSize:14,fontWeight:900,letterSpacing:"0.2em",
                            textTransform:"uppercase",cursor:"pointer"}}>
                          Registrar otro día →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
      {toast&&<Toast toast={toast}/>}
    </div>
  )

  /* ══ PANTALLA SEGUIMIENTO ════════════════════════════════════ */
  return (
    <Pantalla onBack={()=>setVistaGlobal("inicio")} titulo="Seguimiento de Medidas"
      accentColor={B}>
      {/* Formulario nuevo registro */}
      <div style={{marginBottom:28,padding:"20px",
        border:`1px solid ${segEditando?"rgba(245,158,11,0.3)":B+"30"}`,
        background:segEditando?"rgba(245,158,11,0.04)":`${B}06`}}>

        <div className="bc" style={{fontSize:13,fontWeight:900,
          textTransform:"uppercase",letterSpacing:"0.15em",
          color:segEditando?O:B,marginBottom:16,
          display:"flex",alignItems:"center",gap:8}}>
          {segEditando?"✏️ Editando registro":"+ Nuevo registro semanal"}
        </div>

        {/* Fecha */}
        <div style={{marginBottom:14}}>
          <label className="bc" style={{display:"block",fontSize:11,fontWeight:700,
            letterSpacing:"0.2em",textTransform:"uppercase",
            color:"rgba(255,255,255,0.38)",marginBottom:7}}>
            Fecha del registro *
          </label>
          <input type="date" value={fechaSeg}
            onChange={e=>setFechaSeg(e.target.value)}
            max={new Date().toLocaleDateString("en-CA",{timeZone:"America/Bogota"})}
            style={{width:"100%",padding:"11px 14px",
              background:"rgba(255,255,255,0.04)",
              border:`1px solid ${fechaSeg?B+"60":"rgba(255,255,255,0.12)"}`,
              color:"#fff",fontFamily:"'Barlow',sans-serif",
              fontSize:15,outline:"none",colorScheme:"dark"}}/>
        </div>

        {/* Grid de medidas */}
        <div style={{display:"grid",
          gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",
          gap:12,marginBottom:14}}>
          {[
            {key:"peso_kg",    label:"Peso",    unit:"kg",  placeholder:"70.5"},
            {key:"cintura_cm", label:"Cintura", unit:"cm",  placeholder:"80"},
            {key:"cadera_cm",  label:"Cadera",  unit:"cm",  placeholder:"95"},
            {key:"pecho_cm",   label:"Pecho",   unit:"cm",  placeholder:"90"},
            {key:"brazo_cm",   label:"Brazo",   unit:"cm",  placeholder:"33"},
            {key:"muslo_cm",   label:"Muslo",   unit:"cm",  placeholder:"55"},
          ].map(f=>(
            <div key={f.key}>
              <label className="bc" style={{display:"block",fontSize:10,
                fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",
                color:"rgba(255,255,255,0.35)",marginBottom:6}}>
                {f.label} ({f.unit})
              </label>
              <input type="number" inputMode="decimal"
                placeholder={f.placeholder}
                value={(formSeg as any)[f.key]??""} 
                onChange={e=>setFormSeg(s=>({...s,[f.key]:e.target.value}))}
                style={{width:"100%",padding:"10px 12px",
                  background:"rgba(255,255,255,0.04)",
                  border:`1px solid ${(formSeg as any)[f.key]?B+"50":"rgba(255,255,255,0.1)"}`,
                  color:"#fff",fontFamily:"'Barlow Condensed',Impact,sans-serif",
                  fontSize:20,fontWeight:900,outline:"none",textAlign:"center"}}/>
            </div>
          ))}
        </div>

        {/* Nota */}
        <div style={{marginBottom:14}}>
          <label className="bc" style={{display:"block",fontSize:10,fontWeight:700,
            letterSpacing:"0.15em",textTransform:"uppercase",
            color:"rgba(255,255,255,0.35)",marginBottom:6}}>
            Nota (opcional)
          </label>
          <textarea value={formSeg.nota??""} rows={2}
            placeholder="¿Cómo te sentiste esta semana? Cambios notables..."
            onChange={e=>setFormSeg(s=>({...s,nota:e.target.value}))}
            style={{width:"100%",padding:"9px 12px",
              background:"rgba(255,255,255,0.04)",
              border:"1px solid rgba(255,255,255,0.1)",
              color:"rgba(255,255,255,0.8)",
              fontFamily:"'Barlow',sans-serif",fontSize:13,
              outline:"none",resize:"none"}}/>
        </div>

        <div style={{display:"flex",gap:8}}>
          {segEditando&&(
            <button onClick={()=>{setSegEditando(null);setFormSeg({});setFechaSeg("")}}
              style={{flex:1,padding:"12px",
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.1)",
                color:"rgba(255,255,255,0.5)",
                fontFamily:"'Barlow Condensed',Impact,sans-serif",
                fontSize:13,fontWeight:700,letterSpacing:"0.1em",
                textTransform:"uppercase",cursor:"pointer"}}>
              Cancelar
            </button>
          )}
          <button onClick={guardarSeguimiento} disabled={guardandoSeg}
            style={{flex:2,padding:"13px",
              background:guardandoSeg?`${B}50`:segEditando?O:B,
              border:"none",color:"#fff",
              fontFamily:"'Barlow Condensed',Impact,sans-serif",
              fontSize:14,fontWeight:900,letterSpacing:"0.15em",
              textTransform:"uppercase",
              cursor:guardandoSeg?"not-allowed":"pointer"}}>
            {guardandoSeg?"Guardando..."
              :segEditando?"✓ Actualizar registro"
              :"✓ Guardar medidas"}
          </button>
        </div>
      </div>

      {/* Historial */}
      {cargandoSegs?(
        <div style={{textAlign:"center",padding:"32px",
          color:"rgba(255,255,255,0.3)",fontSize:14}}>
          Cargando historial...
        </div>
      ):seguimientos.length===0?(
        <div style={{textAlign:"center",padding:"40px 20px",
          border:"1px solid rgba(255,255,255,0.06)",
          color:"rgba(255,255,255,0.3)"}}>
          <div style={{fontSize:36,marginBottom:10}}>📊</div>
          <p className="b" style={{fontSize:14,fontWeight:300}}>
            Aún no tienes registros. ¡Empieza hoy!
          </p>
        </div>
      ):(
        <div>
          <div className="bc" style={{fontSize:11,color:"rgba(255,255,255,0.3)",
            letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:12}}>
            Historial de medidas — {seguimientos.length} registros
          </div>

          {/* Mini gráfica de peso */}
          {seguimientos.filter(s=>s.peso_kg).length>=2&&(
            <MiniGraficaPeso
              datos={seguimientos.filter(s=>s.peso_kg).slice(0,8).reverse()}/>
          )}

          {/* Cards de registros */}
          {seguimientos.map(seg=>(
            <div key={seg.id} style={{marginBottom:10,padding:"14px 16px",
              background:"rgba(255,255,255,0.02)",
              border:"1px solid rgba(255,255,255,0.07)",
              transition:"border-color 0.15s"}}
              onMouseEnter={e=>(e.currentTarget.style.borderColor=B+"40")}
              onMouseLeave={e=>(e.currentTarget.style.borderColor="rgba(255,255,255,0.07)")}>
              <div style={{display:"flex",alignItems:"center",
                justifyContent:"space-between",marginBottom:10}}>
                <div>
                  <div className="bc" style={{fontSize:14,fontWeight:700,
                    color:B,letterSpacing:"0.1em",textTransform:"uppercase"}}>
                    {formatFechaCorta(seg.fecha)}
                  </div>
                </div>
                <button onClick={()=>editarSeguimiento(seg)}
                  style={{background:"none",border:"none",
                    color:"rgba(255,255,255,0.3)",cursor:"pointer",
                    fontSize:12,fontFamily:"'Barlow Condensed',sans-serif",
                    fontWeight:700,letterSpacing:"0.1em",
                    textTransform:"uppercase",padding:"4px 8px"}}
                  onMouseEnter={e=>(e.currentTarget.style.color=O)}
                  onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.3)")}>
                  editar
                </button>
              </div>
              <div style={{display:"grid",
                gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:8}}>
                {[
                  {label:"Peso",  val:seg.peso_kg,    unit:"kg",  color:"#fff"},
                  {label:"Cintura",val:seg.cintura_cm,unit:"cm",  color:R},
                  {label:"Cadera",val:seg.cadera_cm,  unit:"cm",  color:O},
                  {label:"Pecho", val:seg.pecho_cm,   unit:"cm",  color:B},
                  {label:"Brazo", val:seg.brazo_cm,   unit:"cm",  color:G},
                  {label:"Muslo", val:seg.muslo_cm,   unit:"cm",  color:P},
                ].map(m=>m.val!=null&&(
                  <div key={m.label} style={{textAlign:"center",padding:"8px 4px",
                    background:"rgba(255,255,255,0.03)",
                    border:`1px solid rgba(255,255,255,0.06)`}}>
                    <div className="bc" style={{fontSize:18,fontWeight:900,
                      color:m.color,lineHeight:1}}>
                      {m.val}
                    </div>
                    <div className="b" style={{fontSize:9,
                      color:"rgba(255,255,255,0.35)",
                      textTransform:"uppercase",letterSpacing:"0.08em",
                      marginTop:3}}>
                      {m.label} {m.unit}
                    </div>
                  </div>
                ))}
              </div>
              {seg.nota&&(
                <div style={{marginTop:10,fontSize:12,
                  color:"rgba(255,255,255,0.4)",
                  fontStyle:"italic",lineHeight:1.5}}>
                  "{seg.nota}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {toast&&<Toast toast={toast}/>}
    </Pantalla>
  )
}

/* ══ COMPONENTES REUTILIZABLES ════════════════════════════════ */

/* Pantalla wrapper con header consistente */
function Pantalla({children, onBack, titulo, accentColor}:{
  children: React.ReactNode
  onBack?: ()=>void
  titulo?: string
  accentColor?: string
}) {
  const color = accentColor || "#E8000D"
  return (
    <div style={{background:"#000",color:"#fff",fontFamily:"'Barlow',sans-serif",
      minHeight:"100vh",overflowX:"hidden"}}>
      <Estilos/>
      <div style={{height:2,background:color}}/>
      <div style={{borderBottom:"1px solid rgba(255,255,255,0.06)",
        background:"rgba(0,0,0,0.95)",backdropFilter:"blur(12px)"}}>
        <div style={{maxWidth:680,margin:"0 auto",padding:"0 20px",height:52,
          display:"flex",alignItems:"center",gap:12}}>
          {onBack&&(
            <button onClick={onBack}
              style={{background:"none",border:"none",
                color:"rgba(255,255,255,0.4)",cursor:"pointer",
                fontSize:18,padding:"4px 8px"}}
              onMouseEnter={e=>(e.currentTarget.style.color="#fff")}
              onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.4)")}>
              ←
            </button>
          )}
          <span className="bc" style={{fontSize:16,fontWeight:900}}>
            COACH<span style={{color:"#E8000D"}}>.</span>DAVID
          </span>
          {titulo&&(
            <>
              <span style={{width:1,height:14,background:"rgba(255,255,255,0.15)"}}/>
              <span className="bc" style={{fontSize:12,color:"rgba(255,255,255,0.4)",
                letterSpacing:"0.2em",textTransform:"uppercase"}}>{titulo}</span>
            </>
          )}
        </div>
      </div>
      <div style={{maxWidth:680,margin:"0 auto",padding:"32px 20px 80px"}}>
        {children}
      </div>
    </div>
  )
}

/* Mini gráfica de peso con SVG */
function MiniGraficaPeso({datos}:{datos:Seguimiento[]}) {
  const W=340, H=80, PAD=8
  const pesos = datos.map(d=>d.peso_kg!)
  const min = Math.min(...pesos)-2
  const max = Math.max(...pesos)+2
  const pts = pesos.map((p,i)=>{
    const x = PAD + (i/(pesos.length-1))*(W-PAD*2)
    const y = PAD + (1-(p-min)/(max-min))*(H-PAD*2)
    return `${x},${y}`
  })
  const primero = pesos[0]
  const ultimo  = pesos[pesos.length-1]
  const diff    = Math.round((ultimo-primero)*10)/10
  const color   = diff<=0?"#22c55e":"#E8000D"

  return (
    <div style={{marginBottom:20,padding:"14px 16px",
      background:"rgba(255,255,255,0.02)",
      border:"1px solid rgba(255,255,255,0.07)"}}>
      <div style={{display:"flex",alignItems:"center",
        justifyContent:"space-between",marginBottom:10}}>
        <span className="bc" style={{fontSize:11,color:"rgba(255,255,255,0.35)",
          letterSpacing:"0.1em",textTransform:"uppercase"}}>
          Evolución del peso
        </span>
        <span className="bc" style={{fontSize:14,fontWeight:900,color}}>
          {diff>0?"+":""}{diff} kg
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
        <polyline points={pts.join(" ")}
          fill="none" stroke={color} strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
        {pesos.map((p,i)=>{
          const x=PAD+(i/(pesos.length-1))*(W-PAD*2)
          const y=PAD+(1-(p-min)/(max-min))*(H-PAD*2)
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="3" fill={color} opacity="0.9"/>
              {(i===0||i===pesos.length-1)&&(
                <text x={x} y={i===0?y-6:y+14} textAnchor="middle"
                  fill="rgba(255,255,255,0.5)" fontSize="9">
                  {p}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <div style={{display:"flex",justifyContent:"space-between",
        marginTop:4,fontSize:10,color:"rgba(255,255,255,0.25)"}}>
        <span>{formatFechaCorta(datos[0].fecha)}</span>
        <span>{formatFechaCorta(datos[datos.length-1].fecha)}</span>
      </div>
    </div>
  )
}

function TotalesBar({totales,isMobile}:{
  totales:{kcal:number;proteina:number;lipidos:number;cho:number}
  isMobile:boolean
}) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",
      gap:2,marginBottom:28}}>
      {[
        {label:"Calorías",val:totales.kcal,    unit:"kcal",color:"#fff"},
        {label:"Proteína",val:totales.proteina,unit:"g",   color:G},
        {label:"Lípidos", val:totales.lipidos, unit:"g",   color:O},
        {label:"Carbos",  val:totales.cho,     unit:"g",   color:B},
      ].map(item=>(
        <div key={item.label} style={{background:"#0a0a0a",
          border:"1px solid rgba(255,255,255,0.07)",
          padding:isMobile?"14px 10px":"18px 20px",textAlign:"center"}}>
          <div className="bc" style={{fontSize:isMobile?24:32,fontWeight:900,
            color:item.color,lineHeight:1}}>
            {item.val}<span style={{fontSize:isMobile?12:14}}>{item.unit}</span>
          </div>
          <div className="b" style={{fontSize:10,color:"rgba(255,255,255,0.3)",
            textTransform:"uppercase",letterSpacing:"0.1em",marginTop:4}}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}

function EntradaRow({entrada,onEliminar,isMobile}:{
  entrada:EntradaComida; onEliminar:()=>void; isMobile:boolean
}) {
  return (
    <div className="entrada-row" style={{display:"flex",alignItems:"center",
      justifyContent:"space-between",padding:"10px 12px",
      borderBottom:"1px solid rgba(255,255,255,0.04)",
      transition:"background 0.15s"}}>
      <div style={{flex:1,minWidth:0}}>
        <div className="b" style={{fontSize:14,color:"rgba(255,255,255,0.8)",
          fontWeight:400,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
          {entrada.nombreAlimento}
        </div>
        <div className="b" style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:2}}>
          {entrada.gramos}g · {entrada.hora} · {entrada.kcal} kcal
        </div>
      </div>
      {!isMobile&&(
        <div style={{display:"flex",gap:16,marginRight:16}}>
          <MacroChip label="P" val={entrada.proteina} color={G}/>
          <MacroChip label="L" val={entrada.lipidos}  color={O}/>
          <MacroChip label="C" val={entrada.cho}      color={B}/>
        </div>
      )}
      <button onClick={onEliminar}
        style={{background:"none",border:"none",color:"rgba(255,255,255,0.2)",
          cursor:"pointer",padding:"4px 8px",fontSize:16,transition:"color 0.15s"}}
        onMouseEnter={e=>(e.currentTarget.style.color=R)}
        onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.2)")}>
        ✕
      </button>
    </div>
  )
}

function MacroChip({label,val,color}:{label:string;val:number;color:string}) {
  return (
    <div style={{textAlign:"center"}}>
      <div className="bc" style={{fontSize:14,fontWeight:800,color}}>{val}g</div>
      <div className="b" style={{fontSize:10,color:"rgba(255,255,255,0.25)",
        letterSpacing:"0.1em"}}>{label}</div>
    </div>
  )
}

function AgregarBtn({onClick,disabled}:{onClick:()=>void;disabled:boolean}) {
  const [hover,setHover]=useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{width:"100%",padding:"16px",border:"none",
        background:disabled?"rgba(232,0,13,0.3)":hover?"#fff":R,
        color:disabled?"rgba(255,255,255,0.4)":hover?"#000":"#fff",
        fontFamily:"'Barlow Condensed',Impact,sans-serif",
        fontSize:15,fontWeight:900,letterSpacing:"0.22em",
        textTransform:"uppercase",
        cursor:disabled?"not-allowed":"pointer",
        clipPath:"polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))",
        transition:"all 0.2s"}}>
      + Agregar a Comida
    </button>
  )
}

function CerrarDiaBtn({onClick,enviando,cerrado}:{
  onClick:()=>void;enviando:boolean;cerrado:boolean
}) {
  const [hover,setHover]=useState(false)
  if(cerrado) return (
    <div style={{textAlign:"center",padding:"14px",
      background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)"}}>
      <span className="bc" style={{fontSize:14,color:G,
        letterSpacing:"0.2em",textTransform:"uppercase"}}>
        ✓ Resumen enviado a Coach David
      </span>
    </div>
  )
  return (
    <button onClick={onClick} disabled={enviando}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{width:"100%",padding:"16px",border:"none",
        background:enviando?"rgba(34,197,94,0.3)":hover?"#fff":G,
        color:hover&&!enviando?"#000":"#fff",
        fontFamily:"'Barlow Condensed',Impact,sans-serif",
        fontSize:15,fontWeight:900,letterSpacing:"0.22em",
        textTransform:"uppercase",
        cursor:enviando?"not-allowed":"pointer",transition:"all 0.2s"}}>
      {enviando?"Enviando resumen...":"Cerrar día y enviar a Coach David ✓"}
    </button>
  )
}

function Toast({toast}:{toast:{tipo:"ok"|"err";msg:string}}) {
  return (
    <div style={{position:"fixed",bottom:24,left:"50%",
      transform:"translateX(-50%)",zIndex:300,padding:"14px 20px",
      background:toast.tipo==="ok"?"rgba(34,197,94,0.15)":`${R}15`,
      border:`1px solid ${toast.tipo==="ok"?"rgba(34,197,94,0.4)":`${R}40`}`,
      display:"flex",gap:10,alignItems:"center",
      minWidth:260,maxWidth:"90vw",
      animation:"slideIn 0.3s ease",backdropFilter:"blur(8px)"}}>
      <span style={{color:toast.tipo==="ok"?G:R,fontWeight:900,fontSize:16}}>
        {toast.tipo==="ok"?"✓":"!"}
      </span>
      <span className="b" style={{fontSize:14,color:"rgba(255,255,255,0.8)"}}>
        {toast.msg}
      </span>
    </div>
  )
}

function Estilos() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      ::selection{background:#E8000D;color:#fff}
      .bc{font-family:'Barlow Condensed',Impact,sans-serif}
      .b{font-family:'Barlow',sans-serif}
      input::placeholder{color:rgba(255,255,255,0.25)}
      textarea::placeholder{color:rgba(255,255,255,0.25)}
      input[type=number]{-moz-appearance:textfield}
      input[type=number]::-webkit-outer-spin-button,
      input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
      @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      @keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
      .entrada-row:hover{background:rgba(255,255,255,0.04)!important}
    `}</style>
  )
}

function AccesoDenegado() {
  return (
    <div style={{background:"#000",minHeight:"100vh",display:"flex",
      alignItems:"center",justifyContent:"center",flexDirection:"column",
      textAlign:"center",padding:32,fontFamily:"'Barlow',sans-serif",color:"#fff"}}>
      <Estilos/>
      <div className="bc" style={{fontSize:60,fontWeight:900,color:"#E8000D",marginBottom:16}}>🔒</div>
      <h1 className="bc" style={{fontSize:36,fontWeight:900,
        textTransform:"uppercase",marginBottom:12}}>Acceso restringido</h1>
      <p className="b" style={{fontSize:15,color:"rgba(255,255,255,0.45)",
        maxWidth:380,lineHeight:1.7,fontWeight:300}}>
        Esta herramienta es exclusiva para clientes de Coach David con una suscripción activa.
      </p>
      <a href="https://wa.me/573243747367" target="_blank" rel="noopener noreferrer"
        style={{marginTop:32,padding:"14px 32px",background:"#22c55e",
          color:"#fff",fontFamily:"'Barlow Condensed',Impact,sans-serif",
          fontSize:14,fontWeight:900,letterSpacing:"0.2em",
          textTransform:"uppercase",textDecoration:"none"}}>
        Contactar por WhatsApp
      </a>
    </div>
  )
}

function Loading() {
  return (
    <div style={{background:"#000",minHeight:"100vh",display:"flex",
      alignItems:"center",justifyContent:"center",color:"#fff",
      fontFamily:"'Barlow',sans-serif"}}>
      <Estilos/>
      <div style={{textAlign:"center"}}>
        <div style={{width:32,height:32,border:"2px solid #E8000D",
          borderTopColor:"transparent",borderRadius:"50%",
          animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.3)"}}>Verificando acceso...</p>
      </div>
    </div>
  )
}
