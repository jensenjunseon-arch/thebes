import {
  aboutPayload,
  constructsPayload,
  SAMPLE_REPORT,
  CORS_HEADERS,
  preflight,
} from "@/lib/connector";

// Minimal MCP server over Streamable HTTP (stateless, JSON responses).
// Implements the request/response surface MCP clients (Claude connectors, etc.)
// use for tool discovery and calls: initialize, tools/list, tools/call, ping.
// No SSE / server-initiated messages needed for read-only tools.

const SERVER_INFO = { name: "thebes-ai", version: "1.0.0" };

const TOOLS = [
  {
    name: "get_about",
    description:
      "What Thebes AI is: its mission, methodology, why-English rationale, and the six thinking constructs.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "list_constructs",
    description: "The six thinking constructs Thebes measures (id, Korean/English name, definition).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_report",
    description:
      "Fetch an AI Talent Report by id and return it as structured JSON. Use id 'sample' for the demo report.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Report id; 'sample' returns the demo report." },
      },
      additionalProperties: false,
    },
  },
] as const;

function textContent(value: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}

function callTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "get_about":
      return textContent(aboutPayload());
    case "list_constructs":
      return textContent(constructsPayload());
    case "get_report": {
      const id = typeof args.id === "string" ? args.id : "sample";
      if (id !== "sample") {
        return {
          content: [{ type: "text", text: `리포트를 찾을 수 없어요 (id=${id}). 데모는 id=sample 입니다.` }],
          isError: true,
        };
      }
      return textContent(SAMPLE_REPORT);
    }
    default:
      return null;
  }
}

interface RpcMessage {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

function handleOne(msg: RpcMessage): object | null {
  const { id, method, params } = msg;
  // Notifications (no id) get no response.
  if (id === undefined || id === null) return null;

  const ok = (result: object) => ({ jsonrpc: "2.0", id, result });
  const err = (code: number, message: string) => ({
    jsonrpc: "2.0",
    id,
    error: { code, message },
  });

  switch (method) {
    case "initialize": {
      const pv =
        typeof params?.protocolVersion === "string"
          ? (params.protocolVersion as string)
          : "2025-06-18";
      return ok({
        protocolVersion: pv,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions:
          "Thebes AI diagnoses how a student thinks (in English) across six constructs. Use get_about for grounding, list_constructs for the framework, get_report to fetch a report.",
      });
    }
    case "ping":
      return ok({});
    case "tools/list":
      return ok({ tools: TOOLS });
    case "tools/call": {
      const name = params?.name as string;
      const args = (params?.arguments as Record<string, unknown>) ?? {};
      const res = callTool(name, args);
      if (!res) return err(-32602, `Unknown tool: ${name}`);
      return ok(res);
    }
    default:
      return err(-32601, `Method not found: ${method}`);
  }
}

export function OPTIONS() {
  return preflight();
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }),
      { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } },
    );
  }

  const headers = { "Content-Type": "application/json; charset=utf-8", ...CORS_HEADERS };

  if (Array.isArray(body)) {
    const responses = body.map((m) => handleOne(m as RpcMessage)).filter(Boolean);
    if (responses.length === 0) return new Response(null, { status: 202, headers: CORS_HEADERS });
    return new Response(JSON.stringify(responses), { status: 200, headers });
  }

  const response = handleOne(body as RpcMessage);
  if (response === null) return new Response(null, { status: 202, headers: CORS_HEADERS });
  return new Response(JSON.stringify(response), { status: 200, headers });
}

// Some clients probe GET for a server-info / SSE stream; we're POST-only.
export function GET() {
  return new Response(
    JSON.stringify({ server: SERVER_INFO, transport: "streamable-http", note: "Use POST for JSON-RPC." }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } },
  );
}
