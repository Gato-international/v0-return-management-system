"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Product {
  id: string
  name: string
  sku: string
  variations: Variation[]
}

interface Variation {
  id: string
  sku: string
  color?: string | null
  size?: string | null
}

interface SearchableProductSelectProps {
  products: Product[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function SearchableProductSelect({ products, value, onChange, disabled }: SearchableProductSelectProps) {
  const [open, setOpen] = React.useState(false)

  const options = products.flatMap(product =>
    product.variations.map(variation => ({
      value: variation.id,
      label: `${product.name} - ${[variation.color, variation.size].filter(Boolean).join(", ")} (SKU: ${variation.sku})`,
    }))
  )

  const selectedLabel = options.find(option => option.value === value)?.label

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal"
          disabled={disabled}
        >
          <span className="truncate">{value ? selectedLabel : "Select a product..."}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search product, color, size, or SKU..." />
          <CommandList>
            <CommandEmpty>No product found.</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Search by the full descriptive label
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}