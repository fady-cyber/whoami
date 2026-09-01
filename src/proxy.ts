import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "whoami_session";

type SessionPayload = {
  uid?: number;
  role?: string;
};

async function readSession(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(
      process.env.AUTH_SECRET || "whoami-academy-dev-secret-change-me"
    );
    const { payload } = await jwtVerify(token, secret, { issuer: "whoami-academy" });
    return {
      uid: typeof payload.uid === "number" ? payload.uid : undefined,
      role: typeof payload.role === "string" ? payload.role : undefined,
    };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isMemberArea = pathname.startsWith("/dashboard") || pathname.startsWith("/learn");
  const isAdminArea = pathname.startsWith("/admin");

  if (!isMemberArea && !isAdminArea) return NextResponse.next();

  const session = await readSession(req);
  if (!session?.uid) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminArea && session.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/learn/:path*", "/admin/:path*"],
};
