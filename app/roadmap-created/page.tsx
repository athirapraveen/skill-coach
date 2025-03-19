"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, CheckCircle, Loader2 } from "lucide-react"

export default function RoadmapCreatedPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if we have the generated roadmap
    const roadmapData = localStorage.getItem('generatedRoadmap')
    const preferences = localStorage.getItem('roadmapPreferences')

    if (!roadmapData || !preferences) {
      // If no roadmap data, redirect to create roadmap page
      router.push('/create-roadmap')
      return
    }

    // Short delay to show loading state
    const timer = setTimeout(() => {
      router.push('/roadmaps/generated')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-gray-200 py-4">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-medium text-gray-900">Skill Coach</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/roadmaps" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              My Roadmaps
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-8 md:py-12 lg:py-16 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Creating Your Personalized Roadmap</h1>
              <p className="text-gray-600 mt-2">
                We're generating a customized learning path based on your preferences. This will take just a moment...
              </p>
            </div>
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-white border-b border-gray-100">
                <CardTitle className="text-xl text-gray-900">React Development</CardTitle>
                <CardDescription className="text-gray-600">Frontend Web Development</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="text-left">
                  <h3 className="font-medium text-gray-700">Your Goal</h3>
                  <p className="text-gray-600">Build a portfolio project using React</p>
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-700">Timeline</h3>
                  <p className="text-gray-600">3 months (10 hours/week)</p>
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-700">Resources</h3>
                  <p className="text-gray-600">
                    Mix of free and paid resources, video courses and interactive exercises
                  </p>
                </div>
                <div className="flex justify-center gap-4 mt-6">
                  <Link href="/roadmaps/react-development">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">View Your Roadmap</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-medium text-gray-900">Skill Coach</span>
            </div>
            <p className="text-sm text-gray-500">© 2024 Skill Coach. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="/terms" className="text-sm text-gray-500 hover:text-blue-600">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-blue-600">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

