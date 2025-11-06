import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package, Search, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Background Image and Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/DSC03022.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b border-white/20 bg-transparent">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              <h1 className="text-xl font-semibold">GATO-INTERNATIONAL</h1>
            </div>
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="hover:bg-white/10 hover:text-white">
                <Shield className="h-4 w-4 mr-2" />
                Admin Login
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-grow flex items-center justify-center">
          <div className="container mx-auto px-4 text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              Official Gato-international Return portal
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/returns/create">
                <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-gray-200">
                  <Package className="h-5 w-5 mr-2" />
                  Start a Return
                </Button>
              </Link>
              <Link href="/returns/track">
                <Button size="lg" className="w-full sm:w-auto bg-black text-white hover:bg-gray-800">
                  <Search className="h-5 w-5 mr-2" />
                  Track Return
                </Button>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/20 bg-transparent mt-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/80">
              <p>&copy; 2025 Gato-international B.V. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="/returns/policy" className="hover:text-white transition-colors">
                  Return Policy
                </Link>
                <Link href="/contact" className="hover:text-white transition-colors">
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