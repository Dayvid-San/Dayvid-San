const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// ---------- CONFIG ----------
const hero = {
  name: 'Dayvid',
  level: 27,
  xpCurrent: 14250,
  xpNeeded: 20000,
  eloName: 'Lord',
  eloImg: ''
};

const skills = [
  { key: 'Web', pct: 60, title: 'Level: 15' },
  { key: 'Blockchain', pct: 2, title: 'Level: 1' },
  { key: 'Neural Networks', pct: 23, title: 'Level: 4' },
  { key: 'Linux', pct: 70, title: 'Level: 38' },
  { key: 'Databases', pct: 56, title: 'Level: 7' }
];

const colors = {
  blue: '#3A4D9A',
  deep: '#2B2161',
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
const rightW = W - leftW - pad * 2;
const barMaxW = Math.max(120, rightW - 160);
const barH = 12;
const gap = 18;

function esc(s = '') {
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}

function pctToWidth(pct, max) {
  const p = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
  return Math.round((p * max) / 100);
}

// build skill rows svg
function buildSkillRows(skills, startX, startY) {
  let y = startY;
  let rows = '';
  
  // Adiciona um delay incremental para cada barra
  skills.forEach((s, index) => {
    const barW = pctToWidth(s.pct, barMaxW);
    const nameX = startX;
    const titleX = startX + 110;
    const barX = titleX;
    const pctX = barX + barMaxW + 18;
    
    // Delay: 200ms * indice (0ms, 200ms, 400ms...)
    const delay = index * 0.15; 

    rows += `
    <g class="fade-in" style="animation-delay: ${delay}s">
      <text x="${nameX}" y="${y + 10}" font-family="Georgia, serif" font-size="14" fill="${colors.silver}" font-weight="700">${esc(s.key)}</text>
      <text x="${titleX}" y="${y + 10}" font-family="sans-serif" font-size="12" fill="${colors.silver}">${esc(s.title)}</text>

      <rect x="${barX}" y="${y + 18}" width="${barMaxW}" height="${barH}" rx="6" fill="${colors.parchment}" fill-opacity="1" stroke="${colors.darkPaper}" stroke-width="1.2"/>

      <rect class="bar-anim" style="animation-delay: ${delay + 0.3}s" 
            x="${barX}" y="${y + 18}" width="${barW}" height="${barH}" rx="6" fill="${colors.silver}" />

      <text x="${pctX}" y="${y + 10}" font-family="monospace" font-size="12" fill="${colors.mint}" text-anchor="end">${s.pct}%</text>
    </g>
    `;

    y += gap + barH;
  });
  return rows;
}

function buildEloBlock(hero) {
  const hasImage = typeof hero.eloImg === 'string' && hero.eloImg.trim().length > 0 && /^https?:\/\//i.test(hero.eloImg.trim());
  
  // Adicionei a classe 'shield-anim' para o escudo flutuar
  const content = hasImage 
    ? `<image href="${esc(hero.eloImg)}" x="60" y="30" width="80" height="80" preserveAspectRatio="xMidYMid meet" />`
    : `<g transform="translate(${leftW/2}, ${H/2 - 20})">
         <path d="M-60,-70 L60,-70 L60,20 C60,60 0,80 0,80 C0,80 -60,60 -60,20 Z" fill="${colors.blue}" stroke="${colors.silver}" stroke-width="4"/>
         <g transform="translate(0, -20)">
             <path d="M-35,-10 L-35,10 L-20,0 L0,10 L20,0 L35,10 L35,-10 Z" fill="${colors.silver}" stroke="${colors.silver}" stroke-width="2"/>
             <circle cx="-35" cy="-15" r="5" fill="${colors.silver}"/>
             <circle cx="0" cy="15" r="5" fill="${colors.silver}"/>
             <circle cx="35" cy="-15" r="5" fill="${colors.silver}"/>
         </g>
         <text x="0" y="55" font-family="Georgia, serif" font-size="16" text-anchor="middle" fill="${colors.parchment}" font-weight="700">${esc(hero.name)}</text>
       </g>`;

  return `<g class="shield-anim">${content}</g>`;
}

const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

// SVG content
const svg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Status medieval">
  <style>
    /* Estilos estáticos */
    .bg { fill: ${colors.parchment}; }
    .title { font-family: "Georgia", serif; font-weight: 700; font-size: 18px; fill: ${colors.deep}; }
    .muted { font-family: "Segoe UI", sans-serif; font-size: 12px; fill: ${colors.silver}; }
    .silver-text { fill: ${colors.blue}; font-weight: 700; }

    /* --- ANIMAÇÕES --- */
    
    /* 1. Bar Fill Animation */
    .bar-anim {
      transform-box: fill-box;       /* Garante que a transformação respeite a caixa do elemento */
      transform-origin: left;        /* Cresce da esquerda para a direita */
      transform: scaleX(0);          /* Começa invisível (largura 0) */
      animation: growBar 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }
    
    @keyframes growBar {
      to { transform: scaleX(1); }
    }

    /* 2. Shield Floating (Breath effect) */
    .shield-anim {
      animation: floatShield 4s ease-in-out infinite;
      transform-origin: center;
      transform-box: fill-box;
    }

    @keyframes floatShield {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    /* 3. Text Fade In */
    .fade-in {
      opacity: 0;
      animation: fadeInText 0.8s ease-out forwards;
    }
    
    @keyframes fadeInText {
      to { opacity: 1; }
    }

  </style>

  <rect width="100%" height="100%" class="bg" rx="16"/>
  <rect x="6" y="6" width="${W-12}" height="${H-12}" rx="12" fill="none" stroke="${colors.deep}" stroke-width="3"/>

  <g transform="translate(${pad}, ${pad})">
    ${buildEloBlock(hero)}
    <text x="${leftW/2}" y="${H - pad*2 - 24}" font-family="Georgia, serif" font-size="14" text-anchor="middle" fill="${colors.silver}" font-weight="700" class="fade-in" style="animation-delay: 0.2s">${esc(hero.eloName)}</text>
  </g>

  <g transform="translate(${leftW + pad + 10}, ${pad})">
    <text x="0" y="20" class="title fade-in">Level: ${esc(String(hero.level))} · XP: ${esc(String(hero.xpCurrent))} / ${esc(String(hero.xpNeeded))}</text>
    <text x="${rightW - 10}" y="20" class="muted fade-in" text-anchor="end">Updated: ${esc(now)}</text>
    <text x="0" y="44" class="muted fade-in" style="animation-delay: 0.1s">Elo: <tspan class="silver-text">${esc(hero.eloName)}</tspan></text>

    ${buildSkillRows(skills, 0, 72)}
  </g>
</svg>
`;

const outPath = path.join(outDir, 'medieval-status.svg');
fs.writeFileSync(outPath, svg, 'utf8');
console.log('SVG Dinâmico Gerado:', outPath);
