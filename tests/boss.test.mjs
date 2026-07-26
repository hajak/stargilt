// Face the Boss: the v0.11.9 tithe gate + the v0.11.11 glory banking. You may only leap once this
// turn is secured; the score you built to unlock the leap is BANKED, not discarded.
import { bootGame } from './harness.mjs';
export const name = 'boss';

export default async function ({ page, ok, errs }) {
  // ── below the tithe: the skip is DENIED, turn unchanged, no fail-confirm ──
  await bootGame(page, { fresh: true });
  const fail = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < 40 && __af.busy; i++) await w(120);
    __af.busy = false; __af.played = []; __af.bonusStars = 0; __af.tithe = 99999; // guaranteed shortfall
    renderChapterMap(); await w(80);
    const btn = document.querySelector('#facebossbtn');
    const t0 = __af.turn; if (btn) btn.classList.remove('deny');
    faceBossNow(); await w(150);
    return { hadBtn: !!btn, t0, turnAfter: __af.turn, denied: !!(document.querySelector('#facebossbtn') && document.querySelector('#facebossbtn').classList.contains('deny')), confirm: document.querySelector('#confirmend').classList.contains('on') };
  });
  ok(fail.hadBtn, `the ⚔ FACE THE BOSS button renders on a build turn`);
  ok(fail.turnAfter === fail.t0 && fail.denied && !fail.confirm, `below the tithe: DENIED ('MEET THE TITHE FIRST'), turn unchanged, no fail-confirm`);

  // ── tithe secured: the skip leaps to the boss AND banks the earned glory (v0.11.11) ──
  await bootGame(page, { fresh: true });
  const bank = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < 40 && __af.busy; i++) await w(120);
    __af.busy = false;
    const mk = id => { const el = document.createElement('div'); document.body.appendChild(el); return { inst: makeInstance(__afDefOf(id)), el, pos: { x: 0, y: 0 } }; };
    __af.played = Array.from({ length: 5 }, () => mk('coin')); __af.combo = 4; __af.bonusStars = 0; __af.twist = null;
    const sc = computeScore(); __af.tithe = Math.max(1, sc.final - 1); // just under the projection → gate passes
    const gBefore = __af.glory, t0 = __af.turn, target = bossTurnOfAct(actOf(__af.turn));
    renderChapterMap(); await w(80);
    let confirmEver = false;
    faceBossNow();
    for (let i = 0; i < 160; i++) { await w(150); if (document.querySelector('#confirmend').classList.contains('on')) confirmEver = true; const bi = document.querySelector('#bi-begin'); if (bi && bi.closest('.on')) bi.click(); if (__af.turn >= target) break; }
    return { earned: sc.final, gBefore, gAfter: __af.glory, t0, target, turnAfter: __af.turn, confirmEver };
  });
  ok(bank.turnAfter === bank.target && !bank.confirmEver, `the skip leaps to the boss (t${bank.t0}→t${bank.turnAfter}) with no fail-confirm`);
  ok(bank.gAfter >= bank.gBefore + bank.earned, `the tithe-met glory is BANKED, not discarded (+${bank.gAfter - bank.gBefore} ≥ the ${bank.earned}★ earned)`);

  ok(errs.length === 0, `no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`);
}
