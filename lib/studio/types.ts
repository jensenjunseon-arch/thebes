// Studio contract types — the shape every API route returns and every
// component consumes. Keep stable; the ingest/generate prompts mirror this.

// ── The problem pack ─────────────────────────────────────────────────────────
// One ingested (photo/text) or generated problem, fully prepared for the
// workspace: English statement (with inline $LaTeX$), sentence-level Korean,
// key-term glossary, an optional interactive figure, and a first nudge.

export interface SentencePair {
  en: string; // one English sentence (may contain $...$ math)
  ko: string; // natural Korean translation of that sentence
}

export interface VocabTerm {
  en: string; // term as it appears in the English text (1–3 words)
  ko: string; // concise Korean gloss
}

// ── Figures ──────────────────────────────────────────────────────────────────
// 2D shapes use a normalized 0–100 coordinate space (y grows downward).

export interface PolygonFigure {
  kind: "polygon";
  points: [number, number][]; // 3+ vertices, normalized 0–100
  labels?: string[]; // per-vertex labels ("A", "B", …)
  sideLabels?: string[]; // per-edge labels ("12 cm"), edge i = points[i]→points[i+1]
}

export interface CircleFigure {
  kind: "circle";
  r: number; // normalized (≤50)
  label?: string; // center label
  radiusLabel?: string; // e.g. "r = 5 cm"
}

export interface AngleFigure {
  kind: "angle";
  deg: number; // the marked angle in degrees
  labels?: string[]; // [vertex, arm1, arm2]
}

export interface SolidFigure {
  kind: "solid";
  solid: "cuboid" | "cylinder" | "cone" | "sphere";
  dims: { w?: number; h?: number; d?: number; r?: number }; // relative units
  dimLabels?: string[]; // human labels, e.g. ["가로 6 cm", "높이 4 cm"]
}

export type FigureSpec = PolygonFigure | CircleFigure | AngleFigure | SolidFigure;

export interface ProblemPack {
  english: string; // full English statement; inline math as $...$
  korean: string; // Korean original (as given, or a faithful back-translation)
  topic: string; // short Korean topic ("속력", "닮음", …)
  level: string; // "초등 저학년"|"초등 고학년"|"중1"|"중2"|"중3"|"고1"|"고2"|"고3"
  sentences: SentencePair[]; // covers the whole english text, in order
  vocab: VocabTerm[]; // 8–14 key terms found in the english text
  figure: FigureSpec | null;
  firstHint: string; // one warm Korean nudge for the first plan line
}

// ── Line-by-line solve flow ──────────────────────────────────────────────────

export type LineVerdict = "great" | "good" | "hint";

export interface LineFeedback {
  verdict: LineVerdict;
  comment: string; // 1–2 short Korean lines, specific to the student's line
  betterEnglish?: string; // optional: the same idea, phrased in cleaner English
  planComplete: boolean; // true when the plan now covers the whole problem
}

export interface PlanLine {
  id: string;
  text: string;
  feedback: LineFeedback | null; // null while pending
}

// ── Recap (plan lines → one English paragraph) ───────────────────────────────

export interface StudioRecap {
  paragraph: string; // 60–110 words, stitched faithfully from the lines
}
