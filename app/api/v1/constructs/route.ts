import { constructsPayload, jsonResponse, preflight } from "@/lib/connector";

export function OPTIONS() {
  return preflight();
}

export function GET() {
  return jsonResponse(constructsPayload());
}
