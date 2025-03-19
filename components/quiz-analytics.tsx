"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample quiz analytics data
const quizAnalyticsData = [
  { category: "HTML", score: 80, average: 75 },
  { category: "CSS", score: 90, average: 70 },
  { category: "JavaScript", score: 65, average: 60 },
  { category: "React Intro", score: 70, average: 65 },
  { category: "Components", score: 0, average: 62 },
  { category: "Hooks", score: 0, average: 58 },
]

export function QuizAnalytics() {
  return (
    <Card className="border border-gray-200 shadow-md hover:shadow-md transition-all duration-300 rounded-xl">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-gray-900">Quiz Performance</CardTitle>
        <CardDescription className="text-gray-600">Your scores compared to average user performance</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            score: {
              label: "Your Score",
              color: "hsl(var(--chart-1))",
            },
            average: {
              label: "Average Score",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quizAnalyticsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
              <XAxis dataKey="category" tick={{ fill: "#333333" }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#333333" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="score" fill="var(--color-score)" name="Your Score" />
              <Bar dataKey="average" fill="var(--color-average)" name="Average Score" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

