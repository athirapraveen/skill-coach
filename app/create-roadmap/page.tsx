"use client"

import { useState, FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, BookOpen, Check, Loader2 } from "lucide-react"

interface FormData {
  skillName: string;
  goalType: 'project' | 'interview' | 'exam' | 'general';
  goalDescription: string;
  currentLevel: 'beginner' | 'novice' | 'intermediate' | 'advanced';
  timeline: string;
  hoursPerWeek: number[];
  resourcePreference: 'free' | 'paid' | 'mixed';
  budget: string;
  learningFormat: 'video' | 'article' | 'mixed';
}

export default function CreateRoadmapPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    skillName: "",
    goalType: "project",
    goalDescription: "",
    currentLevel: "beginner",
    timeline: "3",
    hoursPerWeek: [10],
    resourcePreference: "mixed",
    budget: "",
    learningFormat: "mixed",
  })

  const handleInputChange = (field: keyof FormData, value: string | number | number[]) => {
    setFormData({ ...formData, [field]: value })
  }

  const nextStep = () => {
    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: formData.skillName,
          preferences: {
            budget: formData.resourcePreference,
            timeline: formData.timeline,
            skillLevel: formData.currentLevel,
            learningFormat: formData.learningFormat,
            resourceType: 'all',
          },
          goalType: formData.goalType,
          goalDescription: formData.goalDescription,
          hoursPerWeek: formData.hoursPerWeek[0],
        }),
      })

      if (!response.ok) {
        // For error responses, try to get the error message
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to generate roadmap. Please try again.')
        } else {
          const errorText = await response.text()
          throw new Error(errorText || 'Failed to generate roadmap. Please try again.')
        }
      }

      // For successful responses, get the streaming text
      const roadmapData = await response.text()
      
      if (!roadmapData) {
        throw new Error('No roadmap data received. Please try again.')
      }

      // Store the generated roadmap data in localStorage for the next page
      localStorage.setItem('generatedRoadmap', roadmapData)
      localStorage.setItem('roadmapPreferences', JSON.stringify(formData))
      
      router.push("/roadmap-created")
    } catch (error) {
      console.error('Error generating roadmap:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-gray-200 py-4">
        <div className="container flex items-center justify-between px-4 md:px-6">
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

      <main className="flex-1 py-8 md:py-12 lg:py-16 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
                Create Your Learning Roadmap
              </h1>
              <p className="text-gray-600 mt-2">
                Tell us about your goals and preferences, and we'll create a personalized learning path for you.
              </p>
            </div>

            <div className="mb-8">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > 1 ? <Check className="h-4 w-4" /> : "1"}
                  </div>
                  <span className={step >= 1 ? "font-medium text-gray-900" : "text-gray-500"}>Goals</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > 2 ? <Check className="h-4 w-4" /> : "2"}
                  </div>
                  <span className={step >= 2 ? "font-medium text-gray-900" : "text-gray-500"}>Timeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > 3 ? <Check className="h-4 w-4" /> : "3"}
                  </div>
                  <span className={step >= 3 ? "font-medium text-gray-900" : "text-gray-500"}>Resources</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      step >= 4 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > 4 ? <Check className="h-4 w-4" /> : "4"}
                  </div>
                  <span className={step >= 4 ? "font-medium text-gray-900" : "text-gray-500"}>Review</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="bg-white border-b border-gray-100">
                    <CardTitle className="text-xl text-gray-900">Define Your Goals</CardTitle>
                    <CardDescription className="text-gray-600">Tell us what you want to learn and why</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="skillName" className="text-gray-700">
                        Skill or Topic
                      </Label>
                      <Input
                        id="skillName"
                        placeholder="e.g., JavaScript, Public Speaking, Data Science"
                        value={formData.skillName}
                        onChange={(e) => handleInputChange("skillName", e.target.value)}
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-gray-700">What's your primary goal?</Label>
                      <RadioGroup
                        value={formData.goalType}
                        onValueChange={(value) => handleInputChange("goalType", value)}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="flex items-center space-x-2 rounded-md border border-gray-200 p-3 hover:bg-gray-50">
                          <RadioGroupItem value="project" id="project" className="text-blue-600" />
                          <Label htmlFor="project" className="text-gray-700 cursor-pointer">
                            Build a project
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-md border border-gray-200 p-3 hover:bg-gray-50">
                          <RadioGroupItem value="interview" id="interview" className="text-blue-600" />
                          <Label htmlFor="interview" className="text-gray-700 cursor-pointer">
                            Prepare for an interview
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-md border border-gray-200 p-3 hover:bg-gray-50">
                          <RadioGroupItem value="exam" id="exam" className="text-blue-600" />
                          <Label htmlFor="exam" className="text-gray-700 cursor-pointer">
                            Pass an exam/certification
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-md border border-gray-200 p-3 hover:bg-gray-50">
                          <RadioGroupItem value="general" id="general" className="text-blue-600" />
                          <Label htmlFor="general" className="text-gray-700 cursor-pointer">
                            General knowledge
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goalDescription" className="text-gray-700">
                        Describe your goal in detail
                      </Label>
                      <Textarea
                        id="goalDescription"
                        placeholder="e.g., I want to build a personal portfolio website using React, or I'm preparing for a Google software engineer interview"
                        value={formData.goalDescription}
                        onChange={(e) => handleInputChange("goalDescription", e.target.value)}
                        required
                        className="min-h-[120px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentLevel" className="text-gray-700">
                        Current skill level
                      </Label>
                      <Select
                        value={formData.currentLevel}
                        onValueChange={(value) => handleInputChange("currentLevel", value)}
                      >
                        <SelectTrigger id="currentLevel" className="border-gray-300 focus:ring-blue-500">
                          <SelectValue placeholder="Select your current level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner (No experience)</SelectItem>
                          <SelectItem value="novice">Novice (Some basic knowledge)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (Comfortable with basics)</SelectItem>
                          <SelectItem value="advanced">Advanced (Looking to master)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
                    <Link href="/dashboard">
                      <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      >
                        Cancel
                      </Button>
                    </Link>
                    <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white">
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {step === 2 && (
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="bg-white border-b border-gray-100">
                    <CardTitle className="text-xl text-gray-900">Set Your Timeline</CardTitle>
                    <CardDescription className="text-gray-600">
                      Define how much time you can commit to learning
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="timeline" className="text-gray-700">
                        How long do you want to spend on this skill?
                      </Label>
                      <Select value={formData.timeline} onValueChange={(value) => handleInputChange("timeline", value)}>
                        <SelectTrigger id="timeline" className="border-gray-300 focus:ring-blue-500">
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 month</SelectItem>
                          <SelectItem value="3">3 months</SelectItem>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">1 year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-gray-700">Hours per week you can dedicate</Label>
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="text-sm">1 hour</span>
                        <span className="text-sm font-medium">{formData.hoursPerWeek[0]} hours</span>
                        <span className="text-sm">40+ hours</span>
                      </div>
                      <Slider
                        value={formData.hoursPerWeek}
                        min={1}
                        max={40}
                        step={1}
                        onValueChange={(value) => handleInputChange("hoursPerWeek", value)}
                        className="py-2"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white">
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {step === 3 && (
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="bg-white border-b border-gray-100">
                    <CardTitle className="text-xl text-gray-900">Learning Resources</CardTitle>
                    <CardDescription className="text-gray-600">
                      Tell us about your preferred learning resources
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                      <Label className="text-gray-700">Resource preference</Label>
                      <RadioGroup
                        value={formData.resourcePreference}
                        onValueChange={(value) => handleInputChange("resourcePreference", value)}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="flex items-center space-x-2 rounded-md border border-gray-200 p-3 hover:bg-gray-50">
                          <RadioGroupItem value="free" id="free" className="text-blue-600" />
                          <Label htmlFor="free" className="text-gray-700 cursor-pointer">
                            Free resources only
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-md border border-gray-200 p-3 hover:bg-gray-50">
                          <RadioGroupItem value="mixed" id="mixed" className="text-blue-600" />
                          <Label htmlFor="mixed" className="text-gray-700 cursor-pointer">
                            Blend of free and paid resources
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    {formData.resourcePreference !== "free" && (
                      <div className="space-y-2">
                        <Label htmlFor="budget" className="text-gray-700">
                          Budget (if applicable)
                        </Label>
                        <Input
                          id="budget"
                          type="number"
                          placeholder="e.g., 100"
                          value={formData.budget}
                          onChange={(e) => handleInputChange("budget", e.target.value)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <p className="text-sm text-gray-500">Enter your maximum budget in USD</p>
                      </div>
                    )}
                    <div className="space-y-3">
                      <Label className="text-gray-700">Preferred learning format</Label>
                      <RadioGroup
                        value={formData.learningFormat}
                        onValueChange={(value) => handleInputChange("learningFormat", value)}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="flex items-center space-x-2 rounded-md border border-gray-200 p-3 hover:bg-gray-50">
                          <RadioGroupItem value="video" id="video" className="text-blue-600" />
                          <Label htmlFor="video" className="text-gray-700 cursor-pointer">
                            Video courses
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-md border border-gray-200 p-3 hover:bg-gray-50">
                          <RadioGroupItem value="text" id="text" className="text-blue-600" />
                          <Label htmlFor="text" className="text-gray-700 cursor-pointer">
                            Articles & books
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-md border border-gray-200 p-3 hover:bg-gray-50">
                          <RadioGroupItem value="interactive" id="interactive" className="text-blue-600" />
                          <Label htmlFor="interactive" className="text-gray-700 cursor-pointer">
                            Interactive exercises
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-md border border-gray-200 p-3 hover:bg-gray-50">
                          <RadioGroupItem value="mixed" id="mixed-format" className="text-blue-600" />
                          <Label htmlFor="mixed-format" className="text-gray-700 cursor-pointer">
                            Recommended
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white">
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {step === 4 && (
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="bg-white border-b border-gray-100">
                    <CardTitle className="text-xl text-gray-900">Review Your Roadmap Settings</CardTitle>
                    <CardDescription className="text-gray-600">
                      Confirm your preferences before we create your roadmap
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <h3 className="font-medium text-gray-700">Skill/Topic</h3>
                        <p className="text-gray-600">{formData.skillName}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium text-gray-700">Goal Type</h3>
                        <p className="text-gray-600 capitalize">{formData.goalType}</p>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <h3 className="font-medium text-gray-700">Goal Description</h3>
                        <p className="text-gray-600">{formData.goalDescription}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium text-gray-700">Current Level</h3>
                        <p className="text-gray-600 capitalize">{formData.currentLevel}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium text-gray-700">Timeline</h3>
                        <p className="text-gray-600">
                          {formData.timeline === "1"
                            ? "1 month"
                            : formData.timeline === "3"
                              ? "3 months"
                              : formData.timeline === "6"
                                ? "6 months"
                                : "1 year"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium text-gray-700">Hours per Week</h3>
                        <p className="text-gray-600">{formData.hoursPerWeek[0]} hours</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium text-gray-700">Resource Preference</h3>
                        <p className="text-gray-600 capitalize">
                          {formData.resourcePreference === "free"
                            ? "Free resources only"
                            : "Blend of free and paid resources"}
                        </p>
                      </div>
                      {formData.resourcePreference !== "free" && formData.budget && (
                        <div className="space-y-1">
                          <h3 className="font-medium text-gray-700">Budget</h3>
                          <p className="text-gray-600">${formData.budget}</p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <h3 className="font-medium text-gray-700">Learning Format</h3>
                        <p className="text-gray-600 capitalize">
                          {formData.learningFormat === "mixed" ? "Recommended" : formData.learningFormat}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Roadmap...
                        </>
                      ) : (
                        'Create My Roadmap'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </form>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-medium text-gray-900">Skill Coach</span>
            </div>
            <p className="text-sm text-gray-500">© 2024 Skill Coach. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="/terms" className="text-sm text-gray-500 hover:text-blue-600">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-blue-600">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

