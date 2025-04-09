"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCw, MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RoadmapFeedbackProps {
  roadmapId?: string
  roadmapTitle?: string
  keepCount?: number
  onRegenerateRoadmap?: (feedback: string) => void
  onSubmit?: (feedback: string) => void
}

export function RoadmapFeedback({
  roadmapId,
  roadmapTitle,
  keepCount,
  onRegenerateRoadmap,
  onSubmit
}: RoadmapFeedbackProps) {
  const [feedbackText, setFeedbackText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim() && keepCount === 0) {
      return; // Don't submit if there's no feedback and no kept topics
    }

    setIsSubmitting(true)

    try {
      // Call the parent handler to regenerate the roadmap with feedback
      await onRegenerateRoadmap?.(feedbackText);
      
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
      
      // Reset the form
      setFeedbackText("")
    } catch (error) {
      console.error("Error regenerating roadmap:", error);
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (onRegenerateRoadmap) {
      onRegenerateRoadmap(feedbackText)
    }
    if (onSubmit) {
      onSubmit(feedbackText)
    }
    setFeedbackText('')
  }

  return (
    <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Customize Your Roadmap
        </CardTitle>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Roadmap Feedback</h3>
          <CardDescription className="text-gray-600">
            {keepCount !== undefined && keepCount > 0
              ? `You've marked ${keepCount} topics to keep. Add any feedback to refine the remaining topics.`
              : "Provide feedback to help us improve your roadmap."}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="bg-blue-50 rounded-md p-3 border border-blue-200 text-sm text-gray-700">
          <p className="font-medium mb-1">How to customize your roadmap:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Click <strong>Keep</strong> on any topics you want to preserve</li>
            <li>Add feedback about what you'd like to change or add</li>
            <li>Click <strong>Regenerate Roadmap</strong> to update your learning plan</li>
          </ol>
        </div>

        <Textarea
          placeholder="What would you like to change or add to your roadmap? Be specific about topics, technologies, or skills you want to focus on..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          className="min-h-[100px] resize-none focus-visible:ring-blue-500 rounded-md border-gray-300"
        />

        {isSuccess && (
          <Alert className="mt-4 bg-blue-50 text-gray-700 border-blue-200 rounded-md">
            <AlertDescription>Your roadmap has been updated based on your feedback!</AlertDescription>
          </Alert>
        )}

        <div className="text-gray-600 text-sm mt-2">
          <p className="font-medium mb-1">Example feedback:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>"I'd like more focus on practical projects rather than theory"</li>
            <li>"Add more on Docker and Kubernetes to my cloud roadmap"</li>
            <li>"I prefer learning through visual resources like diagrams and videos"</li>
            <li>"I have only 5 hours per week to study, so need more focused content"</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t border-gray-100 p-4">
        <Button
          onClick={handleSubmitFeedback}
          disabled={isSubmitting || (!feedbackText.trim() && keepCount === 0)}
          className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Regenerating Roadmap...
            </>
          ) : (
            "Regenerate Roadmap"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

