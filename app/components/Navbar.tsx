"use client"

import { useEffect, useState } from "react"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">

        {/* LOGO */}
        <a href="/" className="flex items-center">
          <img
            src="/Logo letra blanca al lado.jpg"
            alt="Coach David"
            className="h-8"
          />
        </a>

        {/* LINKS */}
        <nav className="hidden md:flex items-center gap-10 text-sm uppercase tracking-wide">

          <a href="/" className="text-muted-foreground hover:text-white transition">
            Inicio
          </a>

          <a href="/asesoria" className="text-muted-foreground hover:text-white transition">
            Asesoría
          </a>

          <a href="/sobre-mi" className="text-muted-foreground hover:text-white transition">
            Sobre mí
          </a>

          <a href="/blog" className="text-muted-foreground hover:text-white transition">
            Blog
          </a>

        </nav>

        {/* CTA */}
        <div className="flex items-center gap-4">

          <a
            href="https://wa.me/573243747367"
            target="_blank"
            className="hidden md:inline text-sm text-muted-foreground hover:text-white transition"
          >
            WhatsApp
          </a>

          <a
            href="/asesoria"
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 text-sm font-semibold uppercase tracking-wide transition-all hover:scale-105"
          >
            Aplicar
          </a>

        </div>
      </div>
    </header>
  )
}
