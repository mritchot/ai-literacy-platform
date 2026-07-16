// Module 2 knowledge check items (KC-2.1 → KC-2.4). Stems and feedback
// taken verbatim from module-2-content-document.md S7. KC-2.2 includes an
// inline data table rendered as JSX inside the stem.

import type { KnowledgeCheckItemData } from '../../components/shared/KnowledgeCheck';

const KC_2_1: KnowledgeCheckItemData = {
  id: 'kc_2_1',
  objectiveRef: '2.1',
  stem: (
    <>
      <p className="m-0 mb-3">
        A product manager on your team describes her AI workflow to you: "I use AI as a thinking
        partner. Every morning I paste my meeting notes from the previous day into Claude and ask
        it to identify the three most important decisions that were made, draft follow-up action
        items for each, and write a summary I can send to stakeholders. Then I scan the summary,
        fix any names it gets wrong, and send it. I'd say this is a great example of augmentation:
        the notes come from me, and I'm reviewing everything before it goes out."
      </p>
      <p className="m-0">
        Based on the behavioral data and collaboration patterns from this module, which assessment
        is most accurate?
      </p>
    </>
  ),
  options: [
    {
      id: 'a',
      text: '"This is functionally automation classified as augmentation. She provides raw input, but the AI is performing the substantive analytical work: identifying what matters most, prioritizing decisions, structuring action items, and drafting stakeholder communication. Her review step checks for surface errors like name corrections, not for whether the AI\'s judgment about what\'s important matches her own. The behavioral data shows this pattern is common: professionals overestimate their augmentative use by 8 to 18 percentage points, often because providing input and performing surface review feels collaborative even when the core intellectual work has been delegated."',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This answer correctly identifies the gap between the product manager\'s self-assessment and her actual behavior, applies the behavioral data (8–18pp overestimation) as an explanatory frame rather than an accusation, and names the specific mechanism: surface review feels like quality control but isn\'t the same as evaluating the AI\'s analytical judgments. That is the core skill on display: comparing self-reported patterns against the behavioral evidence and identifying where they diverge.',
    },
    {
      id: 'b',
      text: '"She\'s right. This is augmentation. The intellectual contribution is hers: she attended the meetings, captured the notes, and reviews the output before it reaches stakeholders. The AI is handling the formatting and structural organization, which is mechanical work that doesn\'t require professional judgment. Her review step (checking names and scanning for errors) confirms she\'s maintaining quality control over the final deliverable. This is consistent with the task iteration pattern, where a professional provides substantive input and the AI assists with execution."',
      isPreferred: false,
      feedbackTitle: 'Misidentifies the substantive contribution',
      feedbackTone: 'error',
      feedbackText:
        'Attending meetings and taking notes is data collection, not the analytical work this task requires. The substantive intellectual contribution in a stakeholder summary is deciding which decisions matter most, what action items follow from them, and how to frame them for the audience. The AI is performing all three of those judgments. Providing raw material and checking names is not augmentation; it is automation with input provision.',
    },
    {
      id: 'c',
      text: '"This could be either augmentation or automation depending on factors the description doesn\'t fully capture. If she\'s carefully evaluating whether the AI identified the right decisions and drafted appropriate action items that reflect her professional judgment, then she\'s augmenting; the review step is where the substantive intellectual work happens. If she\'s scanning only for names and typos, it\'s automation with surface review. The distinction hinges entirely on the depth of her evaluation process. Without observing the actual review in detail, it\'s more accurate to withhold judgment than to assume the worst about her workflow."',
      isPreferred: false,
      feedbackTitle: 'Partially correct but incomplete',
      feedbackTone: 'caution',
      feedbackText:
        'The observation about review depth is accurate; the quality of the review step does matter. But this answer doesn\'t apply the behavioral data, and the scenario provides enough information to make an assessment. She describes her review as fixing names and scanning, not evaluating the AI\'s prioritization or editorial judgments. Treating the assessment as indeterminate despite available evidence is a form of over-caution that the module\'s framework addresses directly: the behavioral data shows the overestimation gap is systematic and directional, not ambiguous.',
    },
    {
      id: 'd',
      text: '"This is a well-designed directive interaction: she gives a complete, well-specified instruction and accepts a high-quality result. According to the data, about 28% of AI interactions follow this directive pattern, and it\'s the most efficient approach for routine recurring tasks like daily meeting summaries. The fact that she\'s developed a consistent, repeatable workflow means she\'s optimized her process for speed and reliability. Whether we label it augmentation or automation matters less than the fact that it produces a consistent output with minimal time investment each morning."',
      isPreferred: false,
      feedbackTitle: 'Correctly identifies the interaction pattern, draws the wrong conclusion',
      feedbackTone: 'caution',
      feedbackText:
        'The workflow is indeed directive: a complete instruction followed by surface-level acceptance. But efficiency is not the only relevant variable. The module\'s data shows that directive interactions are increasing and that professionals underestimate how often they use them. The question isn\'t whether the output is adequate today. It\'s whether she can evaluate when it isn\'t, given that her review doesn\'t examine the AI\'s analytical judgments. A workflow optimized exclusively for speed has traded away the evaluation step.',
    },
  ],
};

const KC_2_2: KnowledgeCheckItemData = {
  id: 'kc_2_2',
  objectiveRef: '2.2',
  stem: (
    <>
      <p className="m-0 mb-3">
        Your department head asks you to recommend which of four work activities should be
        prioritized for AI integration. She gives you this data from the productivity research:
      </p>
      {/*
        Force a fixed table layout with explicit column widths so the four
        rows render with identical column geometry regardless of viewport
        or how the descriptions wrap. With `auto` layout, the browser
        adjusts column widths based on content per row, which can cause
        subtle per-row alignment shifts (e.g., the Task B row appearing
        offset from A/C/D at certain widths). Fixed layout + percentage
        column widths + verticalAlign: top on every cell guarantees that
        all four "Task X" labels share the same x position and the same
        first-line baseline as their description, even when the
        description wraps to two lines.
      */}
      <table
        className="my-3 w-full border-collapse font-sans text-body-sm"
        style={{
          border: '1px solid rgb(var(--border))',
          tableLayout: 'fixed',
          lineHeight: 1.5,
        }}
      >
        <colgroup>
          <col style={{ width: '14%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '66%' }} />
        </colgroup>
        <thead style={{ background: 'rgb(var(--surface-warm))' }}>
          <tr>
            <th
              scope="col"
              style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid rgb(var(--border-light))' }}
              className="font-mono text-[11px] font-semibold uppercase text-tertiary"
            >
              Task
            </th>
            <th
              scope="col"
              style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid rgb(var(--border-light))' }}
              className="font-mono text-[11px] font-semibold uppercase text-tertiary"
            >
              Time savings
            </th>
            <th
              scope="col"
              style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid rgb(var(--border-light))' }}
              className="font-mono text-[11px] font-semibold uppercase text-tertiary"
            >
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {([
            ['Task A', '93%', 'Compiling bibliographies and source references for reports'],
            ['Task B', '80%', 'Interpreting financial data and investment trend analysis'],
            ['Task C', '87%', 'Preparing invoices, memos, letters, and financial documents'],
            ['Task D', '56%', 'Troubleshooting hardware and software problems'],
          ] as [string, string, string][]).map(([task, savings, desc], i) => (
            <tr key={task} style={{ borderBottom: i === 3 ? 'none' : '1px solid rgb(var(--border-light))' }}>
              <td
                // whiteSpace: nowrap protects against the Task label
                // wrapping to two lines if a viewport quirk ever shrinks
                // the column. verticalAlign: top anchors the label to the
                // first description line.
                style={{
                  padding: '10px 12px',
                  verticalAlign: 'top',
                  whiteSpace: 'nowrap',
                }}
                className="font-semibold text-ink"
              >
                {task}
              </td>
              <td
                style={{
                  padding: '10px 12px',
                  textAlign: 'right',
                  verticalAlign: 'top',
                  whiteSpace: 'nowrap',
                }}
                className="font-mono text-ink"
              >
                {savings}
              </td>
              <td
                style={{ padding: '10px 12px', verticalAlign: 'top' }}
                className="text-body"
              >
                {desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="m-0">
        She asks: "Which one should we deploy AI on first, the one with the highest time
        savings?" Which response best applies the module's framework?
      </p>
    </>
  ),
  options: [
    {
      id: 'a',
      text: '"Yes, start with Task A. It has the highest time savings at 93%, which means it delivers the most immediate and measurable productivity gain for the team. The faster we realize that efficiency, the sooner people can redirect saved time to higher-value work like analysis and strategy. We should sequence the remaining tasks in descending order of savings (C at 87%, then B at 80%, then D at 56%) so we capture the largest gains first and build organizational momentum around AI adoption before tackling the more marginal applications."',
      isPreferred: false,
      feedbackTitle: 'Optimizes for the wrong variable',
      feedbackTone: 'error',
      feedbackText:
        'Ranking by time savings alone ignores the module\'s central distinction: high-gain and high-risk are not always the same axis. Task A is the fastest to accelerate and the hardest to verify: the output looks correct on surface review, but errors require checking each source individually to detect. Deploying AI on this task first without a verification process risks embedding undetected errors in the team\'s output.',
    },
    {
      id: 'b',
      text: '"Start with Task D. It has the lowest time savings, which means it\'s the safest application to pilot: there\'s less organizational risk if the AI produces errors, and the team can develop verification skills in a low-stakes environment. Starting with a manageable, lower-impact use case lets us build internal confidence and document best practices before we scale to higher-savings tasks where mistakes carry greater consequences. This risk-graduated approach is standard change management methodology for technology adoption."',
      isPreferred: false,
      feedbackTitle: 'Wrong reasoning, counterproductive recommendation',
      feedbackTone: 'caution',
      feedbackText:
        'Starting with the lowest-savings task as a "safe pilot" misreads the risk picture. Task D\'s lower savings don\'t indicate lower risk; they indicate that AI adds less value for that task type because it involves physical-world troubleshooting that doesn\'t transfer well to text generation. The "build confidence" logic also runs backward: confidence should follow from competence in verification, not from exposure to low-stakes applications where the team doesn\'t learn the evaluation skills they\'ll need for Tasks A and B.',
    },
    {
      id: 'c',
      text: '"We should deploy AI across all four tasks simultaneously rather than sequencing them. The savings range from 56% to 93%, and even the lowest figure represents a substantial efficiency gain that the team shouldn\'t defer. Phased rollouts introduce unnecessary delay and create uneven adoption across the department: some people benefit immediately while others wait. The team can develop verification practices organically as they encounter each task type, and any errors caught early will become learning opportunities that strengthen the team\'s overall AI competency."',
      isPreferred: false,
      feedbackTitle: 'Ignores capacity and learning constraints',
      feedbackTone: 'error',
      feedbackText:
        'Simultaneous deployment across four task types with different risk profiles and different verification requirements overwhelms the team\'s ability to develop competent evaluation practices for any of them. "Learn organically" and "errors as learning opportunities" is the approach the module\'s data shows is already failing: professionals are using AI across task types without calibrated verification, producing the self-report/behavioral gap the module documents. Unstructured adoption replicates the problem rather than solving it.',
    },
    {
      id: 'd',
      text: '"It depends on the verification burden, not just the time savings. Task A saves 93% of the time, but it involves assembling references and citations, exactly the category where errors look correct on surface review and require checking every source individually to detect. Task C at 87% involves document preparation where format and content errors are more visible on review. I\'d recommend starting with Task C: high savings, but with errors that are easier to catch during normal quality checks. Task A should follow once we have a verification process in place specifically designed for source-level accuracy."',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This answer shows the analytical skill the section calls for: evaluating task-level productivity data along both the efficiency and risk dimensions simultaneously. It correctly identifies that Task A\'s high savings come with high verification burden (citation fabrication risk), recommends Task C as the better starting point because its error types are more visible, and specifies a condition for Task A deployment (a verification process for source accuracy). This is the Delegation-Discernment intersection the module teaches: choosing where to deploy AI based on both the gain and the evaluability of the output.',
    },
  ],
};

const KC_2_3: KnowledgeCheckItemData = {
  id: 'kc_2_3',
  objectiveRef: '2.3',
  stem: (
    <>
      <p className="m-0 mb-3">
        A colleague in your finance department shares her current AI usage with you. She uses AI
        extensively for two tasks: drafting client-facing investment summaries and generating
        first-draft quarterly earnings analyses. She does not use AI for two other tasks she spends
        significant time on: compiling data from multiple internal reports into consolidated
        summaries and preparing slide decks from existing content. She says: "I've got a good
        balance. I use AI where it matters most and keep the routine stuff manual."
      </p>
      <p className="m-0">
        Based on the productivity data from this module, which assessment is most accurate?
      </p>
    </>
  ),
  options: [
    {
      id: 'a',
      text: '"Her balance is right. Client summaries and earnings analyses are high-stakes deliverables where AI adds the most value because the time savings on complex analytical work are substantial. Compiling data and preparing slides are mechanical aggregation tasks where AI offers less differentiated value: the human time investment is mostly organizational rather than intellectual, and the output is internal-facing where formatting standards are lower. Her instinct to concentrate AI on the highest-impact deliverables reflects sound prioritization."',
      isPreferred: false,
      feedbackTitle: 'Inverts the productivity data',
      feedbackTone: 'error',
      feedbackText:
        'This is the intuitive read, and it\'s wrong. "Where it matters most" is not the same as "where AI saves the most time." Compiling data from multiple reports (the task she keeps manual) falls into the highest-savings category in the research (approximately 95%). Client-facing investment analysis (the task she delegates to AI) is where the verification burden is highest, because the outputs look authoritative on surface review and require domain expertise to confirm against the underlying data.',
    },
    {
      id: 'b',
      text: '"Her usage is partially inverted. Compiling information from reports is among the highest-savings task categories (around 95%), so manual work leaves substantial gains on the table. Meanwhile, her AI-drafted summaries and earnings analyses are the task types where output looks authoritative but is hardest to verify without domain-expert checking. She doesn\'t need to stop using AI there; she needs a more rigorous verification process for them, and she should consider adding AI to the compilation work, where the speed gain is enormous and the outputs are straightforwardly verifiable."',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This answer captures both dimensions of the augmentation-automation diagnosis: it identifies an underuse case (manual data compilation where productivity gains are highest and verification is relatively straightforward) and an overreliance case (AI-generated investment analysis where the verification burden is highest). Crucially, it does not recommend eliminating AI from the high-risk tasks; it recommends increasing oversight. This matches the module\'s framework: the augmentation-automation distinction is not about whether to use AI, but about how much human judgment to apply.',
    },
    {
      id: 'c',
      text: '"She should add AI to all four tasks to maximize her total productivity. The data shows time savings above 60% across virtually every occupation category, and even routine compilation and slide preparation would benefit from acceleration. There\'s no reason to keep any task fully manual when the tools are available. Selective AI usage means she\'s capturing only a fraction of the available efficiency gains, and the tasks she keeps manual are consuming time that could be redirected to strategic work or client relationship building."',
      isPreferred: false,
      feedbackTitle: 'Ignores the verification dimension entirely',
      feedbackTone: 'error',
      feedbackText:
        'Maximizing AI usage across all tasks treats productivity as the only relevant variable. The module\'s data shows that the gap between in-conversation time savings (81%) and full-cycle productivity gains (14–56% in controlled trials) is verification and refinement time. Adding AI to every task without calibrating oversight to risk produces speed, not quality. The recommendation to redirect time savings to "strategic work" assumes the AI output is reliable enough to stop reviewing, exactly the assumption the behavioral data contradicts.',
    },
    {
      id: 'd',
      text: '"She should stop using AI for the investment summaries and earnings analyses entirely and redirect that usage to the compilation and slide preparation tasks instead. Client-facing financial deliverables are high-stakes documents where even small errors can damage client relationships and create regulatory exposure. The risk-reward calculation doesn\'t support AI-generating content that carries this level of professional and reputational consequence. AI should be confined to low-stakes, internal-facing work where errors have limited downstream impact and the verification standard is lower."',
      isPreferred: false,
      feedbackTitle: 'Overcorrects',
      feedbackTone: 'caution',
      feedbackText:
        'Removing AI from high-stakes tasks eliminates both the risk and the productivity gain. The module\'s framework does not sort tasks into "use AI" and "don\'t use AI." It positions each task on a spectrum where the appropriate level of human oversight varies by the verifiability of the output and the consequences of error. Investment analysis can benefit from AI assistance if the verification process matches the risk profile. Confining AI to low-stakes work wastes its highest-value applications while building competency only in contexts where evaluation skills are least needed.',
    },
  ],
};

const KC_2_4: KnowledgeCheckItemData = {
  id: 'kc_2_4',
  objectiveRef: '2.4',
  stem: (
    <>
      <p className="m-0 mb-3">
        Your HR director is reviewing the results of an internal survey on AI usage across the
        company. The survey found that 72% of respondents describe their AI use as "collaborative:
        I work with AI to improve my thinking and output." She presents this as evidence that the
        company's AI adoption is healthy: "Our people aren't just dumping tasks on AI; they're
        genuinely collaborating with it. The training investment is working."
      </p>
      <p className="m-0">You've just completed this module. How do you respond?</p>
    </>
  ),
  options: [
    {
      id: 'a',
      text: '"That\'s encouraging data, and it\'s stronger than external benchmarks. External research found that 65% of professionals describe their AI use as augmentative, so our 72% collaborative rate suggests our team is ahead of the curve, potentially because the training investment gave them a better framework for genuine collaboration. The survey result validates the current approach, and I\'d recommend we share these results with leadership as evidence that the program is working and that further investment in the same direction is justified."',
      isPreferred: false,
      feedbackTitle: 'Compounds the overestimation',
      feedbackTone: 'error',
      feedbackText:
        'Comparing an internal self-report figure favorably against external self-report data doubles down on a measurement approach the research has documented as systematically biased. The 65% external figure is itself an overestimate; behavioral data shows actual augmentative use at 47–57% depending on the measurement period. A higher internal self-report doesn\'t indicate better practice; it may indicate a larger gap. Using biased data to validate the program that produced it creates a circular justification.',
    },
    {
      id: 'b',
      text: '"Self-report data on AI use is unreliable, and we shouldn\'t base conclusions on it. The research shows that professionals systematically misrepresent their AI usage, partly because of the social stigma documented in the literature, and partly because people genuinely can\'t distinguish between collaboration and delegation in their own workflows. We need to move away from survey-based measurement entirely and implement direct monitoring of AI usage patterns through interaction logs, API tracking, and output auditing. That\'s the only way to get an accurate picture of how the team is actually working with these tools."',
      isPreferred: false,
      feedbackTitle: 'Overcorrects and mischaracterizes',
      feedbackTone: 'caution',
      feedbackText:
        'The research does not show that professionals "systematically misrepresent" their AI usage; the term implies intentional deception. The self-report/behavioral gap is a calibration error, the same kind of overestimation that appears across self-assessments of any complex behavior. Dismissing all self-report data as unreliable loses a useful signal (what people believe about their practice), and the recommendation to implement direct monitoring through interaction logs and output auditing raises significant privacy, trust, and labor relations concerns that the response ignores entirely.',
    },
    {
      id: 'c',
      text: '"The survey is a useful data point, but external research shows a consistent pattern: professionals overestimate how collaboratively they use AI. When researchers compared self-reports against behavioral data from actual conversations, the gap ranged from 8 to 18 percentage points. And the share of directive interactions (give a task, accept the result) has been rising over time and constitutes roughly a third of all AI interactions. Our 72% collaborative self-report may reflect the same overestimation pattern. Before calling adoption healthy, we\'d want behavioral indicators, not just self-description."',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This answer covers all four components that matter here: it identifies the self-report/behavioral divergence (8–18pp), names the directive interaction pattern as a specific observable indicator, explains why the gap matters (the difference between perceived and actual collaboration affects output quality), and offers a constructive next step (look at behavioral indicators, not just survey data). It engages with the HR director\'s conclusion respectfully while providing the evidence base to challenge it. This is Discernment applied to organizational data.',
    },
    {
      id: 'd',
      text: '"The 72% collaborative figure is probably overstated based on the research, but it\'s not a particularly important metric for management purposes. What matters operationally is whether the outputs are good: if the team is producing quality work with AI assistance and clients are satisfied, the specific interaction pattern is a research distinction without practical consequences. I\'d recommend we focus our measurement on output quality metrics and client satisfaction scores rather than trying to categorize how people interact with their tools. Results matter more than process."',
      isPreferred: false,
      feedbackTitle: 'Misses the mechanism',
      feedbackTone: 'error',
      feedbackText:
        'Output quality is the right ultimate concern, but the module\'s data shows precisely why interaction patterns matter for quality. Directive interactions, which constitute roughly a third of all AI usage and have been rising, produce output that receives less human evaluation before deployment. The gap between self-reported collaboration and actual behavior means that quality problems are less visible to the people producing them, not less frequent. Treating the interaction pattern as a distinction without practical consequences disconnects the measurement from the thing being measured.',
    },
  ],
};

export const MODULE_2_KC_ITEMS: KnowledgeCheckItemData[] = [KC_2_1, KC_2_2, KC_2_3, KC_2_4];
