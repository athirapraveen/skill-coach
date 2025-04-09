'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { useSupabase } from "@/lib/supabase-provider"

// Define our interfaces
interface Roadmap {
  id: string
  skill: string
  primary_goal: string
  goal_description?: string
  current_skill_level?: string
  time_commitment?: string
  hours_per_week_commitment?: number
  resource_preference?: string
  budget?: string
  preferred_learning_format?: string
  created_at: string
  user_id: string
  status?: 'active' | 'completed' | 'archived'
  progress?: number
}

interface Topic {
  id: string
  roadmap_id: string
  topic_name: string
  completed?: boolean
}

// Main component
export default function RoadmapsPage() {
  const { supabase, session } = useSupabase();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [activeRoadmaps, setActiveRoadmaps] = useState<Roadmap[]>([]);
  const [completedRoadmaps, setCompletedRoadmaps] = useState<Roadmap[]>([]);
  const [archivedRoadmaps, setArchivedRoadmaps] = useState<Roadmap[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    if (!session) {
      // Handle not authenticated case
      setLoading(false);
      return;
    }
    
    fetchRoadmaps();
  }, [session]);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      
      if (!session?.user.id) {
        throw new Error('User not authenticated');
      }
      
      // Fetch all roadmaps for the current user
      const { data: roadmapsData, error: roadmapsError } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (roadmapsError) {
        throw roadmapsError;
      }
      
      if (!roadmapsData || roadmapsData.length === 0) {
        // No roadmaps yet
        setLoading(false);
        return;
      }

      // Get all roadmap IDs
      const roadmapIds = roadmapsData.map(roadmap => roadmap.id);
      
      // Fetch topics for all roadmaps to calculate progress
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .in('roadmap_id', roadmapIds);
      
      if (topicsError) {
        throw topicsError;
      }
      
      setTopics(topicsData || []);
      
      // Calculate progress for each roadmap
      const roadmapsWithProgress = roadmapsData.map(roadmap => {
        const roadmapTopics = topicsData?.filter(topic => topic.roadmap_id === roadmap.id) || [];
        let progress = 0;
        
        if (roadmapTopics.length > 0) {
          const completedTopics = roadmapTopics.filter(topic => topic.completed).length;
          progress = Math.round((completedTopics / roadmapTopics.length) * 100);
        }
        
        // Default to active if no status
        const status = roadmap.status || 'active';
        
        return {
          ...roadmap,
          progress,
          status
        };
      });
      
      // Categorize roadmaps by status
      setActiveRoadmaps(roadmapsWithProgress.filter(r => r.status === 'active'));
      setCompletedRoadmaps(roadmapsWithProgress.filter(r => r.status === 'completed'));
      setArchivedRoadmaps(roadmapsWithProgress.filter(r => r.status === 'archived'));
      
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      toast({
        title: "Error",
        description: "Failed to load your roadmaps. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1 py-8 md:py-12 lg:py-16">
          <div className="container px-4 md:px-6">
            <div className="flex justify-center items-center h-[60vh]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Roadmaps</h2>
                <p className="text-gray-600">Please wait while we load your roadmaps...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Render the main component
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 py-8 md:py-12 lg:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Roadmaps</h1>
            <Link href="/create-roadmap">
              <Button className="rounded-full shadow-sm hover:shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                Create New Roadmap
              </Button>
            </Link>
          </div>
          
          <Tabs defaultValue="active">
            <TabsList className="w-full grid grid-cols-3 rounded-full h-12 p-1 mb-6 bg-blue-50 border border-blue-100">
              <TabsTrigger
                value="active"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                Completed
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                Archived
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-0">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {activeRoadmaps.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-gray-50 rounded-xl">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No active roadmaps</h3>
                    <p className="text-gray-600 mb-4">Create your first roadmap to start learning</p>
                    <Link href="/create-roadmap">
                      <Button className="rounded-full shadow-sm hover:shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                        Create New Roadmap
                      </Button>
                    </Link>
                  </div>
                ) : (
                  activeRoadmaps.map((roadmap) => (
                    <Card key={roadmap.id} className="overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
                      <CardHeader className="p-4 border-b border-gray-100 bg-blue-50">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Created on {formatDate(roadmap.created_at)}
                          </div>
                          <div className="text-xl font-bold text-gray-900">
                            {roadmap.skill}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-600 mb-4">
                          {roadmap.goal_description || roadmap.primary_goal || "Learning path for " + roadmap.skill}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-gray-900 font-medium">{roadmap.progress || 0}%</span>
                          </div>
                          <Progress value={roadmap.progress || 0} className="h-2" />
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 bg-gray-50 border-t border-gray-100">
                        <div className="w-full">
                          <Link href={`/roadmaps/${roadmap.id}`}>
                            <Button variant="default" className="w-full rounded-full shadow-sm hover:shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                              View Roadmap
                            </Button>
                          </Link>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {completedRoadmaps.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-gray-50 rounded-xl">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No completed roadmaps</h3>
                    <p className="text-gray-600">Complete a roadmap to see it here</p>
                  </div>
                ) : (
                  completedRoadmaps.map((roadmap) => (
                    <Card key={roadmap.id} className="overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
                      <CardHeader className="p-4 border-b border-gray-100 bg-green-50">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Created on {formatDate(roadmap.created_at)}
                          </div>
                          <div className="text-xl font-bold text-gray-900">
                            {roadmap.skill}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-600 mb-4">
                          {roadmap.goal_description || roadmap.primary_goal || "Learning path for " + roadmap.skill}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Completed!</span>
                            <span className="text-gray-900 font-medium">100%</span>
                          </div>
                          <Progress value={100} className="h-2" />
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 bg-gray-50 border-t border-gray-100">
                        <div className="w-full">
                          <Link href={`/roadmaps/${roadmap.id}`}>
                            <Button variant="default" className="w-full rounded-full shadow-sm hover:shadow-md bg-green-600 hover:bg-green-700 text-white">
                              View Roadmap
                            </Button>
                          </Link>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="archived" className="mt-0">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {archivedRoadmaps.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-gray-50 rounded-xl">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No archived roadmaps</h3>
                    <p className="text-gray-600">Archive roadmaps that you're no longer working on</p>
                  </div>
                ) : (
                  archivedRoadmaps.map((roadmap) => (
                    <Card key={roadmap.id} className="overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
                      <CardHeader className="p-4 border-b border-gray-100 bg-gray-100">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Created on {formatDate(roadmap.created_at)}
                          </div>
                          <div className="text-xl font-bold text-gray-900">
                            {roadmap.skill}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-600 mb-4">
                          {roadmap.goal_description || roadmap.primary_goal || "Learning path for " + roadmap.skill}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-gray-900 font-medium">{roadmap.progress || 0}%</span>
                          </div>
                          <Progress value={roadmap.progress || 0} className="h-2" />
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 bg-gray-50 border-t border-gray-100">
                        <div className="w-full">
                          <Link href={`/roadmaps/${roadmap.id}`}>
                            <Button variant="outline" className="w-full rounded-full shadow-sm hover:shadow-md">
                              View Roadmap
                            </Button>
                          </Link>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

