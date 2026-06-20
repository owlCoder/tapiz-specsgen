import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const user = req.auth?.user;
  const isAuthPage = nextUrl.pathname === "/login" || nextUrl.pathname === "/register";
  const isPublic =
    isAuthPage ||
    ["/status", "/changelog", "/api/health"].includes(nextUrl.pathname);

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
