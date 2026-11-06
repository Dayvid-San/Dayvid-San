const fs = require('fs');
const path = require('path');

// Cada conta usa o próprio token (secret) se existir, para contar privados; senão o token padrão (só dados públicos).
const ACCOUNTS = [
  { login: 'Dayvid-San', tokenEnv: 'STATS_TOKEN' }
];
const RECENT_DAYS = 365;
const DISPLAY_NAME = 'Dayvid Santana';
const HEADLINE = 'Software Engineer · Backend & Full Stack';
const IGNORED_LANGUAGES = new Set(['HTML', 'CSS', 'SCSS', 'Less', 'Jupyter Notebook', 'Procfile', 'Dockerfile', 'Batchfile']);
const TOP_LANGUAGES = 5;

const RANKS = [
  { min: 1000, name: 'Warlord' },
  { min: 500, name: 'Lord' },
  { min: 200, name: 'Knight' },
  { min: 50, name: 'Man-at-arms' },
  { min: 0, name: 'Squire' }
];

const colors = {
  bg: '#000E21',
  panel: '#0A1B33',
  line: '#1F3352',
  cream: '#E8DFC8',
  muted: '#9AA6B8',
  bar: '#C9B98F'
};

const W = 790;
const H = 280;
const outDir = path.join(__dirname, '..', 'assets');
const outPath = path.join(outDir, 'medieval-status.svg');
const emblemPath = path.join(outDir, 'grifo-status.jpg');

const QUERY = `
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      contributionCalendar { totalContributions }
    }
    repositories(ownerAffiliations: OWNER, isFork: false, first: 100, orderBy: { field: PUSHED_AT, direction: DESC }) {
      totalCount
      nodes {
        pushedAt
        stargazerCount
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name } }
        }
      }
    }
  }
}`;

async function fetchAccount({ login, tokenEnv }) {
  const token = process.env[tokenEnv] || process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) throw new Error(`Sem token para ${login}: defina ${tokenEnv} ou GH_TOKEN.`);
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'medieval-status' },
    body: JSON.stringify({ query: QUERY, variables: { login } })
  });
  const json = await res.json();
  if (!res.ok || json.errors || !json.data?.user) {
    throw new Error(`Falha na API do GitHub para ${login}: ${res.status} ${JSON.stringify(json.errors || json.message)}`);
  }
  console.log(`${login}: ${process.env[tokenEnv] ? 'token próprio' : 'token padrão (só públicos)'}`);
  return json.data.user;
}

function summarize(users, now = Date.now()) {
  const since = now - RECENT_DAYS * 24 * 60 * 60 * 1000;
  const bytes = new Map();
  let contributions = 0;
  let commits = 0;
  let pullRequests = 0;
  let repoCount = 0;
  let stars = 0;
  for (const user of users) {
    const cc = user.contributionsCollection;
    contributions += cc.contributionCalendar.totalContributions;
    commits += cc.totalCommitContributions;
    pullRequests += cc.totalPullRequestContributions;
    repoCount += user.repositories.totalCount;
    for (const repo of user.repositories.nodes) {
      stars += repo.stargazerCount;
      if (Date.parse(repo.pushedAt) < since) continue;
      for (const edge of repo.languages.edges) {
        if (IGNORED_LANGUAGES.has(edge.node.name)) continue;
        bytes.set(edge.node.name, (bytes.get(edge.node.name) || 0) + edge.size);
      }
    }
  }
  const total = [...bytes.values()].reduce((a, b) => a + b, 0) || 1;
  const languages = [...bytes.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_LANGUAGES)
    .map(([name, size]) => ({ name, pct: Math.round((size / total) * 1000) / 10 }));

  return {
    contributions,
    commits,
    pullRequests,
    repos: repoCount,
    stars,
    rank: RANKS.find((r) => contributions >= r.min).name,
    languages
  };
}

function esc(s = '') {
  return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function fmt(n) {
  return Number(n).toLocaleString('en-US');
}

function render(stats, emblemB64, updated) {
  const x0 = 250;
  const tiles = [
    ['Contributions', stats.contributions],
    ['Commits', stats.commits],
    ['Pull requests', stats.pullRequests],
    ['Repositories', stats.repos]
  ];
  const tileW = 120;
  const tileGap = 10;
  const tilesSvg = tiles
    .map(([label, value], i) => {
      const x = x0 + i * (tileW + tileGap);
      return `
    <g class="fade" style="animation-delay:${0.1 + i * 0.08}s">
      <rect x="${x}" y="78" width="${tileW}" height="54" rx="8" fill="${colors.panel}" stroke="${colors.line}"/>
      <text x="${x + 12}" y="104" class="num">${fmt(value)}</text>
      <text x="${x + 12}" y="122" class="label">${esc(label)}</text>
    </g>`;
    })
    .join('');

  const barX = x0 + 120;
  const barW = 330;
  const langSvg = stats.languages
    .map((l, i) => {
      const y = 160 + i * 20;
      const w = Math.max(3, Math.round((l.pct / 100) * barW));
      return `
    <g class="fade" style="animation-delay:${0.4 + i * 0.08}s">
      <text x="${x0}" y="${y + 9}" class="lang">${esc(l.name)}</text>
      <rect x="${barX}" y="${y}" width="${barW}" height="10" rx="5" fill="${colors.panel}" stroke="${colors.line}"/>
      <rect class="grow" style="animation-delay:${0.5 + i * 0.08}s" x="${barX}" y="${y}" width="${w}" height="10" rx="5" fill="${colors.bar}"/>
      <text x="${barX + barW + 46}" y="${y + 9}" class="pct" text-anchor="end">${l.pct.toFixed(1)}%</text>
    </g>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(DISPLAY_NAME)}: ${fmt(stats.contributions)} contributions on GitHub in the last year">
  <style>
    .name { font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 700; fill: ${colors.cream}; }
    .head { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 13px; fill: ${colors.muted}; }
    .rank { font-family: Georgia, serif; font-size: 13px; font-weight: 700; fill: ${colors.cream}; letter-spacing: 2px; }
    .num { font-family: Georgia, serif; font-size: 20px; font-weight: 700; fill: ${colors.cream}; }
    .label, .lang, .pct, .foot { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 12px; fill: ${colors.muted}; }
    .lang { fill: ${colors.cream}; }
    .foot { font-size: 11px; }
    .fade { opacity: 0; animation: fade .7s ease-out forwards; }
    .grow { transform-box: fill-box; transform-origin: left; transform: scaleX(0); animation: grow 1s cubic-bezier(.25,1,.5,1) forwards; }
    @keyframes fade { to { opacity: 1; } }
    @keyframes grow { to { transform: scaleX(1); } }
    @media (prefers-reduced-motion: reduce) { .fade, .grow { animation: none; opacity: 1; transform: none; } }
  </style>
  <defs>
    <clipPath id="card"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  </defs>
  <g clip-path="url(#card)">
    <rect width="${W}" height="${H}" fill="${colors.bg}"/>
    <image href="data:image/jpeg;base64,${emblemB64}" x="20" y="-10" width="204" height="300" preserveAspectRatio="xMidYMid slice"/>
    <line x1="232" y1="24" x2="232" y2="${H - 24}" stroke="${colors.line}"/>
  </g>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${colors.line}"/>

  <g class="fade">
    <text x="${x0}" y="44" class="name">${esc(DISPLAY_NAME)}</text>
    <text x="${W - 24}" y="44" class="rank" text-anchor="end">${esc(stats.rank.toUpperCase())}</text>
    <text x="${x0}" y="64" class="head">${esc(HEADLINE)}</text>
  </g>
  ${tilesSvg}
  ${langSvg}
  <text x="${W - 24}" y="${H - 8}" class="foot" text-anchor="end">Last 12 months on GitHub${ACCOUNTS.length > 1 ? ` · ${ACCOUNTS.length} accounts` : ''} · updated ${esc(updated)}</text>
</svg>
`;
}

async function main() {
  const users = process.env.STATS_FIXTURE
    ? JSON.parse(fs.readFileSync(process.env.STATS_FIXTURE, 'utf8'))
    : await Promise.all(ACCOUNTS.map(fetchAccount));
  const stats = summarize(users);
  const emblem = fs.readFileSync(emblemPath).toString('base64');
  const updated = new Date().toLocaleDateString('en-GB', { timeZone: 'America/Sao_Paulo' });
  fs.writeFileSync(outPath, render(stats, emblem, updated), 'utf8');
  console.log('Status gerado:', outPath, JSON.stringify(stats));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
