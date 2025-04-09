# Resource URL Validation Service

This document explains the Resource URL Validation Service implemented to ensure that all resources in the SkillCoach learning roadmaps are valid and accessible.

## Problem

Learning roadmaps often include links to external resources like tutorials, videos, documentation, and courses. Over time, these resources can become unavailable due to:

1. Content being removed or deleted
2. URLs changing as websites are updated
3. YouTube videos being set to private or removed
4. Courses being discontinued
5. Documentation being moved or restructured

These "dead links" create a frustrating experience for users following a learning roadmap.

## Solution

We've implemented a comprehensive URL validation service that:

1. Validates URLs as they're being added to roadmaps
2. Periodically checks existing URLs to ensure they remain valid
3. Provides visual indicators for potentially unavailable resources
4. Captures detailed validation information for troubleshooting

## Components

The validation service consists of several components:

### 1. URL Validation API (`/api/validate-url/route.ts`)

- Makes HTTP requests to verify URLs return valid status codes
- Uses special handling for YouTube links, including API validation
- Implements response caching to prevent redundant checks
- Handles various edge cases like redirects and rate limiting

### 2. Batch Resource Validator (`/api/resource-validator/route.ts`)

- Processes multiple resources in batches
- Updates database with validation results
- Supports validating all resources for a specific roadmap
- Implements database schema modifications as needed

### 3. Background Validation Job (`/api/cron/validate-resources/route.ts`)

- Runs periodically (e.g., daily) via a scheduled cron job
- Finds resources that haven't been validated recently
- Groups resources by roadmap for efficient processing
- Ensures all resources are regularly checked for validity

### 4. UI Integration

- Shows warnings for potentially unavailable resources in the lesson plan
- Maintains a clean user interface while providing necessary alerts
- Allows users to make informed decisions about resources

## Database Schema

The validation system extends the resources table with additional fields:

```sql
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS url_validated boolean,
ADD COLUMN IF NOT EXISTS url_validated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS url_status_code integer,
ADD COLUMN IF NOT EXISTS url_error text;
```

## Usage

### Manual Validation

To manually validate URLs for a specific roadmap:

```typescript
// Example API call
const response = await fetch('/api/resource-validator', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    roadmapId: 'your-roadmap-id',
    validateAll: true
  })
});
```

### Automated Validation

1. Set up a cron job to call `/api/cron/validate-resources`
2. Secure the endpoint with a `CRON_SECRET` environment variable
3. Configure the job to run daily or weekly

## Setting Up

### Required Environment Variables

```
YOUTUBE_API_KEY=your_youtube_data_api_key
CRON_SECRET=your_secret_for_cron_authentication
NEXT_PUBLIC_APP_URL=https://your-app-url.com
```

### YouTube API Setup

1. Create a project in Google Cloud Console
2. Enable the YouTube Data API v3
3. Create an API key with access to the YouTube Data API
4. Add the key to your environment variables

## Implementation Details

- The validation service uses intelligent validation rules to minimize false positives
- Special handling is implemented for different types of content (videos, courses, documentation)
- The system is designed to be fault-tolerant, continuing to function even if some validation steps fail
- Validation results are cached to improve performance and reduce external API calls

## Future Enhancements

1. Implement content fingerprinting to detect when a URL remains valid but content changes
2. Develop a machine learning model to predict which URLs are likely to become invalid
3. Create an admin dashboard for monitoring resource validation status
4. Implement automatic resource replacement suggestions for invalid URLs 