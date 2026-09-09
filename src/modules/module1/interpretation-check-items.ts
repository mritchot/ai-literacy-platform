// Module 1 P1 interpretation check items (IC-1.1 → IC-1.3) — content from
// `module-1-content-document.md`, S3 (one IC per story).

import type { InterpretationCheckItemData } from '../../components/shared/InterpretationCheck';

const IC_1_1: InterpretationCheckItemData = {
  id: 'ic_1_1',
  stem:
    'Your organization is planning its 2026 workforce development budget. A VP asks whether AI literacy training should be prioritized or deferred until the technology stabilizes. Based on the data you’ve just reviewed, which response is best supported by the evidence?',
  options: [
    {
      id: 'a',
      text: '“We should wait. The data shows that the share of skills expected to change is declining, from 57% in 2020 to 39% today. The urgency is decreasing.”',
      isPreferred: false,
      feedbackTitle: 'Partially correct, but misleading',
      feedbackTone: 'caution',
      feedbackText:
        'The skill instability rate is declining, but this doesn’t reduce the urgency. It means the target is becoming clearer, not smaller. AI literacy has moved from a broad “future skill” category to the single most demanded competency. Job-posting data agree: demand for AI fluency grew nearly sevenfold in two years. The analysts who track it class AI fluency as a skill that keeps changing in application rather than fading. A declining instability rate with a rising specific demand means the window for preparation is narrowing, not expanding.',
    },
    {
      id: 'b',
      text: '“We should prioritize it. AI literacy is the fastest-growing skill demand, and the majority of employers identify skill gaps as the primary barrier to transformation. Deferral widens the gap.”',
      isPreferred: true,
      feedbackTitle: 'Strongest response',
      feedbackTone: 'success',
      feedbackText:
        'This answer correctly connects two findings: the demand signal (AI literacy ranked #1) and the barrier signal (skills gaps as the primary transformation obstacle). It also identifies the consequence of inaction: deferral doesn’t pause the gap, it widens it as competitors invest.',
    },
    {
      id: 'c',
      text: '“We should deprioritize it. 85% of employers plan to upskill, so the market will solve this through competition. We can follow rather than lead.”',
      isPreferred: false,
      feedbackTitle: 'Flawed reasoning',
      feedbackTone: 'error',
      feedbackText:
        'The 85% planning figure describes intent, not execution. The same report shows that the skill gap remains the largest cited barrier, meaning most organizations intend to upskill but have not yet succeeded. Following the market assumes someone else has solved the problem. The data suggests otherwise. Executive surveys show the same gap in a different population. In September 2025, about a quarter of CIOs had put an LLM project into production. About 40% planned none before 2026 or later (Morgan Stanley CIO Survey, as reproduced by Evans, November 2025, slide 57). Plans are cheap. Deployment and skill are not.',
    },
    {
      id: 'd',
      text: '“We should wait. The WEF data is based on employer expectations, not actual outcomes. Projections aren’t reliable enough to justify budget allocation.”',
      isPreferred: false,
      feedbackTitle: 'Legitimate concern, wrong conclusion',
      feedbackTone: 'caution',
      feedbackText:
        'Skepticism about projections is reasonable, and it is worth knowing what the survey is: 1,043 responses from C-suite officers at firms with 500 or more employees, reporting intentions for 2025–2030. That is expectation, not outcome, and it excludes small firms. However, this data does not stand alone. It converges with task-level adoption data (which you’ll explore in Module 2), with job-posting data on skill demand, and with documented productivity gains. The WEF survey captures employer intent and barrier perception; behavioral data from other sources shows the same direction.',
    },
  ],
};

const IC_1_2: InterpretationCheckItemData = {
  id: 'ic_1_2',
  stem:
    'A colleague reviewing this data says: “The adoption gap is mostly about access. Countries with lower GDP just don’t have the infrastructure yet. Once the technology is more accessible, adoption will equalize.” Based on the data, how would you evaluate this claim?',
  options: [
    {
      id: 'a',
      text: '“That’s essentially correct. Income and infrastructure are the primary drivers. The data shows a clear correlation between GDP and AI usage.”',
      isPreferred: false,
      feedbackTitle: 'Oversimplified',
      feedbackTone: 'caution',
      feedbackText:
        'GDP does correlate with adoption: a 1% increase in GDP per capita is associated with a 0.7% increase in AI usage per capita across countries, and the November 2025 wave reproduced that 0.7 elasticity. Income explains about 70% of cross-country variation, so the remaining 30% comes from other factors. Within the United States, income explains less than half of the variation across states. Access matters, but it is not sufficient.',
    },
    {
      id: 'b',
      text: '“It’s partially right, but incomplete. GDP correlates with adoption and explains most of the cross-country variation, but not all of it. Digital infrastructure, regulatory environment, awareness and access, and trust in the tools account for the rest.”',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This answer captures the nuance: income is a factor, but not the dominant one. The data shows that countries with similar GDP levels can have very different adoption rates, pointing to institutional and contextual factors that access alone doesn’t address: digital infrastructure, economic structure, regulatory environment, awareness and access, and trust and comfort with the tools. For your own organization, this means providing AI tools is necessary but not sufficient for adoption.',
    },
    {
      id: 'c',
      text: '“It’s wrong. The data shows no correlation between GDP and adoption. The gap is entirely about cultural differences.”',
      isPreferred: false,
      feedbackTitle: 'Incorrect',
      feedbackTone: 'error',
      feedbackText:
        'The data does show a positive GDP–adoption correlation (0.7 elasticity globally, 1.8 within US states). Dismissing the economic factor entirely contradicts the evidence.',
    },
    {
      id: 'd',
      text: '“It’s impossible to tell from this data. Country-level usage rates don’t tell us anything about why adoption varies.”',
      isPreferred: false,
      feedbackTitle: 'Overly cautious',
      feedbackTone: 'caution',
      feedbackText:
        'While no single dataset answers causal questions definitively, the combination of country-level adoption rates, enterprise data, and use case diversification patterns provides a substantive evidence base. The question is not whether we can draw conclusions, but which conclusions the data supports and which it doesn’t.',
    },
  ],
};

const IC_1_3: InterpretationCheckItemData = {
  id: 'ic_1_3',
  stem:
    'Looking at the augmentation–automation trend, which interpretation is best supported by the data?',
  options: [
    {
      id: 'a',
      text: '“The overall trajectory clearly favors automation. The November reversal likely reflects seasonal variation. The underlying direction is toward greater delegation as people grow more comfortable with AI tools.”',
      isPreferred: false,
      feedbackTitle: 'Plausible framing, wrong conclusion',
      feedbackTone: 'caution',
      feedbackText:
        'Invoking seasonal variation sounds analytical, but the claim is ad hoc. The data provides no basis for attributing the November shift to seasonality rather than other factors. The report itself offers a different explanation: product changes such as file creation, persistent memory, and workflow skills may have pushed usage back toward collaboration. More importantly, even if the August peak was the real ceiling, the November automation share (45%) was only modestly above January (41% when the same classifier re-scored the January data; the original study reported 43%). The trajectory is real but not as decisive as this framing suggests, and "comfort" is not the only variable shaping the balance. Organizational context, task type, and judgment skill all contribute.',
    },
    {
      id: 'b',
      text: '“Three measurement waves over twelve months gives us a direction but not enough resolution to distinguish a real behavioral shift from normal variation in how people use these tools. We’d need significantly more data before drawing workforce planning conclusions.”',
      isPreferred: false,
      feedbackTitle: 'Reasonable caution, wrong threshold',
      feedbackTone: 'caution',
      feedbackText:
        'Methodological caution is appropriate, and three time points is genuinely limited. However, each wave analyzes a random sample of one million conversations (Handa et al., 2025; Appel, McCrory & Tamkin, 2025; Appel, Massenkoff & McCrory, 2026). The sample sizes are not small, and the magnitude of the shifts (11 to 12 percentage points for directive interactions between January and August, depending on rounding of the January figure) substantially exceeds what random variation would produce. The correct response is cautious interpretation, not suspension of judgment. Waiting for "significantly more data" before acting is itself a workforce planning decision, one that this data suggests would widen existing capability gaps.',
    },
    {
      id: 'c',
      text: '“The overall trajectory favors greater automation, but the pattern isn’t linear. The August spike was partially a temporary overshoot. How people interact with AI is still evolving, and the direction depends on factors beyond individual preference.”',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This answer acknowledges the directional trend (greater automation over the full period), recognizes the non-linearity (the August spike and November correction), and correctly identifies that the outcome depends on systemic factors, including tool capabilities, organizational norms, and the judgment skills of the people using the tools. The last factor is where this program focuses. Two further cautions apply. The report reads the August spike as overstating the pace of automation. And about four points of the August rise are classifier-dependent: re-running the August data with the earlier classifier gave 45% automation instead of 49%.',
    },
    {
      id: 'd',
      text: '“Augmentation recovered its dominant position by November, which suggests the August automation spike was a correction that didn’t hold. The stable equilibrium is collaborative use: people default to working with AI rather than handing tasks off entirely.”',
      isPreferred: false,
      feedbackTitle: 'Selective reading',
      feedbackTone: 'caution',
      feedbackText:
        'Augmentation did recover dominance by November, so this answer gets the endpoint right. But it draws the wrong inference by treating the recovery as a return to baseline. November\'s automation share (45%) was higher than January\'s (41% on a like-for-like re-scoring; 43% in the original study); the equilibrium shifted, even if augmentation remains the larger category. Calling collaborative use the "stable equilibrium" understates how much the balance depends on evolving factors: tool capabilities, organizational norms, and the judgment skills of the people using the tools.',
    },
  ],
};

export const MODULE_1_IC_ITEMS: InterpretationCheckItemData[] = [IC_1_1, IC_1_2, IC_1_3];

export const MODULE_1_DEBRIEFS: Record<string, string> = {
  ic_1_1:
    'The demand signal is clear, but so is the gap between recognizing AI as a priority and closing the competency deficit. The next story looks at where adoption is happening, and where it isn’t.',
  ic_1_2:
    'Access is necessary but not sufficient. The January 2026 Economic Index report reaches the same conclusion: expanding access alone will not suffice, because the skills needed to use AI well are themselves unevenly distributed, and higher-usage countries use AI more collaboratively rather than delegating more (Appel, Massenkoff & McCrory, 2026, p. 6). The gap between having AI tools and using them productively is shaped by institutional context, including, as the enterprise data shows, whether organizations create the conditions for visible, supported use. Vendor-side usage records point the same way: buying the tool is the start of deployment, not the end (Chatterji et al., 2026). The final story looks at how usage is changing over time.',
  ic_1_3:
    'Where you sit on the augmentation–automation spectrum isn’t fixed. It’s shaped by how you think about each task, what judgment you apply, and whether your organization has the vocabulary to discuss the difference. That’s the focus of the rest of this program, starting with a finding you may recognize from your own experience.',
};
