import { useState } from 'react';
import { Anchor, Mail, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Fuente Serif elegante (puedes configurarla en tu tailwind.config si usas Google Fonts)
// font-serif debe apuntar a una fuente como 'Playfair Display' o 'Cormorant Garamond'

export default function BlogLandingPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'loading') return;
    
    setStatus('loading');
    
    // AQUÍ CONECTAREMOS LUEGO LA API (Mailchimp, ConvertKit, Loopear, etc.)
    try {
      // Simulación de envío API
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] font-sans selection:bg-white/10 overflow-hidden relative">
      
      // Sutil degradado de fondo para dar profundidad
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#050505] opacity-60" />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center"
      >
        <div className="max-w-3xl mx-auto space-y-16">
          
          // Ícono central (El Barco)
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            <Anchor className="w-14 h-14 mx-auto mb-10 text-white/20 animate-pulse" strokeWidth={1} />
          </motion.div>

          // Título Principal y Manifiesto Breve
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="space-y-6"
          >
            <h1 className="font-serif text-5xl md:text-8xl font-light tracking-tighter leading-none">
              El Faro de las<br/>5:00 A.M.
            </h1>
            <p className="text-xl md:text-2xl text-white/50 font-serif italic max-w-xl mx-auto leading-relaxed">
              Recibe cada madrugada una reflexión multidimensional de 500 palabras diseñada para despertar tu conciencia y pulir tu Identidad Verdadera. Sin poesía, solo verdad profunda.
            </p>
          </motion.div>
          
          // Formulario de Registro Elegante
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="w-full max-w-lg mx-auto"
          >
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-8 border border-white/10 rounded-3xl bg-white/5 text-center space-y-4"
                >
                  <Mail className="w-10 h-10 mx-auto text-white/40" />
                  <h3 className="font-serif text-2xl text-white/90">Te has unido a la expedición.</h3>
                  <p className="text-sm text-white/60 leading-relaxed italic">
                    Busca en tu bandeja de entrada (y en spam) un correo de confirmación. Tu primera lección llegará mañana a las 5:00 a.m.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-center bg-[#0d0d0d] border border-white/5 p-3 rounded-full shadow-inner group transition-all duration-500 focus-within:border-white/20">
                  
                  <div className="flex items-center gap-3 pl-4 flex-1 w-full">
                    <Mail className="w-5 h-5 text-white/20 group-focus-within:text-white/50 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Tu correo electrónico..."
                      required
                      disabled={status === 'loading'}
                      className="flex-1 bg-transparent py-3 text-lg text-white placeholder:text-white/20 focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className="flex items-center justify-center gap-3 w-full md:w-auto px-10 py-4 bg-white text-black rounded-full font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-white/90 transition-all shadow-md disabled:opacity-50 hover:scale-105 active:scale-95 whitespace-nowrap"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        Entrar a la Tribu
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </AnimatePresence>
            
            {status === 'error' && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-4 tracking-widest uppercase">
                Hubo un error en la travesía. Intenta de nuevo.
              </motion.p>
            )}
          </motion.div>

        </div>
      </motion.div>

      // Sutil Footer de Propiedad
      <footer className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-[9px] uppercase tracking-[0.5em] text-white/15">
          © 2026 - El Club de las 5.000 Millas - Método BDL
        </p>
      </footer>
    </div>
  );
}
