import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Search, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <h1 className="text-xl font-semibold">GATO-INTERNATIONAL</h1>
          </div>
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Admin Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">Offical Gato-international Return portal</h2>
          <p className="text-lg text-muted-foreground text-balance">
            Submit return requests and track their status in real-time. Our streamlined process makes returns simple and
            transparent for our B2B users.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/returns/create">
              <Button size="lg" className="w-full sm:w-auto">
                <Package className="h-5 w-5 mr-2" />
                Start a Return
              </Button>
            </Link>
            <Link href="/returns/track">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                <Search className="h-5 w-5 mr-2" />
                Track Return
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 border-t border-border">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Easy Submission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Submit return requests in minutes with our simple form. Upload images and provide details about your
                return.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Real-Time Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track your return status at any time with your unique return number. Get updates at every step of the
                process.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Secure & Reliable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your data is protected with industry-standard security. We handle every return with care and
                professionalism.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; 2025 Gato-international B.V. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/returns/policy" className="hover:text-foreground transition-colors">
                Return Policy
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
