// Route definitions — HashRouter with module routes lazy-loaded so each
// module's bundle (especially Module 2's Recharts payload) is only fetched
// when the learner navigates to it (architecture Section 9a).

import { lazy, Suspense } from 'react';
import { createHashRouter, Navigate, type RouteObject } from 'react-router-dom';
import { LandingPage } from './components/shared/LandingPage';
import { PlatformShell } from './components/shared/PlatformShell';
import { usePlatformMode } from './hooks/usePlatformMode';

const Module1 = lazy(() => import('./modules/module1'));
const Module2 = lazy(() => import('./modules/module2'));
const Module3 = lazy(() => import('./modules/module3'));
const Module4 = lazy(() => import('./modules/module4'));
const AnalyticsDashboard = lazy(() => import('./dashboard'));
const ThankYou = lazy(() => import('./pages/ThankYou'));
// Pre/Post assessment routes are lazy-loaded — their payload (10
// items × 4 options × consequence feedback + the comparative results
// view) only enters the bundle when the learner reaches the
// assessment flow.
const PreAssessment = lazy(() => import('./pages/PreAssessmentPage'));
const PostAssessment = lazy(() => import('./pages/PostAssessmentPage'));
// Needs-analysis artifact pages — standalone public portfolio documents
// (hub + three reading pages + the interactive action map), lazy-loaded
// like the other standalone pages. Reachable in every platform mode; not
// part of the learner module sequence and not mode-gated.
const NeedsAnalysisHub = lazy(() => import('./pages/needs-analysis/NeedsAnalysisHub'));
const ProblemStatement = lazy(() => import('./pages/needs-analysis/ProblemStatement'));
const CapabilityGap = lazy(() => import('./pages/needs-analysis/CapabilityGap'));
const LearnerPersona = lazy(() => import('./pages/needs-analysis/LearnerPersona'));
const ActionMap = lazy(() => import('./pages/needs-analysis/ActionMap'));
// Evaluation-framework artifact pages — standalone public portfolio documents
// (hub + four Kirkpatrick-level reading pages), mirroring the needs-analysis
// series. Reachable in every platform mode; not part of the learner sequence.
const EvaluationHub = lazy(() => import('./pages/evaluation/EvaluationHub'));
const Level1Reaction = lazy(() => import('./pages/evaluation/Level1Reaction'));
const Level2Learning = lazy(() => import('./pages/evaluation/Level2Learning'));
const Level3Behavior = lazy(() => import('./pages/evaluation/Level3Behavior'));
const Level4Results = lazy(() => import('./pages/evaluation/Level4Results'));

// Suspense fallback for lazy routes. Note: the production build inlines
// every lazy chunk via vite-plugin-singlefile, so this effectively never
// renders in the shipped artifact — the dynamic import resolves against
// already-loaded JS. It only shows during `npm run dev`. Padding matches
// SectionContainer's `py-12` so the dev-mode flash sits where the real
// content will appear.
function RouteFallback(): JSX.Element {
  return (
    <div
      className="mx-auto max-w-reading px-4 py-12 font-mono text-[11px] uppercase text-tertiary sm:px-8 lg:px-16"
      style={{ letterSpacing: '0.1em' }}
      aria-live="polite"
    >
      Loading…
    </div>
  );
}

function lazyRoute(Component: React.LazyExoticComponent<React.ComponentType>): JSX.Element {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Component />
    </Suspense>
  );
}

// Dashboard route guard. The analytics dashboard is reachable only in
// portfolio mode; in learner mode (the default) `/#/admin` redirects home
// so a learner can't stumble into the analytics dashboard.
function DashboardRoute(): JSX.Element {
  const { mode } = usePlatformMode();
  if (mode === 'learner') return <Navigate to="/" replace />;
  return (
    <Suspense fallback={<RouteFallback />}>
      <AnalyticsDashboard />
    </Suspense>
  );
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: <PlatformShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'module/1', element: lazyRoute(Module1) },
      { path: 'module/1/section/:sectionId', element: lazyRoute(Module1) },
      { path: 'module/2', element: lazyRoute(Module2) },
      { path: 'module/2/section/:sectionId', element: lazyRoute(Module2) },
      { path: 'module/3', element: lazyRoute(Module3) },
      { path: 'module/3/section/:sectionId', element: lazyRoute(Module3) },
      { path: 'module/4', element: lazyRoute(Module4) },
      { path: 'module/4/section/:sectionId', element: lazyRoute(Module4) },
      // Path kept as 'admin' for existing external links/bookmarks; the
      // dashboard itself is mode-gated by DashboardRoute.
      { path: 'admin', element: <DashboardRoute /> },
      { path: 'thank-you', element: lazyRoute(ThankYou) },
      { path: 'pre-assessment', element: lazyRoute(PreAssessment) },
      { path: 'post-assessment', element: lazyRoute(PostAssessment) },
      { path: 'needs-analysis', element: lazyRoute(NeedsAnalysisHub) },
      { path: 'needs-analysis/problem-statement', element: lazyRoute(ProblemStatement) },
      { path: 'needs-analysis/capability-gap', element: lazyRoute(CapabilityGap) },
      { path: 'needs-analysis/learner-persona', element: lazyRoute(LearnerPersona) },
      { path: 'needs-analysis/action-map', element: lazyRoute(ActionMap) },
      { path: 'evaluation', element: lazyRoute(EvaluationHub) },
      { path: 'evaluation/level-1-reaction', element: lazyRoute(Level1Reaction) },
      { path: 'evaluation/level-2-learning', element: lazyRoute(Level2Learning) },
      { path: 'evaluation/level-3-behavior', element: lazyRoute(Level3Behavior) },
      { path: 'evaluation/level-4-results', element: lazyRoute(Level4Results) },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

export const router = createHashRouter(routes);
