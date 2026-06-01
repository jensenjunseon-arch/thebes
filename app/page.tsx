import Link from "next/link";
import { PolyaDemo } from "@/components/landing/PolyaDemo";
import { ReportPreview } from "@/components/landing/ReportPreview";
import { CountUpSavings } from "@/components/landing/CountUpSavings";
import { WhyCards } from "@/components/landing/WhyCards";

export const metadata = {
  title: "Thebes AI — AI 시대의 사고력을 가르칩니다",
  description:
    "답이 아니라 사고를 봅니다. 문제를 영어로 ‘어떻게 생각하는가’ — 사고를 넓히는 5단계 × 6개 사고력 구인 × AI 인재 리포트.",
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
        stroke="#14110C"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M11 28 V18 a5 5 0 0 1 10 0 V28"
        stroke="#B5411B"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="11" r="1.6" fill="#B5411B" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   Page
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
            <a href="#how">작동 방식</a>
            <a href="#report">성장 리포트</a>
            <a href="#why-en">왜 영어인가</a>
            <a href="#team">만든 사람들</a>
          </div>
          <Link href="/session/demo" className="lp-nav-cta">
            무료 진단 시작
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>→</span>
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="lp-hero lp-section">
        <div className="lp-container">
          <div className="lp-hero-eyebrow">
            <span className="dot" />
            <span>AI 시대의 사고력 코치</span>
          </div>
          <h1>
            영어학원도 가고,
            <br />
            수학학원도 다니는데,
            <br />
            <span className="serif-em">왜 수학을 영어로</span>
            <br />
            풀지는 못할까요?
          </h1>
          <p className="hero-sub">
            답은 AI가 냅니다. Thebes AI는 답이 아니라,
            <br />
            문제를 영어로 <b>‘어떻게 생각하는가’</b>
            <br />
            — AI 시대의 사고력을 키웁니다.
          </p>
          <div className="hero-cta lp-hero-cta">
            <Link href="/session/demo" className="lp-btn lp-btn-primary">
              사고력 진단 무료로 시작
              <span style={{ fontFamily: "var(--font-mono)" }}>→</span>
            </Link>
            <a className="lp-hero-secondary" href="#how">
              작동 방식 보기
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Counter (dark) ───────────────────────────────────── */}
      {/* ── Two academies ────────────────────────────────────── */}
      <section className="lp-section">
        <div className="lp-container">
          {/* HOOK — 스크롤 즉시 보이는 절약 메시지 */}
          <div className="lp-two-bridge">
            <div className="bridge-top">
              <span className="arrow">+ THEBES ──→</span>
              <span className="msg">
                두 학원의 예산을{" "}
                <em>하나의 사고 훈련</em>으로 묶습니다.
                <br />
                영어 학습이면서, 수학 사고 훈련이고, AI 시대 역량 교육입니다.
              </span>
            </div>
            <div className="bridge-savings">
              <div className="comp">
                <div className="comp-row">
                  <span className="comp-label">두 학원 합계</span>
                  <span className="comp-num">연간 1,800만원</span>
                </div>
                <div className="comp-row">
                  <span className="comp-label">Thebes 1년</span>
                  <span className="comp-num thebes">연간 99만원</span>
                </div>
              </div>
              <div className="save">
                <CountUpSavings target={1701} className="save-num" />
                <span className="save-lbl">기존 학원 대비 95% 절감</span>
              </div>
            </div>
          </div>

          <div className="lp-two-provocation">
            <p className="hook">
              학원 의자에 1년<span className="vs">vs.</span>영어가 통하는 곳에서 한 달.
            </p>
            <p className="body">
              Thebes가 아낀 <strong>1,701만원</strong>이면,<br />
              학원이 가르치지 못하는 세상을 자녀에게 직접 보여줄 수 있습니다.
            </p>
            <div className="examples">
              <span>미국 여름캠프 한 달 · 약 1,100만원</span>
              <span>유럽 어학연수 한 달 · 약 630만원</span>
              <span>4인 가족 동남아 두 달 · 약 1,000만원</span>
            </div>
          </div>

          {/* EVIDENCE — 1,800만원이 어디서 나왔는지 설명 */}
          <div className="lp-section-head lp-section-head-mid">
            <div className="lp-eyebrow">
              <span className="dot" />
              두 학원이 따로 노는 문제
            </div>
            <h2>
              영어와 수학은,
              <br />
              왜 평생 만나지 않을까요?
            </h2>
            <p className="lede">
              한국의 중·고등학생 상당수는 이미 영어학원과 수학학원을 동시에 다닙니다.
              그런데 이 둘은 평생 만나지 않습니다.
              영어는 영어대로, 수학은 수학대로 — 각자의 상자 안에 있습니다.
            </p>
          </div>
          <div className="lp-two-grid">
            <div className="lp-acad-card">
              <div className="tag">학원 A · 영어</div>
              <div className="subj">English</div>
              <div className="price">
                <span>월 평균 50–70만원 · 주 3회</span>
                <span className="yearly">연간 840만원</span>
              </div>
              <div className="what">
                <ul>
                  <li>단어 외우기</li>
                  <li>문법 문제 풀기</li>
                  <li>독해 지문 분석</li>
                  <li>내신·수능 점수</li>
                </ul>
              </div>
            </div>
            <div className="lp-acad-card">
              <div className="tag">학원 B · 수학</div>
              <div className="subj">수학</div>
              <div className="price">
                <span>월 평균 50–80만원 · 주 3회</span>
                <span className="yearly">연간 960만원</span>
              </div>
              <div className="what">
                <ul>
                  <li>공식 외우기</li>
                  <li>유형별 문제 풀이</li>
                  <li>속도 훈련</li>
                  <li>내신·수능 점수</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The truth ────────────────────────────────────────── */}
      <section className="lp-counter lp-section">
        <div className="lp-container">
          <div className="lp-section-head" style={{ marginBottom: 0 }}>
            <div className="lp-eyebrow">
              <span className="dot" />
              The truth nobody says out loud
            </div>
            <h2 style={{ marginTop: 18 }}>
              AI는 막을 수 없습니다.
              <br />
              <span className="em">잘 쓰는 아이로 키워야 합니다.</span>
            </h2>
            <p className="lede">
              다른 곳은 AI를 부정행위로 보고 막으려 합니다. 학교도, 학원도, 시험도.
              <br />
              Thebes는 AI를 <b>목적지</b>로 봅니다. 그리고 그것을 잘 다루는 사고력을 길러줍니다.
            </p>
          </div>
          <div className="lp-counter-compare">
            <div className="lp-counter-col them">
              <div className="label">대부분의 교육이 하는 일</div>
              <div className="h">AI를 막는다</div>
              <p>
                AI는 부정행위다. 시험장에 못 들어오게 한다.
                문제는 점점 어려워지고, 아이는 점점 외워간다.
                그리고 시험이 끝나면 — AI가 5초에 해내는 일을 한다.
              </p>
            </div>
            <div className="lp-counter-col us">
              <div className="label">Thebes AI가 하는 일</div>
              <div className="h">AI를 다루는 법을 가르친다</div>
              <p>
                AI는 평생 옆에 있을 도구다.
                좋은 질문을 던지고, 답을 검증하고, 다음 질문을 잇는 능력은{" "}
                <b>가르칠 수 있다</b>. 그리고 수학이 그 가장 정직한 훈련장이다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pólya demo ───────────────────────────────────────── */}
      <section className="lp-section lp-polya-bg" id="how">
        <div className="lp-container">
          <div className="lp-section-head">
            <div className="lp-eyebrow">
              <span className="dot" />
              How it works · 사고를 넓히는 5단계
            </div>
            <h2>
              답을 구하지 않습니다.
              <br />
              생각을 바깥으로 넓혀갑니다.
            </h2>
            <p className="lede">
              재정의 → 구성 요소 → 관계 → 나에게의 의미 → 세상으로의 확장.
              AI 코치가 매 세션 이 다섯 단계를 <b>영어 대화로</b> 함께 넓혀갑니다.
              한 단계씩 눌러보세요 — 실제 진단이 어떻게 흐르는지 보실 수 있습니다.
            </p>
          </div>
          <PolyaDemo />
        </div>
      </section>

      {/* ── Why English ──────────────────────────────────────── */}
      <section className="lp-section" id="why-en">
        <div className="lp-container">
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
              AI 시대에 영어는 &#8216;과목&#8217;이 아니라 <b>사고의 언어</b>입니다.
              왜 수학을 영어로 사고해야 하는지, 세 가지 이유.
            </p>
          </div>
          <WhyCards />
          <div className="lp-bilingual-note">
            <div className="lbl">정직하게 짚을 제약</div>
            <p>
              영어가 약한 학습자에게는 외국어 학습 부하가 수학 학습 자체를 저해할 수 있습니다.
              그래서 Thebes는 <b>이미 영어·수학 사교육을 받는 가정</b>을 1차 대상으로 합니다.
            </p>
            <p>
              또한 학습자의 영어 수준을 진단해, 어휘·문장 복잡도를 자동 조절합니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── Report ───────────────────────────────────────────── */}
      <section className="lp-section lp-report-bg" id="report">
        <div className="lp-container">
          <div className="lp-section-head">
            <div className="lp-eyebrow">
              <span className="dot" />
              자녀의 사고력이 자라는 것이 보입니다
            </div>
            <h2>
              점수표가 아닙니다.
              <br />
              진단 리포트입니다.
            </h2>
            <p className="lede">
              &#8216;사고력&#8217;이라는 모호한 단어를, 측정 가능한{" "}
              <b>6개 구인(構因)</b>으로 분해했습니다.
              자녀의 사고 과정을 그 기준으로 평가하고, 시계열로 보여드립니다.
              구인을 클릭해 보세요 — 어디서 어떻게 자라고 있는지 보실 수 있습니다.
            </p>
          </div>
          <ReportPreview />
        </div>
      </section>

      {/* ── VS ChatGPT ───────────────────────────────────────── */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <div className="lp-eyebrow">
              <span className="dot" />
              ChatGPT Study Mode와 무엇이 다른가요
            </div>
            <h2>
              &#8220;답 대신 질문하는 챗봇&#8221;은
              <br />
              이미 무료입니다. 그래서요?
            </h2>
            <p className="lede">
              2025년부터 무료 챗봇도 소크라테스식으로 묻습니다. 그래서 Thebes의 해자는
              &#8216;질문하는 AI&#8217;가 아니라, 그 위에 얹은{" "}
              <b>네 가지의 결합</b>입니다.
            </p>
          </div>
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
                us:   "6개 구인 기반 사고력 성장 리포트",
              },
              {
                dim: "구조",
                them: "커리큘럼·진도·난이도 곡선이 없는 범용 챗봇",
                us:   "추론 전이를 위해 설계된 문제 progression",
              },
              {
                dim: "결합",
                them: "영어와 수학이 의도적으로 융합되어 있지 않음",
                us:   "영어 × 수학을 하나의 학습 설계로 통합",
              },
              {
                dim: "가시성",
                them: "학부모가 자녀의 성장을 볼 수단이 없음",
                us:   "학부모용 리포트 = 신뢰·재구독의 근거",
              },
            ].map(({ dim, them, us }) => (
              <div key={dim} className="lp-vs-row">
                <div className="dim">{dim}</div>
                <div className="cell">{them}</div>
                <div className="cell ours">{us}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────── */}
      <section className="lp-team lp-section" id="team">
        <div className="lp-container">
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
          <div className="lp-team-grid lp-team-grid-3">
            <div className="lp-member">
              <div className="role">Mathematics · 수학 담당</div>
              <div className="school">
                NYU
                <br />
                Department of Mathematics
              </div>
              <p>
                제품의 학문적 정당성.<br />
                사고력 측정 체계를 실제 커리큘럼과<br />
                문제 풀로 구현하고, 영어 수학<br />
                어휘·표현의 정확성을 책임집니다.
              </p>
            </div>
            <div className="lp-member">
              <div className="role">Psychometrics · 진단 담당</div>
              <div className="school">
                U. Minnesota · Psychology
                <br />
                John Jay · Forensic Psych.
              </div>
              <p>
                학습 경험 설계, 그리고 — 결정적으로 —<br />
                측정 모델의 설계.<br />
                심리측정·진단 전문성이<br />
                &#8220;추론 절차의 질을 구인으로 분해하고<br />
                채점·타당화한다&#8221;는 해자를 직접 만듭니다.
              </p>
            </div>
            <div className="lp-member">
              <div className="role">Engineering · 개발 담당</div>
              <div className="school">
                UC Davis
                <br />
                Computer Science (B.S.)
              </div>
              <p>
                AI 파이프라인·스코어링 시스템·<br />
                학부모 리포트 데이터 레이어까지<br />
                제품의 기술 인프라 전체를 설계합니다.<br />
                측정 모델이 실제로 작동하도록 만드는 것이<br />
                이 팀의 역할입니다.
              </p>
            </div>
          </div>
          <blockquote className="lp-team-quote">
            &#8220;학원이 점수를 책임진다면, 우리는 그 점수가 측정하지 못하는{" "}
            <span style={{ color: "var(--accent-soft)" }}>사고력</span>을 책임집니다.
            그리고 그것을, 모호한 칭찬이 아니라 진단 리포트로 보여드립니다.&#8221;
          </blockquote>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────── */}
      <section className="lp-closing">
        <div className="lp-container">
          <h2>
            AI 시대의 사고력은
            <br />
            <span className="em">가르칠 수 있습니다.</span>
            <br />
            우리 아이의 첫 문제부터 시작하세요.
          </h2>
          <p className="sub">
            무료 사고력 진단 → 학부모 리포트 1부 → 월 구독.
            <br />
            한 학원비의 일부 가격으로,
            <br />
            두 학원이 못 가르치는 것을.
          </p>
          <div className="lp-hero-cta" style={{ justifyContent: "center", marginTop: 40 }}>
            <Link href="/session/demo" className="lp-btn lp-btn-primary">
              사고력 진단 무료로 시작
              <span style={{ fontFamily: "var(--font-mono)" }}>→</span>
            </Link>
            <a href="mailto:hello@thebes.ai" className="lp-btn lp-btn-ghost">
              학원 파트너 문의
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container inner">
          <div>© 2026 Thebes AI · 답이 아니라 사고를 키우는 AI 코치</div>
          <div style={{ display: "flex", gap: 18 }}>
            <a href="#">개인정보처리방침</a>
            <a href="#">이용약관</a>
            <a href="mailto:hello@thebes.ai">문의</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
