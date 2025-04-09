"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft } from "lucide-react"
import { LessonPlan } from "@/components/lesson-plan"
import { useSearchParams } from "next/navigation"

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

interface RoadmapTopic {
  id: string
  title: string
  description: string
  duration: string
  completed: boolean
  section: string
  keep?: boolean
}

export default function LessonPlanPage() {
  const searchParams = useSearchParams()
  const topicId = searchParams.get("topic")

  // State for resources (same as in the roadmap page)
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

    // React Components - Week 7
    {
      id: "comp-1",
      title: "React Components & Props Deep Dive",
      description: "Learn how to create and compose React components, and pass data through props.",
      type: "video",
      url: "https://example.com/react-components",
      isPaid: false,
      completed: false,
      topicId: "react-components",
      week: 7,
    },
    {
      id: "comp-2",
      title: "Thinking in React",
      description: "Official React guide on how to think about components and building React applications.",
      type: "article",
      url: "https://reactjs.org/docs/thinking-in-react.html",
      isPaid: false,
      completed: false,
      topicId: "react-components",
      week: 7,
    },
    {
      id: "comp-3",
      title: "Build a Component Library",
      description: "Create your own reusable component library with React and Storybook.",
      type: "project",
      url: "https://example.com/component-library",
      isPaid: false,
      completed: false,
      topicId: "react-components",
      week: 7,
    },

    // React Hooks - Week 8
    {
      id: "hooks-1",
      title: "React Hooks Crash Course",
      description: "Learn all the built-in React hooks and how to create custom hooks.",
      type: "video",
      url: "https://example.com/react-hooks",
      isPaid: false,
      completed: false,
      topicId: "react-hooks",
      week: 8,
    },
    {
      id: "hooks-2",
      title: "Hooks API Reference",
      description: "Official documentation for all React hooks with examples and explanations.",
      type: "article",
      url: "https://reactjs.org/docs/hooks-reference.html",
      isPaid: false,
      completed: false,
      topicId: "react-hooks",
      week: 8,
    },
    {
      id: "hooks-3",
      title: "Build a Custom Hook Library",
      description: "Create a collection of useful custom hooks for your React applications.",
      type: "project",
      url: "https://example.com/custom-hooks",
      isPaid: false,
      completed: false,
      topicId: "react-hooks",
      week: 8,
    },

    // React Router - Week 9
    {
      id: "router-1",
      title: "React Router Tutorial",
      description: "Learn how to implement client-side routing in your React applications.",
      type: "video",
      url: "https://example.com/react-router",
      isPaid: false,
      completed: false,
      topicId: "react-router",
      week: 9,
    },
    {
      id: "router-2",
      title: "React Router Documentation",
      description: "Official documentation for React Router with guides and API references.",
      type: "article",
      url: "https://reactrouter.com/docs/en/v6",
      isPaid: false,
      completed: false,
      topicId: "react-router",
      week: 9,
    },

    // State Management - Week 10
    {
      id: "state-1",
      title: "Redux Crash Course",
      description: "Learn Redux fundamentals and how to integrate it with React.",
      type: "video",
      url: "https://example.com/redux-crash-course",
      isPaid: false,
      completed: false,
      topicId: "state-management",
      week: 10,
    },
    {
      id: "state-2",
      title: "Context API Deep Dive",
      description: "Learn how to use React's Context API for state management.",
      type: "video",
      url: "https://example.com/context-api",
      isPaid: false,
      completed: false,
      topicId: "state-management",
      week: 10,
    },

    // API Integration - Week 11
    {
      id: "api-1",
      title: "Fetching Data in React",
      description: "Learn different ways to fetch and manage data in React applications.",
      type: "video",
      url: "https://example.com/react-data-fetching",
      isPaid: false,
      completed: false,
      topicId: "api-integration",
      week: 11,
    },
    {
      id: "api-2",
      title: "Build a CRUD Application",
      description: "Create a full CRUD application with React and a REST API.",
      type: "project",
      url: "https://example.com/crud-app",
      isPaid: false,
      completed: false,
      topicId: "api-integration",
      week: 11,
    },

    // Deployment - Week 12
    {
      id: "deploy-1",
      title: "Deploying React Apps",
      description: "Learn how to deploy React applications to various platforms.",
      type: "video",
      url: "https://example.com/react-deployment",
      isPaid: false,
      completed: false,
      topicId: "deployment",
      week: 12,
    },
    {
      id: "deploy-2",
      title: "Vercel Deployment Guide",
      description: "Step-by-step guide to deploying React applications on Vercel.",
      type: "article",
      url: "https://vercel.com/guides/deploying-react-with-vercel",
      isPaid: false,
      completed: false,
      topicId: "deployment",
      week: 12,
    },
  ])

  // State for roadmap topics
  const [roadmapTopics, setRoadmapTopics] = useState<RoadmapTopic[]>([
    {
      id: "html-basics",
      title: "HTML Basics",
      description: "Learn the fundamentals of HTML, including tags, attributes, and document structure.",
      duration: "1 week",
      completed: true,
      section: "Foundations",
    },
    {
      id: "css-basics",
      title: "CSS Basics",
      description: "Master CSS styling, including selectors, properties, and responsive design principles.",
      duration: "1 week",
      completed: true,
      section: "Foundations",
    },
    {
      id: "js-basics",
      title: "JavaScript Fundamentals",
      description: "Learn JavaScript syntax, data types, functions, and DOM manipulation before diving into React.",
      duration: "2 weeks",
      completed: false,
      section: "Foundations",
    },
    {
      id: "react-intro",
      title: "Introduction to React",
      description: "Understand React's core philosophy, virtual DOM, and how to set up your first React application.",
      duration: "1 week",
      completed: false,
      section: "React Core Concepts",
    },
    {
      id: "react-components",
      title: "Components & Props",
      description: "Learn how to create and compose React components, and pass data through props.",
      duration: "1 week",
      completed: false,
      section: "React Core Concepts",
    },
    {
      id: "react-hooks",
      title: "React Hooks",
      description:
        "Master useState, useEffect, and other built-in hooks to manage state and side effects in functional components.",
      duration: "2 weeks",
      completed: false,
      section: "React Core Concepts",
    },
    {
      id: "react-router",
      title: "React Router",
      description: "Learn how to implement client-side routing in your React applications.",
      duration: "1 week",
      completed: false,
      section: "Advanced Concepts",
    },
    {
      id: "state-management",
      title: "State Management",
      description: "Explore state management solutions like Context API and Redux for managing application state.",
      duration: "2 weeks",
      completed: false,
      section: "Advanced Concepts",
    },
    {
      id: "api-integration",
      title: "API Integration",
      description: "Learn how to fetch data from APIs and integrate them into your React applications.",
      duration: "1 week",
      completed: false,
      section: "Advanced Concepts",
    },
    {
      id: "deployment",
      title: "Deployment",
      description: "Learn how to build and deploy your React application to production.",
      duration: "1 week",
      completed: false,
      section: "Advanced Concepts",
    },
  ])

  // Toggle resource completion
  const handleToggleResourceComplete = (resourceId: string) => {
    setResources((prevResources) =>
      prevResources.map((resource) =>
        resource.id === resourceId ? { ...resource, completed: !resource.completed } : resource,
      ),
    )
  }

  // Scroll to the topic section if a topic ID is provided
  useEffect(() => {
    if (topicId) {
      setTimeout(() => {
        const topicElement = document.getElementById(`resource-${topicId}`)
        if (topicElement) {
          topicElement.scrollIntoView({ behavior: "smooth" })

          // Add a highlight effect
          topicElement.classList.add("highlight-effect")

          // Remove the highlight after 3 seconds
          setTimeout(() => {
            topicElement.classList.remove("highlight-effect")
          }, 3000)
        }
      }, 500)
    }
  }, [topicId])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-white" />
            <span className="text-xl font-bold">Skill Coach</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-white hover:text-blue-100 hover:underline underline-offset-4"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-white hover:text-blue-100 hover:underline underline-offset-4"
            >
              Dashboard
            </Link>
            <Link
              href="/roadmaps"
              className="text-sm font-medium text-white hover:text-blue-100 hover:underline underline-offset-4"
            >
              My Roadmaps
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 py-8 md:py-10 lg:py-12 bg-gray-100">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <Link href="/roadmaps/react-development">
              <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Roadmap
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              React Development Lesson Plan
            </h1>
            <p className="text-muted-foreground mt-2">
              Your structured learning path with resources organized by week and topic
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-0">
            <LessonPlan
              resources={resources}
              topics={roadmapTopics}
              onToggleResourceComplete={handleToggleResourceComplete}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

