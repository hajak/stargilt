// Face the Boss (v0.13.7-exp QUEUED semantics): clicking ARMS a leap that fires only AFTER the turn
// is presented and the tally clears. It never ends the turn on the spot (no escape hatch, no instant
// sweep+redeal), a second click cancels, and a MISSED turn cancels the queue.
import { bootGame } from './harness.mjs';
export const name = 'boss';

export default async function ({ page, ok, errs }) {
  // ── clicking FACE never ends the turn: it arms (and a second click cancels) ──
  await bootGame(page, { fresh: true });
  const arm = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < 40 && __af.busy; i++) await w(120);
    __af.busy = false; renderChapterMap(); await w(80);
    const btn = document.querySelector('#facebossbtn');
    const t0 = __af.turn, hand0 = __af.hand.length;
    faceBossNow(); await w(150);
    const armed = !!__af.faceQueued, armedCls = btn && btn.classList.contains('armed');
    const midTurn = __af.turn === t0 && __af.hand.length === hand0 && !__af.busy; // the turn did NOT end
    faceBossNow(); await w(100);
    return { hadBtn: !!btn, armed, armedCls, midTurn, cancelled: !__af.faceQueued, t0, turnAfter: __af.turn };
  });
  ok(arm.hadBtn, `the ⚔ FACE THE BOSS button renders on a build turn`);
  ok(arm.armed && arm.armedCls && arm.midTurn, `clicking ARMS the leap without ending the turn (t${arm.t0} unchanged, hand intact)`);
  ok(arm.cancelled && arm.turnAfter === arm.t0, `a second click cancels the armed leap`);

  // ── armed + a cleared tally → the leap fires AT THE SEAM and the earned glory counts in full ──
  await bootGame(page, { fresh: true });
  const leap = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < 40 && __af.busy; i++) await w(120);
    __af.busy = false;
    const mk = id => { const el = document.createElement('div'); document.body.appendChild(el); return { inst: makeInstance(__afDefOf(id)), el, pos: { x: 0, y: 0 } }; };
    __af.played = Array.from({ length: 5 }, () => mk('coin')); __af.combo = 4; __af.bonusStars = 0; __af.twist = null;
    const sc = computeScore(); __af.tithe = Math.max(1, sc.final - 1); // the turn clears
    const gBefore = __af.glory, t0 = __af.turn, target = bossTurnOfAct(actOf(__af.turn));
    renderChapterMap(); await w(80);
    faceBossNow(); await w(120);                        // arm
    const stillHere = __af.turn === t0;                 // arming must not move the turn
    document.querySelector('#endturn').click();         // present the work
    let confirmEver = false;
    for (let i = 0; i < 200; i++) {
      await w(150);
      const ce = document.querySelector('#confirmend');
      // v0.13.10-exp: #confirmend now asks two different questions. `.nudge` is the harmless "don't you
      // want to buy anything?" on a PAID day — click through it. Without `.nudge` it is the fail-confirm,
      // which must never appear on a turn that cleared the demand.
      if (ce.classList.contains('on')) { if (ce.classList.contains('nudge')) document.querySelector('#ce-go').click(); else confirmEver = true; }
      const bi = document.querySelector('#bi-begin'); if (bi && document.querySelector('#bossintro').classList.contains('show')) bi.click();
      const dc = document.querySelector('#decree'); if (dc && dc.classList.contains('on')) dc.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      if (__af.turn >= target) break;
    }
    return { earned: sc.final, gBefore, gAfter: __af.glory, t0, target, turnAfter: __af.turn, stillHere, confirmEver, queueClear: !__af.faceQueued };
  });
  ok(leap.stillHere, `arming does not move the turn — the leap waits for the work`);
  ok(leap.turnAfter === leap.target && !leap.confirmEver, `after PRESENT THE WORK the leap fires (t${leap.t0}→t${leap.turnAfter}) with no fail-confirm`);
  ok(leap.gAfter >= leap.gBefore + leap.earned, `the finished turn's glory counts in full (+${leap.gAfter - leap.gBefore} ≥ ${leap.earned}★)`);
  ok(leap.queueClear, `the queue is consumed by the leap`);

  // ── v0.13.10-exp: a charm spent at a LOCK buys another attempt, it does not buy passage ──
  await bootGame(page, { fresh: true });
  const held = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < 40 && __af.busy; i++) await w(120);
    __af.busy = false;
    state.turn = bossTurnOfAct(1);
    state.twist = bossFor(actOf(state.turn));
    enterBossState(state.twist);
    state.relics = [makeInstance(__afDefOf('emberheart'))]; renderBench();
    state.played = []; state.bonusStars = 0; state.tithe = 999999;   // the lock cannot be met
    const t0 = state.turn, cleared0 = state.bossesCleared, locks0 = (state.locksBroken || []).length;
    document.querySelector('#endturn').click();
    let pre = '', begin = '';
    for (let i = 0; i < 260; i++) {
      await w(120);
      dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); // rush the ceremony
      const ce = document.querySelector('#confirmend');
      if (ce.classList.contains('on')) document.querySelector('#ce-go').click();
      const bi = document.querySelector('#bossintro');
      if (bi.classList.contains('show')) {
        pre = bi.querySelector('.bi-pre').textContent;
        begin = document.querySelector('#bi-begin').textContent;
        document.querySelector('#bi-begin').click();
        break;
      }
    }
    for (let i = 0; i < 60 && __af.busy; i++) await w(120);
    return { t0, turnAfter: state.turn, tithe: state.tithe, want: TITHE_FOR(t0), pre, begin,
             boss: state.twist && state.twist.name, cleared0, cleared: state.bossesCleared,
             locks0, locks: (state.locksBroken || []).length, hand: state.hand.length,
             charmSpent: state.relics.every(r => r.shattered) };
  });
  ok(held.charmSpent && held.turnAfter === held.t0,
    `the Emberheart is spent and the day REPEATS — still day ${held.turnAfter}, not day ${held.t0 + 1}`);
  ok(held.tithe === held.want && !!held.boss && held.hand > 0,
    `the same Aspect and the same demand come back with a fresh hand (${held.boss} · ${held.tithe}★ · ${held.hand} cards)`);
  ok(held.cleared === held.cleared0 && held.locks === held.locks0,
    `a forgiven lock counts for nothing — bosses cleared ${held.cleared}, locks broken ${held.locks}`);
  ok(/STILL STANDS/.test(held.pre) && /AGAIN/.test(held.begin),
    `the arrival card re-enters the same fight (“${held.pre}” · “${held.begin}”)`);

  ok(errs.length === 0, `no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`);
}
