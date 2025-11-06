"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { updateReturnStatusAction, addInternalNoteAction } from "@/app/actions/admin"
import { CheckCircle, AlertCircle } from "lucide-react"

interface ReturnActionsProps {
  returnId: string
  currentStatus: string
  userId: string
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "received", label: "Items Received" },
  { value: "inspecting", label: "Inspecting" },
  { value: "refund_issued", label: "Refund Issued" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

export function ReturnActions({ returnId, currentStatus, userId }: ReturnActionsProps) {
  const [newStatus, setNewStatus] = useState(currentStatus)
  const [statusNotes, setStatusNotes] = useState("")
  const [internalNote, setInternalNote] = useState("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleStatusUpdate = async () => {
    if (newStatus === currentStatus) {
      setError("Please select a different status")
      return
    }

    setIsUpdatingStatus(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await updateReturnStatusAction(returnId, newStatus, statusNotes, userId)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess("Status updated successfully")
        setStatusNotes("")
      }
    } catch (err) {
      setError("Failed to update status")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleAddNote = async () => {
    if (!internalNote.trim()) {
      setError("Please enter a note")
      return
    }

    setIsAddingNote(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await addInternalNoteAction(returnId, internalNote, userId)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess("Note added successfully")
        setInternalNote("")
      }
    } catch (err) {
      setError("Failed to add note")
    } finally {
      setIsAddingNote(false)
    }
  }

  return (
    <div className="space-y-6">
      {success && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Update Status */}
      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
          <CardDescription>Change the return status and add notes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Add notes about this status change..."
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleStatusUpdate}
            className="w-full"
            disabled={isUpdatingStatus || newStatus === currentStatus}
          >
            {isUpdatingStatus ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Add Internal Note */}
      <Card>
        <CardHeader>
          <CardTitle>Add Internal Note</CardTitle>
          <CardDescription>Notes are only visible to admins</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              placeholder="Add an internal note..."
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={handleAddNote} className="w-full bg-transparent" variant="outline" disabled={isAddingNote}>
            {isAddingNote ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Adding...
              </>
            ) : (
              "Add Note"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}