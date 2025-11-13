"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { resendNotificationAction } from "@/app/actions/admin"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface ResendNotificationButtonProps {
  returnId: string
  userId: string
}

export function ResendNotificationButton({ returnId, userId }: ResendNotificationButtonProps) {
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const handleResend = async () => {
    setIsSending(true)
    try {
      const result = await resendNotificationAction(returnId, userId)
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Notification email has been sent.",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleResend} disabled={isSending}>
      {isSending ? (
        <>
          <Spinner className="mr-2 h-4 w-4" />
          Sending...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Resend Notification
        </>
      )}
    </Button>
  )
}