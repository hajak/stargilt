// Scratch tour (not part of the suite): put the live game into legitimate mid/late states and
// photograph the beats the short-lived drivers never reached — boss arrival, master draft, decree,
// late-game numbers, the victory debrief.
import puppeteer from 'puppeteer-core';
import { resolveChrome, startServer, BASE } from './harness.mjs';
import { mkdirSync } from 'node:fs';

const OUT = '/private/tmp/claude-501/-Users-hajak-Documents-EXPERIMENTS-deckbuilder/6b494b5c-c4db-4dea-ac14-817edfc9c950/scratchpad/run';
mkdirSync(OUT, { recursive: true });
const srv = startServer('/Users/hajak/Documents/EXPERIMENTS/deckbuilder');
await new Promise(r => setTimeout(r, 900));
const browser = await puppeteer.launch({ executablePath: resolveChrome(), args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1470, height: 830 });
const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 300)));
const shot = n => page.screenshot({ path: `${OUT}/${n}.png` });
const w = ms => new Promise(r => setTimeout(r, ms));

const boot = async () => {
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.__af, { timeout: 15000 });
  await page.evaluate(() => {
    localStorage.clear(); sessionStorage.clear();
    localStorage.setItem('ch-sg-name', 'Hampus'); sessionStorage.setItem('ch-sg-name', 'Hampus');
    localStorage.setItem('sg-learned', '1'); localStorage.setItem('ch-af-tutor-off', '1');
    sessionStorage.setItem('ch-af-restart', '1'); // skip the menu straight into the board
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.__af, { timeout: 15000 });
  await page.evaluate(() => { const ne = document.querySelector('#nameentry'); if (ne && ne.classList.contains('on')) { document.querySelector('#ne-input').value = 'Hampus'; document.querySelector('#ne-go').click(); } });
  for (let i = 0; i < 80; i++) { await w(200); if (!(await page.evaluate(() => __af.busy))) break; }
};

// Rebuild the live state as a plausible run at `turn` with engines and history, using only game APIs.
const midgame = (turn, opts) => page.evaluate(async ({ turn, opts }) => {
  const w = ms => new Promise(r => setTimeout(r, ms));
  const acts = Math.floor((turn - 1) / TURNS_PER_ACT);
  state.turn = turn; state.tithe = TITHE_FOR(turn);
  state.bossesCleared = acts; state.locksBroken = Array.from({ length: acts }, (_, i) => i + 1);
  state.glory = opts.glory; state.gold = opts.gold; state.rank = opts.rank;
  state.focusPerTurn = 1 + Math.floor(state.rank / 3); state.focus = state.focusPerTurn;
  state.burned = opts.burned || 0; state.ashRung = ashRungsWon().length;
  while (state.rank + 1 < RANKS.length && state.glory >= RANKS[state.rank + 1].at) state.rank++;
  const mk = id => makeInstance(defFromId(id));
  state.relics = (opts.relics || []).map(mk);
  state.deck = (opts.deck || []).map(mk);
  state.discard = []; state.hand.forEach(h => h.el && h.el.remove()); state.hand = [];
  for (let i = 0; i < acts; i++) { await evolveMarket(); } // deepen the Bazaar like a real run would
  setCounter('gold', state.gold); setCounter('glory', state.glory); setCounter('turn', state.turn);
  setCounter('focus', state.focus); setCounter('buys', state.buys);
  $('#rankname').textContent = RANKS[state.rank].name; updateRankbar();
  clearBossState(); renderChapterMap(); renderTwistBanner(); renderBench(); updatePiles();
  await dealCards(Math.max(1, 5 + benchSum('handDraw')));
  captureOpenHand(); updateTitheMeter(); updatePlayable(); updateAfford();
}, { turn, opts });

const driveDay = (boost) => page.evaluate(async (boost) => {
  const w = ms => new Promise(r => setTimeout(r, ms));
  const clk = el => { if (!el) return; el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); el.click && el.click(); };
  for (let pass = 0; pass < 12; pass++) {
    const p = state.hand.find(h => { const d = h.inst.def; return !d.dead && !d.slag && (isFreePlay(d) || state.focus >= focusCostOf(d)); });
    if (!p) break; playCard(p); await w(220);
  }
  if (boost) { state.bonusStars += Math.ceil(state.tithe * 2 / Math.max(computeScore().mult, 1)); updateTitheMeter(); }
  document.querySelector('#endturn').click();
  for (let i = 0; i < 400; i++) {
    await w(180);
    const insp = document.querySelector('#inspect'); if (insp && insp.classList.contains('on')) { const s = document.querySelector('#insp-skip'); if (s && !s.hidden) s.click(); else document.querySelector('#insp-close').click(); }
    if (typeof burnMode !== 'undefined' && burnMode) document.querySelector('#bb-skip').click();
    const boon = document.querySelector('#boon'); if (boon && boon.classList.contains('on')) clk(document.querySelector('#boon-row .cardo') || document.querySelector('#boon-skip'));
    const ce = document.querySelector('#confirmend'); if (ce && ce.classList.contains('on')) document.querySelector('#ce-go').click();
    if (!state.busy && !document.querySelector('#bossintro').classList.contains('show') && !document.querySelector('#mrdraft').classList.contains('on') && !document.querySelector('#decree').classList.contains('on') && i > 8) break;
    if (state.gameOver) break;
  }
  return { turn: state.turn, glory: state.glory, over: state.gameOver };
}, boost);

const waitFor = async (sel, cls, name, ms = 30000) => {
  try { await page.waitForFunction((s, c) => document.querySelector(s).classList.contains(c), { timeout: ms }, sel, cls); await w(1400); await shot(name); return true; }
  catch (e) { return false; }
};

// ── ACT 3 ENTRY: a healthy mid-game board ──
await boot();
await midgame(17, {
  glory: 900, gold: 14, rank: 3, burned: 6,
  relics: ['emberheart', 'tidelens', 'everember', 'longkiln', 'embersigil'],
  deck: ['coin', 'coin', 'coin', 'spark', 'spark', 'tidewake', 'tidewake', 'kindling', 'gildhall', 'stormbazaar', 'warren', 'conclave', 'zealot', 'pyrebloom', 'siltdredger', 'altar', 'dross', 'dross'],
});
await w(800); await shot('10-midgame-day17');

// present day 17 (boosted to clear) → day 18 is the ACT 3 BOSS
const bossP = driveDay(true);
await waitFor('#bossintro', 'show', '11-boss-arrival');
await page.evaluate(() => document.querySelector('#bi-begin').click());
await bossP; await w(600); await shot('12-boss-day');

// beat the boss (boosted) → lock breaks, decree, master draft
const beatP = driveDay(true);
await waitFor('#decree', 'on', '13-decree', 45000);
await page.evaluate(() => document.querySelector('#decree').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
await waitFor('#mrdraft', 'on', '14-master-draft', 20000);
await page.evaluate(() => { const c = document.querySelector('#mr-row .cardo'); if (c) { c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); c.click && c.click(); } });
await beatP; await w(800); await shot('15-after-boss');

// ── LATE GAME: day 41, big numbers ──
await boot();
await midgame(41, {
  glory: 24000, gold: 30, rank: 7, burned: 17,
  relics: ['emberheart', 'everember', 'furnaceheart', 'aethercrown', 'keystone', 'deepkiln', 'roaringbellows', 'heartofforge', 'greatercrown'],
  deck: ['coin', 'coin', 'spark', 'tidewake', 'tidewake', 'gildhall', 'stormbazaar', 'warren', 'conclave', 'zealot', 'siltdredger', 'kiln', 'abyss', 'sigilstorm', 'starwright', 'giltcolossus', 'pyrebloom', 'ashgilt', 'caravan', 'grovewarden'],
});
await w(900); await shot('20-lategame-day41');
await driveDay(true); await w(600); await shot('21-lategame-tally');

// ── THE FINAL BOSS + VICTORY DEBRIEF ──
await boot();
await midgame(47, {
  glory: 41000, gold: 44, rank: 8, burned: 20,
  relics: ['emberheart', 'everember', 'furnaceheart', 'aethercrown', 'keystone', 'deepkiln', 'roaringbellows', 'heartofforge', 'greatercrown', 'voidprism'],
  deck: ['tidewake', 'tidewake', 'gildhall', 'stormbazaar', 'warren', 'conclave', 'zealot', 'siltdredger', 'kiln', 'abyss', 'sigilstorm', 'starwright', 'giltcolossus', 'grovewarden', 'caravan'],
});
const finalP = driveDay(true);
await waitFor('#bossintro', 'show', '30-final-boss');
await page.evaluate(() => document.querySelector('#bi-begin').click());
await finalP; await w(500);
const winP = driveDay(true);
await w(6000); await shot('31-victory');
await winP.catch(() => {});
for (let i = 0; i < 30; i++) { await w(500); if (await page.evaluate(() => document.querySelector('#debrief') && document.querySelector('#debrief').classList.contains('on'))) break; }
await w(1500); await shot('32-debrief');

console.log('TOUR DONE. ERRORS:', JSON.stringify(errs));
await browser.close(); srv.kill();
