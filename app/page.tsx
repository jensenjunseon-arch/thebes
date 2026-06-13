import Link from "next/link";
import { WhyCards } from "@/components/landing/WhyCards";
import { LangSwitch } from "@/components/LangSwitch";
import { Reveal, LineRise, StatCount } from "@/components/landing/Reveal";
import { Highlights } from "@/components/landing/Highlights";
import { StickyJourney } from "@/components/landing/StickyJourney";
import { FloatingCTA } from "@/components/landing/FloatingCTA";

export const metadata = {
  title: "Thebes AI — AI 시대의 사고력을 가르칩니다",
  description:
    "수학 문제 사진 한 장이면 — 영어로 생각하고, 한 줄씩 코칭받고, 내 풀이가 게임이 됩니다. AI 시대의 사고력을 키우는 Thebes Studio.",
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
   Page — Apple product-page grammar, Gemini-clean tone.
   Chapter rhythm: light hero → carousel → dark statement →
   sticky journey → why-english → share loop → vs → team → closing.
   ══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="lp-root" style={{ background: "var(--paper)", color: "var(--ink)", fontFamily: "var(--font-kr)" }}>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-brand">
            <BrandMark />
            <span>Thebes</span>
            <span className="lp-brand-ai">AI</span>
          </Link>
          <div className="lp-nav-links">
            <a href="#journey">작동 방식</a>
            <a href="#why-en">왜 영어인가</a>
            <a href="#team">만든 사람들</a>
          </div>
          <div className="lp-nav-right">
            <Link href="/studio" className="lp-nav-cta">
              무료로 시작
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>→</span>
            </Link>
            <LangSwitch active="ko" />
          </div>
        </div>
      </nav>

      <FloatingCTA />

      {/* ── Hero — giant type rising line by line ───────────── */}
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
            <span>AI 시대의 사고력 코치</span>
          </div>
          <h1>
            <LineRise
              lines={[
                "영어학원도 가고,",
                "수학학원도 다니는데,",
                <span key="em" className="serif-em">왜 수학을 영어로</span>,
                "풀지는 못할까요?",
              ]}
            />
          </h1>
          <Reveal delay={420}>
            <p className="hero-sub">
              답은 AI가 냅니다. Thebes AI는 답이 아니라,
              <br />
              문제를 영어로 <b>&lsquo;어떻게 생각하는가&rsquo;</b>
              <br />
              — AI 시대의 사고력을 키웁니다.
            </p>
          </Reveal>
          <Reveal delay={560}>
            <div className="hero-cta lp-hero-cta">
              <Link href="/studio" className="lp-btn lp-btn-primary">
                문제 사진 올리고 시작
                <span style={{ fontFamily: "var(--font-mono)" }}>→</span>
              </Link>
              <Link className="lp-hero-secondary" href="/session/demo">
                5분 사고력 진단
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
              한눈에 보기<span style={{ color: "var(--accent)" }}>.</span>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lede" style={{ marginTop: 14, fontSize: 18, color: "var(--ink-2)", maxWidth: 560 }}>
              문제 사진 한 장이 결과물이 되기까지 — 카드를 옆으로 넘겨보세요.
            </p>
          </Reveal>
          <div style={{ marginTop: 36 }}>
            <Highlights />
          </div>
        </div>
      </section>

      {/* ── Dark chapter — the truth + the cost ─────────────── */}
      <section className="lp-counter lp-section">
        <div className="lp-container">
          <div className="lp-eyebrow" style={{ marginBottom: 18 }}>
            <span className="dot" />
            The truth nobody says out loud
          </div>
          <h2 className="lp-giant" style={{ color: "var(--on-dark)" }}>
            <LineRise
              lines={[
                "AI는 막을 수 없습니다.",
                <span key="em" className="em">잘 쓰는 아이로 키워야 합니다.</span>,
              ]}
            />
          </h2>

          <Reveal delay={140}>
            <div className="lp-counter-compare" style={{ marginTop: 56 }}>
              <div className="lp-counter-col us">
                <div className="label">Thebes AI가 하는 일</div>
                <div className="h">AI 네이티브처럼 생각하는 법을 가르친다</div>
                <p>
                  좋은 질문을 던지고 답을 검증하는 힘,<br />
                  수학이 가장 정직한 훈련 방법입니다.
                </p>
              </div>
              <div className="lp-counter-col them">
                <div className="label">대부분의 교육이 하는 일</div>
                <div className="h">더 빨리, 더 많이 푼다</div>
                <p>
                  수능 날 더 많이, 더 빠르게, 실수 없이.<br />
                  그런데 그건, AI가 5초에 해내는 일입니다.
                </p>
              </div>
            </div>
          </Reveal>

          {/* the big colored stat — Apple Wi-Fi-7 style */}
          <Reveal delay={120}>
            <div style={{ marginTop: 88, textAlign: "center" }}>
              <p style={{ fontSize: 15, color: "var(--on-dark-2)" }}>
                영어학원 + 수학학원, 두 학원 대신 하나의 사고 훈련 —
              </p>
              <p style={{ marginTop: 14 }}>
                <StatCount
                  end={1701}
                  prefix="연간 "
                  suffix="만원"
                  className="lp-stat-num"
                />
              </p>
              <p style={{ marginTop: 10, fontSize: 14, color: "var(--on-dark-3)" }}>
                아낄 수 있습니다 · 기존 두 학원 합계 대비 95% 절감
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
              문제 하나의 여정<span style={{ color: "var(--accent)" }}>.</span>
            </h2>
          </Reveal>
          <div style={{ marginTop: 24 }}>
            <StickyJourney />
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
                왜 영어인가
              </div>
              <h2>
                모국어로는 건너뛰던 단계를,
                <br />
                영어로는{" "}
                <span style={{ whiteSpace: "nowrap" }}>한 칸씩</span> 짚게 됩니다.
              </h2>
              <p className="lede">
                AI 시대에 영어는 &lsquo;과목&rsquo;이 아니라 <b>사고의 언어</b>입니다.
                왜 수학을 영어로 사고해야 하는지, 세 가지 이유.
              </p>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <WhyCards />
          </Reveal>
          <Reveal delay={200}>
            <div className="lp-bilingual-note">
              <div className="lbl">정직하게 짚을 제약</div>
              <p>
                영어 부하가 수학 학습을 방해할 수 있어, <b>이미 영어·수학 사교육을 받는 가정</b>을
                1차 대상으로 합니다. 영어 수준에 맞춰 난이도는 자동 조절됩니다.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── NEW · the share loop ─────────────────────────────── */}
      <section className="lp-section">
        <div className="lp-container" style={{ textAlign: "center" }}>
          <Reveal>
            <div className="lp-eyebrow" style={{ marginBottom: 16, justifyContent: "center" }}>
              <span className="dot" />
              결과물은 혼자 끝나지 않습니다
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="lp-giant">
              링크 하나로,
              <br />
              <span className="g-grad-text">&ldquo;내가 만든 게임 해봐.&rdquo;</span>
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="lede" style={{ margin: "20px auto 0", maxWidth: 560, fontSize: 18, color: "var(--ink-2)" }}>
              완성한 게임·퀴즈에 공유 링크가 생깁니다. 받은 친구는 바로 플레이하고 —
              자기 문제로 또 만듭니다. 공부가 자랑이 되는 순간.
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
                  background: "#FEE500",
                  color: "#1F1F1F",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "10px 14px",
                  borderRadius: "16px 16px 16px 4px",
                }}
              >
                내가 만든 게임 해봐 👀
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
                받은 친구의 화면에도 — &ldquo;내 문제로 만들어보기 →&rdquo;
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
                ChatGPT Study Mode와 무엇이 다른가요
              </div>
              <h2>
                &ldquo;답 대신 질문하는 챗봇&rdquo;은
                <br />
                이미 무료입니다. 그래서요?
              </h2>
              <p className="lede">
                2025년부터 무료 챗봇도 소크라테스식으로 묻습니다. 그래서 Thebes의 해자는
                &lsquo;질문하는 AI&rsquo;가 아니라, 그 위에 얹은{" "}
                <b>네 가지의 결합</b>입니다.
              </p>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div className="lp-vs-table">
              <div className="lp-vs-row head">
                <div>차원</div>
                <div>무료 챗봇 (Study Mode 류)</div>
                <div className="ours">Thebes AI</div>
              </div>
              {[
                {
                  dim: "측정",
                  them: "추론 절차의 질을 진단·시계열로 보여주지 못함",
                  us: "6개 구인 기반 사고력 성장 리포트",
                },
                {
                  dim: "구조",
                  them: "커리큘럼·진도·난이도 곡선이 없는 범용 챗봇",
                  us: "추론 전이를 위해 설계된 문제 progression",
                },
                {
                  dim: "결합",
                  them: "영어와 수학이 의도적으로 융합되어 있지 않음",
                  us: "영어 × 수학을 하나의 학습 설계로 통합",
                },
                {
                  dim: "결과물",
                  them: "대화가 끝나면 아무것도 남지 않음",
                  us: "내 풀이가 게임·퀴즈가 되어 남고, 링크로 공유",
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
                만든 사람들
              </div>
              <h2>
                AI 인재를 양성하기 위한
                <br />
                <span className="em">전문가들</span>이 모였습니다.
              </h2>
            </div>
          </Reveal>
          <div className="lp-team-grid lp-team-grid-3">
            {[
              {
                role: "Mathematics · 수학 담당",
                school: ["New York University", "Department of Mathematics"],
                body: "사고력의 학문적 근거와, 영어·수학 콘텐츠의 정확성을 책임집니다.",
              },
              {
                role: "Psychometrics · 진단 담당",
                school: ["University of Minnesota", "John Jay College"],
                body: "'사고력'이라는 모호한 말을, 측정 가능한 기준으로 바꿉니다.",
              },
              {
                role: "Engineering · 개발 담당",
                school: ["University of California, Davis", "Computer Science (B.S.)"],
                body: "측정과 진단이, 실제로 작동하는 제품이 되게 만듭니다.",
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
              &ldquo;학원이 점수를 책임진다면, 우리는 그 점수가 측정하지 못하는{" "}
              <span style={{ color: "var(--accent-soft)" }}>사고력</span>을 책임집니다.
              그리고 그것을, 모호한 칭찬이 아니라 진단 리포트로 보여드립니다.&rdquo;
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
                "AI 시대의 사고력은",
                <span key="em" className="em">가르칠 수 있습니다.</span>,
              ]}
            />
          </h2>
          <Reveal delay={200}>
            <p className="sub" style={{ textAlign: "center" }}>
              우리 아이의 첫 문제부터 시작하세요.
              <br />
              무료 · 로그인 없이 · 사진 한 장이면 충분합니다.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="lp-hero-cta" style={{ justifyContent: "center", marginTop: 40 }}>
              <Link href="/studio" className="lp-btn lp-btn-primary">
                문제 사진 올리고 시작
                <span style={{ fontFamily: "var(--font-mono)" }}>→</span>
              </Link>
              <a href="mailto:hello@thebes.ai" className="lp-btn lp-btn-ghost">
                학원 파트너 문의
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container inner">
          <div>© 2026 Thebes AI · 답이 아니라 사고를 키우는 AI 코치</div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <Link href="/methodology">측정 방법론</Link>
            <Link href="/connect">개발자·연동</Link>
            <a href="#">개인정보처리방침</a>
            <a href="mailto:hello@thebes.ai">문의</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
