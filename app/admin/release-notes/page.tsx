import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { ReleaseNotesTable } from "@/components/admin/release-notes-table"
import { ReleaseNoteForm } from "@/components/admin/release-note-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getAllReleaseNotesAction } from "@/app/actions/release-notes"

export default async function AdminReleaseNotesPage() {
  await requireAuth()
  const { notes, error } = await getAllReleaseNotesAction()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Release Notes Management</h1>
              <p className="text-sm text-muted-foreground">Manage user-facing updates and features</p>
            </div>
          </div>
          <form action={logoutAction}>
            <Button variant="outline" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error ? (
          <Card>
            <CardHeader>
              <CardTitle>Database Setup Required</CardTitle>
              <CardDescription>The release_notes table needs to be created</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please run the following SQL migration in your Supabase SQL Editor:
                </p>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`-- Run this in Supabase SQL Editor
-- File: scripts/015-create-release-notes-table.sql

CREATE TABLE IF NOT EXISTS release_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  release_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'feature',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_category CHECK (category IN ('feature', 'improvement', 'bugfix', 'announcement'))
);

CREATE INDEX IF NOT EXISTS idx_release_notes_published ON release_notes(is_published);
CREATE INDEX IF NOT EXISTS idx_release_notes_release_date ON release_notes(release_date DESC);`}
                </pre>
                <p className="text-sm text-muted-foreground">
                  After running the migration, refresh this page.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Release Notes</CardTitle>
                <CardDescription>Create and manage release notes for user-facing updates</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
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
            </CardHeader>
            <CardContent>
              <ReleaseNotesTable notes={notes || []} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
