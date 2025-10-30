"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteReturnAction } from "@/app/actions/admin"
import { useToast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface DeleteReturnButtonProps {
  returnId: string
  userId: string
}

export function DeleteReturnButton({ returnId, userId }: DeleteReturnButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteReturnAction(returnId, userId)
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        setIsDeleting(false)
      } else {
        toast({
          title: "Success",
          description: "Return request deleted successfully.",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Return
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this return request and all of its associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
            {isDeleting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}