"use client"

import { useEffect, useState } from "react"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* LOGO */}
        <a href="/" className="flex items-center gap-2 group">
          <span className="font-display text-xl tracking-wide">
            COACH<span className="text-red-500">.</span>DAVID
          </span>
        </a>

        {/* MENU */}
        <nav className="hidden md:flex items-center gap-10 text-sm uppercase tracking-wider">

          {[
            { name: "Inicio", href: "/" },
            { name: "Asesoría", href: "/asesoria" },
            { name: "Sobre mí", href: "/sobre-mi" },
            { name: "Blog", href: "/blog" },
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="relative text-white/60 hover:text-white transition group"
            >
              {item.name}

              {/* UNDERLINE ANIMADO */}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-red-500 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}

        </nav>

        {/* CTA */}
        <div className="flex items-center gap-4">

          <a
            href="https://wa.me/573243747367"
            target="_blank"
            className="hidden md:inline text-white/60 hover:text-white text-sm transition"
          >
            WhatsApp
          </a>

          <a
            href="/asesoria"
            className="relative overflow-hidden bg-red-500 text-white px-6 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-300 hover:scale-105"
          >
            Aplicar

            {/* EFECTO GLOW */}
            <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition" />
          </a>

        </div>
      </div>
    </header>
  )
}
