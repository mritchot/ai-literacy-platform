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
const AdminDashboard = lazy(() => import('./admin'));
const ThankYou = lazy(() => import('./pages/ThankYou'));

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

// Admin route guard. The admin dashboard is reachable only in portfolio
// or admin mode; in learner mode (the default) `/#/admin` redirects home
// so a learner can't stumble into the analytics dashboard. Portfolio vs.
// admin behavior (demo vs. live data default) is decided inside the
// dashboard itself via `usePlatformMode`.
function AdminRoute(): JSX.Element {
  const { mode } = usePlatformMode();
  if (mode === 'learner') return <Navigate to="/" replace />;
  return (
    <Suspense fallback={<RouteFallback />}>
      <AdminDashboard />
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
      { path: 'admin', element: <AdminRoute /> },
      { path: 'thank-you', element: lazyRoute(ThankYou) },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

export const router = createHashRouter(routes);
