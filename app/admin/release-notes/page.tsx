import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ReleaseNotesTable } from "@/components/admin/release-notes-table"
import { ReleaseNoteForm } from "@/components/admin/release-note-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getAllReleaseNotesAction } from "@/app/actions/release-notes"

export default async function AdminReleaseNotesPage() {
  await requireAuth()
  const { notes, error } = await getAllReleaseNotesAction()

  return (
    <>
      <div className="border-b border-neutral-200 bg-white">
        <div className="px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Release Notes</h1>
            <p className="text-sm text-neutral-500 mt-1">Manage user-facing updates and features</p>
          </div>
          {!error && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-black hover:bg-neutral-800 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Release Note
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Release Note</DialogTitle>
                </DialogHeader>
                <ReleaseNoteForm />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6">
        {error ? (
          <Card className="border-neutral-200 bg-white">
            <CardHeader>
              <CardTitle>Database Setup Required</CardTitle>
              <CardDescription>The release_notes table needs to be created</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please run the SQL migration in your Supabase SQL Editor, then refresh this page.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-neutral-200 bg-white">
            <CardContent className="p-5">
              <ReleaseNotesTable notes={notes || []} />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
