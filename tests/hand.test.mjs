// Hand layout: hover-to-spread (v0.11.12). Hovering a card splays the fan wider so occluded cards
// become readable, and it collapses back once the pointer leaves the hand.
import { bootGame } from './harness.mjs';
export const name = 'hand';

const medianGap = page => page.evaluate(() => {
  const xs = state.hand.map(h => h.pos.x).sort((a, b) => a - b);
  const gaps = xs.slice(1).map((x, i) => x - xs[i]);
  return Math.round(gaps[Math.floor(gaps.length / 2)]);
});

export default async function ({ page, ok, errs }) {
  await bootGame(page, { fresh: true });

  // build a big, occluded hand so the spread has room to matter
  await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < 40 && __af.busy; i++) await w(120);
    const ids = ['tidewhisper', 'stormcall', 'spark', 'coin', 'emberling', 'tidewake', 'kindling'];
    for (const id of ids) { const d = __afDefOf(id); if (d) putInHand(makeInstance(d), '#deckpile'); }
    state.handSpread = false; state.hoverIdx = -1; layoutHand(); await w(120);
  });
  const rest = await medianGap(page);

  // hover a middle card via the real event path → the fan spreads
  await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    const mid = state.hand[Math.floor(state.hand.length / 2)];
    mid.el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await w(80);
  });
  const spreadOn = await page.evaluate(() => !!state.handSpread);
  const spread = await medianGap(page);
  ok(spreadOn, `hovering a hand card sets handSpread`);
  ok(spread > rest, `the fan splays wider on hover (gap ${rest}px → ${spread}px)`);

  // leave the hand → after the collapse grace, it snaps back
  await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    const mid = state.hand[Math.floor(state.hand.length / 2)];
    mid.el.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
    await w(220); // > the 110ms collapse debounce
  });
  const collapsedOff = await page.evaluate(() => !state.handSpread);
  const collapsed = await medianGap(page);
  ok(collapsedOff, `leaving the hand clears handSpread after the debounce`);
  ok(collapsed === rest, `the fan collapses back to its resting gap (${collapsed}px)`);

  ok(errs.length === 0, `no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`);
}
