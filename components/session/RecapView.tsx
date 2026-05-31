"use client";

import { useEffect, useRef, useState } from "react";
import { buildRecap, traceMatchPercent } from "@/lib/recap";
import { sttSupported, createRecognizer, type Recognizer } from "@/lib/speech";
import type { Coaching } from "@/lib/problems";
import type { EvidenceByConstruct } from "@/components/session/DiagnosticResult";
import { cn } from "@/lib/cn";

interface Props {
  coaching: Coaching;
  evidenceByConstruct: EvidenceByConstruct;
  onBack: () => void;
}

// "Coming soon" / unsupported pill.
function SoonPill({
  label,
  note,
  badge = "SOON",
}: {
  label: string;
  note: string;
  badge?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-3.5 py-1.5 text-[13px] text-ink/50 transition hover:border-ink/30"
      >
        {label}
        <span className="rounded-full bg-ink/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-tighter2 text-ink/45">
          {badge}
        </span>
      </button>
      {open && <p className="mt-1.5 text-[12px] leading-relaxed text-ink/45">{note}</p>}
    </div>
  );
}

export function RecapView({ coaching, evidenceByConstruct, onBack }: Props) {
  const recap = buildRecap(coaching, evidenceByConstruct);
  const [draft, setDraft] = useState("");
  const pct = traceMatchPercent(draft, recap.paragraph);

  // Read-aloud (listening) is intentionally deferred: the browser's free TTS
  // voice is too robotic. A natural voice needs a paid TTS API — shown as SOON.

  // STT support resolved on the client to avoid SSR mismatch.
  const [stt, setStt] = useState(false);
  useEffect(() => setStt(sttSupported()), []);

  // Read-back (speaking)
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);
  const recRef = useRef<Recognizer | null>(null);
  function toggleListen() {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = createRecognizer(
      (transcript) => setHeard(transcript),
      () => setListening(false),
    );
    if (!rec) return;
    recRef.current = rec;
    setHeard(null);
    setListening(true);
    rec.start();
  }
  const heardPct = heard ? traceMatchPercent(heard, recap.paragraph) : 0;

  return (
    <section className="mx-auto max-w-2xl px-4 pb-24 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="mt-2 font-mono text-[11px] uppercase tracking-tighter2 text-ink/45 hover:text-accent"
      >
        ← 결과로
      </button>

      <div className="mt-3 text-center">
        <p className="font-mono text-[11px] uppercase tracking-tighter2 text-accent">
          English Recap · 영어로 정리하기
        </p>
        <h1 className="mt-2 font-kr text-2xl font-semibold tracking-tighter2 sm:text-3xl">
          자신의 생각을, 하나의 영어 문단으로
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">
          방금 나눈 대화 전체가 이렇게 한 편의 영어 추론이 됩니다. 따라 쓰고,
          소리 내어 읽으며 문장을 자신의 것으로 만들어요.
        </p>
      </div>

      {/* Model paragraph + read-aloud */}
      <div className="mt-6 rounded-3xl border border-ink/12 bg-paper-2 p-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/45">
            Model paragraph
          </p>
          <SoonPill
            label="읽어주기"
            note="자연스러운 원어민 음성으로 읽어주는 리스닝 기능을 준비 중이에요. (고품질 음성 적용 예정)"
          />
        </div>
        <p className="mt-3 text-[16px] leading-[1.7] text-ink">{recap.paragraph}</p>
      </div>

      {/* Trace-write */}
      <div className="mt-5 rounded-3xl border border-ink/12 bg-paper-2 p-5">
        <div className="flex items-center justify-between">
          <p className="font-kr text-sm font-semibold text-ink/80">따라 쓰기</p>
          <span
            className={cn(
              "font-mono text-sm tabular-nums",
              pct >= 90 ? "text-accent" : "text-ink/45",
            )}
          >
            {pct}% 일치
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="위 문단을 그대로 따라 써보세요…"
          rows={5}
          className="mt-3 w-full resize-none rounded-2xl border border-ink/15 bg-paper px-4 py-3 text-[15px] leading-relaxed outline-none placeholder:text-ink/35 focus:border-accent"
        />
        {pct >= 90 && (
          <p className="mt-2 text-[13px] font-medium text-accent">
            완벽해요. 이 문장들이 이제 자신의 표현이에요.
          </p>
        )}
      </div>

      {/* Read-back (speaking) */}
      <div className="mt-5 rounded-3xl border border-ink/12 bg-paper-2 p-5">
        <div className="flex items-center justify-between">
          <p className="font-kr text-sm font-semibold text-ink/80">소리 내어 읽기</p>
          {stt ? (
            <button
              type="button"
              onClick={toggleListen}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition",
                listening
                  ? "bg-accent text-on-dark"
                  : "border border-accent/40 bg-accent-soft/40 text-accent hover:bg-accent-soft/70",
              )}
            >
              {listening ? "듣는 중…" : "따라 읽기"}
            </button>
          ) : (
            <SoonPill label="따라 읽기" badge="미지원" note="이 브라우저는 음성 인식을 지원하지 않아요. 크롬/사파리에서 말하기 연습을 할 수 있어요." />
          )}
        </div>
        {stt && !heard && (
          <p className="mt-2 text-[13px] leading-relaxed text-ink/45">
            ‘따라 읽기’를 누르고 위 문단을 영어로 소리 내어 읽어보세요.
            <br />
            얼마나 똑같이 읽었는지 들려드릴게요.
          </p>
        )}
        {heard && (
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/40">
                들린 내용
              </span>
              <span
                className={cn(
                  "font-mono text-sm tabular-nums",
                  heardPct >= 80 ? "text-accent" : "text-ink/45",
                )}
              >
                {heardPct}% 일치
              </span>
            </div>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink/70">“{heard}”</p>
          </div>
        )}
      </div>

      {/* Sentence-by-sentence review: mine vs the model */}
      <div className="mt-5">
        <p className="mb-3 font-kr text-sm font-semibold text-ink/80">
          내 문장 점검 · 내가 쓴 말 → 더 또렷한 영어
        </p>
        <div className="space-y-3">
          {recap.sentences.map((s) => (
            <div key={s.construct} className="rounded-2xl border border-ink/10 bg-paper-2 p-4">
              <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/40">
                {s.label}
              </p>
              {s.mine ? (
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink/55">
                  <span className="text-ink/35">나: </span>“{s.mine}”
                </p>
              ) : (
                <p className="mt-1.5 text-[13px] italic text-ink/35">이 단계는 건너뛰었어요</p>
              )}
              <p className="mt-2 border-l-2 border-accent pl-3 text-[15px] leading-relaxed text-ink/85">
                {s.model}
              </p>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-6 w-full rounded-xl border border-ink/15 bg-paper py-3 font-kr text-sm text-ink/70 transition hover:border-accent/50"
      >
        ← 결과로 돌아가기
      </button>
    </section>
  );
}
