import Link from "next/link";
import { LangSwitch } from "@/components/LangSwitch";
import { Reveal, LineRise } from "@/components/landing/Reveal";
import { Highlights } from "@/components/landing/Highlights";
import { StickyJourney } from "@/components/landing/StickyJourney";
import { FloatingCTA } from "@/components/landing/FloatingCTA";
import { WhyCards } from "@/components/landing/WhyCards";

export const metadata = {
  title: "Thebes AI — Grow into AI-native talent",
  description:
    "Snap a math problem, reason it through in English, and watch your own thinking become a real AI build you can play, share, and finally understand.",
};

/* ── SVG brand mark ────────────────────────────────────────── */
function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      className="lp-brand-mark"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 28 V14 a10 10 0 0 1 20 0 V28"
        stroke="#1F1F1F"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M11 28 V18 a5 5 0 0 1 10 0 V28"
        stroke="#0B57D0"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="11" r="1.6" fill="#0B57D0" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   English landing — same structure / design / scroll grammar as
   the Korean page, with English content (no academy framing).
   ══════════════════════════════════════════════════════════════ */
export default function GlobalLanding() {
  return (
    <div className="lp-root" style={{ background: "var(--paper)", color: "var(--ink)", fontFamily: "var(--font-sans)" }}>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link href="/en" className="lp-brand">
            <BrandMark />
            <span>Thebes</span>
            <span className="lp-brand-ai">AI</span>
          </Link>
          <div className="lp-nav-links">
            <a href="#journey">How it works</a>
            <a href="#why-en">Why English</a>
            <a href="#team">The team</a>
          </div>
          <div className="lp-nav-right">
            <Link href="/studio" className="lp-nav-cta">
              Start free
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>→</span>
            </Link>
            <LangSwitch active="en" />
          </div>
        </div>
      </nav>

      <FloatingCTA lang="en" />

      {/* ── Hero — the manifesto, rising line by line ───────────── */}
      <section className="lp-hero lp-section" style={{ overflow: "hidden" }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 760,
              height: 420,
              maxWidth: "94vw",
              borderRadius: "50%",
              background: "var(--accent-soft)",
              opacity: 0.5,
              filter: "blur(80px)",
            }}
          />
        </div>
        <div className="lp-container">
          <div className="lp-hero-eyebrow">
            <span className="dot" />
            <span>AI-native thinking · for the next generation</span>
          </div>
          <h1 style={{ fontSize: "clamp(27px, 3.7vw, 46px)", lineHeight: 1.17, maxWidth: 820 }}>
            <LineRise
              lines={[
                "English is global.",
                "Math is universal.",
                <span key="em">
                  AI requires{" "}
                  <span style={{ color: "var(--accent)", whiteSpace: "nowrap" }}>
                    &lsquo;universally global&rsquo;
                  </span>{" "}
                  language.
                </span>,
              ]}
            />
          </h1>
          <Reveal delay={420}>
            <p className="hero-sub" style={{ maxWidth: 540 }}>
              Snap a math problem, reason it through in English, and watch your own thinking
              become a real game you can play — and finally understand.
            </p>
          </Reveal>
          <Reveal delay={560}>
            <div className="hero-cta lp-hero-cta">
              <Link href="/studio" className="lp-btn lp-btn-primary">
                Drop a problem, start
                <span style={{ fontFamily: "var(--font-mono)" }}>→</span>
              </Link>
              <Link className="lp-hero-secondary" href="/session/demo">
                5-min thinking diagnostic
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Highlights — horizontal snap carousel ───────────── */}
      <section className="lp-section" style={{ paddingTop: 88 }}>
        <div className="lp-container">
          <Reveal>
            <h2 className="lp-giant">
              At a glance<span style={{ color: "var(--accent)" }}>.</span>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lede" style={{ marginTop: 14, fontSize: 18, color: "var(--ink-2)", maxWidth: 560 }}>
              From a photo to a finished build — swipe through the cards.
            </p>
          </Reveal>
          <div style={{ marginTop: 36 }}>
            <Highlights lang="en" />
          </div>
        </div>
      </section>

      {/* ── Dark chapter — the shift ─────────────────────────── */}
      <section className="lp-counter lp-section">
        <div className="lp-container">
          <div className="lp-eyebrow" style={{ marginBottom: 18 }}>
            <span className="dot" />
            The shift no one prepared you for
          </div>
          <h2 className="lp-giant" style={{ color: "var(--on-dark)" }}>
            <LineRise
              lines={[
                "The answer is free now.",
                <span key="em" className="em">The thinking behind it isn&apos;t.</span>,
              ]}
            />
          </h2>

          <Reveal delay={140}>
            <div className="lp-counter-compare" style={{ marginTop: 56 }}>
              <div className="lp-counter-col us">
                <div className="label">What Thebes builds</div>
                <div className="h">The reasoning AI can&apos;t replace</div>
                <p>
                  Framing the problem, seeing how things connect,<br />
                  and directing AI to build on your thinking.
                </p>
              </div>
              <div className="lp-counter-col them">
                <div className="label">What most schooling trains</div>
                <div className="h">Faster, more, fewer mistakes</div>
                <p>
                  More problems, solved quicker, with no errors —<br />
                  exactly what AI does in five seconds, for free.
                </p>
              </div>
            </div>
          </Reveal>

          {/* the big accent beat — Apple-style, no fake number */}
          <Reveal delay={120}>
            <div style={{ marginTop: 88, textAlign: "center" }}>
              <p style={{ fontSize: 15, color: "var(--on-dark-2)" }}>
                What the AI era actually pays for —
              </p>
              <p style={{ marginTop: 14 }} className="lp-stat-num">
                the clearest thinker.
              </p>
              <p style={{ marginTop: 10, fontSize: 14, color: "var(--on-dark-3)" }}>
                not the fastest calculator.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Sticky journey — one problem, four stages ───────── */}
      <section className="lp-section" id="journey">
        <div className="lp-container">
          <Reveal>
            <div className="lp-eyebrow" style={{ marginBottom: 16 }}>
              <span className="dot" />
              How it works
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="lp-giant" style={{ maxWidth: 720 }}>
              One problem&apos;s journey<span style={{ color: "var(--accent)" }}>.</span>
            </h2>
          </Reveal>
          <div style={{ marginTop: 24 }}>
            <StickyJourney lang="en" />
          </div>
        </div>
      </section>

      {/* ── Why English ──────────────────────────────────────── */}
      <section className="lp-section" id="why-en" style={{ background: "var(--paper-2)" }}>
        <div className="lp-container">
          <Reveal>
            <div className="lp-section-head">
              <div className="lp-eyebrow">
                <span className="dot" />
                Why English
              </div>
              <h2>
                The steps you skip in your own language,
                <br />
                English makes you take{" "}
                <span style={{ whiteSpace: "nowrap" }}>one by one.</span>
              </h2>
              <p className="lede">
                In the AI era, English isn&apos;t a school subject — it&apos;s{" "}
                <b>the language of reasoning</b>. Three reasons to do your math thinking in it.
              </p>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <WhyCards lang="en" />
          </Reveal>
          <Reveal delay={200}>
            <div className="lp-bilingual-note">
              <div className="lbl">An honest constraint</div>
              <p>
                Reasoning in a second language adds load, so difficulty{" "}
                <b>auto-adjusts to your English level</b>. Built for learners ready to think in
                English — not just translate it.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── The share loop ───────────────────────────────────── */}
      <section className="lp-section">
        <div className="lp-container" style={{ textAlign: "center" }}>
          <Reveal>
            <div className="lp-eyebrow" style={{ marginBottom: 16, justifyContent: "center" }}>
              <span className="dot" />
              The build doesn&apos;t end alone
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="lp-giant">
              One link —
              <br />
              <span className="g-grad-text">&ldquo;play my game.&rdquo;</span>
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="lede" style={{ margin: "20px auto 0", maxWidth: 560, fontSize: 18, color: "var(--ink-2)" }}>
              Every game and quiz gets a share link. Whoever opens it plays instantly — then
              builds their own from their own problem. The moment studying becomes a flex.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div
              style={{
                margin: "44px auto 0",
                maxWidth: 420,
                textAlign: "left",
                border: "1px solid var(--line)",
                borderRadius: 24,
                padding: "22px 24px",
                background: "var(--paper)",
                boxShadow: "0 30px 70px -34px rgba(31,35,40,0.3)",
              }}
            >
              <div
                style={{
                  alignSelf: "flex-start",
                  display: "inline-block",
                  background: "#0B57D0",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "10px 14px",
                  borderRadius: "16px 16px 16px 4px",
                }}
              >
                play the game I made 👀
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--accent)",
                  background: "var(--paper-2)",
                  borderRadius: 999,
                  padding: "9px 14px",
                  display: "inline-block",
                }}
              >
                thebes.ai/play/x7k2a9
              </div>
              <p style={{ marginTop: 12, fontSize: 12.5, color: "var(--ink-3)" }}>
                On their screen too — &ldquo;make your own →&rdquo;
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── VS ChatGPT ───────────────────────────────────────── */}
      <section className="lp-section" style={{ background: "var(--paper-2)" }}>
        <div className="lp-container">
          <Reveal>
            <div className="lp-section-head">
              <div className="lp-eyebrow">
                <span className="dot" />
                How it differs from ChatGPT Study Mode
              </div>
              <h2>
                &ldquo;A bot that asks instead of answers&rdquo;
                <br />
                is already free. So what?
              </h2>
              <p className="lede">
                Free bots ask Socratic questions too. So Thebes&apos; moat isn&apos;t the{" "}
                &lsquo;asking AI&rsquo; — it&apos;s every step from the problem coming in to a
                build going out: <b>all four of them</b>.
              </p>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div className="lp-vs-table">
              <div className="lp-vs-row head">
                <div>Dimension</div>
                <div>Free chatbot (Study Mode-style)</div>
                <div className="ours">Thebes AI</div>
              </div>
              {[
                {
                  dim: "Input",
                  them: "Type the problem yourself — in your own language",
                  us: "One photo → English, with word meanings + a figure you rotate",
                },
                {
                  dim: "Process",
                  them: "One long chat aimed at the answer",
                  us: "One line at a time in English — ~1s coaching, trace when stuck",
                },
                {
                  dim: "Output",
                  them: "Nothing remains when the chat ends",
                  us: "Your solution becomes a game/quiz — plays here, shares by link",
                },
                {
                  dim: "Growth",
                  them: "Can't show whether your thinking grew",
                  us: "A six-construct thinking-growth report over time",
                },
              ].map(({ dim, them, us }) => (
                <div key={dim} className="lp-vs-row">
                  <div className="dim">{dim}</div>
                  <div className="cell">{them}</div>
                  <div className="cell ours">{us}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────── */}
      <section className="lp-team lp-section" id="team">
        <div className="lp-container">
          <Reveal>
            <div className="lp-section-head">
              <div className="lp-eyebrow">
                <span className="dot" />
                The team
              </div>
              <h2>
                Built by people who
                <br />
                <span className="em">measure minds for a living.</span>
              </h2>
            </div>
          </Reveal>
          <div className="lp-team-grid lp-team-grid-3">
            {[
              {
                role: "Mathematics",
                school: ["New York University", "Department of Mathematics"],
                body: "Owns the rigor of the reasoning and the accuracy of every problem.",
              },
              {
                role: "Psychometrics",
                school: ["University of Minnesota", "John Jay College"],
                body: "Turns the fuzzy word “thinking” into something measurable.",
              },
              {
                role: "Engineering",
                school: ["University of California, Davis", "Computer Science (B.S.)"],
                body: "Makes measurement and diagnosis into a product that actually works.",
              },
            ].map((m, i) => (
              <Reveal key={m.role} delay={i * 120} className="lp-member">
                <div className="role">{m.role}</div>
                <div className="school">
                  {m.school[0]}
                  <br />
                  {m.school[1]}
                </div>
                <p>{m.body}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <blockquote className="lp-team-quote">
              &ldquo;A test can own the score. We own the{" "}
              <span style={{ color: "var(--accent-soft)" }}>thinking</span> the score can&apos;t
              see — and we show it as a diagnosis, not vague praise.&rdquo;
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────── */}
      <section className="lp-closing">
        <div className="lp-container">
          <h2 className="lp-giant" style={{ textAlign: "center" }}>
            <LineRise
              lines={[
                "AI-era thinking",
                <span key="em" className="em">can be taught.</span>,
              ]}
            />
          </h2>
          <Reveal delay={200}>
            <p className="sub" style={{ textAlign: "center" }}>
              Start with your very first problem.
              <br />
              Free · no sign-up · one photo is enough.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="lp-hero-cta" style={{ justifyContent: "center", marginTop: 40 }}>
              <Link href="/studio" className="lp-btn lp-btn-primary">
                Drop a problem, start
                <span style={{ fontFamily: "var(--font-mono)" }}>→</span>
              </Link>
              <a href="mailto:hello@thebes.ai" className="lp-btn lp-btn-ghost">
                Partner with us
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container inner">
          <div>© 2026 Thebes AI · The thinking diagnostic for the AI era</div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <Link href="/methodology">Methodology</Link>
            <Link href="/connect">Developers</Link>
            <Link href="/">한국어</Link>
            <a href="mailto:hello@thebes.ai">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
