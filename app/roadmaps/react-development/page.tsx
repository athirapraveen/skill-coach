"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, ArrowLeft, FileText, BookmarkCheck } from "lucide-react"
import { RoadmapFlowChart } from "@/components/roadmap-flow-chart"
import { RoadmapFeedback } from "@/components/roadmap-feedback"
import { LessonPlan } from "@/components/lesson-plan"

// Define a type for roadmap topic
interface RoadmapTopic {
  id: string
  title: string
  description: string
  duration: string
  completed: boolean
  section: string
  keep?: boolean
}

// Define a type for resource
interface Resource {
  id: string
  title: string
  description: string
  type: "video" | "book" | "article" | "platform" | "project" | "exercise"
  url: string
  isPaid: boolean
  price?: string
  completed: boolean
  topicId: string
  week: number
}

export default function ReactDevelopmentRoadmap() {
  const [roadmapTopics, setRoadmapTopics] = useState<RoadmapTopic[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [requestedQuizzes, setRequestedQuizzes] = useState<string[]>([])
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null)
  const [keepCount, setKeepCount] = useState(0)

  useEffect(() => {
    // Get the generated roadmap data from localStorage
    const roadmapData = localStorage.getItem('generatedRoadmap')
    const preferences = localStorage.getItem('roadmapPreferences')

    if (roadmapData && preferences) {
      try {
        // Parse the markdown roadmap data into our topic structure
        const parsedPreferences = JSON.parse(preferences)
        const topics: RoadmapTopic[] = []
        
        // Split the roadmap into weeks
        const weeks = roadmapData.split('# Week')
        weeks.shift() // Remove the first empty element

        weeks.forEach((week, weekIndex) => {
          const lines = week.split('\n')
          const weekNumber = weekIndex + 1
          
          // Extract title and description
          const titleLine = lines[0]
          const title = titleLine.split(':')[1]?.trim() || `Topic ${weekNumber}`
          
          // Find the description (text between title and ## Resources)
          const descriptionLines = []
          let i = 1
          while (i < lines.length && !lines[i].startsWith('## Resources')) {
            if (lines[i].trim()) {
              descriptionLines.push(lines[i].trim())
            }
            i++
          }
          
          const topic: RoadmapTopic = {
            id: `topic-${weekNumber}`,
            title: title,
            description: descriptionLines.join(' ').trim(),
            duration: '1 week',
            completed: false,
            section: weekNumber <= 3 ? 'Foundations' : 
                     weekNumber <= 6 ? 'Core Concepts' : 
                     'Advanced Concepts'
          }
          
          topics.push(topic)
        })

        setRoadmapTopics(topics)
      } catch (error) {
        console.error('Error parsing roadmap data:', error)
      }
    }
  }, [])

  // State for resources
  const [resources, setResources] = useState<Resource[]>([
    // HTML Basics - Week 1
    {
      id: "html-1",
      title: "HTML Crash Course For Absolute Beginners",
      description: "Learn HTML in 1 hour with this comprehensive crash course for beginners.",
      type: "video",
      url: "https://example.com/html-crash-course",
      isPaid: false,
      completed: true,
      topicId: "html-basics",
      week: 1,
    },
    {
      id: "html-2",
      title: "MDN Web Docs: HTML",
      description: "The official Mozilla documentation for HTML with comprehensive guides and references.",
      type: "article",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
      isPaid: false,
      completed: true,
      topicId: "html-basics",
      week: 1,
    },
    {
      id: "html-3",
      title: "Build a Personal Portfolio Page",
      description: "Create your own portfolio page using HTML to showcase your projects and skills.",
      type: "project",
      url: "https://example.com/portfolio-project",
      isPaid: false,
      completed: false,
      topicId: "html-basics",
      week: 1,
    },

    // CSS Basics - Week 2
    {
      id: "css-1",
      title: "CSS Crash Course For Beginners",
      description: "Learn CSS in 1 hour with this comprehensive crash course covering all the basics.",
      type: "video",
      url: "https://example.com/css-crash-course",
      isPaid: false,
      completed: true,
      topicId: "css-basics",
      week: 2,
    },
    {
      id: "css-2",
      title: "MDN Web Docs: CSS",
      description: "The official Mozilla documentation for CSS with comprehensive guides and references.",
      type: "article",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS",
      isPaid: false,
      completed: true,
      topicId: "css-basics",
      week: 2,
    },
    {
      id: "css-3",
      title: "CSS Secrets: Better Solutions to Everyday Web Design Problems",
      description: "Learn how to solve common CSS problems with elegant solutions.",
      type: "book",
      url: "https://example.com/css-secrets",
      isPaid: true,
      price: "$34.99",
      completed: false,
      topicId: "css-basics",
      week: 2,
    },

    // JavaScript Fundamentals - Week 3-4
    {
      id: "js-1",
      title: "JavaScript Crash Course For Beginners",
      description: "Learn JavaScript in 90 minutes with this comprehensive crash course.",
      type: "video",
      url: "https://example.com/js-crash-course",
      isPaid: false,
      completed: false,
      topicId: "js-basics",
      week: 3,
    },
    {
      id: "js-2",
      title: "Eloquent JavaScript",
      description: "A modern introduction to programming with JavaScript, available free online.",
      type: "book",
      url: "https://eloquentjavascript.net/",
      isPaid: false,
      completed: false,
      topicId: "js-basics",
      week: 3,
    },
    {
      id: "js-3",
      title: "Build a To-Do List App",
      description: "Create a functional to-do list application using vanilla JavaScript.",
      type: "project",
      url: "https://example.com/todo-app",
      isPaid: false,
      completed: false,
      topicId: "js-basics",
      week: 4,
    },
    {
      id: "js-4",
      title: "JavaScript Exercises",
      description: "Practice JavaScript fundamentals with these interactive exercises.",
      type: "exercise",
      url: "https://example.com/js-exercises",
      isPaid: false,
      completed: false,
      topicId: "js-basics",
      week: 4,
    },

    // React Intro - Week 5-6
    {
      id: "react-1",
      title: "React JS Crash Course",
      description: "Learn the fundamentals of React including components, state, props, and hooks.",
      type: "video",
      url: "https://example.com/react-crash-course",
      isPaid: false,
      completed: false,
      topicId: "react-intro",
      week: 5,
    },
    {
      id: "react-2",
      title: "React Documentation",
      description: "The official React documentation with guides, API references, and examples.",
      type: "article",
      url: "https://reactjs.org/docs/getting-started.html",
      isPaid: false,
      completed: false,
      topicId: "react-intro",
      week: 5,
    },
    {
      id: "react-3",
      title: "Build a Weather App",
      description: "Create a weather application using React and a weather API.",
      type: "project",
      url: "https://example.com/react-weather-app",
      isPaid: false,
      completed: false,
      topicId: "react-intro",
      week: 6,
    },
  ])

  const handleToggleKeep = (topicId: string) => {
    setRoadmapTopics((prevTopics) =>
      prevTopics.map((topic) => {
        if (topic.id === topicId) {
          const newKeep = !topic.keep
          setKeepCount((prev) => (newKeep ? prev + 1 : prev - 1))
          return { ...topic, keep: newKeep }
        }
        return topic
      }),
    )
  }

  const handleRequestQuiz = (topicId: string, topicName: string) => {
    if (!requestedQuizzes.includes(topicId)) {
      setRequestedQuizzes([...requestedQuizzes, topicId])
    }
  }

  const handleRemoveQuiz = (topicId: string) => {
    setRequestedQuizzes(requestedQuizzes.filter((id) => id !== topicId))
  }

  const handleStartLearning = (topicId: string) => {
    setActiveTopicId(topicId)
    // Switch to the lesson plan tab
    const lessonPlanTab = document.getElementById("lesson-plan-tab")
    if (lessonPlanTab) {
      lessonPlanTab.click()
    }
  }

  const handleToggleResourceComplete = (resourceId: string) => {
    setResources((prevResources) =>
      prevResources.map((resource) =>
        resource.id === resourceId ? { ...resource, completed: !resource.completed } : resource,
      ),
    )
  }

  const handleRegenerateRoadmap = async () => {
    try {
      const preferences = localStorage.getItem('roadmapPreferences')
      if (!preferences) return

      const parsedPreferences = JSON.parse(preferences)
      
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: parsedPreferences.skillName,
          preferences: {
            budget: parsedPreferences.resourcePreference,
            timeline: parsedPreferences.timeline,
            skillLevel: parsedPreferences.currentLevel,
            learningFormat: parsedPreferences.learningFormat,
            resourceType: 'all',
          },
          goalType: parsedPreferences.goalType,
          goalDescription: parsedPreferences.goalDescription,
          hoursPerWeek: parsedPreferences.hoursPerWeek[0],
          feedback: "Please provide alternative topics and resources",
          existingRoadmap: localStorage.getItem('generatedRoadmap')
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate roadmap')
      }

      const newRoadmapData = await response.text()
      localStorage.setItem('generatedRoadmap', newRoadmapData)
      
      // Refresh the page to show new roadmap
      window.location.reload()
    } catch (error) {
      console.error('Error regenerating roadmap:', error)
    }
  }

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
      <main className="flex-1 py-8 md:py-10 lg:py-12 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <Link href="/roadmaps">
              <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-blue-600 text-gray-600">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Roadmaps
              </Button>
            </Link>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-gray-900">React Development Roadmap</h1>
                <p className="text-gray-600 mt-1">A step-by-step guide to becoming a proficient React developer</p>
              </div>
              <div className="flex gap-3">
                <Link href="/roadmaps/react-development/resources">
                  <Button
                    variant="outline"
                    className="gap-1.5 rounded-full shadow-sm hover:shadow-md border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <FileText className="h-4 w-4" />
                    Resources
                  </Button>
                </Link>
                <Link href="/roadmaps/react-development/quizzes">
                  <Button
                    variant="outline"
                    className="gap-1.5 rounded-full shadow-sm hover:shadow-md border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <BookmarkCheck className="h-4 w-4" />
                    Quizzes
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <Tabs defaultValue="flowchart">
            <TabsList className="w-full grid grid-cols-2 rounded-full h-11 p-1 mb-6 bg-blue-50 border border-blue-100">
              <TabsTrigger
                value="flowchart"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                Roadmap View
              </TabsTrigger>
              <TabsTrigger
                value="lesson-plan"
                id="lesson-plan-tab"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                Lesson Plan
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flowchart" className="mt-0">
              <div className="grid gap-8 md:grid-cols-12">
                <div className="md:col-span-8">
                  <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
                    <CardContent className="p-6">
                      <RoadmapFlowChart
                        topics={roadmapTopics}
                        requestedQuizzes={requestedQuizzes}
                        onToggleKeep={handleToggleKeep}
                        onRequestQuiz={handleRequestQuiz}
                        onRemoveQuiz={handleRemoveQuiz}
                        onStartLearning={handleStartLearning}
                      />
                    </CardContent>
                  </Card>
                </div>
                <div className="md:col-span-4">
                  <RoadmapFeedback
                    roadmapId="react-development"
                    roadmapTitle="React Development"
                    keepCount={keepCount}
                    onRegenerateRoadmap={handleRegenerateRoadmap}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lesson-plan" className="mt-0">
              <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
                <CardContent className="p-6">
                  <LessonPlan
                    resources={resources}
                    topics={roadmapTopics}
                    onToggleResourceComplete={handleToggleResourceComplete}
                    activeTopicId={activeTopicId}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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

