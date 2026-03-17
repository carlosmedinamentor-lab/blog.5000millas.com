const fs = require('fs');
const path = require('path');
const https = require('https');

// ── Config ──────────────────────────────────────────────────────────────
const SHEET_ID = '1rY2V222Ywfgm_F5FBdltyFwuT-AvAiV1_TId-d5XiL8';
const SHEET_NAME = 'Blog Posts El Faro';
const SITE_URL = 'https://blog.5000millas.com';
const DIST = path.join(__dirname, 'dist');

// ── Fetch Google Sheet via public CSV export ────────────────────────────
function fetchSheet() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
  return new Promise((resolve, reject) => {
    const get = (requestUrl, redirects = 0) => {
      if (redirects > 5) return reject(new Error('Too many redirects'));
      https.get(requestUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    };
    get(url);
  });
}

// ── Parse CSV (handles quoted fields with commas/newlines) ──────────────
function parseCSV(csv) {
  const rows = [];
  let current = '';
  let inQuote = false;
  const lines = csv.split('\n');

  for (const line of lines) {
    if (inQuote) {
      current += '\n' + line;
    } else {
      current = line;
    }
    const quoteCount = (current.match(/"/g) || []).length;
    inQuote = quoteCount % 2 !== 0;
    if (!inQuote) {
      rows.push(parseCSVRow(current));
      current = '';
    }
  }

  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1)
    .filter(row => row.some(cell => cell.trim()))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h.trim()] = (row[i] || '').trim(); });
      return obj;
    });
}

function parseCSVRow(row) {
  const cells = [];
  let current = '';
  let inQuote = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (inQuote) {
      if (ch === '"' && row[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuote = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
      } else if (ch === ',') {
        cells.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  cells.push(current);
  return cells;
}

// ── Slug generator ──────────────────────────────────────────────────────
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Convert line breaks to HTML paragraphs ──────────────────────────────
function bodyToHTML(text) {
  if (!text) return '<p></p>';
  return text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('\n          ');
}

// ── Format date ─────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return dateStr; }
}

function isoDate(dateStr) {
  if (!dateStr) return new Date().toISOString();
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  } catch { return new Date().toISOString(); }
}

// ── Escape HTML ─────────────────────────────────────────────────────────
function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Shared Components ───────────────────────────────────────────────────
const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/JjPQcPMDSUM4LdEE0pGZ/webhook-trigger/55986cb3-c02e-4cfa-a845-cc435d70f9eb';

function headerHTML() {
  return `
  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="logo" aria-label="Ir al inicio">
        <span class="logo-equation">⛵+💎=🦁</span>
        <span class="logo-text">El Faro de las 5:00 A.M.</span>
      </a>
      <nav class="main-nav" aria-label="Navegación principal">
        <a href="https://5000millas.com" target="_blank" rel="noopener">Diagnóstico BDL</a>
        <a href="https://editorial.5000millas.com" target="_blank" rel="noopener">Editorial</a>
        <a href="https://academia.5000millas.com" target="_blank" rel="noopener">Academia</a>
      </nav>
      <button class="nav-toggle" aria-label="Abrir menú" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>`;
}

function subscribeFormHTML() {
  return `
    <section class="subscribe" id="suscribirse">
      <div class="subscribe-inner">
        <h2 class="subscribe-title">Recibe El Faro cada madrugada</h2>
        <p class="subscribe-desc">Una reflexión de 500 palabras a las 5:00 A.M. para despertar tu conciencia.</p>
        <form class="subscribe-form" id="subscribe-form" novalidate>
          <div class="form-row">
            <div class="form-group">
              <label for="sub-name" class="sr-only">Tu nombre</label>
              <input type="text" id="sub-name" name="nombre" placeholder="Tu nombre" required autocomplete="given-name">
            </div>
            <div class="form-group">
              <label for="sub-email" class="sr-only">Tu correo electrónico</label>
              <input type="email" id="sub-email" name="email" placeholder="Tu correo electrónico" required autocomplete="email">
            </div>
            <button type="submit" class="btn-submit" id="btn-submit">
              <span class="btn-text">Entrar a la tribu</span>
              <svg class="btn-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <svg class="btn-spinner hidden" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" stroke-dasharray="28" stroke-dashoffset="7" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="0.8s" repeatCount="indefinite"/></circle></svg>
            </button>
          </div>
          <p class="form-feedback hidden" id="form-feedback" role="status" aria-live="polite"></p>
        </form>
      </div>
    </section>`;
}

function footerHTML() {
  return `
  <footer class="site-footer">
    <div class="footer-inner">
      <p class="footer-equation">⛵+💎=🦁</p>
      <p class="footer-copy">&copy; 2026 El Club de las 5.000 Millas &mdash; Método BDL</p>
      <nav class="footer-nav" aria-label="Navegación del pie">
        <a href="https://5000millas.com" target="_blank" rel="noopener">Diagnóstico</a>
        <a href="https://editorial.5000millas.com" target="_blank" rel="noopener">Editorial</a>
        <a href="https://academia.5000millas.com" target="_blank" rel="noopener">Academia</a>
      </nav>
    </div>
  </footer>`;
}

function subscribeScript() {
  return `
  <script>
    (function(){
      var form = document.getElementById('subscribe-form');
      var btn = document.getElementById('btn-submit');
      var feedback = document.getElementById('form-feedback');
      var arrow = btn.querySelector('.btn-arrow');
      var spinner = btn.querySelector('.btn-spinner');

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var name = document.getElementById('sub-name').value.trim();
        var email = document.getElementById('sub-email').value.trim();
        if (!name || !email) return;

        btn.disabled = true;
        arrow.classList.add('hidden');
        spinner.classList.remove('hidden');
        feedback.classList.add('hidden');

        fetch('${GHL_WEBHOOK}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name, email: email, tag: 'faro-5am' })
        })
        .then(function(res) {
          if (!res.ok) throw new Error('Error');
          feedback.textContent = 'Bienvenido a la expedición. Tu primera lección llegará mañana a las 5:00 A.M.';
          feedback.className = 'form-feedback success';
          form.reset();
        })
        .catch(function() {
          feedback.textContent = 'Hubo un error. Intenta de nuevo.';
          feedback.className = 'form-feedback error';
        })
        .finally(function() {
          btn.disabled = false;
          arrow.classList.remove('hidden');
          spinner.classList.add('hidden');
        });
      });

      // Mobile nav toggle
      var toggle = document.querySelector('.nav-toggle');
      var nav = document.querySelector('.main-nav');
      if (toggle && nav) {
        toggle.addEventListener('click', function() {
          var expanded = toggle.getAttribute('aria-expanded') === 'true';
          toggle.setAttribute('aria-expanded', !expanded);
          nav.classList.toggle('open');
        });
      }
    })();
  </script>`;
}

// ── CSS ─────────────────────────────────────────────────────────────────
function sharedCSS() {
  return `
    :root {
      --black: #0A0A0A;
      --card: #111111;
      --gold: #D4A574;
      --gold-hover: #E0B88A;
      --text: #C8C4BC;
      --text-muted: #8A8780;
      --text-faint: #5A5853;
      --white: #F5F3EF;
      --font-display: 'Cormorant Garamond', Georgia, serif;
      --font-serif: 'Playfair Display', Georgia, serif;
      --font-sans: 'Inter', system-ui, sans-serif;
    }

    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    html { scroll-behavior: smooth; }

    body {
      background: var(--black);
      color: var(--text);
      font-family: var(--font-sans);
      font-size: 16px;
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    a { color: var(--gold); text-decoration: none; transition: color 0.3s; }
    a:hover { color: var(--gold-hover); }
    a:focus-visible { outline: 2px solid var(--gold); outline-offset: 4px; border-radius: 2px; }

    img { max-width: 100%; display: block; }

    .sr-only {
      position: absolute; width: 1px; height: 1px;
      padding: 0; margin: -1px; overflow: hidden;
      clip: rect(0,0,0,0); white-space: nowrap; border: 0;
    }

    .hidden { display: none !important; }

    /* ── Header ──────────────────────────── */
    .site-header {
      position: sticky; top: 0; z-index: 100;
      background: rgba(10,10,10,0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(212,165,116,0.08);
    }
    .header-inner {
      max-width: 1200px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 2rem;
    }
    .logo {
      display: flex; align-items: center; gap: 0.75rem;
      color: var(--white); text-decoration: none;
    }
    .logo:hover { color: var(--gold); }
    .logo-equation { font-size: 1.1rem; }
    .logo-text {
      font-family: var(--font-display);
      font-size: 1.25rem; font-weight: 400; letter-spacing: 0.02em;
    }
    .main-nav { display: flex; gap: 2rem; }
    .main-nav a {
      font-size: 0.75rem; font-weight: 400;
      letter-spacing: 0.12em; text-transform: uppercase;
      color: var(--text-muted); transition: color 0.3s;
    }
    .main-nav a:hover { color: var(--gold); }

    .nav-toggle {
      display: none; background: none; border: none; cursor: pointer;
      padding: 0.5rem; flex-direction: column; gap: 5px;
    }
    .nav-toggle span {
      display: block; width: 22px; height: 1.5px;
      background: var(--text); transition: all 0.3s;
    }

    /* ── Footer ──────────────────────────── */
    .site-footer {
      border-top: 1px solid rgba(212,165,116,0.08);
      padding: 3rem 2rem;
      text-align: center;
    }
    .footer-inner { max-width: 1200px; margin: 0 auto; }
    .footer-equation {
      font-size: 1.5rem; margin-bottom: 0.75rem;
    }
    .footer-copy {
      font-size: 0.7rem; letter-spacing: 0.2em;
      text-transform: uppercase; color: var(--text-faint);
      margin-bottom: 1rem;
    }
    .footer-nav { display: flex; justify-content: center; gap: 2rem; }
    .footer-nav a {
      font-size: 0.7rem; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--text-muted);
    }

    /* ── Subscribe ────────────────────────── */
    .subscribe {
      border-top: 1px solid rgba(212,165,116,0.08);
      padding: 5rem 2rem;
    }
    .subscribe-inner {
      max-width: 640px; margin: 0 auto; text-align: center;
    }
    .subscribe-title {
      font-family: var(--font-display);
      font-size: 2rem; font-weight: 400;
      color: var(--white); margin-bottom: 0.75rem;
    }
    .subscribe-desc {
      color: var(--text-muted); font-size: 0.95rem;
      margin-bottom: 2rem;
    }
    .form-row {
      display: flex; gap: 0.75rem;
      align-items: stretch; flex-wrap: wrap;
    }
    .form-group { flex: 1; min-width: 160px; }
    .form-group input {
      width: 100%; padding: 0.85rem 1.25rem;
      background: var(--card); border: 1px solid rgba(212,165,116,0.15);
      border-radius: 6px; color: var(--white);
      font-family: var(--font-sans); font-size: 0.9rem;
      transition: border-color 0.3s;
    }
    .form-group input::placeholder { color: var(--text-faint); }
    .form-group input:focus {
      outline: none; border-color: var(--gold);
    }
    .btn-submit {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.85rem 2rem;
      background: var(--gold); color: var(--black);
      border: none; border-radius: 6px; cursor: pointer;
      font-family: var(--font-sans);
      font-size: 0.7rem; font-weight: 600;
      letter-spacing: 0.15em; text-transform: uppercase;
      transition: background 0.3s, transform 0.2s;
      white-space: nowrap;
    }
    .btn-submit:hover { background: var(--gold-hover); transform: translateY(-1px); }
    .btn-submit:focus-visible { outline: 2px solid var(--white); outline-offset: 3px; }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .form-feedback {
      margin-top: 1rem; font-size: 0.85rem; padding: 0.75rem 1rem;
      border-radius: 6px;
    }
    .form-feedback.success {
      background: rgba(212,165,116,0.1); color: var(--gold);
      border: 1px solid rgba(212,165,116,0.2);
    }
    .form-feedback.error {
      background: rgba(200,60,60,0.1); color: #e07070;
      border: 1px solid rgba(200,60,60,0.2);
    }

    /* ── Mobile ───────────────────────────── */
    @media (max-width: 768px) {
      .header-inner { padding: 0.85rem 1.25rem; }
      .logo-text { font-size: 1rem; }
      .main-nav {
        display: none; position: absolute;
        top: 100%; left: 0; right: 0;
        flex-direction: column; gap: 0;
        background: rgba(10,10,10,0.98);
        border-bottom: 1px solid rgba(212,165,116,0.08);
      }
      .main-nav.open { display: flex; }
      .main-nav a { padding: 1rem 2rem; border-top: 1px solid rgba(255,255,255,0.04); }
      .nav-toggle { display: flex; }
      .form-row { flex-direction: column; }
      .btn-submit { width: 100%; justify-content: center; }
    }
  `;
}

// ── Index page CSS ──────────────────────────────────────────────────────
function indexCSS() {
  return `
    /* ── Hero ─────────────────────────────── */
    .hero {
      padding: 8rem 2rem 6rem;
      text-align: center;
      position: relative;
    }
    .hero::before {
      content: ''; position: absolute;
      top: 0; left: 50%; transform: translateX(-50%);
      width: 800px; height: 600px;
      background: radial-gradient(ellipse at top, rgba(212,165,116,0.04), transparent 70%);
      pointer-events: none;
    }
    .hero-equation {
      font-size: 1.5rem; margin-bottom: 2rem;
      color: var(--text-muted);
    }
    .hero h1 {
      font-family: var(--font-display);
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-weight: 300; color: var(--white);
      letter-spacing: -0.01em; line-height: 1.15;
      margin-bottom: 1.5rem;
    }
    .hero-sub {
      font-family: var(--font-serif);
      font-style: italic; color: var(--text-muted);
      font-size: 1.15rem; max-width: 600px;
      margin: 0 auto; line-height: 1.7;
    }

    /* ── Featured ─────────────────────────── */
    .featured {
      max-width: 900px; margin: 0 auto;
      padding: 0 2rem 5rem;
    }
    .featured-card {
      background: var(--card);
      border: 1px solid rgba(212,165,116,0.08);
      border-radius: 12px; padding: 3rem;
      transition: border-color 0.4s;
    }
    .featured-card:hover { border-color: rgba(212,165,116,0.2); }
    .featured-label {
      font-size: 0.65rem; letter-spacing: 0.2em;
      text-transform: uppercase; color: var(--gold);
      margin-bottom: 1.5rem;
    }
    .featured-card h2 {
      font-family: var(--font-display);
      font-size: clamp(1.75rem, 3.5vw, 2.5rem);
      font-weight: 400; color: var(--white);
      line-height: 1.25; margin-bottom: 1.25rem;
    }
    .featured-card h2 a { color: inherit; }
    .featured-card h2 a:hover { color: var(--gold); }
    .featured-excerpt {
      font-family: var(--font-serif);
      font-style: italic; color: var(--text-muted);
      font-size: 1.05rem; line-height: 1.8;
      margin-bottom: 2rem;
    }
    .featured-meta {
      display: flex; align-items: center; gap: 1.5rem;
      font-size: 0.75rem; color: var(--text-faint);
      letter-spacing: 0.05em; text-transform: uppercase;
    }
    .featured-meta .read-link {
      color: var(--gold); font-weight: 500;
      display: inline-flex; align-items: center; gap: 0.35rem;
    }

    /* ── Recent Grid ──────────────────────── */
    .recent {
      max-width: 1200px; margin: 0 auto;
      padding: 0 2rem 5rem;
    }
    .section-label {
      font-size: 0.65rem; letter-spacing: 0.25em;
      text-transform: uppercase; color: var(--text-faint);
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .recent-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 2rem;
    }
    .article-card {
      background: var(--card);
      border: 1px solid rgba(255,255,255,0.04);
      border-radius: 10px; padding: 2rem;
      transition: border-color 0.4s, transform 0.3s;
    }
    .article-card:hover {
      border-color: rgba(212,165,116,0.15);
      transform: translateY(-2px);
    }
    .article-card .card-date {
      font-size: 0.7rem; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--text-faint);
      margin-bottom: 0.85rem;
    }
    .article-card h3 {
      font-family: var(--font-display);
      font-size: 1.35rem; font-weight: 400;
      color: var(--white); line-height: 1.35;
      margin-bottom: 0.75rem;
    }
    .article-card h3 a { color: inherit; }
    .article-card h3 a:hover { color: var(--gold); }
    .article-card .card-excerpt {
      font-size: 0.9rem; color: var(--text-muted);
      line-height: 1.7; margin-bottom: 1.25rem;
      display: -webkit-box; -webkit-line-clamp: 3;
      -webkit-box-orient: vertical; overflow: hidden;
    }
    .article-card .read-link {
      font-size: 0.7rem; letter-spacing: 0.12em;
      text-transform: uppercase; color: var(--gold);
      font-weight: 500;
      display: inline-flex; align-items: center; gap: 0.35rem;
    }

    /* ── Archive ──────────────────────────── */
    .archive {
      max-width: 800px; margin: 0 auto;
      padding: 0 2rem 5rem;
    }
    .archive-list { list-style: none; }
    .archive-item {
      display: flex; align-items: baseline;
      gap: 1.5rem; padding: 1.25rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      transition: border-color 0.3s;
    }
    .archive-item:hover { border-color: rgba(212,165,116,0.12); }
    .archive-date {
      font-size: 0.72rem; color: var(--text-faint);
      letter-spacing: 0.05em; white-space: nowrap;
      min-width: 100px;
    }
    .archive-title {
      font-family: var(--font-display);
      font-size: 1.1rem; color: var(--text);
    }
    .archive-title:hover { color: var(--gold); }

    @media (max-width: 768px) {
      .hero { padding: 5rem 1.25rem 4rem; }
      .featured { padding: 0 1.25rem 4rem; }
      .featured-card { padding: 2rem; }
      .recent { padding: 0 1.25rem 4rem; }
      .recent-grid { grid-template-columns: 1fr; }
      .archive { padding: 0 1.25rem 4rem; }
      .archive-item { flex-direction: column; gap: 0.25rem; }
    }
  `;
}

// ── Article page CSS ────────────────────────────────────────────────────
function articleCSS() {
  return `
    .article-hero {
      padding: 6rem 2rem 3rem;
      text-align: center; max-width: 800px;
      margin: 0 auto;
    }
    .article-hero .back-link {
      font-size: 0.7rem; letter-spacing: 0.12em;
      text-transform: uppercase; color: var(--text-muted);
      display: inline-flex; align-items: center; gap: 0.4rem;
      margin-bottom: 2rem;
    }
    .article-hero .back-link:hover { color: var(--gold); }
    .article-hero .article-date {
      font-size: 0.72rem; letter-spacing: 0.15em;
      text-transform: uppercase; color: var(--gold);
      margin-bottom: 1.5rem;
    }
    .article-hero h1 {
      font-family: var(--font-display);
      font-size: clamp(2rem, 5vw, 3.25rem);
      font-weight: 400; color: var(--white);
      line-height: 1.2; margin-bottom: 1.5rem;
    }
    .article-hero .article-subtitle {
      font-family: var(--font-serif);
      font-style: italic; color: var(--text-muted);
      font-size: 1.1rem; line-height: 1.7;
    }

    .article-body {
      max-width: 680px; margin: 0 auto;
      padding: 0 2rem 4rem;
    }
    .article-body p {
      margin-bottom: 1.5rem;
      font-size: 1.05rem; line-height: 1.85;
      color: var(--text);
    }
    .article-body p:first-child::first-letter {
      font-family: var(--font-display);
      font-size: 3.5rem; float: left;
      line-height: 1; margin-right: 0.5rem;
      margin-top: 0.1rem; color: var(--gold);
    }
    .article-body blockquote {
      border-left: 2px solid var(--gold);
      padding-left: 1.5rem; margin: 2rem 0;
      font-family: var(--font-serif);
      font-style: italic; color: var(--text-muted);
    }
    .article-body h2, .article-body h3 {
      font-family: var(--font-display);
      color: var(--white); margin: 2.5rem 0 1rem;
    }
    .article-body h2 { font-size: 1.75rem; font-weight: 400; }
    .article-body h3 { font-size: 1.35rem; font-weight: 400; }

    .article-author {
      max-width: 680px; margin: 0 auto;
      padding: 0 2rem 4rem;
      display: flex; align-items: center; gap: 1rem;
      border-top: 1px solid rgba(255,255,255,0.04);
      padding-top: 2rem;
    }
    .author-info .author-name {
      font-family: var(--font-display);
      font-size: 1.1rem; color: var(--white);
    }
    .author-info .author-title {
      font-size: 0.8rem; color: var(--text-muted);
    }

    @media (max-width: 768px) {
      .article-hero { padding: 4rem 1.25rem 2rem; }
      .article-body { padding: 0 1.25rem 3rem; }
      .article-author { padding: 0 1.25rem 3rem; padding-top: 2rem; }
    }
  `;
}

// ── Page builder: HEAD ──────────────────────────────────────────────────
function headHTML({ title, description, url, type, datePublished, dateModified, extraCSS }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="Carlos Medina">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${esc(url)}">
  <meta name="theme-color" content="#0A0A0A">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">

  <meta property="og:type" content="${type || 'website'}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:locale" content="es_ES">
  <meta property="og:site_name" content="El Faro de las 5:00 A.M.">

  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;1,400&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;1,400&display=swap">

  <style>${sharedCSS()}${extraCSS || ''}</style>
</head>`;
}

// ── Normalize post fields ───────────────────────────────────────────────
function normalizePost(raw) {
  // Try common column name patterns
  const get = (...keys) => {
    for (const k of keys) {
      for (const rk of Object.keys(raw)) {
        if (rk.toLowerCase().replace(/[^a-z]/g, '') === k.toLowerCase().replace(/[^a-z]/g, '')) {
          if (raw[rk]) return raw[rk];
        }
      }
    }
    return '';
  };

  const title = get('title', 'titulo', 'título', 'posttitle') || get('headline');
  const body = get('body', 'content', 'contenido', 'postcontent', 'cuerpo', 'text', 'texto');
  const excerpt = get('excerpt', 'extracto', 'resumen', 'description', 'descripcion', 'descripción', 'metadescription', 'summary')
    || body.substring(0, 200).replace(/\n/g, ' ') + '...';
  const date = get('date', 'fecha', 'publishdate', 'fechapublicacion', 'fechadepublicacion', 'publishedat', 'createdat');
  const slug = get('slug', 'url', 'permalink') || slugify(title);
  const author = get('author', 'autor') || 'Carlos Medina';
  const status = get('status', 'estado', 'published', 'publicado');

  return { title, body, excerpt, date, slug, author, status };
}

// ── Build index.html ────────────────────────────────────────────────────
function buildIndex(posts) {
  const featured = posts[0];
  const recent = posts.slice(1, 3);
  const archive = posts.slice(3);

  const articleCards = (list) => list.map(p => `
        <article class="article-card">
          <p class="card-date">${formatDate(p.date)}</p>
          <h3><a href="/articulo/${esc(p.slug)}">${esc(p.title)}</a></h3>
          <p class="card-excerpt">${esc(p.excerpt)}</p>
          <a href="/articulo/${esc(p.slug)}" class="read-link">
            Leer manifiesto
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </article>`).join('\n');

  const archiveItems = archive.map(p => `
          <li class="archive-item">
            <span class="archive-date">${formatDate(p.date)}</span>
            <a href="/articulo/${esc(p.slug)}" class="archive-title">${esc(p.title)}</a>
          </li>`).join('\n');

  // JSON-LD for the blog
  const jsonLD = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "El Faro de las 5:00 A.M.",
    "url": SITE_URL,
    "description": "Reflexiones diarias para despertar tu conciencia. Método BDL por Carlos Medina.",
    "author": { "@type": "Person", "name": "Carlos Medina" },
    "publisher": {
      "@type": "Organization",
      "name": "5.000 Millas",
      "url": "https://5000millas.com"
    }
  });

  return `${headHTML({
    title: 'El Faro de las 5:00 A.M. — Blog de 5.000 Millas',
    description: 'Reflexiones diarias de 500 palabras a las 5:00 A.M. para despertar tu conciencia y pulir tu Identidad Verdadera. Método BDL por Carlos Medina.',
    url: SITE_URL,
    type: 'website',
    extraCSS: indexCSS()
  })}
<body>
  <a href="#main-content" class="sr-only" style="position:absolute;top:-100px;left:0;background:var(--gold);color:var(--black);padding:0.5rem 1rem;z-index:200;font-size:0.85rem;">Saltar al contenido</a>
  ${headerHTML()}

  <main id="main-content">
    <section class="hero">
      <p class="hero-equation" aria-label="Barco más Diamante igual a León">⛵+💎=🦁</p>
      <h1>El Faro de las 5:00&nbsp;A.M.</h1>
      <p class="hero-sub">Reflexiones multidimensionales de 500 palabras diseñadas para despertar tu conciencia y pulir tu Identidad Verdadera.</p>
    </section>

    ${featured ? `
    <section class="featured" aria-label="Artículo destacado">
      <article class="featured-card">
        <p class="featured-label">Último manifiesto</p>
        <h2><a href="/articulo/${esc(featured.slug)}">${esc(featured.title)}</a></h2>
        <p class="featured-excerpt">${esc(featured.excerpt)}</p>
        <div class="featured-meta">
          <span>${formatDate(featured.date)}</span>
          <a href="/articulo/${esc(featured.slug)}" class="read-link">
            Leer completo
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>
      </article>
    </section>` : ''}

    ${recent.length ? `
    <section class="recent" aria-label="Artículos recientes">
      <h2 class="section-label">Registros recientes de la expedición</h2>
      <div class="recent-grid">
        ${articleCards(recent)}
      </div>
    </section>` : ''}

    ${archive.length ? `
    <section class="archive" aria-label="Archivo de artículos">
      <h2 class="section-label">Archivo completo</h2>
      <ol class="archive-list">
        ${archiveItems}
      </ol>
    </section>` : ''}

    ${subscribeFormHTML()}
  </main>

  ${footerHTML()}

  <script type="application/ld+json">${jsonLD}</script>
  ${subscribeScript()}
</body>
</html>`;
}

// ── Build article page ──────────────────────────────────────────────────
function buildArticle(post) {
  const url = `${SITE_URL}/articulo/${post.slug}`;
  const jsonLD = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "url": url,
    "datePublished": isoDate(post.date),
    "dateModified": isoDate(post.date),
    "author": { "@type": "Person", "name": post.author || "Carlos Medina" },
    "publisher": {
      "@type": "Organization",
      "name": "5.000 Millas",
      "url": "https://5000millas.com"
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": url }
  });

  return `${headHTML({
    title: `${post.title} — El Faro de las 5:00 A.M.`,
    description: post.excerpt,
    url: url,
    type: 'article',
    extraCSS: articleCSS()
  })}
<body>
  <a href="#article-body" class="sr-only" style="position:absolute;top:-100px;left:0;background:var(--gold);color:var(--black);padding:0.5rem 1rem;z-index:200;font-size:0.85rem;">Saltar al contenido</a>
  ${headerHTML()}

  <main>
    <article>
      <header class="article-hero">
        <a href="/" class="back-link">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M11 7H3M3 7l4-4M3 7l4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Volver al Faro
        </a>
        <p class="article-date">
          <time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time>
        </p>
        <h1>${esc(post.title)}</h1>
        ${post.excerpt ? `<p class="article-subtitle">${esc(post.excerpt)}</p>` : ''}
      </header>

      <div class="article-body" id="article-body">
        ${bodyToHTML(post.body)}
      </div>

      <footer class="article-author">
        <div class="author-info">
          <p class="author-name">${esc(post.author || 'Carlos Medina')}</p>
          <p class="author-title">Fundador, 5.000 Millas</p>
        </div>
      </footer>
    </article>

    ${subscribeFormHTML()}
  </main>

  ${footerHTML()}

  <script type="application/ld+json">${jsonLD}</script>
  ${subscribeScript()}
</body>
</html>`;
}

// ── Build sitemap.xml ───────────────────────────────────────────────────
function buildSitemap(posts) {
  const today = new Date().toISOString().split('T')[0];
  const urls = [
    `  <url>\n    <loc>${SITE_URL}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`
  ];
  for (const p of posts) {
    const date = isoDate(p.date).split('T')[0];
    urls.push(`  <url>\n    <loc>${SITE_URL}/articulo/${p.slug}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

// ── Main ────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔨 Building blog.5000millas.com...');

  let posts = [];

  try {
    console.log('📡 Fetching Google Sheet...');
    const csv = await fetchSheet();
    const rawPosts = parseCSV(csv);
    console.log(`📊 Found ${rawPosts.length} rows in sheet`);

    posts = rawPosts
      .map(normalizePost)
      .filter(p => p.title && p.title.trim())
      .filter(p => {
        const s = p.status.toLowerCase();
        return !s || s === 'published' || s === 'publicado' || s === 'si' || s === 'sí' || s === 'yes' || s === 'true' || s === '1';
      })
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    console.log(`✅ ${posts.length} published posts after filtering`);
  } catch (err) {
    console.error('⚠️  Could not fetch Google Sheet:', err.message);
    console.log('📝 Using fallback posts for build...');

    // Fallback posts so the site builds even without Sheet access
    posts = [
      {
        title: 'El peso invisible del Árbol de la Muerte',
        excerpt: 'La culpa no es un sentimiento, es una táctica de tu ego para mantenerte anclado en un puerto que ya no existe. Despertar exige cortar la cuerda.',
        body: 'La culpa no es un sentimiento, es una táctica de tu ego para mantenerte anclado en un puerto que ya no existe. Despertar exige cortar la cuerda.\n\nCada mañana, millones de personas cargan un peso que no les pertenece. Lo heredaron de sus padres, de la cultura, de un sistema que necesita personas obedientes, no personas libres.\n\nEl Árbol de la Muerte es esa estructura de creencias que te mantiene atado al puerto seguro. Sus raíces son profundas: culpa, vergüenza, miedo al rechazo, necesidad de aprobación.\n\nPero hay una verdad que nadie te dice: ese árbol no es tuyo. Lo plantaron otros. Y solo tú puedes cortarlo.\n\nEl primer paso no es la valentía. Es la conciencia. Ver el árbol. Reconocer sus ramas en cada decisión que tomas por miedo, en cada sueño que pospones, en cada \"no puedo\" que repites como mantra.\n\nHoy, a las 5:00 de la mañana, mientras el mundo duerme, tú ya estás despierto. Ese es el primer corte.\n\n— Carlos Medina',
        date: '2026-03-17',
        slug: 'el-peso-invisible-del-arbol-de-la-muerte',
        author: 'Carlos Medina',
        status: 'published'
      },
      {
        title: 'El Diamante y la tiranía del confort',
        excerpt: 'Huyes de la presión porque te enseñaron que la paz es ausencia de conflicto. Pero el carbón nunca se transforma en el sofá de tu sala.',
        body: 'Huyes de la presión porque te enseñaron que la paz es ausencia de conflicto. Pero el carbón nunca se transforma en el sofá de tu sala.\n\nLa transformación real exige presión. Exige calor. Exige tiempo en la oscuridad sin garantía de resultado. Eso es lo que separa al carbón del diamante.\n\nVivimos en la era del confort industrializado. Todo está diseñado para que no sientas incomodidad: comida a domicilio, entretenimiento infinito, relaciones descartables.\n\nPero el confort es el enemigo silencioso de tu potencial. No te destruye con violencia; te desactiva con comodidad.\n\nEl Diamante del Método BDL representa tu Identidad Verdadera comprimida bajo presión hasta que brilla. No puedes saltarte el proceso. No hay atajos.\n\nLa pregunta no es si estás dispuesto a sufrir. La pregunta es: ¿estás dispuesto a dejar de esconderte del fuego que te forja?\n\n— Carlos Medina',
        date: '2026-03-16',
        slug: 'el-diamante-y-la-tirania-del-confort',
        author: 'Carlos Medina',
        status: 'published'
      },
      {
        title: 'Soberanía interior frente al ruido',
        excerpt: 'Si tu agenda la dictan las urgencias de otros, no eres un líder, eres un empleado de las circunstancias. Retoma el timón.',
        body: 'Si tu agenda la dictan las urgencias de otros, no eres un líder, eres un empleado de las circunstancias. Retoma el timón.\n\nEl ruido exterior es constante: notificaciones, opiniones, expectativas ajenas, noticias diseñadas para secuestrar tu atención. Todo conspira contra tu soberanía interior.\n\nPero el ruido más peligroso no viene de afuera. Viene de las voces internas que repiten los guiones que otros escribieron para ti.\n\nLa soberanía interior no es silencio. Es la capacidad de elegir qué voces escuchas y cuáles ignoras. Es el arte de gobernar tu mundo interno antes de pretender cambiar el externo.\n\nEl León del Método BDL no ruge para impresionar. Ruge porque ha encontrado su voz auténtica entre el estruendo de lo falso.\n\nHoy, practica un acto de soberanía: elige una hora del día donde no consultas tu teléfono. Una hora donde tu mente te pertenece completamente.\n\nEse pequeño acto de rebeldía es el comienzo de tu libertad.\n\n— Carlos Medina',
        date: '2026-03-15',
        slug: 'soberania-interior-frente-al-ruido',
        author: 'Carlos Medina',
        status: 'published'
      }
    ];
  }

  if (!posts.length) {
    console.error('❌ No posts found. Aborting build.');
    process.exit(1);
  }

  // Ensure dist directories
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  fs.mkdirSync(path.join(DIST, 'articulo'), { recursive: true });

  // Copy static files
  const staticFiles = ['favicon.svg', 'robots.txt'];
  for (const file of staticFiles) {
    const src = path.join(__dirname, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(DIST, file));
      console.log(`📄 Copied ${file}`);
    }
  }

  // Build index
  fs.writeFileSync(path.join(DIST, 'index.html'), buildIndex(posts));
  console.log('📄 Built index.html');

  // Build article pages
  for (const post of posts) {
    const html = buildArticle(post);
    fs.writeFileSync(path.join(DIST, 'articulo', `${post.slug}.html`), html);
    console.log(`📄 Built articulo/${post.slug}.html`);
  }

  // Build sitemap
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), buildSitemap(posts));
  console.log('📄 Built sitemap.xml');

  console.log(`\n✅ Build complete! ${posts.length} articles generated.`);
}

main().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
