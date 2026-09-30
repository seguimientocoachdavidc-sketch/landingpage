"use client"

import { useEffect, useRef, useState } from "react"

/* ══════════════════════════════════════════════════════════
   CONFIGURACIÓN — todo lo que vas a querer cambiar está aquí
   ══════════════════════════════════════════════════════════ */
const R = "#E8000D"
const G = "#22c55e"
const B = "#3b82f6"
const O = "#f59e0b"
const SUPERFICIE = "#0b0b0e"
const TEXTO_2 = "rgba(255,255,255,0.7)"
const TEXTO_3 = "rgba(255,255,255,0.5)"
const LINEA = "rgba(255,255,255,0.09)"

const PRECIOS = {
  entrenamiento: { online: 150000, presencial: 170000 },
  alimentacion:  { online: 140000, presencial: 140000 },
  duo:           { online: 230000, presencial: 250000 },
}

const WHATSAPP = "573243747367"
const INSTAGRAM = "https://www.instagram.com/coachfitdavid"

// Cambia a true cuando la página /ebook-hipertrofia esté publicada con su PDF
const EBOOK_ACTIVO = false
const EBOOK_URL = "/ebook-hipertrofia"

// Testimonios reales, con permiso del cliente. Mientras esté vacío, la sección no aparece.
// Ejemplo: { nombre: "Nombre", logro: "−6 kg en 12 semanas", texto: "…", plan: "Dúo" }
const TESTIMONIOS: { nombre: string; logro: string; texto: string; plan: string }[] = []

const wa = (mensaje: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`
const fmt = (n: number) => `$${n.toLocaleString("es-CO")}`

type Plan = "entrenamiento" | "alimentacion" | "duo"
type Modo = "online" | "presencial"
const NOMBRE_PLAN: Record<Plan, string> = {
  entrenamiento: "Entrenamiento", alimentacion: "Alimentación", duo: "Dúo",
}

const SECCIONES_NAV = [
  { id: "encuentra-tu-plan", label: "Encuentra tu plan" },
  { id: "metodo", label: "Método" },
  { id: "app", label: "La app" },
  { id: "planes", label: "Planes" },
  { id: "quien-soy", label: "Quién soy" },
]

/* ══════════════════════════════════════════════════════════
   PÁGINA
   ══════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <main className="home" style={{ background: "#000", color: "#fff",
      fontFamily: "'Barlow', sans-serif", overflowX: "hidden" }}>
      <Estilos />
      <Nav />
      <Hero />
      <EncuentraTuPlan />
      <Metodo />
      <LaApp />
      <Planes />
      <QuienSoy />
      {TESTIMONIOS.length > 0 && <Testimonios />}
      <EmpiezaGratis />
      <CierreCTA />
      <Footer />
      <BarraMovil />
    </main>
  )
}

/* ── Envoltura de sección: un solo lugar para el espaciado ── */
function Seccion({ id, fondo = "#000", children }: {
  id?: string; fondo?: string; children: React.ReactNode
}) {
  return (
    <section id={id} className="seccion" style={{ background: fondo, borderTop: `1px solid ${LINEA}` }}>
      <div className="contenedor">{children}</div>
    </section>
  )
}

function Encabezado({ titulo, bajada }: { titulo: string; bajada?: string }) {
  return (
    <div style={{ maxWidth: 680, marginBottom: 44 }}>
      <h2 className="bc h2">{titulo}</h2>
      {bajada && (
        <p className="b" style={{ fontSize: 18, color: TEXTO_2, lineHeight: 1.65, fontWeight: 300, marginTop: 16 }}>
          {bajada}
        </p>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   NAV — fija, con sección activa y progreso de lectura
   ══════════════════════════════════════════════════════════ */
function Nav() {
  const [solido, setSolido] = useState(false)
  const [activa, setActiva] = useState<string | null>(null)
  const [abierto, setAbierto] = useState(false)
  const barraRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let pendiente = false
    const onScroll = () => {
      if (pendiente) return
      pendiente = true
      requestAnimationFrame(() => {
        pendiente = false
        const y = window.scrollY
        setSolido(y > 40)
        const total = document.documentElement.scrollHeight - window.innerHeight
        if (barraRef.current) barraRef.current.style.transform = `scaleX(${total > 0 ? y / total : 0})`
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(entradas => {
      entradas.forEach(e => { if (e.isIntersecting) setActiva(e.target.id) })
    }, { rootMargin: "-45% 0px -50% 0px" })
    SECCIONES_NAV.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  return (
    <nav aria-label="Principal" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: solido || abierto ? "rgba(0,0,0,0.92)" : "transparent",
      backdropFilter: solido || abierto ? "blur(12px)" : "none",
      borderBottom: `1px solid ${solido ? LINEA : "transparent"}`,
      transition: "background 0.3s ease, border-color 0.3s ease" }}>
      <div style={{ padding: "0 24px" }}>
        <div className="contenedor" style={{ height: 66, display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 24 }}>
          <a href="#inicio" className="bc" style={{ fontSize: 20, fontWeight: 900, color: "#fff", textDecoration: "none" }}>
            COACH<span style={{ color: R }}>.</span>DAVID
          </a>

          <div className="nav-links" style={{ display: "flex", gap: 26, alignItems: "center" }}>
            {SECCIONES_NAV.map(s => (
              <a key={s.id} href={`#${s.id}`} className="b nav-link"
                aria-current={activa === s.id ? "true" : undefined}
                style={{ color: activa === s.id ? "#fff" : TEXTO_2,
                  borderBottom: `2px solid ${activa === s.id ? R : "transparent"}` }}>
                {s.label}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href={wa("Hola David, quiero información sobre tus programas")} target="_blank"
              rel="noopener noreferrer" className="bc boton boton-rojo nav-cta"
              style={{ padding: "10px 18px", fontSize: 15 }}>
              Escríbeme
            </a>
            <button className="nav-hamburguesa" aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={abierto} onClick={() => setAbierto(a => !a)}
              style={{ background: "none", border: `1px solid ${LINEA}`, color: "#fff",
                width: 42, height: 42, cursor: "pointer", fontSize: 20 }}>
              {abierto ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {abierto && (
        <div className="menu-movil" style={{ padding: "8px 24px 24px", borderTop: `1px solid ${LINEA}` }}>
          {SECCIONES_NAV.map(s => (
            <a key={s.id} href={`#${s.id}`} onClick={() => setAbierto(false)} className="bc"
              style={{ display: "block", padding: "14px 0", fontSize: 24, fontWeight: 800,
                textTransform: "uppercase", color: activa === s.id ? R : "#fff", textDecoration: "none",
                borderBottom: `1px solid ${LINEA}` }}>
              {s.label}
            </a>
          ))}
        </div>
      )}

      <div ref={barraRef} aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: -1,
        height: 2, background: R, transformOrigin: "left", transform: "scaleX(0)" }} />
    </nav>
  )
}

/* ══════════════════════════════════════════════════════════
   HERO — una sola entrada orquestada
   ══════════════════════════════════════════════════════════ */
function Hero() {
  const [entro, setEntro] = useState(false)
  const videoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setEntro(true), 80)
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    // Parallax solo del video, sin volver a renderizar la página
    const onScroll = () => {
      if (reduce || !videoRef.current) return
      const y = window.scrollY
      if (y < window.innerHeight) videoRef.current.style.transform = `translateY(${y * 0.2}px)`
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll) }
  }, [])

  const lineas = [
    { t: "Entrena con", rojo: false },
    { t: "estructura,", rojo: false },
    { t: "no con", rojo: true },
    { t: "intuición.", rojo: false },
  ]
  const aparece = (d: number): React.CSSProperties => ({
    opacity: entro ? 1 : 0, transform: entro ? "none" : "translateY(24px)",
    transition: `opacity 0.8s ease ${d}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${d}s`,
  })

  return (
    <section id="inicio" style={{ position: "relative", minHeight: "100svh", display: "flex",
      alignItems: "center", overflow: "hidden" }}>
      <div ref={videoRef} style={{ position: "absolute", inset: 0, willChange: "transform" }}>
        <video autoPlay loop muted playsInline aria-hidden
          style={{ width: "100%", height: "110%", objectFit: "cover", filter: "grayscale(20%) contrast(1.1)", opacity: 0.45 }}>
          <source src="/0502.mp4" type="video/mp4" />
        </video>
      </div>
      <div style={{ position: "absolute", inset: 0,
        background: "linear-gradient(110deg, #000 35%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.2) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #000 0%, transparent 45%)" }} />

      <div style={{ position: "relative", zIndex: 2, width: "100%", padding: "120px 24px 80px" }}>
        <div className="contenedor">
          <h1 className="bc" style={{ fontSize: "clamp(58px, 10vw, 142px)", fontWeight: 900,
            textTransform: "uppercase", lineHeight: 0.86, letterSpacing: "-0.02em", marginBottom: 32 }}>
            {lineas.map((l, i) => (
              <span key={l.t} style={{ display: "block", color: l.rojo ? R : "#fff", ...aparece(0.2 + i * 0.1) }}>
                {l.t}
              </span>
            ))}
          </h1>

          <p className="b" style={{ fontSize: "clamp(16px, 1.4vw, 19px)", color: TEXTO_2, maxWidth: 500,
            lineHeight: 1.65, fontWeight: 300, marginBottom: 34, ...aparece(0.7) }}>
            Programas de entrenamiento y alimentación basados en evidencia, con una app donde
            registras cada serie y yo ajusto tu plan cada semana.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36, ...aparece(0.85) }}>
            <a href="#encuentra-tu-plan" className="bc boton boton-rojo" style={{ padding: "17px 32px", fontSize: 17 }}>
              Encuentra tu plan
            </a>
            <a href="#planes" className="bc boton boton-borde" style={{ padding: "17px 28px", fontSize: 17 }}>
              Ver planes y precios
            </a>
          </div>

          <ul className="hero-datos" style={{ listStyle: "none", display: "flex", gap: 32, flexWrap: "wrap", ...aparece(1) }}>
            {[
              { n: "8+", t: "años entrenando" },
              { n: "6+", t: "certificaciones" },
              { n: "1 a 1", t: "seguimiento semanal" },
            ].map(d => (
              <li key={d.t} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span className="bc" style={{ fontSize: 30, fontWeight: 900, color: "#fff" }}>{d.n}</span>
                <span className="b" style={{ fontSize: 15, color: TEXTO_3 }}>{d.t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════
   ENCUENTRA TU PLAN — selector de 2 preguntas
   ══════════════════════════════════════════════════════════ */
type Objetivo = "musculo" | "grasa" | "resistencia" | "alimentacion"

const OBJETIVOS: { id: Objetivo; titulo: string; texto: string }[] = [
  { id: "musculo", titulo: "Ganar músculo", texto: "Quiero crecer y ganar fuerza." },
  { id: "grasa", titulo: "Perder grasa", texto: "Quiero bajar grasa sin perder músculo." },
  { id: "resistencia", titulo: "Rendir en mi deporte", texto: "Corro, pedaleo o hago triatlón." },
  { id: "alimentacion", titulo: "Ordenar mi alimentación", texto: "Quiero saber qué y cuánto comer." },
]

function recomendar(obj: Objetivo, modo: Modo): { plan: Plan; razon: string; nota?: string } {
  switch (obj) {
    case "musculo":
      return { plan: "entrenamiento",
        razon: "Para ganar músculo lo decisivo es un programa bien progresado y registrado serie a serie. Si además quieres ordenar lo que comes, el Dúo te sale más barato que tomar los dos planes por separado." }
    case "grasa":
      return { plan: "duo",
        razon: "Perder grasa sin perder músculo pide las dos cosas a la vez: un déficit bien calculado y un entrenamiento que proteja tu músculo. El Dúo las junta en un solo seguimiento." }
    case "resistencia":
      return { plan: "entrenamiento",
        razon: "Trabajo de fuerza y pliometría con transferencia a tu deporte, coordinado con tus sesiones de carrera, bici o natación dentro de la misma app." }
    case "alimentacion":
      return { plan: "alimentacion",
        razon: "Un menú calculado para tu objetivo y una app para registrar lo que comes y ver tu déficit real de la semana.",
        nota: modo === "presencial"
          ? "Las sesiones presenciales van con los planes de entrenamiento. Si también las quieres, el Dúo con presenciales las incluye."
          : undefined }
  }
}

function EncuentraTuPlan() {
  const [objetivo, setObjetivo] = useState<Objetivo | null>(null)
  const [modo, setModo] = useState<Modo | null>(null)
  const resultadoRef = useRef<HTMLDivElement>(null)

  const rec = objetivo && modo ? recomendar(objetivo, modo) : null
  const precio = rec && modo ? PRECIOS[rec.plan][modo] : 0

  useEffect(() => {
    if (rec && resultadoRef.current) resultadoRef.current.focus({ preventScroll: true })
  }, [objetivo, modo]) // eslint-disable-line react-hooks/exhaustive-deps

  const reiniciar = () => { setObjetivo(null); setModo(null) }
  const nombreObjetivo = OBJETIVOS.find(o => o.id === objetivo)?.titulo ?? ""

  return (
    <Seccion id="encuentra-tu-plan" fondo={SUPERFICIE}>
      <Encabezado titulo="Encuentra tu plan en dos preguntas"
        bajada="Responde y te digo qué plan te conviene, cuánto cuesta y cómo empezar." />

      <fieldset style={{ border: "none", marginBottom: 36 }}>
        <legend className="bc" style={{ fontSize: 24, fontWeight: 800, textTransform: "uppercase", marginBottom: 16 }}>
          1. ¿Qué quieres lograr?
        </legend>
        <div className="opciones-grid" style={{ display: "grid", gap: 10 }}>
          {OBJETIVOS.map(o => {
            const sel = objetivo === o.id
            return (
              <button key={o.id} onClick={() => setObjetivo(o.id)} aria-pressed={sel}
                className="opcion"
                style={{ textAlign: "left", padding: "20px 20px", cursor: "pointer", color: "#fff",
                  background: sel ? `${R}1f` : "#000", border: `1px solid ${sel ? R : LINEA}` }}>
                <span className="bc" style={{ display: "block", fontSize: 22, fontWeight: 800, textTransform: "uppercase" }}>
                  {o.titulo}
                </span>
                <span className="b" style={{ display: "block", fontSize: 15, color: TEXTO_3, marginTop: 4 }}>
                  {o.texto}
                </span>
              </button>
            )
          })}
        </div>
      </fieldset>

      {objetivo && (
        <fieldset style={{ border: "none", marginBottom: 36 }}>
          <legend className="bc" style={{ fontSize: 24, fontWeight: 800, textTransform: "uppercase", marginBottom: 16 }}>
            2. ¿Cómo quieres entrenar?
          </legend>
          <div className="modo-grid" style={{ display: "grid", gap: 10 }}>
            {([
              ["online", "Solo online", "Desde cualquier ciudad, con la app y seguimiento por WhatsApp."],
              ["presencial", "Con sesiones presenciales", "Todo lo online más 3 sesiones al mes conmigo en Bogotá."],
            ] as const).map(([id, titulo, texto]) => {
              const sel = modo === id
              return (
                <button key={id} onClick={() => setModo(id)} aria-pressed={sel} className="opcion"
                  style={{ textAlign: "left", padding: "20px", cursor: "pointer", color: "#fff",
                    background: sel ? `${R}1f` : "#000", border: `1px solid ${sel ? R : LINEA}` }}>
                  <span className="bc" style={{ display: "block", fontSize: 22, fontWeight: 800, textTransform: "uppercase" }}>
                    {titulo}
                  </span>
                  <span className="b" style={{ display: "block", fontSize: 15, color: TEXTO_3, marginTop: 4 }}>
                    {texto}
                  </span>
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      {rec && modo && (
        <div ref={resultadoRef} tabIndex={-1} aria-live="polite" className="resultado"
          style={{ border: `1px solid ${R}`, background: "#000", padding: "32px 30px", outline: "none",
            position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: R }} />
          <p className="b" style={{ fontSize: 15, color: TEXTO_3, marginBottom: 8 }}>Tu plan recomendado</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
            flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <h3 className="bc" style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900,
              textTransform: "uppercase", lineHeight: 0.95 }}>
              {NOMBRE_PLAN[rec.plan]}{rec.plan !== "alimentacion" && modo === "presencial" ? " con presenciales" : ""}
            </h3>
            <p>
              <span className="bc" style={{ fontSize: 44, fontWeight: 900 }}>{fmt(precio)}</span>
              <span className="b" style={{ fontSize: 15, color: TEXTO_3 }}> al mes</span>
            </p>
          </div>
          <p className="b" style={{ fontSize: 17, color: TEXTO_2, lineHeight: 1.65, fontWeight: 300, maxWidth: 680 }}>
            {rec.razon}
          </p>
          {rec.nota && (
            <p className="b" style={{ fontSize: 15, color: O, lineHeight: 1.6, marginTop: 12, maxWidth: 680 }}>{rec.nota}</p>
          )}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26, alignItems: "center" }}>
            <a href={wa(`Hola David, hice el test de tu página. Mi objetivo: ${nombreObjetivo}. Me interesa el plan ${NOMBRE_PLAN[rec.plan]}${rec.plan !== "alimentacion" && modo === "presencial" ? " con sesiones presenciales" : " online"}.`)}
              target="_blank" rel="noopener noreferrer" className="bc boton boton-rojo"
              style={{ padding: "16px 28px", fontSize: 17 }}>
              Quiero este plan
            </a>
            <a href="/programas" className="bc boton boton-borde" style={{ padding: "16px 24px", fontSize: 17 }}>
              Comparar todos los planes
            </a>
            <button onClick={reiniciar} className="b"
              style={{ background: "none", border: "none", color: TEXTO_3, fontSize: 15,
                cursor: "pointer", textDecoration: "underline", padding: 8 }}>
              Volver a empezar
            </button>
          </div>
        </div>
      )}
    </Seccion>
  )
}

/* ══════════════════════════════════════════════════════════
   MÉTODO — filosofía y variables en una sola sección
   ══════════════════════════════════════════════════════════ */
function Metodo() {
  const variables = [
    { letra: "V", titulo: "Volumen",
      texto: "Cuántas series efectivas hace cada músculo por semana, ajustadas a tu nivel y a tu capacidad de recuperación." },
    { letra: "I", titulo: "Intensidad",
      texto: "Qué tan cerca del fallo llegas en cada serie. Suficiente para dar estímulo, sin comprometer la recuperación." },
    { letra: "P", titulo: "Progresión",
      texto: "Más carga, más repeticiones o más volumen, planificados semana a semana para que tu cuerpo siga adaptándose." },
  ]
  return (
    <Seccion id="metodo">
      <Encabezado titulo="Un sistema, no una rutina"
        bajada="Si buscas atajos, este no es tu lugar. El progreso sale de controlar tres variables, semana a semana, y de medirlas." />
      <div className="metodo-grid" style={{ display: "grid", gap: 2, marginBottom: 2 }}>
        {variables.map(v => (
          <article key={v.letra} style={{ background: SUPERFICIE, padding: "40px 34px", position: "relative", overflow: "hidden" }}>
            <span aria-hidden className="bc" style={{ position: "absolute", right: 18, top: 4, fontSize: 130,
              fontWeight: 900, lineHeight: 1, color: "rgba(255,255,255,0.04)" }}>
              {v.letra}
            </span>
            <h3 className="bc" style={{ fontSize: 34, fontWeight: 900, textTransform: "uppercase", marginBottom: 12, position: "relative" }}>
              {v.titulo}
            </h3>
            <p className="b" style={{ fontSize: 16, color: TEXTO_2, lineHeight: 1.65, fontWeight: 300, position: "relative" }}>
              {v.texto}
            </p>
            <div style={{ marginTop: 26, width: 32, height: 3, background: R }} />
          </article>
        ))}
      </div>
      <p className="bc" style={{ background: R, padding: "26px 34px", fontSize: "clamp(22px, 2.6vw, 34px)",
        fontWeight: 900, textTransform: "uppercase", lineHeight: 1.1 }}>
        Si no controlas estas variables, no estás entrenando: estás improvisando.
      </p>
    </Seccion>
  )
}

/* ══════════════════════════════════════════════════════════
   LA APP — pestañas entrenamiento / alimentación
   ══════════════════════════════════════════════════════════ */
function LaApp() {
  const [pestana, setPestana] = useState<"entreno" | "comida">("entreno")
  const funciones = pestana === "entreno"
    ? [
        { t: "Cada serie queda registrada", d: "Peso y repeticiones en segundos, con tu última sesión al lado para saber qué superar." },
        { t: "Récords automáticos", d: "Cuando superas tu marca, la app lo detecta y te lo muestra ese mismo día." },
        { t: "Técnica a un toque", d: "Biblioteca de ejercicios y de pliometría con video guía." },
        { t: "Mi nota de cada semana", d: "Siempre visible arriba, con el foco que te dejo después de revisar tus datos." },
      ]
    : [
        { t: "Cerca de 500 alimentos", d: "Colombianos y de marca, para registrar lo que de verdad comes." },
        { t: "Metas en tiempo real", d: "Calorías, proteína, carbohidratos y grasas, más fibra, sodio y otros micronutrientes." },
        { t: "Tu déficit real", d: "Calculado con lo que comiste en la semana, no con una estimación." },
        { t: "Recetario y suplementación", d: "Recetas con video y una guía según tu objetivo." },
      ]

  return (
    <Seccion id="app">
      <Encabezado titulo="Todo tu proceso, en una app"
        bajada="No es un PDF ni una rutina genérica: es una app hecha para que registres, veas tu avance y yo pueda revisarlo." />

      <div role="tablist" aria-label="Módulos de la app" className="pestanas"
        style={{ display: "inline-flex", border: `1px solid ${LINEA}`, padding: 4, marginBottom: 30, background: SUPERFICIE }}>
        {([["entreno", "Entrenamiento"], ["comida", "Alimentación"]] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={pestana === id} aria-controls="panel-app"
            onClick={() => setPestana(id)} className="bc"
            style={{ padding: "12px 26px", fontSize: 17, fontWeight: 800, border: "none", cursor: "pointer",
              background: pestana === id ? "#fff" : "transparent", color: pestana === id ? "#000" : TEXTO_2,
              transition: "background 0.2s ease, color 0.2s ease" }}>
            {label}
          </button>
        ))}
      </div>

      <div id="panel-app" role="tabpanel" className="app-grid" style={{ display: "grid", gap: 44, alignItems: "center" }}>
        <ul style={{ listStyle: "none" }}>
          {funciones.map(f => (
            <li key={f.t} style={{ padding: "18px 0", borderTop: `1px solid ${LINEA}` }}>
              <h3 className="bc" style={{ fontSize: 23, fontWeight: 800, textTransform: "uppercase", marginBottom: 4 }}>{f.t}</h3>
              <p className="b" style={{ fontSize: 16, color: TEXTO_2, lineHeight: 1.6, fontWeight: 300 }}>{f.d}</p>
            </li>
          ))}
        </ul>
        {pestana === "entreno" ? <DemoVolumen /> : <DemoMacros />}
      </div>
    </Seccion>
  )
}

const VOLUMEN_SEMANAS = [
  { s: 1, v: 1240 }, { s: 2, v: 1310 }, { s: 3, v: 1290 }, { s: 4, v: 1480, pr: true },
  { s: 5, v: 1520 }, { s: 6, v: 1610 }, { s: 7, v: 1590 }, { s: 8, v: 1780, pr: true },
]

function DemoVolumen() {
  const [visibles, setVisibles] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let t: ReturnType<typeof setInterval> | undefined
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVisibles(VOLUMEN_SEMANAS.length); return }
      let i = 0
      t = setInterval(() => { i++; setVisibles(i); if (i >= VOLUMEN_SEMANAS.length && t) clearInterval(t) }, 180)
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => { obs.disconnect(); if (t) clearInterval(t) }
  }, [])

  const max = Math.max(...VOLUMEN_SEMANAS.map(x => x.v))
  const mejora = Math.round(((VOLUMEN_SEMANAS[7].v - VOLUMEN_SEMANAS[0].v) / VOLUMEN_SEMANAS[0].v) * 100)
  const completo = visibles >= VOLUMEN_SEMANAS.length

  return (
    <div ref={ref} role="img" aria-label={`Ejemplo de progreso: el volumen de sentadilla sube ${mejora}% en 8 semanas`}
      style={{ background: SUPERFICIE, border: `1px solid ${LINEA}`, padding: "28px 26px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 30 }}>
        <div>
          <div className="bc" style={{ fontSize: 22, fontWeight: 800, textTransform: "uppercase" }}>Sentadilla Smith</div>
          <div className="b" style={{ fontSize: 14, color: TEXTO_3 }}>Volumen por semana</div>
        </div>
        <div style={{ textAlign: "right", opacity: completo ? 1 : 0, transition: "opacity 0.4s ease" }}>
          <div className="bc" style={{ fontSize: 34, fontWeight: 900, color: G, lineHeight: 1 }}>+{mejora}%</div>
          <div className="b" style={{ fontSize: 13, color: TEXTO_3 }}>en 8 semanas</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 190 }}>
        {VOLUMEN_SEMANAS.map((x, i) => {
          const ver = i < visibles
          return (
            <div key={x.s} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column",
              justifyContent: "flex-end", alignItems: "center", position: "relative" }}>
              {x.pr && (
                <span className="bc" style={{ position: "absolute", top: -22, fontSize: 12, fontWeight: 800,
                  color: R, opacity: ver ? 1 : 0, transition: "opacity 0.3s ease" }}>Récord</span>
              )}
              <div style={{ width: "100%", height: ver ? `${(x.v / max) * 100}%` : "0%",
                background: x.pr ? R : "rgba(255,255,255,0.18)",
                transition: "height 0.5s cubic-bezier(0.22,1,0.36,1)" }} />
              <span className="bc" style={{ fontSize: 12, color: TEXTO_3, marginTop: 8 }}>S{x.s}</span>
            </div>
          )
        })}
      </div>
      <p className="b" style={{ fontSize: 13, color: TEXTO_3, marginTop: 18 }}>
        Ejemplo de la vista de progreso de la app.
      </p>
    </div>
  )
}

const ALIMENTOS_DEMO = [
  { id: 1, nombre: "Pechuga de pollo 150g", kcal: 246, p: 44.6, c: 0.3, g: 7.4 },
  { id: 2, nombre: "Arroz blanco 200g", kcal: 322, p: 4.6, c: 65.0, g: 4.2 },
  { id: 3, nombre: "Aguacate 50g", kcal: 111, p: 0.7, c: 6.8, g: 8.2 },
  { id: 4, nombre: "Whey protein, 1 scoop", kcal: 120, p: 24.0, c: 3.0, g: 1.0 },
]
const META_DEMO = { kcal: 2100, p: 160, c: 220, g: 65 }

function DemoMacros() {
  const [sel, setSel] = useState<number[]>([1])
  const toggle = (id: number) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const t = ALIMENTOS_DEMO.filter(a => sel.includes(a.id)).reduce(
    (acc, a) => ({ kcal: acc.kcal + a.kcal, p: acc.p + a.p, c: acc.c + a.c, g: acc.g + a.g }),
    { kcal: 0, p: 0, c: 0, g: 0 })
  const barras = [
    { l: "Calorías", v: t.kcal, m: META_DEMO.kcal, u: " kcal", c: "#fff" },
    { l: "Proteína", v: t.p, m: META_DEMO.p, u: " g", c: G },
    { l: "Carbohidratos", v: t.c, m: META_DEMO.c, u: " g", c: B },
    { l: "Grasas", v: t.g, m: META_DEMO.g, u: " g", c: O },
  ]
  return (
    <div style={{ background: SUPERFICIE, border: `1px solid ${LINEA}`, padding: "26px 24px" }}>
      <p className="b" style={{ fontSize: 14, color: TEXTO_3, marginBottom: 14 }}>
        Pruébalo: toca los alimentos para sumarlos a tu día.
      </p>
      <div style={{ display: "grid", gap: 8, marginBottom: 22 }}>
        {ALIMENTOS_DEMO.map(a => {
          const activo = sel.includes(a.id)
          return (
            <button key={a.id} onClick={() => toggle(a.id)} aria-pressed={activo}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left",
                padding: "12px 14px", cursor: "pointer", color: "#fff",
                background: activo ? `${R}18` : "#000", border: `1px solid ${activo ? R + "70" : LINEA}` }}>
              <span className="bc" style={{ fontSize: 17, fontWeight: 700 }}>{a.nombre}</span>
              <span className="b" style={{ fontSize: 13, color: activo ? "#fff" : TEXTO_3 }}>
                {activo ? "Agregado" : `${a.kcal} kcal`}
              </span>
            </button>
          )
        })}
      </div>
      <div aria-live="polite" style={{ display: "grid", gap: 14 }}>
        {barras.map(b => (
          <div key={b.l}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span className="b" style={{ fontSize: 14, color: TEXTO_2 }}>{b.l}</span>
              <span className="bc" style={{ fontSize: 15, fontWeight: 700, color: b.c }}>
                {Math.round(b.v)}{b.u}<span style={{ color: TEXTO_3, fontWeight: 500 }}> de {b.m}{b.u}</span>
              </span>
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.08)" }}>
              <div style={{ height: "100%", width: `${Math.min((b.v / b.m) * 100, 100)}%`, background: b.c,
                transition: "width 0.4s cubic-bezier(0.22,1,0.36,1)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   PLANES — resumen, el detalle vive en /programas
   ══════════════════════════════════════════════════════════ */
function Planes() {
  const planes: { id: Plan; para: string; color: string; destacado?: boolean }[] = [
    { id: "entrenamiento", para: "Programa personalizado, registro de cada serie y mi revisión semanal.", color: R },
    { id: "alimentacion", para: "Menú calculado para tu objetivo y app de registro de comidas.", color: G },
    { id: "duo", para: "Entrenamiento y alimentación juntos, con un solo seguimiento.", color: O, destacado: true },
  ]
  const ahorro = PRECIOS.entrenamiento.online + PRECIOS.alimentacion.online - PRECIOS.duo.online
  return (
    <Seccion id="planes" fondo={SUPERFICIE}>
      <Encabezado titulo="Planes"
        bajada={`Mensuales y con seguimiento 1 a 1. Con sesiones presenciales en Bogotá, Entrenamiento desde ${fmt(PRECIOS.entrenamiento.presencial)} y Dúo desde ${fmt(PRECIOS.duo.presencial)}.`} />
      <div className="planes-grid" style={{ display: "grid", gap: 16, marginBottom: 28 }}>
        {planes.map(p => (
          <article key={p.id} style={{ position: "relative", padding: "30px 26px", display: "flex", flexDirection: "column",
            background: "#000", border: `1px solid ${p.destacado ? p.color : LINEA}` }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: p.color }} />
            {p.destacado && (
              <span className="bc" style={{ position: "absolute", top: 14, right: 16, fontSize: 14, fontWeight: 800, color: p.color }}>
                Mejor valor
              </span>
            )}
            <h3 className="bc" style={{ fontSize: 30, fontWeight: 900, textTransform: "uppercase", marginBottom: 8 }}>
              {NOMBRE_PLAN[p.id]}
            </h3>
            <p className="b" style={{ fontSize: 16, color: TEXTO_2, lineHeight: 1.55, fontWeight: 300, flex: 1, marginBottom: 20 }}>
              {p.para}
            </p>
            <p style={{ marginBottom: 6 }}>
              <span className="bc" style={{ fontSize: 42, fontWeight: 900 }}>{fmt(PRECIOS[p.id].online)}</span>
              <span className="b" style={{ fontSize: 14, color: TEXTO_3 }}> al mes</span>
            </p>
            <p className="b" style={{ fontSize: 14, color: G, minHeight: 22, marginBottom: 18 }}>
              {p.id === "duo" ? `Ahorras ${fmt(ahorro)} al mes` : ""}
            </p>
            <a href={wa(`Hola David, me interesa el plan ${NOMBRE_PLAN[p.id]}`)} target="_blank" rel="noopener noreferrer"
              className="bc boton" style={{ padding: "15px", fontSize: 17, textAlign: "center",
                background: p.destacado ? p.color : "transparent", color: p.destacado ? "#000" : "#fff",
                border: `1px solid ${p.destacado ? p.color : "rgba(255,255,255,0.35)"}` }}>
              Quiero el plan {NOMBRE_PLAN[p.id]}
            </a>
          </article>
        ))}
      </div>
      <a href="/programas" className="b enlace">Ver qué incluye cada plan y la opción con presenciales</a>
    </Seccion>
  )
}

/* ══════════════════════════════════════════════════════════
   QUIÉN SOY
   ══════════════════════════════════════════════════════════ */
function QuienSoy() {
  const formacion = [
    "Técnico en entrenamiento en gimnasio",
    "Técnico en entrenamiento personalizado",
    "Certificaciones nacionales e internacionales",
    "Especialización en Econometría",
  ]
  return (
    <section id="quien-soy" className="quien" style={{ display: "grid", borderTop: `1px solid ${LINEA}` }}>
      <div className="quien-foto" style={{ position: "relative", overflow: "hidden", background: SUPERFICIE }}>
        <img src="/Entrenando_1.jpeg" alt="Coach David entrenando en el gimnasio"
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(20%) contrast(1.05)", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, #000)" }} />
        <div aria-hidden style={{ position: "absolute", top: 24, left: 24, width: 36, height: 36,
          borderTop: `2px solid ${R}`, borderLeft: `2px solid ${R}` }} />
        <div aria-hidden style={{ position: "absolute", bottom: 24, left: 24, width: 36, height: 36,
          borderBottom: `2px solid ${R}`, borderLeft: `2px solid ${R}` }} />
      </div>
      <div className="quien-texto" style={{ padding: "88px 64px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h2 className="bc h2" style={{ marginBottom: 20 }}>Quién te entrena</h2>
        <p className="b" style={{ fontSize: 18, color: TEXTO_2, lineHeight: 1.7, fontWeight: 300, marginBottom: 16, maxWidth: 560 }}>
          Soy David. Me formé como entrenador y también en análisis de datos, y esa mezcla define cómo trabajo:
          cada serie, cada comida y cada medida queda registrada, y los ajustes a tu plan salen de esos datos.
        </p>
        <p className="b" style={{ fontSize: 18, color: TEXTO_2, lineHeight: 1.7, fontWeight: 300, marginBottom: 30, maxWidth: 560 }}>
          Construí la app que vas a usar para poder hacerle seguimiento real a cada persona que entreno.
        </p>
        <ul style={{ listStyle: "none", borderLeft: `2px solid ${R}`, paddingLeft: 22, marginBottom: 30 }}>
          {formacion.map(f => (
            <li key={f} className="bc" style={{ fontSize: 20, fontWeight: 700, textTransform: "uppercase", padding: "7px 0" }}>{f}</li>
          ))}
        </ul>
        <a href="/sobre-mi" className="b enlace">Conoce mi historia</a>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════
   TESTIMONIOS — solo aparece cuando hay datos reales
   ══════════════════════════════════════════════════════════ */
function Testimonios() {
  return (
    <Seccion id="resultados">
      <Encabezado titulo="Resultados de quienes ya entrenan conmigo" />
      <div className="planes-grid" style={{ display: "grid", gap: 16, marginBottom: 18 }}>
        {TESTIMONIOS.map(t => (
          <figure key={t.nombre} style={{ background: SUPERFICIE, border: `1px solid ${LINEA}`, padding: "28px 26px" }}>
            <p className="bc" style={{ fontSize: 30, fontWeight: 900, color: R, marginBottom: 12 }}>{t.logro}</p>
            <blockquote className="b" style={{ fontSize: 17, color: TEXTO_2, lineHeight: 1.6, fontWeight: 300, marginBottom: 18 }}>
              {t.texto}
            </blockquote>
            <figcaption className="b" style={{ fontSize: 15 }}>
              {t.nombre} <span style={{ color: TEXTO_3 }}>, plan {t.plan}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="b" style={{ fontSize: 13, color: TEXTO_3 }}>
        Los resultados varían según la constancia, la alimentación y las características de cada persona.
      </p>
    </Seccion>
  )
}

/* ══════════════════════════════════════════════════════════
   EMPIEZA GRATIS — el escalón para quien aún no compra
   ══════════════════════════════════════════════════════════ */
function EmpiezaGratis() {
  return (
    <Seccion id="gratis">
      <Encabezado titulo="¿Aún no estás listo? Empieza gratis"
        bajada="Comparto contenido basado en evidencia para que entrenes mejor desde hoy, trabajes o no conmigo." />
      <div className={EBOOK_ACTIVO ? "gratis-grid" : undefined}
        style={{ display: "grid", gap: 16, maxWidth: EBOOK_ACTIVO ? undefined : 640 }}>
        <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="tarjeta-enlace"
          style={{ display: "block", padding: "30px 28px", background: SUPERFICIE, border: `1px solid ${LINEA}`,
            color: "#fff", textDecoration: "none" }}>
          <h3 className="bc" style={{ fontSize: 28, fontWeight: 900, textTransform: "uppercase", marginBottom: 8 }}>
            Sígueme en Instagram
          </h3>
          <p className="b" style={{ fontSize: 16, color: TEXTO_2, lineHeight: 1.6, fontWeight: 300, marginBottom: 18 }}>
            Técnica, programación y nutrición explicadas con estudios, y lo que yo mismo entreno y como cada día.
          </p>
          <span className="bc" style={{ fontSize: 18, fontWeight: 800, color: R }}>@coachfitdavid</span>
        </a>
        {EBOOK_ACTIVO && (
          <a href={EBOOK_URL} className="tarjeta-enlace"
            style={{ display: "block", padding: "30px 28px", background: SUPERFICIE, border: `1px solid ${LINEA}`,
              color: "#fff", textDecoration: "none" }}>
            <h3 className="bc" style={{ fontSize: 28, fontWeight: 900, textTransform: "uppercase", marginBottom: 8 }}>
              Ebook gratis: Hipertrofia basada en ciencia
            </h3>
            <p className="b" style={{ fontSize: 16, color: TEXTO_2, lineHeight: 1.6, fontWeight: 300, marginBottom: 18 }}>
              La guía corta con lo que de verdad funciona para ganar músculo. Déjame tu correo y te la envío.
            </p>
            <span className="bc" style={{ fontSize: 18, fontWeight: 800, color: R }}>Descargar gratis</span>
          </a>
        )}
      </div>
    </Seccion>
  )
}

/* ══════════════════════════════════════════════════════════
   CTA FINAL + FOOTER
   ══════════════════════════════════════════════════════════ */
function CierreCTA() {
  return (
    <section style={{ background: R, padding: "80px 24px" }}>
      <div className="contenedor" style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 32, flexWrap: "wrap" }}>
        <h2 className="bc" style={{ fontSize: "clamp(40px, 6vw, 76px)", fontWeight: 900, textTransform: "uppercase",
          lineHeight: 0.9, maxWidth: 640 }}>
          Entrenar bien no es opcional
        </h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="#encuentra-tu-plan" className="bc boton" style={{ padding: "17px 28px", fontSize: 17,
            background: "#000", color: "#fff", border: "1px solid #000" }}>
            Encuentra tu plan
          </a>
          <a href={wa("Hola David, quiero empezar un plan")} target="_blank" rel="noopener noreferrer"
            className="bc boton" style={{ padding: "17px 28px", fontSize: 17, background: "transparent",
              color: "#fff", border: "1px solid rgba(255,255,255,0.8)" }}>
            Escríbeme por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const columnas = [
    { titulo: "Explorar", links: SECCIONES_NAV.map(s => ({ label: s.label, href: `#${s.id}` })) },
    { titulo: "Servicios", links: [
      { label: "Planes y precios", href: "/programas" },
      { label: "Pagos", href: "/pagos" },
      { label: "Sobre mí", href: "/sobre-mi" },
    ] },
    { titulo: "Contacto", links: [
      { label: "WhatsApp", href: wa("Hola David") },
      { label: "Instagram", href: INSTAGRAM },
    ] },
  ]
  return (
    <footer style={{ padding: "64px 24px 40px", borderTop: `1px solid ${LINEA}` }}>
      <div className="contenedor">
        <div className="footer-grid" style={{ display: "grid", gap: 36, marginBottom: 48 }}>
          <div>
            <p className="bc" style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>
              COACH<span style={{ color: R }}>.</span>DAVID
            </p>
            <p className="b" style={{ fontSize: 15, color: TEXTO_3, lineHeight: 1.6, maxWidth: 280 }}>
              Entrenamiento y alimentación basados en evidencia. Bogotá, Colombia.
            </p>
          </div>
          {columnas.map(c => (
            <div key={c.titulo}>
              <p className="bc" style={{ fontSize: 17, fontWeight: 800, textTransform: "uppercase", marginBottom: 12 }}>{c.titulo}</p>
              <ul style={{ listStyle: "none", display: "grid", gap: 9 }}>
                {c.links.map(l => (
                  <li key={l.label}>
                    <a href={l.href} className="b nav-link" style={{ borderBottom: "none" }}
                      {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="b" style={{ fontSize: 13, color: TEXTO_3 }}>© {new Date().getFullYear()} Coach David</p>
      </div>
    </footer>
  )
}

function BarraMovil() {
  return (
    <div className="barra-movil" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 110, gap: 10,
      padding: "10px 14px calc(10px + env(safe-area-inset-bottom))", background: "rgba(0,0,0,0.95)",
      borderTop: `1px solid ${LINEA}` }}>
      <a href="#encuentra-tu-plan" className="bc boton boton-borde" style={{ flex: 1, padding: 13, fontSize: 16, textAlign: "center" }}>
        Encuentra tu plan
      </a>
      <a href={wa("Hola David, quiero información sobre tus programas")} target="_blank" rel="noopener noreferrer"
        className="bc boton boton-rojo" style={{ flex: 1, padding: 13, fontSize: 16, textAlign: "center" }}>
        WhatsApp
      </a>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   ESTILOS
   ══════════════════════════════════════════════════════════ */
function Estilos() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;700;800;900&family=Barlow:wght@300;400;500&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      html{scroll-behavior:smooth;scroll-padding-top:74px}
      ::selection{background:${R};color:#fff}
      .bc{font-family:'Barlow Condensed',Impact,sans-serif}
      .b{font-family:'Barlow',sans-serif}
      button{font-family:inherit}
      .contenedor{max-width:1200px;margin:0 auto}
      .seccion{padding:96px 24px}
      .h2{font-size:clamp(38px,5vw,64px);font-weight:900;text-transform:uppercase;line-height:0.92;letter-spacing:-0.01em}

      .boton{display:inline-block;text-decoration:none;font-weight:800;letter-spacing:0.02em;
        transition:background 0.2s ease,border-color 0.2s ease,transform 0.15s ease}
      .boton:active{transform:translateY(1px)}
      .boton-rojo{background:${R};color:#fff;border:1px solid ${R}}
      .boton-rojo:hover{background:#ff1a26}
      .boton-borde{background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.45)}
      .boton-borde:hover{border-color:#fff}
      .nav-link{font-size:15px;text-decoration:none;padding:6px 0;color:${TEXTO_2};transition:color 0.2s ease}
      .nav-link:hover{color:#fff}
      .enlace{color:#fff;font-size:16px;text-decoration:underline;text-decoration-color:${R};
        text-underline-offset:5px;text-decoration-thickness:2px}
      .opcion{transition:border-color 0.2s ease,background 0.2s ease}
      .opcion:hover{border-color:rgba(255,255,255,0.4) !important}
      .tarjeta-enlace{transition:border-color 0.2s ease}
      .tarjeta-enlace:hover{border-color:${R} !important}

      a:focus-visible,button:focus-visible,.resultado:focus-visible{outline:2px solid #fff;outline-offset:3px}

      .nav-hamburguesa{display:none}
      .barra-movil{display:none}
      .opciones-grid{grid-template-columns:repeat(4,1fr)}
      .modo-grid{grid-template-columns:repeat(2,1fr);max-width:760px}
      .metodo-grid{grid-template-columns:repeat(3,1fr)}
      .app-grid{grid-template-columns:1fr 1.1fr}
      .planes-grid{grid-template-columns:repeat(3,1fr)}
      .quien{grid-template-columns:1fr 1fr;min-height:640px}
      .gratis-grid{grid-template-columns:repeat(2,1fr)}
      .footer-grid{grid-template-columns:1.4fr 1fr 1fr 1fr}

      @media (max-width:1000px){
        .nav-links{display:none !important}
        .nav-hamburguesa{display:block}
        .opciones-grid{grid-template-columns:repeat(2,1fr)}
        .app-grid,.quien{grid-template-columns:1fr}
        .quien-foto{height:380px}
        .quien-texto{padding:64px 24px !important}
        .footer-grid{grid-template-columns:1fr 1fr}
      }
      @media (max-width:720px){
        .seccion{padding:68px 24px}
        .nav-cta{display:none !important}
        .opciones-grid,.modo-grid,.metodo-grid,.planes-grid,.gratis-grid{grid-template-columns:1fr}
        .barra-movil{display:flex}
        .home{padding-bottom:78px}
        .pestanas{display:flex !important;width:100%}
        .pestanas button{flex:1}
        .hero-datos{gap:20px !important}
      }
      @media (prefers-reduced-motion:reduce){
        html{scroll-behavior:auto}
        *{animation-duration:0.01ms !important;transition-duration:0.01ms !important}
      }
    `}</style>
  )
}
