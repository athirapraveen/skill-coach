import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { prompt, topicTitle, topicDescription, objectives } = await request.json();

    if (!prompt || !topicTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
          Always ensure resources are from reputable sources and include valid URLs.
          ${objectives ? 'Consider the learning objectives when selecting resources to ensure they align with the educational goals.' : ''}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Extract the generated resources from the response
    const responseText = completion.choices[0]?.message?.content || '';
    
    // Split the response into individual resources
    const resources = responseText
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.trim());

    // Validate that we have the expected number of resources
    if (resources.length !== 4) {
      console.warn(`Expected 4 resources, but got ${resources.length} for topic: ${topicTitle}`);
    }

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Error generating resources:', error);
    return NextResponse.json(
      { error: 'Failed to generate resources' },
      { status: 500 }
    );
  }
} 