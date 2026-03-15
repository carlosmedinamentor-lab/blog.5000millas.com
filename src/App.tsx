import { useState } from 'react'
import { motion } from 'framer-motion'
const WEBHOOK = 'https://services.leadconnectorhq.com/hooks/JjPQcPMDSUM4LdEE0pGZ/webhook-trigger/55986cb3-c02e-4cfa-a845-cc435d70f9eb'
const manifestos = [
  { id: 1, title: "El peso invisible del Árbol de la Muerte", excerpt: "Debajo de cada comportamiento destructivo hay una raíz que nadie te enseñó a ver. Culpa, vergüenza, miedo — las raíces invisibles que dirigen tu vida mientras crees que eres libre." },
  { id: 2, title: "El Diamante y la tiranía del confort", excerpt: "Un diamante es carbón que soportó presión extraordinaria. Tu zona de confort no te protege — te entierra. La transformación exige fuego." },
  { id: 3, title: "Soberanía interior frente al ruido", excerpt: "El mundo te dice quién deberías ser. Tu ego repite el guion. Pero dentro de ti hay una voz antigua que no necesita aplausos. Es tu león interior." }
]
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.15 } } }
export default function App() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !nombre) return
    setStatus('loading')
    try {
      const res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nombre, source: 'blog_5000millas' })
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch { setStatus('error') }
  }
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e8e8e8' }}>

      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}
        style={{ padding: '48px 0 0', textAlign: 'center' }}
      >
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 11, letterSpacing: 6, color: '#d4a574', textTransform: 'uppercase', margin: 0 }}>5.000 Millas</p>
        <div style={{ width: 40, height: 1, background: '#d4a574', margin: '16px auto 0' }} />
      </motion.header>
      {/* HERO — MENSAJE CENTRAL */}
      <motion.section
        initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.8, delay: 0.3 }}
        style={{ maxWidth: 600, margin: '0 auto', padding: '52px 24px 0', textAlign: 'center' }}
      >
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(34px, 7vw, 52px)', fontWeight: 400, lineHeight: 1.15, color: '#ffffff', margin: '0 0 20px', letterSpacing: -1 }}>
          Transforma tu identidad.
        </h1>
        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16, lineHeight: 1.8, color: '#999', margin: '0 0 20px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
          Un manifiesto diario a las 5:00 AM sobre autoconocimiento, poder interior y dominio propio.
        </p>
        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: '#555', margin: 0, letterSpacing: 1 }}>
          Carlos Medina · +1.000 vidas impactadas · Método BDL
        </p>
      </motion.section>
      {/* FORM */}
      <motion.section
        initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.8, delay: 0.6 }}
        style={{ maxWidth: 400, margin: '40px auto 0', padding: '0 24px' }}
      >
        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', padding: '48px 0' }}
          >
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#d4a574', letterSpacing: 4, textTransform: 'uppercase', margin: '0 0 16px' }}>✦</p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#ffffff', margin: '0 0 12px' }}>Bienvenido al Faro</p>
            <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, color: '#888' }}>Revisa tu email. Tu primer manifiesto está en camino.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="text" placeholder="Tu nombre" required value={nombre}
              onChange={e => setNombre(e.target.value)}
              style={{ background: 'transparent', border: '1px solid #222', padding: '14px 18px', fontSize: 15, color: '#e8e8e8', fontFamily: 'Inter, system-ui, sans-serif', outline: 'none', borderRadius: 2, transition: 'border 0.3s' }}
              onFocus={e => e.target.style.borderColor = '#d4a574'}
              onBlur={e => e.target.style.borderColor = '#222'}
            />
            <input
              type="email" placeholder="Tu email" required value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ background: 'transparent', border: '1px solid #222', padding: '14px 18px', fontSize: 15, color: '#e8e8e8', fontFamily: 'Inter, system-ui, sans-serif', outline: 'none', borderRadius: 2, transition: 'border 0.3s' }}
              onFocus={e => e.target.style.borderColor = '#d4a574'}
              onBlur={e => e.target.style.borderColor = '#222'}
            />
            <button
              type="submit"
              disabled={status === 'loading' || !nombre || !email}
              style={{ background: '#d4a574', color: '#0a0a0a', border: 'none', padding: '16px', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2, fontFamily: 'Inter, system-ui, sans-serif', transition: 'all 0.3s', opacity: (status === 'loading' || !nombre || !email) ? 0.5 : 1 }}
              onMouseEnter={e => { if (status !== 'loading') e.currentTarget.style.background = '#e8c9a0' }}
              onMouseLeave={e => e.currentTarget.style.background = '#d4a574'}
            >
              {status === 'loading' ? 'Enviando...' : 'Recibir manifiesto diario'}
            </button>
            <p style={{ fontSize: 11, color: '#333', textAlign: 'center', margin: '4px 0 0', fontFamily: 'Inter, system-ui, sans-serif' }}>
              Sin spam. Solo verdad. Cada día a las 5:00 AM.
            </p>
          </form>
        )}
      </motion.section>
      {/* DIVIDER */}
      <div style={{ maxWidth: 600, margin: '56px auto', padding: '0 24px' }}>
        <div style={{ borderBottom: '1px solid #141414' }} />
      </div>
      {/* WHAT YOU GET */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
        style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px' }}
      >
        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 10, letterSpacing: 4, color: '#444', textTransform: 'uppercase', margin: '0 0 20px' }}>Qué recibirás</p>
        {[
          'Reflexiones basadas en el Método BDL — Barco, Diamante, León',
          'Herramientas prácticas para las 7 dimensiones de tu vida',
          'Historias reales de transformación',
          'Verdades incómodas que necesitas escuchar'
        ].map((item, i) => (
          <motion.div key={i} variants={fadeUp} style={{ display: 'flex', gap: 14, padding: '13px 0', borderBottom: '1px solid #111' }}>
            <span style={{ color: '#d4a574', fontFamily: 'Georgia, serif', fontSize: 14, flexShrink: 0, paddingTop: 1 }}>→</span>
            <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, lineHeight: 1.7, color: '#888', margin: 0 }}>{item}</p>
          </motion.div>
        ))}
      </motion.section>
      {/* DIVIDER */}
      <div style={{ maxWidth: 600, margin: '56px auto', padding: '0 24px' }}>
        <div style={{ borderBottom: '1px solid #141414' }} />
      </div>
      {/* NOMBRE DEL NEWSLETTER */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.8 }}
        style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}
      >
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: '#d4a574', fontStyle: 'italic', letterSpacing: 1, margin: '0 0 8px' }}>El Faro de las 5:00 AM</p>
        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: '#555', margin: 0 }}>La newsletter del movimiento 5.000 Millas</p>
      </motion.section>
      {/* DIVIDER */}
      <div style={{ maxWidth: 600, margin: '56px auto', padding: '0 24px' }}>
        <div style={{ borderBottom: '1px solid #141414' }} />
      </div>
      {/* MANIFIESTOS */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
        style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px' }}
      >
        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 10, letterSpacing: 4, color: '#444', textTransform: 'uppercase', margin: '0 0 20px' }}>Manifiestos recientes</p>
        {manifestos.map(m => (
          <motion.div
            key={m.id} variants={fadeUp}
            style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', padding: '24px 24px', marginBottom: 10, borderRadius: 2, cursor: 'pointer', transition: 'border-color 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#d4a574'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}
          >
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 400, color: '#e8e8e8', margin: '0 0 8px', lineHeight: 1.4 }}>{m.title}</h3>
            <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, lineHeight: 1.7, color: '#666', margin: 0 }}>{m.excerpt}</p>
          </motion.div>
        ))}
      </motion.section>
      {/* DIAGNOSTIC CTA */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.8 }}
        style={{ maxWidth: 600, margin: '56px auto 0', padding: '0 24px', textAlign: 'center' }}
      >
        <div style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 2, padding: '36px 28px' }}>
          <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 10, letterSpacing: 4, color: '#444', textTransform: 'uppercase', margin: '0 0 16px' }}>Tu siguiente paso</p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#fff', margin: '0 0 8px', fontWeight: 400 }}>Descubre quién eres realmente.</p>
          <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: '#666', margin: '0 0 24px' }}>Diagnóstico gratuito de autoconocimiento en 7 dimensiones. 5 minutos.</p>
          <a
            href="https://5000millas.com"
            style={{ display: 'inline-block', background: 'transparent', border: '1px solid #d4a574', color: '#d4a574', padding: '12px 32px', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', textDecoration: 'none', borderRadius: 2, transition: 'all 0.3s' }}
            onMouseEnter={(e: any) => { e.target.style.background = '#d4a574'; e.target.style.color = '#0a0a0a' }}
            onMouseLeave={(e: any) => { e.target.style.background = 'transparent'; e.target.style.color = '#d4a574' }}
          >
            Iniciar diagnóstico
          </a>
        </div>
      </motion.section>
      {/* QUOTE */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.8 }}
        style={{ maxWidth: 600, margin: '56px auto', padding: '0 24px' }}
      >
        <div style={{ borderLeft: '2px solid #d4a574', padding: '16px 0 16px 24px' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 15, lineHeight: 1.7, color: '#777', fontStyle: 'italic', margin: '0 0 10px' }}>
            "El método BDL no pretende crear seguidores.<br/>Pretende despertar soberanos."
          </p>
          <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11, color: '#444', margin: 0 }}>— Carlos Medina, Fundador de 5.000 Millas</p>
        </div>
      </motion.section>
      {/* FOOTER */}
      <footer style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px 48px', textAlign: 'center', borderTop: '1px solid #111' }}>
        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 10, letterSpacing: 3, color: '#2a2a2a', textTransform: 'uppercase', margin: '0 0 6px' }}>5.000 Millas — Erradicando la pobreza mental</p>
        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 10, letterSpacing: 2, color: '#333', margin: '0 0 10px' }}>Líderes en autoeducación, macroeconomía e innovación</p>
        <a href="https://instagram.com/oficialcarlosmedina" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11, color: '#d4a574', textDecoration: 'none' }}>@oficialcarlosmedina</a>
      </footer>
    </div>
  )
}
