import type { NextRequest } from "next/server";
import { UAParser } from "ua-parser-js";

export function requestContext(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  const parsed = new UAParser(userAgent).getResult();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "Unknown";
  const city = request.headers.get("x-vercel-ip-city");
  const country = request.headers.get("x-vercel-ip-country");
  const location = [city ? decodeURIComponent(city) : "", country || ""].filter(Boolean).join(", ") || "Unknown location";
  return {
    userAgent,
    ip,
    location,
    browser: [parsed.browser.name, parsed.browser.version].filter(Boolean).join(" ") || "Unknown browser",
    os: [parsed.os.name, parsed.os.version].filter(Boolean).join(" ") || "Unknown OS",
    deviceType: parsed.device.type || "Desktop",
  };
}
