import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { google } from 'googleapis';

// Define response interfaces
interface ValidationResponse {
  url: string;
  isValid: boolean;
  statusCode?: number;
  validatedAt: string;
  error?: string;
  details?: {
    isYouTube?: boolean;
    isVideoAvailable?: boolean;
    contentType?: string;
    redirectUrl?: string;
  };
}

interface BatchValidationRequest {
  urls: string[];
}

interface BatchValidationResponse {
  results: ValidationResponse[];
  validCount: number;
  invalidCount: number;
}

// YouTube API setup
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY, // Need to add this to .env
});

// Cache for validation results - store in memory with timestamp
const validationCache = new Map<string, { result: ValidationResponse, timestamp: number }>();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// List of known invalid URLs to immediately reject
const knownInvalidUrls = [
  'https://www.youtube.com/watch?v=xfqh5MTb0SU',
  'https://www.tutorialspoint.com/sql/sql-dml-statements.htm',
  'https://developer.mozilla.org/en-US/docs/Learn/SQL/Introduction_to_SQL'
];

// Known bad YouTube video IDs
const knownBadYoutubeIDs = ['xfqh5MTb0SU'];

// Helper function to extract YouTube video ID
function extractYoutubeVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

// Helper function to validate a YouTube video using the API
async function validateYoutubeVideo(videoId: string): Promise<{ isValid: boolean, error?: string }> {
  // First check if it's in our known bad list
  if (knownBadYoutubeIDs.includes(videoId)) {
    return { isValid: false, error: 'Known unavailable YouTube video' };
  }
  
  try {
    // If we have YouTube API key, use it for validation
    if (!process.env.YOUTUBE_API_KEY) {
      return { isValid: true }; // Default to valid if we can't check
    }
    
    const response = await youtube.videos.list({
      id: [videoId],
      part: ['status', 'snippet'],
    });

    // Check if video exists and is available
    if (!response.data.items || response.data.items.length === 0) {
      return { isValid: false, error: 'Video not found' };
    }

    const video = response.data.items[0];
    
    // Check if video is public
    if (video.status?.privacyStatus !== 'public') {
      return { isValid: false, error: `Video is ${video.status?.privacyStatus}` };
    }

    return { isValid: true };
  } catch (error) {
    console.error('Error validating YouTube video:', error);
    return { isValid: false, error: 'Failed to validate YouTube video' };
  }
}

// Validate a single URL and return detailed results
async function validateSingleUrl(url: string): Promise<ValidationResponse> {
  try {
    // Check cache first
    const cachedResult = validationCache.get(url);
    if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_EXPIRY)) {
      console.log(`Using cached validation result for ${url}`);
      return cachedResult.result;
    }

    let validUrl = url;
    
    // Make sure URL has a protocol
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    // Create validation response object
    const validationResult: ValidationResponse = {
      url: validUrl,
      isValid: false,
      validatedAt: new Date().toISOString(),
      details: {}
    };

    // Immediately reject known bad URLs
    if (knownInvalidUrls.includes(validUrl)) {
      validationResult.isValid = false;
      validationResult.statusCode = 404;
      validationResult.error = 'Known broken link';
      
      // Cache result
      validationCache.set(url, { 
        result: validationResult, 
        timestamp: Date.now() 
      });
      
      return validationResult;
    }

    // Special handling for YouTube URLs
    const isYouTubeUrl = validUrl.includes('youtube.com') || validUrl.includes('youtu.be');
    if (isYouTubeUrl) {
      validationResult.details!.isYouTube = true;
      
      // Check for specific known broken YouTube videos
      const knownBrokenVideos = ['xfqh5MTb0SU'];
      
      // Extract video ID
      let videoId = '';
      if (validUrl.includes('youtube.com/watch')) {
        const urlObj = new URL(validUrl);
        videoId = urlObj.searchParams.get('v') || '';
      } else if (validUrl.includes('youtu.be/')) {
        videoId = validUrl.split('youtu.be/')[1]?.split('?')[0] || '';
      }
      
      // Check if video ID is in our list of known broken videos
      if (knownBrokenVideos.includes(videoId)) {
        validationResult.isValid = false;
        validationResult.error = 'Known unavailable YouTube video';
        validationResult.details!.isVideoAvailable = false;
        
        // Cache result
        validationCache.set(url, { 
          result: validationResult, 
          timestamp: Date.now() 
        });
        
        return validationResult;
      }
      
      // Extract video ID and validate with YouTube API
      const videoId2 = extractYoutubeVideoId(validUrl);
      if (videoId2) {
        const youtubeValidation = await validateYoutubeVideo(videoId2);
        validationResult.isValid = youtubeValidation.isValid;
        validationResult.details!.isVideoAvailable = youtubeValidation.isValid;
        
        if (!youtubeValidation.isValid) {
          validationResult.error = youtubeValidation.error;
        }
        
        // Cache result
        validationCache.set(url, { 
          result: validationResult, 
          timestamp: Date.now() 
        });
        
        return validationResult;
      }
    }

    // For all other URLs, make an HTTP request to check the status
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10-second timeout
    
    try {
      // Use HEAD request first for efficiency
      const headResponse = await fetch(validUrl, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SkillCoach/1.0; +https://skillcoach.dev)'
        }
      });

      clearTimeout(timeout);
      
      // Store status code
      validationResult.statusCode = headResponse.status;
      
      // Check if URL is valid based on status code
      validationResult.isValid = headResponse.ok;
      
      // Get content type
      const contentType = headResponse.headers.get('content-type');
      if (contentType) {
        validationResult.details!.contentType = contentType;
      }
      
      // Check for redirects
      if (headResponse.redirected) {
        validationResult.details!.redirectUrl = headResponse.url;
      }
      
      // For 403 responses (e.g., sites that block HEAD requests), try a GET request
      if (headResponse.status === 403) {
        const getResponse = await fetch(validUrl, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SkillCoach/1.0; +https://skillcoach.dev)'
          }
        });
        
        validationResult.statusCode = getResponse.status;
        validationResult.isValid = getResponse.ok;
      }
    } catch (error) {
      clearTimeout(timeout);
      
      // Handle fetch errors
      validationResult.isValid = false;
      validationResult.error = error instanceof Error ? error.message : 'Failed to fetch URL';
    }

    // Cache the result
    validationCache.set(url, { 
      result: validationResult, 
      timestamp: Date.now() 
    });

    return validationResult;
  } catch (error) {
    // Handle overall errors
    return {
      url,
      isValid: false,
      validatedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function POST(req: Request) {
  try {
    // Parse request body
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await req.json();
      
      // Check if this is a batch request
      if (body.urls && Array.isArray(body.urls)) {
        const batchRequest = body as BatchValidationRequest;
        
        // Limit batch size for performance
        const maxBatchSize = 25;
        const urlsToProcess = batchRequest.urls.slice(0, maxBatchSize);
        
        console.log(`Processing batch request for ${urlsToProcess.length} URLs`);
        
        // Process URLs in parallel
        const results = await Promise.all(
          urlsToProcess.map(url => validateSingleUrl(url))
        );
        
        // Count valid and invalid URLs
        const validCount = results.filter(r => r.isValid).length;
        
        return NextResponse.json({
          results,
          validCount,
          invalidCount: results.length - validCount
        } as BatchValidationResponse);
      } else {
        // Single URL validation
        const { url } = body;
        
        if (!url) {
          return NextResponse.json(
            { error: 'URL is required' },
            { status: 400 }
          );
        }
        
        const result = await validateSingleUrl(url);
        return NextResponse.json(result);
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid content type, expected application/json' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in validate-url route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to validate URL', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 