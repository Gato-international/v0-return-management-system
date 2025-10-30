"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function PrintReturnButton() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Button variant="outline" className="w-full" onClick={handlePrint}>
      <Printer className="mr-2 h-4 w-4" />
      Print Document
    </Button>
  )
}