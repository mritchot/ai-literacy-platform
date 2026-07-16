// font-loader.ts — runtime loader for the typefaces used by the S10
// Competency Profile PDF. jsPDF only ships Helvetica/Times/Courier in its
// base; to render the R8 design with its actual Source Serif 4 titles,
// IBM Plex Sans body, and IBM Plex Mono overlines, we need to register the
// TTF binaries with jsPDF's virtual file system.
//
// Approach:
//   • Vite imports each TTF via `?url`, which resolves to a real URL
//     in dev and (with viteSingleFile) to a base64 data URI in the
//     production bundle.
//   • At first PDF generation, fetch the font URLs in parallel, decode the
//     ArrayBuffers into byte-string form (jsPDF's expected input for
//     `addFileToVFS`), and cache the result on a module-level promise so
//     subsequent generations reuse the binaries.
//   • For each new jsPDF document instance we still call
//     `addFileToVFS` + `addFont` — registrations are per-document.
//
// The TTFs are the same latin subsets the web bundle loads through
// @fontsource, decompressed out of woff2 (which jsPDF cannot parse), so
// the PDF and the platform render the same faces from the same versions.
//
// Only the six (family, style) pairs the document actually calls are
// registered. Every byte here is inlined into dist/index.html as base64
// whether or not the learner ever clicks Download, so an unused weight is
// a permanent tax on first paint. A `setFont` pair missing from this table
// falls back to Helvetica silently — add the face here as well as calling it.

import type { jsPDF } from 'jspdf';

import sourceSerifSemiBoldUrl from './fonts/SourceSerif4-SemiBold.ttf?url';
import sourceSerifItalicUrl from './fonts/SourceSerif4-Italic.ttf?url';
import plexSansRegularUrl from './fonts/PlexSans-Regular.ttf?url';
import plexSansBoldUrl from './fonts/PlexSans-Bold.ttf?url';
import plexSansItalicUrl from './fonts/PlexSans-Italic.ttf?url';
import plexMonoMediumUrl from './fonts/PlexMono-Medium.ttf?url';

/** Logical family names that the PDF generator uses to switch fonts. */
type PdfFamily = 'PlexSans' | 'SourceSerif4' | 'PlexMono';
/** jsPDF font-style identifiers. */
type PdfStyle = 'normal' | 'bold' | 'italic';

interface FontSpec {
  url: string;
  vfsName: string; // Filename used inside jsPDF's virtual FS
  family: PdfFamily;
  style: PdfStyle;
}

const FONTS: FontSpec[] = [
  // Source Serif 4 carries the display title and the big score numerals.
  // It registers at 600 under the 'bold' style: the platform's display
  // type moved to 600 in the ritchot.me alignment, and Source Serif 4 at
  // 400 sets markedly lighter than the DM Serif Display it replaced.
  {
    url: sourceSerifSemiBoldUrl,
    vfsName: 'SourceSerif4-SemiBold.ttf',
    family: 'SourceSerif4',
    style: 'bold',
  },
  // Editorial italics (the framing line, the closing card) stay at 400.
  {
    url: sourceSerifItalicUrl,
    vfsName: 'SourceSerif4-Italic.ttf',
    family: 'SourceSerif4',
    style: 'italic',
  },
  { url: plexSansRegularUrl, vfsName: 'PlexSans-Regular.ttf', family: 'PlexSans', style: 'normal' },
  { url: plexSansBoldUrl, vfsName: 'PlexSans-Bold.ttf', family: 'PlexSans', style: 'bold' },
  { url: plexSansItalicUrl, vfsName: 'PlexSans-Italic.ttf', family: 'PlexSans', style: 'italic' },
  // Medium (500) registers as 'normal' — it is the workhorse weight for
  // the tracked overlines, and matches the weight they carried before.
  { url: plexMonoMediumUrl, vfsName: 'PlexMono-Medium.ttf', family: 'PlexMono', style: 'normal' },
];

interface LoadedFont {
  vfsName: string;
  family: PdfFamily;
  style: PdfStyle;
  binary: string;
}

let cachedBinaries: Promise<LoadedFont[]> | null = null;

// Convert a Uint8Array into the binary-string form that jsPDF wants
// (each char's code = one byte). Use chunked apply() so we don't hit
// the JS engine's max argument count on a ~80 KB font.
function bytesToBinary(bytes: Uint8Array): string {
  const CHUNK = 0x8000;
  let out = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    out += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)));
  }
  return out;
}

async function loadAllBinaries(): Promise<LoadedFont[]> {
  if (!cachedBinaries) {
    // A failed load must not poison the cache: clear it on rejection so
    // the next Download click retries the fetch instead of awaiting the
    // same rejected promise for the rest of the session.
    cachedBinaries = Promise.all(
      FONTS.map(async (f) => {
        const res = await fetch(f.url);
        if (!res.ok) throw new Error(`Failed to load font ${f.vfsName} (${res.status})`);
        const buf = await res.arrayBuffer();
        return {
          vfsName: f.vfsName,
          family: f.family,
          style: f.style,
          binary: bytesToBinary(new Uint8Array(buf)),
        };
      }),
    );
    cachedBinaries.catch(() => {
      cachedBinaries = null;
    });
  }
  return cachedBinaries;
}

/** Register the PDF's typefaces (Sans/Serif/Mono) with a fresh jsPDF doc. */
export async function registerPdfFonts(doc: jsPDF): Promise<void> {
  const fonts = await loadAllBinaries();
  for (const f of fonts) {
    doc.addFileToVFS(f.vfsName, f.binary);
    doc.addFont(f.vfsName, f.family, f.style);
  }
}
