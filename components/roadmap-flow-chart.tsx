"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Play, BookmarkCheck, ThumbsUp } from "lucide-react"
import Link from "next/link"
import { QuizRequest } from "@/components/quiz-request"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

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

// Update the RoadmapTopic interface to match the new structure
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

interface RoadmapFlowChartProps {
  topics: RoadmapTopic[]
  requestedQuizzes: string[]
  onToggleKeep: (id: string) => void
  onRequestQuiz: (topicId: string, topicName: string) => void
  onRemoveQuiz: (topicId: string) => void
  onStartLearning: (topicId: string) => void
}

// Update the component props
export function RoadmapFlowChart({
  topics,
  requestedQuizzes,
  onToggleKeep,
  onRequestQuiz,
  onRemoveQuiz,
  onStartLearning,
}: RoadmapFlowChartProps) {
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

  // Get unique section names in order of appearance
  const sectionOrder = topics.reduce((acc, topic) => {
    if (!acc.includes(topic.section.name)) {
      acc.push(topic.section.name)
    }
    return acc
  }, [] as string[])

  return (
    <div className="space-y-16">
      {sectionOrder.map((sectionName, sectionIndex) => {
        const section = topicsBySection[sectionName]
        const sectionTopics = section?.topics || []

        return (
          <div key={sectionName} className="relative">
            {/* Section divider - oval tile with blue background */}
            <div className="relative mb-8 flex justify-center">
              <div 
                className="px-8 py-3 bg-blue-600 text-white rounded-full text-base font-semibold shadow-md inline-flex items-center gap-2 hover:bg-blue-700 transition-colors cursor-default"
                title={section?.description || ''}
              >
                <span className="h-6 w-6 rounded-full bg-white text-blue-600 flex items-center justify-center text-sm font-bold">
                  {sectionIndex + 1}
                </span>
                {sectionName}
              </div>
            </div>

            <div className="relative">
              {/* Vertical line connecting topics */}
              <div className="roadmap-connector"></div>

              <div className="space-y-16 relative z-10">
                {sectionTopics.map((topic, topicIndex) => {
                  // Calculate completion percentage for the topic
                  const completionPercentage = topic.completed ? 100 : 0

                  return (
                    <div key={topic.id} className="relative">
                      {/* Topic card */}
                      <Card
                        className={`relative z-10 max-w-2xl mx-auto shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden border ${
                          topic.completed
                            ? "border-l-4 border-l-blue-600"
                            : topic.keep
                              ? "border-l-4 border-l-blue-600"
                              : "border-gray-200"
                        }`}
                      >
                        <CardHeader
                          className={`pb-2 ${
                            topic.completed ? "bg-blue-50" : topic.keep ? "bg-blue-50" : "bg-white"
                          } border-b border-gray-100`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg text-gray-900">{topic.title}</CardTitle>
                              {topic.completed && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                                  Completed
                                </Badge>
                              )}
                              {topic.keep && !topic.completed && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                                  Keeping
                                </Badge>
                              )}
                            </div>
                            <QuizRequest
                              topicId={topic.id}
                              topicName={topic.title}
                              onRequestQuiz={onRequestQuiz}
                              onRemoveQuiz={onRemoveQuiz}
                              isRequested={requestedQuizzes.includes(topic.id)}
                            />
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <span>{topic.duration}</span>
                            <Progress value={completionPercentage} className="w-24 h-1.5" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">{topic.description}</p>
                          
                          {topic.objectives && (
                            <div className="mb-4 bg-blue-50 p-4 rounded-md border border-blue-100">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Objectives:</h4>
                              <div className="text-sm text-gray-600">
                                {topic.objectives.split('\n').map((objective, idx) => (
                                  <div key={idx} className="ml-2">
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
                          
                          {topic.exercises && (
                            <div className="mb-4 bg-green-50 p-4 rounded-md border border-green-100">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Exercise:</h4>
                              <div className="text-sm text-gray-600">
                                {topic.exercises.split('\n').map((exercise, idx) => (
                                  <div key={idx} className="ml-2">
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
                          
                          {topic.resources.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Resources:</h4>
                              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                                {topic.resources.slice(0, 2).map((resource, idx) => (
                                  <li key={resource.id}>
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {resource.title}
                                    </a>
                                    {' '}
                                    <Badge 
                                      variant="outline" 
                                      className="ml-1 text-xs bg-gray-100 border-gray-200"
                                    >
                                      {resource.format}
                                    </Badge>
                                  </li>
                                ))}
                                {topic.resources.length > 2 && (
                                  <li className="text-blue-600 text-xs">+ {topic.resources.length - 2} more resources</li>
                                )}
                              </ul>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-3">
                            <Button
                              variant="default"
                              size="sm"
                              className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-full"
                              onClick={() => onStartLearning(topic.id)}
                            >
                              <Play className="h-3.5 w-3.5" />
                              Start Learning
                            </Button>
                            <Link href={`/roadmaps/generated/resources#${topic.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 shadow-sm hover:shadow-md border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-full"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                View Resources
                              </Button>
                            </Link>
                            {(topic.id === "js-basics" || topic.id === "react-intro") && (
                              <Link href={`/roadmaps/react-development/quizzes/${topic.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-full"
                                >
                                  <BookmarkCheck className="h-3.5 w-3.5" />
                                  Take Quiz
                                </Button>
                              </Link>
                            )}

                            {/* Keep button moved to the right */}
                            <div className="ml-auto">
                              <Button
                                variant={topic.keep ? "default" : "outline"}
                                size="sm"
                                className={`gap-1.5 rounded-full ${
                                  topic.keep
                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                } shadow-sm hover:shadow-md`}
                                onClick={() => onToggleKeep(topic.id)}
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                                {topic.keep ? "Keeping" : "Keep"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Progress indicator */}
                      <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-0 w-10 h-10 rounded-full flex items-center justify-center z-20 bg-white border-2 border-blue-600 shadow-md">
                        <div
                          className={`w-6 h-6 rounded-full ${topic.completed ? "bg-blue-600" : "bg-blue-100"}`}
                        ></div>
                      </div>

                      {/* Connector to next topic (if not the last topic in the section) */}
                      {topicIndex < sectionTopics.length - 1 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full h-16 flex items-center justify-center">
                          <div className="text-gray-400 text-sm">↓</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Add a visual separator between sections if not the last section */}
            {sectionIndex < sectionOrder.length - 1 && (
              <div className="relative h-24 mt-8 flex justify-center items-center">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2"></div>
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center z-10">
                  <div className="text-gray-400">↓</div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

