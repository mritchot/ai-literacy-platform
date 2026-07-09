// citations.ts — single source of truth for the citations referenced in
// body text via the `<Citation>` component. Each entry is the metadata
// surfaced when the learner hovers/clicks the inline (Author, Year)
// chip. Tier B per spec: full author list + paper title + publisher +
// date, with optional per-statistic page references.
//
// To add a new citation:
//   1. Add an entry below keyed by `kebab-case-id`.
//   2. Optional: add a `pages` map if a specific stat needs a page ref.
//   3. Use `<Citation ids="your-id" />` (or pageKey="…" for a specific
//      page reference) at the call site.

export interface CitationMeta {
  /** Stable id (kebab-case, used by `<Citation ids="…" />`). */
  id: string;
  /** What gets shown on the inline chip — e.g. "Anthropic Interviewer, 2025".
   *  This is the visible (Author, Year) form the learner reads first. */
  shortLabel: string;
  /** Full author list with proper formatting. Shown in the popover. */
  authors: string;
  /** Paper title (what the document calls itself). */
  title: string;
  /** Publishing organization. */
  publisher: string;
  /** Human-readable publication date — "January 2025", "November 5, 2025", etc. */
  date: string;
  /**
   * Optional map of per-statistic page references. Key is a short
   * statistic slug (e.g., "stigma-69", "median-savings-81"); value is
   * the page locator (e.g., "p. 12", "pp. 13–14, Figure 5"). Use the
   * `<Citation pageKey="…" />` prop to surface a specific entry.
   */
  pages?: Record<string, string>;
}

export const CITATIONS = {
  'wef-2025': {
    id: 'wef-2025',
    shortLabel: 'WEF, 2025',
    authors: 'World Economic Forum',
    title: 'The Future of Jobs Report 2025',
    publisher: 'World Economic Forum',
    date: 'January 2025',
    pages: {
      'skill-gap-63': 'p. 49',
      'fastest-growing-skills': 'pp. 5–6',
      'upskill-85': 'p. 52',
    },
  },
  'anthropic-interviewer-2025': {
    id: 'anthropic-interviewer-2025',
    shortLabel: 'Anthropic Interviewer, 2025',
    authors: 'Anthropic',
    title:
      'Introducing Anthropic Interviewer: What 1,250 Professionals Told Us About Working with AI',
    publisher: 'Anthropic',
    date: 'December 2025',
    pages: {
      'time-savings-86': 'research post',
      'stigma-69': 'research post',
      'self-report-augmentation': 'research post',
    },
  },
  'handa-2025': {
    id: 'handa-2025',
    shortLabel: 'Handa et al., 2025',
    authors: 'Handa, K., Tamkin, A., McCain, M., Huang, S., Durmus, E., et al.',
    title:
      'Which Economic Tasks are Performed with AI? Evidence from Millions of Claude Conversations',
    publisher: 'Anthropic',
    date: 'February 2025',
    pages: {
      'aug-auto-split-57-43': 'p. 3',
      'directive-share-28': 'p. 10',
      'feedback-loop-15': 'p. 10',
      'self-vs-behavioral': 'pp. 13–14',
    },
  },
  'appel-mccrory-tamkin-2025': {
    id: 'appel-mccrory-tamkin-2025',
    shortLabel: 'Appel, McCrory & Tamkin, 2025',
    authors: 'Appel, R., McCrory, P., & Tamkin, A.',
    title:
      'Anthropic Economic Index Report: Uneven Geographic and Enterprise AI Adoption',
    publisher: 'Anthropic',
    date: 'September 15, 2025',
    pages: {
      'directive-trend-v3': 'p. 9',
    },
  },
  'liu-2024': {
    id: 'liu-2024',
    shortLabel: 'Liu et al., 2024',
    authors: 'Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P.',
    title: 'Lost in the Middle: How Language Models Use Long Contexts',
    publisher: 'Transactions of the Association for Computational Linguistics (TACL)',
    date: '2024',
    pages: {
      'lost-in-middle': 'pp. 157–173',
    },
  },
  'lee-2025': {
    id: 'lee-2025',
    shortLabel: 'Lee et al., 2025',
    authors:
      'Lee, H.-P., Sarkar, A., Tankelevitch, L., Drosos, I., Rintel, S., Banks, R., & Wilson, N.',
    title:
      'The Impact of Generative AI on Critical Thinking: Self-Reported Reductions in Cognitive Effort and Confidence Effects From a Survey of Knowledge Workers',
    publisher: 'CHI Conference on Human Factors in Computing Systems (CHI ’25)',
    date: '2025',
    pages: {
      'confidence-critical-thinking': 'abstract; survey of 319 knowledge workers',
    },
  },
  'tamkin-mccrory-2025': {
    id: 'tamkin-mccrory-2025',
    shortLabel: 'Tamkin & McCrory, 2025',
    authors: 'Tamkin, A. & McCrory, P.',
    title: 'Estimating AI Productivity Gains from Claude Conversations',
    publisher: 'Anthropic',
    date: 'November 5, 2025',
    pages: {
      // Figure 6's caption (the canonical 81% locator) sits on p. 13;
      // p. 12's body text carries the 84% conversation-level figure.
      'median-savings-81': 'p. 13, Figure 6',
      'compile-95': 'p. 12',
      'documents-87': 'p. 10',
      'diagnostic-20': 'p. 12',
    },
  },
} as const satisfies Record<string, CitationMeta>;

type CitationId = keyof typeof CITATIONS;

/** Look up a citation by id. Falls back to a placeholder if not found —
 *  preferred over throwing so a typo'd `<Citation ids="..." />` shows
 *  visibly in the UI instead of crashing the whole route. */
export function getCitation(id: string): CitationMeta {
  if (id in CITATIONS) return CITATIONS[id as CitationId];
  return {
    id,
    shortLabel: `(unknown citation: ${id})`,
    authors: 'Unknown',
    title: 'Citation not found',
    publisher: 'Unknown',
    date: 'Unknown',
  };
}
