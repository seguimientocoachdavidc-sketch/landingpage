"use client"

import { useEffect, useState } from "react"
import { MENUS_PLAN } from "@/lib/menus-data"
import { MENUS_ANDERSON, SNACKS_ANDERSON } from "@/lib/menus-anderson"

const R = "#E8000D"

/* ── Tipos unificados ────────────────────────────────────────── */
type Alimento = { nombre: string; cantidad: string; [key: string]: any }
type Comida   = { numero: string; nombre: string; alimentos: Alimento[]; [key: string]: any }
type Menu     = { id: number; nombre: string; tag: string; comidas: Comida[] }
type PlanId   = "sofi" | "anderson" | null

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

/* ── Color por tag ───────────────────────────────────────────── */
function tagStyle(tag: string) {
  if (tag === "Cheat Meal")                                    return { color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.25)"  }
  if (tag === "Snack")                                         return { color: "#a855f7", bg: "rgba(168,85,247,0.08)",  border: "rgba(168,85,247,0.25)"  }
  if (tag.includes("Bajo"))                                    return { color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.2)"    }
  if (tag.includes("Moderado") || tag.includes("Medio"))       return { color: "#eab308", bg: "rgba(234,179,8,0.08)",  border: "rgba(234,179,8,0.2)"    }
  if (tag.includes("Alto"))                                    return { color: "#3b82f6", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)"   }
  return                                                              { color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.2)"    }
}

const ICONOS = ["🌅", "☀️", "🥗", "🌆", "🌙", "🍵"]

/* ── Obtener menús y filtros según el plan ───────────────────── */
function getPlanData(plan: PlanId) {
  if (plan === "anderson") {
    return {
      menus: MENUS_ANDERSON as unknown as Menu[],
      filtros: ["Todos", "Regular", "Cheat Meal"] as const,
      tieneSnacks: true,
      notaFiltros: (
        <>
          <strong style={{ color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>Regular</strong> — para el día a día.&nbsp;&nbsp;
          <strong style={{ color: "#f97316", fontWeight: 500 }}>Cheat Meal</strong> — incluye una comida libre de ~650 kcal. Máximo 1 vez por semana.
        </>
      ),
    }
  }
  // Sofi (default)
  return {
    menus: MENUS_PLAN as unknown as Menu[],
    filtros: ["Todos", "CHO Bajos", "CHO Moderados", "CHO Altos"] as const,
    tieneSnacks: false,
    notaFiltros: (
      <>
        <strong style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>CHO Bajos</strong> — ideal para días de descanso o baja actividad.&nbsp;&nbsp;
        <strong style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>CHO Moderados</strong> — diseñados para días de entrenamiento.&nbsp;&nbsp;
        <strong style={{ color: "#3b82f6", fontWeight: 500 }}>CHO Altos</strong> — para días de mayor demanda energética.
      </>
    ),
  }
}

/* ══ COMPONENTE PRINCIPAL ════════════════════════════════════════ */
export default function PlanAlimentacion() {
  const { isMobile } = useBreakpoint()
  const [token, setToken]               = useState<string | null>(null)
  const [nombreUsuario, setNombre]      = useState("")
  const [plan, setPlan]                 = useState<PlanId>(null)
  const [accesoDenegado, setDenegado]   = useState(false)
  const [cargando, setCargando]         = useState(true)
  const [vistaActiva, setVista]         = useState<"menus" | "snacks">("menus")
  const [filtro, setFiltro]             = useState("Todos")
  const [menuSel, setMenuSel]           = useState<Menu | null>(null)
  const [comidaAbierta, setComida]      = useState<number | null>(0)

  /* ── Verificar token ──────────────────────────────────────── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get("token")
    if (!t) { setDenegado(true); setCargando(false); return }

    fetch(`/api/macros/verificar?token=${t}`)
      .then(r => r.json())
      .then(data => {
        if (data.valido) {
          setToken(t)
          setNombre(data.nombre || "")
          setPlan(data.plan ?? null)
        } else {
          setDenegado(true)
        }
      })
      .catch(() => setDenegado(true))
      .finally(() => setCargando(false))
  }, [])

  const abrirMenu = (menu: Menu) => {
    setMenuSel(menu); setComida(0)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const volverALista = () => { setMenuSel(null); setComida(null) }

  if (cargando)       return <Loading />
  if (accesoDenegado) return <AccesoDenegado />
  if (!plan)          return <SinPlan nombre={nombreUsuario} />

  const { menus, filtros, tieneSnacks, notaFiltros } = getPlanData(plan)
  const menusFiltrados = menus.filter(m => filtro === "Todos" ? true : m.tag === filtro)

  return (
    <div style={{ background: "#000", color: "#fff", fontFamily: "'Barlow', sans-serif", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${R}; color: #fff; }
        .bc { font-family: 'Barlow Condensed', Impact, sans-serif; }
        .b  { font-family: 'Barlow', sans-serif; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .menu-card { transition: all 0.2s ease; }
        .menu-card:hover { transform: translateY(-2px); border-color: rgba(232,0,13,0.45) !important; }
        .ali-row:hover { background: rgba(255,255,255,0.04) !important; }
      `}</style>

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: R, zIndex: 200 }} />

      {/* ── HEADER ──────────────────────────────────────────── */}
      <header style={{ position: "fixed", top: 2, left: 0, right: 0, zIndex: 100, background: "rgba(0,0,0,0.96)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: isMobile ? "0 16px" : "0 40px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {menuSel ? (
              <button onClick={volverALista}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.5)", fontFamily: "'Barlow', sans-serif", fontSize: 13, transition: "color 0.2s ease" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              >← Mis menús</button>
            ) : (
              <>
                <a href="/" className="bc" style={{ fontSize: 18, fontWeight: 900, textDecoration: "none", color: "#fff" }}>
                  COACH<span style={{ color: R }}>.</span>DAVID
                </a>
                <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.12)" }} />
                <span className="bc" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.25em", textTransform: "uppercase" }}>
                  Plan de alimentación
                </span>
              </>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", animation: "blink 2s ease infinite" }} />
            <span className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
              {isMobile ? nombreUsuario.split(" ")[0] : nombreUsuario}
            </span>
          </div>
        </div>
      </header>

      {/* ── TABS (solo en lista) ─────────────────────────────── */}
      {!menuSel && (
        <div style={{ position: "fixed", top: 58, left: 0, right: 0, zIndex: 99, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px", display: "flex" }}>
            <button onClick={() => setVista("menus")} className="bc"
              style={{ padding: "13px 20px", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", color: vistaActiva === "menus" ? "#fff" : "rgba(255,255,255,0.3)", borderBottom: `2px solid ${vistaActiva === "menus" ? R : "transparent"}`, transition: "all 0.2s ease", whiteSpace: "nowrap" }}>
              Menús ({menus.length})
            </button>
            {tieneSnacks && (
              <button onClick={() => setVista("snacks")} className="bc"
                style={{ padding: "13px 20px", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", color: vistaActiva === "snacks" ? "#fff" : "rgba(255,255,255,0.3)", borderBottom: `2px solid ${vistaActiva === "snacks" ? R : "transparent"}`, transition: "all 0.2s ease", whiteSpace: "nowrap" }}>
                Snacks ({SNACKS_ANDERSON.length})
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: isMobile ? "0 16px 48px" : "0 40px 48px", paddingTop: menuSel ? "74px" : (tieneSnacks ? "110px" : "110px") }}>

        {/* ════ VISTA: LISTA DE MENÚS ══════════════════════════ */}
        {!menuSel && vistaActiva === "menus" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ paddingTop: 24, marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 32, height: 2, background: R }} />
                <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.45em", textTransform: "uppercase" }}>Tu plan personalizado</span>
              </div>
              <h1 className="bc" style={{ fontSize: isMobile ? "clamp(38px, 11vw, 56px)" : "clamp(52px, 5vw, 72px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.02em", marginBottom: 16 }}>
                HOLA,<br /><span style={{ color: R }}>{nombreUsuario.split(" ")[0].toUpperCase()}</span>
              </h1>
              <p className="b" style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, fontWeight: 300, maxWidth: 500 }}>
                Tienes {menus.length} menús diseñados por Coach David. Cada día elige el que mejor se adapte a tu agenda y preferencias.
              </p>
            </div>

            {/* Filtros */}
            <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
              {filtros.map(f => {
                const ts = f === "Todos" ? null : tagStyle(f)
                const activo = filtro === f
                return (
                  <button key={f} onClick={() => setFiltro(f)} className="bc"
                    style={{ padding: "9px 20px", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s ease", border: activo ? `1px solid ${ts?.color || R}` : "1px solid rgba(255,255,255,0.1)", background: activo ? (ts?.bg || `${R}18`) : "transparent", color: activo ? (ts?.color || "#fff") : "rgba(255,255,255,0.4)" }}>
                    {f}{f !== "Todos" && <span style={{ marginLeft: 6, opacity: 0.6 }}>({menus.filter(m => m.tag === f).length})</span>}
                  </button>
                )
              })}
            </div>

            {/* Grid de menús */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 12 }}>
              {menusFiltrados.map((menu, i) => {
                const ts = tagStyle(menu.tag)
                return (
                  <div key={menu.id} className="menu-card" onClick={() => abrirMenu(menu)}
                    style={{ border: "1px solid rgba(255,255,255,0.08)", background: "#090909", cursor: "pointer", position: "relative", overflow: "hidden", animation: `fadeUp 0.45s ease ${i * 55}ms both` }}>
                    <div style={{ height: 3, background: ts.color, opacity: 0.7 }} />
                    <div className="bc" style={{ position: "absolute", right: -10, bottom: -20, fontSize: 100, fontWeight: 900, lineHeight: 1, color: "rgba(255,255,255,0.025)", pointerEvents: "none", userSelect: "none" }}>
                      {String(menu.id).padStart(2, "0")}
                    </div>
                    <div style={{ padding: isMobile ? "22px 18px" : "26px 28px" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 12px", background: ts.bg, border: `1px solid ${ts.border}`, marginBottom: 16 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: ts.color }} />
                        <span className="bc" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: ts.color }}>{menu.tag}</span>
                      </div>
                      <h2 className="bc" style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", lineHeight: 1.05, marginBottom: 14 }}>{menu.nombre}</h2>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 20 }}>
                        {menu.comidas.map((c, ci) => (
                          <div key={ci} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 13, flexShrink: 0 }}>{ICONOS[ci] || "🍽️"}</span>
                            <div>
                              <span className="bc" style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", letterSpacing: "0.2em", textTransform: "uppercase", marginRight: 6 }}>{c.numero}</span>
                              <span className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 300 }}>{c.nombre}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", fontWeight: 300 }}>{menu.comidas.length} comidas</span>
                        <span className="bc" style={{ fontSize: 13, color: R, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Ver menú →</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Nota */}
            <div style={{ marginTop: 32, padding: "16px 20px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ color: R, fontSize: 15, flexShrink: 0, marginTop: 1 }}>◆</span>
              <p className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, fontWeight: 300 }}>{notaFiltros}</p>
            </div>
          </div>
        )}

        {/* ════ VISTA: SNACKS (solo Anderson) ══════════════════ */}
        {!menuSel && vistaActiva === "snacks" && plan === "anderson" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ paddingTop: 24, marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 32, height: 2, background: "#a855f7" }} />
                <span className="bc" style={{ color: "#a855f7", fontSize: 11, fontWeight: 700, letterSpacing: "0.45em", textTransform: "uppercase" }}>Snacks de emergencia</span>
              </div>
              <h2 className="bc" style={{ fontSize: isMobile ? "clamp(32px, 9vw, 48px)" : "clamp(40px, 4vw, 56px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 14 }}>
                CUANDO<br /><span style={{ color: "#a855f7" }}>NECESITAS ALGO</span>
              </h2>
              <p className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, fontWeight: 300, maxWidth: 500 }}>
                Para esas situaciones en que necesitas comer algo rápido y saludable. Todos están dentro de tu plan.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 10 }}>
              {SNACKS_ANDERSON.map((snack, i) => (
                <div key={snack.id} style={{ border: "1px solid rgba(255,255,255,0.07)", background: "#090909", overflow: "hidden", animation: `fadeUp 0.4s ease ${i * 60}ms both` }}>
                  <div style={{ height: 2, background: "#a855f7", opacity: 0.7 }} />
                  <div style={{ padding: isMobile ? "20px 18px" : "24px 26px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "3px 10px", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.25)", marginBottom: 12 }}>
                      <span className="bc" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#a855f7" }}>{snack.nombre}</span>
                    </div>
                    <h3 className="bc" style={{ fontSize: isMobile ? 18 : 20, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 14 }}>{snack.descripcion}</h3>
                    {snack.alimentos.map((al, ai) => (
                      <div key={ai} className="ali-row"
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: ai < snack.alimentos.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", gap: 12, transition: "background 0.15s ease" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                          <div style={{ width: 4, height: 4, background: "#a855f7", flexShrink: 0, transform: "rotate(45deg)", opacity: 0.7 }} />
                          <span className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 400 }}>{al.nombre}</span>
                        </div>
                        <div style={{ padding: "4px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
                          <span className="bc" style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{al.cantidad}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ VISTA: DETALLE DEL MENÚ ════════════════════════ */}
        {menuSel && (
          <div style={{ animation: "fadeUp 0.35s ease", paddingTop: 20 }}>
            {(() => {
              const ts = tagStyle(menuSel.tag)
              return (
                <>
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 12px", background: ts.bg, border: `1px solid ${ts.border}`, marginBottom: 14 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: ts.color }} />
                      <span className="bc" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: ts.color }}>{menuSel.tag}</span>
                    </div>
                    <h1 className="bc" style={{ fontSize: isMobile ? "clamp(36px, 10vw, 52px)" : "clamp(44px, 4.5vw, 64px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 12 }}>
                      {menuSel.nombre}
                    </h1>
                    <p className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>
                      {menuSel.comidas.length} comidas · Toca cada una para ver los alimentos
                    </p>
                  </div>

                  {/* Accordion de comidas */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {menuSel.comidas.map((comida, ci) => {
                      const isOpen = comidaAbierta === ci
                      const esLibre = comida.alimentos.length === 1 && comida.alimentos[0].nombre.toLowerCase().includes("comida libre")
                      return (
                        <div key={ci} style={{ border: `1px solid ${isOpen ? `${R}40` : "rgba(255,255,255,0.08)"}`, background: isOpen ? "#0d0000" : "#090909", transition: "all 0.25s ease", overflow: "hidden" }}>
                          <button onClick={() => setComida(isOpen ? null : ci)}
                            style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: isMobile ? "16px" : "20px 24px", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
                            <div style={{ width: 44, height: 44, flexShrink: 0, background: isOpen ? `${R}18` : "rgba(255,255,255,0.04)", border: `1px solid ${isOpen ? `${R}40` : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, transition: "all 0.2s ease" }}>
                              {esLibre ? "🎉" : ICONOS[ci] || "🍽️"}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                                <span className="bc" style={{ fontSize: 11, color: isOpen ? R : "rgba(255,255,255,0.25)", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase" }}>{comida.numero}</span>
                                <span className="bc" style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, textTransform: "uppercase", color: isOpen ? "#fff" : "rgba(255,255,255,0.8)", letterSpacing: "-0.01em" }}>{comida.nombre}</span>
                              </div>
                              <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontWeight: 300 }}>
                                {esLibre ? "A tu elección · ~650 kcal" : `${comida.alimentos.length} alimentos`}
                              </span>
                            </div>
                            <div style={{ width: 28, height: 28, flexShrink: 0, border: `1px solid ${isOpen ? `${R}40` : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: isOpen ? R : "rgba(255,255,255,0.3)", fontSize: 14, transition: "all 0.2s ease", transform: isOpen ? "rotate(180deg)" : "none" }}>▾</div>
                          </button>

                          {isOpen && (
                            <div style={{ borderTop: `1px solid ${R}25`, animation: "slideIn 0.2s ease" }}>
                              {esLibre ? (
                                <div style={{ padding: isMobile ? "20px 16px" : "24px", background: "rgba(249,115,22,0.06)", display: "flex", gap: 14, alignItems: "flex-start" }}>
                                  <span style={{ fontSize: 24, flexShrink: 0 }}>🎉</span>
                                  <div>
                                    <div className="bc" style={{ fontSize: 16, fontWeight: 900, textTransform: "uppercase", color: "#f97316", marginBottom: 8 }}>¡Comida libre!</div>
                                    <p className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, fontWeight: 300 }}>
                                      Puedes comer lo que quieras, buscando que esté alrededor de <strong style={{ color: "#fff" }}>650 kcal</strong>. Disfrútalo con consciencia — es parte del plan.
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {comida.alimentos.map((al, ai) => (
                                    <div key={ai} className="ali-row"
                                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "12px 16px" : "12px 24px", borderBottom: ai < comida.alimentos.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", gap: 12, transition: "background 0.15s ease" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                                        <div style={{ width: 5, height: 5, background: R, flexShrink: 0, transform: "rotate(45deg)", opacity: 0.7 }} />
                                        <span className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>{al.nombre}</span>
                                      </div>
                                      <div style={{ padding: "5px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
                                        <span className="bc" style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{al.cantidad}</span>
                                      </div>
                                    </div>
                                  ))}
                                  <div style={{ padding: isMobile ? "12px 16px" : "12px 24px", background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 4, height: 4, background: R, flexShrink: 0 }} />
                                    <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 300 }}>{comida.alimentos.length} alimentos en esta comida</span>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Nota */}
                  <div style={{ marginTop: 28, padding: "20px 24px", border: `1px solid ${R}20`, background: `${R}06`, display: "flex", gap: 14 }}>
                    <span style={{ color: R, fontSize: 18, flexShrink: 0, marginTop: 2 }}>◆</span>
                    <div>
                      <div className="bc" style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>Recuerda</div>
                      <p className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, fontWeight: 300 }}>
                        Las cantidades están en gramos y pesadas en <strong style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>crudo</strong>, salvo que se indique cocinado. Mantén los alimentos y gramajes indicados para respetar tu plan. Si tienes dudas, escríbele a Coach David.
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div style={{ marginTop: 14, textAlign: "center" }}>
                    <a href={`https://wa.me/573243747367?text=Hola Coach David, tengo una duda sobre el ${menuSel.nombre}`}
                      target="_blank" rel="noopener noreferrer" className="bc"
                      style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "13px 28px", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e", fontSize: 13, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", transition: "all 0.25s ease" }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "#22c55e"; el.style.color = "#000" }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "transparent"; el.style.color = "#22c55e" }}
                    >¿Dudas? Escríbele a Coach David →</a>
                  </div>

                  {/* Navegar entre menús */}
                  <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", marginRight: 4 }}>Otros menús:</span>
                    {menus.filter(m => m.id !== menuSel.id).slice(0, isMobile ? 3 : 5).map(m => {
                      const ts2 = tagStyle(m.tag)
                      return (
                        <button key={m.id} onClick={() => abrirMenu(m)} className="bc"
                          style={{ padding: "7px 14px", border: `1px solid ${ts2.border}`, background: ts2.bg, color: ts2.color, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", transition: "opacity 0.2s ease" }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                        >{m.nombre}</button>
                      )
                    })}
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Pantallas auxiliares ────────────────────────────────────── */
function AccesoDenegado() {
  return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: 32, fontFamily: "'Barlow', sans-serif", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=Barlow:wght@300&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{ fontSize: 52, marginBottom: 20 }}>🔒</div>
      <h1 style={{ fontFamily: "'Barlow Condensed'", fontSize: 32, fontWeight: 900, textTransform: "uppercase", marginBottom: 12 }}>Acceso restringido</h1>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", maxWidth: 340, lineHeight: 1.75, fontWeight: 300 }}>
        Este plan de alimentación es exclusivo para clientes de Coach David.
      </p>
      <a href="https://wa.me/573243747367" target="_blank" rel="noopener noreferrer"
        style={{ marginTop: 32, padding: "14px 32px", background: "#22c55e", color: "#fff", fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none" }}>
        Contactar por WhatsApp
      </a>
    </div>
  )
}

function SinPlan({ nombre }: { nombre: string }) {
  return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: 32, fontFamily: "'Barlow', sans-serif", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=Barlow:wght@300&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{ fontSize: 52, marginBottom: 20 }}>📋</div>
      <h1 style={{ fontFamily: "'Barlow Condensed'", fontSize: 28, fontWeight: 900, textTransform: "uppercase", marginBottom: 12 }}>
        Hola, {nombre.split(" ")[0]}
      </h1>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", maxWidth: 340, lineHeight: 1.75, fontWeight: 300 }}>
        Tu acceso está activo pero aún no tienes un plan de alimentación asignado. Contacta a Coach David para activarlo.
      </p>
      <a href="https://wa.me/573243747367" target="_blank" rel="noopener noreferrer"
        style={{ marginTop: 32, padding: "14px 32px", background: R, color: "#fff", fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none" }}>
        Contactar por WhatsApp
      </a>
    </div>
  )
}

function Loading() {
  return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Barlow', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 28, height: 28, border: "2px solid #E8000D", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Cargando tu plan...</p>
      </div>
    </div>
  )
}
