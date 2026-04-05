import { NextRequest, NextResponse } from "next/server"

// Maintenance mode toggle - set to true to enable
const MAINTENANCE_MODE = true

// Paths that should still work during maintenance (API for mobile app, admin access)
const BYPASS_PATHS = [
  "/maintenance",
  "/api/v1/",
  "/admin",
  "/_next",
  "/favicon.ico",
  "/images",
  "/placeholder",
]

export function middleware(request: NextRequest) {
  if (!MAINTENANCE_MODE) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Allow bypass paths
  if (BYPASS_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Allow maintenance page itself
  if (pathname === "/maintenance") {
    return NextResponse.next()
  }

  // Redirect everything else to maintenance page
  const maintenanceUrl = new URL("/maintenance", request.url)
  return NextResponse.rewrite(maintenanceUrl)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
