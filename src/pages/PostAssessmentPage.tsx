// PostAssessmentPage — thin route wrapper. Lazy-loaded by router.tsx
// alongside its pre counterpart so the comparative-results view (which
// imports both item banks) only loads when the learner reaches the
// end of the program.

import { AssessmentPage } from '../components/assessment/AssessmentPage';

export default function PostAssessmentPage(): JSX.Element {
  return <AssessmentPage kind="post" />;
}
