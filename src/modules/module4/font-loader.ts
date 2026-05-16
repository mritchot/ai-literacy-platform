// font-loader.ts — runtime loader for the DM font family used by the
// S10 Competency Profile PDF. jsPDF only ships Helvetica/Times/Courier
// in its base; to render the R8 design with its actual DM Serif
// Display titles, DM Sans body, and DM Mono overlines, we need to
// register the TTF binaries with jsPDF's virtual file system.
//
// Approach:
//   • Vite imports each TTF via `?url`, which resolves to a real URL
//     in dev and (with viteSingleFile) to a base64 data URI in the
//     production bundle.
//   • At first PDF generation, fetch all six font URLs in parallel,
//     decode the ArrayBuffers into byte-string form (jsPDF's expected
//     input for `addFileToVFS`), and cache the result on a module-
//     level promise so subsequent generations reuse the binaries.
//   • For each new jsPDF document instance we still call
//     `addFileToVFS` + `addFont` — registrations are per-document.
//
// Bundle impact: ~437 KB of TTF data gets inlined into dist/index.html
// as base64 data URIs. That's a one-time cost; the fonts are only
// fetched when the learner clicks Download PDF, but the bytes ride
// along in the single-file bundle regardless.

import type { jsPDF } from 'jspdf';

import dmSansRegularUrl from './fonts/DMSans-Regular.ttf?url';
import dmSansBoldUrl from './fonts/DMSans-Bold.ttf?url';
import dmSansItalicUrl from './fonts/DMSans-Italic.ttf?url';
import dmSerifRegularUrl from './fonts/DMSerifDisplay-Regular.ttf?url';
import dmSerifItalicUrl from './fonts/DMSerifDisplay-Italic.ttf?url';
import dmMonoMediumUrl from './fonts/DMMono-Medium.ttf?url';

/** Logical family names that the PDF generator uses to switch fonts. */
type DMFamily = 'DMSans' | 'DMSerif' | 'DMMono';
/** jsPDF font-style identifiers — note: DM Mono only has up to
 *  Medium (500), so a "bold" style request would fall back to the
 *  Medium TTF registered as 'normal'. */
type DMStyle = 'normal' | 'bold' | 'italic';

interface FontSpec {
  url: string;
  vfsName: string; // Filename used inside jsPDF's virtual FS
  family: DMFamily;
  style: DMStyle;
}

const FONTS: FontSpec[] = [
  { url: dmSansRegularUrl, vfsName: 'DMSans-Regular.ttf', family: 'DMSans', style: 'normal' },
  { url: dmSansBoldUrl, vfsName: 'DMSans-Bold.ttf', family: 'DMSans', style: 'bold' },
  { url: dmSansItalicUrl, vfsName: 'DMSans-Italic.ttf', family: 'DMSans', style: 'italic' },
  { url: dmSerifRegularUrl, vfsName: 'DMSerif-Regular.ttf', family: 'DMSerif', style: 'normal' },
  { url: dmSerifItalicUrl, vfsName: 'DMSerif-Italic.ttf', family: 'DMSerif', style: 'italic' },
  // DM Mono only ships up to Medium (500) — registered as 'normal'
  // since it's the workhorse weight for our tracked overlines.
  { url: dmMonoMediumUrl, vfsName: 'DMMono-Medium.ttf', family: 'DMMono', style: 'normal' },
];

interface LoadedFont {
  vfsName: string;
  family: DMFamily;
  style: DMStyle;
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
  }
  return cachedBinaries;
}

/** Register all DM fonts (Sans/Serif/Mono) with a fresh jsPDF doc. */
export async function registerDMFonts(doc: jsPDF): Promise<void> {
  const fonts = await loadAllBinaries();
  for (const f of fonts) {
    doc.addFileToVFS(f.vfsName, f.binary);
    doc.addFont(f.vfsName, f.family, f.style);
  }
}
