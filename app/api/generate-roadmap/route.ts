import { OpenAI } from 'openai';

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

// Create an OpenAI API client
console.log('API Key present:', !!process.env.OPENAI_API_KEY);
console.log('API Key length:', process.env.OPENAI_API_KEY?.length);
console.log('API Key type:', process.env.OPENAI_API_KEY?.substring(0, 7));
const openaiClient = new OpenAI({
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
      - Budget: ${preferences.budget} (Focus on ${preferences.budget === 'free' ? 'free resources' : preferences.budget === 'paid' ? 'high-quality paid resources' : 'a mix of free and paid resources'})
      - Timeline: ${preferences.timeline} months
      - Current Level: ${preferences.skillLevel}
      - Learning Format Preference: ${preferences.learningFormat === 'both' ? 'Both videos and articles' : preferences.learningFormat === 'video' ? 'Primarily video content' : 'Primarily written content'}
      - Resource Type: ${preferences.resourceType === 'all' ? 'Mix of courses, tutorials, and projects' : preferences.resourceType}
      ${contextInfo}
      
      VERY IMPORTANT: When regenerating the roadmap, you MUST use this EXACT format for each week:
      
      # Week X: Topic Title
      
      Brief description of the week's focus
      
      ### Objectives:
      - Specific learning goal 1 that directly relates to the week's topic
      - Specific learning goal 2 that directly relates to the week's topic
      - Specific learning goal 3 that directly relates to the week's topic
      
      ### Resources:
      - [FORMAT][TYPE][COST] "Resource Title" - Brief description that explains how this resource specifically helps achieve the objectives: URL
      - [FORMAT][TYPE][COST] "Resource Title" - Brief description that explains how this resource specifically helps achieve the objectives: URL
      - [FORMAT][TYPE][COST] "Resource Title" - Brief description that explains how this resource specifically helps achieve the objectives: URL
      
      ### Exercise:
      - A practical hands-on task that directly applies the week's learning objectives
      - Optional additional tasks or variations that reinforce the specific skills covered this week
      
      FORMATTING REQUIREMENTS:
      1. Every week MUST have all three sections (Objectives, Resources, Exercise) properly formatted with "###" headings
      2. Use consistent heading structure with "###" for all sections 
      3. Format bullet points with "- " at the beginning of each point
      4. DO NOT include trailing characters like "#" at the end of lines
      5. Format resources exactly as shown: [FORMAT][TYPE][COST] followed by the title in quotes
      6. Every week must include properly formatted objectives, resources, and exercises
      
      RESOURCE QUALITY REQUIREMENTS:
      1. ONLY include resource URLs that are valid, working links from established platforms or official sources
      2. Resources MUST come from reputable sources like Coursera, Udemy, YouTube channels with >100K subscribers, freeCodeCamp, MDN, or official documentation
      3. NEVER link to homepages - always link directly to specific courses, articles, or tutorials
      4. Each resource must be directly relevant to the specific topic of that week
      5. Prefer recent resources from the last 2-3 years when possible
      6. Each resource URL must be complete with https:// prefix and go directly to the content
      7. Include a mix of different resource types appropriate for the topic
      8. Do NOT include placeholder or example URLs
      9. VERIFY all videos are still available and not marked as private or removed
      10. For courses, check they are still active and not archived
      11. For GitHub resources, prioritize repositories with recent activity (updated in the last 6 months)
      12. AVOID personal blogs, websites, and tutorials that might disappear
      
      If the user has topics they want to KEEP, make sure to include these in your revised roadmap (you can reorder these kept topics where appropriate based on the revised roadmap). Ensure that each topic, its objectives, exercises, 
      and resources are tightly connected and directly relevant to each other and to the overall goal of ${goal}.`
      : topic
      ? `Generate alternative high-quality resources for the topic: ${topic}
      
      Please provide resources with proper tagging:
      - [FORMAT][TYPE][COST] "Resource Title" - Brief description that explains how this resource helps learn this specific topic: URL
      
      FORMAT options: [VIDEO], [ARTICLE], [BOOK], [INTERACTIVE], [COURSE]
      TYPE options: [TUTORIAL], [PROJECT], [REFERENCE], [COURSE]
      COST options: [FREE] or [PAID $XX] with approximate price if applicable
      
      VERY IMPORTANT RESOURCE QUALITY REQUIREMENTS:
      1. All resource URLs MUST be valid and working links (no 404 errors)
      2. Only include links from established platforms like Coursera, Udemy, YouTube, freeCodeCamp, etc.
      3. URLs must be complete with https:// prefix
      4. URLs must link directly to the specific content page, not homepage
      5. Do not use placeholder or example URLs
      6. Check that each resource directly addresses the topic of ${topic}
      7. Prioritize resources from popular creators and established educational platforms
      8. For YouTube resources, prefer channels with substantial subscriber counts (>50K subscribers)
      9. For documentation resources, use official sources like MDN for web development
      10. Provide a variety of resource types and formats to accommodate different learning styles
      11. VERIFY all videos are still available and not marked as private or removed
      12. For courses, check they are still active and not archived
      13. For GitHub resources, prioritize repositories with recent activity (updated in the last 6 months)
      14. AVOID personal blogs, websites, and tutorials that might disappear
      
      Make sure each resource is:
      1. Directly relevant to the topic "${topic}"
      2. Tagged properly with [FORMAT], [TYPE], and [COST] tags
      2. Appropriate for a ${preferences.skillLevel} skill level
      3. Compatible with the user's budget preference (${preferences.budget})
      4. High quality and well-reviewed by the community
      5. Properly tagged and formatted `
      : `Create a comprehensive learning roadmap that completely satisfies the goal of learning ${goal} from start to finish.
      ${keptTopicsText}

      Provide a COMPLETE end-to-end roadmap covering ALL necessary topics to achieve the user's goal. The roadmap should:
      1. Start from the user's current level (${preferences.skillLevel}) and consider the full Context provided by the user
      2. Progress logically to full competency in ${goal}
      3. Include ALL essential concepts, technologies, and skills needed for real-world proficiency
      4. Be realistic for completion within ${preferences.timeline} months at ${hoursPerWeek || 10} hours per week
      
      Focus on making this roadmap practical, progressive, and tightly tailored to the user's specific needs.
      Include a good mix of theory and practical applications, with an emphasis on hands-on learning.
      IMPORTANT: Ensure that each topic, its objectives, exercises, and resources are tightly connected and directly relevant to each other and to the overall goal of ${goal}.
      By the end of the roadmap, the user should have gained all the knowledge and skills needed to be proficient in ${goal}.

      Each week should follow this exact format whenever a roadmap is generated:
      
      # Week X: Topic Title
      
      Brief description of the week's focus
      
      ### Objectives:
      - Specific learning goal 1 that directly relates to the week's topic
      - Specific learning goal 2 that directly relates to the week's topic
      - Specific learning goal 3 that directly relates to the week's topic
      
      ### Resources:
      - [FORMAT][TYPE][COST] "Resource Title" - Brief description that explains how this resource specifically helps achieve the objectives: URL
      - [FORMAT][TYPE][COST] "Resource Title" - Brief description that explains how this resource specifically helps achieve the objectives: URL
      - [FORMAT][TYPE][COST] "Resource Title" - Brief description that explains how this resource specifically helps achieve the objectives: URL
      
      ### Exercise:
      - A practical hands-on task that directly applies the week's learning objectives
      - Optional additional tasks or variations that reinforce the specific skills covered this week
      
      Make sure to:
      1. Use consistent heading structure with "###" for sections
      2. Keep descriptions clear and concise
      3. Include practical exercises for each week that are directly relevant to the objectives
      4. Format bullet points with "- " and DO NOT include trailing characters like "#" or extra periods
      5. Ensure all project work descriptions are properly formatted, avoiding raw markdown in descriptions
      6. Maintain tight relevance between each week's topic, objectives, resources, and exercises
      7. ONLY include resource URLs that are valid, working links from established platforms
      8. Resources MUST come from reputable sources like Coursera, Udemy, YouTube channels, freeCodeCamp, MDN, or official documentation
      9. NEVER link to homepages - always link directly to specific courses, articles, or tutorials
      10. Each resource must be directly relevant to the specific topic of that week
      11. Each resource URL must be complete with https:// prefix and go directly to the content
      12. Do NOT include placeholder or example URLs

      Make sure each resource is:
      1. Directly relevant to the topic "${topic}"
      2. Tagged properly with [FORMAT], [TYPE], and [COST] tags
      2. Appropriate for a ${preferences.skillLevel} skill level
      3. Compatible with the user's budget preference (${preferences.budget})
      4. High quality and well-reviewed by the community
      5. Properly tagged and formatted `;

    // Update the system message with more specific instructions about broken links
    const systemMessage = 'You are a skilled educational content creator who creates detailed learning roadmaps. You must follow the exact markdown formatting provided and maintain consistent structure throughout the response. Format bullet points with "- " at the beginning of each point and DO NOT include trailing characters like "#" or extra periods. IMPORTANT: For each resource you recommend, you must tag it with format (VIDEO/ARTICLE/BOOK/INTERACTIVE/COURSE), type (TUTORIAL/PROJECT/REFERENCE/COURSE), and cost (FREE/PAID with price if applicable). Always recommend high-quality, popular resources that are well-reviewed and proven effective. \n\nCRITICAL: All resource URLs MUST be valid, working links - check that they point to established, reputable sites that are unlikely to return 404 errors. Prefer resources from well-known platforms like Coursera, Udemy, YouTube, freeCodeCamp, Medium, GitHub, and official documentation sites. Every resource must be directly relevant to the specific topic being discussed. Do not recommend generic homepages - link to specific courses, articles, or tutorials. Each resource link must be accessible and immediately useful to the learner without additional steps.\n\nAVOID THESE SPECIFIC BROKEN LINKS: \n- Any YouTube video with ID "xfqh5MTb0SU" (this video is unavailable)\n- https://www.tutorialspoint.com/sql/sql-dml-statements.htm (returns 404)\n- https://developer.mozilla.org/en-US/docs/Learn/SQL/Introduction_to_SQL (returns 404)\n\nFOR YOUTUBE VIDEOS: Only recommend videos from channels with 100K+ subscribers and recent activity. Verify video IDs are valid by ensuring they\'re 11 characters long and don\'t contain special characters. If unsure if a YouTube link is valid, choose a more established alternative.\n\nAVOID LINK ROT: Prioritize resources that are likely to remain available long-term. For courses, verify they are still active and not archived or closed for enrollment. For YouTube videos, check they are from established channels (>100K subscribers) and not likely to be taken down. For GitHub repositories, ensure they have recent activity and are maintained. For documentation, only use official sources that are actively maintained. AVOID blogs and personal websites unless they are from recognized industry experts.\n\nWhen creating the roadmap, ensure it is COMPREHENSIVE and covers the COMPLETE journey from the user\'s current level to full proficiency in their goal.';

    // Ask OpenAI for a streaming completion given the prompt
    console.log('Attempting to create chat completion with model: gpt-4o');
    
    const stream = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      stream: true,
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Return the stream directly as a response
    return new Response(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          
          try {
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content || '';
              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            }
          } catch (streamError: unknown) {
            console.error('Error streaming response:', streamError);
            
            // Check for specific error types
            let errorMessage = '\n\nError: Failed to complete the roadmap generation.';
            
            if (streamError instanceof Error && streamError.message) {
              if (streamError.message.includes('model')) {
                errorMessage = '\n\nError: There was an issue with the selected AI model (gpt-4o). The system will be updated to use a different model soon.';
              } else if (streamError.message.includes('capacity')) {
                errorMessage = '\n\nError: The AI model is currently overloaded with requests. Please try again in a few minutes.';
              } else if (streamError.message.includes('rate') || streamError.message.includes('limit')) {
                errorMessage = '\n\nError: Rate limit exceeded. Please try again in a few minutes.';
              }
            }
            
            controller.enqueue(encoder.encode(errorMessage));
          } finally {
            controller.close();
          }
        },
      })
    );

  } catch (error: unknown) {
    console.error('Error processing request:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
      
    return new Response(JSON.stringify({ message: 'Failed to generate roadmap: ' + errorMessage }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}