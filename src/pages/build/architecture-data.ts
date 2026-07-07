// Architecture decision records — the technical decisions behind the custom
// platform, each with its rationale, plus the two hosting options evaluated
// and declined. Rendered as the expandable-card browser on the Architecture
// page.
//
// Source: Phase 3A-1 Platform Architecture Decision Document
// (course-info/content/03_phase-03/04_platform-architecture-decision-document.md),
// §1–§7. Rationale is condensed faithfully from that document, in plain language
// for a non-technical reader.

export interface Adr {
  id: string;
  /** Decision area (adopted) or option name (declined). */
  category: string;
  /** Headline decision, shown collapsed. */
  decision: string;
  status: 'adopted' | 'declined';
  /** Rationale paragraphs, shown when expanded. */
  rationale: string[];
}

export const ADRS: Adr[] = [
  {
    id: 'framework',
    category: 'Framework',
    decision: 'Vite + React + TypeScript (strict mode)',
    status: 'adopted',
    rationale: [
      'The platform is built with three common web tools. React is a common framework for building interactive interfaces, and it works well with the charting and interface libraries the dashboards and sandbox rely on. Vite is the build tool that packages everything the browser downloads, and it keeps that package small and quick to load.',
      'TypeScript is a version of JavaScript that checks the code for mistakes before the site ever ships, rather than letting them surface for a learner. Its strict setting applies those checks more rigorously, which is especially useful where the research data files connect to the charts that display them.',
    ],
  },
  {
    id: 'routing',
    category: 'Routing',
    decision: 'React Router v6 with HashRouter',
    status: 'adopted',
    rationale: [
      'Moving between the four modules and their sections runs on React Router, a common navigation tool for a site like this. It is set to "hash" mode, which is why every address carries a # (for example, /#/module/1/section/2). That # keeps the full address on the visitor\'s device instead of sending it to a server, so the site runs on simple, free hosting with no server setup.',
      'That is what makes the zero-setup hosting described below possible.',
    ],
  },
  {
    id: 'styling',
    category: 'Styling',
    decision: 'Tailwind CSS with design tokens in the config',
    status: 'adopted',
    rationale: [
      'The visual styling uses Tailwind, a system that builds the look from small, reusable pieces. It keeps the design consistent across the site and strips out any styling the site does not actually use, so the styling file the browser downloads stays tiny.',
      'Every choice from the earlier design system (the fonts, the four competency colors and their variants, the spacing, the corner rounding, the screen-size breakpoints) is defined once in a central settings file, so the whole platform draws from one source and stays consistent.',
    ],
  },
  {
    id: 'charting',
    category: 'Charting',
    decision: 'Recharts',
    status: 'adopted',
    rationale: [
      'Module 2\'s dashboard shows several interactive charts: the split between AI augmenting versus automating tasks, adoption by country, productivity gains, and projected skill demand. Recharts is a charting library made for React, and it draws all of these with very little custom code. An alternative, D3, offers more control but would have added a lot of extra work the charts here do not need.',
    ],
  },
  {
    id: 'state',
    category: 'State management',
    decision: 'React Context + useReducer, persisted to localStorage',
    status: 'adopted',
    rationale: [
      'The platform only needs to remember a small, well-defined amount of information, so it uses React\'s built-in tools for this rather than a separate add-on library. Two pieces cover everything.',
      'The first remembers each learner\'s progress: where they are, which sections they have finished, their knowledge-check answers, and their written reflections, all saved in the browser so nothing is lost on a refresh or an interruption. The second records activity for the admin dashboard and can export it as a file the organization can take with it.',
    ],
  },
  {
    id: 'data',
    category: 'Data approach',
    decision: 'Static JSON in /src/data, no backend for V1',
    status: 'adopted',
    rationale: [
      'All the data behind the charts comes from published research with fixed numbers, so it never changes while the site is running and needs no server to process it. It is stored in plain data files that load straight into the page, which is fast and keeps hosting simple.',
      'Those files are also open to inspection: anyone can open one and check that a figure traces back to its source study, such as Handa et al. (2025). Learner activity is saved in the browser and can be exported as a file, so none of this requires a server.',
    ],
  },
  {
    id: 'deployment',
    category: 'Deployment',
    decision: 'Cloudflare Pages (primary), GitHub Pages (fallback)',
    status: 'adopted',
    rationale: [
      'The site is hosted on Cloudflare Pages. The domain was already managed by Cloudflare, so this setup handles the web address automatically, and its network delivers pages quickly across Southeast Asia at no cost. Each time an update is saved, the site rebuilds and publishes itself, and draft versions get their own preview links.',
      'GitHub Pages is a free backup host that needs no special configuration (the hash-based addresses above are what make that possible). Its network is a little slower than Cloudflare\'s, a fair tradeoff for a low-traffic portfolio site.',
    ],
  },
  {
    id: 'netlify',
    category: 'Netlify',
    decision: 'Evaluated and declined',
    status: 'declined',
    rationale: [
      'Netlify would have done the same job as Cloudflare Pages: free hosting, automatic publishing on save, and custom-domain support. It was declined because it would mean adding another company\'s account into the mix with no real advantage over Cloudflare, which already manages the domain.',
    ],
  },
  {
    id: 'vercel',
    category: 'Vercel',
    decision: 'Evaluated and declined',
    status: 'declined',
    rationale: [
      'Declined on security grounds. In April 2026, Vercel disclosed a serious breach: an attacker got into a third-party AI tool used by a Vercel employee, took over that employee\'s work account, and reached internal systems, including customer data that had been left unencrypted. The stolen data was put up for sale online.',
      'This site stores no sensitive data of its own, so it was not directly at risk, but the breach pointed to a broader security concern. Vercel was also unnecessary here, since Cloudflare already manages the domain.',
    ],
  },
];
