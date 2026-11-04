import { randomUUID } from "node:crypto";

export function requestId(request: Request) {
  const incoming = request.headers.get("x-request-id")?.trim();
  return incoming && incoming.length <= 128 ? incoming : randomUUID();
}

export function withRequestId(response: Response, id: string) {
  response.headers.set("x-request-id", id);
  return response;
}

export function jsonError(message: string, status: number, details?: unknown, id?: string) {
  return Response.json(
    { error: message, ...(details === undefined ? {} : { details }), ...(id ? { requestId: id } : {}) },
    { status },
  );
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
