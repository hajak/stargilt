// Server score store: ONE slot per player (cid) — best only, with an `entered` flag. Node-level
// unit test of store.addScore/topScores (no browser needed; the `page` arg is ignored).
import store from '../store.js';
export const name = 'scores';

export default async function ({ ok, errs }) {
  store._mem.scores = []; // in-memory backend (no DATA_DIR) — start clean
  const A = 'cidA', B = 'cidB';

  let r = await store.addScore({ cid: A, g: 100, t: 20, ts: '1' });
  ok(r.entered && r.best === 100 && r.top.length === 1, `first run enters, one row (best ${r.best})`);

  r = await store.addScore({ cid: A, g: 60, t: 15, ts: '2' });
  ok(!r.entered && r.best === 100 && r.top.length === 1 && r.top[0].g === 100, `a lesser run does NOT enter; the slot stays at the best (100)`);

  r = await store.addScore({ cid: A, g: 200, t: 30, ts: '3' });
  ok(r.entered && r.best === 200 && r.top.length === 1 && r.top[0].g === 200, `a better run REPLACES the slot — still one row for the player (now 200)`);

  r = await store.addScore({ cid: B, g: 150, t: 22, ts: '4' });
  ok(r.entered && r.top.length === 2, `a second player gets their own single slot (${r.top.length} rows)`);

  const top = await store.topScores(10);
  ok(top.length === 2 && top[0].g === 200 && top[1].g === 150, `board = one row per player, sorted by best (A200, B150)`);
  ok(new Set(top.map(s => s.cid)).size === top.length, `no player appears twice on the board`);

  // legacy migration: a stale duplicate row for a cid collapses to that player's best on read
  store._mem.scores.push({ cid: B, g: 170, t: 25, ts: '5' });
  const top2 = await store.topScores(10);
  const bRows = top2.filter(s => s.cid === B);
  ok(bRows.length === 1 && bRows[0].g === 170, `legacy duplicate rows collapse to the player best on read (B → 170)`);

  ok(errs.length === 0, `no errors`);
}
