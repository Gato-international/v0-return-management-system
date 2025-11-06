import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { locales } from "./i18n"

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "en",
})

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is for an admin route (excluding locale prefixes)
  const isAdminPath = /^\/(en|nl)?\/admin/.test(pathname)
  const isLoginPage = /^\/(en|nl)?\/admin\/login/.test(pathname)

  if (isAdminPath && !isLoginPage) {
    const token = request.cookies.get("session")?.value
    const locale = pathname.split("/")[1] || "en" // get locale from path

    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url))
    }

    const user = await verifySession(token)
    if (!user) {
      return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url))
    }
  }

  return intlMiddleware(request)
}

export const config = {
  // Match all routes except for static assets and API routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}