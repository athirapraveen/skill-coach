import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:3000/api/generate-roadmap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        goal: "Learn React Development",
        preferences: {
          budget: "mixed",
          timeline: "3",
          skillLevel: "beginner",
          learningFormat: "both",
          resourceType: "all"
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error testing roadmap generation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate roadmap' },
      { status: 500 }
    );
  }
} 