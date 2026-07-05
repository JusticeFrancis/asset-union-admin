import ky, { HTTPError, type KyInstance, type Options } from "ky";

import { resolveApiError } from "@/lib/api/parse-error";
import { ApiError } from "@/lib/api/types";
import { normalizeRequestError } from "@/lib/api/user-facing-error";
import { getActiveOrganizationId } from "@/lib/auth/org-session";
import { getOrgAccessToken } from "@/lib/auth/org-tokens";

export type OrgApiRequestOptions = Options & {
  auth?: boolean;
  organizationId?: string | null;
};

export function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL
    ?.trim()
    .replace(/\/+$/, "");

  if (configured) return `${configured}/`;

  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/`;
  }

  return `${(
    process.env.APP_URL || "http://localhost:3000"
  ).replace(/\/+$/, "")}/api/`;
}

function createOrgApiClient(): KyInstance {
  return ky.create({
    baseUrl: getApiBaseUrl(),
    timeout: 30_000,
    retry: {
      limit: 2,
      methods: ["get"],
      statusCodes: [408, 413, 429, 500, 502, 503, 504],
    },
    hooks: {
      beforeRequest: [
        ({ request, options }) => {
          const { auth, organizationId } = options as OrgApiRequestOptions;

          if (auth) {
            const accessToken = getOrgAccessToken();
            if (accessToken) {
              request.headers.set("Authorization", `Bearer ${accessToken}`);
            }

            const orgId =
              organizationId === undefined
                ? getActiveOrganizationId()
                : organizationId;

            if (orgId) {
              request.headers.set("X-Organization-Id", orgId);
            }
          }

          if (!request.headers.has("Content-Type") && options.body) {
            request.headers.set("Content-Type", "application/json");
          }
        },
      ],
      beforeError: [
        async ({ error }) => {
          if (!(error instanceof HTTPError)) {
            return error;
          }

          const parsed = resolveApiError(error.data, error.response.status);

          return new ApiError(parsed.code, parsed.message, parsed.details);
        },
      ],
    },
  });
}

export const orgApiClient = createOrgApiClient();

export async function orgApiRequest<T>(
  path: string,
  options?: OrgApiRequestOptions,
): Promise<T> {
  try {
    const response = await orgApiClient(path.replace(/^\//, ""), options);

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json<T>();
  } catch (error) {
    throw normalizeRequestError(error);
  }
}
