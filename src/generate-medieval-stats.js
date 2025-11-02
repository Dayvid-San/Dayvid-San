const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const sources = [
  {
    id: 'stats',
    title: 'Developer Stats',
    url: 'https://github-readme-stats.vercel.app/api?username=Dayvid-San&show_icons=true&theme=midnight-purple&include_all_commits=false&count_private=true',
    width: 540,
    height: 160
  },
  {
    id: 'streak',
    title: 'Streak',
    url: 'https://github-readme-streak-stats.herokuapp.com/?user=Dayvid-san&theme=midnight-purple',
    width: 420,
    height: 160
  },
  {
    id: 'trophy',
    title: 'Trophies',
    url: 'https://github-profile-trophy.vercel.app/?username=Dayvid-San&theme=discord&title=Followers,Commits,Repositories,MultiLanguage,PullRequest&column=5',
    width: 740,
    height: 160
  }
];

const colors = {
  blue: '#3A4D9A',
  deep: '#2B2161',
  gold: '#C9A94B',
  parchment: '#F5E6C8',
  silver: '#C0BEBE',
  mint: '#6EE7B7'
};

async function fetchBase64(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || 'image/png';
  return { data: buf.toString('base64'), mime: contentType.split(';')[0] };
}

function makeMedievalSVG({ base64, mime, title, innerW, innerH, outW = innerW + 120, outH = innerH + 120 }) {
  const imageHref = `data:${mime};base64,${base64}`;
  return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${outW}" height="${outH}" viewBox="0 0 ${outW} ${outH}" role="img" aria-label="${title}">
  <style>
    .bg{fill:${colors.parchment}}
    .paper{fill:rgba(255,255,255,0.02)}
    .frame{fill:none;stroke:${colors.deep};stroke-width:6}
    .gold{fill:${colors.gold}}
    .title{font-family: "Cinzel", "Times New Roman", serif; font-weight:700; font-size:20px; fill:${colors.deep}}
    .subtitle{font-family: "MedievalSharp", "serif"; font-size:12px; fill:${colors.silver}}
    .orn{fill:${colors.deep}; opacity:0.12}
  </style>

  <!-- fundo pergaminho -->
  <rect width="100%" height="100%" class="bg" rx="18" ry="18"/>

  <!-- ornamentos canto superior esquerdo -->
  <g transform="translate(12,12)">
    <path class="orn" d="M0,12 Q8,0 24,0" />
    <circle cx="0" cy="0" r="4" class="orn"/>
  </g>

  <!-- frame interno -->
  <rect x="60" y="48" width="${innerW}" height="${innerH}" rx="10" ry="10" class="paper" stroke="${colors.deep}" stroke-width="2"/>

  <!-- header -->
  <text x="${60 + 12}" y="36" class="title">${escapeXml(title)}</text>
  <text x="${outW - 12}" y="${outH - 16}" text-anchor="end" class="subtitle">medieval · futurism · Dayvid</text>

  <!-- imagem embutida -->
  <image href="${imageHref}" x="${60}" y="${48}" width="${innerW}" height="${innerH}" preserveAspectRatio="xMidYMid meet" />

  <!-- borda heráldica simples -->
  <path class="frame" d="M54 42 h${innerW+12} v${innerH+12} h-${innerW+12} z" fill="none" stroke-linejoin="round"/>

</svg>`;
}

function escapeXml(s){ return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }

async function run() {
  for (const s of sources) {
    try {
      console.log('Fetching', s.url);
      const { data, mime } = await fetchBase64(s.url);
      const svg = makeMedievalSVG({
        base64: data,
        mime,
        title: s.title,
        innerW: s.width,
        innerH: s.height,
        outW: s.width + 120,
        outH: s.height + 120
      });
      const outPath = path.join(outDir, `medieval-${s.id}.svg`);
      fs.writeFileSync(outPath, svg, 'utf8');
      console.log('Wrote', outPath);
    } catch (err) {
      console.error('Erro gerando', s.id, err.message);
    }
  }
  console.log('Pronto — verifique assets/medieval-*.svg');
}

run().catch(err => { console.error(err); process.exit(1); });
