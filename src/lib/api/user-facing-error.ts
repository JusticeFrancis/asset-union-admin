import { HTTPError, TimeoutError } from "ky";

import {
  getApiErrorFromStatus,
  parseApiErrorBody,
  type ParsedApiError,
} from "@/lib/api/parse-error";
import { ApiError } from "@/lib/api/types";

export const DEFAULT_USER_FACING_FALLBACK =
  "Something went wrong. Please try again.";

/** Backend / library strings we never show verbatim. */
const SUPPRESSED_MESSAGES = new Set([
  "Request failed",
  "Request could not be processed",
  "Internal server error",
  DEFAULT_USER_FACING_FALLBACK,
  "Failed to fetch",
  "Load failed",
  "NetworkError when attempting to fetch resource.",
]);

const TECHNICAL_MESSAGE_PATTERNS = [
  /request failed/i,
  /network error/i,
  /failed to fetch/i,
  /fetch failed/i,
  /load failed/i,
  /econnrefused/i,
  /enotfound/i,
  /etimedout/i,
  /socket hang up/i,
  /unexpected token/i,
  /syntaxerror/i,
  /\b(GET|POST|PUT|PATCH|DELETE)\s+https?:\/\//i,
  /https?:\/\/[^\s]+/i,
  /localhost:\d+/i,
  /NEXT_PUBLIC_/i,
];

export function isTechnicalErrorMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return true;
  if (SUPPRESSED_MESSAGES.has(trimmed)) return true;
  return TECHNICAL_MESSAGE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function sanitizeBackendMessage(message: string | undefined): string | null {
  if (!message) return null;
  if (isTechnicalErrorMessage(message)) return null;
  return message;
}

function messageForCode(
  code: string,
  codeMessages: Record<string, string>,
  backendMessage?: string,
  fallback = DEFAULT_USER_FACING_FALLBACK,
): string {
  if (codeMessages[code]) {
    return codeMessages[code];
  }

  const sanitized = sanitizeBackendMessage(backendMessage);
  if (sanitized) {
    return sanitized;
  }

  return fallback;
}

function parsedToApiError(parsed: ParsedApiError): ApiError {
  return new ApiError(parsed.code, parsed.message, parsed.details);
}

/** Turn ky / fetch failures into ApiError with safe copy. */
export function normalizeRequestError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof HTTPError) {
    const parsed = parseApiErrorBody(error.data);
    if (parsed) {
      return parsedToApiError(parsed);
    }
    const fromStatus = getApiErrorFromStatus(error.response.status);
    return parsedToApiError(fromStatus);
  }

  if (error instanceof TimeoutError) {
    return new ApiError(
      "TIMEOUT_ERROR",
      "The request took too long. Please try again.",
    );
  }

  const transportMessage = getTransportErrorMessage(error);
  if (transportMessage) {
    return new ApiError("NETWORK_ERROR", transportMessage);
  }

  if (error instanceof Error) {
    if (/NEXT_PUBLIC_API_URL/i.test(error.message)) {
      return new ApiError(
        "CONFIG_ERROR",
        "The app is missing API configuration. Contact your administrator.",
      );
    }

    const sanitized = sanitizeBackendMessage(error.message);
    if (sanitized) {
      return new ApiError("UNKNOWN_ERROR", sanitized);
    }
  }

  return new ApiError("UNKNOWN_ERROR", DEFAULT_USER_FACING_FALLBACK);
}

function getTransportErrorMessage(error: unknown): string | null {
  if (error instanceof TimeoutError) {
    return "The request took too long. Please try again.";
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  if (!message || !isTechnicalErrorMessage(message)) {
    return null;
  }

  if (/timeout/i.test(message)) {
    return "The request took too long. Please try again.";
  }

  if (
    /failed to fetch|network error|econnrefused|enotfound|load failed/i.test(
      message,
    )
  ) {
    return "We couldn't reach the server. Check your internet connection and try again.";
  }

  return "We couldn't reach the server. Check your connection and try again.";
}

export type UserFacingErrorOptions = {
  /** Per-domain codes (e.g. INVALID_CREDENTIALS). Merged over shared defaults. */
  codeMessages?: Record<string, string>;
  fallback?: string;
};

const SHARED_CODE_MESSAGES: Record<string, string> = {
  NETWORK_ERROR:
    "We couldn't reach the server. Check your internet connection and try again.",
  TIMEOUT_ERROR: "The request took too long. Please try again.",
  CONFIG_ERROR:
    "The app is missing API configuration. Contact your administrator.",
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
  FORBIDDEN: "You do not have permission to perform this action.",
  RATE_LIMITED: "Too many requests. Please wait and try again.",
  OTP_RATE_LIMITED: "Too many codes requested. Please wait and try again.",
  VALIDATION_ERROR: "Please check your details and try again.",
  UNKNOWN_ERROR: DEFAULT_USER_FACING_FALLBACK,
};

/**
 * Maps any thrown value to copy safe to show in the UI (auth forms, toasts, etc.).
 */
export function getUserFacingErrorMessage(
  error: unknown,
  options: UserFacingErrorOptions = {},
): string {
  const fallback = options.fallback ?? DEFAULT_USER_FACING_FALLBACK;
  const codeMessages = { ...SHARED_CODE_MESSAGES, ...options.codeMessages };

  const normalized =
    error instanceof ApiError ? error : normalizeRequestError(error);

  return messageForCode(
    normalized.code,
    codeMessages,
    normalized.message,
    fallback,
  );
}
