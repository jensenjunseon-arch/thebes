"use client";

// The chart-lyric vocabulary explorer — the interactive "wow loop":
//   pick a song → it rises to center as a hero (with a Gemini-style loader) →
//   its notable words appear as chips → tap one → meaning + why + cross-songs +
//   slang → ask follow-ups in your own language.
//
// Bidirectional from one engine: "en" teaches the English in K-pop to a Korean
// fan; "ko" teaches the Korean to a global fan. No full lyrics — words only.

import { useEffect, useRef, useState } from "react";
import type {
  ChartEntry,
  ChatTurn,
  Direction,
  SongWords,
  WordCard,
  WordChip,
} from "@/lib/lyrics/types";

// Render a sung fragment with the learned term highlighted in place — the
// recognition cue ("got me feelin' **butterflies**").
function highlight(text: string, term: string) {
  if (!text) return null;
  if (!term) return text;
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${esc})`, "ig"));
  return parts.map((p, i) =>
    p.toLowerCase() === term.toLowerCase() ? (
      <span key={i} className="font-semibold text-accent">
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

// One chart column (global or K-pop) — a ranked list of tappable songs.
function ChartColumn({
  title,
  badge,
  entries,
  onPick,
}: {
  title: string;
  badge: string;
  entries: ChartEntry[];
  onPick: (e: ChartEntry) => void;
}) {
  if (!entries.length) return null;
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="font-kr text-sm font-medium text-ink/70">{title}</h2>
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink/35">{badge}</span>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {entries.map((c, i) => (
          <button
            key={`${c.title}-${c.artist}`}
            onClick={() => onPick(c)}
            style={{ animationDelay: `${i * 40}ms` }}
            className="animate-rise flex items-center gap-3 rounded-2xl border border-ink/10 bg-paper px-3 py-2 text-left transition hover:-translate-y-0.5 hover:border-accent/40"
          >
            <span className="w-4 shrink-0 text-center font-mono text-sm font-medium text-accent">
              {c.rank}
            </span>
            {c.artwork ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.artwork}
                alt=""
                loading="lazy"
                className="h-11 w-11 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="h-11 w-11 shrink-0 rounded-lg bg-paper-2" />
            )}
            <span className="min-w-0">
              <span className="block truncate font-sans text-[15px] font-medium text-ink">
                {c.title}
              </span>
              <span className="block truncate font-kr text-xs text-ink/55">{c.artist}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

const T = {
  en: {
    learn: "영어 배우기",
    pick: "노래를 고르거나 직접 입력하세요",
    songPh: "노래 제목",
    artistPh: "아티스트",
    analyze: "단어 보기",
    back: "차트로",
    picked: "이 노래를 골랐어요",
    loadingLines: [
      "가사를 찾고 있어요…",
      "핵심 영어 단어를 고르는 중…",
      "노래의 맥락을 살펴보는 중…",
      "거의 다 됐어요…",
    ],
    tapHint: "단어를 누르면 뜻 · 왜 이 단어인지 · 다른 노래까지 알려줘요",
    why: "왜 이 단어일까 (해석)",
    slang: "요즘 유행이라면",
    cross: "이 표현이 쓰인 다른 노래",
    examples: "이렇게 써볼 수 있어요",
    askPh: "이 단어에 대해 더 물어보세요…",
    send: "보내기",
    quick: ["왜 이 단어를 골랐을까?", "발음이 어떻게 돼?", "다른 예문도 알려줘"],
    loadingCard: "이 단어를 풀어보는 중…",
    unknown: "이 노래는 제가 잘 몰라요. 다른 노래로 해볼까요?",
  },
  ko: {
    learn: "Learn Korean",
    pick: "Pick a song or type one in",
    songPh: "Song title",
    artistPh: "Artist",
    analyze: "Show words",
    back: "Back to charts",
    picked: "You picked",
    loadingLines: [
      "Finding the lyrics…",
      "Picking the key Korean words…",
      "Reading the song's context…",
      "Almost there…",
    ],
    tapHint: "Tap a word for its meaning, why it's there, and other songs that use it",
    why: "Why this word (interpretation)",
    slang: "If it's slang / trending",
    cross: "Other songs using this",
    examples: "You could say",
    askPh: "Ask anything about this word…",
    send: "Send",
    quick: ["Why this word?", "How is it pronounced?", "Give another example"],
    loadingCard: "Unpacking this word…",
    unknown: "I don't really know this song. Want to try another?",
  },
} as const;

const ERROR_COPY: Record<string, string> = {
  no_key: "AI 연결이 아직 준비되지 않았어요. 잠시 후 다시 시도해 주세요.",
  ai_failed: "잠깐 막혔어요. 한 번만 다시 시도해 주세요.",
  bad_request: "노래 제목을 입력해 주세요.",
};

interface Selected {
  title: string;
  artist: string;
  artwork: string;
}

export function LyricsApp({
  globalChart,
  kpopChart,
}: {
  globalChart: ChartEntry[];
  kpopChart: ChartEntry[];
}) {
  const [direction, setDirection] = useState<Direction>("en");
  const [songIn, setSongIn] = useState("");
  const [artistIn, setArtistIn] = useState("");

  const [selected, setSelected] = useState<Selected | null>(null);
  const [words, setWords] = useState<SongWords | null>(null);
  const [loadingSong, setLoadingSong] = useState(false);
  const [loadIdx, setLoadIdx] = useState(0);

  const [term, setTerm] = useState<string | null>(null);
  const [activeLine, setActiveLine] = useState("");
  const [card, setCard] = useState<WordCard | null>(null);
  const [loadingCard, setLoadingCard] = useState(false);

  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [chatIn, setChatIn] = useState("");
  const [chatBusy, setChatBusy] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const t = T[direction];

  // Cycle the loader's status lines while a song is being analyzed.
  useEffect(() => {
    if (!loadingSong) return;
    setLoadIdx(0);
    const id = setInterval(() => setLoadIdx((i) => i + 1), 1600);
    return () => clearInterval(id);
  }, [loadingSong]);

  function reset() {
    setWords(null);
    setTerm(null);
    setActiveLine("");
    setCard(null);
    setChat([]);
    setError(null);
  }

  function switchDirection(d: Direction) {
    if (d === direction) return;
    setDirection(d);
    setSelected(null);
    reset();
  }

  function backToCharts() {
    setSelected(null);
    setLoadingSong(false);
    reset();
  }

  async function loadSong(song: string, artist: string, artwork = "") {
    const s = song.trim();
    if (!s) return;
    setSelected({ title: s, artist: artist.trim(), artwork });
    setError(null);
    setLoadingSong(true);
    setWords(null);
    setTerm(null);
    setActiveLine("");
    setCard(null);
    setChat([]);
    try {
      const res = await fetch("/api/lyrics/song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song: s, artist: artist.trim(), direction }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error ?? "ai_failed");
      }
      setWords((await res.json()) as SongWords);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ai_failed");
    } finally {
      setLoadingSong(false);
    }
  }

  function pick(c: ChartEntry) {
    setSongIn(c.title);
    setArtistIn(c.artist);
    loadSong(c.title, c.artist, c.artwork);
  }

  async function tapWord(chip: WordChip) {
    if (!words) return;
    setTerm(chip.term);
    setActiveLine(chip.line);
    setCard(null);
    setChat([]);
    setLoadingCard(true);
    setError(null);
    setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    try {
      const res = await fetch("/api/lyrics/word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          song: words.song,
          artist: words.artist,
          term: chip.term,
          direction,
        }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error ?? "ai_failed");
      }
      setCard((await res.json()) as WordCard);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ai_failed");
      setTerm(null);
    } finally {
      setLoadingCard(false);
    }
  }

  async function ask(question: string) {
    const q = question.trim();
    if (!q || !words || !term || chatBusy) return;
    setChatIn("");
    const history = chat;
    setChat([...history, { role: "user", text: q }]);
    setChatBusy(true);
    try {
      const res = await fetch("/api/lyrics/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          song: words.song,
          artist: words.artist,
          term,
          direction,
          question: q,
          history,
        }),
      });
      const d = (await res.json().catch(() => ({}))) as { answer?: string; error?: string };
      if (!res.ok || !d.answer) throw new Error(d.error ?? "ai_failed");
      setChat((c) => [...c, { role: "assistant", text: d.answer! }]);
    } catch {
      setChat((c) => [
        ...c,
        {
          role: "assistant",
          text: direction === "ko" ? "Sorry, I got stuck — try again?" : "잠깐 막혔어요. 다시 한 번 물어봐 주세요.",
        },
      ]);
    } finally {
      setChatBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24">
      {/* Direction toggle */}
      <div className="mt-2 inline-flex rounded-full border border-ink/10 bg-paper-2 p-1 font-kr text-sm">
        {(["en", "ko"] as Direction[]).map((d) => (
          <button
            key={d}
            onClick={() => switchDirection(d)}
            className={`rounded-full px-4 py-1.5 transition ${
              direction === d ? "bg-paper text-ink shadow-sm" : "text-ink/55 hover:text-ink"
            }`}
          >
            {d === "en" ? T.en.learn : T.ko.learn}
          </button>
        ))}
      </div>

      {/* Browse: chart columns + free input */}
      {!selected && (
        <>
          <h1 className="mt-6 font-kr text-2xl font-semibold tracking-tightish text-ink">
            차트 속 가사로 <span className="g-grad-text font-bold">단어</span> 공부
          </h1>
          <p className="mt-2 font-kr text-sm text-ink/55">{t.pick}</p>

          {(globalChart.length > 0 || kpopChart.length > 0) && (
            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2">
              <ChartColumn title="🔥 글로벌 차트" badge="Deezer · 매시간" entries={globalChart} onPick={pick} />
              <ChartColumn title="🇰🇷 K-pop 차트" badge="Deezer · 매시간" entries={kpopChart} onPick={pick} />
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadSong(songIn, artistIn);
            }}
            className="mt-6 flex flex-wrap items-center gap-2"
          >
            <input
              value={songIn}
              onChange={(e) => setSongIn(e.target.value)}
              placeholder={t.songPh}
              className="min-w-[10rem] flex-1 rounded-xl border border-ink/12 bg-paper px-3.5 py-2.5 font-kr text-sm text-ink outline-none focus:border-accent/50"
            />
            <input
              value={artistIn}
              onChange={(e) => setArtistIn(e.target.value)}
              placeholder={t.artistPh}
              className="min-w-[8rem] flex-1 rounded-xl border border-ink/12 bg-paper px-3.5 py-2.5 font-kr text-sm text-ink outline-none focus:border-accent/50"
            />
            <button
              type="submit"
              disabled={!songIn.trim()}
              className="rounded-xl bg-accent px-4 py-2.5 font-kr text-sm font-medium text-on-dark transition hover:bg-accent/90 disabled:opacity-40"
            >
              {t.analyze}
            </button>
          </form>
        </>
      )}

      {/* Selected: hero (album art rises to center) → Gemini loader → words */}
      {selected && (
        <section className="mt-3">
          <button
            onClick={backToCharts}
            className="font-kr text-sm text-ink/50 transition hover:text-ink"
          >
            ← {t.back}
          </button>

          <div className="lyr-hero-in mx-auto mt-6 flex flex-col items-center text-center">
            <div className="relative grid place-items-center">
              {loadingSong && <div aria-hidden className="lyr-glow" />}
              {selected.artwork ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.artwork}
                  alt=""
                  className={`relative z-10 h-32 w-32 rounded-3xl object-cover shadow-xl ${
                    loadingSong ? "lyr-breathe" : ""
                  }`}
                />
              ) : (
                <div
                  className={`relative z-10 grid h-32 w-32 place-items-center rounded-3xl bg-paper-2 text-4xl shadow-xl ${
                    loadingSong ? "lyr-breathe" : ""
                  }`}
                >
                  🎵
                </div>
              )}
            </div>

            <div className="relative z-10 mt-4 font-mono text-[11px] uppercase tracking-wide text-accent">
              {t.picked}
            </div>
            <h2 className="relative z-10 mt-2 font-serif text-[2rem] italic leading-tight text-ink">
              {selected.title}
            </h2>
            <p className="relative z-10 mt-1 font-kr text-sm text-ink/55">{selected.artist}</p>

            {loadingSong && (
              <p key={loadIdx} className="lyr-line-in g-grad-text mt-7 font-kr text-xl font-semibold">
                {t.loadingLines[loadIdx % t.loadingLines.length]}
              </p>
            )}
          </div>

          {error && (
            <p className="mt-6 rounded-xl bg-paper-2 px-4 py-3 text-center font-kr text-sm text-ink/70">
              {ERROR_COPY[error] ?? ERROR_COPY.ai_failed}
            </p>
          )}

          {!loadingSong && words && (
            <div className="mt-9">
              {words.note ? (
                <p className="font-kr text-[15px] leading-relaxed text-ink/80">{words.note}</p>
              ) : null}

              {words.words.length === 0 ? (
                <p className="mt-4 font-kr text-sm text-ink/55">{t.unknown}</p>
              ) : (
                <>
                  <p className="mt-4 font-kr text-xs text-ink/45">{t.tapHint}</p>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {words.words.map((w, i) => {
                      const active = term === w.term;
                      return (
                        <button
                          key={w.term}
                          onClick={() => tapWord(w)}
                          style={{ animationDelay: `${i * 55}ms` }}
                          className={`animate-rise rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 ${
                            active
                              ? "border-accent bg-accent/[0.06]"
                              : "border-ink/10 bg-paper hover:border-accent/40"
                          }`}
                        >
                          {w.line ? (
                            <div className="font-sans text-[15px] leading-snug text-ink/80">
                              {highlight(w.line, w.term)}
                            </div>
                          ) : (
                            <div className="font-sans text-[15px] font-medium text-ink">{w.term}</div>
                          )}
                          <div className="mt-1 flex items-center gap-2">
                            {w.teaser ? (
                              <span className="font-kr text-xs font-medium text-accent">{w.teaser}</span>
                            ) : (
                              <span className="font-kr text-xs text-ink/55">{w.gloss}</span>
                            )}
                            {w.kind === "slang" && (
                              <span className="rounded-full bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-accent">
                                slang
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      )}

      {/* Word card */}
      {term && (
        <section ref={cardRef} className="mt-10 scroll-mt-6">
          {loadingCard ? (
            <p className="font-kr text-sm text-ink/50">{t.loadingCard}</p>
          ) : card ? (
            <article className="animate-rise rounded-3xl border border-ink/10 bg-paper-2 p-6">
              <div className="flex items-baseline gap-3">
                <h2 className="font-serif text-3xl italic text-ink">{card.term}</h2>
                {card.reading && (
                  <span className="font-mono text-sm text-ink/45">{card.reading}</span>
                )}
              </div>

              {activeLine && (
                <div className="mt-2 font-sans text-[15px] text-ink/55">
                  <span className="text-ink/35">🎵 </span>
                  {highlight(activeLine, card.term)}
                </div>
              )}

              {card.hook && (
                <p className="mt-4 font-kr text-[19px] font-medium leading-relaxed text-ink">
                  {card.hook}
                </p>
              )}

              <p className="mt-3 font-kr text-[15px] leading-relaxed text-ink/70">{card.meaning}</p>

              {card.why && (
                <div className="mt-5">
                  <div className="font-mono text-[11px] uppercase tracking-wide text-accent">{t.why}</div>
                  <p className="mt-1 font-kr text-[15px] leading-relaxed text-ink/85">{card.why}</p>
                </div>
              )}

              {card.slang && (
                <div className="mt-5 rounded-2xl bg-accent/[0.06] px-4 py-3">
                  <div className="font-mono text-[11px] uppercase tracking-wide text-accent">{t.slang}</div>
                  <p className="mt-1 font-kr text-[15px] leading-relaxed text-ink/85">{card.slang}</p>
                </div>
              )}

              {card.examples.length > 0 && (
                <div className="mt-5">
                  <div className="font-mono text-[11px] uppercase tracking-wide text-ink/40">{t.examples}</div>
                  <ul className="mt-2 space-y-2">
                    {card.examples.map((ex, i) => (
                      <li key={i} className="rounded-xl bg-paper px-3.5 py-2.5">
                        <div className="font-sans text-[15px] text-ink">{ex.text}</div>
                        <div className="mt-0.5 font-kr text-xs text-ink/55">{ex.gloss}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {card.crossSongs.length > 0 && (
                <div className="mt-5">
                  <div className="font-mono text-[11px] uppercase tracking-wide text-ink/40">{t.cross}</div>
                  <ul className="mt-2 space-y-1.5">
                    {card.crossSongs.map((c, i) => (
                      <li key={i} className="font-kr text-sm text-ink/80">
                        <span className="font-sans font-medium text-ink">{c.title}</span>
                        {c.artist && <span className="text-ink/45"> · {c.artist}</span>}
                        {c.note && <span className="text-ink/60"> — {c.note}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Follow-up chat */}
              <div className="mt-6 border-t border-ink/10 pt-5">
                {chat.length > 0 && (
                  <div className="mb-4 space-y-3">
                    {chat.map((m, i) => (
                      <div
                        key={i}
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 font-kr text-sm leading-relaxed ${
                          m.role === "user"
                            ? "ml-auto bg-accent text-on-dark"
                            : "bg-paper text-ink/85"
                        }`}
                      >
                        {m.text}
                      </div>
                    ))}
                    {chatBusy && <div className="font-kr text-xs text-ink/40">…</div>}
                  </div>
                )}

                {chat.length === 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {t.quick.map((q) => (
                      <button
                        key={q}
                        onClick={() => ask(q)}
                        className="rounded-full border border-ink/10 bg-paper px-3 py-1.5 font-kr text-xs text-ink/70 transition hover:border-accent/40 hover:text-accent"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    ask(chatIn);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    value={chatIn}
                    onChange={(e) => setChatIn(e.target.value)}
                    placeholder={t.askPh}
                    className="flex-1 rounded-xl border border-ink/12 bg-paper px-3.5 py-2.5 font-kr text-sm text-ink outline-none focus:border-accent/50"
                  />
                  <button
                    type="submit"
                    disabled={chatBusy || !chatIn.trim()}
                    className="rounded-xl bg-ink px-4 py-2.5 font-kr text-sm font-medium text-on-dark transition hover:bg-ink/90 disabled:opacity-40"
                  >
                    {t.send}
                  </button>
                </form>
              </div>
            </article>
          ) : null}
        </section>
      )}
    </div>
  );
}
