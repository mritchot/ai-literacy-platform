// App — wraps the router with the two top-level contexts (architecture §5).

import { RouterProvider } from 'react-router-dom';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { LearnerProgressProvider } from './contexts/LearnerProgressContext';
import { router } from './router';

export default function App(): JSX.Element {
  return (
    <LearnerProgressProvider>
      <AnalyticsProvider>
        <RouterProvider router={router} />
      </AnalyticsProvider>
    </LearnerProgressProvider>
  );
}
