import type { Metadata, Viewport } from 'next'
import { Inter, Anton } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

const anton = Anton({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-anton'
});

export const metadata: Metadata = {
  title: 'Coach David — Entrenamiento de hipertrofia basado en ciencia',
  description: 'Programas de hipertrofia 100% personalizados, diseñados con evidencia científica. Construye el músculo que mereces con Coach David.',
  icons: {
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/coach-david-logo.png-HJEU1xOKdIZ1vRDRpom9Q5cTJg2WTi.jpeg',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>

        {/* NAVBAR */}
        <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-black/70 border-b border-white/10">
          <div className="container mx-auto px-8 flex items-center justify-between h-16">

            {/* LOGO */}
            <a href="/" className="font-bold text-lg tracking-wide">
              COACH<span className="text-red-500">.</span>DAVID
            </a>

            {/* MENU */}
            <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
              <a href="/" className="hover:text-white transition">Inicio</a>
              <a href="/asesoria" className="hover:text-white transition">Asesoría</a>
              <a href="/sobre-mi" className="hover:text-white transition">Sobre mí</a>
              <a href="/blog" className="hover:text-white transition">Blog</a>
              <a href="/nutricion-cuestionario" className="hover:text-white transition">Evaluación</a>
              <a href="/diario-comidas" className="hover:text-white transition">Seguimiento</a>
            </nav>

            {/* CTA */}
            <a
              href="/asesoria"
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-semibold"
            >
              Empezar
            </a>

          </div>
        </header>

        {/* CONTENIDO */}
        <main className="pt-16">
          {children}
        </main>

      </body>
    </html>
  )
}
