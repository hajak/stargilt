// Difficulty: structural invariants of the demand curve + the self-registered config.
// Asserts SHAPE, not magic numbers — intended balance tuning won't break it, but a broken curve
// (non-monotonic, unreachable summit, missing/again-uncapped config) will.
import { bootGame } from './harness.mjs';
export const name = 'difficulty';

export default async function ({ page, ok, errs }) {
  await bootGame(page, { fresh: true });

  const d = await page.evaluate(() => {
    const cfg = difficultyConfig();
    // base curve = demand at non-boss turns (boss turns spike then settle — an intended sawtooth)
    let mono = true, prev = 0;
    for (let t = 1; t <= 48; t++) { if (t % 6 === 0) continue; const v = chapterDemand(t); if (v < prev) mono = false; prev = v; }
    const bossT = [6, 12, 18, 24, 30, 36, 42, 48];
    const spikes = bossT.every(t => chapterDemand(t) > chapterDemand(t - 1)); // each boss demands more than the build turn before it
    return {
      cfg, mono, spikes,
      t1: chapterDemand(1), t24: chapterDemand(24), t48: chapterDemand(48),
      bossMults: cfg.bossMults, boonMult: cfg.boonMult,
    };
  });

  ok(d.mono, `the base demand curve climbs every non-boss turn (monotonic)`);
  ok(d.spikes, `every one of the 8 bosses demands more than the turn before it`);
  ok(d.t1 < d.t24 && d.t24 < d.t48, `demand rises early → mid → late (t1 ${d.t1} < t24 ${d.t24} < t48 ${d.t48})`);
  ok(d.t48 >= 50000 && d.t48 <= 150000, `the summit stays in the capped-score-reachable band (t48 ${d.t48}, not a v0.9-style wall)`);

  // config self-registers every difficulty knob (so the admin Versions tab can diff builds)
  const need = ['demandBase', 'demandRate', 'knee', 'lateRate', 'multCap', 'capPerBoss', 'xCap', 'chainRate', 'tribalRate', 'starBoost', 'boonMult', 'bossMults'];
  const missing = need.filter(k => d.cfg[k] === undefined || d.cfg[k] === null);
  ok(missing.length === 0, `difficultyConfig() self-registers every knob (missing: ${missing.join(',') || 'none'})`);
  ok(Array.isArray(d.bossMults) && d.bossMults.length === 8 && d.bossMults.every(m => m >= 1), `8 boss demand multipliers, all ≥ 1`);
  ok(d.boonMult > 1, `the Boon reward threshold is a real bar above 1× the tithe (${d.boonMult}×)`);

  ok(errs.length === 0, `no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`);
}
