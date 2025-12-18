"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createReleaseNoteAction, updateReleaseNoteAction } from "@/app/actions/release-notes"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle } from "lucide-react"

const releaseNoteSchema = z.object({
  version: z.string().min(1, "Version is required."),
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  release_date: z.string().min(1, "Release date is required."),
  category: z.enum(["feature", "improvement", "bugfix", "announcement"]),
  is_published: z.boolean(),
})

type ReleaseNoteFormData = z.infer<typeof releaseNoteSchema>

interface ReleaseNoteFormProps {
  initialData?: {
    id: string
    version: string
    title: string
    description: string
    release_date: string
    category: string
    is_published: boolean
  }
  onSuccess?: () => void
}

export function ReleaseNoteForm({ initialData, onSuccess }: ReleaseNoteFormProps) {
  const { toast } = useToast()
  const isEditMode = !!initialData

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReleaseNoteFormData>({
    resolver: zodResolver(releaseNoteSchema),
    defaultValues: {
      version: initialData?.version || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      release_date: initialData?.release_date ? new Date(initialData.release_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      category: (initialData?.category as any) || "feature",
      is_published: initialData?.is_published || false,
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        version: initialData.version,
        title: initialData.title,
        description: initialData.description,
        release_date: new Date(initialData.release_date).toISOString().split('T')[0],
        category: initialData.category as any,
        is_published: initialData.is_published,
      })
    }
  }, [initialData, reset])

  const onSubmit = async (data: ReleaseNoteFormData) => {
    try {
      const result = isEditMode
        ? await updateReleaseNoteAction(initialData!.id, data)
        : await createReleaseNoteAction(data)

      if (result.success) {
        toast({
          title: "Success!",
          description: `Release note has been successfully ${isEditMode ? "updated" : "created"}.`,
        })
        onSuccess?.()
        if (!isEditMode) reset()
      } else if (result.error) {
        Object.entries(result.error).forEach(([key, value]) => {
          setError(key as keyof ReleaseNoteFormData | "root.serverError", {
            type: "server",
            message: Array.isArray(value) ? value.join(", ") : String(value),
          })
        })
      }
    } catch (e) {
      setError("root.serverError", {
        type: "server",
        message: "An unexpected error occurred.",
      })
    }
  }

  const category = watch("category")
  const isPublished = watch("is_published")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root?.serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.root.serverError.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="version">Version *</Label>
          <Input
            id="version"
            placeholder="1.0.0"
            {...register("version")}
            disabled={isSubmitting}
          />
          {errors.version && <p className="text-sm text-destructive mt-1">{errors.version.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="release_date">Release Date *</Label>
          <Input
            id="release_date"
            type="date"
            {...register("release_date")}
            disabled={isSubmitting}
          />
          {errors.release_date && <p className="text-sm text-destructive mt-1">{errors.release_date.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="New Feature: Enhanced Return Tracking"
          {...register("title")}
          disabled={isSubmitting}
        />
        {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          value={category}
          onValueChange={(value) => setValue("category", value as any)}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="feature">New Feature</SelectItem>
            <SelectItem value="improvement">Improvement</SelectItem>
            <SelectItem value="bugfix">Bug Fix</SelectItem>
            <SelectItem value="announcement">Announcement</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe the update, feature, or improvement..."
          rows={5}
          {...register("description")}
          disabled={isSubmitting}
        />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
        <div className="space-y-0.5">
          <Label htmlFor="is_published">Publish Release Note</Label>
          <p className="text-sm text-muted-foreground">
            Make this release note visible to users
          </p>
        </div>
        <Switch
          id="is_published"
          checked={isPublished}
          onCheckedChange={(checked) => setValue("is_published", checked)}
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
        {isEditMode ? "Update Release Note" : "Create Release Note"}
      </Button>
    </form>
  )
}
