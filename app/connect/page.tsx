import type { Metadata } from "next";
import { CANONICAL_URL } from "@/lib/connector";

export const metadata: Metadata = {
  title: "Thebes AI — Connect (GPTs · MCP)",
  description: "Thebes AI를 ChatGPT(Explore GPTs)와 Claude 등 커넥터에 연결하는 방법.",
};

const OPENAPI = `${CANONICAL_URL}/api/openapi.json`;
const MCP = `${CANONICAL_URL}/api/mcp`;

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink/15 bg-paper-2 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/45">{label}</p>
      <code className="mt-1 block break-all font-mono text-[13px] text-accent">{value}</code>
    </div>
  );
}

export default function ConnectPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl break-keep px-5 py-16 text-ink sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-tighter2 text-accent">
        Developers · Connectors
      </p>
      <h1 className="mt-2 font-kr text-3xl font-bold tracking-tighter2 sm:text-4xl">
        Thebes를 어디서든 불러오세요
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
        Thebes의 6가지 사고력·진단 방법론·AI 인재 리포트를 읽기 전용 API로 공개합니다.
        ChatGPT의 나만의 GPT, Claude 커넥터, 그 밖의 도구에 그대로 연결할 수 있어요.
      </p>

      <div className="mt-8 space-y-3">
        <Field label="OpenAPI (ChatGPT GPT Actions)" value={OPENAPI} />
        <Field label="MCP endpoint (Claude · 커넥터)" value={MCP} />
      </div>

      {/* ChatGPT */}
      <section className="mt-10">
        <h2 className="font-kr text-lg font-bold">ChatGPT — 나만의 GPT (Explore GPTs)</h2>
        <ol className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink/75">
          <li>1. ChatGPT → <b>Explore GPTs</b> → <b>Create</b> → <b>Configure</b> → <b>Actions</b>.</li>
          <li>2. <b>Import from URL</b>에 위 OpenAPI 주소를 붙여넣기.</li>
          <li>3. 3개 액션(getAbout · listConstructs · getReport)이 잡히면 저장.</li>
          <li>
            4. 인스트럭션 예: <span className="text-ink/55">“너는 Thebes AI 진단 안내자다.
            getAbout로 방법론을 설명하고, getReport(id=sample)로 리포트를 해석해 줘.”</span>
          </li>
        </ol>
      </section>

      {/* Claude */}
      <section className="mt-8">
        <h2 className="font-kr text-lg font-bold">Claude — 커스텀 커넥터 (MCP)</h2>
        <ol className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink/75">
          <li>1. Claude → Settings → <b>Connectors</b> → <b>Add custom connector</b>.</li>
          <li>2. URL에 위 MCP 주소를 입력.</li>
          <li>
            3. 도구 3종이 노출됩니다: <code className="font-mono text-[13px] text-accent">get_about</code> ·{" "}
            <code className="font-mono text-[13px] text-accent">list_constructs</code> ·{" "}
            <code className="font-mono text-[13px] text-accent">get_report</code>.
          </li>
        </ol>
        <p className="mt-3 text-[12.5px] leading-relaxed text-ink/45">
          MCP는 표준 Streamable HTTP(JSON-RPC) 기반의 읽기 전용 서버입니다. 사용자 데이터·쓰기·비밀
          없이 공개 정보만 제공합니다.
        </p>
      </section>

      {/* Plain REST */}
      <section className="mt-8">
        <h2 className="font-kr text-lg font-bold">그 외 — 일반 REST</h2>
        <ul className="mt-3 space-y-1.5 font-mono text-[13px] text-ink/70">
          <li>GET <span className="text-accent">/api/v1/about</span></li>
          <li>GET <span className="text-accent">/api/v1/constructs</span></li>
          <li>GET <span className="text-accent">/api/v1/report/sample</span></li>
        </ul>
        <p className="mt-3 text-[12.5px] leading-relaxed text-ink/45">
          CORS 허용 · 읽기 전용. 학생별 리포트 저장은 계정 연동 이후 동일한 스키마로 제공됩니다.
        </p>
      </section>
    </main>
  );
}
