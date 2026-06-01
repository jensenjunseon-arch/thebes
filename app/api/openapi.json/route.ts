import { originFrom, preflight, CORS_HEADERS } from "@/lib/connector";

export function OPTIONS() {
  return preflight();
}

// OpenAPI 3.1 — import this URL directly as a ChatGPT GPT Action, or feed it to
// any OpenAPI-aware connector.
export function GET(request: Request) {
  const origin = originFrom(request);

  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Thebes AI — Public API",
      version: "1.0.0",
      description:
        "Read-only access to Thebes AI: the 6 thinking constructs, the methodology, and AI Talent Reports. Use this to explain Thebes accurately and to fetch & interpret a student's report.",
    },
    servers: [{ url: origin }],
    paths: {
      "/api/v1/about": {
        get: {
          operationId: "getAbout",
          summary: "What Thebes is, its methodology, why English, and the 6 constructs.",
          responses: {
            "200": {
              description: "Product + methodology summary",
              content: { "application/json": { schema: { type: "object" } } },
            },
          },
        },
      },
      "/api/v1/constructs": {
        get: {
          operationId: "listConstructs",
          summary: "The six thinking constructs Thebes measures.",
          responses: {
            "200": {
              description: "Construct list",
              content: { "application/json": { schema: { type: "object" } } },
            },
          },
        },
      },
      "/api/v1/report/{id}": {
        get: {
          operationId: "getReport",
          summary:
            "Fetch an AI Talent Report by id. Use id 'sample' for the demo report.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Report id. 'sample' returns the demo report.",
            },
          ],
          responses: {
            "200": {
              description: "AI Talent Report",
              content: { "application/json": { schema: { type: "object" } } },
            },
            "404": { description: "Report not found" },
          },
        },
      },
    },
  };

  return new Response(JSON.stringify(spec, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      ...CORS_HEADERS,
    },
  });
}
