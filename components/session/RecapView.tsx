"use client";

import { useState } from "react";
import { buildRecap, traceMatchPercent } from "@/lib/recap";
import type { Coaching } from "@/lib/problems";
import type { EvidenceByConstruct } from "@/components/session/DiagnosticResult";
import { cn } from "@/lib/cn";

interface Props {
  coaching: Coaching;
  evidenceByConstruct: EvidenceByConstruct;
  onBack: () => void;
}

// "Coming soon" pill for the audio features we're previewing, not shipping yet.
function SoonButton({ icon, label, note }: { icon: string; label: string; note: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-3.5 py-1.5 text-[13px] text-ink/70 transition hover:border-accent/50"
      >
        <span aria-hidden>{icon}</span>
        {label}
        <span className="rounded-full bg-accent-soft px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-tighter2 text-accent">
          곧
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
          너의 생각을, 하나의 영어 문단으로
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">
          방금 나눈 대화 전체가 이렇게 한 편의 영어 추론이 됩니다. 읽고, 따라 쓰면서
          문장을 내 것으로 만들어요.
        </p>
      </div>

      {/* Model paragraph + audio (coming soon) */}
      <div className="mt-6 rounded-3xl border border-ink/12 bg-paper-2 p-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/45">
            Model paragraph
          </p>
          <SoonButton
            icon="▶"
            label="읽어주기"
            note="원어민 음성으로 읽어주는 리스닝 기능이 곧 추가됩니다."
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
        {pct >= 90 ? (
          <p className="mt-2 text-[13px] font-medium text-accent">
            완벽해요! 이 문장들이 이제 너의 표현이에요. 🎉
          </p>
        ) : (
          <div className="mt-2">
            <SoonButton
              icon="🎤"
              label="따라 읽기"
              note="네가 소리 내어 읽으면 발음을 평가해 주는 스피킹 기능이 곧 추가됩니다."
            />
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
