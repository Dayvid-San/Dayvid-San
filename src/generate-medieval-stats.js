const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// ---------- CONFIG (edite aqui) ----------
const hero = {
  name: 'Dayvid',
  level: 27,
  xpCurrent: 14250,
  xpNeeded: 20000,
  elo: 'Cavaleiro Arcano'
};

const skills = [
  { key: 'Web', pct: 80, title: 'Forjador das Estradas Digitais' },
  { key: 'Blockchain', pct: 40, title: 'Guardião dos Selos Criptográficos' },
  { key: 'Redes Neurais', pct: 40, title: 'Tecelão das Mentes Artificiais' },
  { key: 'Linux', pct: 70, title: 'Navegador dos Reinos Unix' },
  { key: 'Banco de Dados', pct: 80, title: 'Arquivista dos Tomos Eternos' }
];
// ---------- FIM CONFIG ----------

// Paleta
const colors = {
  blue: '#3A4D9A',
  deep: '#2B2161',
  gold: '#C9A94B',
  parchment: '#F5E6C8',
  silver: '#C0BEBE',
  mint: '#6EE7B7',
  darkPaper: '#0b0b0b'
};

// dimensions
const W = 720;
const H = 240;
const leftW = 200;
const rightW = W - leftW - 40; // padding
const pad = 20;

// bar dimensions
const barMaxW = rightW - 180; // leave space for skill names
const barH = 12;
const gap = 14;

// helper to escape XML
function esc(s = '') {
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}

// compute percentage as integer (safe arithmetic)
function pctToWidth(pct, max) {
  // ensure numeric and in [0,100]
  const p = Math.max(0, Math.min(100, Math.round(Number(pct))));
  return Math.round((p * max) / 100);
}

// build skill rows svg
function buildSkillRows(skills, startX, startY) {
  let y = startY;
  let rows = '';
  for (const s of skills) {
    const barW = pctToWidth(s.pct, barMaxW);
    // skill name (left), bar (right)
    rows += `
    <!-- skill ${esc(s.key)} -->
    <text x="${startX}" y="${y + 10}" font-family="Georgia, 'Times New Roman', serif" font-size="14" fill="${colors.parchment}" font-weight="700">${esc(s.key)}</text>
    <text x="${startX + 110}" y="${y + 10}" font-family="sans-serif" font-size="12" fill="${colors.silver}">${esc(s.title)}</text>
    <!-- bar background -->
    <rect x="${startX + 110}" y="${y + 18}" width="${barMaxW}" height="${barH}" rx="6" fill="rgba(255,255,255,0.03)" stroke="${colors.deep}" stroke-opacity="0.08"/>
    <!-- bar fill -->
    <rect x="${startX + 110}" y="${y + 18}" width="${barW}" height="${barH}" rx="6" fill="${colors.mint}" />
    <!-- percent -->
    <text x="${startX + 120 + barMaxW}" y="${y + 10}" font-family="monospace" font-size="12" fill="${colors.gold}" text-anchor="end">${s.pct}%</text>
    `;
    y += gap + barH;
  }
  return rows;
}

const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

// SVG content
const svg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Status medieval de ${esc(hero.name)}">
  <style>
    .bg{fill:${colors.parchment}}
    .card{fill:rgba(255,255,255,0.02)}
    .title{font-family: "Cinzel", Georgia, "Times New Roman", serif; font-weight:700; font-size:18px; fill:${colors.deep}}
    .muted{font-family: "Segoe UI", Roboto, sans-serif; font-size:12px; fill:${colors.silver}}
    .gold{fill:${colors.gold}; font-weight:700}
  </style>

  <!-- fundo -->
  <rect width="100%" height="100%" class="bg" rx="16"/>

  <!-- borda decorativa -->
  <rect x="6" y="6" width="${W-12}" height="${H-12}" rx="12" fill="none" stroke="${colors.deep}" stroke-width="3"/>

  <!-- left: escudo -->
  <g transform="translate(${pad}, ${pad})">
    <rect x="0" y="0" width="${leftW}" height="${H - pad*2}" rx="10" fill="rgba(255,255,255,0.01)" />
    <!-- shield shape -->
    <g transform="translate(${leftW/2}, ${H/2 - pad})">
      <path d="M0,-80 C50,-80 70,-40 70,6 C70,90 -70,90 -70,6 C-70,-40 -50,-80 0,-80 Z" fill="url(#g1)" stroke="${colors.gold}" stroke-width="4"/>
      <circle cx="0" cy="-10" r="8" fill="${colors.mint}" />
      <text x="0" y="6" font-family="Georgia, serif" font-size="18" text-anchor="middle" fill="${colors.parchment}" font-weight="700">${esc(hero.name)}</text>
    </g>
  </g>

  <defs>
    <linearGradient id="g1" x1="0" x2="1">
      <stop offset="0" stop-color="${colors.deep}" />
      <stop offset="1" stop-color="${colors.blue}" />
    </linearGradient>
  </defs>

  <!-- right area -->
  <g transform="translate(${leftW + pad + 10}, ${pad})">
    <!-- header: Level / XP / Elo -->
    <text x="0" y="20" class="title">Level: ${esc(String(hero.level))} · XP: ${esc(String(hero.xpCurrent))} / ${esc(String(hero.xpNeeded))}</text>
    <text x="${rightW - 20}" y="20" class="muted" text-anchor="end">Atualizado: ${esc(now)}</text>
    <text x="0" y="44" class="muted">Elo: <tspan class="gold">${esc(hero.elo)}</tspan></text>

    <!-- skills block -->
    ${buildSkillRows(skills, 0, 72)}
  </g>
</svg>
`;

// write file
const outPath = path.join(outDir, 'medieval-status.svg');
fs.writeFileSync(outPath, svg, 'utf8');
console.log('Gerado:', outPath);
