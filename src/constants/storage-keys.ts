// Single source of truth for the platform's localStorage keys. The key
// STRINGS are frozen (deployed learners' progress lives under them) —
// this module exists so no consumer re-types them as ad-hoc literals
// (the dashboard's Reset previously hardcoded two of them independently
// of the contexts that own the stores).

export const STORAGE_KEYS = {
  /** Learner progress — LearnerProgressContext. FROZEN. */
  PROGRESS: 'ail.progress',
  /** Analytics event log — AnalyticsContext. FROZEN. */
  ANALYTICS: 'ail.analytics',
  /** Sidebar collapse preference — PlatformShell. */
  SIDEBAR_COLLAPSED: 'ail.sidebar-collapsed',
  /** Theme preference — useTheme (value is JSON-encoded). */
  THEME: 'ail.theme',
  /** Platform mode — usePlatformMode ('learner' is the absent-key default). */
  PLATFORM_MODE: 'platform-mode',
  /** Citation visibility — useCitations. */
  CITATIONS: 'citation-visibility',
} as const;
