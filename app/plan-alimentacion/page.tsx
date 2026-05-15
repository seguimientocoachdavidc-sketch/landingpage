"use client"

import { useEffect, useState } from "react"
import { MENUS_PLAN, type MenuPlan } from "@/lib/menus-data"

const R = "#E8000D"

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

/* ── Colores por tipo de menú ────────────────────────────────── */
function tagColor(tag: string) {
  if (tag.includes("Bajo")) return { bg: "#0d2010", border: "#22c55e40", text: "#22c55e", dot: "#22c55e" }
  if (tag.includes("Moderado") || tag.includes("Medio")) return { bg: "#1a1500", border: "#eab30840", text: "#eab308", dot: "#eab308" }
  return { bg: "#0d0d1a", border: "#3b82f640", text: "#3b82f6", dot: "#3b82f6" }
}

/* ══ COMPONENTE PRINCIPAL ════════════════════════════════════════ */
export default function PlanAlimentacion() {
  const { isMobile } = useBreakpoint()
  const [token, setToken] = useState<string | null>(null)
  const [nombreUsuario, setNombreUsuario] = useState("")
  const [accesoDenegado, setAccesoDenegado] = useState(false)
  const [menuSeleccionado, setMenuSeleccionado] = useState<MenuPlan | null>(null)
  const [filtro, setFiltro] = useState<"Todos" | "CHO Bajos" | "CHO Moderados">("Todos")
  const [expandido, setExpandido] = useState<string | null>(null)

  /* ── Verificar token ──────────────────────────────────────── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get("token")
    if (!t) { setAccesoDenegado(true); return }

    fetch(`/api/macros/verificar?token=${t}`)
      .then(r => r.json())
      .then(data => {
        if (data.valido) {
          setToken(t)
          setNombreUsuario(data.nombre || "")
        } else {
          setAccesoDenegado(true)
        }
      })
      .catch(() => setAccesoDenegado(true))
  }, [])

  if (accesoDenegado) return <AccesoDenegado />
  if (!token) return <Loading />

  const menusFiltrados = MENUS_PLAN.filter(m =>
    filtro === "Todos" ? true : m.tag === filtro
  )

  return (
    <div style={{ background: "#000", color: "#fff", fontFamily: "'Barlow', sans-serif", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${R}; color: #fff; }
        .bc { font-family: 'Barlow Condensed', Impact, sans-serif; }
        .b  { font-family: 'Barlow', sans-serif; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .menu-card:hover { border-color: rgba(232,0,13,0.4) !important; background: rgba(232,0,13,0.04) !important; }
        .alimento-row:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: R, zIndex: 200 }} />

      {/* ── HEADER ──────────────────────────────────────────── */}
      <header style={{ position: "fixed", top: 2, left: 0, right: 0, zIndex: 100, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "0 16px" : "0 32px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {menuSeleccionado ? (
              <button onClick={() => setMenuSeleccionado(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "4px 0", fontSize: 13, fontFamily: "'Barlow', sans-serif", display: "flex", alignItems: "center", gap: 6, transition: "color 0.2s ease" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
              >
                ← Todos los menús
              </button>
            ) : (
              <>
                <a href="/" className="bc" style={{ fontSize: 16, fontWeight: 900, textDecoration: "none", color: "#fff" }}>
                  COACH<span style={{ color: R }}>.</span>DAVID
                </a>
                <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.15)" }} />
                <span className="bc" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Plan de alimentación</span>
              </>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", animation: "blink 2s ease infinite" }} />
            {!isMobile && <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{nombreUsuario}</span>}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "72px 16px 40px" : "72px 32px 40px" }}>

        {/* ════ VISTA: LISTA DE MENÚS ══════════════════════════ */}
        {!menuSeleccionado && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>

            {/* Hero */}
            <div style={{ marginBottom: 36, paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 32, height: 2, background: R }} />
                <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>
                  Tu plan personalizado
                </span>
              </div>
              <h1 className="bc" style={{ fontSize: isMobile ? "clamp(36px, 10vw, 52px)" : "clamp(44px, 4vw, 64px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 14 }}>
                HOLA, <span style={{ color: R }}>{nombreUsuario.split(" ")[0].toUpperCase()}</span><br />
                ELIGE TU MENÚ<br />DE HOY
              </h1>
              <p className="b" style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontWeight: 300, maxWidth: 520 }}>
                Tienes {MENUS_PLAN.length} menús diseñados por Coach David. Cada uno está calculado con los macros exactos para tu plan. Elige el que más se adapte a tu día.
              </p>
            </div>

            {/* Filtros */}
            <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
              {(["Todos", "CHO Bajos", "CHO Moderados"] as const).map(f => (
                <button key={f} onClick={() => setFiltro(f)} className="bc"
                  style={{ padding: "8px 18px", border: `1px solid ${filtro === f ? R : "rgba(255,255,255,0.1)"}`, background: filtro === f ? `${R}18` : "transparent", color: filtro === f ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s ease" }}>
                  {f} {f !== "Todos" && `(${MENUS_PLAN.filter(m => m.tag === f).length})`}
                </button>
              ))}
            </div>

            {/* Grid de menús */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 10 }}>
              {menusFiltrados.map((menu, i) => {
                const tc = tagColor(menu.tag)
                return (
                  <div key={menu.id} className="menu-card"
                    onClick={() => setMenuSeleccionado(menu)}
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "#080808", cursor: "pointer",
                      transition: "all 0.2s ease", position: "relative", overflow: "hidden",
                      animation: `fadeUp 0.4s ease ${i * 60}ms both`,
                    }}
                  >
                    {/* Número decorativo */}
                    <div className="bc" style={{ position: "absolute", right: -8, bottom: -16, fontSize: 80, fontWeight: 900, color: "rgba(255,255,255,0.03)", lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>
                      {String(menu.id).padStart(2, "0")}
                    </div>

                    <div style={{ padding: isMobile ? "22px 20px" : "28px 28px" }}>
                      {/* Tag */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: tc.dot, flexShrink: 0 }} />
                        <span className="bc" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: tc.text }}>
                          {menu.tag}
                        </span>
                      </div>

                      {/* Nombre */}
                      <h2 className="bc" style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 8, lineHeight: 1.1 }}>
                        {menu.nombre}
                      </h2>

                      {/* Comidas resumen */}
                      <p className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20, fontWeight: 300 }}>
                        {menu.comidas.length} comidas · {menu.comidas.map(c => c.nombre).join(" · ")}
                      </p>

                      {/* Macros del día */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                        {[
                          { label: "Kcal", val: menu.totales.kcal, unit: "", color: "#fff" },
                          { label: "Prot", val: menu.totales.proteina, unit: "g", color: "#22c55e" },
                          { label: "CHO", val: menu.totales.cho, unit: "g", color: "#3b82f6" },
                          { label: "Grasas", val: menu.totales.grasa, unit: "g", color: "#eab308" },
                        ].map(m => (
                          <div key={m.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", padding: "10px 8px", textAlign: "center" }}>
                            <div className="bc" style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: m.color, lineHeight: 1 }}>
                              {m.val}<span style={{ fontSize: 11 }}>{m.unit}</span>
                            </div>
                            <div className="b" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3 }}>
                              {m.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Ver menú */}
                      <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                        <span className="bc" style={{ fontSize: 12, color: R, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                          Ver menú completo →
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Leyenda */}
            <div style={{ marginTop: 32, padding: "16px 20px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", display: "flex", flexWrap: "wrap", gap: 20 }}>
              {[
                { color: "#22c55e", label: "CHO Bajos — menos carbohidratos, ideal para días de descanso" },
                { color: "#eab308", label: "CHO Moderados — balance equilibrado para días de entrenamiento" },
              ].map(item => (
                <div key={item.color} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ VISTA: DETALLE DEL MENÚ ════════════════════════ */}
        {menuSeleccionado && (
          <div style={{ animation: "fadeUp 0.35s ease", paddingTop: 20 }}>
            {(() => {
              const tc = tagColor(menuSeleccionado.tag)
              return (
                <>
                  {/* Header menú */}
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: tc.dot }} />
                      <span className="bc" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: tc.text }}>
                        {menuSeleccionado.tag}
                      </span>
                    </div>
                    <h1 className="bc" style={{ fontSize: isMobile ? "clamp(32px, 9vw, 48px)" : "clamp(40px, 4vw, 60px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 20 }}>
                      {menuSeleccionado.nombre}
                    </h1>

                    {/* Totales del día destacados */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, marginBottom: 8 }}>
                      {[
                        { label: "Calorías día", val: menuSeleccionado.totales.kcal, unit: "kcal", color: "#fff" },
                        { label: "Proteína", val: menuSeleccionado.totales.proteina, unit: "g", color: "#22c55e" },
                        { label: "Carbohidratos", val: menuSeleccionado.totales.cho, unit: "g", color: "#3b82f6" },
                        { label: "Grasas", val: menuSeleccionado.totales.grasa, unit: "g", color: "#eab308" },
                      ].map(m => (
                        <div key={m.label} style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", padding: isMobile ? "14px 10px" : "20px 16px", textAlign: "center" }}>
                          <div className="bc" style={{ fontSize: isMobile ? 26 : 36, fontWeight: 900, color: m.color, lineHeight: 1 }}>
                            {m.val}<span style={{ fontSize: isMobile ? 13 : 16 }}>{m.unit}</span>
                          </div>
                          <div className="b" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 5 }}>
                            {m.label}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "right", fontWeight: 300 }}>Total del día · {menuSeleccionado.comidas.length} comidas</p>
                  </div>

                  {/* Comidas */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {menuSeleccionado.comidas.map((comida, ci) => {
                      const isOpen = expandido === `${menuSeleccionado.id}-${ci}`
                      return (
                        <div key={ci} style={{ border: `1px solid ${isOpen ? `${R}35` : "rgba(255,255,255,0.07)"}`, background: isOpen ? `${R}05` : "#080808", transition: "all 0.2s ease" }}>

                          {/* Header comida — clickeable */}
                          <button
                            onClick={() => setExpandido(isOpen ? null : `${menuSeleccionado.id}-${ci}`)}
                            style={{ width: "100%", padding: isMobile ? "18px 16px" : "20px 24px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, textAlign: "left" }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
                                <span className="bc" style={{ fontSize: 11, color: isOpen ? R : "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", flexShrink: 0 }}>
                                  {comida.numero}
                                </span>
                                <span className="bc" style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, textTransform: "uppercase", color: "#fff", letterSpacing: "-0.01em" }}>
                                  {comida.nombre}
                                </span>
                              </div>

                              {/* Macros resumidos */}
                              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                                {[
                                  { label: "kcal", val: comida.subtotal.kcal, color: "rgba(255,255,255,0.6)" },
                                  { label: "P", val: `${comida.subtotal.proteina}g`, color: "#22c55e" },
                                  { label: "C", val: `${comida.subtotal.cho}g`, color: "#3b82f6" },
                                  { label: "G", val: `${comida.subtotal.grasa}g`, color: "#eab308" },
                                ].map(m => (
                                  <span key={m.label} className="bc" style={{ fontSize: 14, color: m.color, fontWeight: 700 }}>
                                    {m.val} <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>{m.label}</span>
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                              <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                                {comida.alimentos.length} alimentos
                              </span>
                              <span style={{ color: isOpen ? R : "rgba(255,255,255,0.3)", fontSize: 16, transition: "transform 0.2s ease", display: "block", transform: isOpen ? "rotate(180deg)" : "none" }}>▾</span>
                            </div>
                          </button>

                          {/* Alimentos expandidos */}
                          {isOpen && (
                            <div style={{ borderTop: `1px solid ${R}20`, animation: "slideIn 0.2s ease" }}>

                              {/* Header tabla */}
                              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr auto" : "2fr 1fr 1fr 1fr 1fr 1fr", gap: 4, padding: "8px 16px", background: "rgba(0,0,0,0.4)" }}>
                                <span className="bc" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Alimento</span>
                                {!isMobile && <>
                                  <span className="bc" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "center" }}>Cantidad</span>
                                  <span className="bc" style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "center" }}>Kcal</span>
                                  <span className="bc" style={{ fontSize: 10, color: "#22c55e", letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "center" }}>Prot</span>
                                  <span className="bc" style={{ fontSize: 10, color: "#3b82f6", letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "center" }}>CHO</span>
                                  <span className="bc" style={{ fontSize: 10, color: "#eab308", letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "center" }}>Grasa</span>
                                </>}
                                {isMobile && <span className="bc" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "right" }}>Cantidad</span>}
                              </div>

                              {/* Filas de alimentos */}
                              {comida.alimentos.map((al, ai) => (
                                <div key={ai} className="alimento-row"
                                  style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr auto" : "2fr 1fr 1fr 1fr 1fr 1fr", gap: 4, padding: isMobile ? "12px 16px" : "11px 16px", borderBottom: ai < comida.alimentos.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center", transition: "background 0.15s ease" }}
                                >
                                  <span className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>{al.nombre}</span>

                                  {isMobile ? (
                                    <div style={{ textAlign: "right" }}>
                                      <div className="bc" style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{al.cantidad}</div>
                                      <div className="b" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                                        {al.kcal}kcal · <span style={{ color: "#22c55e" }}>{al.proteina}g</span> · <span style={{ color: "#3b82f6" }}>{al.cho}g</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <span className="bc" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center", fontWeight: 700 }}>{al.cantidad}</span>
                                      <span className="bc" style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", textAlign: "center", fontWeight: 800 }}>{al.kcal}</span>
                                      <span className="bc" style={{ fontSize: 15, color: "#22c55e", textAlign: "center", fontWeight: 800 }}>{al.proteina}g</span>
                                      <span className="bc" style={{ fontSize: 15, color: "#3b82f6", textAlign: "center", fontWeight: 800 }}>{al.cho}g</span>
                                      <span className="bc" style={{ fontSize: 15, color: "#eab308", textAlign: "center", fontWeight: 800 }}>{al.grasa}g</span>
                                    </>
                                  )}
                                </div>
                              ))}

                              {/* Subtotal comida */}
                              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr auto" : "2fr 1fr 1fr 1fr 1fr 1fr", gap: 4, padding: isMobile ? "12px 16px" : "12px 16px", background: "rgba(232,0,13,0.06)", borderTop: `1px solid ${R}20` }}>
                                <span className="bc" style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: R }}>Subtotal comida</span>
                                {isMobile ? (
                                  <div style={{ textAlign: "right" }}>
                                    <span className="bc" style={{ fontSize: 14, color: "#fff", fontWeight: 900 }}>{comida.subtotal.kcal} kcal</span>
                                  </div>
                                ) : (
                                  <>
                                    <span></span>
                                    <span className="bc" style={{ fontSize: 15, color: "#fff", textAlign: "center", fontWeight: 900 }}>{comida.subtotal.kcal}</span>
                                    <span className="bc" style={{ fontSize: 15, color: "#22c55e", textAlign: "center", fontWeight: 900 }}>{comida.subtotal.proteina}g</span>
                                    <span className="bc" style={{ fontSize: 15, color: "#3b82f6", textAlign: "center", fontWeight: 900 }}>{comida.subtotal.cho}g</span>
                                    <span className="bc" style={{ fontSize: 15, color: "#eab308", textAlign: "center", fontWeight: 900 }}>{comida.subtotal.grasa}g</span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Nota de Coach David */}
                  <div style={{ marginTop: 28, padding: "20px 24px", border: `1px solid ${R}20`, background: `${R}06`, display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <span style={{ color: R, fontSize: 18, flexShrink: 0, marginTop: 2 }}>◆</span>
                    <div>
                      <div className="bc" style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Nota de Coach David</div>
                      <p className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, fontWeight: 300 }}>
                        Las cantidades están pesadas en crudo salvo que se indique cocido. Puedes ajustar el orden de las comidas según tu horario, pero mantén las cantidades y alimentos indicados para respetar los macros del día.
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div style={{ marginTop: 16, textAlign: "center" }}>
                    <a href={`https://wa.me/573243747367?text=Hola Coach David, tengo una duda sobre el ${menuSeleccionado.nombre}`}
                      target="_blank" rel="noopener noreferrer" className="bc"
                      style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "13px 28px", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e", fontSize: 13, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", transition: "all 0.25s ease" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#22c55e"; (e.currentTarget as HTMLAnchorElement).style.color = "#000" }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "#22c55e" }}
                    >
                      ¿Dudas? Escríbele a Coach David →
                    </a>
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

/* ── Sub-componentes ─────────────────────────────────────────── */
function AccesoDenegado() {
  return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: 32, fontFamily: "'Barlow', sans-serif", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=Barlow:wght@300&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 56, fontWeight: 900, color: "#E8000D", marginBottom: 16 }}>🔒</div>
      <h1 style={{ fontFamily: "'Barlow Condensed'", fontSize: 34, fontWeight: 900, textTransform: "uppercase", marginBottom: 12 }}>Acceso restringido</h1>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", maxWidth: 360, lineHeight: 1.7, fontWeight: 300 }}>
        Este plan de alimentación es exclusivo. Contacta a Coach David para obtener tu acceso personalizado.
      </p>
      <a href="https://wa.me/573243747367" target="_blank" rel="noopener noreferrer"
        style={{ marginTop: 32, padding: "14px 32px", background: "#22c55e", color: "#fff", fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none" }}>
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
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Cargando tu plan...</p>
      </div>
    </div>
  )
}
