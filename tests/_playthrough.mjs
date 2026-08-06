// Scratch playthrough driver (not part of the suite): play a real run with a human-ish strategy —
// play everything, buy the best affordable card, burn Dross when the pyre opens, claim boons/relics —
// and photograph the key beats for the publishability review.
import puppeteer from 'puppeteer-core';
import { resolveChrome, startServer, BASE } from './harness.mjs';

const OUT = '/private/tmp/claude-501/-Users-hajak-Documents-EXPERIMENTS-deckbuilder/6b494b5c-c4db-4dea-ac14-817edfc9c950/scratchpad/run';
import { mkdirSync } from 'node:fs';
mkdirSync(OUT, { recursive: true });

const srv = startServer('/Users/hajak/Documents/EXPERIMENTS/deckbuilder');
await new Promise(r => setTimeout(r, 900));
const browser = await puppeteer.launch({ executablePath: resolveChrome(), args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1470, height: 830 });
const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 300)));
const shot = n => page.screenshot({ path: `${OUT}/${n}.png` });
const w = ms => new Promise(r => setTimeout(r, ms));

await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle2' });
await page.waitForFunction(() => window.__af, { timeout: 15000 });
await page.evaluate(() => {
  localStorage.clear(); sessionStorage.clear();
  localStorage.setItem('ch-sg-name', 'Hampus'); sessionStorage.setItem('ch-sg-name', 'Hampus');
  localStorage.setItem('sg-learned', '1'); localStorage.setItem('ch-af-tutor-off', '1');
});
await page.reload({ waitUntil: 'networkidle2' });
await page.waitForFunction(() => document.querySelector('#sm-play'), { timeout: 15000 });
await w(2200); await shot('01-menu');
await page.evaluate(() => document.querySelector('#sm-play').click());
await w(2500); await shot('02-coldopen');
for (let i = 0; i < 24; i++) {
  const on = await page.evaluate(() => { const co = document.querySelector('#coldopen'); if (co && co.classList.contains('on')) { co.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); return true; } return false; });
  await w(500); if (!on) break;
}
await page.evaluate(() => { const ne = document.querySelector('#nameentry'); if (ne && ne.classList.contains('on')) { document.querySelector('#ne-input').value = 'Hampus'; document.querySelector('#ne-go').click(); } });
for (let i = 0; i < 60; i++) { await w(200); if (!(await page.evaluate(() => __af.busy))) break; }
await w(1200); await shot('03-day1');

// One in-page turn driver, human-ish. Returns a small report per day.
const playDay = () => page.evaluate(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms));
  const clk = el => { if (!el) return; el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); el.click && el.click(); };
  const resolveOverlays = async () => {
    const insp = document.querySelector('#inspect');
    if (insp && insp.classList.contains('on')) {
      // in burn mode: burn Dross, spare anything else
      const b = document.querySelector('#insp-burn');
      if (b && inspectCtx && inspectCtx.def && inspectCtx.def.slag) { b.click(); await w(500); return true; }
      if (b) { document.querySelector('#insp-skip').click(); await w(200); return true; }
      document.querySelector('#insp-close').click(); await w(150); return true;
    }
    if (typeof burnMode !== 'undefined' && burnMode) {
      const dross = state.hand.find(h => h.inst.def.slag);
      if (dross) { playCard(dross); await w(300); return true; }
      document.querySelector('#bb-skip').click(); await w(150); return true;
    }
    const boon = document.querySelector('#boon');
    if (boon && boon.classList.contains('on')) { clk(document.querySelector('#boon-row .cardo') || document.querySelector('#boon-skip')); await w(400); return true; }
    const mr = document.querySelector('#mrdraft');
    if (mr && mr.classList.contains('on')) { clk(mr.querySelector('.cardo') || document.querySelector('#mr-skip')); await w(500); return true; }
    const bi = document.querySelector('#bi-begin');
    if (bi && document.querySelector('#bossintro').classList.contains('show')) { bi.click(); await w(200); return true; }
    const dc = document.querySelector('#decree');
    if (dc && dc.classList.contains('on')) { dc.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await w(300); return true; }
    const ce = document.querySelector('#confirmend');
    if (ce && ce.classList.contains('on')) { document.querySelector('#ce-go').click(); await w(150); return true; }
    return false;
  };
  for (let k = 0; k < 10; k++) { if (!(await resolveOverlays())) break; }
  // play every playable card (repeat as draws land)
  for (let pass = 0; pass < 14; pass++) {
    const p = state.hand.find(h => { const d = h.inst.def; return !d.dead && !d.slag && (isFreePlay(d) || state.focus >= focusCostOf(d)); });
    if (!p) break;
    playCard(p); await w(260);
    for (let k = 0; k < 6; k++) { if (!(await resolveOverlays())) break; }
  }
  // buy like a deckbuilder player: engines (draw/focus) first, a burn outlet early, glory later
  for (let b = 0; b < 3 && state.buys > 0; b++) {
    const score = d => (d.gains.draw || 0) * 3 + (d.gains.focus || 0) * 2 + (d.gains.gold || 0)
      + (d.glory || 0) * (state.bossesCleared >= 1 ? 0.9 : 0.4)
      + (d.trash ? (state.turn <= 8 ? 2.5 : 1) : 0) + (d.cantrip ? 1 : 0)
      + (d.dead ? (d.handDraw ? 4 : d.handFocus ? 3 : d.mercyCharge ? (state.relics.some(r => r.def.mercyCharge && !r.shattered) ? 0 : 3) : 1) : 0);
    const slots = state.market.filter(s => s.def && s.remaining > 0 && s.def.cost <= state.gold)
      .sort((a, z) => score(z.def) / Math.max(z.def.cost, 2) - score(a.def) / Math.max(a.def.cost, 2));
    const pick = slots[0];
    if (!pick || score(pick.def) < 1) break;
    buyCard(pick); await w(500);
  }
  const before = { turn: state.turn, tithe: state.tithe, boss: !!state.twist, glory: state.glory };
  document.querySelector('#endturn').click();
  for (let i = 0; i < 300; i++) {
    await w(180);
    dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); // rush the ceremony
    await resolveOverlays();
    if (state.gameOver) break;
    if (!state.busy && state.turn !== before.turn) break;
    if (!state.busy && state.turn === before.turn && document.querySelector('#bossintro').classList.contains('show') === false && i > 30) break;
  }
  return { ...before, after: { turn: state.turn, glory: state.glory, gold: state.gold, deck: state.deck.length + state.discard.length + state.hand.length, relics: state.relics.length, over: state.gameOver, burned: state.burned } };
});

const log = [];
for (let d = 0; d < 26; d++) {
  const r = await playDay();
  log.push(r);
  const t = r.after.turn;
  if (r.boss) await shot(`boss-day${r.turn}`);
  if (t === 4 || t === 8 || t === 13 || t === 19 || t === 25 || t === 31) await shot(`day${t}`);
  if (r.after.over) { await w(2500); await shot('death'); break; }
}
console.log('RUN LOG:', JSON.stringify(log.map(r => ({ day: r.turn, demand: r.tithe, boss: r.boss, glory: r.after.glory, deck: r.after.deck, burned: r.after.burned, over: r.after.over })), null, 1));
console.log('PAGE ERRORS:', JSON.stringify(errs));
await shot('zz-final');
await browser.close(); srv.kill();
