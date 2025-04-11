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
  console.log(`Validating YouTube video ID: ${videoId}`);
  // First check if it's in our known bad list
  if (knownBadYoutubeIDs.includes(videoId)) {
    console.log(`Video ID ${videoId} found in known bad list.`);
    return { isValid: false, error: 'Known unavailable YouTube video' };
  }
  
  // Check if API key is configured
  if (!process.env.YOUTUBE_API_KEY) {
    console.warn('YOUTUBE_API_KEY is not configured. Cannot perform YouTube API validation.');
    // Return invalid if we cannot check, to avoid showing potentially bad links
    return { isValid: false, error: 'YouTube API validation skipped (no API key)' }; 
  }
  
  try {
    const response = await youtube.videos.list({
      id: [videoId],
      part: ['status', 'snippet'], // Request status and snippet parts
    });

    // Check if video exists
    if (!response.data.items || response.data.items.length === 0) {
      console.log(`YouTube API: Video ID ${videoId} not found.`);
      return { isValid: false, error: 'Video not found' };
    }

    const video = response.data.items[0];
    const status = video.status;
    console.log(`YouTube API Response for ${videoId}:`, JSON.stringify(status));

    // Check upload status - must be processed
    if (status?.uploadStatus !== 'processed') {
         console.log(`YouTube API: Video ID ${videoId} has invalid upload status: ${status?.uploadStatus}`);
         return { isValid: false, error: `Video status is ${status?.uploadStatus}` };
    }
    
    // Check privacy status - must be public
    if (status?.privacyStatus !== 'public') {
      console.log(`YouTube API: Video ID ${videoId} has invalid privacy status: ${status?.privacyStatus}`);
      return { isValid: false, error: `Video is ${status?.privacyStatus}` };
    }
    
    // Optional: Check embeddable status if needed (usually public videos are embeddable)
    // if (!status?.embeddable) {
    //   console.log(`YouTube API: Video ID ${videoId} is not embeddable.`);
    //   return { isValid: false, error: 'Video not embeddable' };
    // }

    console.log(`YouTube API: Video ID ${videoId} validation successful.`);
    return { isValid: true };
    
  } catch (error: any) {
    // Log more detailed API errors if possible
    let errorMessage = 'Failed to validate YouTube video';
    if (error.response && error.response.data && error.response.data.error) {
        const apiError = error.response.data.error;
        errorMessage = `YouTube API Error: ${apiError.code} ${apiError.message}`;
        if (apiError.errors && apiError.errors.length > 0) {
           errorMessage += ` Reason: ${apiError.errors[0].reason}`;
        }
        console.error('Detailed YouTube API Error:', JSON.stringify(apiError));
    } else {
        console.error('Error validating YouTube video:', error.message);
    }
    return { isValid: false, error: errorMessage };
  }
}

// Validate a single URL and return detailed results
async function validateSingleUrl(url: string): Promise<ValidationResponse> {
  const MAX_RETRIES = 2; // Initial attempt + 1 retry
  let attempts = 0;

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
    validationResult.statusCode = 404; // Assume 404 for known bad
    validationResult.error = 'Known broken link';
    validationCache.set(url, { result: validationResult, timestamp: Date.now() });
    return validationResult;
  }

  // Special handling for YouTube URLs
  const isYouTubeUrl = validUrl.includes('youtube.com') || validUrl.includes('youtu.be');
  if (isYouTubeUrl) {
    validationResult.details!.isYouTube = true;
    const videoId = extractYoutubeVideoId(validUrl);
    if (videoId) {
      const youtubeValidation = await validateYoutubeVideo(videoId);
      validationResult.isValid = youtubeValidation.isValid;
      validationResult.details!.isVideoAvailable = youtubeValidation.isValid;
      if (!youtubeValidation.isValid) {
        validationResult.error = youtubeValidation.error || 'YouTube video validation failed';
        validationResult.statusCode = 404; // Assume 404 if validation fails
      } else {
        // Assume 200 if YouTube validation passes, though we don't have the exact code
        validationResult.statusCode = 200;
      }
      validationCache.set(url, { result: validationResult, timestamp: Date.now() });
      return validationResult;
    } else {
      // If we can't extract a video ID from a YouTube URL, mark as invalid
      validationResult.isValid = false;
      validationResult.error = 'Could not extract YouTube video ID';
      validationResult.statusCode = 400; // Bad request essentially
      validationCache.set(url, { result: validationResult, timestamp: Date.now() });
      return validationResult;
    }
  }

  // For all other URLs, make HTTP GET requests with retries
  while (attempts < MAX_RETRIES) {
    attempts++;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15-second timeout per attempt

    try {
      const response = await fetch(validUrl, {
        method: 'GET', // Use GET by default
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SkillCoach/1.0; +https://skillcoach.dev)',
           // Try to prevent getting blocked
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });

      clearTimeout(timeout);

      validationResult.statusCode = response.status;
      validationResult.isValid = response.ok; // Status code 200-299

      const contentType = response.headers.get('content-type');
      if (contentType) {
        validationResult.details!.contentType = contentType;
      }
      if (response.redirected) {
        validationResult.details!.redirectUrl = response.url;
      }
      if (!response.ok) {
         validationResult.error = `HTTP status code ${response.status}`;
      }

      // If successful (even if status code is not ok), break retry loop
      break; 

    } catch (error) {
      clearTimeout(timeout);
      validationResult.isValid = false; // Ensure isValid is false on error
      
      if (error instanceof Error) {
         validationResult.error = `Fetch error (Attempt ${attempts}): ${error.name} - ${error.message}`;
         // If it's the last attempt or not a retryable error, break
         if (attempts >= MAX_RETRIES || (error.name !== 'AbortError' && error.name !== 'FetchError')) { // AbortError for timeout, FetchError for network issues
           break;
         }
         // Wait a bit before retrying for transient issues
         console.log(`Retrying URL: ${validUrl} (Attempt ${attempts}) due to ${error.name}`);
         await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      } else {
         validationResult.error = `Unknown fetch error (Attempt ${attempts})`;
         break; // Don't retry unknown errors
      }
    }
  }

  // Cache the final result after all attempts
  validationCache.set(url, { result: validationResult, timestamp: Date.now() });

  return validationResult;
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