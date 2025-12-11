"use client"

import { useState } from "react"
import { AuthFormSplitScreen, type AuthFormValues } from "@/components/ui/login"
import { loginAction } from "@/app/actions/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Shield } from "lucide-react"

export function AdminLoginScreen() {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: AuthFormValues) => {
    setError(null)

    const formData = new FormData()
    formData.append("email", values.email)
    formData.append("password", values.password)

    try {
      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch (e) {
      setError("An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className="relative min-h-screen bg-background">
      {error && (
        <div className="absolute inset-x-0 top-0 z-20 flex justify-center p-4">
          <Alert variant="destructive" className="max-w-md w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <AuthFormSplitScreen
        logo={
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium tracking-widest text-muted-foreground">
                GATO-INTERNATIONAL
              </span>
              <span className="text-sm font-semibold">Admin Portal</span>
            </div>
          </div>
        }
        title="Welcome back"
        description="Sign in with your admin credentials to access the dashboard."
        imageSrc="https://images.unsplash.com/photo-1515165562835-c4c9e0737eaa?auto=format&fit=crop&w=1200&q=80"
        imageAlt="Warehouse with organized shelves and boxes."
        onSubmit={handleSubmit}
        forgotPasswordHref="#"
        createAccountHref="#"
      />
    </div>
  )
}
