import type { ApiErrorBody } from "@/lib/api/types";

export type ParsedApiError = {
  code: string;
  message: string;
  details?: unknown;
};

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiErrorBody).error?.code === "string" &&
    typeof (value as ApiErrorBody).error?.message === "string"
  );
}

export function parseApiErrorBody(data: unknown): ParsedApiError | null {
  if (isApiErrorBody(data)) {
    return {
      code: data.error.code,
      message: data.error.message,
      details: data.error.details,
    };
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "code" in data &&
    "message" in data &&
    typeof (data as { code: unknown }).code === "string" &&
    typeof (data as { message: unknown }).message === "string"
  ) {
    const flat = data as { code: string; message: string; details?: unknown };
    return {
      code: flat.code,
      message: flat.message,
      details: flat.details,
    };
  }

  return null;
}

export function getApiErrorFromStatus(status: number): ParsedApiError {
  switch (status) {
    case 401:
      return {
        code: "UNAUTHORIZED",
        message: "Your session has expired. Please sign in again.",
      };
    case 403:
      return {
        code: "FORBIDDEN",
        message: "You do not have permission to perform this action.",
      };
    case 429:
      return {
        code: "RATE_LIMITED",
        message: "Too many requests. Please wait and try again.",
      };
    default:
      return {
        code: "UNKNOWN_ERROR",
        message: "Something went wrong. Please try again.",
      };
  }
}

export function resolveApiError(
  data: unknown,
  status?: number,
): ParsedApiError {
  return parseApiErrorBody(data) ?? getApiErrorFromStatus(status ?? 500);
}
