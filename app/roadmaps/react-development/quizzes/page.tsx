"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, CheckCircle, Clock, FileText, Trophy, AlertCircle } from "lucide-react"

export default function QuizzesPage() {
  // Get requested quizzes from localStorage (in a real app, this would come from a database)
  const [requestedQuizzes, setRequestedQuizzes] = useState<string[]>([])

  useEffect(() => {
    // This is just a mock implementation - in a real app, you'd fetch this from an API
    const handleStorageChange = () => {
      const storedQuizzes = localStorage.getItem("requestedQuizzes")
      if (storedQuizzes) {
        setRequestedQuizzes(JSON.parse(storedQuizzes))
      } else {
        setRequestedQuizzes([])
      }
    }

    // Initial load
    handleStorageChange()

    // Listen for changes (this would be replaced by a real-time update mechanism in a real app)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const [quizScores, setQuizScores] = useState({
    "html-basics": { completed: true, score: 8, total: 10 },
    "css-basics": { completed: true, score: 9, total: 10 },
    "js-basics": { completed: false, score: 0, total: 10 },
    "react-intro": { completed: false, score: 0, total: 10 },
    "react-components": { completed: false, score: 0, total: 10 },
    "react-hooks": { completed: false, score: 0, total: 10 },
  })

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
      <main className="flex-1 py-6 md:py-8 lg:py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-medium text-gray-900">React Development Quizzes</h1>
                <p className="text-gray-600 mt-2">Test your knowledge as you progress through your roadmap</p>
              </div>
              <Link href="/roadmaps/react-development">
                <Button
                  variant="outline"
                  className="rounded-full shadow-sm hover:shadow-md border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  Back to Roadmap
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-900">Quizzes Completed</CardTitle>
                  <CardDescription className="text-gray-600">Your quiz progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-medium text-gray-900">
                    {Object.values(quizScores).filter((q) => q.completed).length}/{Object.keys(quizScores).length}
                  </div>
                  <Progress
                    value={
                      (Object.values(quizScores).filter((q) => q.completed).length / Object.keys(quizScores).length) *
                      100
                    }
                    className="h-2 mt-2"
                  />
                </CardContent>
              </Card>
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-900">Average Score</CardTitle>
                  <CardDescription className="text-gray-600">Your quiz performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-medium text-gray-900">
                    {Object.values(quizScores).filter((q) => q.completed).length > 0
                      ? Math.round(
                          Object.values(quizScores)
                            .filter((q) => q.completed)
                            .reduce((acc, q) => acc + (q.score / q.total) * 100, 0) /
                            Object.values(quizScores).filter((q) => q.completed).length,
                        )
                      : 0}
                    %
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-900">Next Quiz</CardTitle>
                  <CardDescription className="text-gray-600">Continue your learning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-medium text-gray-900">JavaScript Fundamentals</div>
                  <div className="text-sm text-gray-600 mt-1">10 questions • 15 minutes</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="available">
              <TabsList className="grid w-full grid-cols-3 mb-4 rounded-full">
                <TabsTrigger value="available" className="rounded-full">
                  Available
                </TabsTrigger>
                <TabsTrigger value="completed" className="rounded-full">
                  Completed
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="rounded-full">
                  Upcoming
                </TabsTrigger>
              </TabsList>
              <TabsContent value="available" className="space-y-4">
                {requestedQuizzes.length > 0 ? (
                  <>
                    {requestedQuizzes.includes("js-basics") && (
                      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                        <CardHeader>
                          <CardTitle className="text-gray-900">JavaScript Fundamentals</CardTitle>
                          <CardDescription className="text-gray-600">
                            Test your knowledge of JavaScript basics
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <Clock className="h-4 w-4" />
                            <span>Estimated time: 15 minutes</span>
                            <FileText className="h-4 w-4 ml-4" />
                            <span>10 questions</span>
                          </div>
                          <p className="text-gray-700">
                            This quiz covers JavaScript syntax, data types, functions, and DOM manipulation.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Link href="/roadmaps/react-development/quizzes/js-basics">
                            <Button className="rounded-full shadow-sm hover:shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                              Start Quiz
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    )}

                    {requestedQuizzes.includes("react-intro") && (
                      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                        <CardHeader>
                          <CardTitle className="text-gray-900">Introduction to React</CardTitle>
                          <CardDescription className="text-gray-600">
                            Test your understanding of React fundamentals
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <Clock className="h-4 w-4" />
                            <span>Estimated time: 20 minutes</span>
                            <FileText className="h-4 w-4 ml-4" />
                            <span>10 questions</span>
                          </div>
                          <p className="text-gray-700">
                            This quiz covers React's core philosophy, virtual DOM, and basic setup.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Link href="/roadmaps/react-development/quizzes/react-intro">
                            <Button className="rounded-full shadow-sm hover:shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                              Start Quiz
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    )}

                    {requestedQuizzes
                      .filter((id) => !["js-basics", "react-intro", "html-basics", "css-basics"].includes(id))
                      .map((topicId) => (
                        <Card
                          key={topicId}
                          className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
                        >
                          <CardHeader>
                            <CardTitle className="text-gray-900">
                              {topicId
                                .split("-")
                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(" ")}
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                              Test your knowledge of this topic
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                              <Clock className="h-4 w-4" />
                              <span>Estimated time: 15 minutes</span>
                              <FileText className="h-4 w-4 ml-4" />
                              <span>10 questions</span>
                            </div>
                            <p className="text-gray-700">
                              This quiz covers key concepts and practical applications of{" "}
                              {topicId
                                .split("-")
                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(" ")}
                              .
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Link href={`/roadmaps/react-development/quizzes/${topicId}`}>
                              <Button className="rounded-full shadow-sm hover:shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                                Start Quiz
                              </Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      ))}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Quizzes Requested</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      Return to your roadmap and request quizzes for specific topics by clicking the "Request Quiz"
                      button next to any topic.
                    </p>
                    <Link href="/roadmaps/react-development">
                      <Button className="rounded-full shadow-sm hover:shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                        Back to Roadmap
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="completed" className="space-y-4">
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-gray-900">HTML Basics</CardTitle>
                        <CardDescription className="text-gray-600">
                          Fundamentals of HTML structure and elements
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <span className="font-bold text-gray-900">8/10</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Completed on May 10, 2023</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      className="rounded-full shadow-sm hover:shadow-md border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      View Results
                    </Button>
                    <Button className="rounded-full shadow-sm hover:shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                      Retake Quiz
                    </Button>
                  </CardFooter>
                </Card>
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-gray-900">CSS Basics</CardTitle>
                        <CardDescription className="text-gray-600">Styling web pages with CSS</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <span className="font-bold text-gray-900">9/10</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Completed on May 17, 2023</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      className="rounded-full shadow-sm hover:shadow-md border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      View Results
                    </Button>
                    <Button className="rounded-full shadow-sm hover:shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                      Retake Quiz
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="upcoming" className="space-y-4">
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-gray-900">React Components & Props</CardTitle>
                    <CardDescription className="text-gray-600">Building and composing React components</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Clock className="h-4 w-4" />
                      <span>Estimated time: 20 minutes</span>
                      <FileText className="h-4 w-4 ml-4" />
                      <span>10 questions</span>
                    </div>
                    <p className="text-gray-600">Complete the "Introduction to React" section to unlock this quiz.</p>
                  </CardContent>
                  <CardFooter>
                    <Button disabled className="rounded-full shadow-sm bg-gray-200 text-gray-500">
                      Locked
                    </Button>
                  </CardFooter>
                </Card>
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-gray-900">React Hooks</CardTitle>
                    <CardDescription className="text-gray-600">
                      Managing state and side effects with hooks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Clock className="h-4 w-4" />
                      <span>Estimated time: 25 minutes</span>
                      <FileText className="h-4 w-4 ml-4" />
                      <span>15 questions</span>
                    </div>
                    <p className="text-gray-600">
                      Complete the "React Components & Props" section to unlock this quiz.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button disabled className="rounded-full shadow-sm bg-gray-200 text-gray-500">
                      Locked
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

