// PreAssessmentPage — thin route wrapper. Lazy-loaded by router.tsx so
// the assessment JSON payload (10 items × 4 options × consequence
// feedback text) isn't pulled into the initial bundle for visitors
// who never start the assessment flow.

import { AssessmentPage } from '../components/assessment/AssessmentPage';

export default function PreAssessmentPage(): JSX.Element {
  return <AssessmentPage kind="pre" />;
}
