import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Add count to the destructured properties, default to 4
    const { prompt, topicTitle, topicDescription, objectives, count = 4 } = await request.json();

    // Validate required fields
    if (!prompt || !topicTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and topicTitle are required.' },
        { status: 400 }
      );
    }
    
    // Validate count
    if (typeof count !== 'number' || count <= 0 || count > 10) {
       return NextResponse.json(
        { error: 'Invalid count parameter. Must be a number between 1 and 10.' },
        { status: 400 }
      );     
    }

    // Create a chat completion with GPT-4o
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a learning resource curator. Your task is to generate high-quality, relevant learning resources for specific topics. 
          Always ensure resources are from reputable sources and include valid, accessible URLs (no 404s, paywalls, or private content).
          ${objectives ? 'Consider the learning objectives when selecting resources to ensure they align with the educational goals.' : ''}
          
          CRITICAL FOR YOUTUBE LINKS: Only suggest YouTube videos that are PUBLIC, FULLY PROCESSED (not recently uploaded and still processing), and AVAILABLE WORLDWIDE. Double-check video availability before including it. Do NOT include videos that are private, unlisted, deleted, age-restricted, or region-locked. Prefer videos from established channels (>100k subscribers).`
        },
        {
          role: 'user',
          // Modify the user prompt to include the requested count
          content: `${prompt}\n\nPlease provide exactly ${count} resources. Remember to strictly follow the YouTube video requirements.` 
        }
      ],
      temperature: 0.7,
      max_tokens: 150 * count, // Adjust max_tokens based on requested count
    });

    // Extract the generated resources from the response
    const responseText = completion.choices[0]?.message?.content || '';
    
    // Split the response into individual resources
    const resources = responseText
      .split('\n')
      .filter(line => line.trim().length > 0 && line.includes(' - ')) // Basic check for format
      .map(line => line.trim());

    // Log the number of resources received vs requested
    console.log(`Requested ${count} resources for topic "${topicTitle}", received ${resources.length} raw lines.`);

    // No longer strictly enforcing the count here, the calling function will handle it
    // if (resources.length !== count) {
    //   console.warn(`Expected ${count} resources, but received ${resources.length} for topic: ${topicTitle}`);
    // }

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Error generating resources:', error);
    // Provide more detailed error response if possible
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate resources';
    const errorStatus = error instanceof OpenAI.APIError ? error.status : 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: errorStatus || 500 }
    );
  }
} 