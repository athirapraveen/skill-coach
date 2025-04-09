"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, FileText, Play, Code, BookOpen, Laptop } from "lucide-react"

interface Resource {
  id: string
  title: string
  description: string
  url: string
  isPaid: boolean
  price?: string
  type: "video" | "book" | "article" | "platform" | "project"
}

interface TopicResources {
  topicId: string
  topicTitle: string
  resources: Resource[]
}

interface ResourcesSectionProps {
  topicResources: TopicResources[]
  activeTopicId?: string
}

export function ResourcesSection({ topicResources, activeTopicId }: ResourcesSectionProps) {
  // If an activeTopicId is provided, scroll to that section on mount
  const scrollToTopic = (topicId: string) => {
    const element = document.getElementById(`topic-${topicId}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Learning Resources</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Filter
          </Button>
          <Button variant="outline" size="sm">
            Sort by Recommended
          </Button>
        </div>
      </div>

      {/* Topic navigation */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {topicResources.map((topic) => (
            <Button
              key={topic.topicId}
              variant={activeTopicId === topic.topicId ? "default" : "outline"}
              size="sm"
              onClick={() => scrollToTopic(topic.topicId)}
            >
              {topic.topicTitle}
            </Button>
          ))}
        </div>
      </div>

      {/* Resources by topic */}
      <div className="space-y-12">
        {topicResources.map((topic) => (
          <div key={topic.topicId} id={`topic-${topic.topicId}`} className="scroll-mt-24">
            <h3 className="text-lg font-bold mb-4">{topic.topicTitle}</h3>

            <Tabs defaultValue="all" className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="video">Videos</TabsTrigger>
                <TabsTrigger value="book">Books</TabsTrigger>
                <TabsTrigger value="article">Articles</TabsTrigger>
                <TabsTrigger value="platform">Platforms</TabsTrigger>
                <TabsTrigger value="project">Projects</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {topic.resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </TabsContent>

              {["video", "book", "article", "platform", "project"].map((type) => (
                <TabsContent key={type} value={type} className="mt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {topic.resources
                      .filter((resource) => resource.type === type)
                      .map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ))}
      </div>
    </div>
  )
}

function ResourceCard({ resource }: { resource: Resource }) {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="h-6 w-6 text-primary" />
      case "book":
        return <BookOpen className="h-6 w-6 text-primary" />
      case "article":
        return <FileText className="h-6 w-6 text-primary" />
      case "platform":
        return <Laptop className="h-6 w-6 text-primary" />
      case "project":
        return <Code className="h-6 w-6 text-primary" />
      default:
        return <FileText className="h-6 w-6 text-primary" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
            {getResourceIcon(resource.type)}
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">{resource.title}</CardTitle>
            <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                resource.isPaid
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-green-100 text-green-800 border border-green-200"
              }`}
            >
              {resource.isPaid ? `Paid${resource.price ? ` - ${resource.price}` : ""}` : "Free"}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 capitalize">
              {resource.type}
            </span>
          </div>
          <Button variant="outline" size="sm" className="gap-1" asChild>
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              View <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

