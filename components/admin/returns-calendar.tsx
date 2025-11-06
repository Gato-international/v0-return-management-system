"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { formatReturnNumber } from "@/lib/utils/formatters"

interface Return {
  id: string
  return_number: number
  customer_name: string
  status: string
  created_at: string
}

interface ReturnsCalendarProps {
  returns: Return[]
}

export function ReturnsCalendar({ returns }: ReturnsCalendarProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const returnsByDate = React.useMemo(() => {
    const map = new Map<string, Return[]>()
    returns.forEach((r) => {
      const day = format(new Date(r.created_at), "yyyy-MM-dd")
      if (!map.has(day)) {
        map.set(day, [])
      }
      map.get(day)!.push(r)
    })
    return map
  }, [returns])

  const modifiers = {
    hasReturns: Array.from(returnsByDate.keys()).map((day) => new Date(day)),
  }

  const modifiersStyles = {
    hasReturns: {
      fontWeight: "bold",
      textDecoration: "underline",
    },
  }

  const selectedDayReturns = date ? returnsByDate.get(format(date, "yyyy-MM-dd")) || [] : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Returns Calendar</CardTitle>
        <CardDescription>View submitted returns by date. Dates with returns are underlined.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
        />
        <div className="space-y-4">
          <h4 className="font-semibold">
            Returns for {date ? format(date, "PPP") : "selected date"}
          </h4>
          {selectedDayReturns.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {selectedDayReturns.map((r) => (
                <Link href={`/admin/returns/${r.id}`} key={r.id}>
                  <div className="flex justify-between items-center p-2 border rounded-md hover:bg-accent transition-colors">
                    <div>
                      <p className="font-medium">{formatReturnNumber(r.return_number)}</p>
                      <p className="text-sm text-muted-foreground">{r.customer_name}</p>
                    </div>
                    <Badge variant="outline">{r.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-4 border-2 border-dashed rounded-md">
              <p className="text-sm text-muted-foreground">No returns submitted on this date.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}