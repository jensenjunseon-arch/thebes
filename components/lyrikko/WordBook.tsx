"use client";

// The word book (단어장): every saved word grouped by song, plus a flashcard
// review mode over the words that are due. Self-graded (O/X) — the server
// applies the Leitner move; the client never picks boxes or dates.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ReviewBox } from "@/lib/lyrikko/types";

interface WordRow {
  id: string;
  direction: "en" | "ko";
  song: string;
  artist: string;
  term: string;
  line: string;
  gloss: string;
  meaning: string;
  box: ReviewBox;
  review_count: number;
  next_review_at: string;
}

function highlight(text: string, term: string) {
  if (!text) return null;
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.split(new RegExp(`(${esc})`, "ig")).map((p, i) =>
    p.toLowerCase() === term.toLowerCase() ? (
      <span key={i} className="font-semibold text-accent">
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export function WordBook() {
  const [words, setWords] = useState<WordRow[] | null>(null);
  const [needLogin, setNeedLogin] = useState(false);

  // Review mode state
  const [queue, setQueue] = useState<WordRow[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [grading, setGrading] = useState(false);
  const [sessionDone, setSessionDone] = useState<{ right: number; wrong: number } | null>(null);
  const [tally, setTally] = useState({ right: 0, wrong: 0 });

  async function load() {
    const res = await fetch("/api/lyrikko/words");
    if (res.status === 401) {
      setNeedLogin(true);
      return;
    }
    const d = (await res.json().catch(() => ({}))) as { words?: WordRow[] };
    setWords(d.words ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  const due = useMemo(() => {
    const now = Date.now();
    return (words ?? []).filter((w) => new Date(w.next_review_at).getTime() <= now);
  }, [words]);

  const bySong = useMemo(() => {
    const groups = new Map<string, WordRow[]>();
    for (const w of words ?? []) {
      const key = `${w.song}|${w.artist}`;
      const g = groups.get(key) ?? [];
      g.push(w);
      groups.set(key, g);
    }
    return [...groups.entries()];
  }, [words]);

  function startReview() {
    if (!due.length) return;
    setQueue([...due].sort(() => 0)); // keep due order stable
    setTally({ right: 0, wrong: 0 });
    setSessionDone(null);
    setRevealed(false);
  }

  async function grade(correct: boolean) {
    const current = queue[0];
    if (!current || grading) return;
    setGrading(true);
    try {
      await fetch("/api/lyrikko/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: current.id, correct }),
      });
      const next = queue.slice(1);
      const newTally = {
        right: tally.right + (correct ? 1 : 0),
        wrong: tally.wrong + (correct ? 0 : 1),
      };
      setTally(newTally);
      setQueue(next);
      setRevealed(false);
      if (next.length === 0) {
        setSessionDone(newTally);
        void load();
      }
    } finally {
      setGrading(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/lyrikko/words?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setWords((ws) => (ws ?? []).filter((w) => w.id !== id));
  }

  if (needLogin) {
    return (
      <div className="mt-16 text-center">
        <p className="font-kr text-sm text-ink/60">단어장을 보려면 로그인이 필요해요.</p>
        <Link
          href={"/login?next=/lyrics/book" as never}
          className="mt-4 inline-block rounded-xl bg-accent px-5 py-2.5 font-kr text-sm font-medium text-on-dark"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  if (words === null) {
    return <p className="mt-12 font-kr text-sm text-ink/45">단어장을 여는 중…</p>;
  }

  // ── Review mode ────────────────────────────────────────────────────────────
  const current = queue[0];
  if (current) {
    return (
      <div className="mx-auto mt-8 max-w-md">
        <div className="flex items-center justify-between font-kr text-xs text-ink/45">
          <span>
            {tally.right + tally.wrong + 1} / {tally.right + tally.wrong + queue.length}
          </span>
          <button onClick={() => setQueue([])} className="hover:text-ink">
            그만하기
          </button>
        </div>

        <div className="lyr-hero-in mt-4 rounded-3xl border border-ink/10 bg-paper-2 p-7 text-center">
          <div className="font-kr text-xs text-ink/40">
            {current.song} · {current.artist}
          </div>
          <h2 className="mt-3 font-serif text-3xl italic text-ink">{current.term}</h2>
          {current.line && (
            <p className="mt-2 font-sans text-[15px] text-ink/55">
              🎵 {highlight(current.line, current.term)}
            </p>
          )}

          {revealed ? (
            <>
              {current.gloss && (
                <p className="mt-5 font-kr text-lg font-medium text-ink">{current.gloss}</p>
              )}
              {current.meaning && (
                <p className="mt-2 font-kr text-sm leading-relaxed text-ink/70">
                  {current.meaning}
                </p>
              )}
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => grade(false)}
                  disabled={grading}
                  className="flex-1 rounded-xl border border-ink/12 py-3 font-kr text-sm text-ink/70 transition hover:bg-paper disabled:opacity-40"
                >
                  ✗ 헷갈렸어요
                </button>
                <button
                  onClick={() => grade(true)}
                  disabled={grading}
                  className="flex-1 rounded-xl bg-accent py-3 font-kr text-sm font-medium text-on-dark transition hover:bg-accent/90 disabled:opacity-40"
                >
                  ○ 알고 있어요
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="mt-7 w-full rounded-xl bg-ink py-3 font-kr text-sm font-medium text-on-dark transition hover:bg-ink/90"
            >
              뜻 확인하기
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── List mode ──────────────────────────────────────────────────────────────
  return (
    <div className="mt-6">
      {sessionDone && (
        <p className="lyr-line-in mb-5 rounded-2xl bg-accent/[0.06] px-4 py-3 font-kr text-sm text-ink/80">
          복습 끝! ○ {sessionDone.right} · ✗ {sessionDone.wrong} — 틀린 단어는 곧 다시
          만나요.
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className="font-kr text-sm text-ink/60">
          모은 단어 <strong className="text-ink">{words.length}</strong>개
          {due.length > 0 && (
            <>
              {" "}
              · 오늘 복습할 단어 <strong className="text-accent">{due.length}</strong>개
            </>
          )}
        </p>
        <button
          onClick={startReview}
          disabled={!due.length}
          className="rounded-xl bg-accent px-4 py-2 font-kr text-sm font-medium text-on-dark transition hover:bg-accent/90 disabled:opacity-30"
        >
          복습 시작
        </button>
      </div>

      {words.length === 0 && (
        <div className="mt-14 text-center">
          <p className="font-kr text-sm text-ink/55">
            아직 모은 단어가 없어요. 노래에서 단어를 눌러 저장해 보세요!
          </p>
          <Link
            href={"/lyrics" as never}
            className="mt-4 inline-block rounded-xl bg-ink px-5 py-2.5 font-kr text-sm text-on-dark"
          >
            노래 보러 가기
          </Link>
        </div>
      )}

      <div className="mt-6 space-y-7">
        {bySong.map(([key, group]) => {
          const [song, artist] = key.split("|");
          return (
            <section key={key}>
              <h2 className="font-kr text-sm font-medium text-ink/70">
                {song} <span className="font-normal text-ink/40">· {artist}</span>
              </h2>
              <ul className="mt-2.5 space-y-2">
                {group.map((w) => (
                  <li
                    key={w.id}
                    className="group flex items-center gap-3 rounded-2xl border border-ink/10 bg-paper px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-sans text-[15px] font-medium text-ink">
                          {w.term}
                        </span>
                        <span className="truncate font-kr text-xs text-ink/55">{w.gloss}</span>
                      </div>
                      {w.line && (
                        <div className="mt-0.5 truncate font-sans text-xs text-ink/40">
                          {highlight(w.line, w.term)}
                        </div>
                      )}
                    </div>
                    <span
                      className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-ink/35"
                      title={`복습 단계 ${w.box}/5`}
                    >
                      Lv.{w.box}
                    </span>
                    <button
                      onClick={() => remove(w.id)}
                      className="shrink-0 font-kr text-xs text-ink/25 opacity-0 transition hover:text-ink/60 group-hover:opacity-100"
                      aria-label="단어 삭제"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
