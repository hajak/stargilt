// StarGilt telemetry store — zero dependencies.
// Persistent JSON-file backend when DATA_DIR is set (production: a small Railway volume
// mounted there, so data survives redeploys), otherwise an in-memory store (local dev + tests).
// Both expose the same async interface, so aggregate.js and server.js never learn which is live.
const fs = require('fs');
const path = require('path');

const DIR = process.env.DATA_DIR || '';
const USE_FILE = !!DIR;
const BACKEND = USE_FILE ? 'json-file' : 'in-memory';

const EVENTS = USE_FILE ? path.join(DIR, 'events.jsonl') : null;
const LABELS = USE_FILE ? path.join(DIR, 'labels.json') : null;
const GEO = USE_FILE ? path.join(DIR, 'geo.json') : null;
const SCORES = USE_FILE ? path.join(DIR, 'scores.json') : null;

// In-memory tables (used when USE_FILE is false).
const mem = { events: [], labels: new Map(), geo: new Map(), scores: [], seq: 0 };

// ── tiny JSON-file helpers ──
function readObj(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return {}; }
}
function writeObj(file, obj) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj)); // write-then-rename = never a half-written file
  fs.renameSync(tmp, file);
}

async function init() {
  if (!USE_FILE) return;
  fs.mkdirSync(DIR, { recursive: true });
  if (!fs.existsSync(EVENTS)) fs.writeFileSync(EVENTS, '');
  if (!fs.existsSync(LABELS)) writeObj(LABELS, {});
  if (!fs.existsSync(GEO)) writeObj(GEO, {});
  if (!fs.existsSync(SCORES)) writeObj(SCORES, []);
}

async function insertEvent(evt) {
  if (USE_FILE) { fs.appendFileSync(EVENTS, JSON.stringify(evt) + '\n'); return; }
  const row = { id: ++mem.seq };
  for (const k of Object.keys(evt)) row[k] = evt[k];
  mem.events.push(row);
}

// All events, oldest first (append order). Bad lines are skipped rather than crashing the console.
async function allEvents() {
  if (USE_FILE) {
    let raw = '';
    try { raw = fs.readFileSync(EVENTS, 'utf8'); } catch (e) { return []; }
    const out = [];
    for (const line of raw.split('\n')) { if (!line) continue; try { out.push(JSON.parse(line)); } catch (e) {} }
    return out;
  }
  return mem.events.map((r) => ({ ...r }));
}

async function getLabels() {
  if (USE_FILE) { const o = readObj(LABELS); return Object.entries(o).map(([cid, v]) => ({ cid, label: v.label ?? null, canon: v.canon ?? null })); }
  return [...mem.labels.entries()].map(([cid, v]) => ({ cid, label: v.label ?? null, canon: v.canon ?? null }));
}

async function setLabel(cid, label) {
  if (USE_FILE) { const o = readObj(LABELS); o[cid] = { ...(o[cid] || {}), label }; writeObj(LABELS, o); return; }
  mem.labels.set(cid, { ...(mem.labels.get(cid) || {}), label });
}

// Fold `cids` into the canonical `into` cid (many aliases → one person).
async function merge(into, cids) {
  const aliases = cids.filter((c) => c && c !== into);
  if (USE_FILE) {
    const o = readObj(LABELS);
    o[into] = { ...(o[into] || {}), canon: null }; // `into` becomes/stays a root
    for (const c of aliases) o[c] = { ...(o[c] || {}), canon: into };
    writeObj(LABELS, o);
    return;
  }
  mem.labels.set(into, { ...(mem.labels.get(into) || {}), canon: null });
  for (const c of aliases) mem.labels.set(c, { ...(mem.labels.get(c) || {}), canon: into });
}

async function unmerge(cid) {
  if (USE_FILE) { const o = readObj(LABELS); if (o[cid]) { o[cid] = { ...o[cid], canon: null }; writeObj(LABELS, o); } return; }
  const cur = mem.labels.get(cid); if (cur) mem.labels.set(cid, { ...cur, canon: null });
}

async function geoGet(ip) {
  if (USE_FILE) { const o = readObj(GEO); return o[ip] || null; }
  return mem.geo.get(ip) || null;
}

async function geoSet(ip, g) {
  const row = { country: g.country ?? null, region: g.region ?? null, city: g.city ?? null };
  if (USE_FILE) { const o = readObj(GEO); o[ip] = row; writeObj(GEO, o); return; }
  mem.geo.set(ip, row);
}

async function allGeo() {
  if (USE_FILE) { const o = readObj(GEO); return Object.entries(o).map(([ip, g]) => ({ ip, ...g })); }
  return [...mem.geo.entries()].map(([ip, g]) => ({ ip, ...g }));
}

// ── shared leaderboard ──
// Kept sorted (glory desc, earlier run wins ties) and capped, so reads are a plain slice.
const SCORES_KEPT = 100;
function readScores() {
  try { const v = JSON.parse(fs.readFileSync(SCORES, 'utf8')); return Array.isArray(v) ? v : []; } catch (e) { return []; }
}

// Insert a run's score. A row with the same rid (one run = one page load) is replaced
// only by a better total — a win that continues into Endless holds one slot at its peak.
async function addScore(entry) {
  const list = USE_FILE ? readScores() : mem.scores;
  const prior = entry.rid ? list.findIndex((s) => s.rid === entry.rid) : -1;
  if (prior >= 0) {
    if (entry.g < list[prior].g) return list.slice();
    list.splice(prior, 1);
  }
  list.push(entry);
  list.sort((a, b) => b.g - a.g || String(a.ts).localeCompare(String(b.ts)));
  const top = list.slice(0, SCORES_KEPT);
  if (USE_FILE) writeObj(SCORES, top);
  else mem.scores = top;
  return top.slice();
}

async function topScores(n) {
  const list = USE_FILE ? readScores() : mem.scores;
  return list.slice(0, n);
}

module.exports = { init, insertEvent, allEvents, getLabels, setLabel, merge, unmerge, geoGet, geoSet, allGeo, addScore, topScores, BACKEND, _mem: mem };
