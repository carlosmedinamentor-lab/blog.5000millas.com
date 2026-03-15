import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Anchor, Mail, User, ArrowRight, Loader2, ArrowUpRight } from 'lucide-react';

const manifestos = [
  {
    id: 1,
    title: "El peso invisible del Árbol de la Muerte",
    excerpt: "La culpa no es un sentimiento, es una táctica de tu ego para mantenerte anclado en un puerto que ya no existe. Despertar exige cortar la cuerda."
  },
  {
    id: 2,
    title: "El Diamante y la tiranía del confort",
    excerpt: "Huyes de la presión porque te enseñaron que la paz es ausencia de conflicto. Pero el carbón nunca se transforma en el sofá de tu sala."
  },
  {
    id: 3,
    title: "Soberanía interior frente al ruido",
    excerpt: "Si tu agenda la dictan las urgencias de otros, no eres un líder, eres un empleado de las circunstancias. Retoma el timón."
  }
];

export default function App() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !nombre) return;

    setStatus('loading');

    try {
      const response = await fetch(
        'https://services.leadconnectorhq.com/hooks/JjPQcPMDSUM4LdEE0pGZ/webhook-trigger/55986cb3-c02e-4cfa-a845-cc435d70f9eb',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, nombre, source: 'blog_5000millas' }),
        }
      );

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20 relative overflow-x-hidden">
      {/* Radial Gradient Background (Top) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-transparent opacity-50 blur-3xl pointer-events-none z-0"></div>

      {/* SECTION 1: HERO Y CAPTURA */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20 w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center w-full"
        >
          {/* Top Icon */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="mb-12 text-white/20"
          >
            <Anchor size={32} strokeWidth={1.5} />
          </motion.div>

          {/* Main Title */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-8 text-white/90">
            El Faro de las 5:00 A.M.
          </h1>

          {/* Subtitle */}
          <p className="font-serif italic text-white/50 text-lg md:text-xl max-w-2xl leading-relaxed mb-16">
            Recibe cada madrugada una reflexión multidimensional de 500 palabras diseñada para despertar tu conciencia y pulir tu Identidad Verdadera.
          </p>

          {/* Form / Success State Area */}
          <div className="w-full max-w-md flex items-center justify-center">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center p-8 border border-white/10 rounded-2xl bg-white/[0.02] backdrop-blur-sm w-full"
                >
                  <Mail className="text-white/40 mb-4" size={24} strokeWidth={1.5} />
                  <h3 className="font-serif text-xl text-white/90 mb-2">Te has unido a la expedición.</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Busca en tu bandeja de entrada (y en spam) un correo de confirmación. Tu primera lección llegará mañana a las 5:00 a.m.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-3 w-full"
                >
                  <div className="relative flex items-center w-full bg-[#0d0d0d] border border-white/10 rounded-full p-1.5 pl-5 transition-colors focus-within:border-white/40">
                    <User className="text-white/40 shrink-0" size={18} strokeWidth={1.5} />
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Tu nombre..."
                      required
                      disabled={status === 'loading'}
                      className="flex-grow bg-transparent border-none outline-none text-white placeholder:text-white/30 px-4 py-2.5 text-sm font-light disabled:opacity-50"
                    />
                  </div>
                  <div className="relative flex items-center w-full bg-[#0d0d0d] border border-white/10 rounded-full p-1.5 pl-5 transition-colors focus-within:border-white/40">
                    <Mail className="text-white/40 shrink-0" size={18} strokeWidth={1.5} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Correo electrónico..."
                      required
                      disabled={status === 'loading'}
                      className="flex-grow bg-transparent border-none outline-none text-white placeholder:text-white/30 px-4 py-2.5 text-sm font-light disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading' || !email || !nombre}
                    className="flex items-center justify-center gap-2 bg-white text-black rounded-full px-6 py-3.5 hover:bg-white/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed w-full"
                  >
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase mt-[1px]">
                      Entrar a la tribu
                    </span>
                    {status === 'loading' ? (
                      <Loader2 size={14} className="animate-spin" strokeWidth={2.5} />
                    ) : (
                      <ArrowRight size={14} strokeWidth={2.5} />
                    )}
                  </button>
                  {status === 'error' && (
                    <p className="text-red-400/80 text-xs text-center mt-1">
                      Algo salió mal. Inténtalo de nuevo.
                    </p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* SECCIÓN 2: LOS 3 MANIFIESTOS */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-32">
        {/* Encabezado de Sección */}
        <div className="border-t border-white/5 pt-8 mb-12 text-center">
          <h2 className="text-[10px] tracking-widest uppercase text-white/20 font-sans">
            Registros recientes de la expedición
          </h2>
        </div>

        {/* Grid de Artículos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {manifestos.map((manifesto, index) => (
            <motion.article
              key={manifesto.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-col border-t border-white/10 pt-6 hover:border-white/40 transition-colors duration-500 cursor-pointer bg-transparent"
            >
              <span className="text-[9px] font-sans tracking-widest text-white/40 uppercase mb-3">
                Hoy | 5:00 A.M.
              </span>
              
              <h3 className="font-serif text-xl md:text-2xl leading-snug text-white/90 transition-transform duration-500 group-hover:translate-x-2">
                {manifesto.title}
              </h3>
              
              <p className="font-serif italic text-sm text-white/50 mt-3 line-clamp-3 leading-relaxed">
                {manifesto.excerpt}
              </p>
              
              <div className="mt-6 flex items-center gap-1 text-xs font-sans uppercase tracking-wider text-white/30 group-hover:text-white transition-colors duration-500 mt-auto pt-4">
                <span>Leer manifiesto</span>
                <ArrowUpRight size={14} strokeWidth={1.5} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 pb-12 text-center w-full">
        <p className="text-[9px] tracking-[0.4em] uppercase text-white/15 font-sans">
          © 2026 - El Club de las 5.000 Millas - Método BDL
        </p>
      </footer>
    </div>
  );
}
