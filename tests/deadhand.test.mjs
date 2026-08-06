// THE COALTURNER (v0.13.10-exp rule): one clause, and it is about DRAW. An opening hand holding no
// card that draws is turned back and redealt — once per day, and only if you own the relic. A hand
// with any draw source is left alone no matter how weak it looks (the v0.13.8/9 "no draw AND no ❖" /
// "cannot dig nor pay" rules both needed a paragraph and still surprised players).
import { bootGame } from './harness.mjs';
export const name = 'deadhand';

// Deal an exact hand, then ask the relent whether it fires. Returns the hand before/after.
const tryRelent = (page, ids, { ownRelic = true } = {}) => page.evaluate(async ({ ids, ownRelic }) => {
  const w = ms => new Promise(r => setTimeout(r, ms));
  state.relics = ownRelic ? [makeInstance(__afDefOf('coalturner'))] : [];
  renderBench();
  state.hand.forEach(h => h.el && h.el.remove());
  state.hand = [];
  state.mulliganed = false;
  state.deck = ids.map(id => makeInstance(__afDefOf(id)));   // the deck the redeal would draw from
  for (const id of ids) putInHand(makeInstance(__afDefOf(id)), '#deckpile');
  await w(160);
  captureOpenHand();
  const snap = state.openSnap;
  const before = state.hand.map(h => h.inst.uid).join(',');
  await mulliganDeadHand(ids.length);
  await w(200);
  return { draw: snap.draw, fired: state.hand.map(h => h.inst.uid).join(',') !== before, n: state.hand.length };
}, { ids, ownRelic });

export default async function ({ page, ok, errs }) {
  await bootGame(page, { fresh: true });
  await page.evaluate(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); for (let i = 0; i < 40 && __af.busy; i++) await w(120); });

  // ── no draw anywhere in the hand → the Coalturner turns it ──
  const noDraw = await tryRelent(page, ['coin', 'coin', 'spark', 'spark', 'kindling']);
  ok(noDraw.draw === 0 && noDraw.fired, `a hand with no draw is turned back and redealt (draw sources: ${noDraw.draw})`);
  ok(noDraw.n === 5, `the redeal hands back a full hand (${noDraw.n} cards)`);

  // ── one draw source is enough — the hand stands, however thin ──
  const oneDraw = await tryRelent(page, ['coin', 'coin', 'spark', 'spark', 'tidewake']);
  ok(oneDraw.draw === 1 && !oneDraw.fired, `a single Tidewake keeps the hand — you can dig, so it is not dead`);

  // ── and a strong-looking hand with no draw is STILL turned: the rule is one clause, not a judgement call ──
  const richNoDraw = await tryRelent(page, ['coin', 'coin', 'coin', 'coin', 'coin']);
  ok(richNoDraw.draw === 0 && richNoDraw.fired, `five playable Coins have no draw — the rule fires, and says so`);

  // ── without the relic there is no relent: a dead hand is simply your hand ──
  const unowned = await tryRelent(page, ['coin', 'coin', 'spark', 'spark', 'kindling'], { ownRelic: false });
  ok(!unowned.fired, `without The Coalturner on the bench nothing relents`);

  // ── the card text a player actually reads must name the same trigger ──
  const text = await page.evaluate(() => relicEffectText(__afDefOf('coalturner')));
  ok(/draw/i.test(text) && !/neither dig nor pay/i.test(text), `the relic's own words name DRAW: “${text}”`);

  ok(errs.length === 0, `no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`);
}
