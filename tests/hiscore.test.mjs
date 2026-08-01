// High-score presentation: a run below your best does NOT enter — it's shown below the one-slot
// board with a "won't enter" note; a run above your best enters as a NEW BEST (v0.11.13).
import { bootGame } from './harness.mjs';
export const name = 'hiscore';

export default async function ({ page, ok, errs }) {
  await bootGame(page, { fresh: true });

  const r = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    // a standing personal best of 500★
    localStorage.setItem('ch-af-scores', JSON.stringify([{ g: 500, t: 40, r: 'Master Smith', d: '2026-01-01', n: 'Claude' }]));
    const el = document.querySelector('#go-scores');

    // a LOWER run (300) — must not enter
    __af.glory = 300; __af.turn = 25;
    const sc1 = finishScores(el); await w(60);
    const low = { entered: sc1.entered, html: el.innerHTML };

    // a HIGHER run (900) — enters + replaces the slot
    __af.glory = 900; __af.turn = 44;
    const sc2 = finishScores(el); await w(60);
    const high = { entered: sc2.entered, html: el.innerHTML };
    return { low, high };
  });

  ok(!r.low.entered, `a run below your best does NOT enter (entered=false)`);
  ok(/hs-reject/.test(r.low.html) && /won't enter/i.test(r.low.html), `the sub-best run is shown BELOW with a "won't enter" note`);
  ok(/300\s*★/.test(r.low.html) && /500\s*★/.test(r.low.html), `the note names this run (300★) and the board still holds your best (500★)`);
  ok(!/hs-row me/.test(r.low.html) && !/newbest/.test(r.low.html), `the sub-best run is NOT highlighted on the board and is not called a new best`);

  ok(r.high.entered, `a run above your best ENTERS (entered=true)`);
  ok(/newbest/.test(r.high.html) && !/hs-reject/.test(r.high.html), `the new best takes the slot (NEW BEST title, no reject note)`);
  ok(/hs-row me/.test(r.high.html) && /900\s*★/.test(r.high.html), `the board highlights your new best (900★)`);

  ok(errs.length === 0, `no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`);
}
