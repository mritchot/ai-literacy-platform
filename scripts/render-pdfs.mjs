#!/usr/bin/env node
// Render the 22 platform PDFs from the app's own print routes.
//
//   npm run pdf:render          build, serve dist/, print every document
//   npm run pdf:check           compare public/*.pdf with the baseline set
//
// The render step runs `vite build` directly (not `npm run build`, whose
// tsc step is a separate concern), serves dist/ with `vite preview` on a
// free port, opens `#/print/<family>/<param>` for each entry in
// src/pages/print/print-manifest.json in headless Chromium, waits for the
// print shell's `data-print-ready="true"` marker (set after every
// disclosure is open and `document.fonts.ready` has resolved), and writes
// page.pdf() to the manifest's `public/<pdf>` path. Any failure exits 1.
//
// Baseline for --check: the first render copies the pre-existing PDFs to
// a baseline folder before overwriting anything, and later renders leave
// that copy alone, so the check can run after any number of renders in
// this or a later invocation. The folder lives in the OS temp dir
// (`$TMPDIR/ai-literacy-pdf-baseline`, override with PDF_BASELINE_DIR)
// rather than inside the repo, which keeps the retired set out of git
// without a .gitignore entry. Pass --refresh-baseline to re-snapshot from
// public/ (after committing a render you are happy with, say). The temp
// dir is cleared on reboot; the committed PDFs in git are the durable
// copy, so a lost baseline costs nothing but a `git stash` to re-create.
//
// Page numbers: Chromium does not implement the CSS `@page` margin boxes,
// so the running header (series label, title) and footer (course name,
// attribution, "Page n of N") are Playwright header/footer templates drawn
// inside the 0.75in page margins, with IBM Plex Mono embedded from
// node_modules so the templates match the page's type.
//
// Flags: --check, --refresh-baseline, --no-build (reuse dist/),
// --only=<substring of family/param> (render a subset while iterating).

import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'src/pages/print/print-manifest.json');
const PUBLIC = path.join(ROOT, 'public');
const BASELINE = process.env.PDF_BASELINE_DIR ?? path.join(os.tmpdir(), 'ai-literacy-pdf-baseline');

// The four PDFs whose content this integration does not touch; their text
// must match the retired files apart from the shell's header and footer.
const CONTROL_SET = new Set([
  'build/architecture.pdf',
  'build/timeline.pdf',
  'build/raci.pdf',
  'build/communications.pdf',
]);

const args = new Set(process.argv.slice(2));
const flag = (name) => args.has(name);
const opt = (name) => {
  const hit = [...args].find((a) => a.startsWith(`${name}=`));
  return hit ? hit.slice(name.length + 1) : undefined;
};

const { documents } = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const only = opt('--only');
const selected = only ? documents.filter((d) => `${d.family}/${d.param}`.includes(only)) : documents;

function log(msg) {
  process.stdout.write(`${msg}\n`);
}
function fail(msg) {
  process.stderr.write(`\n✗ ${msg}\n`);
  process.exit(1);
}

// ─── Poppler helpers (pdfinfo / pdftotext / pdffonts) ──────────────────

function has(bin) {
  return spawnSync('which', [bin], { encoding: 'utf8' }).status === 0;
}
const POPPLER = { info: has('pdfinfo'), text: has('pdftotext'), fonts: has('pdffonts') };

function run(bin, argv) {
  return execFileSync(bin, argv, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function pdfInfo(file) {
  if (POPPLER.info) {
    const out = run('pdfinfo', [file]);
    const pages = Number(/^Pages:\s+(\d+)/m.exec(out)?.[1] ?? 0);
    const size = /^Page size:\s+(.*)$/m.exec(out)?.[1]?.replace(/\s+/g, ' ').trim() ?? '?';
    return { pages, size };
  }
  // Fallback without poppler: count page objects and read the first
  // MediaBox. Good enough for a page count; text checks are skipped.
  const buf = readFileSync(file, 'latin1');
  const pages = (buf.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
  const mb = /\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/.exec(buf);
  const size = mb ? `${Math.round(mb[1])} x ${Math.round(mb[2])} pts` : '?';
  return { pages, size };
}

function pdfFonts(file) {
  if (!POPPLER.fonts) return null;
  const lines = run('pdffonts', [file]).split('\n').slice(2).filter(Boolean);
  const rows = lines.map((l) => l.trim().split(/\s+/));
  const names = rows.map((r) => r[0].replace(/^[A-Z]{6}\+/, ''));
  // Columns: name type encoding emb sub uni object ID — `emb` is the
  // fourth from the end minus the two id columns.
  const embedded = rows.every((r) => r[r.length - 5] === 'yes');
  return { count: rows.length, embedded, families: [...new Set(names.map((n) => n.split('-')[0]))] };
}

function pageText(file, page) {
  if (!POPPLER.text) return null;
  return run('pdftotext', ['-f', String(page), '-l', String(page), '-layout', file, '-']);
}

// First body line of a page: the first line that is not the running
// header/footer (either set's), so the table shows where each page's
// content starts rather than the same header 22 times.
function firstLine(text) {
  if (text === null) return '(pdftotext unavailable)';
  const line = text.split('\n').find((l) => !isChromeLine(l)) ?? '';
  return line.replace(/\s+/g, ' ').trim();
}

// ─── Chromium preflight ────────────────────────────────────────────────

async function loadPlaywright() {
  let pw;
  try {
    pw = await import('playwright');
  } catch {
    fail('playwright is not installed — run `npm install` (it is a devDependency).');
  }
  const exe = pw.chromium.executablePath();
  if (!existsSync(exe)) {
    log(`Chromium not found at ${exe}; installing (npx playwright install chromium)…`);
    const r = spawnSync('npx', ['playwright', 'install', 'chromium'], { stdio: 'inherit', cwd: ROOT });
    if (r.status !== 0 || !existsSync(pw.chromium.executablePath())) fail('Chromium install failed.');
  }
  return pw;
}

// ─── Baseline ──────────────────────────────────────────────────────────

function snapshotBaseline(force) {
  if (existsSync(BASELINE) && !force) {
    const when = statSync(BASELINE).mtime.toISOString();
    log(`Baseline kept: ${BASELINE} (snapshot ${when}; --refresh-baseline to re-snapshot)`);
    return;
  }
  let n = 0;
  for (const d of documents) {
    const src = path.join(PUBLIC, d.pdf);
    if (!existsSync(src)) continue;
    const dst = path.join(BASELINE, d.pdf);
    mkdirSync(path.dirname(dst), { recursive: true });
    copyFileSync(src, dst);
    n++;
  }
  log(`Baseline snapshot: ${n} PDFs copied to ${BASELINE}`);
}

// ─── Build + serve ─────────────────────────────────────────────────────

function build() {
  log('vite build…');
  const r = spawnSync('npx', ['vite', 'build'], { stdio: 'inherit', cwd: ROOT });
  if (r.status !== 0) fail('vite build failed.');
}

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function serve() {
  const { preview } = await import('vite');
  const port = await freePort();
  const server = await preview({
    root: ROOT,
    logLevel: 'error',
    preview: { port, strictPort: true, host: '127.0.0.1', open: false },
  });
  const url = server.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${port}/`;
  return { server, url };
}

// ─── Header / footer templates ─────────────────────────────────────────

function templateFont() {
  const woff2 = path.join(ROOT, 'node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2');
  if (!existsSync(woff2)) return '';
  const b64 = readFileSync(woff2).toString('base64');
  return `@font-face{font-family:'IBM Plex Mono';font-weight:500;src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
}
const TEMPLATE_FONT = templateFont();

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function templates({ title, label, colors }) {
  const base = `
    <style>
      ${TEMPLATE_FONT}
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .rh { width: 100%; box-sizing: border-box; padding: 0 0.75in; margin: 0;
            font-family: 'IBM Plex Mono', ui-monospace, Menlo, monospace; font-weight: 500;
            font-size: 7pt; letter-spacing: 0.1em; text-transform: uppercase;
            color: ${colors.tertiary}; display: flex; justify-content: space-between; align-items: center; }
      .rh > * { white-space: nowrap; }
      .accent { display: inline-block; width: 18pt; height: 2pt; background: ${colors.accent}; margin-right: 8pt; vertical-align: middle; }
      .rule { border-top: 0.5pt solid ${colors.border}; }
    </style>`;
  const header = `${base}
    <div class="rh" style="padding-top: 0.32in;">
      <span><span class="accent"></span>${esc(label)}</span>
      <span>${esc(title)}</span>
    </div>`;
  const footer = `${base}
    <div class="rh" style="padding-bottom: 0.32in;">
      <span>AI Literacy for the Modern Workforce · © Michael Ritchot</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>`;
  return { header, footer };
}

// ─── Render ────────────────────────────────────────────────────────────

async function render() {
  const pw = await loadPlaywright();
  snapshotBaseline(flag('--refresh-baseline'));
  if (!flag('--no-build')) build();
  if (!existsSync(path.join(ROOT, 'dist/index.html'))) fail('dist/index.html is missing — build first.');

  const { server, url } = await serve();
  const browser = await pw.chromium.launch();
  const failures = [];
  try {
    const context = await browser.newContext({
      // Letter at 0.75in margins is a 7in (672px) content box. The layout
      // is laid out at 840px and scaled to 0.8 in page.pdf() below, so the
      // screen viewport matches that width for any JS-measured layout
      // (R2's arrow, useViewport) and Tailwind's `sm:` (768px) rules apply.
      viewport: { width: 840, height: 1088 },
      colorScheme: 'light',
      deviceScaleFactor: 1,
    });
    // Pin the theme store to light before the app boots (it reads
    // localStorage 'ail.theme' at module load).
    await context.addInitScript(() => {
      try {
        window.localStorage.setItem('ail.theme', JSON.stringify('light'));
      } catch {
        /* ignore */
      }
    });
    for (const d of selected) {
      const route = `${url}#/print/${d.family}/${d.param}`;
      const out = path.join(PUBLIC, d.pdf);
      process.stdout.write(`  ${d.pdf.padEnd(50)}`);
      // A fresh page per document: the routes differ only by hash, so a
      // second goto() on the same page would be a same-document navigation
      // and the previous shell's `data-print-ready="true"` marker would
      // still be in the DOM when the wait below polls it.
      const page = await context.newPage();
      await page.emulateMedia({ media: 'print', colorScheme: 'light' });
      page.on('pageerror', (e) => log(`  [page error] ${e.message}`));
      try {
        await page.goto(route, { waitUntil: 'load' });
        const marker = page.locator('[data-print-ready]');
        await marker.first().waitFor({ state: 'attached', timeout: 30_000 });
        await page.waitForFunction(
          () => {
            const el = document.querySelector('[data-print-ready]');
            const v = el?.getAttribute('data-print-ready');
            return v === 'true' || v === 'error';
          },
          undefined,
          { timeout: 60_000 },
        );
        const state = await page.evaluate(() => {
          const el = document.querySelector('[data-print-ready]');
          const probe = (expr) => {
            const s = document.createElement('span');
            s.style.color = expr;
            document.body.appendChild(s);
            const c = getComputedStyle(s).color;
            s.remove();
            return c;
          };
          return {
            ready: el?.getAttribute('data-print-ready'),
            error: el?.getAttribute('data-print-error'),
            title: el?.getAttribute('data-print-title') ?? '',
            label: el?.getAttribute('data-print-label') ?? '',
            colors: {
              accent: probe(el?.getAttribute('data-print-accent') ?? 'rgb(var(--ink))'),
              tertiary: probe('rgb(var(--tertiary))'),
              border: probe('rgb(var(--border))'),
            },
            dark: document.documentElement.classList.contains('dark'),
            collapsed: document.querySelectorAll('button[aria-expanded="false"][aria-controls]').length,
          };
        });
        if (state.ready !== 'true') throw new Error(state.error ?? 'print shell reported an error');
        if (state.dark) throw new Error('dark theme still applied');
        if (state.collapsed > 0) throw new Error(`${state.collapsed} disclosure(s) still collapsed`);
        await page.evaluate(() => document.fonts.ready);

        const { header, footer } = templates(state);
        mkdirSync(path.dirname(out), { recursive: true });
        await page.pdf({
          path: out,
          format: 'Letter',
          printBackground: true,
          preferCSSPageSize: true,
          displayHeaderFooter: true,
          headerTemplate: header,
          footerTemplate: footer,
          margin: { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' },
          scale: 0.8,
        });
        const { pages } = pdfInfo(out);
        log(`${String(pages).padStart(2)} page(s)`);
      } catch (e) {
        log(`FAILED — ${e.message}`);
        failures.push(`${d.pdf}: ${e.message}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    await server.close();
  }

  if (failures.length > 0) fail(`${failures.length} document(s) failed:\n  ${failures.join('\n  ')}`);
  log(`\n✓ rendered ${selected.length} PDF(s) into public/`);
}

// ─── Check ─────────────────────────────────────────────────────────────

// Lines the shell's running header/footer (and the retired set's own
// header/footer) contribute, dropped before the control-set comparison.
function isChromeLine(line) {
  const t = line.replace(/\s+/g, ' ').trim();
  if (!t) return true;
  const squeezed = t.replace(/\s/g, '').toUpperCase();
  if (/PAGE\d+OF\d+/.test(squeezed)) return true;
  if (squeezed.includes('AILITERACYFORTHEMODERNWORKFORCE') && squeezed.length < 120) return true;
  if (squeezed.includes('©MICHAELRITCHOT')) return true;
  if (/^(BEHINDTHEBUILD|NEEDSANALYSIS|EVALUATIONFRAMEWORK|REFERENCE(CARD)?)·/.test(squeezed)) return true;
  return false;
}

// Normalized word list for the control-set comparison. Case-folded, curly
// quotes straightened, and letter-spaced small-caps labels re-joined: the
// retired PDFs set their mono labels with tracking that pdftotext splits
// into fragments ("EF FORT COM PARI SON"), which would otherwise swamp the
// diff with typographic noise rather than wording.
function words(text) {
  return text
    .split('\n')
    .filter((l) => !isChromeLine(l))
    .join(' ')
    .replace(/[­​]/g, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\b(?:[A-Z]{1,4} ){2,}[A-Z]{1,4}\b/g, (m) => m.replace(/ /g, ''))
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

// Word-level diff (LCS) — returns the runs of removed/added words.
function diffWords(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = new Uint32Array((n + 1) * (m + 1));
  const at = (i, j) => dp[i * (m + 1) + j];
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * (m + 1) + j] = a[i] === b[j] ? at(i + 1, j + 1) + 1 : Math.max(at(i + 1, j), at(i, j + 1));
    }
  }
  const hunks = [];
  let i = 0;
  let j = 0;
  let cur = null;
  const push = () => {
    if (cur) hunks.push(cur);
    cur = null;
  };
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      push();
      i++;
      j++;
    } else if (at(i + 1, j) >= at(i, j + 1)) {
      cur ??= { removed: [], added: [] };
      cur.removed.push(a[i++]);
    } else {
      cur ??= { removed: [], added: [] };
      cur.added.push(b[j++]);
    }
  }
  if (i < n || j < m) {
    cur ??= { removed: [], added: [] };
    cur.removed.push(...a.slice(i));
    cur.added.push(...b.slice(j));
  }
  push();
  return hunks;
}

function pad(s, w) {
  s = String(s);
  return s.length >= w ? s : s + ' '.repeat(w - s.length);
}

function check() {
  if (!existsSync(BASELINE)) {
    fail(`No baseline at ${BASELINE}. Run \`npm run pdf:render\` first (it snapshots the pre-existing set).`);
  }
  log(`Baseline: ${BASELINE}`);
  log(`Poppler: pdfinfo ${POPPLER.info ? 'yes' : 'no'} · pdftotext ${POPPLER.text ? 'yes' : 'no'} · pdffonts ${POPPLER.fonts ? 'yes' : 'no'}\n`);

  const rows = [];
  const problems = [];
  const controlReports = [];

  for (const d of selected) {
    const oldFile = path.join(BASELINE, d.pdf);
    const newFile = path.join(PUBLIC, d.pdf);
    if (!existsSync(newFile)) {
      problems.push(`${d.pdf}: missing from public/`);
      continue;
    }
    if (!existsSync(oldFile)) {
      problems.push(`${d.pdf}: no baseline copy`);
      continue;
    }
    const oi = pdfInfo(oldFile);
    const ni = pdfInfo(newFile);
    const of = pdfFonts(oldFile);
    const nf = pdfFonts(newFile);
    const fontCell = (f) => (f ? `${f.count}${f.embedded ? ' emb' : ' NOT-EMB'}` : 'n/a');
    rows.push([
      d.pdf,
      `${oi.pages} → ${ni.pages}`,
      ni.size === oi.size ? ni.size : `${oi.size} → ${ni.size}`,
      `${fontCell(of)} → ${fontCell(nf)}`,
    ]);
    if (nf && !nf.embedded) problems.push(`${d.pdf}: a font is not embedded`);
    if (!/612 x 792/.test(ni.size)) problems.push(`${d.pdf}: page size is ${ni.size}, expected 612 x 792 pts`);

    // First body line of each page, old vs new.
    if (POPPLER.text) {
      const lines = [];
      for (let p = 1; p <= Math.max(oi.pages, ni.pages); p++) {
        const o = p <= oi.pages ? firstLine(pageText(oldFile, p)) : '—';
        const n = p <= ni.pages ? firstLine(pageText(newFile, p)) : '—';
        lines.push(`      p${String(p).padEnd(2)} old: ${o.slice(0, 72)}\n          new: ${n.slice(0, 72)}`);
      }
      rows[rows.length - 1].push(lines.join('\n'));
    }

    // Control set: whole-text comparison minus header/footer lines.
    if (CONTROL_SET.has(d.pdf) && POPPLER.text) {
      const oldText = run('pdftotext', ['-layout', oldFile, '-']);
      const newText = run('pdftotext', ['-layout', newFile, '-']);
      const oldWords = words(oldText);
      const newWords = words(newText);
      const hunks = diffWords(oldWords, newWords);
      const changed = hunks.reduce((n, h) => n + h.removed.length + h.added.length, 0);
      const shared = newWords.length - hunks.reduce((n, h) => n + h.added.length, 0);
      const similarity = Math.round((100 * shared) / Math.max(oldWords.length, newWords.length));
      controlReports.push({ pdf: d.pdf, hunks, changed, similarity });
      if (changed > 0) {
        problems.push(
          `${d.pdf}: control-set text differs — ${similarity}% of words shared, ${changed} word(s) in ${hunks.length} hunk(s)`,
        );
      }
    }
  }

  log(pad('PDF', 50) + pad('pages', 10) + pad('size', 26) + 'fonts (old → new)');
  log('-'.repeat(110));
  for (const r of rows) {
    log(pad(r[0], 50) + pad(r[1], 10) + pad(r[2], 26) + r[3]);
    if (r[4]) log(r[4]);
  }

  if (controlReports.length > 0) {
    log('\nControl set (text minus header/footer, case-folded):');
    for (const c of controlReports) {
      log(
        `  ${c.pdf}: ${c.changed === 0 ? 'identical' : `${c.similarity}% of words shared; ${c.changed} word(s) differ in ${c.hunks.length} hunk(s)`}`,
      );
      for (const h of c.hunks.slice(0, 12)) {
        log(`    - ${h.removed.join(' ').slice(0, 160)}`);
        log(`    + ${h.added.join(' ').slice(0, 160)}`);
      }
      if (c.hunks.length > 12) log(`    … ${c.hunks.length - 12} more hunk(s)`);
    }
  }

  if (problems.length > 0) {
    log(`\n${problems.length} finding(s) to review (not auto-fixed):`);
    for (const p of problems) log(`  • ${p}`);
    process.exit(1);
  }
  log('\n✓ check passed');
}

if (flag('--check')) check();
else await render();
