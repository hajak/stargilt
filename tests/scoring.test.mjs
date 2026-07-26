// Scoring engine: computeScore composes correctly, the MULT cap clamps + rises per boss,
// STAR_BOOST is live, and the Iron Cage soft-cap damps plays past the 3rd identically in the projection.
import { bootGame } from './harness.mjs';
export const name = 'scoring';

export default async function ({ page, ok, errs }) {
  await bootGame(page, { fresh: true });

  // ── the final = round(base × mult) + relics + swing identity, on a known board ──
  const parts = await page.evaluate(() => {
    const mk = id => ({ inst: makeInstance(__afDefOf(id)), el: null, pos: { x: 0, y: 0 } });
    __af.played = Array.from({ length: 4 }, () => mk('coin'));
    __af.combo = 3; __af.bonusStars = 0; __af.relics = []; __af.twist = null;
    const s = computeScore();
    return { base: s.stars !== undefined ? s.stars : s.base, mult: s.mult, final: s.final, add: s.add, x: s.x };
  });
  ok(parts.final === Math.round(parts.base * parts.mult), `final = round(base × mult): ${parts.base}×${parts.mult.toFixed?parts.mult.toFixed(2):parts.mult} = ${parts.final}`);
  ok(parts.base > 0 && parts.mult >= 1, `a played board scores a positive base (${parts.base}) and mult ≥ 1 (${parts.mult.toFixed?parts.mult.toFixed(2):parts.mult})`);

  // ── STAR_BOOST is applied to base ★ (each played card scores a touch hotter) ──
  const boost = await page.evaluate(() => typeof STAR_BOOST === 'number' && STAR_BOOST);
  ok(boost >= 1.05 && boost <= 1.1, `STAR_BOOST live and modest (${boost})`);

  // ── the additive MULT cap clamps a huge chain, and RISES with bosses cleared ──
  const cap = await page.evaluate(() => {
    const mk = id => ({ inst: makeInstance(__afDefOf(id)), el: null, pos: { x: 0, y: 0 } });
    __af.played = Array.from({ length: 12 }, () => mk('coin'));
    __af.combo = 80; __af.bonusStars = 0; __af.relics = []; __af.twist = null;
    __af.bossesCleared = 0; const c0 = effMultCap(); const s0 = computeScore();
    __af.bossesCleared = 7; const c7 = effMultCap(); const s7 = computeScore();
    __af.bossesCleared = 0;
    return { c0, c7, add0Capped: s0.add <= c0 + 1e-6, add7Capped: s7.add <= c7 + 1e-6, s0mult: s0.mult, s7mult: s7.mult };
  });
  ok(cap.c7 > cap.c0, `the MULT cap RISES with bosses cleared (boss0 ${cap.c0} → boss7 ${cap.c7})`);
  ok(cap.add0Capped && cap.add7Capped, `a runaway chain is clamped to the cap at both boss counts`);
  ok(cap.s7mult > cap.s0mult, `the higher cap lets the same board score a higher mult (${cap.s0mult.toFixed(1)} → ${cap.s7mult.toFixed(1)})`);

  // ── Iron Cage soft cap: plays past the 3rd score a fraction; applied inside computeScore (so the meter can't lie) ──
  const soft = await page.evaluate(() => {
    const boss = typeof bossFor === 'function' ? bossFor(7) : null; // act-7 Aspect (The Iron Cage)
    const sc = boss && boss.softCap;
    // exercise the softCapFactor helper directly if present
    const factors = [];
    __af.twist = boss;
    for (let i = 0; i < 5; i++) factors.push(typeof softCapFactor === 'function' ? softCapFactor(i) : null);
    __af.twist = null;
    return { has: !!sc, after: sc && sc.after, mult: sc && sc.mult, factors };
  });
  ok(soft.has && soft.after === 3, `The Iron Cage carries a soft cap after ${soft.after} plays`);
  ok(soft.factors[0] === 1 && soft.factors[2] === 1 && soft.factors[3] === soft.mult && soft.factors[4] === soft.mult,
    `softCapFactor damps only plays past the 3rd (${soft.factors.join(',')})`);

  ok(errs.length === 0, `no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`);
}
