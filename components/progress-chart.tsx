"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample progress data
const progressData = [
  { week: "Week 1", planned: 10, actual: 8 },
  { week: "Week 2", planned: 10, actual: 12 },
  { week: "Week 3", planned: 10, actual: 7 },
  { week: "Week 4", planned: 10, actual: 9 },
  { week: "Week 5", planned: 10, actual: 11 },
  { week: "Week 6", planned: 10, actual: 10 },
  { week: "Week 7", planned: 10, actual: 8 },
  { week: "Week 8", planned: 10, actual: 0 },
  { week: "Week 9", planned: 10, actual: 0 },
  { week: "Week 10", planned: 10, actual: 0 },
  { week: "Week 11", planned: 10, actual: 0 },
  { week: "Week 12", planned: 10, actual: 0 },
]

export function ProgressChart() {
  return (
    <Card className="border border-gray-200 shadow-md hover:shadow-md transition-all duration-300 rounded-xl">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-gray-900">Learning Progress</CardTitle>
        <CardDescription className="text-gray-600">Weekly study hours: planned vs. actual</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            planned: {
              label: "Planned Hours",
              color: "hsl(var(--chart-1))",
            },
            actual: {
              label: "Actual Hours",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
              <XAxis dataKey="week" tick={{ fill: "#333333" }} />
              <YAxis tick={{ fill: "#333333" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="planned"
                stroke="var(--color-planned)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="var(--color-actual)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

