// Build-time crawl-config assertions. Runs against dist/ after `vite build`,
// so it checks the artifact that actually ships rather than the sources it
// was built from.
//
// Why this exists: the sitemap and the noindex rules in _headers are two
// halves of one policy that live in separate files, and nothing about
// editing one prompts you to check the other. Regenerating the sitemap by
// enumerating public/ — the obvious way to do it, and how the current file
// was produced — silently pulls the seven noindexed reference PDFs back in.
// That combination is not inert: Search Console reports a submitted-but-
// noindexed URL as an error, so the failure mode is a slow reappearance of
// exactly the buckets this work cleared.
//
// A failure here fails the build, which fails the Cloudflare Pages deploy.
// That is deliberate. A contradictory sitemap that never ships is a
// nuisance; one that ships is a regression nobody notices for weeks.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const ORIGIN = 'https://ai-literacy.ritchot.me';

const errors = [];
const fail = (msg) => errors.push(msg);

// ─── Load ──────────────────────────────────────────────────────────────

const need = (rel) => {
  const p = join(DIST, rel);
  if (!existsSync(p)) {
    fail(`${rel} is missing from ${DIST}/`);
    return null;
  }
  return readFileSync(p, 'utf8');
};

const sitemap = need('sitemap.xml');
const headers = need('_headers');
const indexHtml = need('index.html');
const notFound = need('404.html');
need('robots.txt');

// ─── Parse _headers into noindex path matchers ─────────────────────────
//
// Cloudflare's format is a path pattern on a flush-left line followed by
// indented `Name: value` pairs. A splat matches greedily.

const noindexPatterns = [];
if (headers) {
  let current = null;
  for (const raw of headers.split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    if (!/^\s/.test(raw)) {
      current = raw.trim();
      continue;
    }
    const [name, ...rest] = raw.trim().split(':');
    if (
      current &&
      name.toLowerCase() === 'x-robots-tag' &&
      /\bnoindex\b/i.test(rest.join(':'))
    ) {
      noindexPatterns.push(current);
    }
  }
}

const matchesPattern = (pathname, pattern) => {
  const rx = new RegExp(
    '^' +
      pattern
        .split('*')
        .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*') +
      '$',
  );
  return rx.test(pathname);
};

// ─── Assertions ────────────────────────────────────────────────────────

if (sitemap) {
  const urlBlocks = sitemap.match(/<url>[\s\S]*?<\/url>/g) ?? [];
  const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

  if (locs.length === 0) fail('sitemap.xml contains no <loc> entries');
  if (urlBlocks.length !== locs.length) {
    fail(`sitemap.xml has ${urlBlocks.length} <url> blocks but ${locs.length} <loc> entries`);
  }

  for (const block of urlBlocks) {
    const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1] ?? '(unparseable)';
    const lastmod = block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1];
    if (!lastmod) fail(`no <lastmod> for ${loc}`);
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) {
      fail(`<lastmod> for ${loc} is not W3C YYYY-MM-DD: "${lastmod}"`);
    }
  }

  const seen = new Set();
  for (const loc of locs) {
    if (seen.has(loc)) fail(`duplicate <loc>: ${loc}`);
    seen.add(loc);

    if (!loc.startsWith(`${ORIGIN}/`)) {
      fail(`<loc> is not on ${ORIGIN}: ${loc}`);
      continue;
    }

    const pathname = loc.slice(ORIGIN.length);
    const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');

    // 1. Every submitted URL must resolve to a file that actually ships.
    //    A sitemap pointing at a 404 is worse than no sitemap.
    if (!existsSync(join(DIST, rel))) {
      fail(`<loc> does not resolve to a shipped file: ${loc} (no ${DIST}/${rel})`);
    }

    // 2. No submitted URL may also be marked noindex. This is the
    //    regression the file exists to catch.
    for (const pattern of noindexPatterns) {
      if (matchesPattern(pathname, pattern)) {
        fail(
          `${loc} is in the sitemap but _headers marks "${pattern}" as noindex. ` +
            `Submitting a noindexed URL earns a "Submitted URL marked 'noindex'" ` +
            `error in Search Console — remove it from the sitemap, or drop the ` +
            `noindex rule if the page is meant to be found.`,
        );
      }
    }
  }
}

// 3. Exactly one canonical, or Google picks one arbitrarily.
if (indexHtml) {
  const n = (indexHtml.match(/<link\s+rel="canonical"/g) ?? []).length;
  if (n !== 1) fail(`index.html has ${n} canonical tags, expected exactly 1`);
}

// 4. The 404 page must not itself be indexable — it is served for every
//    unmatched path, so an indexable one is a duplicate-content farm.
if (notFound && !/<meta\s+name="robots"\s+content="noindex"/.test(notFound)) {
  fail('404.html is missing <meta name="robots" content="noindex">');
}

// ─── Report ────────────────────────────────────────────────────────────

if (errors.length > 0) {
  console.error(`\n✗ crawl-config verification failed (${errors.length}):\n`);
  for (const e of errors) console.error(`  • ${e}`);
  console.error('');
  process.exit(1);
}

const locCount = (sitemap?.match(/<loc>/g) ?? []).length;
console.log(
  `✓ crawl config verified — ${locCount} sitemap entries, all resolve, ` +
    `none noindexed (${noindexPatterns.length} noindex rule(s): ${noindexPatterns.join(', ') || 'none'})`,
);
