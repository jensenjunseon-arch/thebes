import { SAMPLE_REPORT, jsonResponse, preflight } from "@/lib/connector";

export function OPTIONS() {
  return preflight();
}

// Read a report by id. v0 serves the demo report at id="sample"; persisted
// per-student reports land once accounts are wired (the shape is identical).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (id === "sample") return jsonResponse(SAMPLE_REPORT);
  return jsonResponse(
    { error: "not_found", message: "리포트를 찾을 수 없어요. 데모는 id=sample 입니다." },
    404,
  );
}
