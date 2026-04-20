"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowRight, X, Target, MessageCircle, TrendingUp } from "lucide-react"

const problemas = [
  { t: "Entrenas sin estructura", d: "Cambias de rutina cada semana, copias lo que ves en redes y nunca sabes si lo que haces realmente funciona." },
  { t: "No aplicas progresión", d: "Levantas el mismo peso, las mismas repes, los mismos ejercicios. Sin sobrecarga progresiva, no hay crecimiento muscular. Punto." },
  { t: "Ignoras la ciencia", d: "Te dejas llevar por mitos, influencers y \"rutinas mágicas\". Tu cuerpo responde a estímulos específicos, no a modas." },
]

const pilares = [
  { t: "Plan 100% personalizado", d: "Diseñado para tu nivel, tu disponibilidad y tu morfología. Cada ejercicio tiene un propósito." },
  { t: "Programación con evidencia", d: "Volumen, frecuencia e intensidad calibrados según la literatura científica más actual en hipertrofia." },
  { t: "Seguimiento semanal", d: "Reviso tu progreso cada semana y ajusto el plan. No estás solo: estás guiado en cada paso." },
]

const beneficios = [
  { t: "Construye músculo de verdad", d: "Estímulos específicos para hipertrofia. Cada serie cuenta, cada repetición tiene una razón." },
  { t: "Entrena con estructura", d: "Mesociclos planificados, deloads programados, progresión clara. Sabes exactamente qué hacer cada día." },
  { t: "Deja de perder el tiempo", d: "Sesiones eficientes de 45–75 min. Sin ejercicios inútiles, sin volumen basura." },
  { t: "Entrena seguro y sin lesiones", d: "Técnica priorizada, cargas inteligentes y prevención de lesiones desde el día uno." },
]



export default function CoachDavidPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", goal: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const [showWhatsApp, setShowWhatsApp] = useState(false)

useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowWhatsApp(true)
    } else {
      setShowWhatsApp(false)
    }
  }

  window.addEventListener("scroll", handleScroll)
  return () => window.removeEventListener("scroll", handleScroll)
}, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        setShowToast(true)
        setFormData({ name: "", email: "", phone: "", goal: "" })
        setTimeout(() => setShowToast(false), 4000)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* NAVBAR */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-8 flex items-center justify-between h-16">
          <a href="#" className="flex items-center" aria-label="Coach David">
            <Image 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/coach-david-logo.png-HJEU1xOKdIZ1vRDRpom9Q5cTJg2WTi.jpeg" 
              alt="Coach David logo" 
              width={180} 
              height={40} 
              className="h-9 md:h-10 w-auto object-contain"
            />
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#problema" className="hover:text-foreground transition-colors">Problema</a>
            <a href="#metodo" className="hover:text-foreground transition-colors">Método</a>
            <a href="#resultados" className="hover:text-foreground transition-colors">Resultados</a>
            <a href="#proceso" className="hover:text-foreground transition-colors">Proceso</a>
          </nav>
          <a href="#contacto" className="inline-flex items-center justify-center h-9 px-4 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm transition-colors">
            Quiero Aplicar ahora
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
        <Image 
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero-athlete-tTtwv27TBXRvv149KOi0bYPpjvp8kO.jpg" 
          alt="Atleta entrenando hipertrofia con barra" 
          fill
          className="object-cover object-right opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-radial" />

        <div className="container mx-auto px-8 relative z-10 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur text-xs uppercase tracking-widest text-muted-foreground mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>
              </svg>
              Entrenamiento basado en ciencia
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl uppercase">
              Entrena con<br />
              <span className="text-gradient">estructura</span>, no<br />
              con intuición.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Programas de Entrenamiento 100% personalizados, diseñados con evidencia y estructura científica. Deja de improvisar y adivinar en el gimnasio y empieza a ver resultados con métodos probados y medibles.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a href="#contacto" className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base h-14 px-8 rounded-sm animate-pulse-glow transition-colors">
                Empieza tu transformación
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
              <a href="#contacto" className="inline-flex items-center justify-center border border-border bg-card/40 backdrop-blur hover:bg-card font-semibold text-base h-14 px-8 rounded-sm transition-colors">
                Obtén tu programa personalizado
              </a>
            </div>
            <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <div className="font-display text-3xl md:text-4xl text-primary">+6</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Estudios de entrenamiento</div>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl text-primary">+8 años</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">De experiencia</div>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl text-primary">100%</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Basado en Ciencia y Evidencia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* MENSAJE */}
      <section className="relative py-24 border-t border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-60" />
      
        <div className="container mx-auto px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            
            <span className="text-primary text-sm uppercase tracking-[0.2em] font-semibold">
              No es para todos
            </span>
      
            <h2 className="font-display text-4xl md:text-6xl uppercase mt-4 leading-tight">
              Esto no es para personas<br />
              que buscan <span className="text-destructive">rutinas genéricas</span>.
            </h2>
      
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Si quieres resultados reales, necesitas estructura. No más improvisación, no más entrenar sin dirección.
            </p>
          </div>
      
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
            
            <div className="p-8 rounded-sm bg-card border border-border hover:border-destructive/40 transition-smooth text-center">
              <div className="font-display text-4xl text-destructive mb-4">01</div>
              <h3 className="font-display text-xl uppercase">No improvisación</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                Cada sesión tiene un objetivo claro dentro de un sistema estructurado.
              </p>
            </div>
      
            <div className="p-8 rounded-sm bg-card border border-border hover:border-destructive/40 transition-smooth text-center">
              <div className="font-display text-4xl text-destructive mb-4">02</div>
              <h3 className="font-display text-xl uppercase">No entrenar sin progresión</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                Si no hay sobrecarga progresiva, no hay crecimiento muscular. Así de simple.
              </p>
            </div>
      
            <div className="p-8 rounded-sm bg-card border border-border hover:border-destructive/40 transition-smooth text-center">
              <div className="font-display text-4xl text-destructive mb-4">03</div>
              <h3 className="font-display text-xl uppercase">No programas sin estructura</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                Volumen, intensidad y frecuencia diseñados con intención, no al azar.
              </p>
            </div>
      
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section id="problema" className="relative py-24 md:py-32 border-t border-border">
        <div className="container mx-auto px-8">
          <div className="max-w-3xl">
            <span className="text-primary text-sm uppercase tracking-[0.2em] font-semibold">El problema</span>
            <h2 className="font-display text-4xl md:text-6xl uppercase mt-4">
              Llevas años en el gym<br />y sigues <span className="text-destructive">improvisando igual</span>.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              No es falta de esfuerzo. Es falta de método. Si no ves resultados, hay tres razones — y probablemente las cometes todas.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {problemas.map((item, idx) => (
              <div key={idx} className="group p-8 rounded-sm bg-card border border-border hover:border-destructive/50 transition-smooth">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-sm bg-destructive/10 border border-destructive/30 flex items-center justify-center">
                    <X className="w-5 h-5 text-destructive" />
                  </div>
                  <span className="font-display text-2xl text-muted-foreground">0{idx + 1}</span>
                </div>
                <h3 className="font-display text-2xl uppercase">{item.t}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUCIÓN */}
      <section id="metodo" className="relative py-24 md:py-32 border-t border-border bg-gradient-radial">
        <div className="container mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
            <Image 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/coach-david.jpg-j0eTn9gq3pqx6bGA07zd0yEC7lNLZ0.png" 
              alt="Coach David, entrenador especializado en hipertrofia" 
              width={600}
              height={800}
              className="relative rounded-sm border border-border shadow-card w-full"
            />
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground px-6 py-4 rounded-sm font-display text-xl uppercase">
              Coach David
            </div>
          </div>
          <div>
            <span className="text-primary text-sm uppercase tracking-[0.2em] font-semibold">La solución</span>
            <h2 className="font-display text-4xl md:text-6xl uppercase mt-4">
              Un método<br />probado.<br /><span className="text-gradient">Sin atajos.</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Soy David, Coach especializado en hipertrofia y entrenamiento basado en ciencia (ciencia de verdad). Durante años, He guiado a personas a entrenar y construir un físico estetico de forma correcta.
            </p>
            <div className="mt-10 space-y-5">
              {pilares.map((pilar, idx) => (
                <div key={idx} className="flex gap-4 p-5 rounded-sm bg-card/60 border border-border">
                  <div className="shrink-0 w-12 h-12 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl uppercase">{pilar.t}</h3>
                    <p className="text-muted-foreground mt-1">{pilar.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <a href="#contacto" className="inline-flex items-center justify-center mt-10 bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-14 px-8 rounded-sm transition-colors">
              Quiero mi programa
            </a>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="resultados" className="relative py-24 md:py-32 border-t border-border">
        <div className="container mx-auto px-8">
          <div className="max-w-3xl">
            <span className="text-primary text-sm uppercase tracking-[0.2em] font-semibold">Resultados reales</span>
            <h2 className="font-display text-4xl md:text-6xl uppercase mt-4">
              Lo que vas a<br />conseguir.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-px mt-16 bg-border border border-border rounded-sm overflow-hidden">
            {beneficios.map((beneficio, idx) => (
              <div key={idx} className="bg-background p-8 md:p-10 hover:bg-card transition-smooth group">
                <TrendingUp className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-smooth" />
                <h3 className="font-display text-2xl md:text-3xl uppercase">{beneficio.t}</h3>
                <p className="text-muted-foreground mt-3 leading-relaxed">{beneficio.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESO */}
      <section id="proceso" className="relative py-24 md:py-32 border-t border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="container mx-auto px-8 relative">
          <div className="max-w-3xl">
            <span className="text-primary text-sm uppercase tracking-[0.2em] font-semibold">El proceso</span>
            <h2 className="font-display text-4xl md:text-6xl uppercase mt-4">
              Empezar es<br />simple.
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8 mt-16 relative">
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            
            <div className="relative text-center md:text-left">
              <div className="inline-flex w-20 h-20 rounded-full bg-background border-2 border-primary items-center justify-center font-display text-2xl text-primary mb-6 relative z-10">01</div>
              <h3 className="font-display text-3xl uppercase">Aplicas</h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">Rellenas un breve formulario contándome tu nivel, tus objetivos y tu disponibilidad. Si encajamos, hablamos.</p>
            </div>
            
            <div className="relative text-center md:text-left">
              <div className="inline-flex w-20 h-20 rounded-full bg-background border-2 border-primary items-center justify-center font-display text-2xl text-primary mb-6 relative z-10">02</div>
              <h3 className="font-display text-3xl uppercase">Recibes tu Programa</h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">Entre 24-72 horas tienes tu programa de entrenamiento personalizado (y guía de alimentación si aplica), con vídeos y guía de ejecución.</p>
            </div>
            
            <div className="relative text-center md:text-left">
              <div className="inline-flex w-20 h-20 rounded-full bg-background border-2 border-primary items-center justify-center font-display text-2xl text-primary mb-6 relative z-10">03</div>
              <h3 className="font-display text-3xl uppercase">Seguimiento semanal</h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">Cada semana revisamos tu progreso, ajustamos cargas y resolvemos dudas. Avance constante, sin estancamientos.</p>
            </div>
            <div className="relative text-center md:text-left">
              <div className="inline-flex w-20 h-20 rounded-full bg-background border-2 border-primary items-center justify-center font-display text-2xl text-primary mb-6 relative z-10">04</div>
              <h3 className="font-display text-3xl uppercase">Programa de Clase Mundial</h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Hacemos un seguimiento constante mediante una plantilla editable de clase mundial que nos permite ver tendencias, aplicar sobrecarga progresiva y detectar estancamientos a tiempo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="relative py-24 md:py-32 border-t border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="container mx-auto px-8 relative">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="text-primary text-sm uppercase tracking-[0.2em] font-semibold">Es tu momento</span>
            <h2 className="font-display text-5xl md:text-7xl uppercase mt-4">
              Empieza hoy y<br />construye el físico<br />que <span className="text-gradient">quieres.</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Plazas limitadas cada mes para garantizar un seguimiento personalizado. Aplica ahora y empieza la próxima semana.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <form onSubmit={handleSubmit} className="p-8 md:p-10 rounded-sm border border-border bg-card shadow-card">
              <h3 className="font-display text-2xl uppercase mb-6">Solicita tu plan</h3>
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block uppercase text-xs tracking-widest text-muted-foreground">Nombre</label>
                  <input 
                    id="name" 
                    name="name" 
                    required 
                    placeholder="Tu nombre" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-2 h-12 w-full rounded-sm bg-background border border-border px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block uppercase text-xs tracking-widest text-muted-foreground">Email</label>
                  <input 
                    id="email" 
                    type="email" 
                    name="email" 
                    required 
                    placeholder="tu@email.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-2 h-12 w-full rounded-sm bg-background border border-border px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block uppercase text-xs tracking-widest text-muted-foreground">WhatsApp / Teléfono</label>
                  <input 
                    id="phone" 
                    type="tel" 
                    name="phone" 
                    required 
                    placeholder="+57 300 123 4567" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-2 h-12 w-full rounded-sm bg-background border border-border px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label htmlFor="goal" className="block uppercase text-xs tracking-widest text-muted-foreground">Objetivo fitness</label>
                  <textarea 
                    id="goal" 
                    name="goal" 
                    required 
                    rows={4} 
                    placeholder="Cuéntame qué quieres conseguir y tu nivel actual…" 
                    value={formData.goal}
                    onChange={(e) => setFormData({...formData, goal: e.target.value})}
                    className="mt-2 w-full rounded-sm bg-background border border-border px-3 py-2 text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-14 rounded-sm transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? "Enviando…" : "Aplicar ahora"}
                </button>
              </div>
            </form>

            <div className="flex flex-col gap-6">
              <div className="p-8 md:p-10 rounded-sm border border-primary/30 bg-primary/5 flex-1 flex flex-col justify-between">
                <div>
                  <MessageCircle className="w-10 h-10 text-primary mb-5" />
                  <h3 className="font-display text-2xl uppercase">¿Prefieres WhatsApp?</h3>
                  <p className="text-muted-foreground mt-3">Escríbeme directamente y te respondo personalmente. Sin bots, sin filtros.</p>
                </div>
                <a 
                  href="https://wa.me/573243747367?text=Hola%20Coach%20David%2C%20quiero%20empezar%20un%20plan%20personalizado.%20Mi%20objetivo%20es%20_____" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center mt-8 border border-primary/40 hover:bg-primary hover:text-primary-foreground font-semibold h-14 rounded-sm transition-colors"
                >
                  Hablar por WhatsApp
                </a>
              </div>
              <div className="p-6 rounded-sm border border-border bg-card">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="font-display text-3xl text-primary">24h</div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Respuesta</div>
                  </div>
                  <div>
                    <div className="font-display text-3xl text-primary">72h</div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Tu plan listo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="font-display text-lg tracking-wide text-foreground">COACH<span className="text-primary">.</span>DAVID</div>
          <p>© {new Date().getFullYear()} Coach David. Entrenamiento basado en ciencia.</p>
          <div className="flex gap-6">
            <a 
              href="https://www.instagram.com/coachfitdavid/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Instagram
            </a>
            
            <a 
              href="#" 
              className="hover:text-foreground transition-colors"
            >
              YouTube
            </a>
          </div>
        </div>
      </footer>

      {/* TOAST */}
      <div 
        className={`fixed bottom-24 right-6 bg-card border border-border p-4 rounded max-w-[360px] transition-transform duration-400 z-50 ${showToast ? 'translate-y-0' : 'translate-y-[120%]'}`}
        role="status" 
        aria-live="polite"
      >
        <div className="font-display text-lg uppercase">¡Solicitud enviada!</div>
        <div className="text-muted-foreground text-sm mt-1">Te contactaré en menos de 24 horas para empezar tu transformación.</div>
      </div>

      <a
          href="https://wa.me/573243747367?text=Hola%20Coach%20David,%20quiero%20estructurar%20mi%20entrenamiento%20correctamente."
          target="_blank"
          rel="noopener noreferrer"
          className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
            showWhatsApp
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10 pointer-events-none"
          }`}
        >
          <div className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-full shadow-lg animate-pulse">
        
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.52 3.48A11.9 11.9 0 0012.01 0C5.38 0 .01 5.37.01 12c0 2.12.56 4.19 1.62 6.02L0 24l6.15-1.61A11.93 11.93 0 0012.01 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.49-8.52z"/>
            </svg>
        
            <span className="hidden md:inline text-sm font-semibold">
              Hablar por WhatsApp
            </span>
        
          </div>
        </a>
    </>
  )
}
