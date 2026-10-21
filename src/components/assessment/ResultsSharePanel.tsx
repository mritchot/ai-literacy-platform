// ResultsSharePanel — gives the learner a results code to paste into
// their organization's own Level 1 survey, plus a JSON file with the
// same assessment fields. This is how cohort-level Level 2 data reaches
// an organization while every response stays on the learner's device:
// the learner decides whether to share, and nothing is sent from here.
//
// Rendered at the foot of AssessmentResults, so it appears on the
// standalone results screen and in the competency profile.

import { useId, useState } from 'react';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { PRE_ASSESSMENT_ITEMS } from '../../data/pre-assessment';
import { POST_ASSESSMENT_ITEMS } from '../../data/post-assessment';
import {
  answerLetters,
  exportRows,
  formVersion,
  formatResultsCode,
  medianSeconds,
  responseTimesMs,
  sanitizeParticipantCode,
  type ResultsExport,
} from '../../utils/assessment-results-code';
import { downloadFile, localDateStamp } from '../../utils/download-file';
import { Icon } from '../shared/Icon';
import { Overline } from '../shared/Overline';

const PRE_IDS = PRE_ASSESSMENT_ITEMS.map((it) => it.id);
const POST_IDS = POST_ASSESSMENT_ITEMS.map((it) => it.id);

const BUTTON_CLASS =
  'inline-flex items-center gap-2 font-sans text-[13px] font-semibold text-ink hover:bg-[rgb(var(--surface))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

export function ResultsSharePanel(): JSX.Element {
  const { getAssessmentResponses } = useLearnerProgress();
  const preResponses = getAssessmentResponses('pre');
  const postResponses = getAssessmentResponses('post');
  const [participantInput, setParticipantInput] = useState('');
  const [status, setStatus] = useState('');
  const headingId = useId();
  const inputId = useId();
  const inputHelpId = useId();
  const codeId = useId();

  const participantCode = sanitizeParticipantCode(participantInput);
  const preVersion = formVersion(preResponses);
  const postVersion = formVersion(postResponses);
  const code = formatResultsCode({
    preVersion,
    postVersion,
    preAnswers: answerLetters(PRE_IDS, preResponses),
    postAnswers: answerLetters(POST_IDS, postResponses),
    preMedianSeconds: medianSeconds(responseTimesMs(preResponses)),
    postMedianSeconds: medianSeconds(responseTimesMs(postResponses)),
    participantCode,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setStatus('Results code copied.');
    } catch {
      setStatus('Copy did not work in this browser. Select the code and copy it by hand.');
    }
  };

  const handleDownload = () => {
    const payload: ResultsExport = {
      format: 'ai-literacy-assessment-results',
      resultsCode: code,
      participantCode,
      instrumentVersion: { pre: preVersion, post: postVersion },
      pre: exportRows(PRE_ASSESSMENT_ITEMS, preResponses),
      post: exportRows(POST_ASSESSMENT_ITEMS, postResponses),
    };
    downloadFile(
      `assessment-results-${localDateStamp()}.json`,
      JSON.stringify(payload, null, 2),
      'application/json',
    );
    setStatus('Results file downloaded.');
  };

  return (
    <section
      aria-labelledby={headingId}
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        padding: '18px 22px',
      }}
    >
      <h2 id={headingId} className="m-0">
        <Overline as="span" className="mb-2">
          Share your results with your organization
        </Overline>
      </h2>
      <p className="m-0 mb-4 max-w-reading font-sans text-body-sm text-body" style={{ lineHeight: 1.55 }}>
        If your organization asks for your results, copy this code into its survey. The code
        holds your answer letters, the question-set version, and your typical time per question.
        It holds no name, and nothing is sent from this page.
      </p>

      <label htmlFor={inputId} className="mb-1 block font-sans text-[12.5px] font-semibold text-ink">
        Participant code (optional)
      </label>
      <input
        id={inputId}
        type="text"
        value={participantInput}
        onChange={(e) => setParticipantInput(e.target.value)}
        aria-describedby={inputHelpId}
        autoComplete="off"
        spellCheck={false}
        className="w-full max-w-[280px] bg-[rgb(var(--white))] px-3 py-2 font-mono text-[13px] text-ink"
        style={{ border: '1px solid rgb(var(--border))' }}
      />
      <p id={inputHelpId} className="m-0 mt-1 mb-4 font-sans text-[12px] text-tertiary">
        Use the code your organization gave you, not your name. Letters, digits, hyphens, and
        underscores only.
      </p>

      <label htmlFor={codeId} className="mb-1 block font-sans text-[12.5px] font-semibold text-ink">
        Your results code
      </label>
      <textarea
        id={codeId}
        readOnly
        rows={2}
        value={code}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full resize-none bg-[rgb(var(--surface))] px-3 py-2 font-mono text-[12px] text-ink"
        style={{ border: '1px solid rgb(var(--border-light))', overflowWrap: 'anywhere' }}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void handleCopy()}
          className={BUTTON_CLASS}
          style={{
            padding: '8px 14px',
            background: 'rgb(var(--surface))',
            border: '1px solid rgb(var(--border))',
          }}
        >
          <Icon name="check" size={14} />
          Copy code
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className={BUTTON_CLASS}
          style={{
            padding: '8px 14px',
            background: 'rgb(var(--surface))',
            border: '1px solid rgb(var(--border))',
          }}
        >
          <Icon name="download" size={14} />
          Download as JSON
        </button>
        <span aria-live="polite" className="font-sans text-[12px] text-secondary">
          {status}
        </span>
      </div>
    </section>
  );
}
