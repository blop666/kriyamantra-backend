export function jsonError(message: string, status: number, details?: unknown) {
  return Response.json(
    { error: message, ...(details === undefined ? {} : { details }) },
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
