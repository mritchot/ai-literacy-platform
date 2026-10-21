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
  /** Optional canonical URL for the source (populated for entries added
   *  in the September 2026 literature integration whose proposals gave one). */
  url?: string;
}

export const CITATIONS = {
  // ─── Anchor sources (original registry) ─────────────────────────────
  'wef-2025': {
    id: 'wef-2025',
    shortLabel: 'WEF, 2025',
    authors: 'World Economic Forum',
    title: 'The Future of Jobs Report 2025',
    publisher: 'World Economic Forum',
    date: 'January 2025',
    pages: {
      'skill-gap-63': 'p. 49, Figure 4.1',
      'fastest-growing-skills': 'p. 37, Figure 3.4',
      'core-skills-2025': 'p. 35, Figure 3.3; pp. 40–41, Figure 3.6',
      'upskill-85': 'p. 52, Figure 4.4',
      'ai-transform-86': 'p. 11, Figure 1.2; p. 62',
      'ai-adoption-barrier-50': 'pp. 62–63, Figure 4.13 (Executive Opinion Survey)',
      'ai-reskill-77': 'pp. 62–63, Figure 4.14',
      'downsize-41': 'p. 63, Figure 4.14',
      'skills-instability-39': 'pp. 32–33, Figure 3.1',
      'genai-literacy-training': 'pp. 43–44, Box 3.1',
      'human-machine-frontier': 'pp. 26–27, Figures 2.7–2.8',
      'genai-knowledge-work-decline': 'p. 26',
      'culture-barrier-46': 'p. 49, Figure 4.1',
      'ai-investment-8x': 'p. 11',
      'economy-profiles': 'pp. 124–125 (Canada), 144–145 (Hong Kong SAR), 192–193 (Singapore)',
    },
  },
  'anthropic-interviewer-2025': {
    id: 'anthropic-interviewer-2025',
    shortLabel: 'Anthropic Interviewer, 2025',
    authors:
      'Handa, K., Stern, M., Huang, S., Hong, J., Durmus, E., McCain, M., Yun, G., Alt, A. J., Millar, T., Tamkin, A., Leibrock, J., Ritchie, S., & Ganguli, D.',
    title:
      'Introducing Anthropic Interviewer: What 1,250 Professionals Told Us About Working with AI',
    publisher: 'Anthropic',
    date: 'December 4, 2025',
    url: 'https://www.anthropic.com/research/anthropic-interviewer',
    pages: {
      'time-savings-86':
        'research post, "AI’s impact in the general workforce" (general-workforce survey, N = 1,000: 86% say AI saves time)',
      'satisfaction-65':
        'research post, "AI’s impact in the general workforce" (general-workforce survey, N = 1,000: 65% satisfied with AI’s role)',
      'stigma-69':
        'research post, "AI’s impact in the general workforce" (general-workforce sample, N = 1,000: 69% mentioned social stigma, a theme count from interview transcripts; fact-checker quotation)',
      'anxiety-55':
        'research post, "AI’s impact in the general workforce" (41% feel secure; 55% anxious; 8% anxious with no plan)',
      'self-report-augmentation':
        'research post, "Augmentation versus automation" (65% describe their use as augmentative, 35% automative)',
      'self-vs-behavioral':
        'research post, "Augmentation versus automation" (65% self-reported vs. 47% augmentation / 49% automation in the August 2025 Economic Index data; five candidate explanations)',
      'oversight-roles-48':
        'research post, "Augmentation versus automation" (48% considered moving toward AI-oversight roles)',
      'sample-method':
        'research post, "Participants" and "How Anthropic Interviewer works" (1,250 via crowdworker platforms: general workforce N=1,000, scientists N=125, creatives N=125; 10–15 minute AI-run interviews)',
      'limitations':
        'research post, "Limitations" (selection bias, demand characteristics, self-report vs. usage data, Western-based sample, non-experimental)',
      'lazy-email-quote':
        'research post, "Introduction", topic diagram (General workforce tab, "Writing independence": a salesperson says colleagues regard AI-generated email as lazy)',
      'conversation-only-limit':
        'research post, "Introduction" (the earlier usage tool saw only inside Claude conversations, not how outputs were used afterward)',
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
      'directive-writing': 'p. 9',
      'directive-share-28': 'p. 10',
      'feedback-loop-15': 'p. 10',
      'self-vs-behavioral': 'pp. 13–14',
      'feedback-loop-coding': 'p. 9',
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
    url: 'https://www.anthropic.com/research/anthropic-economic-index-september-2025-report',
    pages: {
      'directive-trend-v3': 'p. 9',
      'directive-explanations': 'pp. 10–11',
      'adoption-speed': 'p. 2',
      'aui-method': 'pp. 14, 28',
      'task-mix-by-country': 'pp. 4, 21',
      'api-automation-77': 'pp. 5, 36',
    },
  },
  'appel-massenkoff-mccrory-2026': {
    id: 'appel-massenkoff-mccrory-2026',
    shortLabel: 'Appel, Massenkoff & McCrory, 2026',
    authors:
      'Appel, R., Massenkoff, M., McCrory, P., McCain, M., Heller, R., Neylon, T., & Tamkin, A.',
    title: 'The Anthropic Economic Index Report: Economic Primitives',
    publisher: 'Anthropic',
    date: 'January 15, 2026',
    url: 'https://www.anthropic.com/research/anthropic-economic-index-january-2026-report',
    pages: {
      'aug-auto-52-45': 'p. 5; p. 17 n. 2',
      'directive-share-32': 'p. 9',
      'jan-2025-restated-56-41': 'p. 9',
      'speed-reliability-tradeoff': 'pp. 38–39',
      'success-and-task-horizon': 'pp. 21, 26, 41–42',
      'prompt-response-education': 'pp. 28, 34–35',
      'multi-turn-success': 'pp. 26, 42',
      'success-adjusted-productivity': 'p. 48',
      'us-state-convergence': 'pp. 6, 12',
      'country-gaps-stable': 'p. 6',
    },
  },
  'massenkoff-mccrory-2026': {
    id: 'massenkoff-mccrory-2026',
    shortLabel: 'Massenkoff & McCrory, 2026',
    authors: 'Massenkoff, M. & McCrory, P.',
    title: 'Labor Market Impacts of AI: A New Measure and Early Evidence',
    publisher: 'Anthropic',
    date: 'March 5, 2026',
    url: 'https://www.anthropic.com/research/labor-market-impacts',
    pages: {
      'no-unemployment-effect': 'pp. 2, 11, 13',
      'young-worker-hiring-14': 'p. 13',
      'coverage-33-vs-94': 'p. 7',
      'most-exposed-occupations': 'pp. 8, 14',
      'exposed-worker-profile': 'p. 9',
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
      'confidence-critical-thinking': 'p. 9 (confidence in AI, β = −0.69, p < 0.001); Table 4, p. 10',
      'self-confidence-more-critical-thinking':
        'p. 9 (self-confidence β = 0.26; evaluation confidence β = 0.31)',
      'sample-936-examples':
        'p. 6 (319 workers; 936 examples: 374 creation, 303 information, 259 advice)',
      'bloom-six-activities': 'p. 3 (definition); Table 2, p. 6',
      'effort-reduction-shares':
        'p. 12 (72/79/69/72/76/55% less effort by activity); Figure 2, p. 13',
      'effort-shift-stewardship':
        'pp. 12–13 (gathering → verification; problem-solving → integration; execution → stewardship)',
      'verification-practices':
        'pp. 8–9 (objective criteria 125/319; cross-referencing 114/319; source checks 23/319; style edits 45/319)',
      'three-phases': 'p. 8 (goal and query formation; inspect response; integrate response)',
      'inhibitors':
        'p. 11 (awareness, motivation, and ability barriers; trivial task 55/319; trust 83/319; time 44/319; barriers to inspecting responses, such as limited domain knowledge, 58/319; barriers to revising queries and improving output 72/319)',
      'skill-development-motivator':
        'p. 11 (skill development 13/319, a motivator for critical thinking)',
      'practice-decay':
        'p. 11 (critical thinking only in high-stakes work is risky; skills decay without low-stakes practice)',
      'correlational-caveat': 'p. 14 (design does not establish causation)',
      'stewardship-definition': 'p. 15 (accountability stays with the human)',
      'training-recommendation':
        'p. 15 (verification, integration, stewardship; maintain foundational skills)',
      'self-report-limits':
        'p. 15 (participants conflated task effort with critical-thinking effort; self-confidence may be miscalibrated)',
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
      'most-tasks-50-95': 'p. 12; p. 13, Figure 6',
      'compile-95': 'p. 12',
      'documents-87': 'p. 10',
      'diagnostic-20': 'p. 12',
      'bottleneck-tasks': 'pp. 17–18',
      'rct-comparison': 'p. 13',
    },
  },

  // ─── Anthropic workforce research ───────────────────────────────────
  'huang-2025': {
    id: 'huang-2025',
    shortLabel: 'Huang et al., 2025',
    authors: 'Huang, S., Seethor, B., Durmus, E., Handa, K., McCain, M., Stern, M., & Ganguli, D.',
    title: 'How AI Is Transforming Work at Anthropic',
    publisher: 'Anthropic',
    date: 'December 2, 2025',
    url: 'https://anthropic.com/research/how-ai-is-transforming-work-at-anthropic/',
    pages: {
      'delegation-criteria':
        'research post, "AI delegation approaches" (library PDF pp. 10–11): six criteria from 53 interviews',
      'full-delegation-share':
        'research post, "How much work can be fully delegated to Claude?" (PDF p. 9): more than half of 132 survey respondents can fully delegate only 0–20% of work',
      'tasks-kept-human':
        'research post (PDF p. 12): strategic thinking and design decisions needing organizational context or taste',
      'expertise-and-verification':
        'research post (PDF pp. 11–12): use within expertise to verify; prompting style adapts to expertise',
      'junior-engineer-danger':
        'research post (PDF p. 11): a proposal "really smart in the dangerous way"',
      'paradox-of-supervision': 'research post (PDF pp. 13–14): skill atrophy, lost incidental learning, and the paradox of supervision',
      'deliberate-practice':
        'research post (PDF p. 14): solving problems without Claude to stay sharp',
      'time-spenders':
        'research post (PDF pp. 7–8): some spend more time on Claude-assisted tasks (debugging, cleanup, comprehension)',
      'self-report-limits':
        'research post, "Usage and productivity" (PDF p. 6): METR study, experienced developers on familiar codebases overestimated their AI productivity boost; Appendix (PDF p. 25): selection, social desirability, recency bias; read alongside usage data',
      'full-stack': 'research post (PDF pp. 12–13, 22): engineers becoming full-stack',
      'social-dynamics':
        'research post, "Changing social dynamics in the workplace" (PDF pp. 16–17): Claude as first stop for questions that once went to colleagues; junior staff bring fewer questions to senior engineers',
      'moving-target':
        'research post (PDF p. 12): delegation boundaries renegotiated as models improve',
    },
  },

  // ─── The 4D framework and the course that teaches it ────────────────
  'dakan-feller-2025': {
    id: 'dakan-feller-2025',
    shortLabel: 'Dakan & Feller, 2025',
    authors: 'Dakan, R., & Feller, J.',
    title: 'Framework for AI Fluency: Practical Overview Document (Version 1.1)',
    publisher: 'Ringling College of Art and Design; University College Cork',
    date: 'January 13, 2025',
    url: 'https://ringling.libguides.com/ai/framework',
    pages: {
      'ai-fluency-definition': 'p. 2',
      'modalities': 'p. 2',
      'four-ds': 'p. 3',
      'delegation': 'pp. 3–4',
      'description': 'pp. 4–5',
      'discernment': 'pp. 5–6',
      'diligence': 'p. 6',
      'diligence-statement': 'p. 7',
    },
  },
  'anthropic-ai-fluency-course-2025': {
    id: 'anthropic-ai-fluency-course-2025',
    shortLabel: 'Anthropic, Dakan & Feller, 2025',
    authors: 'Dakan, R., Feller, J., & Anthropic',
    title: 'AI Fluency: Framework & Foundations (course)',
    publisher: 'Anthropic Academy (Skilljar)',
    date: '2025',
    url: 'https://anthropic.skilljar.com/ai-fluency-framework-foundations',
    pages: {
      'course-license':
        '"About this course" PDF: "Copyright 2025 Rick Dakan, Joseph Feller, and Anthropic. Released under the CC BY-NC-SA 4.0 license."',
      'course-url': 'https://anthropic.skilljar.com/ai-fluency-framework-foundations',
    },
  },

  // ─── Industry commentary and telemetry ──────────────────────────────
  'evans-2025-05': {
    id: 'evans-2025-05',
    shortLabel: 'Evans, May 2025',
    authors: 'Evans, B.',
    title: 'AI eats the world (May 2025 edition)',
    publisher:
      'Benedict Evans, independent analyst (commentary deck; charts reproduce third-party data)',
    date: 'May 2025',
    pages: {
      'platform-shift-6': 'slide 6',
      'three-barriers-29': 'slide 29',
      'deterministic-probabilistic-27': 'slide 27',
      'price-collapse-18': 'slide 18 (Stanford AI Index)',
      'jevons-19': 'slide 19 (Ericsson; MSCI)',
      'cloud-30-33': 'slide 33 (Goldman Sachs CIO Survey)',
      'cio-timing-44': 'slide 44 (Morgan Stanley CIO Survey, March 2025)',
      'use-case-37': 'slide 37',
      'mtok-22': 'slide 22',
      'delay-reasons-32': 'slide 32 (Bain, December 2024)',
    },
  },
  'evans-2025-11': {
    id: 'evans-2025-11',
    shortLabel: 'Evans, Nov 2025',
    authors: 'Evans, B.',
    title: 'AI eats the world (November 2025 edition)',
    publisher:
      'Benedict Evans, independent analyst (commentary deck; charts reproduce third-party data)',
    date: 'November 2025',
    pages: {
      'engagement-gap-39': 'slide 39 (ten US consumer surveys, Aug 2024–Sep 2025)',
      'cio-timing-57': 'slide 57 (Morgan Stanley CIO Survey, September 2025)',
      'error-rates-64': 'slide 64',
      'pilot-failure-56': 'slide 56',
      'agents-pilot-55': 'slide 55 (McKinsey, June 2025)',
      'benchmarks-close-35': 'slide 35 (LMArena; Artificial Analysis, October 2025)',
      'absorb-20-years-61': 'slide 61',
      'saas-apps-10': 'slide 10 (Productiv)',
      'cloud-30-58': 'slide 58 (Goldman Sachs CIO Survey)',
    },
  },
  'evans-2026-05': {
    id: 'evans-2026-05',
    shortLabel: 'Evans, May 2026',
    authors: 'Evans, B.',
    title: 'AI eats the world (May 2026 edition)',
    publisher:
      'Benedict Evans, independent analyst (commentary deck; charts reproduce third-party data)',
    date: 'May 2026',
    pages: {
      'wau-900m-29': 'slide 29 (OpenAI-reported round numbers, no precise dates)',
      'mile-wide-30': 'slide 30 (OpenAI “Wrapped” user shares)',
      'capacity-gap-32': 'slide 32 (Gallup, June 2023–December 2025)',
      'probabilistic-52': 'slide 52',
      'verification-scalable-52': 'slide 52',
      'task-vs-job-54': 'slides 33, 54–57, 67 (US Census; BLS; AICPA; FMI)',
      'frontier-cadence-20': 'slide 20',
      'capex-700-8': 'slide 8 (company guidance, includes capital leases)',
      'cfo-impact-35': 'slide 35 (Atlanta Fed, Baslandze et al., December 2025)',
      'provisional-thesis-27': 'slide 27',
      'apps-hundreds-40': 'slide 40',
      'new-questions-66': 'slide 66',
    },
  },
  'openrouter-a16z-2025': {
    id: 'openrouter-a16z-2025',
    shortLabel: 'OpenRouter & a16z, 2025',
    authors: 'Aubakirova, M., Atallah, A., Clark, C., Summerville, J., & Midha, A.',
    title: 'OpenRouter State of AI: An Empirical 100 Trillion Token Study with OpenRouter',
    publisher:
      'OpenRouter Inc. & a16z (industry research; anonymized request metadata, Nov 2024–Nov 2025)',
    date: 'December 2025',
    url: 'https://openrouter.ai/state-of-ai',
    pages: {
      'asia-share-34': 'PDF p. 34',
      'programming-share-50': 'PDF pp. 25–26',
      'reasoning-share-50': 'PDF p. 19',
      'prompt-length-6k': 'PDF p. 23',
      'programming-20k': 'PDF p. 23',
      'reasoning-tokens-completion': 'PDF pp. 22–23',
      'reasoning-tokens-defined': 'PDF p. 6',
      'claude-programming-80': 'PDF p. 32',
      'roleplay-volume-49': 'PDF p. 49',
      'scope-limits-57': 'PDF p. 57',
      'cost-per-outcome-54': 'PDF p. 54',
      'median-cost-48': 'PDF p. 48',
      'multi-model-33': 'PDF p. 33',
      'quality-over-cost-54': 'PDF p. 54',
      'turnover-weeks-11': 'PDF pp. 11–12',
      'agentic-median-24': 'PDF p. 24',
      'jevons-54': 'PDF p. 54',
    },
  },

  // ─── McKinsey and the McKinsey Global Institute ─────────────────────
  'mckinsey-state-of-ai-2026': {
    id: 'mckinsey-state-of-ai-2026',
    shortLabel: 'McKinsey, 2026',
    authors: 'Tinkoff, D., Van der Veken, L., Chui, M., & Balakrishnan, T.',
    title: 'The state of AI in 2026: On the road to ROI',
    publisher: 'McKinsey & Company (QuantumBlack)',
    date: 'August 2026',
    url: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai',
    pages: {
      'individual-vs-enterprise': 'p. 14',
      'productivity-80': 'p. 3',
      'ebit-37': 'pp. 4, 12',
      'scaling-44': 'p. 5',
      'regular-use': 'p. 5',
      'functions-56': 'p. 5',
      'chatbot-scaling-47': 'p. 7',
      'agent-scaling-40': 'p. 3',
      'negative-effects-47': 'p. 11',
      'critical-thinking-20': 'p. 11',
      'career-anxiety-13': 'p. 29',
      'high-performers-6': 'pp. 3, 17',
      'workflow-redesign-74': 'p. 18',
      'measure-impact-2x': 'p. 19',
      'absorb-change': 'p. 24',
      'investment-60': 'p. 16',
      'operating-costs-20': 'pp. 3, 15',
      'tokenomics': 'p. 17',
      'build-not-buy-32': 'p. 9',
      'workforce-decline-14': 'p. 25',
      'cost-bands': 'p. 12',
      'risk-inaccuracy': 'p. 23',
    },
  },
  'mgi-agents-robots-us-2025': {
    id: 'mgi-agents-robots-us-2025',
    shortLabel: 'McKinsey Global Institute, 2025',
    authors:
      'Yee, L., Madgavkar, A., Smit, S., Krivkovich, A., Chui, M., Ramirez, M. J., & Castresana, D.',
    title: 'Agents, robots, and us: Skill partnerships in the age of AI',
    publisher: 'McKinsey Global Institute',
    date: 'November 2025',
    url: 'https://www.mckinsey.com/mgi/our-research/agents-robots-and-us-skill-partnerships-in-the-age-of-ai',
    pages: {
      'automatable-57': 'pp. 4, 12',
      'not-a-forecast': 'pp. 3–4',
      'agents-44-hours': 'p. 11',
      'midpoint-27': 'p. 37',
      'shared-skills-72': 'pp. 28–29',
      'frame-interpret': 'p. 4',
      'skills-partnership': 'p. 28',
      'sci-middle-quartiles': 'p. 33',
      'ai-fluency-7x': 'p. 25',
      'high-prevalence-skills': 'pp. 21, 30',
      'qa-demand': 'p. 27',
      'declining-mentions': 'p. 27',
      'radiology': 'p. 12',
      'orchestrators-validators': 'p. 42',
      'archetypes': 'p. 15',
      'workflow-redesign': 'pp. 35, 50',
      'cloud-lag': 'p. 7',
    },
  },
  'mgi-agents-robots-europe-2026': {
    id: 'mgi-agents-robots-europe-2026',
    shortLabel: 'McKinsey Global Institute, 2026',
    authors: 'Johansson, S., Madgavkar, A., Schrader, U., Ramírez, M. J., & Rigby, X.',
    title: 'Agents, robots, and us: How AI reshapes work and skills in Europe',
    publisher: 'McKinsey Global Institute',
    date: 'May 2026',
    url: 'https://www.mckinsey.com/mgi/our-research/agents-robots-and-us-how-ai-reshapes-work-and-skills-in-europe',
    pages: {
      'automatable-58': 'pp. 3, 6',
      'shared-skills-75': 'pp. 3, 20',
      'ai-fluency-5x': 'pp. 13, 22–23',
      'ai-fluency-definition': 'pp. 24, 31',
      'country-variation': 'pp. 13, 22, 58, 78',
      'domain-expertise': 'p. 24',
    },
  },

  // ─── OpenAI, MIT, and the capstone ──────────────────────────────────
  'chatterji-2026': {
    id: 'chatterji-2026',
    shortLabel: 'Chatterji et al., 2026',
    authors: 'Chatterji, A., Holtz, D., Rakholia, N., Tambe, P., & Weeratunga, G.',
    title: 'How Organizations Use AI: Evidence from ChatGPT',
    publisher:
      'OpenAI (working paper; co-authors at Columbia Business School and the Wharton School)',
    date: 'August 11, 2026',
    url: 'https://arxiv.org/abs/2608.12236',
    pages: {
      'token-growth-7x': 'p. 10',
      'survey-limits': 'p. 2',
      'automated-classification': 'pp. 7–8',
      'adopter-profile': 'pp. 11, 14',
      'firm-size-intensity': 'p. 14',
      'complements': 'pp. 15–16',
      'user-composition': 'p. 17',
      'seniority-gradient': 'p. 18',
      'volume-not-value': 'p. 18',
      'task-breadth': 'pp. 19–20',
      'non-uniform-use': 'p. 22',
      'adoption-not-deployment': 'p. 23',
      'within-firm-growth': 'pp. 3, 11',
      'telemetry-limits': 'pp. 22–23',
      'non-agentic-share': 'p. 10',
      'cohort-acceleration': 'p. 11',
    },
  },
  'mit-2026': {
    id: 'mit-2026',
    shortLabel: 'MIT Ad Hoc Committee, 2026',
    authors:
      'Ad Hoc Committee on AI Use in Teaching, Learning, and Research Training (Klopfer, E., & Madden, S., co-chairs)',
    title:
      "Report of MIT's Ad Hoc Committee on AI Use in Teaching, Learning, and Research Training",
    publisher: 'Massachusetts Institute of Technology',
    date: 'August 13, 2026',
    url: 'https://sites.mit.edu/ai-use/files/2026/08/AI-Committee-Final-Report-Aug-13.pdf',
    pages: {
      'shared-framework': 'p. 7',
      'policy-menu': 'pp. 29–30',
      'policy-rationale': 'p. 16',
      'policing-distrust': 'pp. 5, 17–18',
      'responsibility': 'p. 16',
      'instructor-disclosure': 'p. 20',
      'effective-use': 'p. 21',
      'thesis-statement': 'p. 22',
      'human-verifies': 'p. 22',
      'overreliance': 'p. 7',
      'deadline-offloading': 'p. 7',
      'no-generic-training': 'p. 24',
      'training-capture': 'pp. 25–26',
    },
  },
  'ritchot-2025': {
    id: 'ritchot-2025',
    shortLabel: 'Ritchot, 2025',
    authors: 'Ritchot, M.',
    title:
      'Token-Level Abstraction in Large Language Models: A Design-Based Inquiry into AI Comprehension Pathways',
    publisher: 'Western Governors University (unpublished master’s capstone)',
    date: 'June 20, 2025',
    url: 'https://ritchot.me/docs/capstone.pdf',
    pages: {
      'pre-post-means': 'pp. 2, 38',
      'sample': 'p. 36',
      'scenario-results': 'p. 38',
      'bias-controls': 'pp. 39–40',
      'quiz-distractors': 'p. 41',
      'playground-recommendation': 'p. 41',
      'limitations': 'p. 44',
      'design-principles': 'pp. 44–45',
      'predictable-errors': 'pp. 8, 37',
      'ai-literacy-definition': 'pp. 6–7',
    },
  },

  // ─── External sources for previously unsupported claims ─────────────
  'reuters-ubs-2023': {
    id: 'reuters-ubs-2023',
    shortLabel: 'Reuters, 2023',
    authors: 'Hu, K. (Reuters), reporting a UBS analyst note based on Similarweb data',
    title: 'ChatGPT sets record for fastest-growing user base - analyst note',
    publisher: 'Reuters',
    date: 'February 2, 2023',
    pages: {
      'chatgpt-100m': 'news report, paras. 1–2',
      'tiktok-instagram-comparison': 'news report, para. 4',
    },
  },
  'bick-blandin-deming-2024': {
    id: 'bick-blandin-deming-2024',
    shortLabel: 'Bick, Blandin & Deming, 2024',
    authors: 'Bick, A., Blandin, A., & Deming, D. J.',
    title: 'The Rapid Adoption of Generative AI',
    publisher: 'National Bureau of Economic Research, Working Paper 32966',
    date: 'September 2024 (revised February 2025)',
    pages: {
      'adoption-vs-pc-internet': 'abstract',
      'adoption-40-percent': 'abstract',
    },
  },
  'anthropic-models-2026': {
    id: 'anthropic-models-2026',
    shortLabel: 'Anthropic, 2026',
    authors: 'Anthropic',
    title: 'Models overview',
    publisher: 'Claude Platform Docs (platform.claude.com)',
    date: 'accessed September 4, 2026',
    pages: { 'context-window': 'Compare models table, Context window row' },
  },
  'openai-models-2026': {
    id: 'openai-models-2026',
    shortLabel: 'OpenAI, 2026',
    authors: 'OpenAI',
    title: 'Models: GPT-4.1 and GPT-6 Astra',
    publisher: 'OpenAI Developers, API documentation',
    date: 'accessed September 4, 2026',
    pages: { 'context-window': 'Model details' },
  },
  'google-gemini-models-2026': {
    id: 'google-gemini-models-2026',
    shortLabel: 'Google, 2026',
    authors: 'Google',
    title: 'Gemini 3.1 Pro preview',
    publisher: 'Google AI for Developers, Gemini API documentation',
    date: 'August 18, 2026 (page last updated)',
    pages: { 'input-token-limit': 'Token limits row' },
  },
  'qwen3-model-card-2025': {
    id: 'qwen3-model-card-2025',
    shortLabel: 'Qwen Team, 2025',
    authors: 'Qwen Team (Alibaba Cloud)',
    title: 'Qwen3-8B model card',
    publisher: 'Hugging Face',
    date: '2025 (accessed September 4, 2026)',
    pages: { 'context-length': 'Model Overview; Processing Long Texts' },
  },
  'hsieh-ruler-2024': {
    id: 'hsieh-ruler-2024',
    shortLabel: 'Hsieh et al., 2024',
    authors:
      'Hsieh, C.-P., Sun, S., Kriman, S., Acharya, S., Rekesh, D., Jia, F., Zhang, Y., & Ginsburg, B.',
    title: "RULER: What's the Real Context Size of Your Long-Context Language Models?",
    publisher: 'Conference on Language Modeling (COLM) 2024; arXiv:2404.06654',
    date: 'August 2024 (v3)',
    pages: {
      'half-at-32k': 'abstract',
      'effective-length': 'Table 3 (claimed vs. effective length)',
    },
  },
  'modarressi-nolima-2025': {
    id: 'modarressi-nolima-2025',
    shortLabel: 'Modarressi et al., 2025',
    authors:
      'Modarressi, A., Deilamsalehy, H., Dernoncourt, F., Bui, T., Rossi, R. A., Yoon, S., & Schütze, H.',
    title: 'NoLiMa: Long-Context Evaluation Beyond Literal Matching',
    publisher: 'International Conference on Machine Learning (ICML) 2025; arXiv:2502.05167',
    date: 'July 2025 (v3)',
    pages: {
      'drop-at-32k': 'abstract',
      'effective-length': 'Table 3 (effective length at 85% of base score)',
    },
  },
  'anthropic-context-windows-2026': {
    id: 'anthropic-context-windows-2026',
    shortLabel: 'Anthropic context-window docs, 2026',
    authors: 'Anthropic',
    title: 'Context windows',
    publisher: 'Claude Platform Docs (platform.claude.com)',
    date: 'accessed October 22, 2026',
    pages: {
      'overflow': 'section "Context window overflow behavior"',
      'rolling': 'section "How the context window works", footnote 1',
    },
    url: 'https://platform.claude.com/docs/en/build-with-claude/context-windows',
  },
  'anthropic-rag-projects-2026': {
    id: 'anthropic-rag-projects-2026',
    shortLabel: 'Anthropic Help Center, 2026',
    authors: 'Anthropic',
    title: 'Retrieval augmented generation (RAG) for projects',
    publisher: 'Claude Help Center (support.claude.com)',
    date: 'accessed October 22, 2026',
    pages: { 'search-mode': 'sections "What is RAG for projects?" and "How RAG works"' },
    url: 'https://support.claude.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects',
  },
  'anthropic-token-counting-2026': {
    id: 'anthropic-token-counting-2026',
    shortLabel: 'Anthropic token-counting docs, 2026',
    authors: 'Anthropic',
    title: 'Token counting',
    publisher: 'Claude Platform Docs (platform.claude.com)',
    date: 'accessed October 22, 2026',
    pages: { 'newer-tokenizer': 'section "Supported models", note on the newer tokenizer' },
    url: 'https://platform.claude.com/docs/en/build-with-claude/token-counting',
  },
  'anthropic-thinking-2026': {
    id: 'anthropic-thinking-2026',
    shortLabel: 'Anthropic thinking docs, 2026',
    authors: 'Anthropic',
    title: 'Thinking',
    publisher: 'Claude Platform Docs (platform.claude.com)',
    date: 'accessed October 22, 2026',
    pages: {
      'sampling-parameters':
        'section "Limits and feature compatibility", subsection "Sampling parameters"',
    },
    url: 'https://platform.claude.com/docs/en/build-with-claude/thinking',
  },
  'petrov-2023': {
    id: 'petrov-2023',
    shortLabel: 'Petrov et al., 2023',
    authors: 'Petrov, A., La Malfa, E., Torr, P. H. S., & Bibi, A.',
    title: 'Language Model Tokenizers Introduce Unfairness Between Languages',
    publisher:
      'Advances in Neural Information Processing Systems (NeurIPS) 2023; arXiv:2305.15425',
    date: '2023',
    pages: { 'up-to-15x': 'abstract' },
    url: 'https://arxiv.org/abs/2305.15425',
  },
  'gemma-team-2025': {
    id: 'gemma-team-2025',
    shortLabel: 'Gemma Team, 2025',
    authors: 'Gemma Team, Google DeepMind',
    title: 'Gemma 3 Technical Report',
    publisher: 'arXiv:2503.19786',
    date: 'March 2025',
    pages: {
      'split-digits': 'Section 2.2 (tokenizer shared with Gemini 2.0; split digits)',
    },
    url: 'https://arxiv.org/abs/2503.19786',
  },
  'sharma-2024': {
    id: 'sharma-2024',
    shortLabel: 'Sharma et al., 2024',
    authors:
      'Sharma, M., Tong, M., Korbak, T., Duvenaud, D., Askell, A., Bowman, S. R., et al.',
    title: 'Towards Understanding Sycophancy in Language Models',
    publisher:
      'International Conference on Learning Representations (ICLR) 2024; arXiv:2310.13548',
    date: 'May 2024',
    pages: { 'preference-data': 'abstract' },
    url: 'https://arxiv.org/abs/2310.13548',
  },
  'singhal-2024': {
    id: 'singhal-2024',
    shortLabel: 'Singhal et al., 2024',
    authors: 'Singhal, P., Goyal, T., Xu, J., & Durrett, G.',
    title: 'A Long Way to Go: Investigating Length Correlations in RLHF',
    publisher: 'Conference on Language Modeling (COLM) 2024; arXiv:2310.03716',
    date: '2024',
    pages: { 'length-bias': 'abstract' },
    url: 'https://arxiv.org/abs/2310.03716',
  },
  'openai-tiktoken': {
    id: 'openai-tiktoken',
    shortLabel: 'OpenAI tiktoken, 2026',
    authors: 'OpenAI',
    title:
      'tiktoken: README, tiktoken_ext/openai_public.py, and the Cookbook guide "How to count tokens with tiktoken"',
    publisher: 'GitHub (openai/tiktoken; openai/openai-cookbook)',
    date: 'accessed September 4, 2026',
    pages: {
      'vocab-sizes':
        'openai_public.py, special-token ids in cl100k_base() and o200k_base(); Encoding.n_vocab',
      'model-mapping': 'Cookbook, section "Encodings" table',
      'digit-grouping':
        'openai_public.py, pat_str for cl100k_base() and o200k_base() (digits matched in runs of one to three)',
    },
  },
  'zell-krizan-2014': {
    id: 'zell-krizan-2014',
    shortLabel: 'Zell & Krizan, 2014',
    authors: 'Zell, E., & Krizan, Z.',
    title: 'Do People Have Insight Into Their Abilities? A Metasynthesis',
    publisher: 'Perspectives on Psychological Science, 9(2), 111–125',
    date: 'March 2014',
    pages: {
      'mean-r-29': 'abstract (22 meta-analyses; mean r = .29, SD = .11)',
      'moderators': 'abstract',
    },
  },
  'kruger-dunning-1999': {
    id: 'kruger-dunning-1999',
    shortLabel: 'Kruger & Dunning, 1999',
    authors: 'Kruger, J., & Dunning, D.',
    title:
      "Unskilled and unaware of it: How difficulties in recognizing one's own incompetence lead to inflated self-assessments",
    publisher: 'Journal of Personality and Social Psychology, 77(6), 1121–1134',
    date: 'December 1999',
    pages: {
      'bottom-quartile': 'abstract (12th percentile actual, 62nd estimated)',
    },
  },
  'gignac-zajenkowski-2020': {
    id: 'gignac-zajenkowski-2020',
    shortLabel: 'Gignac & Zajenkowski, 2020',
    authors: 'Gignac, G. E., & Zajenkowski, M.',
    title:
      'The Dunning-Kruger effect is (mostly) a statistical artefact: Valid approaches to testing the hypothesis with individual differences data',
    publisher: 'Intelligence, 80, 101449',
    date: 'May 2020',
    pages: { 'artefact': 'abstract (N = 929)' },
  },
  'svenson-1981': {
    id: 'svenson-1981',
    shortLabel: 'Svenson, 1981',
    authors: 'Svenson, O.',
    title: 'Are we all less risky and more skillful than our fellow drivers?',
    publisher: 'Acta Psychologica, 47(2), 143–148',
    date: 'February 1981',
    pages: { 'above-median': 'p. 146 (93% US, 69% Sweden above the median for skill)' },
  },
  'barber-odean-2001': {
    id: 'barber-odean-2001',
    shortLabel: 'Barber & Odean, 2001',
    authors: 'Barber, B. M., & Odean, T.',
    title: 'Boys will be Boys: Gender, Overconfidence, and Common Stock Investment',
    publisher: 'Quarterly Journal of Economics, 116(1), 261–292',
    date: 'February 2001',
    pages: {
      'trading-returns':
        'abstract (men trade 45% more; net returns cut 2.65 vs 1.72 points)',
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
