// HUD: the #tithe score panel holds a big capped score without overflow/wrap/collision (v0.11.9),
// and ending a turn short pops the fail-end confirm (v0.11.8).
import { bootGame } from './harness.mjs';
export const name = 'hud';

export default async function ({ page, ok, errs }) {
  await bootGame(page, { fresh: true });

  // ── the tithe HUD holds a large, capped score cleanly ──
  const hud = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    const mk = id => ({ inst: makeInstance(__afDefOf(id)), el: null, pos: { x: 0, y: 0 } });
    __af.busy = false; __af.played = Array.from({ length: 12 }, () => mk('coin'));
    __af.combo = 58; __af.bonusStars = 900; __af.bossesCleared = 7; __af.relics = []; __af.twist = null; __af.tithe = 8000;
    updateTitheMeter(); await w(100);
    const s = computeScore();
    const t = document.querySelector('#tithe'), score = document.querySelector('#tithe .t-score'),
      label = document.querySelector('#tithe .t-label'), cap = document.querySelector('#t-cap'),
      mult = document.querySelector('#tithe .ts-mult');
    const rb = el => el.getBoundingClientRect();
    return {
      final: s.final, capShown: mult.classList.contains('showcap'),
      noOverflowX: t.scrollWidth <= t.clientWidth + 1,
      scoreFits: score.scrollWidth <= t.clientWidth + 1,
      capOneLine: cap.getClientRects().length === 1,
      noVCollision: Math.round(rb(score).top) >= Math.round(rb(label).bottom) - 1,
    };
  });
  ok(hud.final > 9999 && hud.capShown, `forced a big capped board (≈${hud.final}★, cap shown)`);
  ok(hud.noOverflowX && hud.scoreFits, `#tithe holds the score row with no horizontal overflow`);
  ok(hud.capOneLine, `the CAP badge stays on one line (no "CAP over 21" wrap)`);
  ok(hud.noVCollision, `the score row sits below the header — no vertical collision`);

  // ── ending a turn short pops the fail-end confirm ──
  await bootGame(page, { fresh: true });
  const confirm = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < 40 && __af.busy; i++) await w(120);
    __af.busy = false; __af.played = []; __af.bonusStars = 0; __af.tithe = 99999; // guaranteed shortfall
    document.querySelector('#endturn').click();
    for (let i = 0; i < 40 && !document.querySelector('#confirmend').classList.contains('on'); i++) await w(60);
    const on = document.querySelector('#confirmend').classList.contains('on');
    const msg = (document.querySelector('#ce-msg') || {}).textContent || '';
    const t0 = __af.turn;
    document.querySelector('#ce-cancel').click(); await w(150); // KEEP PLAYING → turn must not advance
    return { on, msg, keptTurn: __af.turn === t0, closed: !document.querySelector('#confirmend').classList.contains('on') };
  });
  ok(confirm.on && /short/i.test(confirm.msg), `ending short pops the confirm naming the shortfall ("${confirm.msg.slice(0, 48)}…")`);
  ok(confirm.keptTurn && confirm.closed, `KEEP PLAYING dismisses it and does not end the turn`);

  ok(errs.length === 0, `no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`);
}
