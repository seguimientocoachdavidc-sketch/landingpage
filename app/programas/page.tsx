"use client"

import { useEffect, useRef, useState } from "react"

/* ── Identidad de marca (consistente con el resto de la app) ── */
const R = "#E8000D"
const G = "#22c55e"
const B = "#3b82f6"
const O = "#f59e0b"
const NEGRO = "#050507"
const TEXTO_2 = "rgba(255,255,255,0.68)"   // texto secundario legible
const TEXTO_3 = "rgba(255,255,255,0.5)"    // notas y detalles
const LINEA = "rgba(255,255,255,0.09)"

/* ── Precios — cámbialos aquí y toda la página se actualiza ── */
const PRECIOS = {
  entrenamiento: { online: 150000, presencial: 170000 },
  alimentacion:  { online: 140000, presencial: 140000 },
  duo:           { online: 230000, presencial: 250000 },
}

const WHATSAPP = "573243747367"
const wa = (mensaje: string) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`
const fmt = (n: number) => `$${n.toLocaleString("es-CO")}`

type Modo = "online" | "presencial"

/* ══════════════════════════════════════════════════════════
   DATOS DE LOS DEMOS (ilustrativos)
   ══════════════════════════════════════════════════════════ */
const VOLUMEN_SEMANAS = [
  { semana: 1, volumen: 1240 },
  { semana: 2, volumen: 1310 },
  { semana: 3, volumen: 1290 },
  { semana: 4, volumen: 1480, pr: true },
  { semana: 5, volumen: 1520 },
  { semana: 6, volumen: 1610 },
  { semana: 7, volumen: 1590 },
  { semana: 8, volumen: 1780, pr: true },
]

const ALIMENTOS_DEMO = [
  { id: 1, nombre: "Pechuga de pollo 150g",  kcal: 246, p: 44.6, c: 0.3,  g: 7.4 },
  { id: 2, nombre: "Arroz blanco 200g",      kcal: 322, p: 4.6,  c: 65.0, g: 4.2 },
  { id: 3, nombre: "Aguacate 50g",           kcal: 111, p: 0.7,  c: 6.8,  g: 8.2 },
  { id: 4, nombre: "Whey protein, 1 scoop",  kcal: 120, p: 24.0, c: 3.0,  g: 1.0 },
]
const META_DEMO = { kcal: 2100, p: 160, c: 220, g: 65 }

/* ══════════════════════════════════════════════════════════
   PÁGINA
   ══════════════════════════════════════════════════════════ */
export default function ProgramasPage() {
  return (
    <div style={{ background: NEGRO, minHeight: "100vh", color: "#fff",
      fontFamily: "'Barlow', sans-serif", overflowX: "hidden" }} className="pagina">
      <Estilos />
      <Nav />
      <Hero />
      <ComoFunciona />
      <DemoAlimentacion />
      <QuienTeEntrena />
      <SeccionPlanes />
      <Preguntas />
      <CierreCTA />
      <Footer />
      <BarraMovil />
    </div>
  )
}

/* ── Envoltura común de sección (un solo lugar para el espaciado) ── */
function Seccion({ id, children, borde = true }: {
  id?: string; children: React.ReactNode; borde?: boolean
}) {
  return (
    <section id={id} className="seccion"
      style={{ borderTop: borde ? `1px solid ${LINEA}` : "none" }}>
      <div className="contenedor">{children}</div>
    </section>
  )
}

function TituloSeccion({ titulo, bajada }: { titulo: string; bajada?: string }) {
  return (
    <div style={{ marginBottom: 40, maxWidth: 640 }}>
      <h2 className="bc h2">{titulo}</h2>
      {bajada && (
        <p className="b" style={{ fontSize: 17, color: TEXTO_2, lineHeight: 1.65,
          marginTop: 14, fontWeight: 300 }}>
          {bajada}
        </p>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   NAV
   ══════════════════════════════════════════════════════════ */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100,
      background: scrolled ? "rgba(5,5,7,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: `1px solid ${scrolled ? LINEA : "transparent"}`,
      transition: "background 0.3s ease, border-color 0.3s ease" }}>
      <div style={{ padding: "16px 24px" }}>
      <div className="contenedor" style={{ display: "flex",
        alignItems: "center", justifyContent: "space-between", gap: 24 }}>
        <a href="/" className="bc" style={{ fontSize: 19, fontWeight: 900, color: "#fff",
          textDecoration: "none" }}>
          COACH<span style={{ color: R }}>.</span>DAVID
        </a>
        <div className="nav-links" style={{ display: "flex", gap: 28, alignItems: "center" }}>
          <a href="#como-funciona" className="nav-link b">Cómo funciona</a>
          <a href="#planes" className="nav-link b">Planes</a>
          <a href="#preguntas" className="nav-link b">Preguntas</a>
        </div>
        <a href="#planes" className="bc boton boton-rojo nav-cta" style={{ padding: "10px 20px", fontSize: 14 }}>
          Ver planes
        </a>
      </div>
      </div>
    </nav>
  )
}

/* ══════════════════════════════════════════════════════════
   HERO — el producto funcionando es lo primero que se ve
   ══════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <header style={{ padding: "64px 24px 88px" }}>
      <div className="contenedor hero-grid" style={{ display: "grid", gap: 56, alignItems: "center" }}>
      <div>
        <h1 className="bc" style={{ fontSize: "clamp(40px, 5.6vw, 70px)", fontWeight: 900,
          textTransform: "uppercase", lineHeight: 0.95, letterSpacing: "-0.015em",
          marginBottom: 24 }}>
          Entrena con un plan hecho para ti y mira tu progreso semana a semana
        </h1>
        <p className="b" style={{ fontSize: 18, color: TEXTO_2, lineHeight: 1.65,
          fontWeight: 300, maxWidth: 520, marginBottom: 34 }}>
          Programas de entrenamiento y alimentación basados en evidencia, con una app donde
          registras cada serie y cada comida. Yo reviso tu avance y ajusto tu plan cada semana.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
          <a href="#planes" className="bc boton boton-rojo" style={{ padding: "16px 30px", fontSize: 16 }}>
            Ver planes y precios
          </a>
          <a href={wa("Hola David, quiero información sobre tus programas")}
            target="_blank" rel="noopener noreferrer"
            className="bc boton boton-borde" style={{ padding: "16px 26px", fontSize: 16 }}>
            Escríbeme por WhatsApp
          </a>
        </div>
        <p className="b" style={{ fontSize: 14, color: TEXTO_3 }}>
          Planes desde {fmt(PRECIOS.alimentacion.online)} al mes. Sin descargar nada: la app abre en tu celular.
        </p>
      </div>
      <GraficoProgreso />
      </div>
    </header>
  )
}

/* ── Gráfico de volumen: la única animación automática de la página ── */
function GraficoProgreso() {
  const [visibles, setVisibles] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let t: ReturnType<typeof setInterval> | undefined
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      obs.disconnect()
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setVisibles(VOLUMEN_SEMANAS.length); return
      }
      let i = 0
      t = setInterval(() => {
        i++; setVisibles(i)
        if (i >= VOLUMEN_SEMANAS.length && t) clearInterval(t)
      }, 200)
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => { obs.disconnect(); if (t) clearInterval(t) }
  }, [])

  const maxVol = Math.max(...VOLUMEN_SEMANAS.map(s => s.volumen))
  const primero = VOLUMEN_SEMANAS[0].volumen
  const ultimo = VOLUMEN_SEMANAS[VOLUMEN_SEMANAS.length - 1].volumen
  const mejora = Math.round(((ultimo - primero) / primero) * 100)
  const completo = visibles >= VOLUMEN_SEMANAS.length

  return (
    <div ref={ref} style={{ border: `1px solid ${LINEA}`, background: "#0b0b0e",
      padding: "28px 26px 22px", position: "relative" }}
      role="img" aria-label={`Ejemplo de gráfico de progreso: el volumen de sentadilla sube ${mejora}% en 8 semanas`}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 56, height: 3, background: R }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        gap: 16, marginBottom: 30 }}>
        <div>
          <div className="bc" style={{ fontSize: 22, fontWeight: 800, textTransform: "uppercase" }}>
            Sentadilla Smith
          </div>
          <div className="b" style={{ fontSize: 13, color: TEXTO_3, marginTop: 2 }}>
            Volumen por semana
          </div>
        </div>
        <div style={{ textAlign: "right", opacity: completo ? 1 : 0, transition: "opacity 0.4s ease" }}>
          <div className="bc" style={{ fontSize: 34, fontWeight: 900, color: G, lineHeight: 1 }}>
            +{mejora}%
          </div>
          <div className="b" style={{ fontSize: 12, color: TEXTO_3 }}>en 8 semanas</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 190 }}>
        {VOLUMEN_SEMANAS.map((s, i) => {
          const mostrar = i < visibles
          return (
            <div key={s.semana} style={{ flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", height: "100%", justifyContent: "flex-end", position: "relative" }}>
              {s.pr && (
                <div className="bc" style={{ position: "absolute", top: -22, fontSize: 11,
                  fontWeight: 800, color: R, opacity: mostrar ? 1 : 0, transition: "opacity 0.3s ease" }}>
                  Récord
                </div>
              )}
              <div style={{ width: "100%",
                height: mostrar ? `${(s.volumen / maxVol) * 100}%` : "0%",
                background: s.pr ? R : "rgba(255,255,255,0.18)",
                transition: "height 0.55s cubic-bezier(0.22,1,0.36,1)" }} />
              <span className="bc" style={{ fontSize: 11, color: TEXTO_3, marginTop: 8 }}>S{s.semana}</span>
            </div>
          )
        })}
      </div>

      <p className="b" style={{ fontSize: 13, color: TEXTO_3, marginTop: 20, lineHeight: 1.55 }}>
        Ejemplo de la vista de progreso de tu app. Cuando superas tu marca, la app lo detecta
        y te lo muestra ese mismo día.
      </p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   CÓMO FUNCIONA — es un proceso real, por eso va numerado
   ══════════════════════════════════════════════════════════ */
function ComoFunciona() {
  const pasos = [
    { titulo: "Me cuentas tu objetivo",
      texto: "Por WhatsApp hablamos de tu nivel, tu disponibilidad y lo que quieres lograr." },
    { titulo: "Armo tu plan y te doy acceso",
      texto: "Recibes tu link personal a la app con tu programa, tus metas y tus videos guía." },
    { titulo: "Registras y yo ajusto",
      texto: "Anotas cada serie y cada comida. Cada semana reviso tus datos y te dejo una nota con el foco." },
  ]
  return (
    <Seccion id="como-funciona">
      <TituloSeccion titulo="Cómo funciona" />
      <ol className="pasos-grid" style={{ listStyle: "none", display: "grid", gap: 20 }}>
        {pasos.map((p, i) => (
          <li key={p.titulo} style={{ borderTop: `2px solid ${i === 0 ? R : LINEA}`, paddingTop: 20 }}>
            <div className="bc" style={{ fontSize: 44, fontWeight: 900, color: i === 0 ? R : "rgba(255,255,255,0.22)",
              lineHeight: 1, marginBottom: 12 }}>
              {i + 1}
            </div>
            <h3 className="bc" style={{ fontSize: 24, fontWeight: 800, textTransform: "uppercase",
              marginBottom: 8 }}>
              {p.titulo}
            </h3>
            <p className="b" style={{ fontSize: 15.5, color: TEXTO_2, lineHeight: 1.6, fontWeight: 300 }}>
              {p.texto}
            </p>
          </li>
        ))}
      </ol>
    </Seccion>
  )
}

/* ══════════════════════════════════════════════════════════
   DEMO ALIMENTACIÓN — registrador interactivo
   ══════════════════════════════════════════════════════════ */
function DemoAlimentacion() {
  const [sel, setSel] = useState<number[]>([1])
  const toggle = (id: number) =>
    setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const t = ALIMENTOS_DEMO.filter(a => sel.includes(a.id)).reduce(
    (acc, a) => ({ kcal: acc.kcal + a.kcal, p: acc.p + a.p, c: acc.c + a.c, g: acc.g + a.g }),
    { kcal: 0, p: 0, c: 0, g: 0 })

  const barras = [
    { label: "Calorías", val: t.kcal, meta: META_DEMO.kcal, unit: " kcal", color: "#fff" },
    { label: "Proteína", val: t.p,    meta: META_DEMO.p,    unit: " g",    color: G },
    { label: "Carbohidratos", val: t.c, meta: META_DEMO.c,  unit: " g",    color: B },
    { label: "Grasas",   val: t.g,    meta: META_DEMO.g,    unit: " g",    color: O },
  ]

  return (
    <Seccion>
      <TituloSeccion titulo="Registrar tu comida toma segundos"
        bajada="Pruébalo: toca los alimentos y mira cómo se llenan tus metas del día, igual que en la app." />
      <div className="macros-grid" style={{ display: "grid", gap: 36, alignItems: "start",
        border: `1px solid ${LINEA}`, background: "#0b0b0e", padding: "28px 26px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ALIMENTOS_DEMO.map(a => {
            const activo = sel.includes(a.id)
            return (
              <button key={a.id} onClick={() => toggle(a.id)} aria-pressed={activo}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", textAlign: "left", cursor: "pointer", color: "#fff",
                  background: activo ? `${R}18` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${activo ? R + "70" : LINEA}` }}>
                <span>
                  <span className="bc" style={{ display: "block", fontSize: 17, fontWeight: 700 }}>
                    {a.nombre}
                  </span>
                  <span className="b" style={{ display: "block", fontSize: 12.5, color: TEXTO_3, marginTop: 2 }}>
                    {a.kcal} kcal, {a.p} g de proteína
                  </span>
                </span>
                <span aria-hidden style={{ fontSize: 20, color: activo ? R : "rgba(255,255,255,0.3)",
                  marginLeft: 12 }}>
                  {activo ? "✓" : "+"}
                </span>
              </button>
            )
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }} aria-live="polite">
          {barras.map(b => {
            const pct = Math.min(Math.round((b.val / b.meta) * 100), 100)
            return (
              <div key={b.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span className="b" style={{ fontSize: 14, color: TEXTO_2 }}>{b.label}</span>
                  <span className="bc" style={{ fontSize: 15, fontWeight: 700, color: b.color }}>
                    {Math.round(b.val)}{b.unit}
                    <span style={{ color: TEXTO_3, fontWeight: 500 }}> de {b.meta}{b.unit}</span>
                  </span>
                </div>
                <div style={{ height: 9, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: b.color,
                    transition: "width 0.4s cubic-bezier(0.22,1,0.36,1)" }} />
                </div>
              </div>
            )
          })}
          <p className="b" style={{ fontSize: 13, color: TEXTO_3, lineHeight: 1.55 }}>
            La app real tiene cerca de 500 alimentos colombianos y de marca, y también mide fibra,
            sodio, azúcares y otros micronutrientes.
          </p>
        </div>
      </div>
    </Seccion>
  )
}

/* ══════════════════════════════════════════════════════════
   QUIÉN TE ENTRENA — confianza antes del precio
   ══════════════════════════════════════════════════════════ */
function QuienTeEntrena() {
  const formacion = [
    "Técnico en entrenamiento en gimnasio",
    "Técnico en entrenamiento personalizado",
    "Certificaciones nacionales e internacionales",
    "Especialización en Econometría",
  ]
  return (
    <Seccion>
      <div className="quien-grid" style={{ display: "grid", gap: 48, alignItems: "start" }}>
        <div>
          <h2 className="bc h2" style={{ marginBottom: 18 }}>Quién te entrena</h2>
          <p className="b" style={{ fontSize: 17, color: TEXTO_2, lineHeight: 1.7, fontWeight: 300,
            marginBottom: 16 }}>
            Soy David. Me formé como entrenador y también en análisis de datos, y esa mezcla es la
            base de cómo trabajo: cada serie, cada comida y cada medida queda registrada, y los
            ajustes a tu plan salen de esos datos, no de la intuición.
          </p>
          <p className="b" style={{ fontSize: 17, color: TEXTO_2, lineHeight: 1.7, fontWeight: 300 }}>
            Construí la app que vas a usar para poder hacerle seguimiento real a cada persona que entreno.
          </p>
        </div>
        <ul style={{ listStyle: "none", borderLeft: `2px solid ${R}`, paddingLeft: 24 }}>
          {formacion.map(f => (
            <li key={f} className="bc" style={{ fontSize: 21, fontWeight: 700, textTransform: "uppercase",
              padding: "10px 0", borderBottom: `1px solid ${LINEA}` }}>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </Seccion>
  )
}

/* ══════════════════════════════════════════════════════════
   PLANES — selector online / presencial + tabla comparativa
   ══════════════════════════════════════════════════════════ */
function SeccionPlanes() {
  const [modo, setModo] = useState<Modo>("online")
  const presencial = modo === "presencial"
  const ahorroDuo = PRECIOS.entrenamiento[modo] + PRECIOS.alimentacion[modo] - PRECIOS.duo[modo]
  const etiquetaModo = presencial ? " con sesiones presenciales" : " online"

  const planes = [
    {
      clave: "entrenamiento", nombre: "Entrenamiento", color: R,
      precio: PRECIOS.entrenamiento[modo],
      para: "Si tu prioridad es entrenar mejor y progresar en fuerza.",
      puntos: [
        "Programa personalizado según tu nivel y tu objetivo",
        "Registro de cada serie y detección automática de récords",
        "Nota semanal mía con el foco de tu semana",
        ...(presencial ? ["3 sesiones presenciales al mes para ajustar técnica"] : []),
      ],
    },
    {
      clave: "alimentacion", nombre: "Alimentación", color: G,
      precio: PRECIOS.alimentacion[modo],
      para: "Si quieres saber qué comer para tu objetivo, sin adivinar.",
      puntos: [
        "Menú calculado para déficit, mantenimiento o superávit",
        "App de registro con cerca de 500 alimentos",
        "Déficit real de tu semana, con lo que de verdad comiste",
        "Recetario con video y guía de suplementación",
      ],
      nota: presencial ? "Este plan es 100% online." : undefined,
    },
    {
      clave: "duo", nombre: "Dúo", color: O, destacado: true,
      precio: PRECIOS.duo[modo],
      para: "Entrenamiento y alimentación juntos, con un solo seguimiento.",
      puntos: [
        "Todo lo del plan de Entrenamiento",
        "Todo lo del plan de Alimentación",
        ...(presencial ? ["Incluye las 3 sesiones presenciales al mes"] : []),
      ],
      ahorro: ahorroDuo,
    },
  ]

  return (
    <Seccion id="planes">
      <TituloSeccion titulo="Planes y precios"
        bajada="Todos son mensuales. Elige si quieres agregar sesiones presenciales en Bogotá." />

      <div role="radiogroup" aria-label="Modalidad del plan" className="selector-modo"
        style={{ display: "inline-flex", border: `1px solid ${LINEA}`, marginBottom: 32, padding: 4,
          background: "#0b0b0e" }}>
        {([["online", "Solo online"], ["presencial", "Con presenciales"]] as const).map(([k, l]) => (
          <button key={k} role="radio" aria-checked={modo === k} onClick={() => setModo(k)}
            className="bc"
            style={{ padding: "11px 22px", fontSize: 16, fontWeight: 800, cursor: "pointer",
              border: "none", color: modo === k ? "#000" : TEXTO_2,
              background: modo === k ? "#fff" : "transparent",
              transition: "background 0.2s ease, color 0.2s ease" }}>
            {l}
          </button>
        ))}
      </div>

      <div className="planes-grid" style={{ display: "grid", gap: 18, marginBottom: 56 }}>
        {planes.map(p => (
          <article key={p.clave} style={{ position: "relative", display: "flex", flexDirection: "column",
            padding: "30px 26px",
            background: p.destacado ? `${p.color}0c` : "#0b0b0e",
            border: `1px solid ${p.destacado ? p.color + "70" : LINEA}` }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: p.color }} />
            {p.destacado && (
              <span className="bc" style={{ position: "absolute", top: 14, right: 16, fontSize: 13,
                fontWeight: 800, color: p.color }}>
                Mejor valor
              </span>
            )}
            <h3 className="bc" style={{ fontSize: 30, fontWeight: 900, textTransform: "uppercase",
              marginBottom: 6 }}>
              {p.nombre}
            </h3>
            <p className="b" style={{ fontSize: 15, color: TEXTO_2, lineHeight: 1.5, marginBottom: 20,
              fontWeight: 300, minHeight: 45 }}>
              {p.para}
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
              <span className="bc" style={{ fontSize: 44, fontWeight: 900, lineHeight: 1 }}>
                {fmt(p.precio)}
              </span>
              <span className="b" style={{ fontSize: 14, color: TEXTO_3 }}>al mes</span>
            </div>
            <div style={{ minHeight: 26, marginBottom: 18 }}>
              {p.ahorro !== undefined && p.ahorro > 0 && (
                <span className="b" style={{ fontSize: 14, color: G, fontWeight: 500 }}>
                  Ahorras {fmt(p.ahorro)} al mes frente a tomarlos por separado
                </span>
              )}
              {p.nota && (
                <span className="b" style={{ fontSize: 14, color: TEXTO_3 }}>{p.nota}</span>
              )}
            </div>
            <ul style={{ listStyle: "none", flex: 1, marginBottom: 26 }}>
              {p.puntos.map(punto => (
                <li key={punto} className="b" style={{ display: "flex", gap: 10, fontSize: 15,
                  color: "rgba(255,255,255,0.85)", lineHeight: 1.5, padding: "7px 0",
                  borderTop: `1px solid ${LINEA}`, fontWeight: 300 }}>
                  <span aria-hidden style={{ color: p.color, flexShrink: 0 }}>✓</span>
                  {punto}
                </li>
              ))}
            </ul>
            <a href={wa(`Hola David, me interesa el plan ${p.nombre}${p.clave === "alimentacion" ? "" : etiquetaModo}`)}
              target="_blank" rel="noopener noreferrer"
              className="bc boton"
              style={{ padding: "15px", fontSize: 16, textAlign: "center",
                background: p.destacado ? p.color : "transparent",
                color: p.destacado ? "#000" : "#fff",
                border: `1px solid ${p.destacado ? p.color : "rgba(255,255,255,0.35)"}` }}>
              Quiero el plan {p.nombre}
            </a>
          </article>
        ))}
      </div>

      <TablaComparativa presencial={presencial} />
    </Seccion>
  )
}

type Fila = [string, boolean, boolean, boolean]

function TablaComparativa({ presencial }: { presencial: boolean }) {
  // [función, entrenamiento, alimentación, dúo]
  const filas: Fila[] = [
    ["Programa de entrenamiento personalizado", true, false, true],
    ["Registro de series, historial y récords automáticos", true, false, true],
    ["Biblioteca de ejercicios y pliometría con video", true, false, true],
    ["Retos semanales con puntos canjeables por descuento", true, false, true],
    ["Nota semanal y mensaje antes de cada sesión", true, false, true],
    ["Menú calculado para tu objetivo", false, true, true],
    ["App de registro de comidas", false, true, true],
    ["Micronutrientes y déficit real semanal", false, true, true],
    ["Recetario y guía de suplementación", false, true, true],
    ["Seguimiento de medidas con gráfica", true, true, true],
    ["Contacto directo conmigo por WhatsApp", true, true, true],
  ]
  if (presencial) filas.push(["3 sesiones presenciales al mes", true, false, true])

  const cols = [
    { nombre: "Entrenamiento", color: R },
    { nombre: "Alimentación", color: G },
    { nombre: "Dúo", color: O },
  ]
  return (
    <div>
      <h3 className="bc" style={{ fontSize: 26, fontWeight: 900, textTransform: "uppercase", marginBottom: 18 }}>
        Qué incluye cada plan
      </h3>
      <div style={{ overflowX: "auto", border: `1px solid ${LINEA}`, position: "relative" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
          <thead>
            <tr style={{ background: "#0b0b0e" }}>
              <th style={{ padding: "14px 18px" }}>
                <span className="solo-lector">Función</span>
              </th>
              {cols.map(c => (
                <th key={c.nombre} scope="col" className="bc" style={{ padding: "14px 12px", fontSize: 17,
                  fontWeight: 800, textTransform: "uppercase", color: c.color, width: "18%" }}>
                  {c.nombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map(([funcion, ...incluye]) => (
              <tr key={funcion} style={{ borderTop: `1px solid ${LINEA}` }}>
                <th scope="row" className="b" style={{ textAlign: "left", padding: "13px 18px",
                  fontSize: 15, fontWeight: 300, color: "rgba(255,255,255,0.85)" }}>
                  {funcion}
                </th>
                {incluye.map((si, i) => (
                  <td key={i} style={{ textAlign: "center", padding: "13px 12px", fontSize: 17,
                    color: si ? cols[i].color : "rgba(255,255,255,0.2)" }}>
                    <span aria-hidden>{si ? "✓" : "—"}</span>
                    <span className="solo-lector">{si ? "Incluido" : "No incluido"}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   PREGUNTAS FRECUENTES
   ══════════════════════════════════════════════════════════ */
function Preguntas() {
  const preguntas = [
    { p: "¿Tengo que descargar alguna aplicación?",
      r: "No. Recibes un link personal que abre la app directo en el navegador de tu celular o computador." },
    { p: "¿Cómo pago?",
      r: "El pago es mensual. Todos los métodos disponibles están en coachdavidfitness.com/pagos." },
    { p: "¿Sirve si nunca he entrenado?",
      r: "Sí. Tu programa se arma según tu nivel, y cada ejercicio tiene un video guía para que aprendas la técnica." },
    { p: "¿Dónde y cuándo son las sesiones presenciales?",
      r: "En Bogotá. Las agendas desde la app eligiendo el día y un bloque de 1 o 2 horas. Entre semana hay horarios antes de las 8:30 a. m. y después de las 6:30 p. m., y los fines de semana hay más disponibilidad." },
    { p: "¿Cómo sé si estoy progresando?",
      r: "La app guarda tu historial de cada ejercicio, detecta tus récords, grafica tu volumen y tus medidas, y cada semana te dejo una nota con lo que vi en tus datos." },
    { p: "¿Qué plan me conviene?",
      r: "Si tu foco es entrenar, Entrenamiento. Si quieres ordenar tu alimentación, Alimentación. Si quieres las dos cosas, el Dúo sale más barato que tomarlos por separado." },
  ]
  return (
    <Seccion id="preguntas">
      <TituloSeccion titulo="Preguntas frecuentes" />
      <div style={{ maxWidth: 780 }}>
        {preguntas.map(q => (
          <details key={q.p} className="pregunta" style={{ borderTop: `1px solid ${LINEA}` }}>
            <summary className="bc" style={{ fontSize: 21, fontWeight: 700, padding: "20px 0",
              cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between",
              gap: 16 }}>
              {q.p}
              <span className="signo" aria-hidden style={{ color: R, flexShrink: 0 }}>+</span>
            </summary>
            <p className="b" style={{ fontSize: 16, color: TEXTO_2, lineHeight: 1.65, fontWeight: 300,
              paddingBottom: 22, maxWidth: 680 }}>
              {q.r}
            </p>
          </details>
        ))}
      </div>
    </Seccion>
  )
}

/* ══════════════════════════════════════════════════════════
   CTA FINAL
   ══════════════════════════════════════════════════════════ */
function CierreCTA() {
  return (
    <section style={{ background: R, padding: "72px 24px" }}>
      <div className="contenedor" style={{ display: "flex",
        alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
        <h2 className="bc" style={{ fontSize: "clamp(34px, 5vw, 58px)", fontWeight: 900,
          textTransform: "uppercase", lineHeight: 0.95, maxWidth: 620, color: "#fff" }}>
          Deja de adivinar y empieza a medir tu progreso
        </h2>
        <a href={wa("Hola David, quiero empezar un plan")} target="_blank" rel="noopener noreferrer"
          className="bc boton" style={{ padding: "18px 34px", fontSize: 17, background: "#000",
            color: "#fff", border: "1px solid #000" }}>
          Escríbeme por WhatsApp
        </a>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer style={{ padding: "36px 24px" }}>
      <div className="contenedor" style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <span className="bc" style={{ fontSize: 17, fontWeight: 900 }}>
          COACH<span style={{ color: R }}>.</span>DAVID
        </span>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "center" }}>
          <a className="nav-link b" href="https://www.instagram.com/coachfitdavid" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a className="nav-link b" href="https://www.coachdavidfitness.com/pagos">Pagos</a>
          <span className="b" style={{ fontSize: 14, color: TEXTO_3 }}>Bogotá, Colombia</span>
        </div>
      </div>
    </footer>
  )
}

/* ── Barra fija de contacto, solo en celular ── */
function BarraMovil() {
  return (
    <div className="barra-movil" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 120,
      padding: "10px 14px calc(10px + env(safe-area-inset-bottom))", background: "rgba(5,5,7,0.95)",
      borderTop: `1px solid ${LINEA}`, gap: 10 }}>
      <a href="#planes" className="bc boton boton-borde" style={{ flex: 1, padding: "13px", fontSize: 15,
        textAlign: "center" }}>
        Ver planes
      </a>
      <a href={wa("Hola David, quiero información sobre tus programas")} target="_blank"
        rel="noopener noreferrer" className="bc boton boton-rojo"
        style={{ flex: 1.4, padding: "13px", fontSize: 15, textAlign: "center" }}>
        Escríbeme por WhatsApp
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
      html{scroll-behavior:smooth;scroll-padding-top:72px}
      .bc{font-family:'Barlow Condensed',Impact,sans-serif}
      .b{font-family:'Barlow',sans-serif}
      button{font-family:inherit}
      .contenedor{max-width:1120px;margin:0 auto}
      .seccion{padding:88px 24px}
      .h2{font-size:clamp(34px,4.6vw,54px);font-weight:900;text-transform:uppercase;line-height:0.95;letter-spacing:-0.01em}

      .boton{display:inline-block;text-decoration:none;font-weight:800;letter-spacing:0.02em;
        transition:transform 0.15s ease, background 0.2s ease, border-color 0.2s ease}
      .boton:active{transform:translateY(1px)}
      .boton-rojo{background:${R};color:#fff;border:1px solid ${R}}
      .boton-rojo:hover{background:#ff1a26}
      .boton-borde{background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.4)}
      .boton-borde:hover{border-color:#fff}
      .nav-link{color:${TEXTO_2};text-decoration:none;font-size:15px}
      .nav-link:hover{color:#fff}

      a:focus-visible, button:focus-visible, summary:focus-visible{outline:2px solid #fff;outline-offset:3px}
      .solo-lector{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

      .hero-grid{grid-template-columns:1.1fr 1fr}
      .pasos-grid{grid-template-columns:repeat(3,1fr)}
      .macros-grid{grid-template-columns:1fr 1fr}
      .quien-grid{grid-template-columns:1.2fr 1fr}
      .planes-grid{grid-template-columns:repeat(3,1fr)}

      .pregunta summary::-webkit-details-marker{display:none}
      .pregunta[open] .signo{transform:rotate(45deg)}
      .signo{display:inline-block;transition:transform 0.2s ease;font-size:26px;line-height:1}
      .pregunta:last-child{border-bottom:1px solid ${LINEA}}

      .barra-movil{display:none}

      @media (max-width: 900px){
        .hero-grid, .quien-grid{grid-template-columns:1fr}
        .planes-grid{grid-template-columns:1fr;max-width:520px}
      }
      @media (max-width: 720px){
        .seccion{padding:64px 24px}
        .nav-cta{display:none !important}
        .pasos-grid, .macros-grid{grid-template-columns:1fr}
        .nav-links{display:none !important}
        .barra-movil{display:flex}
        .pagina{padding-bottom:78px}
        .selector-modo{display:flex !important;width:100%}
        .selector-modo button{flex:1}
      }
      @media (prefers-reduced-motion: reduce){
        html{scroll-behavior:auto}
        *{animation-duration:0.01ms !important;transition-duration:0.01ms !important}
      }
    `}</style>
  )
}
