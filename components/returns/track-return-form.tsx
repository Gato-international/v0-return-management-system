"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { trackReturnAction } from "@/app/actions/returns"
import { AlertCircle, Search } from "lucide-react"
import { ReturnDetails } from "./return-details"

export function TrackReturnForm() {
  const [returnNumber, setReturnNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [returnData, setReturnData] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setReturnData(null)

    // Ensure returnNumber is a valid number string before passing to action
    if (!/^\d+$/.test(returnNumber)) {
      setError("Please enter a valid numerical tracking number.")
      setIsLoading(false)
      return
    }

    try {
      const result = await trackReturnAction(returnNumber)
      if (result.error) {
        setError(result.error)
      } else if (result.return) {
        setReturnData(result.return)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (returnData) {
    return <ReturnDetails returnData={returnData} onBack={() => setReturnData(null)} />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="returnNumber">Return Tracking Number</Label>
        <Input
          id="returnNumber"
          placeholder="e.g., 1001"
          value={returnNumber}
          onChange={(e) => setReturnNumber(e.target.value)}
          disabled={isLoading}
          required
          inputMode="numeric" // Suggest numeric keyboard on mobile
          pattern="[0-9]*" // Only allow numbers
        />
        <p className="text-sm text-muted-foreground">Enter the numerical tracking number from your confirmation email</p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Tracking...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Track Return
          </>
        )}
      </Button>
    </form>
  )
}