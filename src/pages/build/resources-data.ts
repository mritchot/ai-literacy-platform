// Resource & budget data — the actual solo build costs, the organizational
// headcount/FTE allocation and budget estimate, and the custom-vs-Articulate
// rationale.
//
// Source: Phase 4 Component 7D Resource Planning Summary
// (planning corpus, outside the repo), §2–§4. The
// practitioner-labor figure uses the RECONCILED canonical value (~150–160
// focused hours). Solo costs reflect the actual spend (Claude Pro then Max 5x,
// plus Google AI Pro for NotebookLM). Org salaries are fully loaded (base ×1.4).
// All monetary figures in US dollars.

export interface CostLine {
  item: string;
  cost: string;
  note: string;
}

export interface FteLine {
  role: string;
  fte: string;
  duration: string;
  note: string;
}

export interface BudgetLine {
  category: string;
  low: string;
  high: string;
  note: string;
}

export interface RationaleBlock {
  heading: string;
  paragraphs: string[];
}

export const SOLO_TOTAL = '$260';

export const SOLO_COSTS: CostLine[] = [
  { item: 'AI tools (Claude)', cost: '$220', note: 'Claude Pro for the first two weeks ($20), then Claude Max 5x for the rest of the build (two billing cycles at $100). The primary development partner for research synthesis, content authoring, code generation, and evaluation design.' },
  { item: 'AI tools (Google AI Pro)', cost: '$40', note: 'Two months at $19.99, used for NotebookLM during research synthesis.' },
  { item: 'Hosting (Cloudflare Pages)', cost: '$0', note: 'Free tier; static deployment with automatic SSL and CDN.' },
  { item: 'Development tools', cost: '$0', note: 'VS Code, Node.js, Git/GitHub, all free; every dependency is an open-source npm package.' },
  { item: 'Design tools (Claude Design)', cost: '$0', note: 'Included with the subscription; used for high-fidelity mockups and reference PDF redesigns.' },
  { item: 'Research sources', cost: '$0', note: 'All source papers are publicly available (WEF, Anthropic Economic Index, Anthropic Interviewer).' },
  { item: 'Authoring tools (Articulate)', cost: '$0', note: 'Deferred indefinitely; a 360 license is ~$1,399/year, not justified for a portfolio piece.' },
  { item: 'Practitioner labor (opportunity cost)', cost: '≈$7,500', note: 'Approximate opportunity cost of roughly 150–160 focused hours. Not an out-of-pocket cost and not in the direct total; in any funded project this is the dominant cost.' },
];

export const FTE_ALLOC: FteLine[] = [
  { role: 'L&D Manager', fte: '0.5', duration: 'Full project (28 wks)', note: 'Program owner; splits time with other portfolio responsibilities.' },
  { role: 'Instructional Designer', fte: '1.0', duration: 'Weeks 1–24', note: 'Full-time through content development; reduces to 0.5 during platform build.' },
  { role: 'Full-Stack Developer', fte: '1.0', duration: 'Weeks 8–26', note: 'Full-time during platform build (overlaps content development); may be a contractor.' },
  { role: 'Subject-Matter Expert', fte: '0.2', duration: 'Weeks 1–18', note: 'Part-time: needs-analysis review, content accuracy, assessment validation.' },
  { role: 'QA Specialist', fte: '0.5', duration: 'Weeks 20–28', note: 'Integration testing, content QA, accessibility, browser compatibility.' },
];

export const BUDGET_LINES: BudgetLine[] = [
  { category: 'Labor · L&D Manager', low: '$47,000', high: '$53,000', note: '0.5 FTE × 28 wks × ~$175–195K fully loaded' },
  { category: 'Labor · Instructional Designer', low: '$42,000', high: '$55,000', note: '1.0 FTE × 24 wks × $90–120K fully loaded' },
  { category: 'Labor · Full-Stack Developer', low: '$52,000', high: '$72,000', note: '1.0 FTE × 18 wks × $150–210K fully loaded (contractor may be higher)' },
  { category: 'Labor · SME', low: '$8,000', high: '$15,000', note: '0.2 FTE × 18 wks, or external consultation' },
  { category: 'Labor · QA Specialist', low: '$6,000', high: '$9,000', note: '0.5 FTE × 8 wks × $80–120K fully loaded' },
  { category: 'Technology + licensing', low: '$5,000', high: '$10,000', note: 'Hosting, AI tools, CI/CD, testing tools' },
  { category: 'Evaluation administration', low: '$5,000', high: '$10,000', note: 'Survey tools, data collection, reporting' },
  { category: 'Contingency (15%)', low: '$25,000', high: '$34,000', note: 'Scope changes, extended timelines, additional review cycles' },
];

export const BUDGET_TOTAL = { low: '$190,000', high: '$258,000' };
export const LABOR_SHARE = '≈80%';

export const RATIONALE: RationaleBlock[] = [
  {
    heading: 'Why custom code',
    paragraphs: [
      'Interactive complexity. The program includes 12 practice activities with varied interaction models: live data dashboards with filter controls, a tokenizer playground with real-time client-side tokenization, a next-token prediction simulator, a multi-step AI interaction sandbox, and a context-window failure scenario. Standard authoring tools cannot produce these natively; building them as embedded iframes would fracture the experience and block the learning-analytics tracking.',
      'Data architecture. The platform renders six validated JSON datasets through interactive Recharts visualizations: live renderings with filters, tooltips, and guided reflections, not static images. The analytics dashboard aggregates learning events from localStorage and can export them as xAPI statements. This is beyond what an authoring tool produces without custom JavaScript, at which point the tool adds overhead rather than value.',
      'Portfolio differentiation. For a candidate targeting L&D Manager or Senior Learning Experience Designer roles, the custom platform signals what a Storyline build does not: technical fluency, product thinking, and the ability to work with (or manage) engineering resources. The production-grade codebase is itself a reviewable artifact.',
    ],
  },
  {
    heading: 'The Articulate deferral',
    paragraphs: [
      'The original architecture included a parallel Articulate build (Rise for Modules 1–2, Storyline for Modules 3–4). It was deferred indefinitely for a practical reason: the ~$1,399/year Articulate 360 license is not justified for a portfolio piece when the custom platform already demonstrates the instructional design at full fidelity.',
      'The instructional design is platform-agnostic (only the interactive components are platform-dependent), so the content documents and component specs provide everything needed to rebuild in Articulate or any equivalent tool.',
    ],
  },
  {
    heading: 'What the choice shifts',
    paragraphs: [
      'The custom approach shifts cost from licensing to labor. An Articulate build eliminates the full-stack developer line (~$52–72K) but adds licensing (~$1,399/year per seat) and constrains interaction design to what Storyline and Rise can produce. For organizations with existing Articulate licenses and Storyline-proficient designers, the authoring-tool approach is more cost-effective; for organizations that need this level of interactive complexity, or that have full-stack engineering available, the custom platform produces a superior learning experience at comparable or lower total cost.',
    ],
  },
];
