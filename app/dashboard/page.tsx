import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, Plus, Target } from "lucide-react"
import { QuizAnalytics } from "@/components/quiz-analytics"

export default function DashboardPage() {
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
            <Link href="/dashboard" className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/roadmaps" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              My Roadmaps
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">Welcome, User</span>
          </div>
        </div>
      </header>
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
                <CardContent>
                  <div className="text-3xl font-medium text-gray-900">3</div>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                <CardHeader className="pb-2 border-b border-gray-100">
                  <CardTitle className="text-gray-900">Completed Skills</CardTitle>
                  <CardDescription className="text-gray-600">Skills you've mastered</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-medium text-gray-900">7</div>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                <CardHeader className="pb-2 border-b border-gray-100">
                  <CardTitle className="text-gray-900">Study Streak</CardTitle>
                  <CardDescription className="text-gray-600">Consecutive days of learning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-medium text-gray-900">12</div>
                </CardContent>
              </Card>
            </div>
            <Tabs defaultValue="in-progress">
              <TabsList className="grid w-full grid-cols-3 mb-4 rounded-full">
                <TabsTrigger value="in-progress" className="rounded-full">
                  In Progress
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="rounded-full">
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="completed" className="rounded-full">
                  Completed
                </TabsTrigger>
              </TabsList>
              <TabsContent value="in-progress" className="space-y-4">
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-gray-900">React Development</CardTitle>
                    <CardDescription className="text-gray-600">Frontend Web Development</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress: 65%</span>
                      <span className="text-sm text-gray-600">Due in 14 days</span>
                    </div>
                    <Progress value={65} className="h-2" />
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">Build a portfolio project</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">10 hours/week</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/roadmaps/react-development">
                      <Button
                        variant="outline"
                        className="rounded-full shadow-sm hover:shadow-md border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      >
                        View Roadmap
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-gray-900">Data Structures & Algorithms</CardTitle>
                    <CardDescription className="text-gray-600">Interview Preparation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress: 40%</span>
                      <span className="text-sm text-gray-600">Due in 30 days</span>
                    </div>
                    <Progress value={40} className="h-2" />
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">Google interview prep</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">8 hours/week</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/roadmaps/dsa">
                      <Button
                        variant="outline"
                        className="rounded-full shadow-sm hover:shadow-md border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      >
                        View Roadmap
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="upcoming" className="space-y-4">
                {/* Content for upcoming tab */}
              </TabsContent>
              <TabsContent value="completed" className="space-y-4">
                {/* Content for completed tab */}
              </TabsContent>
            </Tabs>
            <div className="mt-8">
              <QuizAnalytics />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

