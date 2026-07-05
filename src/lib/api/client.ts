import ky, { HTTPError, type KyInstance, type Options } from "ky";

import { resolveApiError } from "@/lib/api/parse-error";
import { ApiError } from "@/lib/api/types";
import { normalizeRequestError } from "@/lib/api/user-facing-error";

export type ApiRequestOptions = Options & { auth?: boolean };

export function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (configured) return `${configured}/`;
  if (typeof window !== "undefined") return `${window.location.origin}/api/`;
  return `${(process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "")}/api/`;
}

function createApiClient(): KyInstance {
  return ky.create({
    baseUrl: getApiBaseUrl(),
    credentials: "include",
    timeout: 30_000,
    retry: { limit: 1, methods: ["get"], statusCodes: [408, 429, 500, 502, 503, 504] },
    hooks: {
      beforeError: [
        async ({ error }) => {
          if (!(error instanceof HTTPError)) return error;
          const parsed = resolveApiError(error.data, error.response.status);
          return new ApiError(parsed.code, parsed.message, parsed.details);
        },
      ],
    },
  });
}

export const apiClient = createApiClient();

async function readResponse<T>(path: string, options: Options): Promise<T> {
  const response = await apiClient(path.replace(/^\//, ""), options);
  if (response.status === 204) return undefined as T;
  return response.json<T>();
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { auth = false, ...requestOptions } = options;
  try {
    return await readResponse<T>(path, requestOptions);
  } catch (error) {
    const isRefreshRequest = path.replace(/^\//, "") === "admin/auth/refresh";
    if (auth && !isRefreshRequest && error instanceof ApiError && error.code === "UNAUTHORIZED") {
      try {
        await readResponse("admin/auth/refresh", { method: "POST" });
        return await readResponse<T>(path, requestOptions);
      } catch (refreshError) {
        throw normalizeRequestError(refreshError);
      }
    }
    throw normalizeRequestError(error);
  }
}
