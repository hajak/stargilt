// v0.13.13-exp: regressions pinned by the deep bug sweep. Each assertion here is a bug that SHIPPED:
// the sweep found it, a code-trace confirmed it, and this file keeps it dead.
import { bootGame, BASE } from './harness.mjs';
export const name = 'sweep';

export default async function ({ page, ok, errs }) {
  await bootGame(page, { fresh: true });

  // ── 1. THE BURN QUEUE (critical): two trash cards played back-to-back must yield TWO sequential
  //       prompts, no orphaned resolver, and a clean END TURN afterwards. Before the fix the second
  //       enterBurnMode overwrote the first's resolver → its pendingEffect never settled → the next
  //       endTurn hung forever on Promise.all(state.pendingEffects). ──
  const burn = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < 60 && state.busy; i++) await w(120);
    // two Ashen Altars straight into the hand, then two immediate plays — inside the overwrite window
    const a = putInHand(makeInstance(DB.altar), '#deckpile');
    const b = putInHand(makeInstance(DB.altar), '#deckpile');
    playCard(a); await w(40); playCard(b);
    let prompts = 0;
    for (let i = 0; i < 120; i++) {
      await w(150);
      if (typeof burnMode !== 'undefined' && burnMode) { prompts++; document.querySelector('#bb-skip').click(); await w(250); }
      if (prompts >= 2) break;
    }
    for (let i = 0; i < 40 && state.pendingEffects.length; i++) await w(150);
    return { prompts, pending: state.pendingEffects.length, busy: state.busy };
  });
  ok(burn.prompts === 2, `two trash plays in flight → TWO sequential burn prompts, not one overwritten (${burn.prompts})`);
  ok(burn.pending === 0 && !burn.busy, `no orphaned play-effect after both prompts resolve (pending ${burn.pending})`);
  const after = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    const t = state.turn; state.bonusStars += 999; document.querySelector('#endturn').click();
    for (let i = 0; i < 200; i++) { await w(180); dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      const ce = document.querySelector('#confirmend'); if (ce && ce.classList.contains('on')) document.querySelector('#ce-go').click(); // the pre-boss "buy something?" nudge
      const bn = document.querySelector('#boon'); if (bn && bn.classList.contains('on')) document.querySelector('#boon-skip').click();
      if (!state.busy && state.turn !== t) break; }
    return { advanced: state.turn > t, busy: state.busy };
  });
  ok(after.advanced && !after.busy, `END TURN completes after the double-trash day — the freeze is dead`);

  // ── 2. SAVE/RESTORE PARITY (major ×3): SOLD holes survive, skipBonus survives, a boss twist
  //       comes back with its FUNCTIONS and its picked colour. Fresh boot — a quiet board, no
  //       leftover ceremony from block 1 mutating under us. ──
  await bootGame(page, { fresh: true });
  const roundtrip = await page.evaluate(() => {
    state.turn = 12; state.tithe = TITHE_FOR(12);
    state.twist = bossFor(3); state.twist.dampColor.color = 'verdant'; state.twist.flatStarSwing = -50;
    state.skipBonus = 4;
    state.market[0].def = null; state.market[0].remaining = 0; // a SOLD pile
    const rack = state.market.filter(s => s.rack).length;
    saveRun();
    const saved = JSON.parse(localStorage.getItem('ch-sg-save'));
    restoreRun(saved);
    buildMarketDOM(); // the real boot path always rebuilds the Bazaar DOM right after restoreRun — mirror it, or later slot animations hit slotEl:null
    return {
      savedSlots: saved.market.length, liveSlots: state.market.length,
      holeKept: state.market[0].def === null,
      skipBonus: state.skipBonus,
      liveIsFn: typeof state.twist.live === 'function',
      damp: state.twist.dampColor && state.twist.dampColor.color,
      swing: state.twist.flatStarSwing,
      charmFlagged: state.market.some(s => s.rack && s.charm),
      rackKept: state.market.filter(s => s.rack).length === rack,
    };
  });
  ok(roundtrip.savedSlots === roundtrip.liveSlots && roundtrip.holeKept, `SOLD slots survive the save roundtrip as holes (${roundtrip.savedSlots} slots)`);
  ok(roundtrip.skipBonus === 4, `skipBonus survives — the Face-the-Boss leap keeps its richer spoils`);
  ok(roundtrip.liveIsFn && roundtrip.damp === 'verdant' && roundtrip.swing === -50, `a restored twist has its live() readout AND its picked colour AND its swing`);
  ok(roundtrip.charmFlagged && roundtrip.rackKept, `the charm slot stays flagged and the rack keeps its width`);

  // ── 3. THE CHARM RESTOCKS A CHARM (major): selling out the Emberheart leaves a flagged hole that
  //       evolveRack refills with ANOTHER CHARM, never a random relic. ──
  const restock = await page.evaluate(async () => {
    const slot = state.market.find(s => s.rack && s.charm);
    slot.def = null; slot.remaining = 0;
    await evolveRack();
    return { id: slot.def && slot.def.id, mercy: !!(slot.def && slot.def.mercyCharge) };
  });
  ok(restock.mercy && restock.id === 'emberheart', `the emptied charm slot restocks an Emberheart (${restock.id}) — 'BUY ANOTHER AT THE UNDERMARKET' stays true`);

  // ── 4. THE TARNISH'S PICK STAYS ON THE CLONE (minor): the config must never learn the colour. ──
  const tarnish = await page.evaluate(() => {
    const a = bossFor(3); a.dampColor.color = 'ember';
    const b = bossFor(3);
    return { fresh: b.dampColor.color, cfg: BOSSES[3].dampColor.color };
  });
  ok(tarnish.fresh === null && tarnish.cfg === null, `bossFor deep-copies dampColor — the pick no longer poisons the config`);

  // ── 5. FACE THE BOSS cannot arm mid-ceremony (major): the busy guard holds. ──
  const face = await page.evaluate(() => {
    state.faceQueued = false; state.busy = true;
    faceBossNow();
    const armedWhileBusy = state.faceQueued;
    state.busy = false;
    return { armedWhileBusy };
  });
  ok(!face.armedWhileBusy, `faceBossNow refuses to arm while the tally runs — no leaping out of a failed day`);

  // ── 6. THE ASH LADDER'S THIRD RUNG is in the projection AND will be in the climb (major):
  //       computeScore.add includes it; the tally builds its bits from the same sources. ──
  const rung = await page.evaluate(() => {
    const before = computeScore().add;
    state.burned = 16; state.ashRung = ashRungsWon().length; // all three rungs won
    const withAsh = computeScore().add;
    const gift = ashGift('mult');
    state.burned = 0; state.ashRung = 0;
    return { delta: withAsh - before, gift };
  });
  ok(rung.gift > 0 && Math.abs(rung.delta - rung.gift) < 1e-9, `rung 3's +${rung.gift}× MULT is live in the projection (Δ=${rung.delta})`);

  ok(errs.length === 0, `no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`);
}
