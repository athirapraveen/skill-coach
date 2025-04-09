'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Target } from "lucide-react"
import { QuizAnalytics } from "@/components/quiz-analytics"
import { Header } from "@/components/header"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 py-8 md:py-10 lg:py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-medium text-gray-900">Dashboard</h1>
              <Link href="/create-roadmap">
                <Button className="rounded-full shadow-sm hover:shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  New Roadmap
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                <CardHeader className="pb-2 border-b border-gray-100">
                  <CardTitle className="text-gray-900">Active Roadmaps</CardTitle>
                  <CardDescription className="text-gray-600">Your current learning journeys</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">JavaScript Fundamentals</span>
                      <span className="text-xs text-gray-500">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">React Advanced</span>
                      <span className="text-xs text-gray-500">32%</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-gray-100">
                  <Link href="/roadmaps" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View all roadmaps
                  </Link>
                </CardFooter>
              </Card>
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                <CardHeader className="pb-2 border-b border-gray-100">
                  <CardTitle className="text-gray-900">Recent Quizzes</CardTitle>
                  <CardDescription className="text-gray-600">Your latest assessments</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">JavaScript Basics</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">85%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">React Hooks</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">72%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-gray-100">
                  <Link href="/quizzes" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View all quizzes
                  </Link>
                </CardFooter>
              </Card>
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                <CardHeader className="pb-2 border-b border-gray-100">
                  <CardTitle className="text-gray-900">Learning Goals</CardTitle>
                  <CardDescription className="text-gray-600">Your current objectives</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span className="text-sm text-gray-700">Complete JavaScript Fundamentals roadmap</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span className="text-sm text-gray-700">Score 90% on React Hooks quiz</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-gray-100">
                  <Link href="/goals" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Manage goals
                  </Link>
                </CardFooter>
              </Card>
            </div>
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
              <CardHeader className="pb-2 border-b border-gray-100">
                <CardTitle className="text-gray-900">Quiz Performance</CardTitle>
                <CardDescription className="text-gray-600">Your recent quiz results</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <QuizAnalytics />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

