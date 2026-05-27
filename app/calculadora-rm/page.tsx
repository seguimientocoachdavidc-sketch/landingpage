"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

const R = "#E8000D"
const B = "#1d4ed8"

/* ── Fórmulas ─────────────────────────────────────────────────── */
const FORMULAS = [
  { key: "epley",    name: "Epley",     eq: "w × (1 + r/30)",              fn: (w:number,r:number) => r===1?w:w*(1+r/30) },
  { key: "brzycki",  name: "Brzycki",   eq: "w / (1.0278 − 0.0278r)",      fn: (w:number,r:number) => r===1?w:w/(1.0278-0.0278*r) },
  { key: "lombardi", name: "Lombardi",  eq: "w × r^0.10",                  fn: (w:number,r:number) => r===1?w:w*Math.pow(r,0.10) },
  { key: "mayhew",   name: "Mayhew",    eq: "100w / (52.2 + 41.9e^−0.055r)",fn: (w:number,r:number) => r===1?w:(100*w)/(52.2+41.9*Math.exp(-0.055*r)) },
  { key: "oconner",  name: "O'Conner",  eq: "w × (1 + r/40)",              fn: (w:number,r:number) => r===1?w:w*(1+r/40) },
  { key: "wathan",   name: "Wathan",    eq: "100w / (48.8 + 53.8e^−0.075r)",fn: (w:number,r:number) => r===1?w:(100*w)/(48.8+53.8*Math.exp(-0.075*r)) },
]

const PCT_TABLE = [
  {pct:100,reps:1},{pct:95,reps:2},{pct:90,reps:3},{pct:85,reps:5},
  {pct:80,reps:6},{pct:75,reps:8},{pct:70,reps:10},{pct:65,reps:12},
  {pct:60,reps:15},{pct:55,reps:18},{pct:50,reps:20},
]

function round1(n:number){ return Math.round(n*10)/10 }

/* ══ PÁGINA ══════════════════════════════════════════════════════ */
export default function CalculadoraRMPage() {
  // Calculadora
  const [peso, setPeso]   = useState("")
  const [reps, setReps]   = useState("")
  const [activa, setActiva] = useState("avg")
  const [vals, setVals]   = useState<Record<string,number>>({})
  const [avg, setAvg]     = useState<number|null>(null)

  // Lead form
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre]     = useState("")
  const [contacto, setContacto] = useState("")  // email o whatsapp
  const [tipoContacto, setTipoContacto] = useState<"email"|"whatsapp">("whatsapp")
  const [acepta, setAcepta]     = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado]   = useState(false)
  const [errorForm, setErrorForm] = useState("")

  // Toast
  const [toast, setToast] = useState<string|null>(null)
  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(null),4000) }

  /* ── Calcular ── */
  useEffect(()=>{
    const w = parseFloat(peso)
    const r = parseInt(reps)
    if(!w||!r||w<=0||r<=0||r>30) { setVals({}); setAvg(null); return }
    const v: Record<string,number> = {}
    FORMULAS.forEach(f=>{ v[f.key]=round1(f.fn(w,r)) })
    const a = round1(Object.values(v).reduce((s,x)=>s+x,0)/FORMULAS.length)
    v.avg = a
    setVals(v)
    setAvg(a)
    if(!showForm && a>0) setShowForm(true)
  }, [peso,reps])

  const rmDisplay = activa==="avg" ? avg : vals[activa]
  const formulaLabel = activa==="avg" ? "Promedio 6 fórmulas" : FORMULAS.find(f=>f.key===activa)?.name

  /* ── Guardar lead ── */
  const guardarLead = async () => {
    if(!nombre.trim()){ setErrorForm("Ingresa tu nombre."); return }
    if(!contacto.trim()){ setErrorForm("Ingresa tu correo o WhatsApp."); return }
    if(!acepta){ setErrorForm("Debes aceptar el tratamiento de datos."); return }
    setErrorForm("")
    setEnviando(true)

    const payload: Record<string,any> = {
      nombre: nombre.trim(),
      acepta_datos: true,
      fuente: "calculadora-rm",
    }
    if(tipoContacto==="email") payload.email = contacto.trim()
    else payload.whatsapp = contacto.trim()

    const { error } = await supabase.from("leads_calculadora").insert(payload)
    setEnviando(false)
    if(error){ setErrorForm("Error al guardar. Intenta de nuevo."); return }
    setEnviado(true)
    showToast("✓ ¡Registrado! Coach David se pondrá en contacto contigo.")
  }

  return (
    <div style={{background:"#050505",minHeight:"100vh",color:"#fff",
      fontFamily:"'Barlow',sans-serif",overflowX:"hidden"}}>

      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        input[type=number]{-moz-appearance:textfield}
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        ::selection{background:${R};color:#fff}
      `}</style>

      {/* Línea top */}
      <div style={{height:3,background:`linear-gradient(90deg,${R},#ff6b35,${R})`}}/>

      {/* Header */}
      <div style={{borderBottom:"1px solid rgba(255,255,255,0.06)",
        backdropFilter:"blur(12px)",background:"rgba(5,5,5,0.95)"}}>
        <div style={{maxWidth:760,margin:"0 auto",padding:"0 20px",height:52,
          display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <a href="/" style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,
            fontWeight:900,textDecoration:"none",color:"#fff"}}>
            COACH<span style={{color:R}}>.</span>DAVID
          </a>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.35)",letterSpacing:"0.2em",
            textTransform:"uppercase"}}>Calculadora de Fuerza</span>
        </div>
      </div>

      <div style={{maxWidth:760,margin:"0 auto",padding:"48px 20px 80px"}}>

        {/* Hero */}
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{display:"inline-block",padding:"5px 14px",
            background:`${R}15`,border:`1px solid ${R}40`,
            fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,
            letterSpacing:"0.25em",textTransform:"uppercase",color:R,
            marginBottom:16}}>
            Herramienta gratuita
          </div>
          <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(36px,6vw,62px)",
            fontWeight:900,textTransform:"uppercase",lineHeight:0.95,marginBottom:16}}>
            Calcula tu<br/>
            <span style={{color:R}}>1RM Indirecto</span>
          </h1>
          <p style={{fontSize:16,color:"rgba(255,255,255,0.5)",maxWidth:480,
            margin:"0 auto",lineHeight:1.7,fontWeight:300}}>
            Estima tu repetición máxima sin arriesgar una lesión. Usamos 6 fórmulas
            científicas validadas para darte el resultado más preciso posible.
          </p>
        </div>

        {/* Inputs */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:32}}>
          {[
            {label:"Peso levantado",id:"peso",val:peso,set:setPeso,
              unit:"kilogramos",placeholder:"80"},
            {label:"Repeticiones realizadas",id:"reps",val:reps,set:setReps,
              unit:"reps · rango ideal: 3–10",placeholder:"8"},
          ].map(f=>(
            <div key={f.id}>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",
                letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>
                {f.label}
              </div>
              <input type="number" placeholder={f.placeholder}
                value={f.val} onChange={e=>f.set(e.target.value)}
                style={{width:"100%",padding:"14px 16px",
                  background:"rgba(255,255,255,0.04)",
                  border:`1px solid ${f.val?"rgba(232,0,13,0.5)":"rgba(255,255,255,0.12)"}`,
                  color:"#fff",fontSize:28,fontFamily:"'Barlow Condensed',sans-serif",
                  fontWeight:900,outline:"none",textAlign:"center",
                  transition:"border-color 0.2s"}}/>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:5}}>
                {f.unit}
              </div>
            </div>
          ))}
        </div>

        {/* Aviso reps altas */}
        {parseInt(reps)>15 && (
          <div style={{marginBottom:24,padding:"10px 14px",
            background:"rgba(234,179,8,0.08)",
            border:"1px solid rgba(234,179,8,0.25)",
            fontSize:13,color:"#fcd34d",lineHeight:1.5}}>
            ⚠️ Con más de 15 reps la precisión disminuye. Para mejores resultados
            usa un peso que puedas mover entre 3 y 10 repeticiones controladas.
          </div>
        )}

        {/* Resultado principal */}
        {avg!==null && (
          <div style={{animation:"fadeUp 0.35s ease"}}>

            {/* Card promedio */}
            <div style={{padding:"32px 24px",
              border:`1px solid ${R}30`,background:`${R}06`,
              textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",
                letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8}}>
                Tu 1RM estimado — promedio de 6 fórmulas
              </div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",
                fontSize:72,fontWeight:900,color:"#fff",lineHeight:1}}>
                {avg.toFixed(1)}<span style={{fontSize:28,color:"rgba(255,255,255,0.5)",marginLeft:4}}>kg</span>
              </div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.35)",marginTop:8}}>
                Basado en {peso} kg × {reps} repeticiones
              </div>
            </div>

            {/* Fórmulas individuales */}
            <div style={{fontSize:12,color:"rgba(255,255,255,0.35)",
              letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>
              Resultado por fórmula — toca una para ver su tabla de %
            </div>
            <div style={{display:"grid",
              gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",
              gap:8,marginBottom:28}}>
              {FORMULAS.map(f=>{
                const v = vals[f.key]
                const isActive = activa===f.key
                return (
                  <button key={f.key} onClick={()=>setActiva(f.key)}
                    style={{padding:"14px 10px",textAlign:"center",
                      border:`1px solid ${isActive?R:"rgba(255,255,255,0.1)"}`,
                      background:isActive?`${R}15`:"rgba(255,255,255,0.02)",
                      cursor:"pointer",transition:"all 0.15s",
                      outline:"none"}}>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",
                      fontSize:11,color:isActive?R:"rgba(255,255,255,0.4)",
                      letterSpacing:"0.1em",textTransform:"uppercase",
                      marginBottom:4}}>{f.name}</div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",
                      fontSize:22,fontWeight:900,
                      color:isActive?"#fff":"rgba(255,255,255,0.7)"}}>
                      {v?.toFixed(1)}
                    </div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",
                      marginTop:2,fontFamily:"monospace"}}>{f.eq}</div>
                  </button>
                )
              })}
            </div>

            {/* Tabla de porcentajes */}
            {rmDisplay && (
              <>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.35)",
                  letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>
                  Tabla de cargas — {formulaLabel} ({rmDisplay.toFixed(1)} kg)
                </div>
                <div style={{display:"grid",
                  gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",
                  gap:6,marginBottom:32}}>
                  {PCT_TABLE.map(row=>{
                    const kg = round1(rmDisplay*row.pct/100)
                    const isMax = row.pct===100
                    return (
                      <div key={row.pct} style={{
                        padding:"10px 6px",textAlign:"center",
                        background:isMax?`${R}15`:"rgba(255,255,255,0.03)",
                        border:`1px solid ${isMax?`${R}40`:"rgba(255,255,255,0.07)"}`,
                      }}>
                        <div style={{fontSize:11,
                          color:isMax?R:"rgba(255,255,255,0.4)",
                          fontWeight:isMax?700:400}}>{row.pct}%</div>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",
                          fontSize:18,fontWeight:900,color:"#fff"}}>
                          {kg.toFixed(1)}
                        </div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>
                          ~{row.reps} reps
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Explicación rápida */}
            <div style={{marginBottom:40,padding:"16px 20px",
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.07)"}}>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.35)",
                letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>
                ¿Cómo usar esta tabla?
              </div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",
                lineHeight:1.7,fontWeight:300}}>
                <p style={{marginBottom:6}}>
                  <span style={{color:"#fff",fontWeight:500}}>80–85%</span> del 1RM
                  (6–8 reps) → zona de hipertrofia e hipertrofia/fuerza. Ideal para ganar masa muscular.
                </p>
                <p style={{marginBottom:6}}>
                  <span style={{color:"#fff",fontWeight:500}}>85–95%</span> del 1RM
                  (2–5 reps) → zona de fuerza máxima. Desarrollo de fuerza pura.
                </p>
                <p>
                  <span style={{color:"#fff",fontWeight:500}}>60–75%</span> del 1RM
                  (10–15 reps) → resistencia muscular y acumulación de volumen.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── CTA / FORMULARIO DE LEAD ───────────────────────── */}
        <div style={{border:`1px solid ${R}35`,background:`${R}06`,padding:"32px 28px",
          animation:"fadeUp 0.4s ease"}}>

          {!enviado ? (
            <>
              {/* Encabezado CTA */}
              <div style={{marginBottom:24}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",
                  fontSize:11,color:R,letterSpacing:"0.25em",
                  textTransform:"uppercase",marginBottom:8}}>
                  Gratis · Sin compromiso
                </div>
                <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",
                  fontSize:28,fontWeight:900,textTransform:"uppercase",
                  lineHeight:1.1,marginBottom:10}}>
                  ¿Quieres un plan de entrenamiento<br/>
                  <span style={{color:R}}>personalizado a tu nivel?</span>
                </h2>
                <p style={{fontSize:14,color:"rgba(255,255,255,0.5)",
                  lineHeight:1.7,fontWeight:300}}>
                  Déjame tus datos y te envío información sobre cómo puedo ayudarte
                  a alcanzar tus objetivos con un programa basado en ciencia —
                  igual que esta calculadora.
                </p>
              </div>

              {/* Form */}
              <div style={{display:"flex",flexDirection:"column",gap:14}}>

                {/* Nombre */}
                <div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",
                    letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>
                    Tu nombre *
                  </div>
                  <input type="text" placeholder="¿Cómo te llamas?"
                    value={nombre} onChange={e=>setNombre(e.target.value)}
                    style={{width:"100%",padding:"12px 14px",
                      background:"rgba(255,255,255,0.04)",
                      border:`1px solid ${nombre?"rgba(232,0,13,0.5)":"rgba(255,255,255,0.12)"}`,
                      color:"#fff",fontSize:15,fontFamily:"'Barlow',sans-serif",
                      outline:"none"}}/>
                </div>

                {/* Tipo contacto */}
                <div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",
                    letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>
                    ¿Cómo prefieres que te contacte? *
                  </div>
                  <div style={{display:"flex",gap:8,marginBottom:10}}>
                    {(["whatsapp","email"] as const).map(t=>(
                      <button key={t} onClick={()=>setTipoContacto(t)}
                        style={{flex:1,padding:"10px",
                          border:`1px solid ${tipoContacto===t?R:"rgba(255,255,255,0.1)"}`,
                          background:tipoContacto===t?`${R}15`:"transparent",
                          color:tipoContacto===t?"#fff":"rgba(255,255,255,0.45)",
                          fontFamily:"'Barlow Condensed',sans-serif",
                          fontSize:13,fontWeight:700,cursor:"pointer",
                          letterSpacing:"0.1em",textTransform:"uppercase",
                          transition:"all 0.15s"}}>
                        {t==="whatsapp"?"📱 WhatsApp":"✉️ Correo"}
                      </button>
                    ))}
                  </div>
                  <input
                    type={tipoContacto==="email"?"email":"tel"}
                    placeholder={tipoContacto==="email"
                      ?"tu@correo.com"
                      :"300 000 0000"}
                    value={contacto} onChange={e=>setContacto(e.target.value)}
                    style={{width:"100%",padding:"12px 14px",
                      background:"rgba(255,255,255,0.04)",
                      border:`1px solid ${contacto?"rgba(232,0,13,0.5)":"rgba(255,255,255,0.12)"}`,
                      color:"#fff",fontSize:15,fontFamily:"'Barlow',sans-serif",
                      outline:"none"}}/>
                </div>

                {/* Aceptación de datos */}
                <label style={{display:"flex",alignItems:"flex-start",
                  gap:12,cursor:"pointer"}}>
                  <div onClick={()=>setAcepta(!acepta)}
                    style={{flexShrink:0,width:20,height:20,marginTop:2,
                      border:`1px solid ${acepta?R:"rgba(255,255,255,0.25)"}`,
                      background:acepta?R:"transparent",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      cursor:"pointer",transition:"all 0.15s"}}>
                    {acepta && <span style={{color:"#fff",fontSize:12,fontWeight:900}}>✓</span>}
                  </div>
                  <span style={{fontSize:12,color:"rgba(255,255,255,0.45)",
                    lineHeight:1.6}}>
                    Autorizo a Coach David a tratar mis datos personales (nombre y contacto)
                    para el envío de información sobre planes de entrenamiento, nutrición y
                    productos digitales, de conformidad con la{" "}
                    <strong style={{color:"rgba(255,255,255,0.65)"}}>
                      Ley 1581 de 2012
                    </strong>{" "}
                    de protección de datos personales de Colombia. Puedo solicitar la
                    eliminación de mis datos en cualquier momento escribiendo a{" "}
                    <span style={{color:R}}>seguimiento.coachdavidc@gmail.com</span>.
                  </span>
                </label>

                {errorForm && (
                  <div style={{padding:"10px 14px",background:`${R}12`,
                    border:`1px solid ${R}35`,fontSize:13,color:"#fca5a5"}}>
                    {errorForm}
                  </div>
                )}

                <button onClick={guardarLead} disabled={enviando}
                  style={{width:"100%",padding:"16px",
                    background:enviando?"rgba(232,0,13,0.4)":R,
                    border:"none",color:"#fff",
                    fontFamily:"'Barlow Condensed',sans-serif",
                    fontSize:15,fontWeight:900,letterSpacing:"0.2em",
                    textTransform:"uppercase",cursor:enviando?"not-allowed":"pointer",
                    transition:"all 0.2s"}}>
                  {enviando?"Registrando...":"Quiero información gratuita →"}
                </button>

                <p style={{fontSize:11,color:"rgba(255,255,255,0.25)",
                  textAlign:"center",lineHeight:1.6}}>
                  Sin spam. Solo información relevante sobre entrenamiento y nutrición.
                  Tus datos no serán compartidos con terceros.
                </p>
              </div>
            </>
          ) : (
            /* Estado enviado */
            <div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",
                fontSize:52,color:"#22c55e",marginBottom:16}}>✓</div>
              <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",
                fontSize:26,fontWeight:900,textTransform:"uppercase",
                marginBottom:10}}>
                ¡Listo, {nombre.split(" ")[0]}!
              </h2>
              <p style={{fontSize:15,color:"rgba(255,255,255,0.5)",
                lineHeight:1.7,maxWidth:380,margin:"0 auto",fontWeight:300}}>
                Recibí tus datos. Coach David se pondrá en contacto contigo pronto
                con información sobre cómo llevar tu entrenamiento al siguiente nivel.
              </p>
              <div style={{marginTop:24,display:"flex",gap:12,
                justifyContent:"center",flexWrap:"wrap"}}>
                <a href="https://wa.me/573243747367" target="_blank"
                  rel="noopener noreferrer"
                  style={{padding:"12px 24px",background:"#22c55e",
                    color:"#fff",textDecoration:"none",
                    fontFamily:"'Barlow Condensed',sans-serif",
                    fontSize:13,fontWeight:900,letterSpacing:"0.15em",
                    textTransform:"uppercase"}}>
                  Escribir por WhatsApp
                </a>
                <a href="https://instagram.com/coachdavidfit" target="_blank"
                  rel="noopener noreferrer"
                  style={{padding:"12px 24px",
                    border:"1px solid rgba(255,255,255,0.15)",
                    color:"rgba(255,255,255,0.6)",textDecoration:"none",
                    fontFamily:"'Barlow Condensed',sans-serif",
                    fontSize:13,fontWeight:900,letterSpacing:"0.15em",
                    textTransform:"uppercase"}}>
                  Seguir en Instagram
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer mini */}
        <div style={{marginTop:48,textAlign:"center",
          borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:24}}>
          <p style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,
            fontWeight:900,marginBottom:4}}>
            COACH<span style={{color:R}}>.</span>DAVID
          </p>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.25)"}}>
            Entrenamiento personalizado basado en ciencia
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",bottom:24,left:"50%",
          transform:"translateX(-50%)",
          padding:"12px 20px",background:"rgba(34,197,94,0.15)",
          border:"1px solid rgba(34,197,94,0.4)",color:"#86efac",
          fontSize:14,zIndex:200,backdropFilter:"blur(8px)",
          whiteSpace:"nowrap",animation:"fadeUp 0.3s ease"}}>
          {toast}
        </div>
      )}
    </div>
  )
}
