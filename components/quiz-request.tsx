"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookmarkCheck, RefreshCw, X } from "lucide-react"

interface QuizRequestProps {
  topicId: string
  topicName: string
  onRequestQuiz: (topicId: string, topicName: string) => void
  onRemoveQuiz: (topicId: string) => void
  isRequested: boolean
}

export function QuizRequest({ topicId, topicName, onRequestQuiz, onRemoveQuiz, isRequested }: QuizRequestProps) {
  const [isRequesting, setIsRequesting] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRequestQuiz = async () => {
    setIsRequesting(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onRequestQuiz(topicId, topicName)
    setIsRequesting(false)
  }

  const handleRemoveQuiz = async () => {
    setIsRemoving(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    onRemoveQuiz(topicId)
    setIsRemoving(false)
  }

  return (
    <>
      {isRequested ? (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full"
          onClick={handleRemoveQuiz}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span className="text-xs">Removing...</span>
            </>
          ) : (
            <>
              <X className="h-3.5 w-3.5" />
              <span className="text-xs">Remove Quiz</span>
            </>
          )}
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          onClick={handleRequestQuiz}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span className="text-xs">Requesting...</span>
            </>
          ) : (
            <>
              <BookmarkCheck className="h-3.5 w-3.5" />
              <span className="text-xs">Request Quiz</span>
            </>
          )}
        </Button>
      )}
    </>
  )
}

