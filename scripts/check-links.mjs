#!/usr/bin/env node
// Link check (`npm run check:links`; not part of the build, since it
// needs the network and remote sites change without notice).
//
// Fetches every registry url (src/data/citations.ts) and every external
// link in the needs-analysis, evaluation, and build markdown documents,
// with a desktop-browser user agent, following redirects. Each result is
// one of:
//
//   ok        2xx after redirects
//   blocked   401/403/429 (or a failed sign-in redirect) from a host known
//             to refuse scripted requests (publisher and DOI resolvers,
//             OpenAI, McKinsey, EUR-Lex, Google AI docs, …): not evidence
//             of a broken link, so verify it in a browser
//   own       a link to this course at its public URL (OWN_SITE): listed,
//             not failed, because it only resolves once the current build
//             is deployed; the routes themselves are the app's own
//   broken    anything else: another status, a network error, a timeout
//
// Exits 1 when any link is broken. Flags: --registry-only, --docs-only.

import { build } from 'esbuild';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const args = new Set(process.argv.slice(2));

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const TIMEOUT_MS = 25_000;
const CONCURRENCY = 6;

// Hosts that answer scripted requests with 401/403/429 while serving the
// page to a browser. Matched against the requested host and the host the
// redirects ended on (doi.org hands off to the publisher).
const BOT_BLOCKING_HOSTS = [
  'doi.org',
  'onlinelibrary.wiley.com',
  'sms.onlinelibrary.wiley.com',
  'dl.acm.org',
  'openai.com',
  'help.openai.com',
  'mckinsey.com',
  'eur-lex.europa.eu',
  'journals.sagepub.com',
  'academic.oup.com',
  'direct.mit.edu',
  'tandfonline.com',
  'pubs.aip.org',
  'reuters.com',
  'ft.com',
  'td.org',
  'datacamp.com',
  // Google's developer docs bounce scripted requests through a sign-in
  // probe on accounts.google.com, which fails without a browser session.
  'ai.google.dev',
];

const OWN_SITE = 'https://ritchot.me/courses/ai-literacy/';

function isBotBlockingHost(host) {
  return BOT_BLOCKING_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}

async function loadRegistry() {
  const out = await build({
    entryPoints: [path.join(SRC, 'data/citations.ts')],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    write: false,
    logLevel: 'silent',
  });
  const code = out.outputFiles[0].text;
  const mod = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  return mod.CITATIONS;
}

function markdownDocs() {
  const files = [];
  for (const series of ['needs-analysis', 'evaluation', 'build']) {
    const dir = path.join(SRC, 'pages', series, 'content');
    for (const name of readdirSync(dir)) {
      const p = path.join(dir, name);
      if (name.endsWith('.md') && statSync(p).isFile()) files.push(p);
    }
  }
  return files;
}

// url → where it is used (registry ids, document paths).
const targets = new Map();
function add(url, where) {
  if (!targets.has(url)) targets.set(url, new Set());
  targets.get(url).add(where);
}

if (!args.has('--docs-only')) {
  const registry = await loadRegistry();
  for (const [id, entry] of Object.entries(registry)) add(entry.url, `registry:${id}`);
}
if (!args.has('--registry-only')) {
  for (const file of markdownDocs()) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) add(m[1], path.relative(ROOT, file));
  }
}

async function probe(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    // Drain a little so the connection closes cleanly; the body is unused.
    await res.body?.cancel();
    return { status: res.status, finalUrl: res.url };
  } catch (err) {
    return { status: 0, finalUrl: url, error: err.name === 'AbortError' ? 'timeout' : err.message };
  } finally {
    clearTimeout(timer);
  }
}

function classify(url, { status, finalUrl }) {
  if (status >= 200 && status < 300) return 'ok';
  if (url.startsWith(OWN_SITE)) return 'own';
  const hosts = [new URL(url).hostname, new URL(finalUrl).hostname];
  if ([0, 401, 403, 429].includes(status) && hosts.some(isBotBlockingHost)) return 'blocked';
  return 'broken';
}

const urls = [...targets.keys()];
const results = [];
let next = 0;
async function worker() {
  while (next < urls.length) {
    const url = urls[next++];
    const r = await probe(url);
    results.push({ url, ...r, kind: classify(url, r) });
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
results.sort((a, b) => a.url.localeCompare(b.url));

const by = (kind) => results.filter((r) => r.kind === kind);
const line = (r) => {
  const redirect = r.finalUrl && r.finalUrl !== r.url ? ` → ${r.finalUrl}` : '';
  const used = [...targets.get(r.url)].join(', ');
  return `  ${r.status || r.error} ${r.url}${redirect}\n      used by: ${used}`;
};

process.stdout.write(
  `Checked ${results.length} links: ${by('ok').length} ok, ${by('blocked').length} blocked, ${by('own').length} own-site, ${by('broken').length} broken\n`,
);
if (by('blocked').length > 0) {
  process.stdout.write(`\nBlocked (bot-blocking host; verify in a browser):\n${by('blocked').map(line).join('\n')}\n`);
}
if (by('own').length > 0) {
  process.stdout.write(`\nOwn site (resolves once this build is deployed):\n${by('own').map(line).join('\n')}\n`);
}
if (by('broken').length > 0) {
  process.stdout.write(`\nBroken:\n${by('broken').map(line).join('\n')}\n`);
  process.exit(1);
}
