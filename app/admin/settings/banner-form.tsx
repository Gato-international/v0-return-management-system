"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { updateBannerSettings } from "@/app/actions/settings"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

interface BannerSettingsFormProps {
  initialSettings: {
    message: string
    color_scheme: string
    is_active: boolean
  } | null
}

export function BannerSettingsForm({ initialSettings }: BannerSettingsFormProps) {
  const { toast } = useToast()
  const [state, formAction] = useActionState(updateBannerSettings, { success: false, error: null })

  useEffect(() => {
    if (state.success) {
      toast({ title: "Success", description: "Banner settings updated." })
    }
  }, [state, toast])

  return (
    <form action={formAction} className="space-y-6">
      {state.error?._form && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error._form[0]}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="message">Banner Message</Label>
        <Textarea
          id="message"
          name="message"
          defaultValue={initialSettings?.message || ""}
          rows={3}
          required
        />
        {state.error?.message && <p className="text-sm text-destructive mt-1">{state.error.message[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="color_scheme">Color Scheme</Label>
        <Select name="color_scheme" defaultValue={initialSettings?.color_scheme || "info"}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info (Blue)</SelectItem>
            <SelectItem value="success">Success (Green)</SelectItem>
            <SelectItem value="warning">Warning (Yellow)</SelectItem>
            <SelectItem value="danger">Danger (Red)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
        <div className="space-y-0.5">
          <Label htmlFor="is_active">Display Banner</Label>
          <p className="text-sm text-muted-foreground">
            Turn this on to show the banner to all visitors.
          </p>
        </div>
        <Switch
          id="is_active"
          name="is_active"
          value="true"
          defaultChecked={initialSettings?.is_active || false}
        />
      </div>
      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Spinner className="mr-2 h-4 w-4" /> : null}
      Save Settings
    </Button>
  )
}