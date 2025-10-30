import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReturnForm } from "@/components/returns/return-form"
import { Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CreateReturnPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <h1 className="text-xl font-semibold">ReturnHub</h1>
          </Link>
          <Link href="/returns/track">
            <Button variant="ghost" size="sm">
              Track Return
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Submit a Return Request</CardTitle>
            <CardDescription>
              Fill out the form below to start your return. You'll receive a tracking number via email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReturnForm />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
