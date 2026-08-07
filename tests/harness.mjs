// Shared test harness for the StarGilt suite.
// One python static server (:5713 — telemetry is OFF there, so tests never touch the network),
// one headless browser, a fresh page per test file. Chrome resolves dynamically so a version bump
// of chrome-headless-shell doesn't break the suite.
import { spawn } from 'node:child_process';
import { readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const PORT = 5713;
export const BASE = `http://localhost:${PORT}`;

// Locate chrome-headless-shell: honor $SG_CHROME, else glob the puppeteer cache (any installed version).
export function resolveChrome() {
  if (process.env.SG_CHROME && existsSync(process.env.SG_CHROME)) return process.env.SG_CHROME;
  const root = join(homedir(), '.cache/puppeteer/chrome-headless-shell');
  if (existsSync(root)) {
    for (const ver of readdirSync(root)) {
      for (const sub of readdirSync(join(root, ver))) {
        const bin = join(root, ver, sub, 'chrome-headless-shell');
        if (existsSync(bin)) return bin;
      }
    }
  }
  throw new Error('chrome-headless-shell not found. Set $SG_CHROME or run:\n  npx puppeteer browsers install chrome-headless-shell');
}

// Serve the repo root (where index.html lives) on :5713.
export function startServer(repoRoot) {
  return spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: repoRoot, stdio: 'ignore' });
}

// What the PLAYER actually sees — never the `hidden` PROPERTY. Any author rule that sets `display`
// beats the UA's `[hidden]{display:none}`, so `el.hidden === true` can describe a fully visible button.
// That is exactly how #sm-continue shipped visible-for-everyone while the suite reported it hidden
// (v0.13.11-exp). Assert visibility with this; assert the property never.
// v0.13.15-exp: opacity too — #tutor taught us an overlay can close via opacity:0 while keeping its
// box, so a display/visibility check alone still lies. checkVisibility({checkOpacity}) walks the
// ANCESTOR chain, which a hand-rolled computed-style read of one element cannot.
export const onScreen = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return false;
  if (el.checkVisibility) return el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
  const cs = getComputedStyle(el);
  return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05;
}, sel);

// Boot a chapter run to a playable state. fresh=true clears storage first (a brand-new run);
// fresh=false keeps localStorage (used to exercise CONTINUE across a reload).
export async function bootGame(page, { fresh = true, name = 'Claude' } = {}) {
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.__af && typeof computeScore === 'function' && typeof chapterDemand === 'function', { timeout: 15000 });
  await page.evaluate(async ({ fresh, name }) => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    if (fresh) { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} }
    try {
      sessionStorage.setItem('ch-sg-name', name);
      localStorage.setItem('ch-sg-name', name);
      localStorage.setItem('sg-learned', '1');
      localStorage.setItem('ch-af-tutor-off', '1');
    } catch (e) {}
    const play = document.querySelector('#sm-play');
    if (play && document.querySelector('#startmenu').classList.contains('on')) { play.click(); await w(600); }
    // v0.12-exp: the first real PLAY runs the skippable cold-open — dismiss it like a player would
    for (let i = 0; i < 20; i++) {
      const co = document.querySelector('#coldopen');
      if (co && co.classList.contains('on')) { co.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await w(600); break; }
      await w(100);
      if (i === 5) break; // no cold-open coming (already seen) — move on
    }
    await w(600);
    const ne = document.querySelector('#nameentry');
    if (ne && ne.classList.contains('on')) { document.querySelector('#ne-input').value = name; document.querySelector('#ne-go').click(); await w(1000); }
    for (let i = 0; i < 60 && window.__af.busy; i++) await w(120);
  }, { fresh, name });
}

// A resilient overlay-resolver + turn-player, injected into the page. Plays every non-dead card,
// then ends the turn, dismissing any reward/confirm overlay that appears. Returns run state.
export async function playTurns(page, n) {
  return page.evaluate(async (n) => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    const clk = el => { if (!el) return; el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); el.click && el.click(); };
    const resolveOverlays = async () => {
      const insp = document.querySelector('#inspect'); if (insp && insp.classList.contains('on')) { const s = document.querySelector('#insp-skip'); if (s && !s.hidden) s.click(); else document.querySelector('#insp-close').click(); await w(150); return true; }
      if (typeof burnMode !== 'undefined' && burnMode) { const s = document.querySelector('#bb-skip'); if (s) s.click(); await w(150); return true; }
      const boon = document.querySelector('#boon'); if (boon && boon.classList.contains('on')) { clk(document.querySelector('#boon-row .cardo') || document.querySelector('#boon-skip')); await w(300); return true; }
      const mr = document.querySelector('#mrdraft'); if (mr && mr.classList.contains('on')) { clk(mr.querySelector('.cardo') || document.querySelector('#mr-skip')); await w(400); return true; }
      const bi = document.querySelector('#bi-begin'); if (bi && bi.closest('.on')) { bi.click(); await w(150); return true; }
      const ce = document.querySelector('#confirmend'); if (ce && ce.classList.contains('on')) { document.querySelector('#ce-go').click(); await w(120); return true; }
      return false;
    };
    let bosses = 0;
    for (let t = 0; t < n; t++) {
      for (let k = 0; k < 8; k++) { if (!(await resolveOverlays())) break; }
      __af.focus = 99; let g = 14;
      while (g--) { const pl = __af.hand.filter(h => { const d = h.inst.def; return !d.dead && !d.slag; }); if (!pl.length) break; playCard(pl[0]); await w(70); }
      const before = __af.bossesCleared;
      document.querySelector('#endturn').click();
      for (let i = 0; i < 200; i++) { await w(70); await resolveOverlays(); if (document.querySelector('#gameover').classList.contains('show') || document.querySelector('#debrief').classList.contains('on')) return { dead: true, turn: __af.turn, glory: __af.glory, bosses }; if (!__af.busy && __af.turn > t + 1) break; }
      if (__af.bossesCleared > before) bosses++;
    }
    return { dead: false, turn: __af.turn, glory: __af.glory, bosses, rank: __af.rank };
  }, n);
}
