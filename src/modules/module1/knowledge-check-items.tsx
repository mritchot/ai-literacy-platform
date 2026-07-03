// Module 1 S7 knowledge check items (KC-1.1 → KC-1.4) — content from
// `module-1-content-document.md`, S7.

import type { KnowledgeCheckItemData } from '../../components/shared/KnowledgeCheck';

const KC_1_1: KnowledgeCheckItemData = {
  id: 'kc_1_1',
  objectiveRef: '1.1',
  stem: (
    <>
      <p className="m-0">
        You manage an operations team at a mid-sized company in Southeast Asia. Your region has
        high AI adoption rates relative to its population, and your team already uses AI tools for
        routine reporting tasks. A peer in your company’s Latin America office, in a region with
        lower adoption rates, asks you to share your team’s AI workflows so they can replicate
        them. Based on what you’ve learned about geographic adoption patterns, which response
        reflects the most accurate reading of the data?
      </p>
    </>
  ),
  options: [
    {
      id: 'a',
      text: '“Happy to share. Your region’s lower adoption is mainly an access and infrastructure issue. The data shows a clear correlation between GDP and AI usage, and your office’s connectivity limitations are well-documented. Once your team has the same tools and network infrastructure we have, the adoption patterns should converge. I’d start by sending over our standard workflows and letting your team adapt them to local conditions.”',
      isPreferred: false,
      feedbackTitle: 'Partially right, but oversimplified',
      feedbackTone: 'caution',
      feedbackText:
        'Sharing workflows is constructive, but framing the gap as primarily an access issue contradicts the data. GDP and infrastructure explain less than half the variation in adoption rates. Institutional context (organizational norms, regulatory environment, leadership attitudes) shapes whether tools that work in one context produce results in another.',
    },
    {
      id: 'b',
      text: '“I wouldn’t invest too much effort in this right now. The data shows that lower-adoption regions concentrate overwhelmingly on coding and technical tasks, which suggests the demand for operations-focused AI workflows hasn’t developed yet in those markets. Sharing our workflows before that demand exists risks creating adoption pressure without the supporting ecosystem. It might be more productive to revisit once their usage patterns diversify.”',
      isPreferred: false,
      feedbackTitle: 'Misreads the data',
      feedbackTone: 'error',
      feedbackText:
        'The use case concentration finding (lower-adoption regions skewing toward coding) describes a population-level pattern, not a ceiling on what’s possible in those regions. It reflects current adoption maturity, not inherent limitations. Dismissing a colleague’s request based on aggregate data applied to a specific team is exactly the kind of overconfident inference the module warns against.',
    },
    {
      id: 'c',
      text: '“Happy to share our workflows, but keep in mind that adoption differences aren’t just about access. Your team’s institutional context (organizational norms, how AI use is perceived by leadership, the types of tasks your office handles) will shape whether these workflows transfer effectively. I’d suggest we walk through them together so we can flag where your context might need a different approach.”',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This answer shows the core skill at play: interpreting adoption data and identifying what it means for a specific operational context. It correctly identifies that workflows don’t transfer automatically across institutional environments and names the contextual factors the data highlights. The willingness to share combined with an informed caveat is the professionally useful response.',
    },
    {
      id: 'd',
      text: '“I’d hold off for now. The overall trend across regions is toward adoption equalization as tools become more accessible and affordable, and lower-cost AI offerings are expanding rapidly. Your region will likely close the gap within the next year or two as infrastructure improves and tool costs decrease, so it makes more sense to share workflows once the baseline conditions are comparable rather than forcing a premature transfer.”',
      isPreferred: false,
      feedbackTitle: 'No basis in the data',
      feedbackTone: 'error',
      feedbackText:
        'Nothing in the adoption data suggests automatic convergence. The geographic and institutional factors that shape adoption are structural, not transient. Waiting for equalization without active investment is not a strategy the evidence supports.',
    },
  ],
};

const KC_1_2: KnowledgeCheckItemData = {
  id: 'kc_1_2',
  objectiveRef: '1.2',
  stem: (
    <>
      <p className="m-0">
        Your company’s Chief Learning Officer asks you to write a one-paragraph justification for
        funding an AI literacy program. She’s skeptical: she thinks the team is “already using AI
        just fine.” Which draft makes the strongest evidence-based case?
      </p>
    </>
  ),
  options: [
    {
      id: 'a',
      text: '“Our team uses AI daily, and most report time savings. But research shows that when professionals’ actual AI usage is compared to their self-reports, the two diverge: a significant share are automating tasks they believe they’re augmenting. Meanwhile, 69% of AI-using professionals conceal their usage, which means we can’t learn from, measure, or improve whatever practices are already working. The gap isn’t capability. It’s the competency to use these tools in ways we can actually evaluate and build on.”',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This draft does three things the CLO needs: it grounds the case in multiple quantified findings (self-report vs. behavioral divergence, 69% concealment rate, skill demand ranking, skill gap barrier, 86% time savings), it distinguishes between the productivity opportunity (time savings when competency is present) and the capability risk (divergent behavior, invisible practices), and it connects both to a measurable organizational consequence (the inability to learn from, measure, or improve existing practices). This is the structure of a business case, not a training request.',
    },
    {
      id: 'b',
      text: '“AI is the most in-demand skill in the global workforce. The World Economic Forum ranks it number one, and 85% of employers plan to invest in AI upskilling by 2030. Our competitors are almost certainly building these capabilities already. If we wait, we risk falling behind in talent retention and operational efficiency, and the cost of catching up later will be higher than the cost of investing now. This is a competitive necessity, not an optional investment.”',
      isPreferred: false,
      feedbackTitle: 'Directionally correct but unpersuasive',
      feedbackTone: 'caution',
      feedbackText:
        'A CLO evaluating budget requests needs specific evidence, not general urgency. This draft contains one data point (WEF ranking), no distinction between opportunity and risk, and no connection to the organization’s specific situation. “We’ll be left behind” is an appeal to fear, not an evidence-based argument.',
    },
    {
      id: 'c',
      text: '“Our team reports strong satisfaction with AI tools: 86% save time and 65% are satisfied with results. These numbers confirm that our current approach is working well. A formal program would help us build on this foundation by standardizing best practices and ensuring consistent quality across the team. The investment would optimize an already-positive trajectory rather than solve a problem, which makes it lower-risk, easier to measure, and more likely to get buy-in from the team.”',
      isPreferred: false,
      feedbackTitle: 'Uses data to argue against itself',
      feedbackTone: 'error',
      feedbackText:
        'The 86% and 65% figures describe self-reported outcomes, which the module has established diverge from behavioral reality. Citing satisfaction data as proof that the team is “already benefiting” without acknowledging the documented gap between perception and practice is precisely the reasoning the CLO’s skepticism is based on, and it reinforces rather than challenges it.',
    },
    {
      id: 'd',
      text: '“The research is clear that AI will fundamentally transform knowledge work within the next five years. Task-level automation rates are increasing rapidly, directive interactions with AI tools have risen significantly, and the augmentation-automation balance is shifting decisively toward full automation. We need a structured AI literacy program now to prepare our team for this transition and ensure they can work alongside increasingly capable systems before the window closes.”',
      isPreferred: false,
      feedbackTitle: 'Fabricates a claim',
      feedbackTone: 'error',
      feedbackText:
        'No source in the research corpus projects that AI will automate most knowledge work within five years. The data shows a mixed augmentation-automation picture with the balance shifting gradually. Overstating the threat undermines credibility and misrepresents the evidence. A CLO who fact-checks this claim will discount the entire proposal.',
    },
  ],
};

const KC_1_3: KnowledgeCheckItemData = {
  id: 'kc_1_3',
  objectiveRef: '1.3',
  stem: (
    <>
      <p className="m-0">
        During a team meeting, a junior colleague mentions that she’s been using AI to draft
        client communications but hasn’t told anyone because she’s “not sure how people would
        react.” Two other team members visibly shift in their seats. As someone who has just
        completed this module, which response best addresses the situation?
      </p>
    </>
  ),
  options: [
    {
      id: 'a',
      text: '“You shouldn’t hide that. AI is just a tool, like email or spreadsheets. Everyone should be open about using it. The more transparent people on this team are about their AI use, the faster we normalize it and start learning from each other. I’d encourage you to share your process with the team so we can all benefit from what you’ve figured out. Setting that example now will make it easier for others to follow.”',
      isPreferred: false,
      feedbackTitle: 'Right principle, wrong delivery',
      feedbackTone: 'caution',
      feedbackText:
        'Encouraging openness is the correct direction, but “you shouldn’t hide that” dismisses a well-documented barrier (69% of professionals report stigma) as if it were irrational. The colleague’s hesitation is socially rational given the environment. Telling someone to “just be open” without addressing the conditions that make openness risky doesn’t change behavior.',
    },
    {
      id: 'b',
      text: '“That’s a smart instinct, and I’d keep exercising caution for now. Until the company has a formal AI use policy (including clear guidelines on disclosure, client communication, and quality standards), being selective about what you share protects you professionally. Once leadership sets the norms, you’ll have a clearer picture of what’s expected and what’s safe to disclose. In the meantime, there’s no reason to take on reputational risk before the organization has caught up.”',
      isPreferred: false,
      feedbackTitle: 'Reinforces the concealment dynamic',
      feedbackTone: 'error',
      feedbackText:
        'Advising discretion may feel pragmatic, but it perpetuates exactly the pattern Section 4 described: each person navigating AI use privately, without shared norms or vocabulary. The colleague’s disclosure was an opportunity to shift the team dynamic. This response closes it.',
    },
    {
      id: 'c',
      text: '“Don’t worry about it. I use AI for most of my work and nobody’s ever said anything. The stigma around AI is overblown. Most people on this team are probably using it too and just not talking about it either. The best approach is to keep doing what works for you and not overthink the social dynamics. Results speak for themselves, and once the team sees the quality of your output, the question of how you produced it won’t matter.”',
      isPreferred: false,
      feedbackTitle: 'Anecdotal dismissal',
      feedbackTone: 'error',
      feedbackText:
        'Personal experience (“nobody’s ever complained”) doesn’t address the systemic pattern. The 69% finding isn’t about individual exceptions. It’s about a workforce-wide dynamic where the majority conceal, meaning the colleague’s discomfort reflects the norm, not an anomaly. Casual reassurance from one person doesn’t change the team’s operating norms.',
    },
    {
      id: 'd',
      text: '“I understand the hesitation. Research shows about 69% of professionals feel the same way. The issue isn’t whether people use AI. Most do. The issue is that when everyone works with AI privately, the team can’t learn from each other’s approaches, identify best practices, or evaluate whether AI-assisted work meets our standards. That’s why it helps to have shared language for talking about how we delegate tasks to AI and how we evaluate what it gives back.”',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This answer does four things well: it validates the colleague’s experience with data (69% finding), identifies the organizational consequences of concealment (can’t learn, can’t evaluate, can’t improve), introduces shared vocabulary as the practical solution (delegation and evaluation language rather than binary framing), and models the behavior it advocates by using specific, professional language rather than vague encouragement. The response demonstrates the competency, not just the knowledge.',
    },
  ],
};

const KC_1_4: KnowledgeCheckItemData = {
  id: 'kc_1_4',
  objectiveRef: '1.4',
  stem: (
    <>
      <p className="m-0">
        You regularly use AI to prepare weekly summary reports for your manager. Your process: you
        paste your notes into the AI tool, ask it to “write this up as a summary,” review the
        output for obvious errors, and send it. You’ve always considered this an efficient use of
        AI that enhances your productivity. Based on the augmentation–automation distinction
        introduced in this module, which assessment is most accurate?
      </p>
    </>
  ),
  options: [
    {
      id: 'a',
      text: '“This is augmentation. I’m using AI to enhance my own work. I provide the raw notes, which contain my observations and judgment about what happened during the week, and the AI helps me express those observations in polished summary form. The intellectual contribution is mine; the AI is handling the writing mechanics. That’s a collaborative workflow, not delegation.”',
      isPreferred: false,
      feedbackTitle: 'Common but inaccurate',
      feedbackTone: 'error',
      feedbackText:
        'This is the self-report pattern the module’s data highlighted. Most professionals describe their AI use as augmentative, because they’re involved in the process (providing input, reviewing output). But involvement isn’t augmentation. The distinguishing question is: who is doing the substantive intellectual work? If the AI is structuring, drafting, and making editorial judgments about emphasis, and your review is limited to checking for surface errors, the task is functionally automated regardless of who provided the raw material.',
    },
    {
      id: 'b',
      text: '“This is automation. I’m delegating the writing task to AI and performing only surface-level review. The AI is doing the substantive work (structuring the narrative, choosing what to emphasize, deciding what to include or omit), and my review checks for obvious errors rather than evaluating whether the summary reflects my judgment about what matters most.”',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This answer correctly applies the augmentation–automation distinction to a specific, recognizable task. It identifies the key signal: the nature of the review step. Surface-level error checking (typos, factual mistakes) is not the same as evaluating whether the summary accurately reflects your professional judgment about what’s important, what to emphasize, and what to leave out. Recognizing this doesn’t mean the current process is wrong. It means you now have the vocabulary to make a deliberate choice about whether automation is appropriate for this task or whether augmentation (more substantive review, more direction in the prompt) would produce a better outcome.',
    },
    {
      id: 'c',
      text: '“It doesn’t matter whether this is augmentation or automation. What matters is output quality and efficiency. The summary is accurate, my manager is satisfied, and I’m saving roughly an hour per week. Categorizing the workflow doesn’t change any of those outcomes. The augmentation-automation distinction is useful for research purposes, but in practice, the question is whether the process works.”',
      isPreferred: false,
      feedbackTitle: 'Sidesteps the question',
      feedbackTone: 'caution',
      feedbackText:
        'Output quality and time savings are legitimate considerations, but they don’t answer the question the module poses. The augmentation–automation distinction isn’t about whether AI use is good or bad. It’s about whether your actual behavior matches your perception of it. If you believe you’re enhancing your work but are actually delegating it, you’ve lost the ability to evaluate the quality of the delegation. The data shows this mismatch is widespread, not rare.',
    },
    {
      id: 'd',
      text: '“This is augmentation because I’m still the decision-maker in the process. I decide what goes into the notes, I decide when to send the summary, and I could override the AI’s output at any point if I wanted to. The fact that I’m choosing to accept most of what it produces reflects my judgment that the quality is sufficient, and that’s a form of evaluation, not passive acceptance.”',
      isPreferred: false,
      feedbackTitle: 'Confuses input provision with intellectual augmentation',
      feedbackTone: 'error',
      feedbackText:
        'Providing raw notes is an input step, not an augmentation process. Augmentation means the AI is enhancing your thinking, and you’re doing the substantive work (structuring, drafting, evaluating) with AI assistance. In the described scenario, the substantive work transfers to the AI at the “write this up” instruction. The notes are raw material; the summary is the AI’s editorial product.',
    },
  ],
};

export const MODULE_1_KC_ITEMS: KnowledgeCheckItemData[] = [KC_1_1, KC_1_2, KC_1_3, KC_1_4];
