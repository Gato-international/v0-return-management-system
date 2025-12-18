import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPublishedReleaseNotesAction } from "@/app/actions/release-notes"
import { Calendar, Sparkles, Wrench, Bug, Megaphone } from "lucide-react"
import { format } from "date-fns"

const categoryIcons = {
  feature: Sparkles,
  improvement: Wrench,
  bugfix: Bug,
  announcement: Megaphone,
}

const categoryColors = {
  feature: "bg-blue-500",
  improvement: "bg-green-500",
  bugfix: "bg-orange-500",
  announcement: "bg-purple-500",
}

const categoryLabels = {
  feature: "New Feature",
  improvement: "Improvement",
  bugfix: "Bug Fix",
  announcement: "Announcement",
}

export default async function ReleaseNotesPage() {
  const { notes, error } = await getPublishedReleaseNotesAction()

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/10 to-background border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Release Notes</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay up to date with the latest features, improvements, and updates to our return management system.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {error ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">Release notes are not yet configured.</p>
                <p className="text-sm text-muted-foreground">Please contact the administrator to set up release notes.</p>
              </CardContent>
            </Card>
          ) : notes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No release notes available yet.</p>
              </CardContent>
            </Card>
          ) : (
            notes.map((note) => {
              const Icon = categoryIcons[note.category as keyof typeof categoryIcons]
              const colorClass = categoryColors[note.category as keyof typeof categoryColors]
              const categoryLabel = categoryLabels[note.category as keyof typeof categoryLabels]

              return (
                <Card key={note.id} className="overflow-hidden">
                  <CardHeader className="border-b bg-muted/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="font-mono">
                            v{note.version}
                          </Badge>
                          <Badge className={`${colorClass} text-white`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {categoryLabel}
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl">{note.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(note.release_date), "MMM d, yyyy")}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <CardDescription className="text-base leading-relaxed whitespace-pre-wrap">
                      {note.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
