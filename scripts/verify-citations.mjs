#!/usr/bin/env node
// Build-time citation check (run by `npm run build`).
//
// Every citation call site must resolve to an entry in the registry
// (src/data/citations.ts) and, when it names one, to a key in that
// entry's `pages` map. Three call-site forms are checked across src/:
//
//   {{cite:id#pageKey,id2}}            markdown token (render-markdown.tsx)
//   <Citation ids="…" pageKey="…" />   JSX chip (literal ids only)
//   { ids: '…', pageKey: '…' }         CheckSource objects in data files
//
// A `{{cite` that does not parse as a token also fails, so a typo cannot
// fall through as literal text. The registry is TypeScript, so it is
// bundled in memory with esbuild (a devDependency) and imported from a
// data URL.

import { build } from 'esbuild';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');

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

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (/\.(tsx?|md)$/.test(name)) files.push(p);
  }
  return files;
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

const registry = await loadRegistry();

// Drafting aid: CITATION_EXTRA_PAGES=a.json,b.json merges proposed page
// keys ({ "id": { "pageKey": "locator" } }) before checking, so a page
// key can be checked before it is written into the registry.
for (const file of (process.env.CITATION_EXTRA_PAGES ?? '').split(',').filter(Boolean)) {
  for (const [id, pages] of Object.entries(JSON.parse(readFileSync(file, 'utf8')))) {
    if (registry[id]) registry[id] = { ...registry[id], pages: { ...registry[id].pages, ...pages } };
  }
}
const errors = [];
let checked = 0;

function check(file, text, index, id, pageKey, form) {
  checked++;
  const where = `${path.relative(ROOT, file)}:${lineOf(text, index)}`;
  const entry = registry[id];
  if (!entry) {
    errors.push(`${where} ${form}: unknown citation id "${id}"`);
    return;
  }
  if (pageKey !== undefined && !(entry.pages && pageKey in entry.pages)) {
    errors.push(`${where} ${form}: "${id}" has no pageKey "${pageKey}"`);
  }
}

const TOKEN_RE = /\{\{cite:([^{}\s]+)\}\}/g;
const LOOSE_TOKEN_RE = /\{\{\s*cite\b/g;
const JSX_RE = /<Citation\b(?=[\s/>])([\s\S]*?)\/>/g;
const OBJ_RE = /\bids:\s*('[^']*'|\[[^\]]*\])([^}]*)\}/g;

function literalIds(expr) {
  return [...expr.matchAll(/'([^']+)'|"([^"]+)"/g)].map((m) => m[1] ?? m[2]);
}

for (const file of walk(SRC)) {
  if (file.endsWith(path.join('data', 'citations.ts'))) continue;
  const text = readFileSync(file, 'utf8');

  const strict = [...text.matchAll(TOKEN_RE)].map((m) => m.index);
  for (const m of text.matchAll(LOOSE_TOKEN_RE)) {
    if (!strict.includes(m.index)) {
      // The renderer's own doc comment and regex mention the prefix.
      if (file.endsWith('render-markdown.tsx') || file.endsWith('CitationNotes.tsx')) continue;
      errors.push(`${path.relative(ROOT, file)}:${lineOf(text, m.index)} malformed {{cite:…}} token`);
    }
  }
  for (const m of text.matchAll(TOKEN_RE)) {
    // Syntax examples in doc comments: the renderer's, and `{{cite:…}}`.
    if (file.endsWith('render-markdown.tsx') || m[1].includes('…')) continue;
    for (const part of m[1].split(',')) {
      const at = part.indexOf('#');
      const id = at === -1 ? part : part.slice(0, at);
      const key = at === -1 ? undefined : part.slice(at + 1);
      check(file, text, m.index, id, key, 'token');
    }
  }

  if (!/\.tsx?$/.test(file)) continue;

  for (const m of text.matchAll(JSX_RE)) {
    const attrs = m[1];
    const idsAttr = /\bids=(?:"([^"]+)"|\{([\s\S]*?)\})(?=\s|$)/.exec(attrs);
    if (!idsAttr) continue;
    const ids = idsAttr[1] !== undefined ? [idsAttr[1]] : literalIds(idsAttr[2]);
    if (ids.length === 0) continue; // an expression, e.g. CheckSources' ids={s.ids}
    const pageKey = /\bpageKey="([^"]+)"/.exec(attrs)?.[1];
    ids.forEach((id, i) => check(file, text, m.index, id, i === 0 ? pageKey : undefined, '<Citation>'));
  }

  for (const m of text.matchAll(OBJ_RE)) {
    const ids = literalIds(m[1]);
    const pageKey = /\bpageKey:\s*'([^']+)'/.exec(m[2])?.[1];
    ids.forEach((id, i) => check(file, text, m.index, id, i === 0 ? pageKey : undefined, 'ids:'));
  }
}

// Every entry must link somewhere (the type requires `url`; this also
// catches an empty string).
for (const [id, entry] of Object.entries(registry)) {
  if (!/^https:\/\//.test(entry.url ?? '')) errors.push(`src/data/citations.ts: "${id}" has no https url`);
}

if (errors.length > 0) {
  process.stderr.write(`✗ ${errors.length} citation problem(s):\n  ${errors.join('\n  ')}\n`);
  process.exit(1);
}
process.stdout.write(`✓ citations: ${checked} call-site references resolve to ${Object.keys(registry).length} registry entries\n`);
