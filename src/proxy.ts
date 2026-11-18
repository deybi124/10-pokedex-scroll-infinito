import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (request.cookies.get("sesion")?.value) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/favoritos/:path*"],
};
