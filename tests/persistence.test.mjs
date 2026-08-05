// Persistence / CONTINUE: a brand-new run is saved from turn 1 (v0.11.11), a mid-run save resumes
// exactly, and death clears the save. Exercises the real reopen path (fresh sessionStorage).
import { bootGame, playTurns, BASE } from './harness.mjs';
export const name = 'persistence';

export default async function ({ page, ok, errs }) {
  // ── a fresh new game writes a turn-1 save BEFORE the first END TURN ──
  await bootGame(page, { fresh: true });
  const s1 = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('ch-sg-save')); } catch (e) { return null; } });
  ok(s1 && s1.v === 1 && s1.turn === 1, `a brand-new run persists a turn-1 save before any END TURN (turn ${s1 && s1.turn})`);
  ok(s1 && Array.isArray(s1.market) && s1.market.length > 0 && s1.name === 'Claude', `the turn-1 save carries the rolled market (${s1 && s1.market.length}) + name`);

  // ── play a couple turns, then REOPEN (clear sessionStorage = new tab) → CONTINUE resumes the exact run ──
  const st = await playTurns(page, 2);
  const preTurn = await page.evaluate(() => __af.turn), preGlory = await page.evaluate(() => __af.glory);
  await page.evaluate(() => { try { sessionStorage.clear(); } catch (e) {} });
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForFunction(() => document.querySelector('#sm-continue'), { timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 500));
  const menu = await page.evaluate(() => ({ shown: !document.querySelector('#sm-continue').hidden, note: document.querySelector('#sm-continue-note').textContent }));
  ok(menu.shown && new RegExp('day ' + preTurn).test(menu.note), `CONTINUE offered for the mid-run save (${menu.note})`); // v0.13-exp: turns are DAYS in the fiction

  await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    document.querySelector('#sm-continue').click(); await w(400);
    const ne = document.querySelector('#nameentry');
    if (ne && ne.classList.contains('on')) { document.querySelector('#ne-input').value = 'Claude'; document.querySelector('#ne-go').click(); }
    for (let i = 0; i < 120 && (__af.busy || __af.hand.length === 0); i++) await w(150);
  });
  const resumed = await page.evaluate(() => ({ turn: __af.turn, glory: __af.glory, hand: __af.hand.length, busy: __af.busy, mktDom: document.querySelectorAll('#mrow .mslot').length }));
  ok(resumed.turn === preTurn && resumed.glory === preGlory && resumed.hand > 0 && !resumed.busy, `resume restores the exact run (turn ${resumed.turn}=${preTurn}, glory ${resumed.glory}=${preGlory}, hand ${resumed.hand})`);
  ok(resumed.mktDom > 0, `the Bazaar DOM is rebuilt on resume (${resumed.mktDom} slots — the v0.8.6 fix)`);

  // ── death clears the save (no CONTINUE for a dead run) ──
  const cleared = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    __af.relics = []; __af.tithe = 9999999; // no charm + an impossible tithe → the miss kills
    for (let i = 0; i < 60 && __af.busy; i++) await w(120);
    document.querySelector('#endturn').click(); await w(250);
    const ce = document.querySelector('#confirmend'); if (ce && ce.classList.contains('on')) document.querySelector('#ce-go').click();
    for (let i = 0; i < 140 && !document.querySelector('#gameover').classList.contains('show'); i++) await w(120);
    await w(200);
    return localStorage.getItem('ch-sg-save');
  });
  ok(cleared === null, `death clears the save (no CONTINUE for a dead run)`);

  ok(errs.length === 0, `no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`);
}
