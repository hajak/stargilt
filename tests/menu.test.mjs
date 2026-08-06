// THE START MENU, measured the way a player sees it (v0.13.11-exp).
//
// The bug this file exists to prevent: `#sm-continue` carries the `hidden` attribute, but `.sm-item`
// sets `display:flex` — and an author rule beats the UA's `[hidden]{display:none}`. So the button was
// ON SCREEN for every player from the day it was written, with an empty note, PLAY still primary, and
// no click handler bound. The suite reported it hidden the whole time, because it asserted `el.hidden`
// (the property, which was correctly true) instead of what was rendered.
//
// So: never assert the property. Assert pixels.
import { onScreen, BASE } from './harness.mjs';
export const name = 'menu';

const coldMenu = async (page, seed) => {
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.__af, { timeout: 15000 });
  await page.evaluate((seed) => {
    localStorage.clear(); sessionStorage.clear();
    localStorage.setItem('ch-sg-name', 'Claude');
    localStorage.setItem('sg-learned', '1');
    localStorage.setItem('ch-af-tutor-off', '1');
    if (seed) localStorage.setItem('ch-sg-save', seed);
  }, seed);
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForFunction(() => document.querySelector('#startmenu').classList.contains('on'), { timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2400));
};

export default async function ({ page, ok, errs }) {
  // ── a device that has never saved a run: CONTINUE must not be on screen ──
  await coldMenu(page, null);
  const bare = await page.evaluate(() => ({
    save: localStorage.getItem('ch-sg-save'),
    prop: document.querySelector('#sm-continue').hidden,
    playPrimary: document.querySelector('#sm-play').classList.contains('primary'),
  }));
  ok(bare.save === null && !(await onScreen(page, '#sm-continue')),
    `with no save at all, CONTINUE is not on the menu (hidden property was ${bare.prop} — the property was never the bug)`);
  ok(bare.playPrimary, `PLAY is the primary action when there is nothing to continue`);

  // ── EVERY element that ships with the `hidden` attribute must actually be hidden at rest.
  //    This is the general guard: any future `display:`-setting class would otherwise reopen the hole. ──
  const leaks = await page.evaluate(() => [...document.querySelectorAll('[hidden]')]
    .filter(el => {
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0;
    })
    .map(el => el.id || el.className || el.tagName));
  ok(leaks.length === 0, `no element carrying \`hidden\` renders anyway (${leaks.length ? leaks.join(', ') : 'none leak'})`);

  // ── with a save from THIS build, CONTINUE appears, explains itself, and is actually clickable ──
  const save = await page.evaluate(() => JSON.stringify({
    v: 1, build: BUILD, ts: Date.now() - 1000 * 60 * 60 * 26, name: 'Claude',
    turn: 9, gold: 12, glory: 340, rank: 1, focus: 1, focusPerTurn: 1, buys: 1, buysPerTurn: 1,
    bonusStars: 0, synFires: 0, combo: 0, tithe: 40, burned: 0, boonsClaimed: 0, bossesCleared: 1,
    deck: ['coin', 'coin', 'spark'], discard: [], relics: [{ id: 'emberheart', shattered: false }],
    commissions: [], market: [{ id: 'coin', remaining: 4, rack: false }],
  }));
  await coldMenu(page, save);
  const withSave = await page.evaluate(() => ({
    note: document.querySelector('#sm-continue-note').textContent,
    playPrimary: document.querySelector('#sm-play').classList.contains('primary'),
  }));
  ok(await onScreen(page, '#sm-continue'), `a real save from this build puts CONTINUE on screen`);
  ok(/day 9/.test(withSave.note) && /340/.test(withSave.note) && /left yesterday|left \d+ h ago/.test(withSave.note),
    `CONTINUE says which run and when it was left (${withSave.note})`);
  ok(!withSave.playPrimary, `PLAY steps down from primary — the two offers are visibly ranked`);

  // clicking it must actually resume (the handler is only bound on the save branch — an always-visible
  // CONTINUE with no save was a dead button, which is how the bug hid in plain sight)
  const resumed = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    document.querySelector('#sm-continue').click(); await w(500);
    const ne = document.querySelector('#nameentry');
    if (ne && ne.classList.contains('on')) { document.querySelector('#ne-input').value = 'Claude'; document.querySelector('#ne-go').click(); }
    for (let i = 0; i < 140 && (__af.busy || !__af.hand.length); i++) await w(150);
    return { turn: __af.turn, glory: __af.glory, hand: __af.hand.length };
  });
  ok(resumed.turn === 9 && resumed.glory === 340 && resumed.hand > 0,
    `clicking CONTINUE resumes the saved run (day ${resumed.turn} · ${resumed.glory}★ · ${resumed.hand} cards)`);

  ok(errs.length === 0, `no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`);
}
