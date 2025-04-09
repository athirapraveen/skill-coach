import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ResourceValidationRequest {
  resources: {
    id: string;
    url: string;
  }[];
  roadmapId?: string;
  validateAll?: boolean;
}

interface ValidationResult {
  resourceId: string;
  url: string;
  isValid: boolean;
  statusCode?: number;
  error?: string;
  validatedAt: string;
}

export const maxDuration = 300; // 5 minutes max for serverless function

export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json() as ResourceValidationRequest;
    const { resources, roadmapId, validateAll = false } = body;

    if (!resources || !Array.isArray(resources) || resources.length === 0) {
      return NextResponse.json(
        { error: 'Resources array is required' },
        { status: 400 }
      );
    }

    // Fetch resources from database if roadmapId is provided
    let resourcesToValidate = resources;
    
    if (roadmapId && validateAll) {
      // Get all resources for the roadmap
      const { data: roadmapResources, error } = await supabase
        .from('resources')
        .select('id, url')
        .eq('roadmap_id', roadmapId);
        
      if (error) {
        console.error('Error fetching roadmap resources:', error);
        return NextResponse.json(
          { error: 'Failed to fetch roadmap resources' },
          { status: 500 }
        );
      }
      
      resourcesToValidate = roadmapResources || [];
    }

    // Create a new database table for validation results if it doesn't exist
    const { error: schemaCheckError } = await supabase
      .from('resource_validations')
      .select('id')
      .limit(1);
      
    // If the table doesn't exist, schema check will fail
    if (schemaCheckError && schemaCheckError.code === '42P01') {
      // Try to create the table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS resource_validations (
          id uuid PRIMARY KEY REFERENCES resources(id),
          url text NOT NULL,
          is_valid boolean,
          status_code integer,
          error text,
          validated_at timestamp with time zone NOT NULL,
          created_at timestamp with time zone DEFAULT now()
        );
      `;
      
      const { error: createError } = await supabase.rpc('pgclient', { query: createTableQuery });
      
      if (createError) {
        console.error('Error creating resource_validations table:', createError);
        // Continue anyway - we'll just update the resources table directly
      }
    }

    // Process in batches of 10 to avoid rate limiting
    const batchSize = 10;
    const validationResults: ValidationResult[] = [];
    const validationPromises: Promise<ValidationResult>[] = [];

    for (const resource of resourcesToValidate) {
      if (!resource.url) continue;
      
      // Add to validation queue
      validationPromises.push(validateResource(resource.id, resource.url));
      
      // Process in batches
      if (validationPromises.length >= batchSize) {
        const batchResults = await Promise.all(validationPromises);
        validationResults.push(...batchResults);
        validationPromises.length = 0; // Clear the array
      }
    }
    
    // Process any remaining resources
    if (validationPromises.length > 0) {
      const batchResults = await Promise.all(validationPromises);
      validationResults.push(...batchResults);
    }

    // Update the database with validation results
    let successCount = 0;
    let errorCount = 0;
    
    for (const result of validationResults) {
      // Try to insert into resource_validations table
      const { error: validationInsertError } = await supabase
        .from('resource_validations')
        .upsert({
          id: result.resourceId,
          url: result.url,
          is_valid: result.isValid,
          status_code: result.statusCode,
          error: result.error,
          validated_at: result.validatedAt
        }, { onConflict: 'id' });
      
      if (validationInsertError) {
        // If custom table approach fails, update resources table directly
        try {
          // Add validation fields to resources table if they don't exist
          await ensureResourceValidationFields();
          
          // Update the resources table directly
          const { error: resourceUpdateError } = await supabase
            .from('resources')
            .update({
              url_validated: result.isValid,
              url_validated_at: result.validatedAt,
              url_status_code: result.statusCode,
              url_error: result.error
            })
            .eq('id', result.resourceId);
            
          if (resourceUpdateError) {
            console.error(`Error updating resource ${result.resourceId}:`, resourceUpdateError);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error('Error in fallback update:', err);
          errorCount++;
        }
      } else {
        successCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Validated ${validationResults.length} resources, updated ${successCount} successfully, ${errorCount} errors`,
      results: validationResults
    });
  } catch (error) {
    console.error('Error in resource-validator route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to validate resources', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Helper function to ensure resources table has validation fields
async function ensureResourceValidationFields() {
  // Check if the table already has our validation fields
  const { data: columnInfo, error } = await supabase
    .rpc('check_column_exists', { 
      p_table: 'resources', 
      p_column: 'url_validated' 
    });
    
  if (error) {
    console.error('Error checking column existence:', error);
    // Try traditional approach
    const { error: alterError } = await supabase
      .rpc('pgclient', {
        query: `
        DO $$
        BEGIN
          BEGIN
            ALTER TABLE resources ADD COLUMN IF NOT EXISTS url_validated boolean;
            ALTER TABLE resources ADD COLUMN IF NOT EXISTS url_validated_at timestamp with time zone;
            ALTER TABLE resources ADD COLUMN IF NOT EXISTS url_status_code integer;
            ALTER TABLE resources ADD COLUMN IF NOT EXISTS url_error text;
          EXCEPTION
            WHEN duplicate_column THEN
            -- Do nothing, column already exists
          END;
        END $$;
        `
      });
      
    if (alterError) {
      console.error('Error altering resources table:', alterError);
      throw new Error('Failed to add validation fields to resources table');
    }
  } else if (!columnInfo) {
    // Need to add the columns
    const { error: alterError } = await supabase
      .rpc('pgclient', {
        query: `
        ALTER TABLE resources 
        ADD COLUMN IF NOT EXISTS url_validated boolean,
        ADD COLUMN IF NOT EXISTS url_validated_at timestamp with time zone,
        ADD COLUMN IF NOT EXISTS url_status_code integer,
        ADD COLUMN IF NOT EXISTS url_error text;
        `
      });
      
    if (alterError) {
      console.error('Error altering resources table:', alterError);
      throw new Error('Failed to add validation fields to resources table');
    }
  }
}

// Function to validate a resource URL
async function validateResource(resourceId: string, url: string): Promise<ValidationResult> {
  const validationResult: ValidationResult = {
    resourceId,
    url,
    isValid: false,
    validatedAt: new Date().toISOString()
  };

  try {
    // Validate using our validate-url API
    const response = await fetch(new URL('/api/validate-url', process.env.NEXT_PUBLIC_APP_URL).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      validationResult.error = `API returned status ${response.status}`;
      return validationResult;
    }

    const data = await response.json();
    
    // Copy validation results
    validationResult.isValid = data.isValid;
    validationResult.statusCode = data.statusCode;
    validationResult.error = data.error;

    return validationResult;
  } catch (error) {
    validationResult.error = error instanceof Error ? error.message : 'Failed to validate resource';
    return validationResult;
  }
} 