import { NextResponse } from 'next/server';

// Define response interfaces
interface BulkValidationRequest {
  urls: string[];
}

interface ValidationResult {
  url: string;
  isValid: boolean;
  statusCode?: number;
  error?: string;
}

interface BulkValidationResponse {
  results: ValidationResult[];
  validCount: number;
  invalidCount: number;
}

// Cache for validation results to avoid repeat checks
const validationCache = new Map<string, { result: ValidationResult, timestamp: number }>();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json() as BulkValidationRequest;
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    // Limit batch size for performance
    const maxBatchSize = 25;
    const urlsToProcess = urls.slice(0, maxBatchSize);
    
    console.log(`Processing ${urlsToProcess.length} URLs for bulk validation`);
    
    // List of known invalid URLs to immediately reject
    const knownInvalidUrls = [
      'https://www.youtube.com/watch?v=xfqh5MTb0SU',
      'https://www.tutorialspoint.com/sql/sql-dml-statements.htm',
      'https://developer.mozilla.org/en-US/docs/Learn/SQL/Introduction_to_SQL'
    ];

    const results: ValidationResult[] = [];
    const processPromises: Promise<void>[] = [];

    // Process each URL
    for (const url of urlsToProcess) {
      // Skip empty URLs
      if (!url || url.trim() === '') {
        results.push({
          url,
          isValid: false,
          error: 'Empty URL'
        });
        continue;
      }
      
      // Immediately reject known invalid URLs
      if (knownInvalidUrls.includes(url)) {
        results.push({
          url,
          isValid: false,
          statusCode: 404,
          error: 'Known invalid URL'
        });
        continue;
      }

      // Check cache first
      const cachedResult = validationCache.get(url);
      if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_EXPIRY)) {
        results.push(cachedResult.result);
        continue;
      }

      // If not in cache, create a promise to validate the URL
      const processPromise = validateUrl(url).then(result => {
        results.push(result);
        // Cache the result
        validationCache.set(url, {
          result,
          timestamp: Date.now()
        });
      });

      processPromises.push(processPromise);
    }

    // Wait for all validation promises to complete
    await Promise.all(processPromises);

    // Count valid and invalid URLs
    const validCount = results.filter(r => r.isValid).length;
    const invalidCount = results.length - validCount;

    // Return the results
    return NextResponse.json({
      results,
      validCount,
      invalidCount
    } as BulkValidationResponse);
  } catch (error) {
    console.error('Error in bulk URL validation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to validate URLs', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Function to validate a single URL
async function validateUrl(url: string): Promise<ValidationResult> {
  // Basic result structure
  const result: ValidationResult = {
    url,
    isValid: false
  };

  try {
    // Ensure URL has a protocol
    let validUrl = url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    // Try to create a URL object to validate basic format
    try {
      new URL(validUrl);
    } catch (e) {
      result.error = 'Invalid URL format';
      return result;
    }

    // Check for YouTube URLs with specific handling
    if (validUrl.includes('youtube.com/watch') || validUrl.includes('youtu.be/')) {
      // Extract video ID
      let videoId = '';
      
      if (validUrl.includes('youtube.com/watch')) {
        const urlObj = new URL(validUrl);
        videoId = urlObj.searchParams.get('v') || '';
      } else if (validUrl.includes('youtu.be/')) {
        videoId = validUrl.split('youtu.be/')[1]?.split('?')[0] || '';
      }
      
      // Invalid or missing video ID
      if (!videoId || videoId.length < 8) {
        result.error = 'Invalid YouTube video ID';
        return result;
      }
    }

    // Perform an actual HTTP request to validate the URL
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5-second timeout
    
    try {
      // Use HEAD request for efficiency
      const response = await fetch(validUrl, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; URLValidator/1.0)'
        }
      });

      clearTimeout(timeout);
      
      // Record the status code
      result.statusCode = response.status;
      
      // Consider 2XX responses valid
      result.isValid = response.status >= 200 && response.status < 300;
      
      // Handle common errors
      if (!result.isValid) {
        if (response.status === 404) {
          result.error = 'Page not found';
        } else if (response.status === 403) {
          result.error = 'Access forbidden';
        } else if (response.status >= 500) {
          result.error = 'Server error';
        } else {
          result.error = `HTTP error ${response.status}`;
        }
      }
      
      // For 403 responses, try a GET request as some servers block HEAD
      if (response.status === 403) {
        try {
          const getResponse = await fetch(validUrl, {
            method: 'GET',
            redirect: 'follow',
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; URLValidator/1.0)'
            }
          });
          
          // Update result with GET response
          result.statusCode = getResponse.status;
          result.isValid = getResponse.status >= 200 && getResponse.status < 300;
          
          if (!result.isValid) {
            result.error = `HTTP error ${getResponse.status}`;
          }
        } catch (getError) {
          // Keep the original HEAD result if GET fails
        }
      }
    } catch (fetchError) {
      clearTimeout(timeout);
      
      result.error = fetchError instanceof Error ? 
        (fetchError.name === 'AbortError' ? 'Request timeout' : fetchError.message) : 
        'Failed to fetch URL';
    }

    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    return result;
  }
} 