import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

interface RequestBody {
  topic: string;
  resources: string[];
}

// Create an OpenAI API client (that's edge-friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
  const { topic, resources }: RequestBody = await req.json();

  // Create a prompt that includes the topic and resources
  const prompt = `Generate a comprehensive quiz for the topic: ${topic}

  Resources to base the quiz on:
  ${resources.map(resource => `- ${resource}`).join('\n')}

  Please create a quiz in this exact format:

  # Quiz: ${topic}
  [2-3 sentences explaining what this quiz will test and how to approach it]

  ## Questions
  1. [Question text]
     a) [Option A]
     b) [Option B]
     c) [Option C]
     d) [Option D]
     Correct Answer: [A/B/C/D]
     Explanation: [2-3 sentences explaining why this is the correct answer]

  2. [Question text]
     a) [Option A]
     b) [Option B]
     c) [Option C]
     d) [Option D]
     Correct Answer: [A/B/C/D]
     Explanation: [2-3 sentences explaining why this is the correct answer]

  ## Practice Exercise
  [A practical exercise that tests understanding of the topic]

  Guidelines:
  1. Create 5 questions that test different aspects of the topic
  2. Each question should have 4 options (A, B, C, D)
  3. Questions should range from basic understanding to application
  4. Include clear explanations for correct answers
  5. End with a practical exercise that reinforces learning
  6. Keep the markdown structure consistent for proper parsing
  7. Make questions challenging but fair
  8. Ensure explanations are clear and educational
  9. Include a mix of theoretical and practical questions
  10. Make the practice exercise engaging and relevant`;

  // Ask OpenAI for a streaming completion given the prompt
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    stream: true,
    messages: [
      {
        role: 'system',
        content: 'You are a skilled educational content creator who creates comprehensive quizzes. You must follow the exact markdown formatting provided and maintain consistent structure throughout the response. Always create questions that test understanding and application of concepts.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
} 