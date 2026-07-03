// Geometry and color constants for the S10 Competency Profile PDF
// (see ../generate-completion-pdf.ts for the full layout spec).

// Font-family identifiers registered by `registerDMFonts(doc)`.
// Used in `doc.setFont(family, style)` throughout.
export const FONT = {
  sans: 'DMSans',
  serif: 'DMSerif',
  mono: 'DMMono',
} as const;

// ─── Geometry constants ───────────────────────────────────────────

export const PAGE_W = 792;
export const PAGE_H = 612;
export const MARGIN_LEFT = 40;
export const MARGIN_RIGHT = 40;
export const CONTENT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT; // 712

export const SIGNATURE_BAR_H = 3;

// 2×2 competency grid (Page 1)
export const GRID_TOP = 124;
export const GRID_CELL_W = 351;
export const GRID_CELL_H = 209;
export const GRID_GAP = 10;

// Section overline (text-flanked-by-rules) Y
export const SECTION_OVERLINE_Y = 116;

// Page footer
export const FOOTER_RULE_Y = 568;
export const FOOTER_BASELINE_Y = 582;

// Per-quadrant rhythm (relative to card top)
export const CARD_OVERLINE_Y_OFFSET = 18;
export const CARD_HEADING_Y_OFFSET = 36;
export const CARD_BODY_TOP_OFFSET = 50;
export const CARD_ATTRIB_RULE_Y_OFFSET = GRID_CELL_H - 22; // 187
export const CARD_ATTRIB_TEXT_Y_OFFSET = GRID_CELL_H - 10; // 199
export const CARD_INNER_PAD_X = 14;

// Body line budgets per quadrant — baked from the layout math so we
// can truncate consistently. Each field's body is wrapped by jsPDF
// then truncated to (at most) this many lines with an ellipsis.
export const LINES = {
  delegation: 3, // 2 fields, 3 lines each
  description: 2, // 3 fields, 2 lines each
  discernment: 6, // 1 field below the stat line
  diligence: 9, // 1 full statement block
};

// Defensive cap: never even attempt to render more than 800 chars of
// any one field. Anything longer gets hard-truncated before wrapping.
export const MAX_FIELD_CHARS = 800;

// CSS letter-spacing emulation: 0.18em → sizeInPt × 0.18 pt of
// additional character space (jsPDF setCharSpace).
export const TRACKING_MONO = 0.18;

// ─── Colors ───────────────────────────────────────────────────────

export const C = {
  // Competency primaries
  delegation: '#6B7F5E',
  description: '#8B7355',
  discernment: '#5E7080',
  diligence: '#7A6B80',
  // Competency lights (badges, stat-line backgrounds)
  delegationLight: '#E8EDE4',
  descriptionLight: '#F0EAE0',
  discernmentLight: '#E4EBF0',
  diligenceLight: '#EDE4F0',
  // Diligence mid (badge border)
  diligenceMid: '#C2B5C8',
  // Competency text (darker than primary — for field labels)
  delegationText: '#3D4A35',
  descriptionText: '#5A4A37',
  discernmentText: '#354A57',
  diligenceText: '#4A3557',
  // 5th accent — Assessment (meta-measurement of the program).
  // Two stops darker than Discernment slate so the two never read
  // as the same color at a glance.
  assessment: '#44556B',
  assessmentLight: '#E6E9ED',
  assessmentMid: '#B0B9C4',
  assessmentText: '#29323D',
  // Delta semantic colors (Growth card change column + breakdown Δ)
  positive: '#4F7A3D', // success green
  negative: '#9B7B2E', // caution amber (reused as "negative delta")
  neutral: '#888888', // gray for ±0
  // Neutrals
  ink: '#2D2D2D',
  body: '#555555',
  secondary: '#666666',
  tertiary: '#8A8A8A',
  border: '#E0DDD7',
  borderLight: '#EAE7E1',
  surface: '#FAFAF7',
  surfaceWarm: '#FAF8F5',
  white: '#FFFFFF',
};
