// Cards: the Spell-Surge live counter (v0.11.11) + the burn flow (any owned card is burnable in a
// real run, with the flame affordance; the trials restrict to Dross).
import { bootGame } from './harness.mjs';
export const name = 'cards';

export default async function ({ page, ok, errs }) {
  await bootGame(page, { fresh: true });

  // ── Spell Surge: reworded text + a live n/N counter that only Spell-type cards tick ──
  const surge = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < 40 && __af.busy; i++) await w(120);
    const text = synText(__afDefOf('tidewhisper'));
    const e = putInHand(makeInstance(__afDefOf('tidewhisper')), '#deckpile'); await w(60);
    const mkP = id => ({ inst: makeInstance(__afDefOf(id)), el: document.createElement('div'), pos: { x: 0, y: 0 } });
    const readSyn = () => e.el.querySelector('.synline').textContent;
    __af.played = []; updateSynIndicators(); await w(20); const at0 = readSyn();
    __af.played = [mkP('spark')]; updateSynIndicators(); await w(20); const at1 = readSyn(); const prog = e.el.querySelector('.synline').classList.contains('progress');
    __af.played = [mkP('spark'), mkP('emberling')]; updateSynIndicators(); await w(20); const atCreature = readSyn(); // Creature must NOT tick
    __af.played = [mkP('spark'), mkP('tidewake')]; updateSynIndicators(); await w(20); const armed = e.el.querySelector('.synline').classList.contains('armed'); const at2 = readSyn();
    return { text, at0, at1, prog, atCreature, armed, at2, sparkType: __afDefOf('spark').type, emberType: __afDefOf('emberling').type };
  });
  ok(/other Spells played first/i.test(surge.text), `card text names the self-exclusion + order ("${surge.text}")`);
  ok(/SPELLS\s*0\/2/i.test(surge.at0), `the hand card shows a live counter from 0 ("${surge.at0.trim()}")`);
  ok(/SPELLS\s*1\/2/i.test(surge.at1) && surge.prog, `1 Spell (${surge.sparkType}) → 1/2 with the building highlight`);
  ok(/SPELLS\s*1\/2/i.test(surge.atCreature), `a Creature (${surge.emberType}) does NOT tick the counter — still 1/2`);
  ok(surge.armed && /now!/i.test(surge.at2), `a 2nd Spell fires the surge (armed, "…now!")`);

  // ── Burn: in a real run every owned card is burnable, and the flame affordance arms ──
  await bootGame(page, { fresh: true });
  const burn = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < 40 && __af.busy; i++) await w(120);
    const notBefore = !document.body.classList.contains('burning');
    const bp = enterBurnMode(); await w(60);
    const on = document.body.classList.contains('burning');
    const h = state.hand[0];
    const edge = getComputedStyle(h.el.querySelector('.cardface'), '::before').borderTopWidth;
    inspectCtx = null; playCard(h); await w(40);
    const burnable = !!(inspectCtx && inspectCtx.burn);
    const inTrialNow = inTrial();
    closeInspect(); await w(20); resolveBurn(); await bp; await w(40);
    const cleared = !document.body.classList.contains('burning');
    return { notBefore, on, edge, burnable, cleared, inTrialNow };
  });
  ok(burn.notBefore && burn.on && burn.cleared, `body.burning arms on burn mode and clears on resolve`);
  ok(burn.edge === '2px', `hand cards wear the flame edge (2px) while burning`);
  ok(burn.burnable && !burn.inTrialNow, `any hand card opens the burn confirm in a real run (no bought-only gate)`);

  ok(errs.length === 0, `no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`);
}
