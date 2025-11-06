"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { formatReturnNumber } from "@/lib/utils/formatters"
import { CalendarDays } from "lucide-react"

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

  const selectedDayReturns = date ? returnsByDate.get(format(date, "yyyy-MM-dd")) || [] : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Returns Calendar</CardTitle>
        <CardDescription>View submitted returns by date. Dates with returns are marked with a dot.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            modifiers={modifiers}
            modifiersClassNames={{
              hasReturns: "day-with-dot",
            }}
          />
        </div>
        <div className="space-y-4">
          <h4 className="font-semibold">Returns for {date ? format(date, "PPP") : "selected date"}</h4>
          {selectedDayReturns.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {selectedDayReturns.map((r) => (
                <Link href={`/admin/returns/${r.id}`} key={r.id}>
                  <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div>
                      <p className="font-semibold text-sm">{formatReturnNumber(r.return_number)}</p>
                      <p className="text-xs text-muted-foreground">{r.customer_name}</p>
                    </div>
                    <Badge variant="secondary">{r.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[10rem] p-4 bg-muted/50 border-2 border-dashed rounded-lg">
              <CalendarDays className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-muted-foreground">No returns on this date</p>
              <p className="text-xs text-muted-foreground">Select a date with a dot to see returns.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}