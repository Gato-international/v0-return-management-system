"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function LocaleSwitcher() {
  const [isPending, startTransition] = useTransition()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const onSelectChange = (value: string) => {
    const nextLocale = value
    startTransition(() => {
      // This is a workaround for a Next.js bug where the router replaces the path instead of pushing it.
      // We manually construct the new path with the new locale.
      const newPath = `/${nextLocale}${pathname.startsWith(`/${locale}`) ? pathname.substring(`/${locale}`.length) : pathname}`
      router.replace(newPath)
    })
  }

  return (
    <Select defaultValue={locale} onValueChange={onSelectChange} disabled={isPending}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="nl">Nederlands</SelectItem>
      </SelectContent>
    </Select>
  )
}