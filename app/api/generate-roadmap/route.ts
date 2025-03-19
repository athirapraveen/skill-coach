import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

interface Preferences {
  budget: 'free' | 'paid' | 'mixed';
  timeline: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  learningFormat: 'video' | 'article' | 'both';
  resourceType: 'course' | 'tutorial' | 'project' | 'all';
}

interface KeptTopic {
  id: string;
  title: string;
}

interface RequestBody {
  goal: string;
  preferences: Preferences;
  feedback?: string;
  keptTopics?: KeptTopic[];
  topic?: string;
  existingRoadmap?: string;
  goalType?: string;
  goalDescription?: string;
  hoursPerWeek?: number;
}

// Create an OpenAI API client (that's edge-friendly!)
console.log('API Key length:', process.env.OPENAI_API_KEY?.length);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { goal, preferences, feedback, keptTopics, topic, existingRoadmap, goalType, goalDescription, hoursPerWeek }: RequestBody = await req.json();
    console.log('Request received:', { goal, preferences, feedbackProvided: !!feedback, keptTopicsCount: keptTopics?.length || 0 });

    let keptTopicsText = '';
    if (keptTopics && keptTopics.length > 0) {
      keptTopicsText = `
      The user wants to KEEP these topics from the current roadmap (do not change these topics, but you can reposition them if needed):
      ${keptTopics.map(t => `- ${t.title} (ID: ${t.id})`).join('\n')}
      `;
    }

    let contextInfo = '';
    if (goalType || goalDescription || hoursPerWeek) {
      contextInfo = `
      Additional context:
      ${goalType ? `- Goal Type: ${goalType}` : ''}
      ${goalDescription ? `- Goal Description: ${goalDescription}` : ''}
      ${hoursPerWeek ? `- Hours Available Per Week: ${hoursPerWeek}` : ''}
      `;
    }

    // Create a prompt that includes the user's goal and preferences
    const prompt = feedback 
      ? `Based on the following feedback, regenerate the learning roadmap for: ${goal}
      
      User Feedback: ${feedback}
      
      ${keptTopicsText}
      
      Current Roadmap:
      ${existingRoadmap}
      
      Context:
      - Budget: ${preferences.budget}
      - Timeline: ${preferences.timeline}
      - Current Level: ${preferences.skillLevel}
      - Learning Format: ${preferences.learningFormat}
      - Resource Type: ${preferences.resourceType}
      ${contextInfo}
      
      Please provide an improved roadmap addressing the feedback while maintaining the same weekly structure. For each week, include clear learning objectives and a curated set of resources. Keep the markdown format with '# Week X' for each week.
      
      Each week should follow this exact format:
      
      # Week X: Topic Title
      
      Brief description of the week's focus
      
      ### Objectives:
      - Specific learning goal 1
      - Specific learning goal 2
      - Specific learning goal 3
      
      ### Resources:
      - [FORMAT][TYPE][COST] "Resource Title" - Brief description: URL
      - [FORMAT][TYPE][COST] "Resource Title" - Brief description: URL
      - [FORMAT][TYPE][COST] "Resource Title" - Brief description: URL
      
      ### Exercise:
      - A practical hands-on task to apply the week's learning
      - Optional additional tasks or variations
      
      Make sure to:
      1. Tag each resource properly with [FORMAT], [TYPE], and [COST] tags
      2. Use consistent heading structure with "###" for sections
      3. Keep descriptions clear and concise
      4. Include practical exercises for each week
      5. Format bullet points with "- " and DO NOT include trailing characters like "#" or extra periods
      
      If the user has topics they want to KEEP, make sure to include these in your revised roadmap (you can reposition them where appropriate).`
      : topic
      ? `Generate alternative high-quality resources for the topic: ${topic}
      
      Context:
      - Budget: ${preferences.budget}
      - Learning Format: ${preferences.learningFormat}
      - User Level: ${preferences.skillLevel}
      
      Please provide resources with proper tagging:
      - [FORMAT][TYPE][COST] "Resource Title" - Brief description: URL
      
      FORMAT options: [VIDEO], [ARTICLE], [BOOK], [INTERACTIVE], [COURSE]
      TYPE options: [TUTORIAL], [PROJECT], [REFERENCE], [COURSE]
      COST options: [FREE] or [PAID $XX] with approximate price if applicable`
      : `Create a comprehensive learning roadmap that completely satisfies the goal of learning ${goal} from start to finish.
      
      ${keptTopicsText}
      
      Context:
      - Budget: ${preferences.budget} (Focus on ${preferences.budget === 'free' ? 'free resources' : preferences.budget === 'paid' ? 'high-quality paid resources' : 'a mix of free and paid resources'})
      - Timeline: ${preferences.timeline} months
      - Current Level: ${preferences.skillLevel}
      - Learning Format Preference: ${preferences.learningFormat === 'both' ? 'Both videos and articles' : preferences.learningFormat === 'video' ? 'Primarily video content' : 'Primarily written content'}
      - Resource Type: ${preferences.resourceType === 'all' ? 'Mix of courses, tutorials, and projects' : preferences.resourceType}
      ${contextInfo}
      
      Provide a COMPLETE end-to-end roadmap covering ALL necessary topics to achieve the user's goal. The roadmap should:
      1. Start from the user's current level (${preferences.skillLevel})
      2. Progress logically to full competency in ${goal}
      3. Include ALL essential concepts, technologies, and skills needed for real-world proficiency
      4. Be realistic for completion within ${preferences.timeline} months at ${hoursPerWeek || 10} hours per week
      
      Structure the roadmap with a weekly learning plan spanning the timeline, with "# Week X" for each week.
      Each week should follow this exact format:
      
      # Week X: Topic Title
      
      Brief description of the week's focus
      
      ### Objectives:
      - Specific learning goal 1
      - Specific learning goal 2
      - Specific learning goal 3
      
      ### Resources:
      - [FORMAT][TYPE][COST] "Resource Title" - Brief description: URL
      - [FORMAT][TYPE][COST] "Resource Title" - Brief description: URL
      - [FORMAT][TYPE][COST] "Resource Title" - Brief description: URL
      
      ### Exercise:
      - A practical hands-on task to apply the week's learning
      - Optional additional tasks or variations
      
      Make sure to:
      1. Tag each resource properly with [FORMAT], [TYPE], and [COST] tags
      2. Use consistent heading structure with "###" for sections
      3. Keep descriptions clear and concise
      4. Include practical exercises for each week
      5. Format bullet points with "- " and DO NOT include trailing characters like "#" or extra periods
      
      FORMAT options: [VIDEO], [ARTICLE], [BOOK], [INTERACTIVE], [COURSE]
      TYPE options: [TUTORIAL], [PROJECT], [REFERENCE], [COURSE]
      COST options: [FREE] or [PAID $XX] with approximate price if applicable
      
      Focus on making this roadmap practical, progressive, and tailored to the user's specific needs.
      Include a good mix of theory and practical applications, with an emphasis on hands-on learning.
      By the end of the roadmap, the user should have gained all the knowledge and skills needed to be proficient in ${goal}.`;

    // Ask OpenAI for a streaming completion given the prompt
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      stream: true,
      messages: [
        {
          role: 'system',
          content: 'You are a skilled educational content creator who creates detailed learning roadmaps. You must follow the exact markdown formatting provided and maintain consistent structure throughout the response. Format bullet points with "- " at the beginning of each point and DO NOT include trailing characters like "#" or extra periods. IMPORTANT: For each resource you recommend, you must tag it with format (VIDEO/ARTICLE/BOOK/INTERACTIVE/COURSE), type (TUTORIAL/PROJECT/REFERENCE/COURSE), and cost (FREE/PAID with price if applicable). Always recommend high-quality, popular resources that are well-reviewed and proven effective. When creating the roadmap, ensure it is COMPREHENSIVE and covers the COMPLETE journey from the user\'s current level to full proficiency in their goal.',
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
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}