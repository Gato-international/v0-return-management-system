"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"

const COLORS = ["#171717", "#525252", "#737373", "#a3a3a3", "#d4d4d4", "#e5e5e5", "#404040", "#262626"]

interface DashboardChartsProps {
  returnsTimeData: Array<{ date: string; count: number }>
  reasonData: Array<{ name: string; value: number }>
  statusData: Array<{ name: string; value: number }>
  productData: Array<{ name: string; count: number }>
}

export function DashboardCharts({ returnsTimeData, reasonData, statusData, productData }: DashboardChartsProps) {
  const hasData = returnsTimeData.some(d => d.count > 0)

  if (!hasData && reasonData.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-neutral-900">Analytics</h2>
        <span className="text-xs text-neutral-400">Last 30 days</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Returns over time */}
        <Card className="border-neutral-200 bg-white">
          <div className="p-5 pb-2">
            <h3 className="text-sm font-semibold text-neutral-900">Returns Over Time</h3>
            <p className="text-xs text-neutral-500">Daily return submissions</p>
          </div>
          <CardContent className="p-5 pt-0">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={returnsTimeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#a3a3a3" }}
                    interval="preserveStartEnd"
                    tickLine={false}
                    axisLine={{ stroke: "#e5e5e5" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#a3a3a3" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e5e5" }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#171717" fill="#171717" fillOpacity={0.1} strokeWidth={2} name="Returns" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Returns by status */}
        {statusData.length > 0 && (
          <Card className="border-neutral-200 bg-white">
            <div className="p-5 pb-2">
              <h3 className="text-sm font-semibold text-neutral-900">Returns by Status</h3>
              <p className="text-xs text-neutral-500">Distribution of return statuses</p>
            </div>
            <CardContent className="p-5 pt-0">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={2}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e5e5" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Returns by reason */}
        {reasonData.length > 0 && (
          <Card className="border-neutral-200 bg-white">
            <div className="p-5 pb-2">
              <h3 className="text-sm font-semibold text-neutral-900">Return Reasons</h3>
              <p className="text-xs text-neutral-500">Most common reasons for returns</p>
            </div>
            <CardContent className="p-5 pt-0">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reasonData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#a3a3a3" }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#525252" }} tickLine={false} axisLine={false} width={110} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e5e5" }} />
                    <Bar dataKey="value" fill="#171717" radius={[0, 4, 4, 0]} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top returned products */}
        {productData.length > 0 && (
          <Card className="border-neutral-200 bg-white">
            <div className="p-5 pb-2">
              <h3 className="text-sm font-semibold text-neutral-900">Top Returned Products</h3>
              <p className="text-xs text-neutral-500">Most frequently returned items</p>
            </div>
            <CardContent className="p-5 pt-0">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fill: "#a3a3a3" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e5e5e5" }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "#a3a3a3" }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e5e5" }} />
                    <Bar dataKey="count" fill="#525252" radius={[4, 4, 0, 0]} name="Returns" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
