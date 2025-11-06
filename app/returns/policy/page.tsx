import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <h1 className="text-xl font-semibold">GATO-INTERNATIONAL</h1>
          </Link>
          <Link href="/">
            <Button variant="ghost">Home</Button>
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Return Policy</CardTitle>
            <CardDescription>Our return policy details.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is a placeholder page for the return policy.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}