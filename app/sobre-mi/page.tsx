"use client"

import { useEffect, useState } from "react"

/* ══════════════════════════════════════════════════════════
   CONFIGURACIÓN Y CONTENIDO EDITABLE
   ══════════════════════════════════════════════════════════ */
const R = "#E8000D"
const SUPERFICIE = "#0b0b0e"
const TEXTO_2 = "rgba(255,255,255,0.72)"
const TEXTO_3 = "rgba(255,255,255,0.5)"
const LINEA = "rgba(255,255,255,0.09)"

const WHATSAPP = "573243747367"
const INSTAGRAM = "https://www.instagram.com/coachfitdavid"
const wa = (m: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(m)}`

// Tu historia en primera persona. Es lo que más conecta en una página "Sobre mí":
// reescribe el primer párrafo con cómo empezaste TÚ (qué te llevó a entrenar,
// qué hacías mal al principio, qué te hizo cambiar).
const HISTORIA = [
  "Llevo más de ocho años entrenando. Como casi todos, al principio seguí rutinas que encontraba por ahí sin saber si de verdad estaban funcionando, y eso me hizo entender algo: sin estructura, el esfuerzo se desperdicia.",
  "Por eso me formé como técnico en entrenamiento de gimnasio y en entrenamiento personalizado, me especialicé en hipertrofia, biomecánica y nutrición deportiva, y sigo estudiando hoy. Todo lo que aprendo lo aplico primero en mi propio entrenamiento y después con las personas que entreno.",
  "Hoy acompaño a personas que quieren ganar músculo, perder grasa o rendir mejor en su deporte, con una app que construí yo mismo para poder hacerles seguimiento de verdad. Mi trabajo no es motivarte un día: es darte un sistema que funcione todos los días.",
]

type Titulo = { titulo: string; institucion: string }
const FORMACION: { grupo: string; enCurso?: boolean; titulos: Titulo[] }[] = [
  { grupo: "Formación técnica", titulos: [
    { titulo: "Técnico en Entrenamiento de Gimnasio", institucion: "CCAPF" },
    { titulo: "Técnico en Entrenamiento Personalizado", institucion: "CCAPF" },
  ] },
  { grupo: "Especializaciones", titulos: [
    { titulo: "Hipertrofia muscular", institucion: "ECEP" },
    { titulo: "Entrenamiento en mujeres", institucion: "ECEP" },
    { titulo: "Biomecánica deportiva", institucion: "Fitness & Health Institute" },
    { titulo: "Nutrición deportiva", institucion: "Fitness & Health Institute" },
  ] },
  { grupo: "Estudiando ahora", enCurso: true, titulos: [
    { titulo: "Nutrición y suplementación", institucion: "INAF" },
    { titulo: "Certificación profesional en musculación", institucion: "INAF" },
  ] },
]
// Se calcula solo: formación técnica + especializaciones de entrenamiento
const CERTIFICACIONES_FITNESS = FORMACION
  .filter(g => g.grupo === "Formación técnica" || g.grupo === "Especializaciones")
  .reduce((n, g) => n + g.titulos.length, 0)

/* ══════════════════════════════════════════════════════════
   PÁGINA
   ══════════════════════════════════════════════════════════ */
export default function SobreMi() {
  return (
    <main className="pagina" style={{ background: "#000", color: "#fff",
      fontFamily: "'Barlow', sans-serif", overflowX: "hidden" }}>
      <Estilos />
      <Nav />
      <Hero />
      <MiHistoria />
      <Datos />
      <Formacion />
      <Filosofia />
      <Cierre />
      <Footer />
    </main>
  )
}

function Seccion({ id, fondo = "#000", children }: { id?: string; fondo?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="seccion" style={{ background: fondo, borderTop: `1px solid ${LINEA}` }}>
      <div className="contenedor">{children}</div>
    </section>
  )
}

/* ── Nav ── */
function Nav() {
  const [solido, setSolido] = useState(false)
  useEffect(() => {
    const onScroll = () => setSolido(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <nav aria-label="Principal" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: solido ? "rgba(0,0,0,0.92)" : "transparent", backdropFilter: solido ? "blur(12px)" : "none",
      borderBottom: `1px solid ${solido ? LINEA : "transparent"}`, transition: "background 0.3s ease" }}>
      <div style={{ padding: "0 24px" }}>
        <div className="contenedor" style={{ height: 66, display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 20 }}>
          <a href="/" className="bc" style={{ fontSize: 20, fontWeight: 900, color: "#fff", textDecoration: "none" }}>
            COACH<span style={{ color: R }}>.</span>DAVID
          </a>
          <div className="nav-links" style={{ display: "flex", gap: 26 }}>
            <a href="/" className="b nav-link">Inicio</a>
            <a href="/programas" className="b nav-link">Planes</a>
            <a href="/#encuentra-tu-plan" className="b nav-link">Encuentra tu plan</a>
          </div>
          <a href={wa("Hola David, vi tu página y quiero hablar contigo")} target="_blank" rel="noopener noreferrer"
            className="bc boton boton-rojo" style={{ padding: "10px 18px", fontSize: 15 }}>
            Escríbeme
          </a>
        </div>
      </div>
    </nav>
  )
}

/* ── Hero: la persona primero ── */
function Hero() {
  const [entro, setEntro] = useState(false)
  useEffect(() => { const t = setTimeout(() => setEntro(true), 80); return () => clearTimeout(t) }, [])
  const aparece = (d: number): React.CSSProperties => ({
    opacity: entro ? 1 : 0, transform: entro ? "none" : "translateY(22px)",
    transition: `opacity 0.8s ease ${d}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${d}s`,
  })
  return (
    <header className="hero" style={{ display: "grid", minHeight: "100svh" }}>
      <div className="hero-texto" style={{ display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "120px 56px 72px max(24px, calc((100vw - 1200px) / 2))" }}>
        <p className="b" style={{ fontSize: 17, color: TEXTO_3, marginBottom: 14, ...aparece(0.15) }}>
          Hola, soy
        </p>
        <h1 className="bc" style={{ fontSize: "clamp(92px, 15vw, 210px)", fontWeight: 900, textTransform: "uppercase",
          lineHeight: 0.8, letterSpacing: "-0.03em", marginBottom: 30, ...aparece(0.25) }}>
          David
        </h1>
        <p className="bc" style={{ fontSize: "clamp(24px, 2.6vw, 34px)", fontWeight: 800, textTransform: "uppercase",
          lineHeight: 1.1, maxWidth: 560, marginBottom: 20, ...aparece(0.45) }}>
          Entrenador especializado en hipertrofia y rendimiento físico
        </p>
        <p className="b" style={{ fontSize: 18, color: TEXTO_2, lineHeight: 1.65, fontWeight: 300, maxWidth: 500,
          marginBottom: 34, ...aparece(0.6) }}>
          Trabajo con un principio simple: si no puedes medir tu progreso, no puedes mejorarlo.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", ...aparece(0.75) }}>
          <a href="#historia" className="bc boton boton-rojo" style={{ padding: "16px 28px", fontSize: 17 }}>
            Conoce mi historia
          </a>
          <a href="/#encuentra-tu-plan" className="bc boton boton-borde" style={{ padding: "16px 26px", fontSize: 17 }}>
            Encuentra tu plan
          </a>
        </div>
      </div>
      <div className="hero-foto" style={{ position: "relative", overflow: "hidden", background: SUPERFICIE }}>
        <img src="/Entrenando_2.jpeg" alt="David, entrenador de Coach David, en el gimnasio"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top",
            filter: "grayscale(15%) contrast(1.05)", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #000 0%, transparent 30%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #000 0%, transparent 30%)" }} />
        <div aria-hidden style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 6, background: R }} />
      </div>
    </header>
  )
}

/* ── Mi historia ── */
function MiHistoria() {
  return (
    <Seccion id="historia">
      <div className="historia-grid" style={{ display: "grid", gap: 56, alignItems: "start" }}>
        <h2 className="bc h2" style={{ position: "sticky", top: 100 }}>Mi historia</h2>
        <div style={{ maxWidth: 680 }}>
          {HISTORIA.map((p, i) => (
            <p key={i} className="b" style={{ fontSize: i === 0 ? 22 : 18, color: i === 0 ? "#fff" : TEXTO_2,
              lineHeight: 1.7, fontWeight: i === 0 ? 400 : 300, marginBottom: 24 }}>
              {p}
            </p>
          ))}
          <blockquote className="bc" style={{ marginTop: 12, borderLeft: `4px solid ${R}`, paddingLeft: 24,
            fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 1.05 }}>
            Si entrenas conmigo no entrenas más duro: entrenas mejor.
          </blockquote>
        </div>
      </div>
    </Seccion>
  )
}

/* ── Todo se mide: cómo trabajo con cada persona ── */
function Datos() {
  const puntos = [
    { t: "Registro cada serie", d: "Peso y repeticiones de cada ejercicio quedan en tu historial, aunque cambie tu rutina." },
    { t: "Detecto tus récords", d: "Cuando superas tu marca, la app lo marca el mismo día. Tu progreso deja de ser una sensación." },
    { t: "Mido lo que comes", d: "Tu déficit o superávit real de la semana, calculado con lo que de verdad comiste." },
    { t: "Ajusto con datos", d: "Cada semana reviso tus números y te dejo una nota con el foco. Si algo no avanza, se cambia." },
  ]
  return (
    <Seccion id="datos" fondo={SUPERFICIE}>
      <div className="datos-grid" style={{ display: "grid", gap: 56, alignItems: "center" }}>
        <div>
          <h2 className="bc h2" style={{ marginBottom: 20 }}>Todo se mide</h2>
          <p className="b" style={{ fontSize: 18, color: TEXTO_2, lineHeight: 1.7, fontWeight: 300, marginBottom: 20, maxWidth: 520 }}>
            Las decisiones de tu programa no salen de la intuición: salen de lo que registras. Por eso
            construí mi propia app, para hacerle seguimiento real a cada persona que entreno.
          </p>
          <a href="/programas" className="b enlace">Mira cómo funciona en los planes</a>
        </div>
        <ul className="datos-lista" style={{ listStyle: "none", display: "grid", gap: 2 }}>
          {puntos.map(p => (
            <li key={p.t} style={{ background: "#000", padding: "22px 24px", borderLeft: `3px solid ${R}` }}>
              <h3 className="bc" style={{ fontSize: 23, fontWeight: 800, textTransform: "uppercase", marginBottom: 4 }}>{p.t}</h3>
              <p className="b" style={{ fontSize: 16, color: TEXTO_2, lineHeight: 1.55, fontWeight: 300 }}>{p.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </Seccion>
  )
}

/* ── Formación ── */
function Formacion() {
  return (
    <Seccion id="formacion">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24,
        flexWrap: "wrap", marginBottom: 44 }}>
        <div style={{ maxWidth: 640 }}>
          <h2 className="bc h2" style={{ marginBottom: 16 }}>Formación</h2>
          <p className="b" style={{ fontSize: 18, color: TEXTO_2, lineHeight: 1.65, fontWeight: 300 }}>
            Cada título respalda decisiones concretas de tu programa, y sigo estudiando.
          </p>
        </div>
        <p style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span className="bc" style={{ fontSize: 76, fontWeight: 900, lineHeight: 1, color: R }}>{CERTIFICACIONES_FITNESS}</span>
          <span className="b" style={{ fontSize: 16, color: TEXTO_2, maxWidth: 160, lineHeight: 1.3 }}>
            títulos en entrenamiento y nutrición
          </span>
        </p>
      </div>
      <div className="formacion-grid" style={{ display: "grid", gap: 2 }}>
        {FORMACION.map(g => (
          <section key={g.grupo} aria-label={g.grupo} style={{ background: SUPERFICIE, padding: "30px 28px",
            borderTop: `3px solid ${g.enCurso ? R : "rgba(255,255,255,0.18)"}` }}>
            <h3 className="bc" style={{ fontSize: 20, fontWeight: 800, textTransform: "uppercase", marginBottom: 20,
              color: g.enCurso ? R : "#fff" }}>
              {g.grupo}
            </h3>
            <ul style={{ listStyle: "none", display: "grid", gap: 18 }}>
              {g.titulos.map(t => (
                <li key={t.titulo}>
                  <p className="b" style={{ fontSize: 16, lineHeight: 1.4, marginBottom: 3 }}>{t.titulo}</p>
                  <p className="b" style={{ fontSize: 14, color: TEXTO_3 }}>{t.institucion}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Seccion>
  )
}

/* ── Filosofía: un ciclo real, por eso va numerado ── */
function Filosofia() {
  const pasos = [
    { t: "Medir", d: "Todo se registra: cargas, repeticiones, comidas y medidas. Sin datos no hay punto de partida." },
    { t: "Ajustar", d: "Un programa que no se ajusta deja de funcionar. Tu plan cambia según lo que muestran tus números." },
    { t: "Progresar", d: "El objetivo no es sudar más. Es mover más peso, más veces, con mejor técnica." },
  ]
  return (
    <section className="filosofia" style={{ position: "relative", overflow: "hidden", borderTop: `1px solid ${LINEA}` }}>
      <img src="/Entrenando_1.jpeg" alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", opacity: 0.18, filter: "grayscale(50%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #000, rgba(0,0,0,0.8) 50%, #000)" }} />
      <div className="seccion" style={{ position: "relative" }}>
        <div className="contenedor">
          <h2 className="bc" style={{ fontSize: "clamp(48px, 7vw, 104px)", fontWeight: 900, textTransform: "uppercase",
            lineHeight: 0.88, letterSpacing: "-0.02em", maxWidth: 880, marginBottom: 48 }}>
            Aprende a entrenar. Enamórate del proceso.
          </h2>
          <ol className="pasos-grid" style={{ listStyle: "none", display: "grid", gap: 2, maxWidth: 1000 }}>
            {pasos.map((p, i) => (
              <li key={p.t} style={{ background: "rgba(0,0,0,0.6)", padding: "28px 26px",
                borderTop: `2px solid ${i === 0 ? R : "rgba(255,255,255,0.15)"}` }}>
                <p className="bc" style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, marginBottom: 10,
                  color: i === 0 ? R : "rgba(255,255,255,0.3)" }}>{i + 1}</p>
                <h3 className="bc" style={{ fontSize: 30, fontWeight: 900, textTransform: "uppercase", marginBottom: 8 }}>{p.t}</h3>
                <p className="b" style={{ fontSize: 16, color: TEXTO_2, lineHeight: 1.6, fontWeight: 300 }}>{p.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ── Cierre ── */
function Cierre() {
  return (
    <section style={{ background: R, padding: "80px 24px" }}>
      <div className="contenedor" style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 32, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 620 }}>
          <h2 className="bc" style={{ fontSize: "clamp(40px, 6vw, 76px)", fontWeight: 900, textTransform: "uppercase",
            lineHeight: 0.9, marginBottom: 14 }}>
            Entrenemos juntos
          </h2>
          <p className="b" style={{ fontSize: 18, lineHeight: 1.55, color: "rgba(255,255,255,0.9)" }}>
            Cuéntame tu objetivo y vemos si mi forma de trabajar encaja contigo. Sin compromiso.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/#encuentra-tu-plan" className="bc boton" style={{ padding: "17px 28px", fontSize: 17,
            background: "#000", color: "#fff", border: "1px solid #000" }}>
            Encuentra tu plan
          </a>
          <a href={wa("Hola David, leí tu historia y quiero entrenar contigo")} target="_blank" rel="noopener noreferrer"
            className="bc boton" style={{ padding: "17px 28px", fontSize: 17, background: "transparent",
              color: "#fff", border: "1px solid rgba(255,255,255,0.85)" }}>
            Escríbeme por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{ padding: "36px 24px" }}>
      <div className="contenedor" style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 16 }}>
        <span className="bc" style={{ fontSize: 18, fontWeight: 900 }}>COACH<span style={{ color: R }}>.</span>DAVID</span>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
          <a href="/" className="b nav-link">Inicio</a>
          <a href="/programas" className="b nav-link">Planes</a>
          <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="b nav-link">Instagram</a>
          <span className="b" style={{ fontSize: 14, color: TEXTO_3 }}>Bogotá, Colombia</span>
        </div>
      </div>
    </footer>
  )
}

/* ── Estilos ── */
function Estilos() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;700;800;900&family=Barlow:wght@300;400;500&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      html{scroll-behavior:smooth;scroll-padding-top:74px}
      ::selection{background:${R};color:#fff}
      .bc{font-family:'Barlow Condensed',Impact,sans-serif}
      .b{font-family:'Barlow',sans-serif}
      .contenedor{max-width:1200px;margin:0 auto}
      .seccion{padding:100px 24px}
      .h2{font-size:clamp(40px,5vw,66px);font-weight:900;text-transform:uppercase;line-height:0.92;letter-spacing:-0.01em}

      .boton{display:inline-block;text-decoration:none;font-weight:800;letter-spacing:0.02em;
        transition:background 0.2s ease,border-color 0.2s ease}
      .boton-rojo{background:${R};color:#fff;border:1px solid ${R}}
      .boton-rojo:hover{background:#ff1a26}
      .boton-borde{background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.45)}
      .boton-borde:hover{border-color:#fff}
      .nav-link{font-size:15px;color:${TEXTO_2};text-decoration:none}
      .nav-link:hover{color:#fff}
      .enlace{color:#fff;font-size:16px;text-decoration:underline;text-decoration-color:${R};
        text-underline-offset:5px;text-decoration-thickness:2px}
      a:focus-visible{outline:2px solid #fff;outline-offset:3px}

      .hero{grid-template-columns:1.05fr 1fr}
      .historia-grid{grid-template-columns:0.8fr 1.4fr}
      .datos-grid{grid-template-columns:1fr 1.1fr}
      .formacion-grid{grid-template-columns:repeat(4,1fr)}
      .pasos-grid{grid-template-columns:repeat(3,1fr)}

      @media (max-width:1000px){
        .nav-links{display:none !important}
        .hero{grid-template-columns:1fr}
        .hero-foto{height:62vh;order:-1}
        .hero-texto{padding:48px 24px 64px !important}
        .historia-grid,.datos-grid{grid-template-columns:1fr}
        .historia-grid h2{position:static !important}
        .formacion-grid{grid-template-columns:repeat(2,1fr)}
      }
      @media (max-width:720px){
        .seccion{padding:68px 24px}
        .formacion-grid,.pasos-grid{grid-template-columns:1fr}
      }
      @media (prefers-reduced-motion:reduce){
        html{scroll-behavior:auto}
        *{transition-duration:0.01ms !important}
      }
    `}</style>
  )
}
