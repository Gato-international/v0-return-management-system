"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Trash2, Edit, Eye, EyeOff } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { deleteReleaseNoteAction } from "@/app/actions/release-notes"
import { ReleaseNoteForm } from "./release-note-form"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface ReleaseNote {
  id: string
  version: string
  title: string
  description: string
  release_date: string
  category: string
  is_published: boolean
}

interface ReleaseNotesTableProps {
  notes: ReleaseNote[]
}

const categoryColors = {
  feature: "bg-blue-500",
  improvement: "bg-green-500",
  bugfix: "bg-orange-500",
  announcement: "bg-purple-500",
}

const categoryLabels = {
  feature: "Feature",
  improvement: "Improvement",
  bugfix: "Bug Fix",
  announcement: "Announcement",
}

export function ReleaseNotesTable({ notes }: ReleaseNotesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [noteToEdit, setNoteToEdit] = useState<ReleaseNote | null>(null)
  const { toast } = useToast()

  const filteredNotes = notes.filter((note) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    return (
      note.title.toLowerCase().includes(lowerCaseSearchTerm) ||
      note.version.toLowerCase().includes(lowerCaseSearchTerm) ||
      note.description.toLowerCase().includes(lowerCaseSearchTerm)
    )
  })

  const handleDeleteClick = (noteId: string) => {
    setNoteToDelete(noteId)
    setIsDeleteDialogOpen(true)
  }

  const handleEditClick = (note: ReleaseNote) => {
    setNoteToEdit(note)
    setIsEditDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (noteToDelete) {
      const result = await deleteReleaseNoteAction(noteToDelete)
      if (result.success) {
        toast({
          title: "Success",
          description: "Release note deleted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete release note.",
          variant: "destructive",
        })
      }
      setNoteToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search release notes by title, version, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No release notes found
                </TableCell>
              </TableRow>
            ) : (
              filteredNotes.map((note) => {
                const colorClass = categoryColors[note.category as keyof typeof categoryColors]
                const categoryLabel = categoryLabels[note.category as keyof typeof categoryLabels]

                return (
                  <TableRow key={note.id}>
                    <TableCell className="font-mono font-medium">v{note.version}</TableCell>
                    <TableCell className="font-medium max-w-xs truncate">{note.title}</TableCell>
                    <TableCell>
                      <Badge className={`${colorClass} text-white`}>
                        {categoryLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(note.release_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      {note.is_published ? (
                        <Badge variant="default" className="bg-green-600">
                          <Eye className="h-3 w-3 mr-1" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(note)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(note.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredNotes.length} of {notes.length} release notes
      </p>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the release note.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Release Note</DialogTitle>
          </DialogHeader>
          {noteToEdit && (
            <ReleaseNoteForm
              initialData={noteToEdit}
              onSuccess={() => {
                setIsEditDialogOpen(false)
                setNoteToEdit(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
