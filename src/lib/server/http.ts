import { NextResponse } from "next/server";

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function handleRouteError(error: unknown) {
  console.error(error);
  if (error instanceof HttpError) {
    return NextResponse.json(
      { code: error.code, message: error.message, details: error.details },
      { status: error.status },
    );
  }
  if (error instanceof Error && error.name === "ValidationError") {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: error.message },
      { status: 400 },
    );
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  ) {
    return NextResponse.json(
      { code: "DUPLICATE_RECORD", message: "A record with those details already exists." },
      { status: 409 },
    );
  }
  return NextResponse.json(
    { code: "INTERNAL_ERROR", message: "An unexpected server error occurred." },
    { status: 500 },
  );
}

export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }
}

export function positiveInt(value: string | null, fallback: number, max = 100) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, max);
}
