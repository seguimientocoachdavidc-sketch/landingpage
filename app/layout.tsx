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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${anton.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
