import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Calendar, CheckCircle, Target } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="border-b border-gray-200 py-4">
        <div className="container flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-medium text-gray-900">Skill Coach</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/roadmaps" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              My Roadmaps
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all"
              >
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white transition-all">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
                    Master Any Skill With Personalized Learning Roadmaps
                  </h1>
                  <p className="text-gray-600 text-lg max-w-[600px]">
                    Build customized learning paths based on your goals, preferences, and timeline. Track your progress
                    and achieve mastery faster.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/create-roadmap">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                      Create Your Roadmap <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/explore">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      Explore Roadmaps
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:mr-0 flex items-center justify-center">
                <div className="rounded-2xl border border-gray-200 p-8 shadow-sm bg-white">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Goal-Oriented Learning</h3>
                        <p className="mt-1 text-gray-600">
                          Whether you're preparing for an interview, building a project, or mastering a new skill, we
                          create roadmaps tailored to your specific goals.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Personalized Timeline</h3>
                        <p className="mt-1 text-gray-600">
                          Set your own pace with flexible timelines that adapt to your schedule and learning
                          preferences.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Progress Tracking</h3>
                        <p className="mt-1 text-gray-600">
                          Monitor your advancement with intuitive progress tracking and celebrate your achievements
                          along the way.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2 max-w-3xl">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">How It Works</h2>
                <p className="text-gray-600 text-lg">
                  Create your personalized learning roadmap in just a few simple steps
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 py-8 md:grid-cols-3 md:gap-12">
              <div className="flex flex-col justify-center space-y-4 p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <span className="text-xl font-medium">1</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Define Your Goals</h3>
                <p className="text-gray-600">
                  Tell us what you want to achieve, whether it's acing an interview, building a project, or mastering a
                  new skill.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4 p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <span className="text-xl font-medium">2</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Set Your Preferences</h3>
                <p className="text-gray-600">
                  Customize your learning experience by specifying your budget, timeline, skill level, and preferred
                  learning formats.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4 p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <span className="text-xl font-medium">3</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Follow Your Roadmap</h3>
                <p className="text-gray-600">
                  Get a personalized learning path with curated resources and track your progress as you advance toward
                  your goals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials or Featured Roadmaps could go here */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2 max-w-3xl">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
                  Popular Learning Paths
                </h2>
                <p className="text-gray-600 text-lg">
                  Discover our most popular roadmaps to kickstart your learning journey
                </p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Sample roadmap cards would go here */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Web Development</h3>
                  <p className="text-gray-600 mb-4">Master modern web development from HTML to React and beyond</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">12-week path</span>
                    <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                      View Roadmap
                    </Button>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Data Science</h3>
                  <p className="text-gray-600 mb-4">Learn data analysis, visualization, and machine learning</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">16-week path</span>
                    <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                      View Roadmap
                    </Button>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">UX/UI Design</h3>
                  <p className="text-gray-600 mb-4">Design beautiful, user-friendly interfaces that people love</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">10-week path</span>
                    <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                      View Roadmap
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-medium text-gray-900">Skill Coach</span>
              </div>
              <p className="text-gray-600 text-sm">
                Personalized learning roadmaps to help you master any skill efficiently.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog" className="text-gray-600 hover:text-blue-600 text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-gray-600 hover:text-blue-600 text-sm">
                    Learning Guides
                  </Link>
                </li>
                <li>
                  <Link href="/templates" className="text-gray-600 hover:text-blue-600 text-sm">
                    Roadmap Templates
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-blue-600 text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-blue-600 text-sm">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-600 hover:text-blue-600 text-sm">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-blue-600 text-sm">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-blue-600 text-sm">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-600 hover:text-blue-600 text-sm">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">© 2024 Skill Coach. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-gray-500 hover:text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

