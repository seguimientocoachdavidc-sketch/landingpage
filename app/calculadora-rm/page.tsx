"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

const R = "#E8000D"
const G = "#22c55e"

/* ══ FÓRMULAS 1RM ═══════════════════════════════════════════════ */
const FORMULAS = [
  { key:"epley",    name:"Epley",    fn:(w:number,r:number)=>r===1?w:w*(1+r/30) },
  { key:"brzycki",  name:"Brzycki",  fn:(w:number,r:number)=>r===1?w:w/(1.0278-0.0278*r) },
  { key:"lombardi", name:"Lombardi", fn:(w:number,r:number)=>r===1?w:w*Math.pow(r,0.10) },
  { key:"mayhew",   name:"Mayhew",   fn:(w:number,r:number)=>r===1?w:(100*w)/(52.2+41.9*Math.exp(-0.055*r)) },
  { key:"oconner",  name:"O'Conner", fn:(w:number,r:number)=>r===1?w:w*(1+r/40) },
  { key:"wathan",   name:"Wathan",   fn:(w:number,r:number)=>r===1?w:(100*w)/(48.8+53.8*Math.exp(-0.075*r)) },
]

const PCT_TABLE = [
  {pct:100,reps:1},{pct:95,reps:2},{pct:90,reps:3},{pct:85,reps:5},
  {pct:80,reps:6},{pct:75,reps:8},{pct:70,reps:10},{pct:65,reps:12},
  {pct:60,reps:15},{pct:55,reps:18},{pct:50,reps:20},
]

/* ══ ESTÁNDARES DE FUERZA ═══════════════════════════════════════
   Ratios 1RM / peso corporal por ejercicio, género y nivel
   Fuente: Lon Kilgore, Mark Rippetoe, ExRx.net
   Ajuste de edad: -3% por cada década sobre 35 años
   ═══════════════════════════════════════════════════════════════ */
const STANDARDS: Record<string, Record<string, number[]>> = {
  // ejercicio → género → [sin entreno, principiante, intermedio, avanzado, elite]
  sentadilla: {
    M: [0.50, 0.75, 1.25, 1.75, 2.20],
    F: [0.35, 0.55, 0.85, 1.20, 1.60],
  },
  banca: {
    M: [0.35, 0.55, 0.90, 1.25, 1.60],
    F: [0.20, 0.35, 0.55, 0.80, 1.05],
  },
  peso_muerto: {
    M: [0.60, 0.90, 1.50, 2.00, 2.50],
    F: [0.40, 0.65, 1.00, 1.40, 1.80],
  },
  press_hombro: {
    M: [0.20, 0.35, 0.60, 0.80, 1.00],
    F: [0.13, 0.22, 0.38, 0.52, 0.65],
  },
}

const EJERCICIO_LABELS: Record<string, string> = {
  sentadilla:    "Sentadilla",
  banca:         "Press de banca",
  peso_muerto:   "Peso muerto",
  press_hombro:  "Press de hombro",
}

const NIVEL_LABELS = ["Sin entrenamiento","Principiante","Intermedio","Avanzado","Élite"]
const NIVEL_COLORS = ["#6b7280","#3b82f6",G,"#f59e0b",R]

function getAgeMultiplier(edad: number): number {
  if (edad <= 35) return 1.0
  const decades = (edad - 35) / 10
  return Math.max(0.7, 1 - decades * 0.03)
}

function getNivel(ratio: number, standards: number[]): number {
  if (ratio < standards[0]) return -1      // por debajo de sin entreno
  if (ratio < standards[1]) return 0
  if (ratio < standards[2]) return 1
  if (ratio < standards[3]) return 2
  if (ratio < standards[4]) return 3
  return 4
}

function getNivelLabel(ratio: number, standards: number[]): {label:string; color:string; next:number|null; nextLabel:string} {
  const idx = getNivel(ratio, standards)
  const clamped = Math.max(0, Math.min(4, idx))
  const nextIdx = clamped < 4 ? clamped + 1 : null
  const nextKg = nextIdx !== null ? standards[nextIdx] : null
  return {
    label: NIVEL_LABELS[clamped] ?? "Sin entrenamiento",
    color: NIVEL_COLORS[clamped] ?? "#6b7280",
    next: nextKg,
    nextLabel: nextIdx !== null ? NIVEL_LABELS[nextIdx] : "Élite máximo",
  }
}

function r1(n: number){ return Math.round(n*10)/10 }

/* ══ PÁGINA ══════════════════════════════════════════════════════ */
export default function CalculadoraRMPage() {

  // ── Step 1: datos del ejercicio
  const [peso,     setPeso]     = useState("")
  const [reps,     setReps]     = useState("")
  const [ejercicio,setEjercicio]= useState("banca")

  // ── Step 2: datos del usuario (para desbloquear)
  const [pesoCorp, setPesoCorp] = useState("")
  const [genero,   setGenero]   = useState<"M"|"F">("M")
  const [edad,     setEdad]     = useState("")
  const [anios,    setAnios]    = useState("")

  // ── Resultados calculados
  const [avg, setAvg] = useState<number|null>(null)
  const [formulaVals, setFormulaVals] = useState<Record<string,number>>({})

  // ── Lead gate
  const [unlocked,  setUnlocked]  = useState(false)
  const [nombre,    setNombre]    = useState("")
  const [email,     setEmail]     = useState("")
  const [whatsapp,  setWhatsapp]  = useState("")
  const [acepta,    setAcepta]    = useState(false)
  const [enviando,  setEnviando]  = useState(false)
  const [errorForm, setErrorForm] = useState("")

  // ── Toast
  const [toast, setToast] = useState<string|null>(null)
  const showToast = (m:string)=>{ setToast(m); setTimeout(()=>setToast(null),4000) }

  /* ── Calcular 1RM ── */
  useEffect(()=>{
    const w = parseFloat(peso)
    const r = parseInt(reps)
    if(!w||!r||w<=0||r<=0||r>30){ setAvg(null); setFormulaVals({}); return }
    const v: Record<string,number> = {}
    FORMULAS.forEach(f=>{ v[f.key]=r1(f.fn(w,r)) })
    const a = r1(Object.values(v).reduce((s,x)=>s+x,0)/FORMULAS.length)
    v.avg = a
    setFormulaVals(v)
    setAvg(a)
  },[peso,reps])

  /* ── Guardar lead y desbloquear ── */
  const desbloquear = async () => {
    if(!nombre.trim()){ setErrorForm("Ingresa tu nombre."); return }
    if(!email.trim() || !email.includes("@")){ setErrorForm("Ingresa un correo válido."); return }
    if(!acepta){ setErrorForm("Debes aceptar el tratamiento de datos."); return }
    setErrorForm("")
    setEnviando(true)

    const { error } = await supabase.from("leads_calculadora").insert({
      nombre: nombre.trim(),
      email:  email.trim(),
      whatsapp: whatsapp.trim() || null,
      acepta_datos: true,
      fuente: "calculadora-rm",
    })

    setEnviando(false)
    if(error){ setErrorForm("Error al registrar. Intenta de nuevo."); return }
    setUnlocked(true)
    showToast("✓ ¡Acceso desbloqueado! Aquí están tus resultados.")
  }

  /* ── Calcular indicadores de déficit ── */
  const pC   = parseFloat(pesoCorp)
  const eC   = parseInt(edad)
  const std  = STANDARDS[ejercicio]?.[genero] ?? STANDARDS.banca.M
  const ageMult = eC>0 ? getAgeMultiplier(eC) : 1
  const adjStd = std.map(s=>r1(s*ageMult))
  const ratio = (avg && pC>0) ? r1(avg/pC) : null

  const nivelInfo = ratio !== null
    ? getNivelLabel(ratio, adjStd)
    : null

  const hasInputs = avg !== null && pC > 0 && eC > 0

  return (
    <div style={{background:"#050505",minHeight:"100vh",color:"#fff",
      fontFamily:"'Barlow',sans-serif",overflowX:"hidden"}}>

      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        input[type=number],input[type=email],input[type=text],input[type=tel]
          {-webkit-appearance:none;-moz-appearance:textfield}
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
        ::selection{background:${R};color:#fff}
        .inp{width:100%;padding:12px 14px;background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.12);color:#fff;
          font-size:15px;font-family:'Barlow',sans-serif;outline:none;
          transition:border-color 0.2s}
        .inp:focus{border-color:rgba(232,0,13,0.6)}
        .inp-filled{border-color:rgba(232,0,13,0.45)!important}
        .sel-btn{flex:1;padding:10px 8px;border:1px solid rgba(255,255,255,0.12);
          background:transparent;color:rgba(255,255,255,0.45);
          font-family:'Barlow Condensed',sans-serif;font-size:13px;
          font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
          cursor:pointer;transition:all 0.15s}
        .sel-btn.active{border-color:${R};background:rgba(232,0,13,0.12);color:#fff}
        .label{font-size:11px;color:rgba(255,255,255,0.38);letter-spacing:0.12em;
          text-transform:uppercase;margin-bottom:7px;display:block}
      `}</style>

      {/* Barra top */}
      <div style={{height:3,background:`linear-gradient(90deg,${R},#ff6b35,${R})`}}/>

      {/* Header */}
      <div style={{borderBottom:"1px solid rgba(255,255,255,0.06)",
        backdropFilter:"blur(12px)",background:"rgba(5,5,5,0.96)"}}>
        <div style={{maxWidth:780,margin:"0 auto",padding:"0 20px",height:52,
          display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <a href="/" style={{fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:16,fontWeight:900,textDecoration:"none",color:"#fff"}}>
            COACH<span style={{color:R}}>.</span>DAVID
          </a>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.3)",
            letterSpacing:"0.2em",textTransform:"uppercase"}}>
            Calculadora de Fuerza
          </span>
        </div>
      </div>

      <div style={{maxWidth:780,margin:"0 auto",padding:"44px 20px 80px"}}>

        {/* ── HERO ── */}
        <div style={{textAlign:"center",marginBottom:44}}>
          <div style={{display:"inline-block",padding:"5px 14px",
            background:`${R}15`,border:`1px solid ${R}40`,
            fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,
            letterSpacing:"0.25em",textTransform:"uppercase",color:R,
            marginBottom:16}}>
            Herramienta gratuita · Coach David
          </div>
          <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:"clamp(34px,6vw,60px)",fontWeight:900,
            textTransform:"uppercase",lineHeight:0.95,marginBottom:14}}>
            ¿Qué tan fuerte<br/>
            <span style={{color:R}}>eres en realidad?</span>
          </h1>
          <p style={{fontSize:15,color:"rgba(255,255,255,0.45)",
            maxWidth:500,margin:"0 auto",lineHeight:1.75,fontWeight:300}}>
            Calcula tu 1RM indirecto con 6 fórmulas científicas y descubre
            en qué nivel de fuerza te encuentras según tu peso corporal,
            género y años de entrenamiento.
          </p>
        </div>

        {/* ── PASO 1: DATOS DEL EJERCICIO ── */}
        <div style={{marginBottom:24,padding:"24px",
          border:"1px solid rgba(255,255,255,0.08)",
          background:"rgba(255,255,255,0.02)"}}>

          <div style={{fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:13,fontWeight:700,letterSpacing:"0.2em",
            textTransform:"uppercase",color:R,marginBottom:20,
            display:"flex",alignItems:"center",gap:10}}>
            <span style={{width:22,height:22,background:R,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:900}}>
              1
            </span>
            Datos del ejercicio
          </div>

          {/* Ejercicio */}
          <div style={{marginBottom:16}}>
            <span className="label">Ejercicio</span>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {Object.entries(EJERCICIO_LABELS).map(([k,v])=>(
                <button key={k} className={`sel-btn${ejercicio===k?" active":""}`}
                  onClick={()=>setEjercicio(k)}>{v}</button>
              ))}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div>
              <span className="label">Peso levantado (kg)</span>
              <input type="number" className={`inp${peso?" inp-filled":""}`}
                placeholder="ej. 80" value={peso}
                onChange={e=>setPeso(e.target.value)}
                style={{width:"100%",fontSize:26,
                  fontFamily:"'Barlow Condensed',sans-serif",
                  fontWeight:900,textAlign:"center"}}/>
            </div>
            <div>
              <span className="label">Repeticiones realizadas</span>
              <input type="number" className={`inp${reps?" inp-filled":""}`}
                placeholder="ej. 8" value={reps}
                onChange={e=>setReps(e.target.value)}
                style={{width:"100%",fontSize:26,
                  fontFamily:"'Barlow Condensed',sans-serif",
                  fontWeight:900,textAlign:"center"}}/>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",
                marginTop:4}}>rango ideal: 3–10 reps</div>
            </div>
          </div>
        </div>

        {/* ── PASO 2: DATOS PERSONALES (para el déficit) ── */}
        <div style={{marginBottom:28,padding:"24px",
          border:"1px solid rgba(255,255,255,0.08)",
          background:"rgba(255,255,255,0.02)"}}>

          <div style={{fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:13,fontWeight:700,letterSpacing:"0.2em",
            textTransform:"uppercase",color:R,marginBottom:20,
            display:"flex",alignItems:"center",gap:10}}>
            <span style={{width:22,height:22,background:R,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:900}}>
              2
            </span>
            Tus datos personales
          </div>

          <div style={{marginBottom:16}}>
            <span className="label">Género</span>
            <div style={{display:"flex",gap:8}}>
              {([["M","Masculino"],["F","Femenino"]] as const).map(([k,v])=>(
                <button key={k} className={`sel-btn${genero===k?" active":""}`}
                  onClick={()=>setGenero(k)} style={{maxWidth:160}}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div style={{display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:14}}>
            <div>
              <span className="label">Peso corporal (kg)</span>
              <input type="number" className={`inp${pesoCorp?" inp-filled":""}`}
                placeholder="ej. 75" value={pesoCorp}
                onChange={e=>setPesoCorp(e.target.value)}
                style={{width:"100%",fontSize:22,textAlign:"center",
                  fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900}}/>
            </div>
            <div>
              <span className="label">Edad (años)</span>
              <input type="number" className={`inp${edad?" inp-filled":""}`}
                placeholder="ej. 28" value={edad}
                onChange={e=>setEdad(e.target.value)}
                style={{width:"100%",fontSize:22,textAlign:"center",
                  fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900}}/>
            </div>
            <div>
              <span className="label">Años entrenando</span>
              <input type="number" className={`inp${anios?" inp-filled":""}`}
                placeholder="ej. 3" value={anios}
                onChange={e=>setAnios(e.target.value)}
                style={{width:"100%",fontSize:22,textAlign:"center",
                  fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900}}/>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",
                marginTop:4}}>con pesas / gym</div>
            </div>
          </div>
        </div>

        {/* ── PREVISUALIZACIÓN 1RM (siempre visible) ── */}
        {avg !== null && (
          <div style={{animation:"fadeUp 0.3s ease",marginBottom:28}}>
            <div style={{padding:"24px",border:`1px solid ${R}30`,
              background:`${R}06`,textAlign:"center",marginBottom:16}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",
                letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8}}>
                Tu 1RM estimado — promedio de 6 fórmulas
              </div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",
                fontSize:68,fontWeight:900,color:"#fff",lineHeight:1}}>
                {avg.toFixed(1)}
                <span style={{fontSize:24,color:"rgba(255,255,255,0.4)",
                  marginLeft:6}}>kg</span>
              </div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.3)",marginTop:8}}>
                {peso} kg × {reps} reps — {EJERCICIO_LABELS[ejercicio]}
              </div>
            </div>

            {/* Fórmulas en miniatura */}
            <div style={{display:"grid",
              gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:6}}>
              {FORMULAS.map(f=>(
                <div key={f.key} style={{padding:"10px 8px",textAlign:"center",
                  background:"rgba(255,255,255,0.03)",
                  border:"1px solid rgba(255,255,255,0.07)"}}>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",
                    letterSpacing:"0.1em",textTransform:"uppercase",
                    marginBottom:3}}>{f.name}</div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",
                    fontSize:18,fontWeight:900}}>
                    {formulaVals[f.key]?.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ZONA BLOQUEADA: DÉFICIT + TABLA PCT ── */}
        {hasInputs && !unlocked && (
          <div style={{position:"relative",marginBottom:28,
            animation:"fadeUp 0.4s ease"}}>

            {/* Preview borroso */}
            <div style={{filter:"blur(6px)",pointerEvents:"none",
              userSelect:"none",opacity:0.45}}>
              <DeficitPreview
                rm={avg!} pc={pC} ratio={ratio!}
                nivelInfo={nivelInfo!} adjStd={adjStd}
                ejercicio={ejercicio} pct={PCT_TABLE} r1={r1}
                anios={parseInt(anios)||0}
              />
            </div>

            {/* Overlay con formulario */}
            <div style={{position:"absolute",inset:0,display:"flex",
              alignItems:"center",justifyContent:"center",
              background:"linear-gradient(to bottom,transparent 0%,rgba(5,5,5,0.92) 30%)"}}>
              <div style={{width:"100%",maxWidth:480,padding:"28px",
                background:"#0a0a0a",border:`1px solid ${R}40`,
                margin:"0 20px",animation:"fadeUp 0.5s ease"}}>

                <div style={{textAlign:"center",marginBottom:22}}>
                  <div style={{fontSize:28,marginBottom:8}}>🔒</div>
                  <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",
                    fontSize:22,fontWeight:900,textTransform:"uppercase",
                    marginBottom:8}}>
                    Desbloquea tus resultados
                  </h2>
                  <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",
                    lineHeight:1.65}}>
                    Ingresa tus datos para ver tu <strong style={{color:"#fff"}}>nivel de fuerza</strong>,
                    déficit por trabajar y tabla completa de cargas.
                  </p>
                </div>

                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <div>
                    <span className="label">Nombre *</span>
                    <input type="text" className={`inp${nombre?" inp-filled":""}`}
                      placeholder="¿Cómo te llamas?"
                      value={nombre} onChange={e=>setNombre(e.target.value)}
                      style={{width:"100%"}}/>
                  </div>
                  <div>
                    <span className="label">Correo electrónico *</span>
                    <input type="email" className={`inp${email?" inp-filled":""}`}
                      placeholder="tu@correo.com"
                      value={email} onChange={e=>setEmail(e.target.value)}
                      style={{width:"100%"}}/>
                  </div>
                  <div>
                    <span className="label">WhatsApp (opcional)</span>
                    <input type="tel" className={`inp${whatsapp?" inp-filled":""}`}
                      placeholder="300 000 0000"
                      value={whatsapp} onChange={e=>setWhatsapp(e.target.value)}
                      style={{width:"100%"}}/>
                  </div>

                  {/* Checkbox datos */}
                  <label style={{display:"flex",alignItems:"flex-start",
                    gap:10,cursor:"pointer"}}>
                    <div onClick={()=>setAcepta(!acepta)}
                      style={{flexShrink:0,width:18,height:18,marginTop:2,
                        border:`1px solid ${acepta?R:"rgba(255,255,255,0.25)"}`,
                        background:acepta?R:"transparent",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        cursor:"pointer",transition:"all 0.15s"}}>
                      {acepta&&<span style={{color:"#fff",fontSize:11,fontWeight:900}}>✓</span>}
                    </div>
                    <span style={{fontSize:11,color:"rgba(255,255,255,0.4)",
                      lineHeight:1.6}}>
                      Autorizo a Coach David a contactarme con información sobre
                      entrenamiento y nutrición. Ley 1581 de 2012 — puedo
                      solicitar eliminación en{" "}
                      <span style={{color:R}}>seguimiento.coachdavidc@gmail.com</span>
                    </span>
                  </label>

                  {errorForm && (
                    <div style={{padding:"9px 12px",
                      background:`${R}12`,border:`1px solid ${R}35`,
                      fontSize:13,color:"#fca5a5"}}>
                      {errorForm}
                    </div>
                  )}

                  <button onClick={desbloquear} disabled={enviando}
                    style={{width:"100%",padding:"15px",
                      background:enviando?`${R}50`:R,border:"none",
                      color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",
                      fontSize:15,fontWeight:900,letterSpacing:"0.2em",
                      textTransform:"uppercase",
                      cursor:enviando?"not-allowed":"pointer"}}>
                    {enviando?"Verificando...":"Ver mis resultados completos →"}
                  </button>

                  <p style={{fontSize:10,color:"rgba(255,255,255,0.2)",
                    textAlign:"center"}}>
                    Sin spam · Datos protegidos · Nunca compartidos con terceros
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTADOS DESBLOQUEADOS ── */}
        {hasInputs && unlocked && (
          <div style={{animation:"fadeUp 0.5s ease"}}>
            <DeficitPreview
              rm={avg!} pc={pC} ratio={ratio!}
              nivelInfo={nivelInfo!} adjStd={adjStd}
              ejercicio={ejercicio} pct={PCT_TABLE} r1={r1}
              anios={parseInt(anios)||0}
            />
            {/* CTA post-desbloqueo */}
            <div style={{marginTop:24,padding:"24px",
              border:"1px solid rgba(34,197,94,0.2)",
              background:"rgba(34,197,94,0.04)",textAlign:"center"}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",
                fontSize:18,fontWeight:900,textTransform:"uppercase",
                marginBottom:8}}>
                ¿Listo para mejorar estos números?
              </div>
              <p style={{fontSize:14,color:"rgba(255,255,255,0.5)",
                marginBottom:16,lineHeight:1.65}}>
                Tengo programas de entrenamiento basados en ciencia para llevar
                tu fuerza al siguiente nivel — exactamente como esta calculadora.
              </p>
              <div style={{display:"flex",gap:10,justifyContent:"center",
                flexWrap:"wrap"}}>
                <a href="https://wa.me/573243747367" target="_blank"
                  rel="noopener noreferrer"
                  style={{padding:"12px 22px",background:G,color:"#fff",
                    textDecoration:"none",fontFamily:"'Barlow Condensed',sans-serif",
                    fontSize:13,fontWeight:900,letterSpacing:"0.15em",
                    textTransform:"uppercase"}}>
                  Hablar con Coach David
                </a>
                <a href="/productos" style={{padding:"12px 22px",
                  border:"1px solid rgba(255,255,255,0.15)",
                  color:"rgba(255,255,255,0.6)",textDecoration:"none",
                  fontFamily:"'Barlow Condensed',sans-serif",
                  fontSize:13,fontWeight:900,letterSpacing:"0.15em",
                  textTransform:"uppercase"}}>
                  Ver programas digitales
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje si falta completar datos */}
        {avg !== null && !hasInputs && (
          <div style={{textAlign:"center",padding:"20px",
            border:"1px solid rgba(255,255,255,0.07)",
            color:"rgba(255,255,255,0.35)",fontSize:14,
            animation:"fadeUp 0.3s ease"}}>
            Completa tu peso corporal y edad para ver el análisis de déficit de fuerza
          </div>
        )}

        {/* Footer */}
        <div style={{marginTop:48,textAlign:"center",
          borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:24}}>
          <p style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,
            fontWeight:900,marginBottom:4}}>
            COACH<span style={{color:R}}>.</span>DAVID
          </p>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.2)"}}>
            Entrenamiento personalizado basado en ciencia
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",bottom:24,left:"50%",
          transform:"translateX(-50%)",zIndex:300,
          padding:"12px 20px",background:"rgba(34,197,94,0.15)",
          border:"1px solid rgba(34,197,94,0.4)",color:"#86efac",
          fontSize:14,backdropFilter:"blur(8px)",
          whiteSpace:"nowrap",animation:"fadeUp 0.3s ease"}}>
          {toast}
        </div>
      )}
    </div>
  )
}

/* ══ COMPONENTE DE RESULTADOS (shared borroso/visible) ════════════ */
function DeficitPreview({rm,pc,ratio,nivelInfo,adjStd,ejercicio,pct,r1,anios}:{
  rm:number; pc:number; ratio:number
  nivelInfo:{label:string;color:string;next:number|null;nextLabel:string}
  adjStd:number[]; ejercicio:string; pct:typeof PCT_TABLE
  r1:(n:number)=>number; anios:number
}) {
  const NIVEL_LABELS = ["Sin entrenamiento","Principiante","Intermedio","Avanzado","Élite"]
  const NIVEL_COLORS = ["#6b7280","#3b82f6","#22c55e","#f59e0b","#E8000D"]

  // Calcular en qué nivel está (0-4)
  let nivelIdx = 0
  for(let i=0;i<adjStd.length;i++){
    if(ratio >= adjStd[i]) nivelIdx = i
  }
  if(ratio < adjStd[0]) nivelIdx = -1

  const kgParaSiguiente = nivelInfo.next !== null
    ? r1((nivelInfo.next * pc) - rm)
    : null

  return (
    <div>
      {/* Card nivel actual */}
      <div style={{padding:"28px 24px",marginBottom:16,
        border:`2px solid ${nivelInfo.color}50`,
        background:`${nivelInfo.color}10`,textAlign:"center"}}>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",
          letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8}}>
          Tu nivel de fuerza — {EJERCICIO_LABELS[ejercicio]} · Ratio {ratio.toFixed(2)}×
        </div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",
          fontSize:44,fontWeight:900,color:nivelInfo.color,
          textTransform:"uppercase",lineHeight:1,marginBottom:8}}>
          {nivelInfo.label}
        </div>
        <div style={{fontSize:14,color:"rgba(255,255,255,0.5)"}}>
          Levantas <strong style={{color:"#fff"}}>{ratio.toFixed(2)}×</strong> tu peso corporal
          {kgParaSiguiente !== null && kgParaSiguiente > 0 && (
            <> — te faltan <strong style={{color:nivelInfo.color}}>{kgParaSiguiente.toFixed(1)} kg</strong> para {nivelInfo.nextLabel}</>
          )}
        </div>
      </div>

      {/* Barra de progresión */}
      <div style={{marginBottom:20,padding:"18px 20px",
        background:"rgba(255,255,255,0.02)",
        border:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",
          letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14}}>
          Escala de niveles — {EJERCICIO_LABELS[ejercicio]}
        </div>
        <div style={{display:"flex",gap:4,marginBottom:10}}>
          {NIVEL_LABELS.map((lbl,i)=>{
            const isActive = i === Math.max(0,nivelIdx)
            const isPast = i < Math.max(0,nivelIdx)
            return (
              <div key={lbl} style={{flex:1,position:"relative"}}>
                <div style={{height:8,
                  background:isActive?NIVEL_COLORS[i]:isPast?`${NIVEL_COLORS[i]}60`:"rgba(255,255,255,0.08)",
                  transition:"background 0.3s"}}/>
                <div style={{fontSize:9,color:isActive?NIVEL_COLORS[i]:"rgba(255,255,255,0.25)",
                  textAlign:"center",marginTop:5,
                  fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,
                  letterSpacing:"0.05em",textTransform:"uppercase",lineHeight:1.2}}>
                  {lbl}
                </div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.2)",
                  textAlign:"center",marginTop:2}}>
                  {adjStd[i].toFixed(2)}×
                </div>
              </div>
            )
          })}
        </div>
        {/* Indicador posición actual */}
        <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",
          borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:10,marginTop:4}}>
          Tu ratio actual: <strong style={{color:"#fff"}}>{ratio.toFixed(2)}×</strong>
          {" "}el peso corporal · Los estándares incluyen ajuste por edad
        </div>
      </div>

      {/* Tabla de cargas */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",
          letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>
          Tabla de cargas basada en tu 1RM ({rm.toFixed(1)} kg)
        </div>
        <div style={{display:"grid",
          gridTemplateColumns:"repeat(auto-fill,minmax(76px,1fr))",gap:6}}>
          {pct.map(row=>{
            const kg = r1(rm*row.pct/100)
            const isMax = row.pct===100
            return (
              <div key={row.pct} style={{padding:"10px 6px",textAlign:"center",
                background:isMax?"rgba(232,0,13,0.1)":"rgba(255,255,255,0.03)",
                border:`1px solid ${isMax?"rgba(232,0,13,0.35)":"rgba(255,255,255,0.07)"}`}}>
                <div style={{fontSize:10,
                  color:isMax?"#E8000D":"rgba(255,255,255,0.4)",
                  fontWeight:isMax?700:400}}>{row.pct}%</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",
                  fontSize:17,fontWeight:900}}>{kg.toFixed(1)}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>
                  ~{row.reps}r
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Nota técnica */}
      <div style={{padding:"12px 16px",
        background:"rgba(255,255,255,0.02)",
        border:"1px solid rgba(255,255,255,0.06)",
        fontSize:12,color:"rgba(255,255,255,0.35)",lineHeight:1.6}}>
        <strong style={{color:"rgba(255,255,255,0.5)"}}>Metodología:</strong>{" "}
        Estándares basados en Kilgore & Rippetoe / ExRx.net. El ratio incluye
        corrección por edad (−3% por década sobre 35 años). El 1RM se calcula
        como promedio de 6 fórmulas validadas (Epley, Brzycki, Lombardi,
        Mayhew, O'Conner, Wathan). Estos valores son estimaciones — la
        evaluación con un coach certificado siempre es más precisa.
      </div>
    </div>
  )
}

const EJERCICIO_LABELS: Record<string,string> = {
  sentadilla:"Sentadilla",
  banca:"Press de banca",
  peso_muerto:"Peso muerto",
  press_hombro:"Press de hombro",
}
