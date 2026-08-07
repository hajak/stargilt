// v0.13.14-exp: the six playtest directives, pinned. Undo (take back), the death ledger + THE CLIMB,
// the corner cell window, the glossary + GUIDANCE master switch, deeper stats, tiered art.
import { bootGame, onScreen, BASE } from './harness.mjs';
export const name = 'features';

export default async function ({ page, ok, errs }) {
  await bootGame(page, { fresh: true });

  // ── 1. TAKE BACK: a pure-value play arms it; undoing restores the EXACT pre-play state ──
  const undo = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < 60 && state.busy; i++) await w(120);
    const coin = state.hand.find(h => h.inst.def.id === 'coin') || state.hand.find(h => undoEligible(h) && !h.inst.def.dead && !h.inst.def.slag);
    if (!coin) return { skip: true };
    const before = { hand: state.hand.length, played: state.played.length, gold: state.gold, focus: state.focus, bonus: state.bonusStars, combo: state.combo };
    playCard(coin);
    for (let i = 0; i < 50 && state.pendingEffects.length; i++) await w(120);
    await w(200);
    const vis = () => getComputedStyle(document.querySelector('#undobtn')).visibility; // v0.13.16: slot reserved, visibility toggles
    const armed = !!lastUndo && vis() === 'visible';
    undoLastPlay(); await w(300);
    const after = { hand: state.hand.length, played: state.played.length, gold: state.gold, focus: state.focus, bonus: state.bonusStars, combo: state.combo };
    return { skip: false, armed, match: JSON.stringify(before) === JSON.stringify(after), btnGone: vis() === 'hidden' };
  });
  if (!undo.skip) {
    ok(undo.armed, `a consequence-free play arms TAKE BACK (button visible)`);
    ok(undo.match && undo.btnGone, `undo restores the exact pre-play state and the window closes`);
  }

  // ── 2. a DRAW play must NOT arm it (seeing cards is a commitment) ──
  const drawCase = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    const e = putInHand(makeInstance(DB.tidewake), '#deckpile'); await w(150); // Tidewake draws 1
    playCard(e);
    for (let i = 0; i < 50 && state.pendingEffects.length; i++) await w(120);
    await w(200);
    return { armed: !!lastUndo };
  });
  ok(!drawCase.armed, `a play that DRAWS does not arm TAKE BACK — no scrying`);

  // ── 3. the cell window stands at the CORNER, on screen, and the old flourish yields ──
  const win = await page.evaluate(() => {
    updateCellWindow();
    const r = document.querySelector('#cellwindow').getBoundingClientRect();
    const fl = document.querySelector('.corner.tl');
    return { on: document.querySelector('#cellwindow').classList.contains('on'),
      left: r.left, top: r.top, w: r.width,
      flourishGone: !fl || getComputedStyle(fl).display === 'none' };
  });
  ok(win.on && win.left < 80 && win.top < 60 && win.w > 30, `the cell window stands in the upper-left corner (${Math.round(win.left)},${Math.round(win.top)})`);
  ok(win.flourishGone, `the corner flourish yields its post while the window is on`);

  // ── 4. GUIDANCE: tooltips exist; the master switch silences concept notes and the nudge ──
  const help = await page.evaluate(() => {
    const glossTargets = document.querySelectorAll('[data-gloss]').length;
    Help.set(true);
    const conceptSquelched = (() => { const n0 = document.querySelector('#coachnote'); showConcept(null, 'test'); const n = document.querySelector('#coachnote'); return !(n && n.classList.contains('on')); })();
    let nudgeSkipped = false;
    confirmUnspent().then(v => { nudgeSkipped = v === true; });
    Help.set(false);
    const conceptBack = (() => { showConcept(null, 'test2'); const n = document.querySelector('#coachnote'); return n && n.classList.contains('on'); })();
    return new Promise(r => setTimeout(() => r({ glossTargets, conceptSquelched, nudgeSkipped, conceptBack, persisted: localStorage.getItem('ch-af-help-off') }), 80));
  });
  ok(help.glossTargets >= 10, `the glossary reaches ${help.glossTargets} hover targets`);
  ok(help.conceptSquelched && help.nudgeSkipped, `GUIDANCE OFF silences concept notes AND the shopping nudge`);
  ok(help.conceptBack && help.persisted === '0', `GUIDANCE ON restores them; the choice persists`);

  // ── 5. THE DEATH LEDGER: a fallen run opens the dossier with THE CLIMB and THE WORK filled ──
  const ledger = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    // a couple of prior attempts so the climb has history
    localStorage.setItem('ch-bal-log', JSON.stringify([
      { started: Date.now() - 9e7, build: BUILD, won: false, endTurn: 5, endGlory: 90, rows: [], cards: { plays: { coin: 9 }, buys: {}, forges: {}, burns: {}, relics: {}, names: {} } },
      { started: Date.now() - 5e7, build: BUILD, won: false, endTurn: 11, endGlory: 610, rows: [], cards: { plays: { tidewake: 7 }, buys: {}, forges: {}, burns: {}, relics: {}, names: {} } },
    ]));
    state.relics = []; state.tithe = 9999999; // no charm, impossible demand → death
    for (let i = 0; i < 60 && state.busy; i++) await w(120);
    document.querySelector('#endturn').click(); await w(300);
    const ce = document.querySelector('#confirmend'); if (ce && ce.classList.contains('on')) document.querySelector('#ce-go').click();
    // v0.13.16-exp: ONE death screen — the ledger opens directly; #gameover must stay dark
    for (let i = 0; i < 200 && !document.querySelector('#debrief').classList.contains('on'); i++) await w(150);
    await w(300);
    const db = document.querySelector('#debrief');
    return {
      opened: db.classList.contains('on'), died: db.classList.contains('died'),
      gameoverShown: document.querySelector('#gameover').classList.contains('show'),
      title: db.querySelector('.db-title').textContent,
      seal: document.querySelector('#db-seal').textContent.replace(/\s+/g, ''),
      epitaph: (document.querySelector('#db-epitaph') || {}).textContent || '',
      climbBars: db.querySelectorAll('#db-climb .cl-bar').length,
      curBarIsLast: !!db.querySelector('#db-climb .cl-bar:last-child.cur'),
      sealedStubs: db.querySelectorAll('.db-lock').length,
      curveSealed: !!db.querySelector('#db-curve .db-lock'),
      workSealed: !!db.querySelector('#db-work .db-lock'),
      newRunThere: !!document.querySelector('#db-newrun'),
    };
  });
  ok(ledger.opened && ledger.died && !ledger.gameoverShown, `death opens the ledger DIRECTLY — one screen, #gameover stays dark`);
  ok(/Not Yet Forged/.test(ledger.title) && /UN-?PAID/.test(ledger.seal), `the death face reads "${ledger.title}" · seal ${ledger.seal}`);
  ok(/He demanded/.test(ledger.epitaph), `the verdict line lives in the ledger's masthead now`);
  ok(ledger.climbBars === 3 && ledger.curBarIsLast, `THE CLIMB shows every attempt (${ledger.climbBars} bars) with THIS one lit last`);
  ok(ledger.curveSealed && ledger.workSealed && ledger.sealedStubs >= 4, `a day-1 death EARNS almost nothing — ${ledger.sealedStubs} pages sealed (curve, autopsy, work, deck…)`);
  ok(ledger.newRunThere, `NEW RUN is a step away on the ledger itself`);

  // ── 6. tiered art: a mythic's SVG carries strictly more scene than a common's ──
  const art = await page.evaluate(() => {
    const common = artSVG(DB.coin), mythic = artSVG(Object.values(DB).find(d => d.rarity === 'mythic' && d.sigil));
    const count = (s, re) => (s.match(re) || []).length;
    return { commonLines: count(common, /<line /g), mythicLines: count(mythic, /<line /g),
             sizeGap: mythic.length - common.length };
  });
  ok(art.commonLines === 0 && art.mythicLines >= 8 && art.sizeGap > 500,
    `tiered art: a common has NO rays, a mythic has ${art.mythicLines} — and ${art.sizeGap} extra bytes of scene`);

  // ── 7. v0.13.15-exp: the GRIMOIRE greets the very first run — SKIP on screen, once ever ──
  await page.evaluate(() => {
    localStorage.clear(); sessionStorage.clear();
    localStorage.setItem('ch-sg-name', 'Claude'); sessionStorage.setItem('ch-sg-name', 'Claude');
    localStorage.setItem('sg-learned', '1');               // deliberately NOT ch-af-tutor-off — a true first-timer
    sessionStorage.setItem('ch-af-restart', '1');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.__af && !__af.busy, { timeout: 30000 }).catch(() => {});
  await page.waitForFunction(() => document.querySelector('#tutor').classList.contains('on'), { timeout: 30000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 800)); // let the 450ms opacity fade land — visibility is asserted, not the class
  const grim = { open: await onScreen(page, '#tutpanel'), skip: await onScreen(page, '#tutskip'),
    marked: await page.evaluate(() => localStorage.getItem('ch-af-tutor-off')) };
  ok(grim.open && grim.skip, `the first-ever run opens the Grimoire unasked, SKIP visibly on screen`);
  ok(grim.marked === '1', `the greeting is stamped at open — once ever`);
  const afterSkip = await page.evaluate(async () => {
    document.querySelector('#tutskip').click();
    await new Promise(r => setTimeout(r, 400));
    return { closed: !document.querySelector('#tutor').classList.contains('on'), playable: !state.busy && !state.gameOver };
  });
  ok(afterSkip.closed && afterSkip.playable, `SKIP closes the book and the run is immediately playable`);
  await page.evaluate(() => { sessionStorage.setItem('ch-af-restart', '1'); });
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.__af && !__af.busy, { timeout: 30000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));
  ok(!(await onScreen(page, '#tutpanel')), `the second run starts clean — the book never auto-opens again`);

  ok(errs.length === 0, `no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`);
}
