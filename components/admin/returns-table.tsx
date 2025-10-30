"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Search } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { formatReturnNumber } from "@/lib/utils/formatters"

interface Return {
  id: string
  return_number: number // Changed to number
  customer_email: string
  customer_name: string
  order_number: string
  status: string
  reason: string
  created_at: string
  items?: Array<{
    id: string
  }>
}

interface ReturnsTableProps {
  returns: Return[]
}

const statusColors: Record<string, string> = {
  pending: "bg-blue-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  received: "bg-purple-500",
  inspecting: "bg-yellow-500",
  refund_issued: "bg-orange-500",
  completed: "bg-green-600",
  cancelled: "bg-gray-500",
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  received: "Received",
  inspecting: "Inspecting",
  refund_issued: "Refund Issued",
  completed: "Completed",
  cancelled: "Cancelled",
}

export function ReturnsTable({ returns }: ReturnsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredReturns = returns.filter((returnItem) => {
    const formattedReturnNum = formatReturnNumber(returnItem.return_number).toLowerCase();
    const lowerCaseSearchTerm = searchTerm.toLowerCase()

    const matchesSearch =
      formattedReturnNum.includes(lowerCaseSearchTerm) ||
      (returnItem.customer_email?.toLowerCase() || "").includes(lowerCaseSearchTerm) ||
      (returnItem.order_number?.toLowerCase() || "").includes(lowerCaseSearchTerm) ||
      (returnItem.customer_name?.toLowerCase() || "").includes(lowerCaseSearchTerm)

    const matchesStatus = statusFilter === "all" || returnItem.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by return number, email, or order..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="inspecting">Inspecting</SelectItem>
            <SelectItem value="refund_issued">Refund Issued</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Return Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReturns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No returns found
                </TableCell>
              </TableRow>
            ) : (
              filteredReturns.map((returnItem) => (
                <TableRow key={returnItem.id}>
                  <TableCell className="font-medium">{formatReturnNumber(returnItem.return_number)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{returnItem.customer_name}</div>
                      <div className="text-sm text-muted-foreground">{returnItem.customer_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{returnItem.order_number || "N/A"}</TableCell>
                  <TableCell>{returnItem.items?.length || 0}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[returnItem.status] || "bg-gray-500"}>
                      {statusLabels[returnItem.status] || returnItem.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(returnItem.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/returns/${returnItem.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredReturns.length} of {returns.length} returns
      </p>
    </div>
  )
}