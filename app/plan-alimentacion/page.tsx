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

/* ── Color por tipo de menú ──────────────────────────────────── */
function tagStyle(tag: string) {
  if (tag.includes("Bajo"))    return { color: "#22c55e", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.2)"  }
  if (tag.includes("Moderado") || tag.includes("Medio"))
                                return { color: "#eab308", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.2)"  }
  return                               { color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)" }
}

/* ── Ícono por número de comida ──────────────────────────────── */
const ICONOS_COMIDA = ["🌅", "☀️", "🥗", "🌆", "🌙", "🍵"]

/* ══ COMPONENTE PRINCIPAL ════════════════════════════════════════ */
export default function PlanAlimentacion() {
  const { isMobile } = useBreakpoint()
  const [token, setToken] = useState<string | null>(null)
  const [nombreUsuario, setNombreUsuario] = useState("")
  const [accesoDenegado, setAccesoDenegado] = useState(false)
  const [menuSeleccionado, setMenuSeleccionado] = useState<MenuPlan | null>(null)
  const [filtro, setFiltro] = useState<"Todos" | "CHO Bajos" | "CHO Moderados">("Todos")
  const [comidaAbierta, setComidaAbierta] = useState<number | null>(0)

  /* ── Verificar token ──────────────────────────────────────── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get("token")
    if (!t) { setAccesoDenegado(true); return }
    fetch(`/api/macros/verificar?token=${t}`)
      .then(r => r.json())
      .then(data => {
        if (data.valido) { setToken(t); setNombreUsuario(data.nombre || "") }
        else setAccesoDenegado(true)
      })
      .catch(() => setAccesoDenegado(true))
  }, [])

  /* ── Al abrir un menú, expandir la primera comida ─────────── */
  const abrirMenu = (menu: MenuPlan) => {
    setMenuSeleccionado(menu)
    setComidaAbierta(0)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const volverALista = () => {
    setMenuSeleccionado(null)
    setComidaAbierta(null)
  }

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
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .menu-card { transition: all 0.2s ease; }
        .menu-card:hover { transform: translateY(-2px); border-color: rgba(232,0,13,0.45) !important; }
        .alimento-item:hover { background: rgba(255,255,255,0.04) !important; }
      `}</style>

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: R, zIndex: 200 }} />

      {/* ── HEADER ──────────────────────────────────────────── */}
      <header style={{ position: "fixed", top: 2, left: 0, right: 0, zIndex: 100, background: "rgba(0,0,0,0.96)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: isMobile ? "0 16px" : "0 40px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {menuSeleccionado ? (
              <button onClick={volverALista}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: "4px 0", color: "rgba(255,255,255,0.5)", fontFamily: "'Barlow', sans-serif", fontSize: 13, transition: "color 0.2s ease" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              >
                <span style={{ fontSize: 16 }}>←</span> Mis menús
              </button>
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

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: isMobile ? "74px 16px 48px" : "74px 40px 48px" }}>

        {/* ════ VISTA: LISTA DE MENÚS ══════════════════════════ */}
        {!menuSeleccionado && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>

            {/* Saludo */}
            <div style={{ paddingTop: 28, marginBottom: 40 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 32, height: 2, background: R }} />
                <span className="bc" style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.45em", textTransform: "uppercase" }}>
                  Tu plan personalizado
                </span>
              </div>
              <h1 className="bc" style={{
                fontSize: isMobile ? "clamp(38px, 11vw, 56px)" : "clamp(52px, 5vw, 72px)",
                fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88,
                letterSpacing: "-0.02em", marginBottom: 18,
              }}>
                HOLA,<br />
                <span style={{ color: R }}>{nombreUsuario.split(" ")[0].toUpperCase()}</span>
              </h1>
              <p className="b" style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, fontWeight: 300, maxWidth: 500 }}>
                Aquí están tus {MENUS_PLAN.length} menús diseñados por Coach David. Cada día elige el que mejor se adapte a tu agenda y preferencias.
              </p>
            </div>

            {/* Filtros */}
            <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
              {(["Todos", "CHO Bajos", "CHO Moderados"] as const).map(f => {
                const ts = f === "Todos" ? null : tagStyle(f)
                const activo = filtro === f
                return (
                  <button key={f} onClick={() => setFiltro(f)} className="bc"
                    style={{
                      padding: "9px 20px", fontSize: 13, fontWeight: 700,
                      letterSpacing: "0.15em", textTransform: "uppercase",
                      cursor: "pointer", transition: "all 0.2s ease",
                      border: activo
                        ? `1px solid ${ts?.color || R}`
                        : "1px solid rgba(255,255,255,0.1)",
                      background: activo
                        ? (ts?.bg || `${R}18`)
                        : "transparent",
                      color: activo
                        ? (ts?.color || "#fff")
                        : "rgba(255,255,255,0.4)",
                    }}>
                    {f}
                    {f !== "Todos" && (
                      <span style={{ marginLeft: 6, opacity: 0.6 }}>
                        ({MENUS_PLAN.filter(m => m.tag === f).length})
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Grid de menús */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 12 }}>
              {menusFiltrados.map((menu, i) => {
                const ts = tagStyle(menu.tag)
                const totalComidas = menu.comidas.length
                return (
                  <div key={menu.id} className="menu-card"
                    onClick={() => abrirMenu(menu)}
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "#090909", cursor: "pointer",
                      position: "relative", overflow: "hidden",
                      animation: `fadeUp 0.45s ease ${i * 55}ms both`,
                    }}
                  >
                    {/* Acento de color top */}
                    <div style={{ height: 3, background: ts.color, opacity: 0.7 }} />

                    {/* Número decorativo fondo */}
                    <div className="bc" style={{
                      position: "absolute", right: -10, bottom: -20,
                      fontSize: 100, fontWeight: 900, lineHeight: 1,
                      color: "rgba(255,255,255,0.025)", pointerEvents: "none", userSelect: "none",
                    }}>
                      {String(menu.id).padStart(2, "0")}
                    </div>

                    <div style={{ padding: isMobile ? "24px 20px" : "28px 32px" }}>

                      {/* Tag */}
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 12px", background: ts.bg, border: `1px solid ${ts.border}`, marginBottom: 18 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: ts.color }} />
                        <span className="bc" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: ts.color }}>
                          {menu.tag}
                        </span>
                      </div>

                      {/* Nombre */}
                      <h2 className="bc" style={{
                        fontSize: isMobile ? 24 : 28, fontWeight: 900,
                        textTransform: "uppercase", letterSpacing: "-0.01em",
                        lineHeight: 1.05, marginBottom: 16, color: "#fff",
                      }}>
                        {menu.nombre}
                      </h2>

                      {/* Lista de platos */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                        {menu.comidas.map((c, ci) => (
                          <div key={ci} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 14, flexShrink: 0 }}>{ICONOS_COMIDA[ci] || "🍽️"}</span>
                            <div>
                              <span className="bc" style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", textTransform: "uppercase", marginRight: 6 }}>
                                {c.numero}
                              </span>
                              <span className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 300 }}>
                                {c.nombre}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer card */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontWeight: 300 }}>
                          {totalComidas} comidas en el día
                        </span>
                        <span className="bc" style={{ fontSize: 13, color: R, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                          Ver menú <span style={{ fontSize: 16 }}>→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Nota informativa */}
            <div style={{ marginTop: 36, padding: "18px 24px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ color: R, fontSize: 16, flexShrink: 0, marginTop: 1 }}>◆</span>
              <p className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, fontWeight: 300 }}>
                <strong style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>CHO Bajos</strong> — ideal para días de descanso o baja actividad. &nbsp;
                <strong style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>CHO Moderados</strong> — diseñados para días de entrenamiento. Consulta con Coach David si tienes dudas sobre cuál elegir.
              </p>
            </div>
          </div>
        )}

        {/* ════ VISTA: DETALLE DEL MENÚ ════════════════════════ */}
        {menuSeleccionado && (
          <div style={{ animation: "fadeUp 0.35s ease", paddingTop: 20 }}>
            {(() => {
              const ts = tagStyle(menuSeleccionado.tag)
              return (
                <>
                  {/* Header */}
                  <div style={{ marginBottom: 36 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 12px", background: ts.bg, border: `1px solid ${ts.border}`, marginBottom: 16 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: ts.color }} />
                      <span className="bc" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: ts.color }}>
                        {menuSeleccionado.tag}
                      </span>
                    </div>

                    <h1 className="bc" style={{
                      fontSize: isMobile ? "clamp(36px, 10vw, 52px)" : "clamp(44px, 4.5vw, 64px)",
                      fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9,
                      letterSpacing: "-0.02em", marginBottom: 14,
                    }}>
                      {menuSeleccionado.nombre}
                    </h1>

                    <p className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>
                      {menuSeleccionado.comidas.length} comidas · Toca cada una para ver los alimentos
                    </p>
                  </div>

                  {/* Comidas accordion */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {menuSeleccionado.comidas.map((comida, ci) => {
                      const isOpen = comidaAbierta === ci
                      const icono = ICONOS_COMIDA[ci] || "🍽️"

                      return (
                        <div key={ci}
                          style={{
                            border: `1px solid ${isOpen ? `${R}40` : "rgba(255,255,255,0.08)"}`,
                            background: isOpen ? "#0d0000" : "#090909",
                            transition: "all 0.25s ease",
                            overflow: "hidden",
                          }}
                        >
                          {/* Header comida */}
                          <button
                            onClick={() => setComidaAbierta(isOpen ? null : ci)}
                            style={{
                              width: "100%", background: "none", border: "none", cursor: "pointer",
                              padding: isMobile ? "18px 18px" : "22px 28px",
                              display: "flex", alignItems: "center", gap: 16,
                              textAlign: "left",
                            }}
                          >
                            {/* Ícono */}
                            <div style={{
                              width: 44, height: 44, flexShrink: 0,
                              background: isOpen ? `${R}18` : "rgba(255,255,255,0.04)",
                              border: `1px solid ${isOpen ? `${R}40` : "rgba(255,255,255,0.08)"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 20, transition: "all 0.2s ease",
                            }}>
                              {icono}
                            </div>

                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                                <span className="bc" style={{ fontSize: 11, color: isOpen ? R : "rgba(255,255,255,0.25)", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase" }}>
                                  {comida.numero}
                                </span>
                                <span className="bc" style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, textTransform: "uppercase", color: isOpen ? "#fff" : "rgba(255,255,255,0.8)", letterSpacing: "-0.01em" }}>
                                  {comida.nombre}
                                </span>
                              </div>
                              <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontWeight: 300 }}>
                                {comida.alimentos.length} alimentos
                              </span>
                            </div>

                            {/* Chevron */}
                            <div style={{
                              width: 28, height: 28, flexShrink: 0,
                              border: `1px solid ${isOpen ? `${R}40` : "rgba(255,255,255,0.1)"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: isOpen ? R : "rgba(255,255,255,0.3)",
                              fontSize: 14, transition: "all 0.2s ease",
                              transform: isOpen ? "rotate(180deg)" : "none",
                            }}>
                              ▾
                            </div>
                          </button>

                          {/* Alimentos */}
                          {isOpen && (
                            <div style={{ borderTop: `1px solid ${R}25`, animation: "slideIn 0.2s ease" }}>

                              {comida.alimentos.map((al, ai) => (
                                <div key={ai} className="alimento-item"
                                  style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: isMobile ? "13px 18px" : "13px 28px",
                                    borderBottom: ai < comida.alimentos.length - 1
                                      ? "1px solid rgba(255,255,255,0.04)" : "none",
                                    gap: 12, transition: "background 0.15s ease",
                                  }}
                                >
                                  {/* Dot + nombre */}
                                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                                    <div style={{ width: 5, height: 5, background: R, flexShrink: 0, transform: "rotate(45deg)", opacity: 0.7 }} />
                                    <span className="b" style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 400, whiteSpace: isMobile ? "normal" : "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                      {al.nombre}
                                    </span>
                                  </div>

                                  {/* Cantidad — único dato visible */}
                                  <div style={{
                                    flexShrink: 0,
                                    padding: "5px 14px",
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                  }}>
                                    <span className="bc" style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>
                                      {al.cantidad}
                                    </span>
                                  </div>
                                </div>
                              ))}

                              {/* Footer comida */}
                              <div style={{ padding: isMobile ? "14px 18px" : "14px 28px", background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 4, height: 4, background: R, flexShrink: 0 }} />
                                <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 300 }}>
                                  {comida.alimentos.length} alimentos en esta comida
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Nota de Coach David */}
                  <div style={{ marginTop: 28, padding: "22px 26px", border: `1px solid ${R}20`, background: `${R}06`, display: "flex", gap: 14 }}>
                    <span style={{ color: R, fontSize: 18, flexShrink: 0, marginTop: 2 }}>◆</span>
                    <div>
                      <div className="bc" style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7, color: "#fff" }}>
                        Recuerda
                      </div>
                      <p className="b" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, fontWeight: 300 }}>
                        Las cantidades están en gramos y pesadas en <strong style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>crudo</strong>, salvo que se indique cocido. Mantén los alimentos y gramajes indicados para respetar tu plan. Si necesitas hacer un cambio o tienes una duda, escríbele a Coach David.
                      </p>
                    </div>
                  </div>

                  {/* CTA WhatsApp */}
                  <div style={{ marginTop: 14, textAlign: "center" }}>
                    <a
                      href={`https://wa.me/573243747367?text=Hola Coach David, tengo una duda sobre el ${menuSeleccionado.nombre}`}
                      target="_blank" rel="noopener noreferrer" className="bc"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 10,
                        padding: "13px 28px",
                        border: "1px solid rgba(34,197,94,0.25)",
                        color: "#22c55e", fontSize: 13, fontWeight: 800,
                        letterSpacing: "0.15em", textTransform: "uppercase",
                        textDecoration: "none", transition: "all 0.25s ease",
                      }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "#22c55e"; el.style.color = "#000" }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "transparent"; el.style.color = "#22c55e" }}
                    >
                      ¿Dudas? Escríbele a Coach David →
                    </a>
                  </div>

                  {/* Navegar entre menús */}
                  <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span className="b" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", alignSelf: "center", marginRight: 4 }}>Otros menús:</span>
                    {MENUS_PLAN.filter(m => m.id !== menuSeleccionado.id).slice(0, isMobile ? 3 : 5).map(m => {
                      const ts2 = tagStyle(m.tag)
                      return (
                        <button key={m.id} onClick={() => abrirMenu(m)} className="bc"
                          style={{ padding: "7px 14px", border: `1px solid ${ts2.border}`, background: ts2.bg, color: ts2.color, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s ease" }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
                          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                        >
                          {m.nombre}
                        </button>
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
        Este plan de alimentación es exclusivo para clientes de Coach David. Contacta a tu coach para obtener tu acceso.
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
        <div style={{ width: 28, height: 28, border: "2px solid #E8000D", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Cargando tu plan...</p>
      </div>
    </div>
  )
}
