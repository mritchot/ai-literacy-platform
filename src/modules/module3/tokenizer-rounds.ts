// P5 guided round definitions and per-round explanation copy. Round
// inputs and explanation text come verbatim from the Module 3 content
// document (S3/P5). Token counts are produced live by gpt-tokenizer at
// runtime — these are the inputs only.

interface TokenizerRound {
  id: 1 | 2 | 3 | 4;
  title: string;
  input: string;
  promptHint: string;
  // Optional translation/secondary line for non-English inputs.
  translation?: string;
  // Explanation card body, shown after reveal. Plain string; the chip
  // count and gap are interpolated by the playground at render time.
  explanation: string;
}

export const ROUNDS: TokenizerRound[] = [
  {
    id: 1,
    title: 'Common English',
    input: 'The quarterly revenue report is due Friday.',
    promptHint: 'How many tokens do you think this sentence will produce? Type your prediction and lock it in.',
    explanation:
      'Common English sentences compress efficiently. Most everyday words map to one or two tokens because these character patterns appeared millions of times in the training data. This is the baseline: the tokenizer was optimized for text that looks like this. Keep this number in mind as you see what happens with other input types.',
  },
  {
    id: 2,
    title: 'Numbers and arithmetic',
    // Verified cl100k_base → 13 tokens. 4,218.50 splits into 5 pieces
    // (4 / , / 218 / . / 50); 763.25 splits into 3 (763 / . / 25). The
    // previous input ('Calculate: 1,279 × 48 = ?') duplicated S2 Panel B
    // verbatim, so learners who'd seen the diagram could recall the
    // result rather than predicting it. This budget-style example
    // demonstrates the same number-fragmentation point on a fresh
    // digit string.
    input: 'Budget: $4,218.50 + $763.25',
    promptHint: "Same question. How many tokens? Remember, the model doesn't see digits the way you do.",
    explanation:
      "Numbers tokenize inconsistently. Whether a digit sequence is one token or several depends entirely on how frequently that exact string appeared in the training data, which has nothing to do with the number's mathematical value. The dollar signs, decimal points, commas, and plus sign each have their own tokenization behavior. This is why AI tools make arithmetic errors that look bizarre: the model performs prediction on token fragments, not calculation on numbers. The errors are not random. They concentrate wherever token boundaries misalign with mathematical structure.",
  },
  {
    id: 3,
    title: 'Non-English text',
    input: 'お疲れ様です。今週のレポートを確認してください。',
    translation: "Good work. Please review this week's report.",
    promptHint:
      'This says roughly the same thing as a two-sentence English request. How many tokens do you think it produces?',
    explanation:
      'The same semantic content in Japanese produces significantly more tokens than its English equivalent. Each character may become its own token (or even multiple tokens) because Japanese character sequences were far less frequent in the English-dominated training data. More tokens means a longer sequence consuming more of the model’s working memory, leaving less room for context and increasing the surface area for generation errors. If you work with multilingual content, tokenization asymmetry is one structural factor in why AI tools perform less reliably outside English: fewer tokens are available for your actual content when the tokenizer spends more of them encoding each character.',
  },
  {
    id: 4,
    title: 'Code',
    input: 'if (revenue_q4 >= threshold):\n    alert("Target exceeded")',
    promptHint: 'Code mixes natural language, symbols, and formatting. How many tokens?',
    explanation:
      'Code tokenizes unpredictably because it combines elements the tokenizer handles differently: variable names that may or may not match common English patterns, operators and punctuation that often become individual tokens, indentation that consumes tokens without carrying semantic meaning, and string literals that tokenize like natural language. Long variable names with underscores tend to fragment more than short ones. This matters when you paste code into an AI tool for review or debugging: longer code consumes proportionally more of the model’s working memory than equivalent natural language, sometimes significantly more.',
  },
];

interface QuickLoadSample {
  label: string;
  text: string;
}

export const QUICK_LOAD_SAMPLES: QuickLoadSample[] = [
  {
    label: 'Financial formula',
    text: '=IF(AND(Q3_revenue > 500000, COGS_ratio < 0.35), "Target met", "Review needed")',
  },
  {
    label: 'Legal clause',
    text:
      'Notwithstanding the foregoing, neither party shall be liable for indirect, incidental, or consequential damages arising under this Agreement.',
  },
  {
    label: 'Email (Spanish)',
    text:
      'Estimado equipo, adjunto el informe trimestral para su revisión. Por favor confirmen recibo antes del viernes.',
  },
  {
    label: 'Product SKU list',
    text: 'SKU-2847-BLK-XL, SKU-2847-BLK-L, SKU-2847-NVY-XL, SKU-2847-NVY-L, SKU-2848-WHT-M',
  },
];
