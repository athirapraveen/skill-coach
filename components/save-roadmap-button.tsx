'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useSupabase } from '@/lib/supabase-provider'

// Define types that match the database schema
interface RoadmapData {
  skillName: string;
  goalType: string;
  goalDescription: string;
  currentLevel: string;
  timeline: string;
  hoursPerWeek: number[];
  resourcePreference: string;
  budget: string;
  learningFormat: string;
  [key: string]: any;
}

interface Topic {
  topic_id?: string;
  topic_name: string;
  description?: string;
  section_name?: string;
  section_description?: string;
  duration?: string;
  week_number?: number;
  objectives?: string;
  exercises?: string;
  keep?: boolean;
  [key: string]: any;
}

interface Resource {
  id?: string;
  topic_id: string;
  title: string;
  description?: string;
  url?: string;
  format?: string;
  type?: string;
  is_free?: boolean;
  price?: string;
  [key: string]: any;
}

interface SaveRoadmapButtonProps {
  roadmapData: RoadmapData;
  topics: Topic[];
  resources: Resource[];
  roadmapFeedback?: string;
  onSaveSuccess?: (roadmapId: string) => void;
}

export function SaveRoadmapButton({
  roadmapData,
  topics,
  resources,
  roadmapFeedback = '',
  onSaveSuccess
}: SaveRoadmapButtonProps) {
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { supabase, session, isLoading } = useSupabase()

  useEffect(() => {
    // Debug log to check session state
    console.log('Current session state:', session?.user?.email)
  }, [session])

  // Generate a UUID to use in our client
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, 
            v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (isLoading) {
        throw new Error('Please wait while we check your authentication status')
      }

      if (!session) {
        throw new Error('Please log in to save your roadmap')
      }

      // Validate data before sending
      if (!roadmapData || !topics || !resources) {
        throw new Error('Missing required data for saving roadmap')
      }

      console.log('Saving with session:', session.user.email) // Debug log
      console.log('Data being sent:', {
        roadmapData: !!roadmapData,
        topicsCount: topics.length,
        resourcesCount: resources.length,
        hasFeedback: !!roadmapFeedback
      })

      // Get a fresh session token
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !currentSession?.access_token) {
        console.error('Session error:', sessionError)
        throw new Error('Authentication error. Please try logging in again.')
      }

      // Create a mapping from client-side topic IDs to database UUIDs
      const topicIdMapping: Record<string, string> = {};
      
      // Transform topics data to match database schema
      const transformedTopics = topics.map((topic, index) => {
        // Generate a proper UUID for each topic
        const dbTopicId = generateUUID();
        
        // Store the mapping from client ID to database ID
        const topicKey = topic.topic_id || `topic-${index+1}`;
        topicIdMapping[topicKey] = dbTopicId;
        
        return {
          id: dbTopicId,
          roadmap_id: null, // Will be set by the API after roadmap is created
          topic_name: topic.topic_name || topic.title || `Topic ${index+1}`,
          description: topic.description || null,
          section_name: topic.section_name || null,
          section_description: topic.section_description || null,
          duration: topic.duration || null,
          week_number: topic.week_number || null,
          objectives: topic.objectives || null,
          exercises: topic.exercises || null,
          keep: topic.keep || false,
          sort_order: index
        };
      });
      
      // Transform resources data to match database schema
      const transformedResources = resources.map((resource, index) => {
        // Get the mapped database UUID for this topic
        const originalTopicId = resource.topic_id as string;
        const dbTopicId = topicIdMapping[originalTopicId];
        
        if (!dbTopicId) {
          console.warn(`No mapped ID found for topic ${originalTopicId}`);
        }
        
        return {
          id: generateUUID(),
          roadmap_id: null, // Will be set by the API after roadmap is created
          topic_id: dbTopicId,
          title: resource.title,
          description: resource.description || null,
          url: resource.url || null,
          format: resource.format || null,
          type: resource.type || null,
          is_free: resource.is_free !== undefined ? resource.is_free : true,
          price: resource.price || null,
          completed: false,
          sort_order: index
        };
      });

      // Send data to the API
      const response = await fetch('/api/save-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`
        },
        body: JSON.stringify({
          roadmapData,
          topics: transformedTopics,
          resources: transformedResources,
          roadmapFeedback
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Save response error:', data) // Debug log
        throw new Error(data.error || 'Failed to save roadmap')
      }

      // Show success toast right away
      toast({
        title: "Roadmap Saved!",
        description: "Your roadmap has been saved successfully. You can access it from your dashboard.",
        duration: 8000, // Show for 8 seconds
        variant: "default",
      })
      
      console.log("Toast notification should be displayed now")

      // Call the success callback if provided
      if (onSaveSuccess) {
        console.log("Calling onSaveSuccess with roadmapId:", data.roadmapId);
        onSaveSuccess(data.roadmapId);
      }
      
    } catch (error) {
      console.error('Error saving roadmap:', error)
      
      // Display a more detailed error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to save roadmap'
        
      // Make sure the error toast is displayed
      toast({
        title: "Error Saving Roadmap",
        description: errorMessage,
        variant: "destructive",
        duration: 8000, // Show for 8 seconds
      })
      
      console.log("Error toast notification should be displayed now")
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <Button disabled className="bg-blue-600 hover:bg-blue-700 text-white">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking auth...
      </Button>
    )
  }

  return (
    <Button
      onClick={handleSave}
      disabled={isSaving || !session}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      {isSaving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          {session ? 'Save Roadmap' : 'Please log in to save'}
        </>
      )}
    </Button>
  )
} 