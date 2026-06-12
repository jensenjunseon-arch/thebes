// POST /api/studio/ingest — a photo (dataUrl) or pasted text of a Korean math
// problem → a full ProblemPack (English statement, sentence translations,
// vocab glossary, optional interactive figure, first hint).

import { NextResponse } from "next/server";
import { jsonCall, sanitizePack, hasKey, PACK_MODEL, PACK_SPEC } from "@/lib/studio/ai";

export const maxDuration = 60;

const SYSTEM = `You are the ingestion engine of Thebes AI — a learning tool where Korean students
solve math problems IN ENGLISH. You receive a photo or text of one math problem
(usually Korean). Read it carefully and faithfully, then prepare it for study.

${PACK_SPEC}`;

type MediaType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

function parseDataUrl(dataUrl: string): { mediaType: MediaType; data: string } | null {
  const m = /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/.exec(dataUrl);
  if (!m) return null;
  return { mediaType: m[1] as MediaType, data: m[2] };
}

export async function POST(req: Request) {
  if (!hasKey()) {
    return NextResponse.json({ error: "no_key" }, { status: 503 });
  }

  let body: { image?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const text = body.text?.trim();
  const image = body.image ? parseDataUrl(body.image) : null;
  if (!text && !image) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const content = image
      ? [
          {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: image.mediaType,
              data: image.data,
            },
          },
          {
            type: "text" as const,
            text: "Read the math problem in this photo and prepare the JSON pack. If several problems appear, pick the most complete one.",
          },
        ]
      : [
          {
            type: "text" as const,
            text: `Here is the problem text:\n\n${text}\n\nPrepare the JSON pack.`,
          },
        ];

    const raw = await jsonCall<Record<string, unknown>>({
      model: PACK_MODEL,
      system: SYSTEM,
      content,
      maxTokens: 3500,
    });

    if (raw && (raw as { error?: string }).error === "not_math") {
      return NextResponse.json({ error: "not_math" }, { status: 422 });
    }

    const pack = sanitizePack(raw);
    if (!pack) {
      return NextResponse.json({ error: "ai_failed" }, { status: 502 });
    }
    return NextResponse.json(pack);
  } catch (err) {
    console.error("[studio/ingest]", err);
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
