// POST /api/studio/make — build the artifact IN-APP. Streams the model's reply
// as plain text chunks; the client accumulates (progress UI) and mounts the
// result (game/quiz → sandboxed iframe, video → markdown).
//
// Two modes:
//   fresh:  { kind, paragraph, level, problem?, quotes? }
//   revise: { kind, revise: { artifact, instruction }, paragraph, ... }
// The prompt is always built SERVER-side from our templates (lib/makers), so
// this endpoint can't be repurposed as a general LLM proxy.

import { anthropic, hasKey, PACK_MODEL } from "@/lib/studio/ai";
import { makerPrompt, levelBand, type MakerKind, type ProblemSeed } from "@/lib/makers";

export const maxDuration = 300;

interface MakeBody {
  kind?: MakerKind;
  paragraph?: string;
  level?: string;
  problem?: ProblemSeed;
  quotes?: string[];
  revise?: { artifact: string; instruction: string };
}

const KIND_OK = new Set(["game", "video", "quiz"]);

export async function POST(req: Request) {
  if (!hasKey()) {
    return Response.json({ error: "no_key" }, { status: 503 });
  }

  let body: MakeBody;
  try {
    body = (await req.json()) as MakeBody;
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const kind = body.kind;
  const paragraph = body.paragraph?.trim();
  if (!kind || !KIND_OK.has(kind) || !paragraph || paragraph.length > 4000) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const quotes = Array.isArray(body.quotes)
    ? body.quotes.map((q) => String(q).slice(0, 200)).slice(0, 3)
    : [];

  const prompt = makerPrompt(
    paragraph,
    kind,
    levelBand(body.level),
    body.problem,
    quotes,
    "app",
  );

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    { role: "user", content: prompt },
  ];

  // Revision loop: prior artifact comes back as the assistant turn, then the
  // student's instruction. Caps keep the endpoint honest.
  if (body.revise) {
    const artifact = String(body.revise.artifact ?? "").slice(0, 300_000);
    const instruction = String(body.revise.instruction ?? "")
      .trim()
      .slice(0, 300);
    if (!artifact || !instruction) {
      return Response.json({ error: "bad_request" }, { status: 400 });
    }
    messages.push(
      { role: "assistant", content: artifact },
      {
        role: "user",
        content: `The student asks (Korean): "${instruction}"

Apply this to your previous work and return the COMPLETE updated ${
          kind === "video" ? "markdown script" : "HTML document"
        } — same output rules as before (${
          kind === "video"
            ? "clean markdown, no preamble"
            : "ONLY the full HTML, <!DOCTYPE html> … </html>, no fences, no commentary"
        }). Keep everything that already worked; change what the instruction asks; never truncate.`,
      },
    );
  }

  try {
    const client = anthropic();
    const stream = client.messages.stream({
      model: PACK_MODEL,
      max_tokens: kind === "video" ? 4000 : 16000,
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("[studio/make] stream error:", err);
          controller.error(err);
        }
      },
      cancel() {
        void stream.abort();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[studio/make]", err);
    return Response.json({ error: "ai_failed" }, { status: 502 });
  }
}
