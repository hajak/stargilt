// Smoke: a real multi-turn game plays without errors; scoring accrues; the hand renders.
import { bootGame, playTurns } from './harness.mjs';
export const name = 'smoke';

export default async function ({ page, ok, errs }) {
  await bootGame(page, { fresh: true });

  // v0.13.10-exp: the opening gift comes FROM the Undermarket's relic shelf — and does NOT deplete it.
  // The rack must still offer three buyable relics after the charm lands on your bench.
  const open = await page.evaluate(() => ({
    rack: state.market.filter(s => s.rack && s.def && s.remaining > 0).length,
    charmInStock: state.market.some(s => s.rack && s.def && s.def.mercyCharge && s.remaining > 0),
    bench: state.relics.filter(r => r.def.mercyCharge).length,
    hintStrip: !!document.querySelector('#hint'),
  }));
  ok(open.bench === 1 && open.charmInStock, `the gifted Emberheart sits on the bench AND is still stocked on the shelf it came from`);
  ok(open.rack === 3, `the relic shelf still offers three relics to buy (${open.rack})`);
  ok(!open.hintStrip, `the standing PLAY · BUY · PRESENT strip is gone from the board`);

  const g0 = await page.evaluate(() => __af.glory);
  // A no-buy driver may occasionally double-miss and die on an unlucky draw — that's driver variance,
  // not a game bug, so we assert the game PLAYS real turns + scores + renders coherently, tolerating a death.
  const st = await playTurns(page, 3);
  ok(st.turn > 1, `advanced through real turns (reached turn ${st.turn}${st.dead ? ', run ended' : ''})`);
  ok(st.glory > g0, `glory accrues across turns (${g0} → ${st.glory})`);

  const end = await page.evaluate(() => ({
    hand: document.querySelectorAll('#cardlayer .cardo.inhand').length,
    piles: !!document.querySelector('#deckpile') && !!document.querySelector('#discardpile'),
    over: document.querySelector('#gameover').classList.contains('show') || document.querySelector('#debrief').classList.contains('on'),
  }));
  ok(st.dead ? end.over : (end.hand > 0 && end.piles), st.dead ? `the run resolved on a coherent end screen (no crash)` : `hand + piles render mid-run (${end.hand} cards)`);

  ok(errs.length === 0, `no page errors across the game (${errs.length}${errs.length ? ': ' + errs[0] : ''})`);
}
