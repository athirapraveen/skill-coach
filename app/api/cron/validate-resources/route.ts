import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Run this job once a day to validate all resources that haven't been validated in the last 7 days
export const maxDuration = 300; // 5 minutes max for serverless function

// Function to verify the request is authorized via cron secret
function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return false;
  
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.warn('CRON_SECRET environment variable not set');
    return false;
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: Request) {
  // Check if request is authorized
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Get all resources that need validation (either never validated or validated more than 2 days ago)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const { data: resourcesToValidate, error } = await supabase
      .from('resources')
      .select('id, url, roadmap_id')
      .or(`url_validated_at.is.null,url_validated_at.lt.${twoDaysAgo.toISOString()}`)
      .limit(1000); // Process in chunks
      
    if (error) {
      console.error('Error fetching resources:', error);
      return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
    }
    
    if (!resourcesToValidate || resourcesToValidate.length === 0) {
      return NextResponse.json({ message: 'No resources to validate' });
    }
    
    console.log(`Found ${resourcesToValidate.length} resources to validate`);
    
    // Group resources by roadmap for batch processing
    const resourcesByRoadmap: Record<string, any[]> = {};
    
    resourcesToValidate.forEach(resource => {
      if (!resource.url) return; // Skip resources without URLs
      
      const roadmapId = resource.roadmap_id;
      if (!resourcesByRoadmap[roadmapId]) {
        resourcesByRoadmap[roadmapId] = [];
      }
      
      resourcesByRoadmap[roadmapId].push({
        id: resource.id,
        url: resource.url
      });
    });
    
    // Process each roadmap's resources
    const results = [];
    
    for (const [roadmapId, resources] of Object.entries(resourcesByRoadmap)) {
      try {
        // Call our batch validator for each roadmap
        const response = await fetch(new URL('/api/resource-validator', process.env.NEXT_PUBLIC_APP_URL).toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            roadmapId,
            resources,
            validateAll: false // Only validate the resources we're sending
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          results.push({
            roadmapId,
            success: true,
            message: result.message
          });
        } else {
          results.push({
            roadmapId,
            success: false,
            error: `API returned status ${response.status}`
          });
        }
      } catch (error) {
        results.push({
          roadmapId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Validation job processed ${resourcesToValidate.length} resources across ${Object.keys(resourcesByRoadmap).length} roadmaps`,
      results
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run validation job', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 