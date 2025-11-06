import { getRequestConfig } from "next-intl/server"
import { notFound } from "next/navigation"

// A list of all locales that are supported
export const locales = ["en", "nl"]

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const isValidLocale = locales.some((cur) => cur === locale)
  if (!isValidLocale) {
    notFound()
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})