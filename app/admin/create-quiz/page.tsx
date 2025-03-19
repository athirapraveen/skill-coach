"use client"

import { useState, FormEvent } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Plus, Trash } from "lucide-react"

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizFormData {
  title: string;
  description: string;
  roadmap: string;
  section: string;
  questions: Question[];
}

export default function CreateQuizPage() {
  const [quizTitle, setQuizTitle] = useState("")
  const [quizDescription, setQuizDescription] = useState("")
  const [roadmap, setRoadmap] = useState("")
  const [section, setSection] = useState("")
  const [questions, setQuestions] = useState<Question[]>([
    {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    },
  ])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ])
  }

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions]
    newQuestions.splice(index, 1)
    setQuestions(newQuestions)
  }

  const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
    const newQuestions = [...questions]
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    }
    setQuestions(newQuestions)
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // In a real app, you would save this to a database
    const quizData: QuizFormData = {
      title: quizTitle,
      description: quizDescription,
      roadmap,
      section,
      questions,
    }
    console.log(quizData)
    alert("Quiz created successfully!")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">Skill Coach</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/admin" className="text-sm font-medium hover:underline underline-offset-4">
              Admin Dashboard
            </Link>
            <Link href="/admin/quizzes" className="text-sm font-medium hover:underline underline-offset-4">
              Manage Quizzes
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 py-6 md:py-8 lg:py-12">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Create New Quiz</h1>
              <p className="text-muted-foreground mt-2">
                Design a quiz to test learners' knowledge and track their progress
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Quiz Details</CardTitle>
                  <CardDescription>Basic information about the quiz</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Quiz Title</Label>
                    <Input
                      id="title"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="e.g., JavaScript Fundamentals Quiz"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={quizDescription}
                      onChange={(e) => setQuizDescription(e.target.value)}
                      placeholder="Briefly describe what this quiz covers"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="roadmap">Roadmap</Label>
                      <Select value={roadmap} onValueChange={setRoadmap}>
                        <SelectTrigger id="roadmap">
                          <SelectValue placeholder="Select roadmap" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="react-development">React Development</SelectItem>
                          <SelectItem value="data-science">Data Science</SelectItem>
                          <SelectItem value="ux-design">UX/UI Design</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="section">Section</Label>
                      <Select value={section} onValueChange={setSection}>
                        <SelectTrigger id="section">
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="html-basics">HTML Basics</SelectItem>
                          <SelectItem value="css-basics">CSS Basics</SelectItem>
                          <SelectItem value="js-basics">JavaScript Fundamentals</SelectItem>
                          <SelectItem value="react-intro">Introduction to React</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Questions</h2>
                <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>

              {questions.map((question, questionIndex) => (
                <Card key={questionIndex} className="mb-6">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Question {questionIndex + 1}</CardTitle>
                      <CardDescription>Define the question and possible answers</CardDescription>
                    </div>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`question-${questionIndex}`}>Question</Label>
                      <Textarea
                        id={`question-${questionIndex}`}
                        value={question.question}
                        onChange={(e) => updateQuestion(questionIndex, "question", e.target.value)}
                        placeholder="Enter your question here"
                        required
                      />
                    </div>
                    <div className="space-y-4">
                      <Label>Answer Options</Label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            id={`correct-${questionIndex}-${optionIndex}`}
                            name={`correct-${questionIndex}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => updateQuestion(questionIndex, "correctAnswer", optionIndex)}
                            className="h-4 w-4"
                            required
                          />
                          <Input
                            value={option}
                            onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="flex-1"
                            required
                          />
                        </div>
                      ))}
                      <p className="text-sm text-muted-foreground">
                        Select the radio button next to the correct answer
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`explanation-${questionIndex}`}>Explanation</Label>
                      <Textarea
                        id={`explanation-${questionIndex}`}
                        value={question.explanation}
                        onChange={(e) => updateQuestion(questionIndex, "explanation", e.target.value)}
                        placeholder="Explain why the correct answer is right (shown after answering)"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit">Create Quiz</Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

