"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle } from "lucide-react"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizCardProps {
  title: string
  description: string
  questions: QuizQuestion[]
  onComplete: (score: number, totalQuestions: number) => void
}

export function QuizCard({ title, description, questions, onComplete }: QuizCardProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index)
  }

  const handleCheckAnswer = () => {
    if (selectedOption === null) return

    const correct = selectedOption === questions[currentQuestion].correctAnswer
    setIsCorrect(correct)
    setShowExplanation(true)

    if (correct) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    setSelectedOption(null)
    setShowExplanation(false)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setQuizCompleted(true)
      onComplete(score + (isCorrect ? 1 : 0), questions.length)
    }
  }

  const handleRestartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedOption(null)
    setShowExplanation(false)
    setScore(0)
    setQuizCompleted(false)
  }

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {!quizCompleted && (
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span>Score: {score}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!quizCompleted ? (
          <div className="space-y-4">
            <div className="text-lg font-medium">{questions[currentQuestion].question}</div>
            <RadioGroup value={selectedOption?.toString()} className="space-y-2">
              {questions[currentQuestion].options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 rounded-md border p-3 ${
                    showExplanation && index === questions[currentQuestion].correctAnswer
                      ? "border-green-500 bg-green-50"
                      : showExplanation &&
                          index === selectedOption &&
                          index !== questions[currentQuestion].correctAnswer
                        ? "border-red-500 bg-red-50"
                        : ""
                  }`}
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                    disabled={showExplanation}
                    onClick={() => handleOptionSelect(index)}
                  />
                  <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                    {option}
                  </Label>
                  {showExplanation && index === questions[currentQuestion].correctAnswer && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {showExplanation &&
                    index === selectedOption &&
                    index !== questions[currentQuestion].correctAnswer && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              ))}
            </RadioGroup>
            {showExplanation && (
              <div className={`mt-4 rounded-md p-3 ${isCorrect ? "bg-green-50" : "bg-red-50"}`}>
                <p className="font-medium">{isCorrect ? "Correct!" : "Incorrect"}</p>
                <p className="text-sm mt-1">{questions[currentQuestion].explanation}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="text-5xl font-bold">
              {score}/{questions.length}
            </div>
            <p className="text-lg">
              {score === questions.length
                ? "Perfect score! Excellent work!"
                : score >= questions.length * 0.7
                  ? "Great job! You've mastered most of this content."
                  : "Keep practicing! You're making progress."}
            </p>
            <div className="h-4"></div>
            <Button onClick={handleRestartQuiz}>Restart Quiz</Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!quizCompleted && !showExplanation && (
          <Button onClick={handleCheckAnswer} disabled={selectedOption === null}>
            Check Answer
          </Button>
        )}
        {!quizCompleted && showExplanation && (
          <Button onClick={handleNextQuestion}>
            {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

