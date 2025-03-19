import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Calendar, Clock, Plus, Target } from "lucide-react"
import { ProgressChart } from "@/components/progress-chart"

export default function RoadmapsPage() {
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
            <Link href="/roadmaps" className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
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
              <h1 className="text-2xl font-medium text-gray-900">My Learning Roadmaps</h1>
              <Link href="/create-roadmap">
                <Button className="rounded-full shadow-sm hover:shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  New Roadmap
                </Button>
              </Link>
            </div>
            <Tabs defaultValue="active">
              <TabsList className="grid w-full grid-cols-3 mb-4 rounded-full">
                <TabsTrigger value="active" className="rounded-full">
                  Active
                </TabsTrigger>
                <TabsTrigger value="completed" className="rounded-full">
                  Completed
                </TabsTrigger>
                <TabsTrigger value="archived" className="rounded-full">
                  Archived
                </TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="text-gray-900">UX/UI Design Fundamentals</CardTitle>
                      <CardDescription className="text-gray-600">Design Skills</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress: 20%</span>
                        <span className="text-sm text-gray-600">Due in 60 days</span>
                      </div>
                      <Progress value={20} className="h-2" />
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-700">Design portfolio</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-700">6 hours/week</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href="/roadmaps/ux-ui-design">
                        <Button
                          variant="outline"
                          className="rounded-full shadow-sm hover:shadow-md border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        >
                          View Roadmap
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
                <ProgressChart />
              </TabsContent>
              <TabsContent value="completed" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="text-gray-900">HTML & CSS Fundamentals</CardTitle>
                      <CardDescription className="text-gray-600">Web Development Basics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Completed on May 15, 2023</span>
                        <span className="text-sm text-gray-600">8-week course</span>
                      </div>
                      <Progress value={100} className="h-2" />
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-700">Build a responsive website</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-700">Completed</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="rounded-full shadow-sm hover:shadow-md border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      >
                        View Certificate
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="archived" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="text-gray-900">Python Basics</CardTitle>
                      <CardDescription className="text-gray-600">Programming Fundamentals</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Archived on January 5, 2023</span>
                        <span className="text-sm text-gray-600">Progress: 30%</span>
                      </div>
                      <Progress value={30} className="h-2" />
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-700">Learn programming basics</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-700">Archived</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="rounded-full shadow-sm hover:shadow-md border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      >
                        Restore Roadmap
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

