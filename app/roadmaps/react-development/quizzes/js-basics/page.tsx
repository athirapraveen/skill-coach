"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, ArrowLeft } from "lucide-react"
import { QuizCard } from "@/components/quiz-card"
import { useRouter } from "next/navigation"

// Sample quiz questions for JavaScript Basics
const jsBasicsQuestions = [
  {
    id: "q1",
    question: "Which of the following is NOT a JavaScript data type?",
    options: ["String", "Boolean", "Float", "Symbol"],
    correctAnswer: 2,
    explanation:
      "JavaScript has six primitive data types: String, Number, Boolean, Null, Undefined, and Symbol. Float is not a separate data type in JavaScript; it falls under the Number type.",
  },
  {
    id: "q2",
    question: "What will be the output of: console.log(typeof [])?",
    options: ["array", "object", "undefined", "null"],
    correctAnswer: 1,
    explanation:
      "In JavaScript, arrays are actually objects, so typeof [] returns 'object'. To check if something is an array, you can use Array.isArray([]).",
  },
  {
    id: "q3",
    question: "Which method is used to add elements to the end of an array?",
    options: ["push()", "pop()", "shift()", "unshift()"],
    correctAnswer: 0,
    explanation:
      "push() adds elements to the end of an array, pop() removes the last element, shift() removes the first element, and unshift() adds elements to the beginning.",
  },
  {
    id: "q4",
    question: "What is the correct way to create a function in JavaScript?",
    options: [
      "function = myFunction() {}",
      "function myFunction() {}",
      "function:myFunction() {}",
      "create myFunction() {}",
    ],
    correctAnswer: 1,
    explanation:
      "The correct syntax for creating a function in JavaScript is 'function myFunction() {}'. You can also use arrow functions or function expressions.",
  },
  {
    id: "q5",
    question: "How do you access the first element of an array named 'fruits'?",
    options: ["fruits[0]", "fruits[1]", "fruits.first()", "fruits.get(0)"],
    correctAnswer: 0,
    explanation:
      "Arrays in JavaScript are zero-indexed, so the first element is accessed using the index 0: fruits[0].",
  },
  {
    id: "q6",
    question: "What does the '===' operator do in JavaScript?",
    options: ["Assigns a value", "Compares values only", "Compares values and types", "Checks if a value exists"],
    correctAnswer: 2,
    explanation:
      "The '===' operator is a strict equality operator that compares both value and type. For example, 5 === '5' is false because one is a number and the other is a string.",
  },
  {
    id: "q7",
    question: "Which method is used to select an HTML element by its ID in JavaScript?",
    options: [
      "document.getElement(id)",
      "document.querySelector(id)",
      "document.getElementById(id)",
      "document.selectElement(id)",
    ],
    correctAnswer: 2,
    explanation:
      "document.getElementById(id) is used to select an HTML element by its ID. For example, document.getElementById('myDiv') selects the element with id='myDiv'.",
  },
  {
    id: "q8",
    question: "What is the correct way to write a JavaScript object?",
    options: [
      "var person = {name: 'John', age: 30};",
      "var person = {name = 'John', age = 30};",
      "var person = (name: 'John', age: 30);",
      "var person = [name: 'John', age: 30];",
    ],
    correctAnswer: 0,
    explanation:
      "JavaScript objects are written with curly braces {}. Properties are written as name:value pairs, separated by commas.",
  },
  {
    id: "q9",
    question: "What will be the output of: console.log(2 + '2')?",
    options: ["4", "22", "NaN", "Error"],
    correctAnswer: 1,
    explanation:
      "When you add a number and a string, JavaScript will convert the number to a string and concatenate them. So 2 + '2' becomes '22'.",
  },
  {
    id: "q10",
    question: "Which event occurs when a user clicks on an HTML element?",
    options: ["onmouseover", "onchange", "onclick", "onmouseclick"],
    correctAnswer: 2,
    explanation:
      "The onclick event occurs when a user clicks on an HTML element. For example, button.onclick = function() { alert('Button clicked!'); };",
  },
]

export default function JSBasicsQuizPage() {
  const router = useRouter()
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizScore, setQuizScore] = useState({ score: 0, total: 0 })

  const handleQuizComplete = (score: number, total: number) => {
    setQuizCompleted(true)
    setQuizScore({ score, total })
    // In a real app, you would save this to a database
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
            <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
              Home
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
              Dashboard
            </Link>
            <Link href="/roadmaps" className="text-sm font-medium hover:underline underline-offset-4">
              My Roadmaps
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 py-6 md:py-8 lg:py-12">
        <div className="container px-4 md:px-6">
          <div className="mb-6">
            <Link href="/roadmaps/react-development/quizzes">
              <Button variant="ghost" className="pl-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Quizzes
              </Button>
            </Link>
          </div>

          {quizCompleted ? (
            <div className="max-w-3xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-6 space-y-4">
                    <h1 className="text-2xl font-bold">Quiz Completed!</h1>
                    <div className="text-5xl font-bold">
                      {quizScore.score}/{quizScore.total}
                    </div>
                    <p className="text-lg">
                      {quizScore.score === quizScore.total
                        ? "Perfect score! You've mastered JavaScript basics!"
                        : quizScore.score >= quizScore.total * 0.7
                          ? "Great job! You have a solid understanding of JavaScript basics."
                          : "Keep practicing! JavaScript fundamentals are essential for React development."}
                    </p>
                    <div className="pt-4 flex justify-center gap-4">
                      <Button onClick={() => router.push("/roadmaps/react-development/quizzes")}>
                        Back to Quizzes
                      </Button>
                      <Button variant="outline" onClick={() => setQuizCompleted(false)}>
                        Retake Quiz
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <QuizCard
                title="JavaScript Fundamentals Quiz"
                description="Test your knowledge of JavaScript basics before diving into React"
                questions={jsBasicsQuestions}
                onComplete={handleQuizComplete}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

