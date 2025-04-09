import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Database Types
interface RoadmapData {
  id?: string;
  user_id: string;
  data: any;
  skill: string;
  primary_goal: string;
  goal_description: string;
  current_skill_level: string;
  time_commitment: string;
  hours_per_week_commitment: number;
  resource_preference: string;
  budget: string;
  preferred_learning_format: string;
  roadmap_feedback?: string;
  is_public?: boolean;
}

interface Topic {
  id: string;
  roadmap_id: string;
  topic_name: string;
  description?: string;
  section_name?: string;
  section_description?: string;
  duration?: string;
  week_number?: number;
  objectives?: string;
  exercises?: string;
  keep?: boolean;
  sort_order?: number;
}

interface Resource {
  id: string;
  roadmap_id: string;
  topic_id: string;
  title: string;
  description?: string;
  url?: string;
  format?: string;
  type?: string;
  is_free?: boolean;
  price?: string;
  completed?: boolean;
  sort_order?: number;
}

export async function POST(request: Request) {
  try {
    // Get the authorization header and extract the token
    const authHeader = request.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader) // Debug log

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header') // Debug log
      return NextResponse.json({ error: 'Missing or invalid authorization token' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore
    })

    // Set the auth token for this request
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError) {
      console.error('Auth error:', authError) // Debug log
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
    
    if (!user) {
      console.error('No user found with token') // Debug log
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    console.log('Authenticated user:', user.email) // Debug log

    const {
      roadmapData,
      topics,
      resources,
      roadmapFeedback
    } = await request.json()

    console.log('Received data:', {
      roadmapData: !!roadmapData,
      topicsCount: topics?.length,
      resourcesCount: resources?.length,
      hasFeedback: !!roadmapFeedback
    })

    // Validate required data
    if (!roadmapData || !topics || !resources) {
      console.error('Missing required data:', { 
        hasRoadmapData: !!roadmapData, 
        hasTopics: !!topics, 
        hasResources: !!resources 
      })
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      )
    }

    // Prepare roadmap data matching the database schema
    const roadmapInsertData: RoadmapData = {
      user_id: user.id,
      data: roadmapData,
      skill: roadmapData.skillName,
      primary_goal: roadmapData.goalType,
      goal_description: roadmapData.goalDescription,
      current_skill_level: roadmapData.currentLevel,
      time_commitment: roadmapData.timeline,
      hours_per_week_commitment: typeof roadmapData.hoursPerWeek === 'object' 
        ? roadmapData.hoursPerWeek[0] 
        : roadmapData.hoursPerWeek,
      resource_preference: roadmapData.resourcePreference,
      budget: roadmapData.budget,
      preferred_learning_format: roadmapData.learningFormat,
      roadmap_feedback: roadmapFeedback,
      is_public: false
    }

    console.log('Inserting roadmap with data:', {
      user_id: user.id,
      skill: roadmapData.skillName,
      primary_goal: roadmapData.goalType
    })

    // Insert the roadmap
    const { data: roadmap, error: roadmapError } = await supabase
      .from('roadmaps')
      .insert(roadmapInsertData)
      .select()
      .single()

    if (roadmapError) {
      console.error('Error saving roadmap:', roadmapError) // Debug log
      console.error('Roadmap error details:', {
        code: roadmapError.code,
        message: roadmapError.message,
        details: roadmapError.details,
        hint: roadmapError.hint
      })
      return NextResponse.json(
        { error: 'Failed to save roadmap data', details: roadmapError.message },
        { status: 500 }
      )
    }

    console.log('Roadmap saved with ID:', roadmap.id) // Debug log

    // Set the roadmap_id on all topics
    const topicsWithRoadmapId: Topic[] = topics.map((topic: Topic) => ({
      ...topic,
      roadmap_id: roadmap.id
    }))

    console.log('Inserting topics:', topicsWithRoadmapId.length)
    console.log('First topic example:', topicsWithRoadmapId[0] || 'No topics')

    // Insert all topics
    const { error: topicsError } = await supabase
      .from('topics')
      .insert(topicsWithRoadmapId)

    if (topicsError) {
      console.error('Error saving topics:', topicsError) // Debug log
      console.error('Topics error details:', {
        code: topicsError.code,
        message: topicsError.message,
        details: topicsError.details,
        hint: topicsError.hint
      })
      return NextResponse.json(
        { error: 'Failed to save topics', details: topicsError.message },
        { status: 500 }
      )
    }

    // Set the roadmap_id on all resources
    const resourcesWithRoadmapId: Resource[] = resources.map((resource: Resource) => ({
      ...resource,
      roadmap_id: roadmap.id
    }))

    console.log('Inserting resources:', resourcesWithRoadmapId.length)
    console.log('First resource example:', resourcesWithRoadmapId[0] || 'No resources')

    // Insert all resources
    const { error: resourcesError } = await supabase
      .from('resources')
      .insert(resourcesWithRoadmapId)

    if (resourcesError) {
      console.error('Error saving resources:', resourcesError) // Debug log
      console.error('Resources error details:', {
        code: resourcesError.code,
        message: resourcesError.message,
        details: resourcesError.details,
        hint: resourcesError.hint
      })
      return NextResponse.json(
        { error: 'Failed to save resources', details: resourcesError.message },
        { status: 500 }
      )
    }

    console.log('Save operation completed successfully') // Debug log
    return NextResponse.json({ success: true, roadmapId: roadmap.id })
  } catch (error) {
    console.error('Error in save-roadmap route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 