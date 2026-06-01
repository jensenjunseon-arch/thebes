// Public, read-only data layer that powers external integrations:
//   • ChatGPT "Explore GPTs" via GPT Actions (OpenAPI at /api/openapi.json)
//   • Claude / other MCP clients via the connector at /api/mcp
//   • Any plain REST consumer via /api/v1/*
// No secrets, no writes, no user data — safe to expose publicly.

import { CONSTRUCTS } from "@/lib/constructs";
import { POLYA_STEPS } from "@/lib/steps";
import { LEVELS } from "@/lib/problems";

export const CANONICAL_URL = "https://thebes-nine.vercel.app";

// ── CORS / JSON helpers ─────────────────────────────────────────────────────
export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id",
};

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      ...CORS_HEADERS,
    },
  });
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function originFrom(request: Request): string {
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host = request.headers.get("host");
  return host ? `${proto}://${host}` : CANONICAL_URL;
}

// ── About: what Thebes is, for grounding a GPT/connector ────────────────────
export function aboutPayload() {
  return {
    name: "Thebes AI",
    tagline: "답이 아니라 사고를 키우는 AI 코치",
    summary:
      "Thebes diagnoses HOW a student thinks — in English — across six reasoning constructs, instead of grading the answer. Any AI can produce the answer; Thebes measures and grows the thinking around it.",
    methodology:
      "A short, 5-stage widening dialogue conducted in English — reframe → decompose → relate → relevance → transfer. The numeric answer is never requested. Linguistic markers of each kind of reasoning are scored 1–5 per construct and rolled up into an 'AI Talent Index' (0–100).",
    whyEnglish:
      "Frontier LLMs internally process in English, and Korean is a high-context language whose nuance ('괜찮다' = okay or no-thanks?) is ambiguous to a model. Reasoning in English forces a learner to make their thinking explicit — the literacy that matters in the AI era.",
    constructs: CONSTRUCTS.map((c) => ({
      id: c.id,
      name_ko: c.koreanName,
      name_en: c.englishName,
      definition_ko: c.definition,
    })),
    stages: POLYA_STEPS.flatMap((s) => s.primaryConstructs).filter(
      (v, i, a) => a.indexOf(v) === i,
    ),
    levels: LEVELS,
    url: CANONICAL_URL,
    docs: `${CANONICAL_URL}/connect`,
  };
}

export function constructsPayload() {
  return {
    count: CONSTRUCTS.length,
    constructs: CONSTRUCTS.map((c) => ({
      id: c.id,
      name_ko: c.koreanName,
      name_en: c.englishName,
      definition_ko: c.definition,
    })),
  };
}

// ── A representative AI Talent Report (the shape real reports take) ─────────
export const SAMPLE_REPORT = {
  product: "Thebes AI — AI 인재 리포트",
  reportId: "sample",
  student: { alias: "데모 학생", level: "중2" },
  problemTopic: "속력 (평균 속력)",
  generatedAt: "2026-06-01",
  aiTalentIndex: 72,
  band: "탄탄한 토대 — 방향만 잡으면 빠르게 큽니다",
  constructs: [
    { id: "redefine", name: "문제 재정의력", score: 4 },
    { id: "decompose", name: "구성 요소 분해", score: 5 },
    { id: "relate", name: "관계 파악", score: 5 },
    { id: "relevance", name: "실생활 연결", score: 3 },
    { id: "transfer", name: "확장적 사고", score: 3 },
    { id: "english", name: "영어 추론 표현력", score: 2 },
  ],
  strength: {
    construct: "relate",
    name: "관계 파악",
    evidenceQuote: "When the car drives slower, that part of the trip takes more time.",
    reading:
      "대부분은 값을 구하는 데 직진하는데, 이 학생은 요소들이 서로 어떻게 영향을 주는지를 봅니다.",
  },
  growth: {
    construct: "english",
    name: "영어 추론 표현력",
    why: "AI는 속으로 영어로 사고합니다. 수학을 한국어로만 익히면 AI가 생각하는 언어로는 한 박자 늦습니다.",
  },
  forParents:
    "암기·반복 위주 학원은 이 아이에겐 손해입니다. 개념을 ‘연결해 설명’하게 하는 환경에서 폭발합니다.",
};
