"use client"
import * as React from "react"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { Check, ExternalLink, FileText, Play, BookOpen, Code, Target, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Import the Resource type from the roadmap page
interface Resource {
  id: string
  title: string
  description: string
  format: "video" | "article" | "book" | "interactive" | "course" | "other"
  type: "tutorial" | "project" | "reference" | "course" | "other"
  url: string
  isFree: boolean
  price?: string
  topicId: string
}

interface RoadmapTopic {
  id: string
  title: string
  description: string
  duration: string
  completed: boolean
  section: {
    name: string
    description?: string
  }
  keep?: boolean
  resources: Resource[]
  objectives: string
  exercises?: string
}

interface LessonPlanProps {
  topics: RoadmapTopic[]
  onToggleResourceComplete?: (resourceId: string) => void
  activeTopicId?: string | null
}

export function LessonPlan({ topics, onToggleResourceComplete, activeTopicId }: LessonPlanProps) {
  // Extract all resources from topics
  const allResources = topics.flatMap(topic => 
    topic.resources.map(resource => ({
      ...resource,
      week: parseInt(topic.id.replace('topic-', '')),
      completed: false // Initialize as not completed
    }))
  );

  // Group resources by week
  const resourcesByWeek = allResources.reduce(
    (acc, resource) => {
      if (!acc[resource.week]) {
        acc[resource.week] = []
      }
      acc[resource.week].push(resource)
      return acc
    },
    {} as Record<number, (Resource & { week: number, completed: boolean })[]>,
  )

  // Get all weeks
  const weeks = Object.keys(resourcesByWeek)
    .map(Number)
    .sort((a, b) => a - b)

  // Group topics by section
  const topicsBySection = topics.reduce(
    (acc, topic) => {
      if (!acc[topic.section.name]) {
        acc[topic.section.name] = {
          topics: [],
          description: topic.section.description
        }
      }
      acc[topic.section.name].topics.push(topic)
      return acc
    },
    {} as Record<string, { topics: RoadmapTopic[], description?: string }>,
  )

  // Get section order
  const sectionOrder = topics.reduce((acc, topic) => {
    if (!acc.includes(topic.section.name)) {
      acc.push(topic.section.name)
    }
    return acc
  }, [] as string[])

  // Function to get resource icon based on type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="h-5 w-5 text-white" />
      case "book":
        return <BookOpen className="h-5 w-5 text-white" />
      case "article":
        return <FileText className="h-5 w-5 text-white" />
      case "platform":
        return <Target className="h-5 w-5 text-white" />
      case "project":
        return <Code className="h-5 w-5 text-white" />
      case "exercise":
        return <Code className="h-5 w-5 text-white" />
      default:
        return <FileText className="h-5 w-5 text-white" />
    }
  }

  // Function to get topic name by ID
  const getTopicName = (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId)
    return topic ? topic.title : topicId
  }

  // Calculate completion percentage for each week
  const weekCompletionPercentage = (week: number) => {
    const weekResources = resourcesByWeek[week] || []
    if (weekResources.length === 0) return 0

    const completedCount = weekResources.filter((r) => r.completed).length
    return Math.round((completedCount / weekResources.length) * 100)
  }

  // Group resources by topic within a week
  const getResourcesByTopicForWeek = (week: number) => {
    const weekResources = resourcesByWeek[week] || []
    return weekResources.reduce(
      (acc, resource) => {
        if (!acc[resource.topicId]) {
          acc[resource.topicId] = []
        }
        acc[resource.topicId].push(resource)
        return acc
      },
      {} as Record<string, Resource[]>,
    )
  }

  // Scroll to active topic if provided
  useEffect(() => {
    if (activeTopicId) {
      const topicElement = document.getElementById(`resource-${activeTopicId}`)
      if (topicElement) {
        setTimeout(() => {
          topicElement.scrollIntoView({ behavior: "smooth" })
          topicElement.classList.add("highlight-effect")
          setTimeout(() => {
            topicElement.classList.remove("highlight-effect")
          }, 3000)
        }, 300)
      }
    }
  }, [activeTopicId])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium text-gray-900">Lesson Plan</h2>
      </div>

      {/* Sections accordion */}
      <Accordion type="multiple" className="w-full" defaultValue={sectionOrder}>
        {sectionOrder.map((sectionName) => {
          const section = topicsBySection[sectionName]
          const sectionTopics = section?.topics || []

          return (
            <AccordionItem key={sectionName} value={sectionName} className="border-0 mb-6">
              <div className="border-l-4 border-l-blue-600 pl-4 py-2">
                <AccordionTrigger className="hover:no-underline py-4 px-4 rounded-lg bg-blue-50 hover:bg-blue-100 shadow-sm">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                        {sectionOrder.indexOf(sectionName) + 1}
                      </div>
                      <div>
                        <span className="font-medium text-lg text-gray-900">{sectionName}</span>
                        {section?.description && (
                          <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="space-y-8 pt-2">
                    {sectionTopics.map((topic) => {
                      const topicResources = resourcesByWeek[topic.id.replace('topic-', '')] || []
                      const completedCount = topicResources.filter(r => r.completed).length
                      const completionPercentage = topicResources.length > 0 
                        ? Math.round((completedCount / topicResources.length) * 100)
                        : 0

                      return (
                        <div
                          key={topic.id}
                          id={`resource-${topic.id}`}
                          className="border-l-2 border-l-gray-300 pl-4 py-2 mb-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-lg text-gray-900">{topic.title}</h3>
                              {completedCount === topicResources.length && topicResources.length > 0 && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                                  <CheckCircle className="h-3 w-3 mr-1" /> Completed
                                </Badge>
                              )}
                            </div>
                            <Progress value={completionPercentage} className="w-24 h-2 animate-progress" />
                          </div>

                          <div className="space-y-4">
                            {topic.description && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-600">{topic.description}</p>
                              </div>
                            )}

                            {topic.objectives && (
                              <div className="mb-4 bg-blue-50 p-4 rounded-md border border-blue-100">
                                <h4 className="text-sm font-semibold text-gray-900 mb-1">Learning Objectives:</h4>
                                <div className="text-sm text-gray-600 mt-2">
                                  {topic.objectives.split('\n').map((objective, idx) => (
                                    <div key={idx} className="ml-2 mb-1">
                                      {objective.startsWith('-') ? (
                                        <div className="flex">
                                          <span className="mr-2">•</span>
                                          <span>{objective.substring(1).trim()}</span>
                                        </div>
                                      ) : (
                                        objective
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mb-2">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Resources:</h4>
                            </div>

                            {topicResources.map((resource) => (
                              <Card
                                key={resource.id}
                                id={`resource-${resource.id}`}
                                className={`shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden border ${
                                  resource.completed ? "bg-blue-50 border-blue-200" : "border-gray-200"
                                }`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-4">
                                    <div className="mt-1 p-3 bg-blue-600 rounded-full shadow-md">
                                      {React.cloneElement(getResourceIcon(resource.type), {
                                        className: "h-5 w-5 text-white",
                                      })}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <h3 className="font-medium text-gray-900">{resource.title}</h3>
                                          <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                                        </div>
                                        <Button
                                          variant={resource.completed ? "default" : "outline"}
                                          size="sm"
                                          className={`ml-2 rounded-full shadow-sm hover:shadow-md ${
                                            resource.completed
                                              ? "bg-blue-600 hover:bg-blue-700"
                                              : "hover:border-blue-600 hover:text-blue-600"
                                          }`}
                                          onClick={() => onToggleResourceComplete && onToggleResourceComplete(resource.id)}
                                        >
                                          {resource.completed ? (
                                            <>
                                              <Check className="mr-1.5 h-3.5 w-3.5" /> Completed
                                            </>
                                          ) : (
                                            "Mark Complete"
                                          )}
                                        </Button>
                                      </div>
                                      <div className="flex items-center gap-2 mt-3">
                                        <Badge variant="outline" className="text-xs text-gray-700 border-gray-300">
                                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                                        </Badge>
                                        {resource.isFree ? (
                                          <Badge
                                            variant="outline"
                                            className="bg-blue-50 text-blue-600 border-blue-200 text-xs"
                                          >
                                            Free
                                          </Badge>
                                        ) : (
                                          <Badge
                                            variant="outline"
                                            className="bg-blue-50 text-blue-600 border-blue-200 text-xs"
                                          >
                                            Paid {resource.price && `- ${resource.price}`}
                                          </Badge>
                                        )}
                                        <a
                                          href={resource.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:underline ml-auto flex items-center"
                                        >
                                          View Resource <ExternalLink className="ml-1 h-3 w-3" />
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>

                          {topic.exercises && (
                            <div className="mt-6 bg-green-50 p-4 rounded-md border border-green-100">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">Practical Exercise:</h4>
                              <div className="text-sm text-gray-600 mt-2">
                                {topic.exercises.split('\n').map((exercise, idx) => (
                                  <div key={idx} className="ml-2 mb-1">
                                    {exercise.startsWith('-') ? (
                                      <div className="flex">
                                        <span className="mr-2">•</span>
                                        <span>{exercise.substring(1).trim()}</span>
                                      </div>
                                    ) : (
                                      exercise
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </AccordionContent>
              </div>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

