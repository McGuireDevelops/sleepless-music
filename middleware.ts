import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const HOST_REDIRECTS: Record<string, string> = {
  "sleeplessmusic.com": "www.sleeplessmusic.com",
};

export function middleware(request: NextRequest) {
  // Skip host/HTTPS redirects locally so the dev server is reachable over HTTP.
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const hostHeader = request.headers.get("host") ?? "";
  const hostname = hostHeader.split(":")[0]?.toLowerCase() ?? "";
  const proto = request.headers.get("x-forwarded-proto");
  const targetHost = HOST_REDIRECTS[hostname] ?? hostname;
  const needsHttps = proto === "http";
  const needsHost = targetHost !== hostname;

  if (needsHttps || needsHost) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = targetHost;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)).*)",
  ],
};
