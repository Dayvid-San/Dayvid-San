// scripts/generate-medieval-status.js
// Node 18+ recommended
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
  eloName: 'Cavaleiro Arcano',
  // coloque uma URL https válida aqui (ou deixe vazio para desenhar escudo)
  eloImg: ''
};

const skills = [
  { key: 'Web', pct: 60, title: 'Tecnologias Web' },
  { key: 'Blockchain', pct: 2, title: 'Blockchain' },
  { key: 'Redes Neurais', pct: 7, title: 'Redes Neurais' },
  { key: 'Linux', pct: 70, title: 'Linux e Unix' },
  { key: 'Banco de Dados', pct: 16, title: 'Banco de Dados' }
];
// ---------- FIM CONFIG ----------

// Paleta (ajuste se quiser)
const colors = {
  blue: '#3A4D9A',
  deep: '#2B2161',
  gold: '#FFFFFF',
  // papel mais escuro conforme pediu
  parchment: '#2B2161',
  silver: '#E5E5E5',
  mint: '#FFFFFF',
  darkPaper: '#3A4D9A'
};

// dimensions
const W = 790;
const H = 280;
const leftW = 200;
const pad = 20;
const rightW = W - leftW - pad * 2; // espaço para a coluna direita

// bar dimensions (com garantia de mínimo)
const barMaxW = Math.max(120, rightW - 160); // espaço para nome + título + porcentagem
const barH = 12;
const gap = 18; // distância vertical entre linhas

// helper to escape XML/text
function esc(s = '') {
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;');
}

// compute percentage to pixel width
function pctToWidth(pct, max) {
  const p = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
  return Math.round((p * max) / 100);
}

// build skill rows svg (placed inside right area)
function buildSkillRows(skills, startX, startY) {
  let y = startY;
  let rows = '';
  for (const s of skills) {
    const barW = pctToWidth(s.pct, barMaxW);
    // positions
    const nameX = startX;
    const titleX = startX + 110;
    const barX = titleX;
    const pctX = barX + barMaxW + 18; // posiciona a % um pouco à direita

    rows += `
    <!-- skill ${esc(s.key)} -->
    <text x="${nameX}" y="${y + 10}" font-family="Georgia, 'Times New Roman', serif" font-size="14" fill="${colors.gold}" font-weight="700">${esc(s.key)}</text>
    <text x="${titleX}" y="${y + 10}" font-family="sans-serif" font-size="12" fill="${colors.silver}">${esc(s.title)}</text>

    <!-- bar background (papel/ madeira escuro) -->
    <rect x="${barX}" y="${y + 18}" width="${barMaxW}" height="${barH}" rx="6" fill="${colors.parchment}" fill-opacity="1" stroke="${colors.darkPaper}" stroke-width="1.2"/>

    <!-- bar fill (ouro envelhecido) -->
    <rect x="${barX}" y="${y + 18}" width="${barW}" height="${barH}" rx="6" fill="${colors.gold}" />

    <!-- percent text -->
    <text x="${pctX}" y="${y + 10}" font-family="monospace" font-size="12" fill="${colors.mint}" text-anchor="end">${s.pct}%</text>
    `;

    y += gap + barH;
  }
  return rows;
}

// prepare elo image tag or fallback shield drawing
function buildEloBlock(hero) {
  // if eloImg looks like a URL, use <image>; otherwise fallback to drawn shield
  const hasImage = typeof hero.eloImg === 'string' && hero.eloImg.trim().length > 0 && /^https?:\/\//i.test(hero.eloImg.trim());
  if (hasImage) {
    const href = esc(hero.eloImg);
    // include role/alt via aria but SVG <image> doesn't have alt attribute — we keep it simple
    return `
      <image href="${href}" x="60" y="30" width="80" height="80" preserveAspectRatio="xMidYMid meet" />
    `;
  } else {
    // draw "The Royal Crest" shield
    return `
      <g transform="translate(${leftW/2}, ${H/2 - 20})">
        <!-- Shield Shape (Heater shield) -->
        <path d="M-60,-70 L60,-70 L60,20 C60,60 0,80 0,80 C0,80 -60,60 -60,20 Z" fill="${colors.blue}" stroke="${colors.gold}" stroke-width="4"/>
        
        <!-- Crown Emblem -->
        <g transform="translate(0, -20)">
            <path d="M-35,-10 L-35,10 L-20,0 L0,10 L20,0 L35,10 L35,-10 Z" fill="${colors.gold}" stroke="${colors.silver}" stroke-width="2"/>
            <circle cx="-35" cy="-15" r="5" fill="${colors.gold}"/>
            <circle cx="0" cy="15" r="5" fill="${colors.gold}"/>
            <circle cx="35" cy="-15" r="5" fill="${colors.gold}"/>
        </g>
        <!-- Hero Name -->
        <text x="0" y="55" font-family="Georgia, serif" font-size="16" text-anchor="middle" fill="${colors.parchment}" font-weight="700">${esc(hero.name)}</text>
      </g>
    `;
  }
}

const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

// SVG content
const svg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Status medieval de ${esc(hero.name)}">
  <style>
    .bg{fill:${colors.parchment}}
    .title{font-family: "Georgia", "Times New Roman", serif; font-weight:700; font-size:18px; fill:${colors.deep}}
    .muted{font-family: "Segoe UI", Roboto, sans-serif; font-size:12px; fill:${colors.silver}}
    .gold{fill:${colors.blue}; font-weight:700}
  </style>

  <!-- fundo -->
  <rect width="100%" height="100%" class="bg" rx="16"/>

  <!-- borda decorativa -->
  <rect x="6" y="6" width="${W-12}" height="${H-12}" rx="12" fill="none" stroke="${colors.deep}" stroke-width="3"/>

  <!-- Elo e escudo (left column) -->
  <g transform="translate(${pad}, ${pad})">
    <rect x="0" y="0" width="${leftW}" height="${H - pad*2}" rx="10" fill-opacity="0" />
    ${buildEloBlock(hero)}
    <!-- elo name under the shield -->
    <text x="${leftW/2}" y="${H - pad*2 - 24}" font-family="Georgia, serif" font-size="14" text-anchor="middle" fill="${colors.silver}" font-weight="700">${esc(hero.eloName)}</text>
  </g>

  <!-- right area -->
  <g transform="translate(${leftW + pad + 10}, ${pad})">
    <!-- header: Level / XP / Nome -->
    <text x="0" y="20" class="title">Level: ${esc(String(hero.level))} · XP: ${esc(String(hero.xpCurrent))} / ${esc(String(hero.xpNeeded))}</text>
    <text x="${rightW - 10}" y="20" class="muted" text-anchor="end">Atualizado: ${esc(now)}</text>
    <text x="0" y="44" class="muted">Elo: <tspan class="gold">${esc(hero.eloName)}</tspan></text>

    <!-- skills block -->
    ${buildSkillRows(skills, 0, 72)}
  </g>
</svg>
`;

// write file to disk
const outPath = path.join(outDir, 'medieval-status.svg');
fs.writeFileSync(outPath, svg, 'utf8');
console.log('Gerado:', outPath);
