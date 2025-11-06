"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, X } from "lucide-react"
import {
  createAttributeAction,
  createOptionAction,
  deleteAttributeAction,
  deleteOptionAction,
} from "@/app/actions/attributes"
import { useToast } from "@/hooks/use-toast"
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

interface Option {
  id: string
  value: string
}

interface Attribute {
  id: string
  name: string
  options: Option[]
}

interface VariationsClientPageProps {
  initialAttributes: Attribute[]
}

export function VariationsClientPage({ initialAttributes }: VariationsClientPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [newAttributeName, setNewAttributeName] = useState("")
  const [newOptionValues, setNewOptionValues] = useState<Record<string, string>>({})

  const handleAddAttribute = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("name", newAttributeName)
    const result = await createAttributeAction(formData)
    if (result.success) {
      toast({ title: "Success", description: "Attribute created." })
      setNewAttributeName("")
      router.refresh()
    } else {
      toast({ title: "Error", description: result.error?.name?.[0] || "Failed to create attribute.", variant: "destructive" })
    }
  }

  const handleAddOption = async (attributeId: string) => {
    const value = newOptionValues[attributeId]
    if (!value) return

    const formData = new FormData()
    formData.append("attributeId", attributeId)
    formData.append("value", value)
    const result = await createOptionAction(formData)
    if (result.success) {
      toast({ title: "Success", description: "Option created." })
      setNewOptionValues(prev => ({ ...prev, [attributeId]: "" }))
      router.refresh()
    } else {
      toast({ title: "Error", description: result.error?.value?.[0] || "Failed to create option.", variant: "destructive" })
    }
  }

  const handleDeleteAttribute = async (attributeId: string) => {
    const result = await deleteAttributeAction(attributeId)
    if (result.success) {
      toast({ title: "Success", description: "Attribute deleted." })
      router.refresh()
    } else {
      toast({ title: "Error", description: result.error || "Failed to delete attribute.", variant: "destructive" })
    }
  }

  const handleDeleteOption = async (optionId: string) => {
    const result = await deleteOptionAction(optionId)
    if (result.success) {
      toast({ title: "Success", description: "Option deleted." })
      router.refresh()
    } else {
      toast({ title: "Error", description: result.error || "Failed to delete option.", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Attributes</h3>
        <Accordion type="multiple" className="w-full">
          {initialAttributes.map(attr => (
            <AccordionItem value={attr.id} key={attr.id}>
              <div className="flex items-center justify-between">
                <AccordionTrigger className="flex-1">{attr.name}</AccordionTrigger>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {attr.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete the attribute and all its options. Products using this attribute will be unaffected but you won't be able to add new variations of this type.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteAttribute(attr.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <AccordionContent className="pl-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Options</h4>
                  {attr.options.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {attr.options.map(opt => (
                        <div key={opt.id} className="flex items-center gap-1 bg-muted rounded-md pl-2 pr-1 py-0.5">
                          <span className="text-sm">{opt.value}</span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="text-muted-foreground hover:text-destructive">
                                <X className="h-3 w-3" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete option "{opt.value}"?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteOption(opt.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No options yet.</p>
                  )}
                  <form
                    onSubmit={e => {
                      e.preventDefault()
                      handleAddOption(attr.id)
                    }}
                    className="flex gap-2 pt-2"
                  >
                    <Input
                      placeholder="New option value..."
                      value={newOptionValues[attr.id] || ""}
                      onChange={e => setNewOptionValues(prev => ({ ...prev, [attr.id]: e.target.value }))}
                    />
                    <Button type="submit" size="sm">Add Option</Button>
                  </form>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <form onSubmit={handleAddAttribute} className="flex gap-2 mt-4 border-t pt-4">
          <Input
            placeholder="New attribute name (e.g., Material)"
            value={newAttributeName}
            onChange={e => setNewAttributeName(e.target.value)}
          />
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" />
            Add Attribute
          </Button>
        </form>
      </div>
    </div>
  )
}