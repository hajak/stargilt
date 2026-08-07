// Persistence / CONTINUE (v0.13.9-exp contract: ONE ACTIVE RUN, no save-games): an untouched
// brand-new run leaves NO save; persistence begins at the first presented work; a mid-run save
// resumes exactly; death clears the save. Exercises the real reopen path (fresh sessionStorage).
import { bootGame, playTurns, onScreen, BASE } from './harness.mjs';
export const name = 'persistence';

export default async function ({ page, ok, errs }) {
  // ── a fresh, untouched new game leaves NO save (no phantom CONTINUE for an unplayed run) ──
  await bootGame(page, { fresh: true });
  const s1 = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('ch-sg-save')); } catch (e) { return null; } });
  ok(s1 === null, `an untouched brand-new run leaves NO save — one active run, no save-games`);

  // ── play a couple turns (persistence begins at the first END TURN), then REOPEN → CONTINUE resumes ──
  const st = await playTurns(page, 2);
  const s2 = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('ch-sg-save')); } catch (e) { return null; } });
  ok(s2 && s2.v === 1 && Array.isArray(s2.market) && s2.market.length > 0 && s2.name === 'Claude', `after the first presented work the save exists with the market (${s2 && s2.market.length}) + name`);
  const preTurn = await page.evaluate(() => __af.turn), preGlory = await page.evaluate(() => __af.glory);
  await page.evaluate(() => { try { sessionStorage.clear(); } catch (e) {} });
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForFunction(() => document.querySelector('#sm-continue'), { timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 500));
  const menu = { shown: await onScreen(page, '#sm-continue'), note: await page.evaluate(() => document.querySelector('#sm-continue-note').textContent) };
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
    for (let i = 0; i < 140 && !document.querySelector('#debrief').classList.contains('on'); i++) await w(120); // v0.13.16-exp: the ledger IS the death screen
    await w(200);
    return localStorage.getItem('ch-sg-save');
  });
  ok(cleared === null, `death clears the save (no CONTINUE for a dead run)`);

  // ── v0.13.10-exp THE LATCH: once a run has ended, NOTHING may write its save back. A straggling
  //    tally, a queued await — any late saveRun() after death is the phantom CONTINUE the player saw. ──
  const latched = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    __af.gameOver = false; __af.turn = 9;   // pretend a late beat resumed and tried to persist
    saveRun(); await w(50);
    const wrote = localStorage.getItem('ch-sg-save');
    __af.gameOver = true;
    return wrote;
  });
  ok(latched === null, `a late saveRun() after the run ended writes nothing — the finished run cannot come back`);

  // ── and the reopen a player actually does: cold load after a finished run offers no CONTINUE ──
  await page.evaluate(() => { try { sessionStorage.clear(); } catch (e) {} });
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForFunction(() => document.querySelector('#sm-continue'), { timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 600));
  const after = { onScreen: await onScreen(page, '#sm-continue'), save: await page.evaluate(() => localStorage.getItem('ch-sg-save')) };
  ok(!after.onScreen && after.save === null, `reopening after a finished run shows NO CONTINUE — measured on screen, not by the \`hidden\` property`);

  // ── menu PLAY abandons a parked run AT THE CLICK (not silently at the new run's own day 2) ──
  const abandoned = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    localStorage.setItem('ch-sg-save', JSON.stringify({ v: 1, turn: 7, glory: 400, name: 'Claude', market: [], deck: [], discard: [], relics: [], commissions: [] }));
    const before = !!localStorage.getItem('ch-sg-save');
    document.querySelector('#sm-play').click(); await w(300);
    return { before, after: localStorage.getItem('ch-sg-save') };
  });
  ok(abandoned.before && abandoned.after === null, `menu PLAY abandons the parked run the moment it is chosen`);

  // ── v0.13.10-exp: THE LEFTOVER SWEEP. v0.13.9 stopped the game creating phantom saves but never swept
  //    the one already in localStorage — which kept lighting CONTINUE for a run that was never played.
  //    The load path now enforces the write path's contract, and DELETES what fails it. ──
  const plant = (save) => page.evaluate(async (save) => {
    localStorage.setItem('ch-sg-save', JSON.stringify(save));
    const offered = !!loadSave();
    return { offered, left: localStorage.getItem('ch-sg-save') };
  }, save);
  const base = { v: 1, name: 'Claude', gold: 6, glory: 0, rank: 0, focus: 1, buys: 1, tithe: 6,
                 deck: ['coin'], discard: [], relics: [], commissions: [], market: [{ id: 'coin', remaining: 4 }] };

  const seed = await plant({ ...base, build: 'chapters-story · v0.13.8-exp', turn: 1, ts: Date.now() - 36e5 });
  ok(!seed.offered && seed.left === null, `the v0.11.11 turn-1 pre-deal seed is rejected AND swept — no phantom CONTINUE`);

  const old = await plant({ ...base, build: 'chapters-story · v0.13.8-exp', turn: 9, glory: 300, ts: Date.now() - 36e5 });
  ok(!old.offered && old.left === null, `a run saved under older RULES is retired, not resumed into new ones`);

  const unstamped = await plant({ ...base, turn: 9, glory: 300, ts: Date.now() - 36e5 });
  ok(!unstamped.offered && unstamped.left === null, `an unstamped save is treated as pre-contract`);

  const current = await plant({ ...base, build: await page.evaluate(() => BUILD), turn: 9, glory: 300, ts: Date.now() - 36e5 });
  ok(current.offered && current.left !== null, `a save from THIS build is kept and offered — the sweep is not indiscriminate`);

  // ── and the CONTINUE line says when you left it, so an old run is never a mystery ──
  const note = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    document.querySelector('#sm-continue').hidden = true;
    initStartMenu(); await w(80);
    return { text: document.querySelector('#sm-continue-note').textContent, playPrimary: document.querySelector('#sm-play').classList.contains('primary') };
  });
  ok(await onScreen(page, '#sm-continue'), `a real save puts CONTINUE on screen`);
  ok(/left .+ago|left yesterday|left just now/.test(note.text), `CONTINUE names the run AND when it was left (${note.text})`);
  ok(!note.playPrimary, `PLAY steps down from primary when CONTINUE is offered — the two states are visibly different`);

  ok(errs.length === 0, `no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`);
}
