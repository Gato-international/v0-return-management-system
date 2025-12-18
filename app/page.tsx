import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package, Search, Shield } from "lucide-react"

export default async function HomePage() {
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
              <Link href="/release-notes">
                <Button variant="ghost" size="sm">
                  Release Notes
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button variant="ghost" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-grow flex items-center justify-center">
          <div className="container mx-auto px-4 text-center space-y-6">
            <h2
              className="text-4xl md:text-5xl font-bold tracking-wide text-balance font-display"
              dangerouslySetInnerHTML={{ __html: "Official Gato-international <br /> Return portal" }}
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/returns/create">
                <Button size="lg" className="w-full sm:w-auto">
                  <Package className="h-5 w-5 mr-2" />
                  Start a Return
                </Button>
              </Link>
              <Link href="/returns/track">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Search className="h-5 w-5 mr-2" />
                  Track Return
                </Button>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/50 mt-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>© 2025 Gato-international B.V. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="/returns/policy" className="hover:text-primary transition-colors">
                  Return Policy
                </Link>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}