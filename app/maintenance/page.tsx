import type { Metadata } from "next"
import { Package, Wrench, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Scheduled Maintenance | GATO-INTERNATIONAL",
  description: "Our return portal is currently undergoing scheduled maintenance. We'll be back shortly.",
}

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              <h1 className="text-xl font-semibold">GATO-INTERNATIONAL</h1>
            </div>
          </div>
        </header>

        {/* Maintenance Content */}
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center space-y-8">
            {/* Animated icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                  <Wrench className="h-12 w-12 text-muted-foreground animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Clock className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-wide text-balance font-display">
                We&apos;ll Be Right Back
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                Our return portal is currently undergoing scheduled maintenance to bring you an improved experience.
              </p>
            </div>

            {/* Status card */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm font-medium">Maintenance in progress</span>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>System upgrades and new features being deployed</span>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>All existing return requests are safe and preserved</span>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Expected completion: within the next few hours</span>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Need urgent assistance?{" "}
                <a
                  href="mailto:info@gato-international.com"
                  className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                >
                  info@gato-international.com
                </a>
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/50 mt-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} Gato-international B.V. All rights reserved.</p>
              <div className="flex gap-6">
                <a
                  href="https://gato-international.com"
                  className="hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Main Website
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
