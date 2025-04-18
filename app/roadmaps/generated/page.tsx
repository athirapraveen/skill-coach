"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, ArrowLeft } from "lucide-react"
import { RoadmapFlowChart } from "@/components/roadmap-flow-chart"
import { RoadmapFeedback } from "@/components/roadmap-feedback"
import { LessonPlan } from "@/components/lesson-plan"

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

export default function GeneratedRoadmapPage() {
  const router = useRouter()
  const [roadmapTopics, setRoadmapTopics] = useState<RoadmapTopic[]>([])
  const [requestedQuizzes, setRequestedQuizzes] = useState<string[]>([])
  const [keepCount, setKeepCount] = useState(0)
  const [preferences, setPreferences] = useState<any>(null)

  // Debug effect to track keepCount changes and verify against actual kept topics
  useEffect(() => {
    // Calculate actual number of kept topics
    const actualKeptCount = roadmapTopics.filter(topic => topic.keep).length;
    
    if (actualKeptCount !== keepCount) {
      console.warn(`Keep count state (${keepCount}) doesn't match actual kept topics (${actualKeptCount})`);
    }
  }, [keepCount, roadmapTopics]);

  useEffect(() => {
    // Get the generated roadmap data from localStorage
    const roadmapData = localStorage.getItem('generatedRoadmap')
    const prefsData = localStorage.getItem('roadmapPreferences')
    const storedKeepCount = localStorage.getItem('roadmapKeepCount')

    if (!roadmapData || !prefsData) {
      router.push('/create-roadmap')
      return
    }

    try {
      const parsedPrefs = JSON.parse(prefsData)
      setPreferences(parsedPrefs)

      // Parse the markdown roadmap data into our topic structure
      const topics: RoadmapTopic[] = []
      
      // Split the roadmap into weeks
      const weeks = roadmapData.split('# Week')
      weeks.shift() // Remove the first empty element

      // Determine proper section names based on the skill
      const skillName = parsedPrefs.skillName.toLowerCase()
      
      // Default section progression
      let sectionProgression = [
        {
          name: 'Getting Started',
          description: 'Initial concepts and fundamentals',
          threshold: 2 // week threshold
        },
        {
          name: 'Core Concepts',
          description: 'Essential skills and knowledge',
          threshold: 4
        },
        {
          name: 'Practical Applications',
          description: 'Hands-on projects and implementation',
          threshold: 6
        },
        {
          name: 'Advanced Topics',
          description: 'Specialized knowledge and expertise',
          threshold: Infinity
        }
      ]
      
      // Customize sections based on skills
      if (skillName.includes('data') || skillName.includes('analytics')) {
        sectionProgression = [
          { name: 'Data Fundamentals', description: 'Essential data concepts and tools', threshold: 2 },
          { name: 'Data Analysis', description: 'Methods for analyzing and visualizing data', threshold: 4 },
          { name: 'Advanced Analytics', description: 'Statistical methods and machine learning basics', threshold: 6 },
          { name: 'Specialization', description: 'Specialized techniques and real-world applications', threshold: Infinity }
        ]
      } else if (skillName.includes('cloud') || skillName.includes('aws') || skillName.includes('azure')) {
        sectionProgression = [
          { name: 'Cloud Foundations', description: 'Fundamental cloud concepts and services', threshold: 2 },
          { name: 'Core Services', description: 'Essential platform services and deployment', threshold: 4 },
          { name: 'Advanced Architecture', description: 'Scalable and secure cloud solutions', threshold: 6 },
          { name: 'Optimization & DevOps', description: 'Performance, automation, and continuous delivery', threshold: Infinity }
        ]
      } else if (skillName.includes('web') || skillName.includes('frontend') || skillName.includes('react')) {
        sectionProgression = [
          { name: 'Web Fundamentals', description: 'HTML, CSS, and JavaScript basics', threshold: 2 },
          { name: 'Interactive UI', description: 'Building dynamic user interfaces', threshold: 4 },
          { name: 'Advanced Front-end', description: 'State management, routing, and API integration', threshold: 6 },
          { name: 'Production Ready', description: 'Performance, testing, and deployment', threshold: Infinity }
        ]
      }
      
      // Track the current section
      let currentSection = sectionProgression[0]

      weeks.forEach((week, weekIndex) => {
        const lines = week.split('\n')
        const weekNumber = weekIndex + 1
        
        // Extract title and description
        const titleLine = lines[0]
        const title = titleLine.split(':')[1]?.trim() || `Topic ${weekNumber}`
        
        // Find the description (text between title and ### Objectives or ## Resources)
        const descriptionLines = []
        let i = 1
        while (i < lines.length && 
               !lines[i].startsWith('### Objectives:') && 
               !lines[i].startsWith('## Resources') && 
               !lines[i].startsWith('### Resources:')) {
          if (lines[i].trim()) {
            descriptionLines.push(lines[i].trim())
          }
          i++
        }

        // Extract objectives if they exist
        const objectivesLines = []
        if (i < lines.length && (lines[i].startsWith('### Objectives:') || lines[i].startsWith('### Objectives'))) {
          i++; // Skip the "### Objectives:" line
          while (i < lines.length && 
                 !lines[i].startsWith('### Resources:') && 
                 !lines[i].startsWith('## Resources') &&
                 !lines[i].startsWith('### Exercise:') &&
                 !lines[i].startsWith('### Exercises:')) {
            if (lines[i].trim()) {
              // Clean up bullet points but preserve them for display
              objectivesLines.push(lines[i].trim());
            }
            i++
          }
        }

        // Determine section based on week number
        for (const section of sectionProgression) {
          if (weekNumber <= section.threshold) {
            currentSection = section
            break
          }
        }
        
        // Create the topic with properly formatted objectives
        const topic: RoadmapTopic = {
          id: `topic-${weekNumber}`,
          title: title,
          description: descriptionLines.join(' ').trim(),
          duration: '1 week',
          completed: false,
          section: {
            name: currentSection.name,
            description: currentSection.description
          },
          resources: [],
          objectives: objectivesLines.join('\n').trim()
        }
        
        // Extract resources if there's a resources section
        if (i < lines.length && (lines[i].startsWith('### Resources:') || lines[i].startsWith('## Resources'))) {
          i++; // Skip the "### Resources:" line
          
          // Loop through the resources until we hit another section or the end
          while (i < lines.length && 
                 !lines[i].startsWith('##') && 
                 !lines[i].startsWith('### Exercise:') &&
                 !lines[i].startsWith('### Exercises:')) {
            const line = lines[i].trim()
            
            // Check if the line is a resource (starts with - or * and contains tags)
            if ((line.startsWith('-') || line.startsWith('*')) && line.includes('[') && line.includes(']')) {
              const resourceLine = line.substring(line.startsWith('-') ? 1 : 1).trim()
              
              // Extract format tag [VIDEO], [ARTICLE], etc.
              const formatMatch = resourceLine.match(/\[(VIDEO|ARTICLE|BOOK|INTERACTIVE|COURSE)\]/i)
              const format = formatMatch ? formatMatch[1].toLowerCase() : 'other'
              
              // Extract type tag [TUTORIAL], [PROJECT], etc.
              const typeMatch = resourceLine.match(/\[(TUTORIAL|PROJECT|REFERENCE|COURSE)\]/i)
              const type = typeMatch ? typeMatch[1].toLowerCase() : 'other'
              
              // Extract cost tag [FREE] or [PAID]
              const isFree = resourceLine.includes('[FREE]')
              const paidMatch = resourceLine.match(/\[PAID( \$[0-9.]+)?\]/i)
              const price = paidMatch && paidMatch[1] ? paidMatch[1].trim() : undefined
              
              // Extract title, description, and URL
              // Assuming format: [TAGS] "Title" - Description: URL
              let title = ''
              let description = ''
              let url = ''
              
              // Try to extract title between quotes
              const titleMatch = resourceLine.match(/"([^"]+)"/);
              if (titleMatch) {
                title = titleMatch[1].trim()
                
                // Extract the rest after the title
                const afterTitle = resourceLine.split('"' + title + '"')[1]
                
                if (afterTitle) {
                  // Split by URL if present
                  const urlMatch = afterTitle.match(/(https?:\/\/[^\s]+)/)
                  if (urlMatch) {
                    url = urlMatch[1].trim()
                    // Description is what's between title and URL
                    const beforeUrl = afterTitle.split(url)[0]
                    description = beforeUrl.replace(/^[\s:-]+/, '').trim()
                  } else {
                    // No URL found, use everything after title as description
                    description = afterTitle.replace(/^[\s:-]+/, '').trim()
                  }
                }
              } else {
                // No quoted title, try to extract from what's left after tags
                const afterTags = resourceLine.replace(/\[[^\]]+\]/g, '').trim()
                
                // Try to find URL
                const urlMatch = afterTags.match(/(https?:\/\/[^\s]+)/)
                if (urlMatch) {
                  url = urlMatch[1].trim()
                  const beforeUrl = afterTags.split(url)[0].trim()
                  
                  // If there's a dash, assume title - description format
                  const dashIndex = beforeUrl.indexOf(' - ')
                  if (dashIndex > 0) {
                    title = beforeUrl.substring(0, dashIndex).trim()
                    description = beforeUrl.substring(dashIndex + 3).trim()
                  } else {
                    title = beforeUrl
                  }
                } else {
                  // No URL, use entire text as title
                  title = afterTags
                }
              }
              
              // Create resource object and add to topic
              if (title) {
                const resource: Resource = {
                  id: `resource-${weekNumber}-${topic.resources.length + 1}`,
                  title,
                  description,
                  format: format as any,
                  type: type as any,
                  url,
                  isFree,
                  price,
                  topicId: topic.id
                }
                
                topic.resources.push(resource)
              }
            }
            
            i++
          }
        }
        
        // Extract exercises if they exist
        const exercisesLines = []
        if (i < lines.length && (lines[i].startsWith('### Exercise:') || lines[i].startsWith('### Exercises:'))) {
          i++; // Skip the "### Exercise(s):" line
          while (i < lines.length && !lines[i].startsWith('##')) {
            const line = lines[i].trim();
            if (line) {
              // Clean up the line: remove trailing '#' characters and other unnecessary symbols
              let cleanLine = line;
              while (cleanLine.endsWith('#') || cleanLine.endsWith('.') || cleanLine.endsWith(' ')) {
                cleanLine = cleanLine.slice(0, -1).trim();
              }
              if (cleanLine) {
                exercisesLines.push(cleanLine);
              }
            }
            i++
          }
          topic.exercises = exercisesLines.join('\n').trim();
        }
        
        topics.push(topic)
      })

      setRoadmapTopics(topics)
      
      // Set the keepCount from localStorage or default to 0
      if (storedKeepCount !== null) {
        setKeepCount(parseInt(storedKeepCount, 10))
      } else {
        // Initialize it to 0
        setKeepCount(0)
      }
    } catch (error) {
      console.error('Error parsing roadmap data:', error)
      router.push('/create-roadmap')
    }
  }, [router])

  const handleToggleKeep = (topicId: string) => {
    setRoadmapTopics((prevTopics) => {
      // Find if the topic is currently kept
      const topic = prevTopics.find(t => t.id === topicId);
      const isCurrentlyKept = topic?.keep || false;
      
      // Calculate the new keep count
      const newKeepCount = isCurrentlyKept ? keepCount - 1 : keepCount + 1;
      
      // Update the keepCount state
      setKeepCount(newKeepCount);
      
      // Also update localStorage
      localStorage.setItem('roadmapKeepCount', newKeepCount.toString());
      
      // Return the updated topics
      return prevTopics.map((topic) => {
        if (topic.id === topicId) {
          return { ...topic, keep: !topic.keep }
        }
        return topic
      });
    })
  }

  const handleRequestQuiz = (topicId: string, topicName: string) => {
    if (!requestedQuizzes.includes(topicId)) {
      setRequestedQuizzes([...requestedQuizzes, topicId])
    }
  }

  const handleRemoveQuiz = (topicId: string) => {
    setRequestedQuizzes(requestedQuizzes.filter((id) => id !== topicId))
  }

  const handleStartLearning = (topicId: string) => {
    // Implement start learning logic
  }

  const handleRegenerateRoadmap = async (userFeedback?: string) => {
    try {
      if (!preferences) return

      // Identify topics marked as "keep"
      const keptTopics = roadmapTopics
        .filter(topic => topic.keep)
        .map(topic => ({ id: topic.id, title: topic.title }));
      
      // Verify the keep count matches the actual number of kept topics
      if (keptTopics.length !== keepCount) {
        console.warn(`Keep count (${keepCount}) doesn't match actual kept topics (${keptTopics.length}). Adjusting.`);
        setKeepCount(keptTopics.length);
      }

      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: preferences.skillName,
          preferences: {
            budget: preferences.resourcePreference,
            timeline: preferences.timeline,
            skillLevel: preferences.currentLevel,
            learningFormat: preferences.learningFormat,
            resourceType: 'all',
          },
          goalType: preferences.goalType,
          goalDescription: preferences.goalDescription,
          hoursPerWeek: preferences.hoursPerWeek[0],
          feedback: userFeedback || "Please provide alternative topics and resources",
          keptTopics: keptTopics.length > 0 ? keptTopics : undefined,
          existingRoadmap: localStorage.getItem('generatedRoadmap')
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate roadmap')
      }

      const newRoadmapData = await response.text()
      localStorage.setItem('generatedRoadmap', newRoadmapData)
      
      // Store the accurate kept count in localStorage to reset it properly after reload
      localStorage.setItem('roadmapKeepCount', '0')
      
      // Refresh the page to show new roadmap
      window.location.reload()
    } catch (error) {
      console.error('Error regenerating roadmap:', error)
    }
  }

  if (!preferences) {
    return null // or loading state
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

      <div className="container py-6 md:py-8 lg:py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/roadmaps">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Roadmaps
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900">{preferences.skillName} Roadmap</h1>
            </div>
            <p className="mt-1 text-gray-600">Your personalized learning journey for {preferences.skillName}</p>
          </div>
        </div>

        <Tabs defaultValue="flowchart">
          <TabsList className="w-full grid grid-cols-2 rounded-full h-11 p-1 mb-6 bg-blue-50 border border-blue-100">
            <TabsTrigger
              value="flowchart"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              Roadmap View
            </TabsTrigger>
            <TabsTrigger
              value="lesson-plan"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              Lesson Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flowchart" className="mt-0">
            <div className="grid gap-8 md:grid-cols-12">
              <div className="md:col-span-8">
                <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
                  <CardContent className="p-6">
                    <RoadmapFlowChart
                      topics={roadmapTopics}
                      requestedQuizzes={requestedQuizzes}
                      onToggleKeep={handleToggleKeep}
                      onRequestQuiz={handleRequestQuiz}
                      onRemoveQuiz={handleRemoveQuiz}
                      onStartLearning={handleStartLearning}
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="md:col-span-4">
                <RoadmapFeedback
                  roadmapId="generated"
                  roadmapTitle={preferences.skillName}
                  keepCount={keepCount}
                  onRegenerateRoadmap={handleRegenerateRoadmap}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lesson-plan" className="mt-0">
            <LessonPlan topics={roadmapTopics} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 