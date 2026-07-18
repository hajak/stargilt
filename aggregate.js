// Pure aggregation over a flat event log + label/merge table.
// No I/O — the same functions run against Postgres rows or in-memory rows.

const DEFAULT_NAMES = new Set(['', 'smith', 'nameless smith']);
const MAX_SEGMENT_MS = 2 * 60 * 60 * 1000; // cap one session_end at 2h so a backgrounded tab can't inflate playtime

const isRealName = (n) => n && !DEFAULT_NAMES.has(String(n).trim().toLowerCase());
const ms = (t) => new Date(t).getTime();

// Resolve every cid to its canonical (merged) person id. One level of indirection
// is all merge() creates, but we follow the chain defensively and guard cycles.
function buildCanon(labels) {
  const byId = new Map(labels.map((l) => [l.cid, l]));
  const canon = new Map();
  for (const l of labels) {
    let root = l.cid;
    const seen = new Set([l.cid]);
    let cur = l;
    while (cur && cur.canon && !seen.has(cur.canon)) {
      root = cur.canon;
      seen.add(cur.canon);
      cur = byId.get(cur.canon);
    }
    canon.set(l.cid, root);
  }
  return canon;
}
const personOf = (cid, canon) => canon.get(cid) || cid;

// Ordered de-dup: keeps first-seen order, drops nullish/blank.
function uniq(values) {
  const out = [];
  const seen = new Set();
  for (const v of values) {
    if (v === null || v === undefined || v === '') continue;
    const k = typeof v === 'object' ? JSON.stringify(v) : String(v);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}

const fingerprintOf = (e) =>
  e.screen_w && e.screen_h ? `${e.screen_w}x${e.screen_h}@${e.dpr || 1}·${e.tz || '?'}·${e.lang || '?'}` : null;
const resolutionOf = (e) => (e.screen_w && e.screen_h ? `${e.screen_w}×${e.screen_h}` : null);
const locationOf = (e) => (e.country || e.city ? { country: e.country || null, city: e.city || null } : null);

function summarize(id, evs, label) {
  const by = (type) => evs.filter((e) => e.type === type);
  const runs = evs.filter((e) => e.type === 'game_over' || e.type === 'trial_won' || e.type === 'trial_death');

  let bestGlory = 0;
  let bestRank = null;
  for (const e of evs) {
    if (typeof e.glory === 'number' && e.glory > bestGlory) {
      bestGlory = e.glory;
      bestRank = e.rank || bestRank;
    }
  }

  const trialWon = by('trial_won');
  const trialStageCleared = trialWon.reduce((m, e) => Math.max(m, e.stage || 0), 0);
  const trialStageReached = evs.reduce(
    (m, e) => ((e.mode === 'trial' || e.type === 'trial_won' || e.type === 'trial_death') ? Math.max(m, e.stage || 0) : m),
    0,
  );
  const graduated = by('graduated').length > 0 || trialStageCleared >= 3;
  const fullGames = by('game_start').filter((e) => e.mode === 'full').length;
  const trials = by('game_start').filter((e) => e.mode === 'trial').length;

  // Real-game progression, separate from the tutorial funnel above. `ch_run` fires when a
  // chapters run ends (turns = final turn, extra.won = beat Act 8); `game_over` fires on a
  // full-game death. Best turn across both = how deep into the run they've ever gotten.
  const wonFull = by('ch_run').some((e) => e.extra && e.extra.won);
  const bestTurn = evs.reduce(
    (m, e) => (((e.type === 'ch_run') || (e.type === 'game_over' && e.mode === 'full')) ? Math.max(m, e.turns || 0) : m),
    0,
  );

  const playtimeMs = by('session_end').reduce((s, e) => s + Math.min(Math.max(e.duration_ms || 0, 0), MAX_SEGMENT_MS), 0);

  // Playstyle profile for the Compare tab — per-run averages from the ch_run card tallies
  // (buys/plays/forges/burns/relics), deck size ≈ 12 starters + buys − burns, and the biggest
  // MULT ever built (ch_turn). Null when no tallied runs exist.
  const talliedRuns = by('ch_run').filter((e) => e.extra && e.extra.cards);
  const sumTally = (m) => Object.values(m || {}).reduce((a, b) => a + (Number(b) || 0), 0);
  let tBuys = 0, tPlays = 0, tForges = 0, tBurns = 0, tRelics = 0;
  for (const e of talliedRuns) {
    const c = e.extra.cards;
    tBuys += sumTally(c.buys); tPlays += sumTally(c.plays); tForges += sumTally(c.forges);
    tBurns += sumTally(c.burns); tRelics += sumTally(c.relics);
  }
  const maxMult = evs.reduce((m, e) => (e.type === 'ch_turn' && e.extra && +e.extra.mult > m ? +e.extra.mult : m), 0);
  const nT = talliedRuns.length;
  const per = (v) => +(v / nT).toFixed(1);
  const style = nT ? {
    runs: nT, buys: per(tBuys), plays: per(tPlays), forges: per(tForges), burns: per(tBurns),
    relics: per(tRelics), deck: Math.round(12 + (tBuys - tBurns) / nT), maxMult: +maxMult.toFixed(2),
  } : null;

  const times = evs.map((e) => ms(e.ts)).filter((n) => !Number.isNaN(n));
  const firstSeen = times.length ? new Date(Math.min(...times)).toISOString() : null;
  const lastSeen = times.length ? new Date(Math.max(...times)).toISOString() : null;

  return {
    id,
    cids: uniq(evs.map((e) => e.cid)),
    label: label || null,
    names: uniq(evs.map((e) => e.name).filter(isRealName)),
    sessions: uniq(evs.map((e) => e.sid)).length,
    fullGames,
    trials,
    bestGlory,
    bestRank,
    // Two independent funnels: did they do the LEARN tutorial, and how far did they get in the real game.
    learn: { graduated, reached: trialStageReached, cleared: trialStageCleared, started: trials > 0 },
    game: { runs: fullGames, won: wonFull, bestTurn },
    style,
    playtimeMs,
    ips: uniq(evs.map((e) => e.ip)),
    locations: uniq(evs.map(locationOf)),
    resolutions: uniq(evs.map(resolutionOf)),
    fingerprints: uniq(evs.map(fingerprintOf)),
    timezones: uniq(evs.map((e) => e.tz)),
    langs: uniq(evs.map((e) => e.lang)),
    uas: uniq(evs.map((e) => e.ua)),
    builds: uniq(evs.map((e) => e.build)),
    runCount: runs.length,
    firstSeen,
    lastSeen,
  };
}

function groupByPerson(events, labels) {
  const canon = buildCanon(labels);
  const labelMap = new Map(labels.map((l) => [l.cid, l.label]));
  const groups = new Map();
  for (const e of events) {
    if (!e.cid) continue;
    const id = personOf(e.cid, canon);
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(e);
  }
  const players = [...groups.entries()].map(([id, evs]) => summarize(id, evs, labelMap.get(id)));
  players.sort((a, b) => ms(b.lastSeen) - ms(a.lastSeen));
  return players;
}

function overviewOf(players, nowMs) {
  const within = (iso, windowMs) => iso && nowMs - ms(iso) <= windowMs;
  const countries = {};
  for (const p of players) for (const loc of p.locations) if (loc.country) countries[loc.country] = (countries[loc.country] || 0) + 1;
  const builds = uniq(players.flatMap((p) => p.builds));
  return {
    uniquePlayers: players.length,
    totalFullGames: players.reduce((s, p) => s + p.fullGames, 0),
    totalTrials: players.reduce((s, p) => s + p.trials, 0),
    totalPlaytimeMs: players.reduce((s, p) => s + p.playtimeMs, 0),
    active24h: players.filter((p) => within(p.lastSeen, 864e5)).length,
    active7d: players.filter((p) => within(p.lastSeen, 6048e5)).length,
    countries,
    builds,
  };
}

// v0.11.2: per-build breakdown of the VERSION-DEPENDENT metrics (win rate, depth, game funnel),
// so Pulse can scope them to one version instead of conflating every balance change into one number.
// Engagement metrics (players/time/sessions) stay in `overview` — they are version-invariant.
// Keyed off ch_run (carries build + endTurn + won); depth/funnel are per-RUN (the right frame for difficulty).
function byBuildOf(events) {
  const B = {};
  for (const e of events) {
    if (e.type !== 'ch_run') continue;
    const b = e.build || '—', x = e.extra || {};
    const v = B[b] || (B[b] = { runs: 0, wins: 0, depths: [], act2: 0, act4: 0, act6: 0 });
    v.runs++; if (x.won) v.wins++;
    const d = x.endTurn || 0; v.depths.push(d);
    if (d >= 7) v.act2++; if (d >= 19) v.act4++; if (d >= 31) v.act6++;
  }
  const out = {};
  for (const b of Object.keys(B)) {
    const v = B[b], s = v.depths.slice().sort((a, c) => a - c);
    out[b] = { runs: v.runs, wins: v.wins, medianDepth: s.length ? s[s.length >> 1] : 0, funnel: { act2: v.act2, act4: v.act4, act6: v.act6, won: v.wins } };
  }
  return out;
}

function aggregate(events, labels, nowMs) {
  const players = groupByPerson(events, labels);
  const overview = overviewOf(players, nowMs ?? Date.now());
  overview.byBuild = byBuildOf(events);
  return { overview, players };
}

// Shared values between two ordered lists (compared by JSON key).
function shared(a, b) {
  const kb = new Set(b.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))));
  return a.filter((v) => kb.has(typeof v === 'object' ? JSON.stringify(v) : String(v)));
}

// Rank other people as candidate matches for `targetId` by shared soft identifiers.
// Deliberately imperfect — a second computer or travel defeats it, which the UI states.
function matchSuggestions(events, labels, targetId) {
  const players = groupByPerson(events, labels);
  const target = players.find((p) => p.id === targetId);
  if (!target) return [];
  const out = [];
  for (const p of players) {
    if (p.id === targetId) continue;
    const signals = [];
    let score = 0;
    const sharedNames = shared(target.names, p.names);
    if (sharedNames.length) { score += 5; signals.push(`same name "${sharedNames[0]}"`); }
    if (shared(target.ips, p.ips).length) { score += 5; signals.push('same IP address'); }
    if (shared(target.fingerprints, p.fingerprints).length) { score += 3; signals.push('same screen + timezone + language'); }
    const sharedLoc = shared(target.locations, p.locations);
    if (sharedLoc.length) { score += 1; const l = sharedLoc[0]; signals.push(`same location ${[l.city, l.country].filter(Boolean).join(', ')}`); }
    if (shared(target.uas, p.uas).length) { score += 1; signals.push('same browser'); }
    if (score > 0) {
      out.push({
        id: p.id,
        displayName: p.label || p.names[0] || p.id.slice(0, 8),
        label: p.label,
        score,
        confidence: score >= 5 ? 'high' : score >= 3 ? 'medium' : 'low',
        signals,
      });
    }
  }
  out.sort((a, b) => b.score - a.score);
  return out;
}

// One person's full detail: summary + run timeline + match suggestions.
function playerDetail(events, labels, targetId) {
  const players = groupByPerson(events, labels);
  const summary = players.find((p) => p.id === targetId);
  if (!summary) return null;
  const canon = buildCanon(labels);
  const mine = events.filter((e) => personOf(e.cid, canon) === targetId);
  const runs = mine
    .filter((e) => e.type === 'game_over' || e.type === 'trial_won' || e.type === 'trial_death')
    .map((e) => ({ ts: e.ts, type: e.type, mode: e.mode, stage: e.stage, glory: e.glory, turns: e.turns, rank: e.rank, duration_ms: e.duration_ms, build: e.build }))
    .sort((a, b) => ms(b.ts) - ms(a.ts));
  // Session history: one row per sid — when, how long, and what happened in it.
  const bySid = new Map();
  for (const e of mine) {
    if (!e.sid) continue;
    let s = bySid.get(e.sid);
    if (!s) { s = { sid: e.sid, start: e.ts, end: e.ts, durationMs: 0, build: null, fullRuns: 0, trials: 0, deaths: 0, trialWins: 0, won: false, deepestTurn: 0 }; bySid.set(e.sid, s); }
    if (ms(e.ts) < ms(s.start)) s.start = e.ts;
    if (ms(e.ts) > ms(s.end)) s.end = e.ts;
    if (e.build) s.build = e.build;
    if (e.type === 'session_end') s.durationMs += Math.min(Math.max(e.duration_ms || 0, 0), MAX_SEGMENT_MS);
    if (e.type === 'game_start') { if (e.mode === 'trial') s.trials++; else s.fullRuns++; }
    if (e.type === 'game_over' || e.type === 'trial_death') s.deaths++;
    if (e.type === 'trial_won') s.trialWins++;
    if (e.type === 'ch_run' && e.extra && e.extra.won) s.won = true;
    if ((e.type === 'ch_turn' || e.type === 'ch_run' || e.type === 'game_over') && (e.turns || 0) > s.deepestTurn) s.deepestTurn = e.turns;
  }
  const sessions = [...bySid.values()]
    .map((s) => ({ ...s, durationMs: s.durationMs || Math.min(Math.max(ms(s.end) - ms(s.start), 0), MAX_SEGMENT_MS) }))
    .sort((a, b) => ms(b.start) - ms(a.start))
    .slice(0, 60);
  return { summary, runs, sessions, suggestions: matchSuggestions(events, labels, targetId) };
}

module.exports = { aggregate, playerDetail, matchSuggestions, groupByPerson, buildCanon, personOf };
