// StarGilt server — serves the game + admin console and ingests player telemetry.
// Zero framework: raw Node http. Telemetry persists via ./store (Postgres in prod,
// in-memory locally). All /api/admin/* routes require the SG_ADMIN_KEY passphrase.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const store = require('./store');
const { aggregate, playerDetail, buildCanon, personOf } = require('./aggregate');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const ADMIN_KEY = process.env.SG_ADMIN_KEY || '';
const GEO_OFF = process.env.GEO_OFF === '1';
const MAX_BODY = 8 * 1024; // telemetry beacons are tiny; reject anything larger

// Playtest gate: the game pages are locked behind a shared password ("Mellon" by default — the elvish word for
// "friend", per the Doors of Durin). Friends who know the word get in; anyone else who finds the URL is turned away
// BEFORE the game HTML is ever sent. Set SG_GATE='' to disable, or SG_GATE=<word> to change the password.
const GATE_PASSWORD = process.env.SG_GATE === undefined ? 'Mellon' : process.env.SG_GATE;
const GATE_ON = GATE_PASSWORD !== '';
const GATE_TOKEN = crypto.createHash('sha256').update('sg-gate::' + GATE_PASSWORD).digest('hex').slice(0, 32); // cookie value; never the plaintext

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

// Server-side source files must never be served as static assets.
const BLOCKED_STATIC = new Set(['/server.js', '/store.js', '/aggregate.js', '/package.json', '/package-lock.json', '/.railwayignore']);

// ── helpers ───────────────────────────────────────────────────────────────
function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let n = 0;
    const chunks = [];
    req.on('data', (c) => {
      n += c.length;
      if (n > MAX_BODY) { reject(new Error('body too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function clientIP(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return (req.socket.remoteAddress || '').replace(/^::ffff:/, '');
}

function isPrivateIP(ip) {
  if (!ip) return true;
  if (ip === '::1' || ip.startsWith('127.') || ip === 'localhost') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('169.254.')) return true;
  const m = ip.match(/^172\.(\d+)\./);
  if (m && +m[1] >= 16 && +m[1] <= 31) return true;
  if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80')) return true; // ULA / link-local
  return false;
}

// Constant-time key check that also hides length differences (compare digests).
function keyOK(req) {
  if (!ADMIN_KEY) return false;
  const given = req.headers['x-admin-key'] || '';
  const a = crypto.createHash('sha256').update(String(given)).digest();
  const b = crypto.createHash('sha256').update(ADMIN_KEY).digest();
  return crypto.timingSafeEqual(a, b);
}

const clampStr = (v, n) => (v == null ? null : String(v).slice(0, n));
// Public shape of a leaderboard row: strips cid/rid/ts so player identifiers never leak between browsers.
const shapeTop = (rows, cid) => rows.map((s) => ({ g: s.g, t: s.t, r: s.r, d: s.d, n: s.n, me: !!cid && s.cid === cid }));
const clampInt = (v) => (Number.isFinite(+v) ? Math.trunc(+v) : null);
const clampNum = (v) => (Number.isFinite(+v) ? +v : null);

// ── playtest gate ──
function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
const gateOK = (req) => !GATE_ON || parseCookies(req).sg_gate === GATE_TOKEN;

// The Doors of Durin: "Speak, friend, and enter." Themed to match the game's ember-and-gold palette.
function gatePage(wrong) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>StarGilt</title>
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Grenze+Gotisch:wght@700;900&family=Alegreya+Sans:wght@400;600;800&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap" rel="stylesheet">
<style>
  :root{--gold:#e8b64c;--gold-bright:#ffd98a;--dim:#b9ad92;--ink:#0b0a12}
  *{box-sizing:border-box}
  html,body{margin:0;height:100%}
  body{min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:1.5rem;
    background:radial-gradient(120% 90% at 50% 0%,#231a30 0%,#0d0916 55%,#070510 100%);
    font-family:'Alegreya Sans',system-ui,sans-serif;color:#f0e6d2;overflow:hidden}
  .arch{position:fixed;inset:0;pointer-events:none;opacity:.5;
    background:radial-gradient(closest-side at 50% 42%,rgba(232,182,76,.16),transparent 70%)}
  .gate{position:relative;width:min(430px,92vw);text-align:center;
    padding:2.6rem 2.2rem 2.2rem;border-radius:20px;
    background:linear-gradient(170deg,rgba(37,27,49,.82),rgba(16,11,26,.9));
    border:1px solid rgba(232,182,76,.35);
    box-shadow:0 30px 90px rgba(0,0,0,.7),0 0 60px rgba(232,182,76,.08)}
  .mark{font-family:'Fraunces',serif;font-weight:500;font-size:.7rem;letter-spacing:.42em;
    text-transform:uppercase;color:var(--dim);margin-bottom:.5rem}
  h1{font-family:'Grenze Gotisch',serif;font-weight:900;font-size:2.9rem;line-height:.95;margin:0 0 .2rem;
    background:linear-gradient(175deg,#ffe9b0 8%,#e8b64c 45%,#96621c 82%);
    -webkit-background-clip:text;background-clip:text;color:transparent;
    filter:drop-shadow(0 3px 20px rgba(232,182,76,.3))}
  .sub{font-family:'Fraunces',serif;font-style:italic;font-size:1.05rem;color:var(--gold-bright);margin:.9rem 0 1.6rem}
  form{display:flex;flex-direction:column;gap:.9rem}
  input{font-family:'Alegreya Sans',sans-serif;font-size:1.1rem;text-align:center;letter-spacing:.08em;
    padding:.85rem 1rem;border-radius:11px;color:#f0e6d2;
    background:rgba(8,6,14,.7);border:1px solid rgba(232,182,76,.3);outline:none;transition:border-color .2s,box-shadow .2s}
  input:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(232,182,76,.16)}
  button{font-family:'Alegreya Sans',sans-serif;font-weight:800;font-size:1rem;letter-spacing:.1em;
    color:#241703;padding:.8rem 1rem;border:1px solid #f5d78e;border-radius:11px;cursor:pointer;
    background:linear-gradient(172deg,#ffe3a0,#e8b64c 55%,#c8923a);
    box-shadow:inset 0 1px 0 rgba(255,248,225,.7),0 4px 16px rgba(0,0,0,.4);transition:filter .15s,transform .1s}
  button:hover{filter:brightness(1.07)}button:active{transform:scale(.98)}
  .err{margin-top:1rem;font-size:.9rem;color:#ff9a7a;min-height:1.2em}
  .foot{margin-top:1.5rem;font-size:.72rem;color:var(--dim);letter-spacing:.04em}
</style></head>
<body>
  <div class="arch"></div>
  <div class="gate">
    <div class="mark">The Forge is sealed</div>
    <h1>STARGILT</h1>
    <div class="sub">Speak, friend, and enter.</div>
    <form method="POST" action="/gate">
      <input name="word" type="password" autocomplete="current-password" autofocus placeholder="the word of passage" maxlength="64" aria-label="password">
      <button type="submit">ENTER</button>
    </form>
    <div class="err">${wrong ? 'That is not the word. The doors hold fast.' : ''}</div>
    <div class="foot">A private playtest · by invitation only</div>
  </div>
</body></html>`;
}

// Shape an incoming beacon into a stored event. Server-authoritative fields
// (ts, ip, ua) are set here, never trusted from the client.
function toEvent(raw, req) {
  return {
    ts: new Date().toISOString(),
    cid: clampStr(raw.cid, 64),
    sid: clampStr(raw.sid, 64),
    build: clampStr(raw.build, 40),
    type: clampStr(raw.type, 40),
    name: clampStr(raw.name, 40),
    ip: clampStr(clientIP(req), 64),
    country: null, region: null, city: null, // filled from the geo cache at read time
    screen_w: clampInt(raw.screen_w),
    screen_h: clampInt(raw.screen_h),
    dpr: clampNum(raw.dpr),
    tz: clampStr(raw.tz, 64),
    lang: clampStr(raw.lang, 32),
    ua: clampStr(req.headers['user-agent'], 400),
    referrer: clampStr(raw.referrer, 300),
    mode: clampStr(raw.mode, 16),
    stage: clampInt(raw.stage),
    glory: clampInt(raw.glory),
    turns: clampInt(raw.turns),
    rank: clampStr(raw.rank, 40),
    duration_ms: clampInt(raw.duration_ms),
    extra: typeof raw.extra === 'object' && raw.extra ? raw.extra : {},
  };
}

// Best-effort geolocation of a public IP into the geo cache (free ip-api.com).
async function resolveGeo(ip) {
  if (GEO_OFF || isPrivateIP(ip)) return;
  try {
    if (await store.geoGet(ip)) return; // already known
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const r = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city`, { signal: ctrl.signal });
    clearTimeout(t);
    const j = await r.json();
    if (j && j.status === 'success') await store.geoSet(ip, { country: j.country, region: j.regionName, city: j.city });
  } catch (e) {
    /* geo is decorative; a failed lookup must never break ingest */
  }
}

// Join cached geo onto events by IP so locations appear once an IP is resolved.
function enrichGeo(events, geoRows) {
  const byIp = new Map(geoRows.map((g) => [g.ip, g]));
  for (const e of events) {
    const g = byIp.get(e.ip);
    if (g) { e.country = g.country; e.region = g.region; e.city = g.city; }
  }
  return events;
}

async function loadAggregate() {
  const [events, labels, geoRows] = await Promise.all([store.allEvents(), store.getLabels(), store.allGeo()]);
  enrichGeo(events, geoRows);
  return { events, labels };
}

// ── request handling ────────────────────────────────────────────────────────
async function handleAdmin(req, res, pathname, url) {
  if (!ADMIN_KEY) return sendJSON(res, 503, { error: 'admin disabled: SG_ADMIN_KEY is not set on the server' });
  if (!keyOK(req)) return sendJSON(res, 401, { error: 'bad or missing admin key' });

  if (req.method === 'GET' && pathname === '/api/admin/summary') {
    const { events, labels } = await loadAggregate();
    return sendJSON(res, 200, aggregate(events, labels, Date.now()));
  }
  if (req.method === 'GET' && pathname === '/api/admin/player') {
    const cid = url.searchParams.get('cid');
    const { events, labels } = await loadAggregate();
    const detail = playerDetail(events, labels, cid);
    return detail ? sendJSON(res, 200, detail) : sendJSON(res, 404, { error: 'no such player' });
  }
  // ── live feed: newest events for the console's debugging stream, optionally per player ──
  if (req.method === 'GET' && pathname === '/api/admin/events') {
    const limit = Math.min(300, Math.max(1, parseInt(url.searchParams.get('limit') || '120', 10) || 120));
    const wantCid = url.searchParams.get('cid');
    const events = await store.allEvents();
    const canon = wantCid ? buildCanon(await store.getLabels()) : null;
    const wantPerson = wantCid ? personOf(wantCid, canon) : null;
    const out = [];
    for (let i = events.length - 1; i >= 0 && out.length < limit; i--) {
      const e = events[i];
      if (wantPerson && personOf(e.cid, canon) !== wantPerson) continue;
      out.push({
        ts: e.ts, cid: e.cid, name: e.name, type: e.type, mode: e.mode, stage: e.stage,
        glory: e.glory, turns: e.turns, build: e.build, duration_ms: e.duration_ms,
        // turn/run beacons carry the balance numbers — the live-debug payload
        extra: (e.type === 'ch_turn' || e.type === 'ch_run') ? { t: e.extra?.t, act: e.extra?.act, boss: e.extra?.boss, dem: e.extra?.dem, score: e.extra?.score, base: e.extra?.base, mult: e.extra?.mult, cleared: e.extra?.cleared, won: e.extra?.won, endTurn: e.extra?.endTurn } : undefined,
      });
    }
    return sendJSON(res, 200, { events: out });
  }
  // ── difficulty monitoring: the chapters balance track (ch_turn / ch_run), grouped into runs ──
  if (req.method === 'GET' && pathname === '/api/admin/balance') {
    const events = await store.allEvents();
    // Optional per-player view: ?cid= accepts any of a player's cids and matches the whole
    // merged person (the admin's merge feature folds alias cids into one canonical id).
    const wantCid = url.searchParams.get('cid');
    const canon = wantCid ? buildCanon(await store.getLabels()) : null;
    const wantPerson = wantCid ? personOf(wantCid, canon) : null;
    const runs = new Map(); // sid → run
    for (const e of events) {
      if (e.type !== 'ch_turn' && e.type !== 'ch_run') continue;
      if (wantPerson && personOf(e.cid, canon) !== wantPerson) continue;
      const x = e.extra || {};
      let r = runs.get(e.sid);
      if (!r) { r = { sid: e.sid, cid: e.cid, build: e.build, started: e.ts, ended: e.ts, turns: [], won: null, endTurn: 0, endGlory: 0 }; runs.set(e.sid, r); }
      r.ended = e.ts; // events arrive chronologically — last one marks the run's end (→ visible duration)
      if (e.type === 'ch_turn') {
        r.turns.push({ t: x.t, act: x.act, boss: !!x.boss, dem: x.dem, score: x.score, base: x.base, mult: x.mult, cleared: !!x.cleared });
      } else { r.won = !!x.won; r.endTurn = x.endTurn || 0; r.endGlory = x.endGlory || 0; }
    }
    const list = [...runs.values()]
      .map((r) => { r.turns.sort((a, b) => a.t - b.t); return r; })
      .filter((r) => r.turns.length)
      .sort((a, b) => new Date(b.started) - new Date(a.started))
      .slice(0, 60);
    return sendJSON(res, 200, { runs: list });
  }
  // ── card usage: what players buy / play / forge / burn (from ch_run + ch_cards tallies) ──
  if (req.method === 'GET' && pathname === '/api/admin/cards') {
    const events = await store.allEvents();
    const KINDS = ['buys', 'plays', 'forges', 'burns'];
    const agg = { buys: {}, plays: {}, forges: {}, burns: {} };
    const names = {};
    let runs = 0;
    for (const e of events) {
      if (e.type !== 'ch_run' && e.type !== 'ch_cards') continue;
      const c = e.extra && e.extra.cards;
      if (!c || typeof c !== 'object') continue;
      if (e.type === 'ch_run') runs++; // ch_cards are abandoned-run flushes — not counted as completed runs
      for (const kind of KINDS) {
        const m = c[kind] || {};
        for (const id in m) agg[kind][id] = (agg[kind][id] || 0) + (Number(m[id]) || 0);
      }
      const nm = c.names || {};
      for (const id in nm) if (!names[id]) names[id] = clampStr(nm[id], 40);
    }
    const ids = new Set();
    for (const kind of KINDS) for (const id in agg[kind]) ids.add(id);
    const cards = [...ids].map((id) => ({
      id, name: names[id] || id,
      buys: agg.buys[id] || 0, plays: agg.plays[id] || 0,
      forges: agg.forges[id] || 0, burns: agg.burns[id] || 0,
    })).sort((a, b) => (b.buys + b.plays) - (a.buys + a.plays));
    return sendJSON(res, 200, { runs, cards });
  }
  if (req.method === 'POST') {
    let body;
    try { body = JSON.parse(await readBody(req) || '{}'); } catch (e) { return sendJSON(res, 400, { error: 'bad json' }); }
    if (pathname === '/api/admin/label' && body.cid) { await store.setLabel(body.cid, clampStr(body.label, 60) || null); return sendJSON(res, 200, { ok: true }); }
    if (pathname === '/api/admin/merge' && body.into && Array.isArray(body.cids)) { await store.merge(body.into, body.cids); return sendJSON(res, 200, { ok: true }); }
    if (pathname === '/api/admin/unmerge' && body.cid) { await store.unmerge(body.cid); return sendJSON(res, 200, { ok: true }); }
  }
  return sendJSON(res, 404, { error: 'unknown admin route' });
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);

  // Telemetry ingest — unauthenticated by design (public players, no login).
  if (pathname === '/api/t' && req.method === 'POST') {
    try {
      const raw = JSON.parse(await readBody(req) || '{}');
      if (!raw || typeof raw.cid !== 'string' || typeof raw.type !== 'string') { res.writeHead(400); return res.end(); }
      const evt = toEvent(raw, req);
      await store.insertEvent(evt);
      resolveGeo(evt.ip); // fire-and-forget
      res.writeHead(204); return res.end();
    } catch (e) {
      res.writeHead(400); return res.end();
    }
  }

  // Shared leaderboard — unauthenticated like /api/t (public players, no login).
  // The requester's cid is only used to compute the `me` flag; raw cids never leave the server.
  if (pathname === '/api/score' && req.method === 'POST') {
    try {
      const raw = JSON.parse(await readBody(req) || '{}');
      const cid = clampStr(raw.cid, 64), g = clampInt(raw.g), t = clampInt(raw.t);
      if (!cid || g == null || t == null || g < 0 || g > 1e7 || t < 0 || t > 10000) {
        return sendJSON(res, 400, { error: 'bad score' });
      }
      const now = new Date();
      const entry = {
        cid, rid: clampStr(raw.rid, 64) || null,
        n: clampStr(raw.n, 24) || 'Nameless Smith',
        g, t, r: clampStr(raw.r, 40) || '',
        ts: now.toISOString(), d: now.toISOString().slice(0, 10),
      };
      const list = await store.addScore(entry);
      return sendJSON(res, 200, { ok: true, top: shapeTop(list.slice(0, 10), cid) });
    } catch (e) {
      return sendJSON(res, 400, { error: 'bad request' });
    }
  }
  if (pathname === '/api/scores' && req.method === 'GET') {
    const cid = url.searchParams.get('cid') || '';
    return sendJSON(res, 200, { top: shapeTop(await store.topScores(10), cid) });
  }

  // Playtest gate: verify the shared password, then set a cookie and send the friend into the game.
  if (pathname === '/gate' && req.method === 'POST') {
    const word = new URLSearchParams(await readBody(req) || '').get('word') || '';
    // forgiving match: friends shouldn't be turned away over capitalization or a pasted stray space
    if (GATE_ON && word.trim().toLowerCase() === GATE_PASSWORD.trim().toLowerCase()) {
      res.writeHead(302, {
        'Set-Cookie': `sg_gate=${GATE_TOKEN}; Path=/; Max-Age=${60 * 60 * 24 * 90}; HttpOnly; SameSite=Lax`,
        'Location': '/',
      });
      return res.end();
    }
    res.writeHead(401, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
    return res.end(gatePage(true)); // wrong word — re-show the doors with a gentle refusal
  }

  if (pathname.startsWith('/api/admin/')) return handleAdmin(req, res, pathname, url);

  // Admin console.
  if (pathname === '/admin' || pathname === '/admin/') {
    return fs.readFile(path.join(ROOT, 'admin.html'), (err, data) => {
      if (err) { res.writeHead(404); return res.end('not found'); }
      res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  }

  // Static files (the game and its assets).
  let urlPath = pathname === '/' ? '/index.html' : pathname;
  if (BLOCKED_STATIC.has(urlPath) || urlPath.startsWith('/node_modules')) { res.writeHead(404); return res.end('not found'); }
  // The game itself is self-contained in a single .html — gate those pages so the game is never sent to a stranger.
  // (Assets/telemetry stay open; /admin has its own SG_ADMIN_KEY and isn't behind the playtest word.)
  if ((urlPath === '/index.html' || urlPath === '/chapters.html') && !gateOK(req)) {
    res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
    return res.end(gatePage(false));
  }
  const file = path.normalize(path.join(ROOT, urlPath));
  // Must live strictly INSIDE ROOT: require the trailing separator so a sibling dir sharing ROOT's
  // name prefix (e.g. `<ROOT>-secret/`) can't satisfy a bare startsWith and leak files.
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache', // playtest build: always fresh
    });
    res.end(data);
  });
}

store.init().then(() => {
  http.createServer((req, res) => {
    handle(req, res).catch((e) => { console.error('handler error', e); if (!res.headersSent) res.writeHead(500); res.end(); });
  }).listen(PORT, () => console.log(`StarGilt serving on :${PORT} (store: ${store.BACKEND})`));
}).catch((e) => { console.error('store init failed', e); process.exit(1); });
