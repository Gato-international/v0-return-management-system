import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package, Search, Shield } from "lucide-react"
import { useTranslations } from "next-intl"
import { LocaleSwitcher } from "@/components/locale-switcher"

export default function HomePage() {
  const t = useTranslations("HomePage")

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Content */}
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              <h1 className="text-xl font-semibold">GATO-INTERNATIONAL</h1>
            </div>
            <div className="flex items-center gap-4">
              <LocaleSwitcher />
              <Link href="/admin/login">
                <Button variant="ghost" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  {t("adminLogin")}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-grow flex items-center justify-center">
          <div className="container mx-auto px-4 text-center space-y-6">
            <h2
              className="text-4xl md:text-5xl font-bold tracking-tight text-balance font-display"
              dangerouslySetInnerHTML={{ __html: t.raw("title") }}
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/returns/create">
                <Button size="lg" className="w-full sm:w-auto">
                  <Package className="h-5 w-5 mr-2" />
                  {t("startReturn")}
                </Button>
              </Link>
              <Link href="/returns/track">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Search className="h-5 w-5 mr-2" />
                  {t("trackReturn")}
                </Button>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/50 mt-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>{t("footer.copyright")}</p>
              <div className="flex gap-6">
                <Link href="/returns/policy" className="hover:text-primary transition-colors">
                  {t("footer.policy")}
                </Link>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  {t("footer.contact")}
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}