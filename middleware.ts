import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { locales } from "./i18n/request"

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "en",
})

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminPath = /^\/(en|nl)?\/admin/.test(pathname)
  const isLoginPage = /^\/(en|nl)?\/admin\/login/.test(pathname)

  if (isAdminPath && !isLoginPage) {
    const token = request.cookies.get("session")?.value

    // Robust locale detection
    const pathParts = pathname.split("/")
    const potentialLocale = pathParts[1]
    const locale = locales.includes(potentialLocale as any) ? potentialLocale : "en" // Default to 'en'

    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url))
    }

    const user = await verifySession(token)
    if (!user) {
      // Clear invalid cookie and redirect
      const response = NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url))
      response.cookies.delete("session")
      return response
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}