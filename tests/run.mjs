// StarGilt test runner. Discovers every *.test.mjs, runs each in a fresh page against one
// shared server + browser, aggregates pass/fail, exits non-zero on any failure.
//
//   node run.mjs            → run all test files
//   node run.mjs scoring    → run only files whose name contains "scoring"
//   SG_VERBOSE=1 node run.mjs → also print each passing assertion
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { resolveChrome, startServer } from './harness.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..');
const filter = process.argv[2] || '';
const verbose = !!process.env.SG_VERBOSE;
const files = readdirSync(__dir).filter(f => f.endsWith('.test.mjs') && f.includes(filter)).sort();

if (!files.length) { console.error(`No test files match "${filter}"`); process.exit(1); }

const srv = startServer(repoRoot);
await new Promise(r => setTimeout(r, 900));
const browser = await puppeteer.launch({ executablePath: resolveChrome(), headless: true, protocolTimeout: 600000 });

let total = 0, failed = 0;
const t0 = Date.now();
for (const file of files) {
  const mod = await import(pathToFileURL(join(__dir, file)).href);
  const label = mod.name || file;
  const page = await browser.newPage();
  await page.setViewport({ width: 1470, height: 830 });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  let p = 0, f = 0;
  const ok = (cond, text) => {
    total++;
    if (cond) { p++; if (verbose) console.log(`    ✓ ${text}`); }
    else { f++; failed++; console.log(`    ✗ ${text}`); }
  };
  process.stdout.write(`▶ ${label}\n`);
  try {
    await mod.default({ page, ok, errs });
  } catch (e) {
    f++; failed++;
    console.log(`    ✗ THREW: ${String(e && e.stack || e).slice(0, 300)}`);
  }
  await page.close();
  console.log(`  ${f === 0 ? '✅' : '❌'} ${p} passed${f ? `, ${f} failed` : ''}\n`);
}
await browser.close();
srv.kill();

const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`${failed === 0 ? '✅ ALL GREEN' : '❌ FAILURES'} — ${total - failed}/${total} assertions across ${files.length} file(s) in ${secs}s`);
process.exit(failed ? 1 : 0);
