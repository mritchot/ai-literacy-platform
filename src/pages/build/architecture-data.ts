// Architecture decision records — the technical decisions behind the custom
// platform, each with its rationale, plus the two hosting options evaluated
// and declined. Rendered as the expandable-card browser on the Architecture
// page.
//
// Source: Phase 3A-1 Platform Architecture Decision Document
// (course-info/content/03_phase-03/04_platform-architecture-decision-document.md),
// §1–§7. Rationale is condensed faithfully from that document.

export interface Adr {
  id: string;
  /** Decision area (adopted) or option name (declined). */
  category: string;
  /** Headline decision, shown collapsed. */
  decision: string;
  status: 'adopted' | 'declined';
  /** Rationale paragraphs, shown when expanded. */
  rationale: string[];
  /** Optional configuration / detail chips. */
  config?: string[];
}

export const ADRS: Adr[] = [
  {
    id: 'framework',
    category: 'Framework',
    decision: 'Vite + React + TypeScript (strict mode)',
    status: 'adopted',
    rationale: [
      'Vite provides fast builds, native ES modules, tree-shaking, and code splitting — all critical for bundle efficiency. React is the dominant component framework for interactive SPAs and is well-supported by the charting and UI libraries the dashboard and sandbox require.',
      'TypeScript strict mode catches data-shape errors at build time, which matters most when wiring static JSON to chart components. The codebase is itself a portfolio artifact subject to technical review; strict mode signals engineering rigor.',
    ],
    config: ['strict: true — no any except as a documented last resort', 'Standard React plugin, no SSR'],
  },
  {
    id: 'routing',
    category: 'Routing',
    decision: 'React Router v6 with HashRouter',
    status: 'adopted',
    rationale: [
      'React Router v6 cleanly handles a four-module SPA with section-level navigation. HashRouter is chosen over BrowserRouter because the hash fragment is never sent to the server, so every URL resolves to index.html regardless of host — no server-side redirect configuration.',
      'That is exactly what makes zero-config deployment to static hosts (Cloudflare Pages, GitHub Pages) possible.',
    ],
    config: ['URL structure: /#/module/1/section/2'],
  },
  {
    id: 'styling',
    category: 'Styling',
    decision: 'Tailwind CSS with design tokens in the config',
    status: 'adopted',
    rationale: [
      'Tailwind’s utility-first approach enables rapid component development with visual consistency, and its purge pipeline produces small CSS bundles — typically under 10KB gzipped at this scope.',
      'The established design tokens — the DM font stack, the 4D competency palette with all variants, the spacing scale, radii, and breakpoints — are encoded in tailwind.config.js so they are available as utilities throughout the codebase.',
    ],
    config: ['No component library (no Material UI, Chakra) — full visual control, no dependency bloat'],
  },
  {
    id: 'charting',
    category: 'Charting',
    decision: 'Recharts',
    status: 'adopted',
    rationale: [
      'The Module 2 live data dashboard needs several chart types — augmentation/automation splits, geographic adoption, productivity distributions, and WEF skill-demand projections. Recharts is React-native, composable, and covers them all. D3 offers more control at substantially higher build cost, which the chart complexity here does not justify.',
    ],
    config: ['Recharts bundles much of D3 internally, so Module 2 is lazy-loaded — Module 1 learners do not pay the charting cost upfront'],
  },
  {
    id: 'state',
    category: 'State management',
    decision: 'React Context + useReducer, persisted to localStorage',
    status: 'adopted',
    rationale: [
      'The state surface is small and well-defined; no external state library (Redux, Zustand) is warranted. Two contexts cover the full scope, both wrapping the app at the root.',
      'LearnerProgressContext tracks module/section position, per-section completion, knowledge-check responses, and reflection text — persisted so progress survives refresh and interruption. AnalyticsContext accumulates interaction events for the admin dashboard, with a JSON export for data portability.',
    ],
  },
  {
    id: 'data',
    category: 'Data approach',
    decision: 'Static JSON in /src/data — no backend for V1',
    status: 'adopted',
    rationale: [
      'All visualization data originates from published research with fixed figures; it does not change at runtime and needs no server-side processing. Static JSON imported directly by the consuming components is fast, reviewable, and eliminates deployment complexity.',
      'The JSON files double as reviewable artifacts: a technically literate evaluator can open augmentation-automation.json and verify the data traces back to Handa et al. (2025). Analytics persist to localStorage, with a downloadAnalytics() export providing portability without server infrastructure.',
    ],
  },
  {
    id: 'deployment',
    category: 'Deployment',
    decision: 'Cloudflare Pages (primary), GitHub Pages (fallback)',
    status: 'adopted',
    rationale: [
      'The project domain is already managed through Cloudflare, so Cloudflare Pages auto-configures the custom domain and eliminates DNS complexity. Its edge network is the fastest CDN in Southeast Asia — directly relevant to the Singapore and Hong Kong positioning — and the free tier includes unlimited bandwidth. A Git-based deploy builds on push to main, with preview deployments generated for non-main branches.',
      'GitHub Pages is a zero-configuration fallback: because HashRouter is used, no redirect rules are needed. A GitHub Action builds and pushes dist/ to the gh-pages branch. Its Asia-Pacific CDN is adequate but slower than Cloudflare’s — an acceptable tradeoff for a low-traffic portfolio piece.',
    ],
    config: ['Build command: npm run build', 'Output directory: dist/'],
  },
  {
    id: 'netlify',
    category: 'Netlify',
    decision: 'Evaluated and declined',
    status: 'declined',
    rationale: [
      'Functionally equivalent to Cloudflare Pages for this project — free tier, Git-based deploys, SPA redirect support, custom-domain configuration. It was declined because it adds a third-party platform account and trust boundary with no compensating advantage over Cloudflare, whose DNS the project already uses.',
    ],
  },
  {
    id: 'vercel',
    category: 'Vercel',
    decision: 'Evaluated and declined',
    status: 'declined',
    rationale: [
      'Declined on security-posture grounds. Vercel disclosed a significant breach on April 19, 2026: an attacker compromised a third-party AI tool (Context AI) used by a Vercel employee, took over that employee’s Google Workspace account, and reached internal systems — including customer environment variables that were not encrypted at rest. Stolen data (API keys, source code, database records) was listed for sale on BreachForums.',
      'This project’s deployment holds no secrets (a static SPA, no environment variables, no API keys), but the breach represents a systemic security-posture concern. Vercel is also redundant here, since the domain is already managed by Cloudflare.',
    ],
  },
];
