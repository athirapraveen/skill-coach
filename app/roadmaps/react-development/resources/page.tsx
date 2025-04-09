"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, ExternalLink, Play, FileText, Target, Code, RefreshCw, ArrowLeft } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Define resource types
type ResourceType = "video" | "book" | "article" | "platform" | "project" | "exercise"

// Define a resource
interface Resource {
  id: string
  title: string
  description: string
  type: ResourceType
  url: string
  isPaid: boolean
  price?: string
}

// Define a topic with resources
interface TopicResources {
  id: string
  title: string
  resources: Resource[]
}

export default function ResourcesPage() {
  // State for topics and their resources
  const [topicsResources, setTopicsResources] = useState<TopicResources[]>([
    {
      id: "html-basics",
      title: "HTML Basics",
      resources: [
        {
          id: "html-mdn",
          title: "MDN HTML Guide",
          description: "Comprehensive documentation and tutorials for HTML from Mozilla Developer Network",
          type: "article",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
          isPaid: false,
        },
        {
          id: "html-video-course",
          title: "HTML Crash Course",
          description: "Quick introduction to HTML elements, attributes, and document structure",
          type: "video",
          url: "https://example.com/html-crash-course",
          isPaid: false,
        },
        {
          id: "html-book",
          title: "HTML & CSS: Design and Build Websites",
          description: "A beautifully designed book that teaches HTML and CSS fundamentals",
          type: "book",
          url: "https://example.com/html-css-book",
          isPaid: true,
          price: "$29.99",
        },
        {
          id: "html-project",
          title: "Portfolio Page",
          description: "Build a simple portfolio page using HTML to practice your skills",
          type: "project",
          url: "https://example.com/html-portfolio-project",
          isPaid: false,
        },
      ],
    },
    {
      id: "css-basics",
      title: "CSS Basics",
      resources: [
        {
          id: "css-mdn",
          title: "MDN CSS Guide",
          description: "Comprehensive documentation and tutorials for CSS from Mozilla Developer Network",
          type: "article",
          url: "https://developer.mozilla.org/en-US/docs/Web/CSS",
          isPaid: false,
        },
        {
          id: "css-video-course",
          title: "CSS Crash Course",
          description: "Learn CSS fundamentals including selectors, properties, and responsive design",
          type: "video",
          url: "https://example.com/css-crash-course",
          isPaid: false,
        },
        {
          id: "css-platform",
          title: "CSS Diner",
          description: "Interactive game to learn and practice CSS selectors",
          type: "platform",
          url: "https://flukeout.github.io/",
          isPaid: false,
        },
        {
          id: "css-project",
          title: "Responsive Landing Page",
          description: "Build a responsive landing page to practice CSS layout and media queries",
          type: "project",
          url: "https://example.com/css-landing-page-project",
          isPaid: false,
        },
      ],
    },
    {
      id: "js-basics",
      title: "JavaScript Fundamentals",
      resources: [
        {
          id: "js-mdn",
          title: "MDN JavaScript Guide",
          description: "Comprehensive documentation and tutorials for JavaScript from Mozilla Developer Network",
          type: "article",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
          isPaid: false,
        },
        {
          id: "js-video-course",
          title: "JavaScript Crash Course",
          description: "Learn JavaScript fundamentals including syntax, data types, functions, and DOM manipulation",
          type: "video",
          url: "https://example.com/js-crash-course",
          isPaid: false,
        },
        {
          id: "js-book",
          title: "Eloquent JavaScript",
          description: "A modern introduction to programming with JavaScript",
          type: "book",
          url: "https://eloquentjavascript.net/",
          isPaid: false,
        },
        {
          id: "js-platform",
          title: "JavaScript.info",
          description: "Modern JavaScript tutorial with interactive examples and exercises",
          type: "platform",
          url: "https://javascript.info/",
          isPaid: false,
        },
        {
          id: "js-project",
          title: "Interactive Form Validation",
          description: "Build a form with client-side validation using JavaScript",
          type: "project",
          url: "https://example.com/js-form-validation-project",
          isPaid: false,
        },
        {
          id: "js-exercise",
          title: "JavaScript Exercises",
          description: "Practice JavaScript fundamentals with these interactive exercises",
          type: "exercise",
          url: "https://example.com/js-exercises",
          isPaid: false,
        },
      ],
    },
    {
      id: "react-intro",
      title: "Introduction to React",
      resources: [
        {
          id: "react-docs",
          title: "React Official Documentation",
          description: "The official React documentation with guides, API references, and examples",
          type: "article",
          url: "https://reactjs.org/docs/getting-started.html",
          isPaid: false,
        },
        {
          id: "react-video-course",
          title: "React Crash Course",
          description: "Quick introduction to React fundamentals and project building",
          type: "video",
          url: "https://example.com/react-crash-course",
          isPaid: false,
        },
        {
          id: "react-book",
          title: "Road to React",
          description: "A comprehensive book on modern React development with hooks",
          type: "book",
          url: "https://www.roadtoreact.com/",
          isPaid: true,
          price: "$29.99",
        },
        {
          id: "react-platform",
          title: "CodeSandbox",
          description: "Online code editor for React with instant preview and sharing capabilities",
          type: "platform",
          url: "https://codesandbox.io/",
          isPaid: false,
        },
        {
          id: "react-project",
          title: "Todo List App",
          description: "Create a weather application using React and a weather API.",
          type: "project",
          url: "https://example.com/react-todo-app-project",
          isPaid: false,
        },
      ],
    },
  ])

  // State for regeneration feedback
  const [regeneratingTopic, setRegeneratingTopic] = useState<string | null>(null)
  const [regenerationFeedback, setRegenerationFeedback] = useState("")
  const [resourcePreference, setResourcePreference] = useState("free")
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenerationSuccess, setRegenerationSuccess] = useState<string | null>(null)

  // Refs for scrolling to sections
  const topicRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Get all unique resource types across all topics
  const allResourceTypes = Array.from(
    new Set(topicsResources.flatMap((topic) => topic.resources.map((resource) => resource.type))),
  )

  // Function to handle resource regeneration
  const handleRegenerateResources = async (topicId: string) => {
    setIsRegenerating(true)

    // Simulate API call to regenerate resources
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real app, this would call an API with the feedback to get new resources
    // For now, we'll just simulate by adding a new resource
    setTopicsResources((prevTopics) =>
      prevTopics.map((topic) => {
        if (topic.id === topicId) {
          // Add a new "generated" resource based on feedback
          const newResource: Resource = {
            id: `generated-${Date.now()}`,
            title: `${regenerationFeedback.substring(0, 30)}...`,
            description: `Generated resource based on your feedback: "${regenerationFeedback}"`,
            type: "article",
            url: "https://example.com/generated-resource",
            isPaid: resourcePreference === "blend",
          }

          return {
            ...topic,
            resources: [...topic.resources, newResource],
          }
        }
        return topic
      }),
    )

    setIsRegenerating(false)
    setRegenerationFeedback("")
    setRegeneratingTopic(null)
    setRegenerationSuccess(topicId)

    // Clear success message after 3 seconds
    setTimeout(() => {
      setRegenerationSuccess(null)
    }, 3000)
  }

  // Get the topic ID from the URL hash on component mount
  useEffect(() => {
    const hash = window.location.hash.substring(1)
    if (hash && topicRefs.current[hash]) {
      setTimeout(() => {
        topicRefs.current[hash]?.scrollIntoView({ behavior: "smooth" })
      }, 500)
    }
  }, [])

  const scrollToTopic = (topicId: string) => {
    if (topicRefs.current[topicId]) {
      topicRefs.current[topicId]?.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Function to render resource icon based on type
  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case "video":
        return <Play className="h-6 w-6 text-white" />
      case "book":
        return <BookOpen className="h-6 w-6 text-white" />
      case "article":
        return <FileText className="h-6 w-6 text-white" />
      case "platform":
        return <Target className="h-6 w-6 text-white" />
      case "project":
        return <Code className="h-6 w-6 text-white" />
      case "exercise":
        return <Code className="h-6 w-6 text-white" />
    }
  }

  // Function to set ref for a topic
  const setTopicRef = (topicId: string) => (el: HTMLDivElement | null) => {
    topicRefs.current[topicId] = el;
  };

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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link href="/roadmaps/react-development">
                <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-blue-600 text-gray-600">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Roadmap
                </Button>
              </Link>
              <h1 className="text-3xl font-medium mt-4 text-gray-900">React Development Resources</h1>
              <p className="text-gray-600 mt-2">
                Curated learning resources for each topic in your React development roadmap
              </p>
            </div>
          </div>

          {/* Topic navigation */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              {topicsResources.map((topic) => (
                <Button
                  key={topic.id}
                  variant="outline"
                  className="rounded-full shadow-sm hover:shadow-md border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => scrollToTopic(topic.id)}
                >
                  {topic.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Global resource type tabs */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="rounded-full">
              <TabsTrigger value="all" className="rounded-full">
                All
              </TabsTrigger>
              {allResourceTypes.map((type) => (
                <TabsTrigger key={type} value={type} className="rounded-full">
                  {type.charAt(0).toUpperCase() + type.slice(1)}s
                </TabsTrigger>
              ))}
            </TabsList>

            {/* All resources tab */}
            <TabsContent value="all">
              {/* Resources by topic */}
              <div className="space-y-12">
                {topicsResources.map((topic) => (
                  <div key={topic.id} id={topic.id} ref={setTopicRef(topic.id)} className="pt-4">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-medium text-gray-900">{topic.title}</h2>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="rounded-full shadow-sm hover:shadow-md border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            onClick={() => setRegeneratingTopic(topic.id)}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Regenerate Resources
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-xl">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900">Regenerate Resources</DialogTitle>
                            <DialogDescription className="text-gray-600">
                              Provide feedback to generate new resources for {topic.title}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <Textarea
                              placeholder="What specific aspects or technologies would you like to learn more about?"
                              value={regenerationFeedback}
                              onChange={(e) => setRegenerationFeedback(e.target.value)}
                              className="min-h-[100px] rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />

                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-700">Resource Preference</h4>
                              <RadioGroup
                                value={resourcePreference}
                                onValueChange={setResourcePreference}
                                className="flex flex-col space-y-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="free" id="free" className="text-blue-600" />
                                  <Label htmlFor="free" className="text-gray-700">
                                    Free resources only
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="blend" id="blend" className="text-blue-600" />
                                  <Label htmlFor="blend" className="text-gray-700">
                                    Blend of free and paid resources
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => handleRegenerateResources(topic.id)}
                              disabled={!regenerationFeedback.trim() || isRegenerating}
                              className="rounded-full shadow-sm hover:shadow-md bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {isRegenerating ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                "Generate Resources"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {regenerationSuccess === topic.id && (
                      <Alert className="mb-4 bg-blue-50 text-gray-700 border-blue-200 rounded-xl">
                        <AlertDescription>
                          Resources for {topic.title} have been updated based on your feedback!
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {topic.resources.map((resource) => (
                        <Card
                          key={resource.id}
                          className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start">
                              <div className="mr-3 mt-1 p-2 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                                {getResourceIcon(resource.type)}
                              </div>
                              <div>
                                <CardTitle className="text-lg text-gray-900">{resource.title}</CardTitle>
                                <CardDescription className="flex items-center mt-1 text-gray-600">
                                  {resource.isPaid ? <span>Paid - {resource.price}</span> : <span>Free</span>}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600">{resource.description}</p>
                          </CardContent>
                          <CardFooter>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 rounded-full shadow-sm hover:shadow-md border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              >
                                View Resource <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            </a>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Resource type tabs */}
            {allResourceTypes.map((type) => (
              <TabsContent key={type} value={type}>
                <div className="space-y-12">
                  {topicsResources
                    .filter((topic) => topic.resources.some((resource) => resource.type === type))
                    .map((topic) => (
                      <div key={`${topic.id}-${type}`} id={`${topic.id}-${type}`} className="pt-4">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-2xl font-medium text-gray-900">{topic.title}</h2>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {topic.resources
                            .filter((resource) => resource.type === type)
                            .map((resource) => (
                              <Card
                                key={resource.id}
                                className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
                              >
                                <CardHeader className="pb-2">
                                  <div className="flex items-start">
                                    <div className="mr-3 mt-1 p-2 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                                      {getResourceIcon(resource.type)}
                                    </div>
                                    <div>
                                      <CardTitle className="text-lg text-gray-900">{resource.title}</CardTitle>
                                      <CardDescription className="flex items-center mt-1 text-gray-600">
                                        {resource.isPaid ? <span>Paid - {resource.price}</span> : <span>Free</span>}
                                      </CardDescription>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm text-gray-600">{resource.description}</p>
                                </CardContent>
                                <CardFooter>
                                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1 rounded-full shadow-sm hover:shadow-md border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                    >
                                      View Resource <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                  </a>
                                </CardFooter>
                              </Card>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  )
}

