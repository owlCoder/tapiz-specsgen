import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const user = req.auth?.user;
  const path = nextUrl.pathname;
  const isAuthPage = path === "/login";
  // Javne rute: landing (/), auth, status/changelog, health.
  const isPublic =
    path === "/" ||
    isAuthPage ||
    ["/status", "/changelog", "/api/health"].includes(path);

  // Nezaštićene rute prolaze; za sve ostalo traži prijavu.
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  // Ulogovani na auth stranicama ili landingu → vode se u aplikaciju.
  if (user && (isAuthPage || path === "/")) {
    return NextResponse.redirect(new URL("/app", nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
