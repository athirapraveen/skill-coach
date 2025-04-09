'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2 } from "lucide-react"
import { RoadmapFlowChart } from "@/components/roadmap-flow-chart"
import { LessonPlan } from "@/components/lesson-plan"
import { useToast } from "@/components/ui/use-toast"
import { Header } from "@/components/header"
import { useSupabase } from "@/lib/supabase-provider"
import { RoadmapFeedback } from "@/components/roadmap-feedback"

// Define interfaces for our data structure
interface RoadmapData {
  id: string
  skill: string
  primary_goal: string
  goal_description: string
  current_skill_level: string
  time_commitment: string
  hours_per_week_commitment: number
  resource_preference: string
  budget: string
  preferred_learning_format: string
  data: any
  created_at: string
  roadmap_feedback?: string
  ai_regenerated_content?: string
}

interface Topic {
  id: string
  roadmap_id: string
  topic_name: string
  description?: string
  section_name?: string
  section_description?: string
  duration?: string
  week_number?: number
  objectives?: string
  exercises?: string
  completed?: boolean
  keep?: boolean
  sort_order?: number
  progress?: number
  quiz_requested?: boolean
}

// Database Resource (from Supabase)
interface DbResource {
  id: string
  roadmap_id: string
  topic_id: string
  title: string
  description?: string
  url?: string
  format?: string
  type?: string
  is_free?: boolean
  price?: string
  completed?: boolean
  sort_order?: number
  // URL validation fields
  url_validated?: boolean
  url_validated_at?: string
  url_status_code?: number
  url_error?: string
}

// Interface for our UI components - match the interfaces in roadmap-flow-chart.tsx
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
  completed?: boolean
}

// Add this component for displaying debug information
const DebugPanel = ({ error, onDismiss }: { error: string | null, onDismiss: () => void }) => {
  if (!error) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-red-600">Regeneration Error</h2>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Troubleshooting Steps:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Check the error message above for clues about what went wrong.</li>
                <li>Open your browser console (F12 or right-click → Inspect → Console) to see detailed error logs.</li>
                <li>Try regenerating with different feedback that's more specific.</li>
                <li>If the error persists, try refreshing the page and starting over.</li>
              </ol>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-800">
                <strong>For Developers:</strong> The content was successfully generated but there was an error parsing or saving it to the database. Check the console logs for details.
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              console.log('Opening console logs');
              console.log('%c Check the logs above for detailed error information', 'font-size: 16px; color: red;');
            }}
          >
            View Console Logs
          </Button>
          <Button onClick={onDismiss}>Dismiss</Button>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate a UUID
const generateUUID = () => {
  // This creates a random UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper function to clean up topic titles by removing IDs
const cleanTitle = (title: string) => {
  // Remove any "(ID: xxxx-xxxx...)" patterns from the title
  return title.replace(/\s*\(ID:?\s*[a-f0-9-]+\)\s*/gi, '').trim();
};

// Function to validate URLs in batches to improve performance
async function validateUrlBatch(urls: string[]): Promise<Record<string, boolean>> {
  // Skip validation if there are no URLs
  if (!urls.length) return {};
  
  try {
    // Call our enhanced validation API with batch support
    const response = await fetch('/api/validate-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ urls })
    });
    
    if (!response.ok) {
      console.error('Error validating URLs:', response.statusText);
      // Return all URLs as valid on error to not block the process
      return urls.reduce((acc, url) => ({ ...acc, [url]: true }), {});
    }
    
    const result = await response.json();
    
    // Convert to a map of url -> isValid
    return result.results.reduce((acc: Record<string, boolean>, item: any) => {
      acc[item.url] = item.isValid;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error validating URLs:', error);
    // Return all URLs as valid on error to not block the process
    return urls.reduce((acc, url) => ({ ...acc, [url]: true }), {});
  }
}

// Enhanced version to support batched validation
const validateAndCleanURL = (url: string, validationResults?: Record<string, boolean>): { isValid: boolean, url: string } => {
  try {
    // Ensure URL has a protocol
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    // If we have pre-validated results, use them
    if (validationResults && cleanUrl in validationResults) {
      return { 
        isValid: validationResults[cleanUrl], 
        url: cleanUrl 
      };
    }

    // Create a URL object to validate and parse the URL
    const urlObj = new URL(cleanUrl);
    
    // List of known-invalid or placeholder domains
    const invalidDomains = [
      'example.com',
      'placeholder',
      'link.to',
      'mysite.com',
      'mypage.com',
      'yoursite.com',
      'domain.com'
    ];
    
    // Check against known-invalid domains
    if (invalidDomains.some(domain => urlObj.hostname.includes(domain))) {
      console.log(`Rejecting URL with invalid domain: ${cleanUrl}`);
      return { isValid: false, url: cleanUrl };
    }

    // Special checks for YouTube URLs
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      // List of known-invalid YouTube video IDs or patterns 
      const invalidYoutubeIDs = [
        'xfqh5MTb0SU', // Specifically mentioned by the user
        'dQw4w9WgXcQ', // Example of potentially unavailable video
        'video_id',    // Placeholder
        'watch'        // Invalid/incomplete YouTube URL
      ];

      // Extract the video ID
      let videoId = '';
      if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.includes('/watch')) {
        videoId = urlObj.searchParams.get('v') || '';
      } else if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.substring(1); // Remove the leading '/'
      }

      // Check if the video ID is in our invalid list or is too short
      if (invalidYoutubeIDs.includes(videoId) || videoId.length < 8 || !videoId) {
        console.log(`Rejecting invalid YouTube video ID: ${videoId} from URL ${cleanUrl}`);
        return { isValid: false, url: cleanUrl };
      }
    }

    // Check for specific broken links mentioned by the user
    const knownBrokenLinks = [
      'https://www.tutorialspoint.com/sql/sql-dml-statements.htm',
      'https://developer.mozilla.org/en-US/docs/Learn/SQL/Introduction_to_SQL'
    ];

    if (knownBrokenLinks.includes(cleanUrl)) {
      console.log(`Rejecting known broken link: ${cleanUrl}`);
      return { isValid: false, url: cleanUrl };
    }

    // Detect common patterns that suggest invalid URLs
    const hasInvalidPatterns = 
      urlObj.pathname === '/' || // Just a homepage
      urlObj.pathname.includes('..') || // Strange path pattern
      urlObj.pathname.endsWith('/undefined') || // Generated incorrectly
      cleanUrl.includes('[') || cleanUrl.includes(']') || // Contains markdown brackets
      cleanUrl.includes('example') || // Likely a placeholder
      urlObj.pathname.length < 2 || // Just a domain with no path
      cleanUrl.includes('unavailable') || // Likely unavailable
      cleanUrl.includes('not-found') || // Likely not found
      cleanUrl.includes('removed') || // Likely removed
      cleanUrl.includes('expired'); // Likely expired

    if (hasInvalidPatterns) {
      console.log(`Rejecting URL with invalid patterns: ${cleanUrl}`);
      return { isValid: false, url: cleanUrl };
    }

    // Check for valid TLDs
    const validTLDs = ['.com', '.org', '.net', '.edu', '.gov', '.io', '.dev', '.ai', '.co', '.me', '.tv', '.info', '.app'];
    const hasTLD = validTLDs.some(tld => urlObj.hostname.endsWith(tld)) || urlObj.hostname.includes('.co.') || urlObj.hostname.includes('.ac.');
    
    if (!hasTLD) {
      console.log(`Rejecting URL with invalid TLD: ${cleanUrl}`);
      return { isValid: false, url: cleanUrl };
    }

    return { isValid: true, url: cleanUrl };
  } catch (error) {
    console.log(`Error validating URL ${url}: ${error}`);
    return { isValid: false, url: url };
  }
};

// Function to extract URLs from the roadmap content for batch validation
function extractUrlsFromContent(content: string): string[] {
  const urls: string[] = [];
  // Regular expression to match resource lines
  const resourceLineRegex = /\[(VIDEO|ARTICLE|BOOK|INTERACTIVE|COURSE)\]\[(TUTORIAL|PROJECT|REFERENCE|COURSE)\]\[(FREE|PAID.*?)\]\s*"([^"]+)"\s*-\s*([^:]+):\s*(https?:\/\/\S+)/gi;
  
  let match;
  while ((match = resourceLineRegex.exec(content)) !== null) {
    const url = match[6];
    if (url && url.trim()) {
      urls.push(url.trim());
    }
  }
  
  return urls;
}

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { supabase, session } = useSupabase();
  
  const [loading, setLoading] = useState(true);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [resources, setResources] = useState<DbResource[]>([]);
  const [roadmapTopics, setRoadmapTopics] = useState<RoadmapTopic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [requestedQuizzes, setRequestedQuizzes] = useState<string[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  // Add state for persisted error display
  const [regenerationError, setRegenerationError] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  useEffect(() => {
    if (!session) {
      return;
    }
    
    const roadmapId = params.id as string;
    if (roadmapId) {
      fetchRoadmapData(roadmapId);
    }
  }, [params.id, session]);

  // Handle resource completion
  const handleToggleResourceComplete = async (resourceId: string) => {
    try {
      // Update the UI optimistically
      setRoadmapTopics(prevTopics => {
        return prevTopics.map(topic => {
          // Find the resource within topics
          const updatedResources = topic.resources.map(resource => {
            if (resource.id === resourceId) {
              return { ...resource, completed: !resource.completed };
            }
            return resource;
          });
          
          return {
            ...topic,
            resources: updatedResources
          };
        });
      });
      
      // Find the resource to update in the original data
      let resourceToUpdate = null;
      let completed = false;
      
      for (const topic of roadmapTopics) {
        const resource = topic.resources.find(r => r.id === resourceId);
        if (resource) {
          resourceToUpdate = resource;
          completed = !resource.completed;
          break;
        }
      }
      
      if (!resourceToUpdate) {
        throw new Error("Resource not found");
      }
      
      // Update the resource in the database
      const { error } = await supabase
        .from('resources')
        .update({ completed })
        .eq('id', resourceId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: completed ? "Resource marked as complete" : "Resource marked as incomplete",
        description: "Your progress has been updated",
        variant: "default",
      });
      
    } catch (error) {
      console.error("Error updating resource completion:", error);
      toast({
        title: "Error updating resource",
        description: "Failed to update the resource status. Please try again.",
        variant: "destructive",
      });
      
      // Revert the UI change on error
      setRoadmapTopics(prevTopics => {
        return prevTopics.map(topic => {
          const updatedResources = topic.resources.map(resource => {
            if (resource.id === resourceId) {
              return { ...resource, completed: !resource.completed };
            }
            return resource;
          });
          
          return {
            ...topic,
            resources: updatedResources
          };
        });
      });
    }
  };

  // Add handler for starting learning
  const handleStartLearning = (topicId: string) => {
    // For now just scroll to the topic in the lesson plan
    const tab = document.querySelector('[data-state="inactive"][value="lesson-plan"]');
    if (tab) {
      (tab as HTMLElement).click();
      setTimeout(() => {
        const topicElement = document.getElementById(`topic-${topicId}`);
        if (topicElement) {
          topicElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };
  
  const fetchRoadmapData = async (roadmapId: string) => {
    try {
      setLoading(true);
      
      // Fetch the roadmap data
      const { data: roadmap, error: roadmapError } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('id', roadmapId)
        .single();
      
      if (roadmapError) {
        throw roadmapError;
      }
      
      if (!roadmap) {
        throw new Error('Roadmap not found');
      }
      
      setRoadmapData(roadmap);
      
      // Fetch the topics for this roadmap
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .order('sort_order', { ascending: true });
      
      if (topicsError) {
        throw topicsError;
      }
      
      setTopics(topicsData || []);
      
      // Fetch the resources for this roadmap
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .order('sort_order', { ascending: true });
      
      if (resourcesError) {
        throw resourcesError;
      }
      
      setResources(resourcesData || []);
      
      // Transform the data into the format expected by our components
      transformDataForComponents(roadmap, topicsData || [], resourcesData || []);
      
    } catch (error) {
      console.error('Error fetching roadmap data:', error);
      setError('Failed to load roadmap data');
      toast({
        title: "Error",
        description: "Failed to load roadmap data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const transformDataForComponents = (
    roadmap: RoadmapData,
    topics: Topic[],
    resources: DbResource[]
  ) => {
    // Group resources by topic
    const resourcesByTopic: Record<string, DbResource[]> = {};
    resources.forEach(resource => {
      if (!resourcesByTopic[resource.topic_id]) {
        resourcesByTopic[resource.topic_id] = [];
      }
      resourcesByTopic[resource.topic_id].push(resource);
    });
    
    // Transform topics to the expected format
    const transformedTopics: RoadmapTopic[] = topics.map(topic => {
      const topicResources = resourcesByTopic[topic.id] || [];
      
      return {
        id: topic.id,
        title: topic.topic_name,
        description: topic.description || "",
        duration: topic.duration || "",
        objectives: topic.objectives || "",
        exercises: topic.exercises || "",
        completed: topic.completed || false,
        keep: topic.keep || false,
        section: {
          name: topic.section_name || "General",
          description: topic.section_description || ""
        },
        resources: topicResources.map(resource => ({
          id: resource.id,
          title: resource.title,
          description: resource.description || "",
          url: resource.url || "",
          format: (resource.format || "other") as "video" | "article" | "book" | "interactive" | "course" | "other",
          type: (resource.type || "other") as "tutorial" | "project" | "reference" | "course" | "other",
          isFree: resource.is_free || true,
          price: resource.price || "",
          topicId: resource.topic_id,
          completed: resource.completed || false
        }))
      };
    });
    
    setRoadmapTopics(transformedTopics);
    
    // Get quiz requests if any
    const quizRequests = topics
      .filter(topic => topic.quiz_requested)
      .map(topic => topic.id);
    
    setRequestedQuizzes(quizRequests);
  };

  const handleToggleKeep = async (topicId: string) => {
    // Update UI first (optimistically)
    setRoadmapTopics(prev => 
      prev.map(topic => 
        topic.id === topicId ? { ...topic, keep: !topic.keep } : topic
      )
    );
    
    try {
      // Find the topic
      const topic = roadmapTopics.find(t => t.id === topicId);
      if (!topic) return;
      
      // Get current keep status (before toggling in the UI)
      const keepStatus = !topic.keep;
      
      // Update in the database
      const { error } = await supabase
        .from('topics')
        .update({ keep: keepStatus })
        .eq('id', topicId);
        
      if (error) {
        console.error('Error updating topic keep status:', error);
        toast({
          title: "Error",
          description: "Failed to update topic status. Please try again.",
          variant: "destructive",
        });
        
        // Revert UI change on error
        setRoadmapTopics(prev => 
          prev.map(topic => 
            topic.id === topicId ? { ...topic, keep: !keepStatus } : topic
          )
        );
      }
    } catch (error) {
      console.error('Error in handleToggleKeep:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRequestQuiz = (topicId: string) => {
    if (!requestedQuizzes.includes(topicId)) {
      setRequestedQuizzes(prev => [...prev, topicId]);
    }
  };

  const handleRemoveQuiz = (topicId: string) => {
    setRequestedQuizzes(prev => prev.filter(id => id !== topicId));
  };

  // Add this function for regenerating roadmap with feedback
  const handleRegenerateRoadmap = async () => {
    try {
      // Clear any previous errors
      setRegenerationError(null);
      
      if (!roadmapData || !session) {
        throw new Error('Missing roadmap data or user session');
      }
      
      setLoading(true);
      
      // Get the topics marked as "keep" with their full objects, not just IDs
      const keptTopics = roadmapTopics.filter(topic => topic.keep);
      
      // Get a fresh session token for authorization
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !currentSession?.access_token) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication error. Please try logging in again.');
      }
      
      toast({
        title: "Processing",
        description: "Saving your feedback and keep selections...",
        variant: "default",
      });
      
      // First, reset all keep statuses to false
      const { error: resetError } = await supabase
        .from('topics')
        .update({ keep: false })
        .eq('roadmap_id', roadmapData.id);
        
      if (resetError) {
        console.error('Error resetting keep statuses:', resetError);
        throw new Error('Failed to reset topic keep statuses');
      }
      
      // Then, update the keep status for each kept topic
      for (const topic of roadmapTopics) {
        const { error } = await supabase
          .from('topics')
          .update({ keep: topic.keep })
          .eq('id', topic.id);
          
        if (error) {
          console.error(`Error updating keep status for topic ${topic.id}:`, error);
        }
      }
      
      // Save the feedback to the roadmap - overwrite any existing feedback
      console.log('Updating roadmap feedback:', roadmapData.roadmap_feedback);
      const { error: updateError } = await supabase
        .from('roadmaps')
        .update({ roadmap_feedback: roadmapData.roadmap_feedback })
        .eq('id', roadmapData.id);
        
      if (updateError) {
        console.error('Error saving feedback:', updateError);
        throw new Error('Failed to save feedback to roadmap');
      }
      
      toast({
        title: "Feedback Saved",
        description: "Your feedback has been saved. Regenerating your roadmap...",
        variant: "default",
      });
      
      // Prepare the data for the generate-roadmap endpoint
      const requestData = {
        goal: roadmapData.skill,
        preferences: {
          budget: roadmapData.budget || 'mixed',
          timeline: roadmapData.time_commitment || '3',
          skillLevel: roadmapData.current_skill_level || 'beginner',
          learningFormat: roadmapData.preferred_learning_format || 'both',
          resourceType: roadmapData.resource_preference || 'all'
        },
        goalType: roadmapData.primary_goal,
        goalDescription: roadmapData.goal_description,
        hoursPerWeek: roadmapData.hours_per_week_commitment,
        feedback: roadmapData.roadmap_feedback || '',
        keptTopics: keptTopics.map(topic => ({
          id: topic.id, 
          title: topic.title
        })),
        existingRoadmap: roadmapData.ai_regenerated_content || ''
      };
      
      // Call the existing generate-roadmap endpoint to create a new version
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('Generate roadmap API response status:', response.status);
      
      if (!response.ok) {
        console.error('Error response from generate-roadmap:', response.status, response.statusText);
        throw new Error('Failed to regenerate roadmap');
      }
      
      toast({
        title: "Generating",
        description: "Creating your updated roadmap based on feedback...",
        variant: "default",
      });
      
      // Handle streaming response
      const reader = response.body?.getReader();
      let regeneratedContent = '';
      
      if (!reader) {
        console.error('Failed to get reader from response');
        throw new Error('Failed to read response stream');
      }
      
      // Read the streaming response
      console.log('Starting to read response stream');
      try {
        let chunkCount = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('Stream complete after', chunkCount, 'chunks');
            break;
          }
          
          // Convert the chunk to text and append to our content
          const chunk = new TextDecoder().decode(value);
          chunkCount++;
          
          // Log the chunk size and a sample of the content
          console.log(`Received chunk ${chunkCount}, size: ${chunk.length} bytes`);
          if (chunk.length > 0) {
            console.log('Chunk sample:', chunk.substring(0, Math.min(50, chunk.length)) + '...');
          }
          
          regeneratedContent += chunk;
        }
        
        // Log the total content size
        console.log('Total regenerated content size:', regeneratedContent.length, 'bytes');
        
        // Log the first few lines to verify content format
        const contentPreview = regeneratedContent.split('\n').slice(0, 5).join('\n');
        console.log('Content preview:', contentPreview);
      } catch (streamError) {
        console.error('Error reading stream:', streamError);
        throw new Error('Error while reading regenerated content: ' + (streamError instanceof Error ? streamError.message : 'Unknown error'));
      }

      // Store the full regenerated content for reference and update the prompt used
      console.log('Saving regenerated content and updating the prompt used');

      // Create an update object with only fields we're certain exist in the schema
      // This will also trigger the updated_at column to update automatically
      const updateData = { 
        ai_regenerated_content: regeneratedContent,
        roadmap_feedback: roadmapData.roadmap_feedback,
        // Force updated_at to update by explicitly setting it to the current time
        updated_at: new Date().toISOString()
      };

      // Try to log the actual roadmap data to see what fields exist
      console.log('Existing roadmap data fields:', Object.keys(roadmapData));

      // Attempt the update with the correct fields
      const { error: saveError } = await supabase
        .from('roadmaps')
        .update(updateData)
        .eq('id', roadmapData.id);
        
      if (saveError) {
        console.error('Error saving regenerated content:', saveError);
        console.warn('Failed to save regenerated content, but continuing with topic/resource updates');
        // Don't throw an error here - continue with the process
      }
      
      // Parse the regenerated content to update topics and resources
      const newTopicsAndResources = await parseRegeneratedContent(
        regeneratedContent, 
        roadmapData.id, 
        keptTopics.map(topic => topic.id)
      );
      
      // Verify that we have data to update
      console.log('Verification of parsed content:');
      console.log('- Number of topics:', newTopicsAndResources.topics.length);
      console.log('- Number of resources:', newTopicsAndResources.resources.length);

      if (newTopicsAndResources.topics.length === 0) {
        console.error('No topics were parsed from the regenerated content');
        console.log('Content appears to be invalid or in unexpected format');
        
        setRegenerationError('The roadmap was regenerated but couldn\'t be parsed. The content may be in an unexpected format.');
        
        // Instead of failing completely, just show a warning
        toast({
          title: "Warning",
          description: "The roadmap was regenerated but couldn't be properly parsed. Please try again with different feedback.",
          variant: "destructive",
        });
        
        // Still save the content for reference/debugging
        const { error: saveContentError } = await supabase
          .from('roadmaps')
          .update({ 
            ai_regenerated_content: regeneratedContent,
            roadmap_feedback: roadmapData.roadmap_feedback 
          })
          .eq('id', roadmapData.id);
          
        if (saveContentError) {
          console.error('Error saving content for reference:', saveContentError);
        }
        
        setLoading(false);
        return;
      }

      // Proceed with database update if we have valid topics
      console.log('Proceeding with database update using parsed content');
      
      // Update the database with new content
      const updateSuccessful = await updateRoadmapContent(roadmapData.id, newTopicsAndResources, keptTopics);

      if (updateSuccessful) {
        // Instead of reloading the page, directly update the state with fetched data
        try {
          // Fetch the updated roadmap data
          const { data: updatedRoadmap, error: refetchError } = await supabase
            .from('roadmaps')
            .select('*')
            .eq('id', roadmapData.id)
            .single();
            
          if (refetchError) {
            console.error('Error fetching updated roadmap:', refetchError);
          } else if (updatedRoadmap) {
            setRoadmapData(updatedRoadmap);
          }
          
          // Fetch the updated topics
          const { data: updatedTopics, error: topicsError } = await supabase
            .from('topics')
            .select('*')
            .eq('roadmap_id', roadmapData.id)
            .order('sort_order', { ascending: true });
            
          if (topicsError) {
            console.error('Error fetching updated topics:', topicsError);
          } else if (updatedTopics) {
            setTopics(updatedTopics);
          }
          
          // Fetch the updated resources
          const { data: updatedResources, error: resourcesError } = await supabase
            .from('resources')
            .select('*')
            .eq('roadmap_id', roadmapData.id)
            .order('sort_order', { ascending: true });
            
          if (resourcesError) {
            console.error('Error fetching updated resources:', resourcesError);
          } else if (updatedResources) {
            setResources(updatedResources);
          }
          
          // If we have all the updated data, transform it for the components
          if (updatedRoadmap && updatedTopics && updatedResources) {
            transformDataForComponents(updatedRoadmap, updatedTopics, updatedResources);
          }
          
          toast({
            title: "Success!",
            description: "Your roadmap has been updated based on your feedback.",
            variant: "default",
          });
        } catch (refetchError) {
          console.error('Error refreshing data after update:', refetchError);
          toast({
            title: "Warning",
            description: "Your roadmap was updated but we couldn't refresh the view. Try reloading the page.",
            variant: "default",
          });
        }
      } else {
        setRegenerationError('Failed to update the database with the new roadmap content.');
        
        toast({
          title: "Error",
          description: "There was a problem updating your roadmap in the database. Please try again.",
          variant: "destructive",
        });
        
        // Don't reload the page, so user can see error logs
        setShowDebugInfo(true);
      }
      
    } catch (error) {
      console.error('Error regenerating roadmap:', error);
      
      // Store the error message permanently
      const errorMessage = error instanceof Error ? error.message : "Failed to regenerate roadmap. Please try again.";
      setRegenerationError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Don't reload the page on errors
      setShowDebugInfo(true);
    } finally {
      setLoading(false);
    }
  };

  // Update parseRegeneratedContent to use batch validation
  const parseRegeneratedContent = async (
    content: string,
    roadmapId: string,
    keptTopicIds: string[] = []
  ): Promise<{ topics: Topic[]; resources: DbResource[] }> => {
    try {
      console.log('Starting to parse regenerated content...');
      
      // First, extract all URLs from the content
      const allUrls = extractUrlsFromContent(content);
      console.log(`Found ${allUrls.length} URLs in content to validate`);
      
      // Validate all URLs in batches
      let urlValidationResults: Record<string, boolean> = {};
      if (allUrls.length > 0) {
        try {
          // Split URLs into batches of 25 for efficient API calls
          const batchSize = 25;
          const urlBatches = [];
          for (let i = 0; i < allUrls.length; i += batchSize) {
            urlBatches.push(allUrls.slice(i, i + batchSize));
          }
          
          // Validate each batch and combine results
          console.log(`Validating URLs in ${urlBatches.length} batches...`);
          
          for (const batch of urlBatches) {
            const batchResults = await validateUrlBatch(batch);
            urlValidationResults = { ...urlValidationResults, ...batchResults };
          }
          
          console.log(`Completed URL validation. Valid: ${Object.values(urlValidationResults).filter(v => v).length}, Invalid: ${Object.values(urlValidationResults).filter(v => !v).length}`);
        } catch (error) {
          console.error('Error during batch URL validation:', error);
          // Continue with empty validation results
        }
      }
      
      // Now proceed with parsing the content with pre-validated URLs
      const topics: Topic[] = [];
      const resources: DbResource[] = [];
      let invalidResourceCount = 0;
      
      // Fetch kept topics to maintain their identity
      let keptTopicMap: Record<string, Topic> = {};
      
      try {
        // Only fetch kept topics if there are any
        if (keptTopicIds.length > 0) {
          const { data: keptTopics, error: keptTopicsError } = await supabase
            .from('topics')
            .select('*')
            .in('id', keptTopicIds);
          
          if (keptTopicsError) {
            console.error('Error fetching kept topics:', keptTopicsError);
          } else if (keptTopics) {
            // Create a map for quick lookup
            keptTopicMap = keptTopics.reduce((acc, topic) => {
              acc[topic.id] = topic;
              return acc;
            }, {} as Record<string, Topic>);
            
            console.log(`Loaded ${Object.keys(keptTopicMap).length} kept topics`);
          }
        }
      } catch (error) {
        console.error('Error handling kept topics:', error);
      }
      
      // Define section progression based on number of weeks
      const sectionProgression = ['Getting Started', 'Core Concepts', 'Practical Applications', 'Advanced Topics'];

      // Track weeks to calculate sections
      const weekTexts = content.match(/# Week \d+/g) || [];
      const totalWeeks = weekTexts.length;
      
      // Calculate threshold for section changes
      const sectionThreshold = Math.ceil(totalWeeks / sectionProgression.length);
      
      // Helper function to determine current section based on week number
      const getSectionForWeek = (weekNum: number) => {
        const sectionIndex = Math.min(
          Math.floor((weekNum - 1) / sectionThreshold),
          sectionProgression.length - 1
        );
        return {
          section_name: sectionProgression[sectionIndex],
          section_description: `${sectionProgression[sectionIndex]} phase of your learning journey.`
        };
      };
      
      // Use a set to track processed topic titles to avoid duplicates
      const processedTopicTitles = new Set();
      
      // Split content by headers to get week sections
      const weekSections = content.split(/(?=# Week \d+)/);
      let weekNumber = 0;
      
      // Process introduction section separately if it exists
      const firstSection = weekSections[0];
      if (firstSection && !firstSection.match(/^# Week \d+/)) {
        // Skip intro sections with titles like "Revised Learning Roadmap" etc.
        if (!firstSection.match(/Revised\s*(Learning)?\s*Roadmap/) && 
            !firstSection.match(/^# (Updated|Revised) Roadmap/i)) {
          // It's a valid intro section
          // ...
        }
        
        // Remove the intro section from the array
        weekSections.shift();
      }
      
      // Process each week section
      for (const section of weekSections) {
        weekNumber++;
        
        // Skip empty sections
        if (!section.trim()) continue;
        
        // Extract week title
        const weekTitleMatch = section.match(/# Week (\d+):?\s*(.*?)(?=\n|$)/);
        
        if (!weekTitleMatch) {
          console.log(`Skipping section without proper week title: ${section.substring(0, 50)}...`);
          continue;
        }
        
        const [, weekNum, rawTitle] = weekTitleMatch;
        let title = (rawTitle || '').trim();
        
        // Clean title
        title = cleanTitle(title);
        
        // If we get an empty title after cleaning, use a generic one
        if (!title) {
          title = `Module ${weekNum}`;
        }
        
        // Skip duplicate topics
        if (processedTopicTitles.has(title.toLowerCase())) {
          console.log(`Skipping duplicate topic: ${title}`);
          continue;
        }
        
        processedTopicTitles.add(title.toLowerCase());
        
        // Extract description
        const descriptionText = section.split('\n\n')[1] || '';
        const description = cleanTitle(descriptionText.trim());
        
        // Get current section based on week number
        const currentSection = getSectionForWeek(parseInt(weekNum));
        
        // Check if this topic should be kept (maintained identity)
        const matchingKeptTopicId = Object.keys(keptTopicMap).find(id => 
          keptTopicMap[id].topic_name.toLowerCase() === title.toLowerCase()
        );
        
        // Create a topic ID - either use existing ID or generate a new one
        const topicId = matchingKeptTopicId || generateUUID();
        
        // Extract objectives
        const objectivesMatch = section.match(/###\s*Objectives:?([\s\S]*?)(?=###|$)/i);
        const objectivesContent = objectivesMatch ? objectivesMatch[1].trim() : '';
        
        // Extract exercises
        const exercisesMatch = section.match(/###\s*Exercise:?([\s\S]*?)(?=###|$)/i);
        const exercisesContent = exercisesMatch ? exercisesMatch[1].trim() : '';
        
        // Add the topic to our list
        topics.push({
          id: topicId,
          roadmap_id: roadmapId,
          topic_name: title,
          description,
          objectives: objectivesContent,
          exercises: exercisesContent,
          duration: `Week ${weekNum}`,
          completed: matchingKeptTopicId ? keptTopicMap[matchingKeptTopicId].completed : false,
          sort_order: parseInt(weekNum) || weekNumber,
          section_name: currentSection.section_name,
          section_description: currentSection.section_description,
          week_number: parseInt(weekNum) || weekNumber,
          keep: !!matchingKeptTopicId
        });
        
        // Extract resources
        const resourcesMatch = section.match(/###\s*Resources:?([\s\S]*?)(?=###|$)/i);
        const resourcesContent = resourcesMatch ? resourcesMatch[1].trim() : '';
        
        // Parse resources using regex
        const resourceRegex = /- \[(VIDEO|ARTICLE|BOOK|INTERACTIVE|COURSE)\]\[(TUTORIAL|PROJECT|REFERENCE|COURSE)\]\[(FREE|PAID.*?)\]\s*"([^"]+)"\s*-\s*([^:]+):\s*(https?:\/\/\S+)/gi;
        let resourceMatch;
        const topicResources: DbResource[] = [];
        
        while ((resourceMatch = resourceRegex.exec(resourcesContent)) !== null) {
          try {
            const format = resourceMatch[1].toLowerCase();
            const type = resourceMatch[2].toLowerCase();
            const cost = resourceMatch[3];
            const title = resourceMatch[4];
            const description = resourceMatch[5].trim();
            const rawUrl = resourceMatch[6];
            
            // Validate and clean the URL - use pre-validated results
            const { isValid, url } = validateAndCleanURL(rawUrl, urlValidationResults);
            
            // Only add the resource if the URL is valid
            if (isValid) {
              // Generate a proper UUID for the resource
              const resourceId = generateUUID();
              
              topicResources.push({
                id: resourceId,
                roadmap_id: roadmapId,
                topic_id: topicId || '',
                title,
                description,
                url,
                format,
                type,
                is_free: cost.toLowerCase() === 'free',
                price: cost.startsWith('PAID') ? cost.replace('PAID', '').trim() : '',
                completed: false,
                sort_order: weekNumber
              });
            } else {
              // Count invalid resources
              invalidResourceCount++;
              console.log(`Skipping invalid resource URL: ${rawUrl}`);
            }
          } catch (e) {
            console.error(`Error parsing resource in section ${weekNumber}:`, e);
          }
        }
        
        // Check if we have any valid resources for this topic
        if (topicResources.length === 0) {
          console.log(`No valid resources found for topic: ${title}. Adding fallback resources.`);
          
          // Create fallback resources based on the topic title and description
          const fallbackResources = generateFallbackResources(title, description);
          
          // Add these resources to our topic
          topicResources.push(...fallbackResources.map(resource => ({
            id: generateUUID(),
            roadmap_id: roadmapId,
            topic_id: topicId || '',
            title: resource.title,
            description: resource.description,
            url: resource.url,
            format: resource.format,
            type: resource.type,
            is_free: resource.isFree,
            price: resource.isFree ? '' : 'Varies',
            completed: false,
            sort_order: weekNumber,
            // Mark as fallback resource
            url_validated: true,
            url_validated_at: new Date().toISOString()
          })));
          
          console.log(`Added ${topicResources.length} fallback resources for topic: ${title}`);
        }
        
        // Add resources to our list
        resources.push(...topicResources);
      }
      
      console.log(`Parsing complete: ${topics.length} sections processed with ${resources.length} resources (${invalidResourceCount} invalid resources skipped)`);
      
      return { topics, resources };
    } catch (error) {
      console.error('Error parsing regenerated content:', error);
      throw error;
    }
  };

  // Helper function to generate fallback resources when no valid resources are available
  function generateFallbackResources(topicTitle: string, topicDescription: string): {
    title: string;
    description: string;
    url: string;
    format: string;
    type: string;
    isFree: boolean;
  }[] {
    const fallbackResources = [];
    
    // Create a search-friendly query string from topic title and description
    const searchQuery = encodeURIComponent(`${topicTitle} tutorial`);
    
    // First resource - YouTube video search
    fallbackResources.push({
      title: `YouTube Tutorials on ${topicTitle}`,
      description: `Curated videos about ${topicTitle}`,
      url: `https://www.youtube.com/results?search_query=${searchQuery}`,
      format: 'video',
      type: 'tutorial',
      isFree: true
    });
    
    // Second resource - MDN or documentation
    fallbackResources.push({
      title: `Documentation for ${topicTitle}`,
      description: `Official or community documentation resources`,
      url: `https://developer.mozilla.org/en-US/search?q=${searchQuery}`,
      format: 'article',
      type: 'reference',
      isFree: true
    });
    
    // Third resource - GitHub
    fallbackResources.push({
      title: `${topicTitle} Projects on GitHub`,
      description: `Open source projects and examples`,
      url: `https://github.com/search?q=${searchQuery}&type=repositories`,
      format: 'interactive',
      type: 'project',
      isFree: true
    });
    
    // Fourth resource - Coursera or edX
    fallbackResources.push({
      title: `Online Courses on ${topicTitle}`,
      description: `Learn ${topicTitle} through structured courses`,
      url: `https://www.coursera.org/search?query=${searchQuery}`,
      format: 'course',
      type: 'course',
      isFree: false
    });
    
    return fallbackResources;
  }

  // Update the database with new topics and resources
  const updateRoadmapContent = async (
    roadmapId: string, 
    parsedContent: { topics: Topic[], resources: DbResource[] },
    keptTopics: RoadmapTopic[]
  ) => {
    const { topics, resources } = parsedContent;
    
    try {
      console.log('Starting database update for roadmap:', roadmapId);
      console.log('Number of new topics:', topics.length);
      console.log('Number of kept topics:', keptTopics.length);
      
      // Create map of kept topic IDs
      const keptTopicIds = new Set(keptTopics.map(t => t.id));
      console.log('Kept topic IDs:', Array.from(keptTopicIds));
      
      // STEP 1: Delete ALL existing topics EXCEPT those marked as keep=true
      console.log('Deleting all existing topics except kept topics');
      const { error: deleteNonKeptError } = await supabase
        .from('topics')
        .delete()
        .eq('roadmap_id', roadmapId)
        .eq('keep', false);
        
      if (deleteNonKeptError) {
        console.error('Error deleting non-kept topics:', deleteNonKeptError);
        console.warn('Continuing with update despite deletion issues');
      }
      
      // STEP 2: Delete all resources that belong to deleted topics
      console.log('Deleting resources for non-kept topics');
      
      // First get all kept topic IDs from the database to be sure
      const { data: keptTopicsFromDb } = await supabase
        .from('topics')
        .select('id')
        .eq('roadmap_id', roadmapId)
        .eq('keep', true);
        
      const keptTopicIdsFromDb = new Set((keptTopicsFromDb || []).map(t => t.id));
      
      // Get all resources for this roadmap
      const { data: allResources } = await supabase
        .from('resources')
        .select('id, topic_id')
        .eq('roadmap_id', roadmapId);
        
      // Delete resources for non-kept topics
      for (const resource of (allResources || [])) {
        if (!keptTopicIdsFromDb.has(resource.topic_id)) {
          await supabase
            .from('resources')
            .delete()
            .eq('id', resource.id);
        }
      }
      
      // STEP 3: Insert new topics, skipping any that have the same title as kept topics
      console.log('Inserting new topics:', topics.length);
      
      // Get existing kept topics with their titles for comparison
      const { data: existingKeptTopics } = await supabase
        .from('topics')
        .select('id, topic_name')
        .eq('roadmap_id', roadmapId)
        .eq('keep', true);
        
      // Create a set of kept topic names (lowercase for case-insensitive comparison)
      const keptTopicNames = new Set((existingKeptTopics || []).map(t => 
        t.topic_name.toLowerCase()
      ));
      
      // Filter out topics that have the same title as kept topics
      const topicsToInsert = topics.filter(topic => {
        const normalizedName = topic.topic_name.toLowerCase();
        return !keptTopicNames.has(normalizedName);
      });
      
      console.log(`Filtered out ${topics.length - topicsToInsert.length} duplicate topics`);
      console.log('Inserting', topicsToInsert.length, 'new topics');
      
      let hasInsertErrors = false;
      
      if (topicsToInsert.length > 0) {
        try {
          // Handle in smaller batches of 10 to avoid exceeding payload limits
          const batchSize = 10;
          for (let i = 0; i < topicsToInsert.length; i += batchSize) {
            const batch = topicsToInsert.slice(i, i + batchSize);
            console.log(`Inserting topics batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(topicsToInsert.length / batchSize)}, size: ${batch.length}`);
            
            try {
              const { error: insertTopicsError } = await supabase
                .from('topics')
                .insert(batch);
              
              if (insertTopicsError) {
                console.error('Error inserting topics batch:', insertTopicsError);
                console.log('Problematic batch:', JSON.stringify(batch.map(t => t.id), null, 2));
                hasInsertErrors = true;
              }
            } catch (batchError) {
              console.error('Exception during batch insert:', batchError);
              hasInsertErrors = true;
            }
          }
          
          if (hasInsertErrors) {
            console.warn('Some topic batches failed to insert, but continuing with resources');
          }
        } catch (topicsError) {
          console.error('Error in topics insertion process:', topicsError);
          console.warn('Continuing with resources despite topic insertion issues');
        }
      }
      
      // STEP 4: Insert new resources, but only for non-kept topics
      // Filter resources to only include those for newly created topics
      const newTopicIds = new Set(topicsToInsert.map(t => t.id));
      const resourcesToInsert = resources.filter(resource => 
        newTopicIds.has(resource.topic_id)
      );
      
      console.log('Inserting new resources:', resourcesToInsert.length);
      let resourceInsertErrors = false;
      
      if (resourcesToInsert.length > 0) {
        try {
          // First validate all resource URLs in a batch operation
          console.log('Validating resource URLs before insertion...');
          
          // Prepare resources for validation
          const resourcesToValidate = resourcesToInsert.map(r => ({
            id: r.id,
            url: r.url || ''
          })).filter(r => r.url); // Skip resources without URLs
          
          // Only attempt validation if we have valid URLs to check
          if (resourcesToValidate.length > 0) {
            try {
              // Call the validator API
              const validationResponse = await fetch('/api/validate-url', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                  resources: resourcesToValidate
                })
              });
              
              if (validationResponse.ok) {
                const validationResults = await validationResponse.json();
                console.log(`Validated ${validationResults.results?.length || 0} resource URLs`);
                
                // Create a map of validation results by resource ID
                const validationMap = new Map();
                
                if (validationResults.results && Array.isArray(validationResults.results)) {
                  validationResults.results.forEach((result: { 
                    resourceId: string; 
                    isValid: boolean; 
                    validatedAt: string;
                    statusCode?: number;
                    error?: string;
                  }) => {
                    validationMap.set(result.resourceId, result);
                  });
                  
                  // Update resources with validation results
                  resourcesToInsert.forEach(resource => {
                    const validation = validationMap.get(resource.id);
                    if (validation) {
                      resource.url_validated = validation.isValid;
                      resource.url_validated_at = validation.validatedAt;
                      resource.url_status_code = validation.statusCode;
                      resource.url_error = validation.error;
                    }
                  });
                }
              } else {
                console.warn('URL validation API returned error:', validationResponse.status);
              }
            } catch (validationError) {
              console.error('Error validating URLs:', validationError);
              // Continue with insertion even if validation fails
            }
          }
          
          // Handle in smaller batches of 10 to avoid exceeding payload limits
          const batchSize = 10;
          for (let i = 0; i < resourcesToInsert.length; i += batchSize) {
            const batch = resourcesToInsert.slice(i, i + batchSize);
            console.log(`Inserting resources batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(resourcesToInsert.length / batchSize)}, size: ${batch.length}`);
            
            try {
              const { error: insertResourcesError } = await supabase
                .from('resources')
                .insert(batch);
              
              if (insertResourcesError) {
                console.error('Error inserting resources batch:', insertResourcesError);
                console.log('Problematic batch:', JSON.stringify(batch.map(r => r.id), null, 2));
                resourceInsertErrors = true;
              }
            } catch (batchError) {
              console.error('Exception during resource batch insert:', batchError);
              resourceInsertErrors = true;
            }
          }
          
          if (resourceInsertErrors) {
            console.warn('Some resource batches failed to insert');
          }
          
          // Validate all resources for this roadmap in the background
          try {
            console.log('Triggering background validation for all roadmap resources...');
            fetch('/api/resource-validator', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                roadmapId,
                validateAll: true
              }),
              // Use no-cors to avoid waiting for the response
              mode: 'no-cors'
            }).catch(err => {
              // Silence errors from the background process
              console.log('Background validation initiated');
            });
          } catch (backgroundError) {
            // Don't fail if background validation fails
            console.log('Failed to initiate background validation, continuing anyway');
          }
        } catch (resourcesError) {
          console.error('Error in resources insertion process:', resourcesError);
        }
      }
      
      if (hasInsertErrors || resourceInsertErrors) {
        console.warn('Some data could not be inserted, the roadmap might be incomplete');
        return false;
      }
      
      console.log('Database update completed successfully');
      return true;
    } catch (error) {
      console.error('Error in updateRoadmapContent:', error);
      return false;
    }
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Roadmap</h2>
                <p className="text-gray-600">Please wait while we load your roadmap data...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !roadmapData) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1 py-8 md:py-12 lg:py-16">
          <div className="container px-4 md:px-6">
            <div className="flex justify-center items-center h-[60vh]">
              <div className="text-center">
                <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4 inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h2 className="text-xl font-semibold mb-2">Failed to Load Roadmap</h2>
                  <p>{error || "The roadmap could not be found."}</p>
                </div>
                <Link href="/roadmaps">
                  <Button className="rounded-full shadow-sm hover:shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Roadmaps
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 py-8 md:py-12 lg:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-center mb-8">
            <Link href="/roadmaps">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Roadmaps
              </Button>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {roadmapData.skill || 'Untitled Roadmap'}
              </h1>
              <p className="mt-2 text-gray-600">
                {roadmapData.goal_description || 'Review your personalized learning path.'}
              </p>
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
                  <div className="md:col-span-12">
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
                </div>
              </TabsContent>

              <TabsContent value="lesson-plan" className="mt-0">
                <LessonPlan 
                  topics={roadmapTopics} 
                  onToggleResourceComplete={handleToggleResourceComplete}
                  activeTopicId={activeTopicId}
                />
              </TabsContent>
            </Tabs>
            
            {/* Roadmap Feedback Section */}
            <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <RoadmapFeedback
                  roadmapId={roadmapData.id}
                  roadmapTitle={roadmapData.skill}
                  keepCount={roadmapTopics.filter(topic => topic.keep).length}
                  onRegenerateRoadmap={handleRegenerateRoadmap}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Display debug panel when there's a regeneration error */}
      <DebugPanel 
        error={regenerationError}
        onDismiss={() => setRegenerationError(null)}
      />
    </div>
  );
} 