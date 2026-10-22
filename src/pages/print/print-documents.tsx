// Print-document registry — resolves a `#/print/<family>/<param>` route to
// the content component the in-app page (or reference panel) renders, plus
// the title, series label, position, and accent the print shell needs for
// its masthead and the running header/footer.
//
// Series documents reuse the page components themselves (lazy-loaded, the
// same modules the router loads), so the PDF renders exactly what the page
// renders; the shell hides the page chrome (top bar, pager, download
// controls) by CSS. Titles come from the three config.ts registries. Series
// labels are derived from the same config so they match each page's eyebrow
// ("Needs Analysis · Reading", "Behind the build · Design", …).
//
// Reference documents render the `items/R*.tsx` body components directly,
// with the title and PDF path from ReferenceTrigger.tsx's REFERENCE_ITEMS
// (R4_META for R4, whose checklist state keeps it out of that registry).
// The manifest's `pdf` must equal the registry's `pdfPath` — the resolver
// throws on a mismatch so the render fails loudly instead of writing a
// PDF the in-app download link cannot find.

import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import manifest from './print-manifest.json';
import { SERIES as NEEDS_ANALYSIS } from '../needs-analysis/config';
import { SERIES as EVALUATION } from '../evaluation/config';
import { SERIES as BUILD } from '../build/config';
import type { ArtifactMeta, SeriesConfig } from '../artifact-series/artifact-series';
import { REFERENCE_ITEMS, type ReferenceId } from '../../components/reference/ReferenceTrigger';
import { R4_META } from '../../components/reference/R4Trigger';
import { R4VerificationChecklist } from '../../components/reference/items/R4VerificationChecklist';

export type PrintFamily = 'needs-analysis' | 'evaluation' | 'build' | 'reference';

export interface PrintDocument {
  family: PrintFamily;
  param: string;
  /** Output path under public/ (also the in-app download href). */
  pdf: string;
  /** Document title — the masthead h1 and the running header. */
  title: string;
  /** Series label for the running header, e.g. "Behind the build · Design". */
  label: string;
  /** Series accent as a CSS color expression over the design tokens. */
  accent: string;
  /** Position in the series, e.g. "2 of 4" (the web breadcrumb's count);
   *  undefined for the reference cards. */
  position: string | undefined;
  Component: ComponentType;
}

export const PRINT_MANIFEST: ReadonlyArray<{ family: string; param: string; pdf: string }> =
  manifest.documents;

// ─── Series pages ──────────────────────────────────────────────────────

type Loader = () => Promise<{ default: ComponentType }>;

// Same lazy imports as src/router.tsx, keyed by PDF slug. Wrapped in
// lazy() once at module scope so React keeps a stable component identity.
const SERIES_LOADERS: Record<Exclude<PrintFamily, 'reference'>, Record<string, Loader>> = {
  'needs-analysis': {
    'executive-problem-statement': () => import('../needs-analysis/ProblemStatement'),
    'capability-gap-analysis': () => import('../needs-analysis/CapabilityGap'),
    'learner-persona': () => import('../needs-analysis/LearnerPersona'),
    'action-map': () => import('../needs-analysis/ActionMap'),
  },
  evaluation: {
    'level-1-reaction': () => import('../evaluation/Level1Reaction'),
    'level-2-learning': () => import('../evaluation/Level2Learning'),
    'level-3-behavior': () => import('../evaluation/Level3Behavior'),
    'level-4-results': () => import('../evaluation/Level4Results'),
  },
  build: {
    'learning-architecture': () => import('../build/LearningArchitecture'),
    architecture: () => import('../build/Architecture'),
    timeline: () => import('../build/Timeline'),
    raci: () => import('../build/Raci'),
    resources: () => import('../build/Resources'),
    communications: () => import('../build/Communications'),
    quality: () => import('../build/Quality'),
  },
};

const SERIES_CONFIG: Record<Exclude<PrintFamily, 'reference'>, SeriesConfig> = {
  'needs-analysis': NEEDS_ANALYSIS,
  evaluation: EVALUATION,
  build: BUILD,
};

const lazyCache = new Map<string, LazyExoticComponent<ComponentType>>();
function lazyFor(key: string, load: Loader): LazyExoticComponent<ComponentType> {
  let c = lazyCache.get(key);
  if (!c) {
    c = lazy(load);
    lazyCache.set(key, c);
  }
  return c;
}

// The label each page prints in its SeriesEyebrow, reconstructed from the
// series config: Reading pages use `readingEyebrow` verbatim; the build
// series labels by group ("Behind the build · Project Management"); the
// other interactive pages swap the "Reading" suffix for "Interactive".
function seriesLabel(series: SeriesConfig, artifact: ArtifactMeta): string {
  const [seriesName = series.readingEyebrow] = series.readingEyebrow.split(' · ');
  if (artifact.group) return `${seriesName} · ${artifact.group}`;
  if (artifact.type === 'Reading') return series.readingEyebrow;
  return `${seriesName} · Interactive`;
}

// ─── Reference items ───────────────────────────────────────────────────

// R4's checklist state is owned by R4Trigger on the web; the print card
// renders every box unchecked and never toggles.
function R4Print(): JSX.Element {
  return <R4VerificationChecklist checked={{}} onToggle={() => undefined} />;
}

interface ReferencePrintItem {
  title: string;
  pdfPath: string;
  Component: ComponentType;
}

// Keyed by the lower-case route param ("r1"); the registry uses "R1".
function referenceItem(param: string): ReferencePrintItem | null {
  if (param === 'r4') return { ...R4_META, Component: R4Print };
  const id = param.toUpperCase();
  if (!(id in REFERENCE_ITEMS)) return null;
  const meta = REFERENCE_ITEMS[id as ReferenceId];
  return { title: meta.title, pdfPath: meta.pdfPath, Component: meta.Content };
}

// ─── Resolver ──────────────────────────────────────────────────────────

export function isPrintFamily(s: string | undefined): s is PrintFamily {
  return s === 'needs-analysis' || s === 'evaluation' || s === 'build' || s === 'reference';
}

export function resolvePrintDocument(family: PrintFamily, param: string): PrintDocument | null {
  const entry = PRINT_MANIFEST.find((d) => d.family === family && d.param === param);
  if (!entry) return null;

  if (family === 'reference') {
    const item = referenceItem(param);
    if (!item) return null;
    if (item.pdfPath !== entry.pdf) {
      throw new Error(
        `print-manifest.json lists ${entry.pdf} for ${param}, but the reference registry's pdfPath is ${item.pdfPath}`,
      );
    }
    return {
      family,
      param,
      pdf: item.pdfPath,
      title: item.title,
      label: `Reference · ${param.toUpperCase()}`,
      accent: 'rgb(var(--action))',
      position: undefined,
      Component: item.Component,
    };
  }

  const load = SERIES_LOADERS[family][param];
  const series = SERIES_CONFIG[family];
  const index = series.artifacts.findIndex((a) => a.slug === param);
  const artifact = series.artifacts[index];
  if (!load || !artifact) return null;
  return {
    family,
    param,
    pdf: entry.pdf,
    title: artifact.title,
    label: seriesLabel(series, artifact),
    accent: series.accent,
    position: `${index + 1} of ${series.artifacts.length}`,
    Component: lazyFor(`${family}/${param}`, load),
  };
}
