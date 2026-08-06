// THE FURNACE (v0.13.10-exp): burning is a build, not a button.
//   ① the FUEL decides the second payment — Dross sells as ash (+⬤), anything else heats the fire (+❖)
//   ② the day's STREAK multiplies the ★ (×1 → ×1.5 → ×2)
//   ③ the ASH LADDER pays permanent daily gifts at 4 / 9 / 16 cards burned, into the same buckets relics use
// Plus the exit that started it all: CANCEL BURN must actually put the furnace out.
import { bootGame } from './harness.mjs';
export const name = 'burn';

// Burn one named card out of hand through the real path (zoom → BURN) and report the deltas.
const burnOne = (page, id) => page.evaluate(async (id) => {
  const w = ms => new Promise(r => setTimeout(r, ms));
  const before = { stars: state.bonusStars, gold: state.gold, focus: state.focus, burned: state.burned };
  const entry = putInHand(makeInstance(__afDefOf(id)), '#deckpile');
  await w(140);
  const p = enterBurnMode();
  await w(80);
  playCard(entry);                                   // burn mode → the confirm zoom
  await w(120);
  document.querySelector('#insp-burn').click();      // …and into the fire
  await p;                                           // enterBurnMode resolves when the burn completes
  await w(200);
  return { before, after: { stars: state.bonusStars, gold: state.gold, focus: state.focus, burned: state.burned } };
}, id);

export default async function ({ page, ok, errs }) {
  await bootGame(page, { fresh: true });
  await page.evaluate(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); for (let i = 0; i < 40 && __af.busy; i++) await w(120); });

  // ── ① the two fuels pay differently ──
  const real = await burnOne(page, 'coin');   // cost 0 → 2★, and a real card heats the fire: +1 ❖
  ok(real.after.stars - real.before.stars === 2 && real.after.focus - real.before.focus === 1 && real.after.gold === real.before.gold,
    `burning a real card pays ★ + 1 ❖ (+${real.after.stars - real.before.stars}★ +${real.after.focus - real.before.focus}❖ +${real.after.gold - real.before.gold}⬤)`);

  // ── ② the same day's SECOND burn roars: ×1.5 on the ★, and Dross sells as ash instead ──
  const dross = await burnOne(page, 'dross'); // cost 0 → 2★ ×1.5 = 3★, +2 ⬤, no ❖
  ok(dross.after.stars - dross.before.stars === 3,
    `the day's second burn roars ×1.5 (2★ → ${dross.after.stars - dross.before.stars}★)`);
  ok(dross.after.gold - dross.before.gold === 2 && dross.after.focus === dross.before.focus,
    `Dross sells as ash: +2 ⬤ and no ❖ (+${dross.after.gold - dross.before.gold}⬤ +${dross.after.focus - dross.before.focus}❖)`);

  // ── ③ the ash ladder pays into the same buckets the tithe meter already reads ──
  const ladder = await page.evaluate(() => {
    const at = n => { state.burned = n; return { stars: ashGift('stars'), focus: ashGift('focus'), mult: ashGift('mult') }; };
    const before = at(3), rung1 = at(4), rung2 = at(9), rung3 = at(16);
    const projected = (() => { state.burned = 16; state.played = []; state.bonusStars = 0; return computeScore(); })();
    state.burned = 0; state.ashRung = 0;
    return { before, rung1, rung2, rung3, projStars: projected.stars, projAdd: projected.add };
  });
  ok(ladder.before.stars === 0 && ladder.rung1.stars === 1, `4 burned → +1 base ★ every day`);
  ok(ladder.rung2.focus === 1 && ladder.rung1.focus === 0, `9 burned → +1 ❖ every day`);
  ok(ladder.rung3.mult === 0.5 && ladder.rung2.mult === 0, `16 burned → +0.5× MULT every day`);
  ok(ladder.projStars >= 1 && ladder.projAdd >= 1.5,
    `the ladder rides the live projection — an empty board already reads ${ladder.projStars}★ ×${ladder.projAdd.toFixed(2)}`);

  // ── the exit that reported this round: CANCEL BURN puts the furnace OUT ──
  const exits = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    const entry = putInHand(makeInstance(__afDefOf('coin')), '#deckpile');
    await w(120);
    const p = enterBurnMode();
    await w(60);
    playCard(entry); await w(120);
    const pickLabel = document.querySelector('#insp-close').textContent;
    document.querySelector('#insp-close').click(); await w(160);            // PICK ANOTHER → the furnace stays lit
    const stillLit = document.querySelector('#burnbar').classList.contains('on') && !!burnMode;
    playCard(entry); await w(120);
    const cancelLabel = document.querySelector('#insp-skip').textContent;
    document.querySelector('#insp-skip').click();                            // CANCEL BURN → out
    await p; await w(160);
    const out = !document.querySelector('#burnbar').classList.contains('on')
      && !document.body.classList.contains('burning') && !burnMode;
    return { pickLabel, cancelLabel, stillLit, out };
  });
  ok(exits.pickLabel === 'PICK ANOTHER' && exits.stillLit, `PICK ANOTHER returns to the lit furnace (it does not pretend to cancel)`);
  ok(exits.cancelLabel === 'CANCEL BURN' && exits.out, `CANCEL BURN puts the furnace out — bar gone, body unlit, prompt resolved`);

  ok(errs.length === 0, `no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`);
}
