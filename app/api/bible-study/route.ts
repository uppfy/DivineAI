import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemMessage = `You are a Bible Study Plan generator. When a user submits an input—whether it is a Bible book, chapter, verse, a spiritual question/theme, or a single-word theme like 'Faith', 'Love', or 'Prayer'—your task is to generate a structured, insightful, and encouraging Bible study plan. Your language should be warm, inspiring, and spiritually uplifting, guiding users toward meaningful reflection and personal growth.

### User Query Handling:
Users may submit one of three types of queries. Process them accordingly while maintaining a consistent structure in the response:

1. **Bible Verse Reference (Book, Chapter, or Verse):**
   - Example Inputs: "John 3:16", "Psalm 23", "Romans 8"
   - Your task: Generate a study plan focusing on the meaning, context, and application of the passage. The checklist should include steps such as reading the verse, understanding its historical background, reflecting on its meaning, praying over it, and applying it in daily life.

2. **Spiritual Question:**
   - Example Inputs: "How can I trust God more?", "What does the Bible say about faith?", "Overcoming fear through scripture"
   - Your task: Identify the core spiritual need and generate a study plan that includes relevant Bible passages and step-by-step actions to guide the user in studying, reflecting, and applying biblical principles.

3. **Theme:**
   - Example Inputs: "Faith", "Love", "Prayer"
   - Your task: Create a study plan centered on the chosen theme, providing a curated Bible Scripture Reference and a series of actionable, reflective steps designed to deepen the user's understanding and practice of that theme.

### Output Format (Strict JSON Structure):
Your response must follow this exact format:

{
  'title': '<3-5 word unique title>',
  'description': '<Brief description of the study plan>',
  'scripture_reference': '<Bible Scripture Reference>',
  'checklist': [
    {
      'heading': '<2-5 word heading>',
      'description': '<One-line description>'
    },
    ... (5 to 8 unique checklist items total)
  ]
}

### Scripture Reference Generation Guidelines:
- The scripture reference should be a single bible verse
-**Example of a scripture reference:**
  - "John 3:16; For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."
- The scripture reference should be in the format of "Book Chapter:Verse; Scripture Text"

### Checklist Generation Guidelines:
- The checklist should have **5 to 8 items** arranged in a logical order, progressing from study to application.
- Each item should be **actionable and reflective**, helping users understand and implement the lesson.
- **Examples of checklist items(Just examples, you should analyze the user's query and generate a checklist based on the user's query):**
  - **Heading:** Read and Reflect  
    **Description:** Read John 3:16 slowly and think about what it reveals about God's love.
  - **Heading:** Compare Translations  
    **Description:** Read the verse in two or more translations to deepen understanding.
  - **Heading:** Personal Application  
    **Description:** Write down one way you can apply this verse to your life today.
  - **Heading:** Prayer Focus  
    **Description:** Spend time praying about the lesson and asking God for guidance.

### Additional Instructions:
- Always **keep the tone warm, uplifting, and motivational** to encourage spiritual growth.
- Do not include extra commentary or formatting outside of the JSON structure.
- Do not give unrealistic or impractical checklist items.
- Ensure **consistency in structure and clarity** regardless of the user's query type.
- If a query is unclear, assume the user is seeking general guidance and generate a study plan based on the most relevant biblical principles.`;

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { input, type } = await req.json();

    if (!input || !type || typeof input !== 'string' || typeof type !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: input and type are required' },
        { status: 400 }
      );
    }

    const getFormattedType = (type: string, input: string) => {
      switch (type) {
        case 'verse':
          return `Bible Book/Chapter/Verse: ${input}`;
        case 'question':
          return `Spiritual Question: ${input}`;
        case 'theme':
          return `Theme Study: ${input}`;
        default:
          return input;
      }
    };

    console.log('Sending request to OpenAI with:', {
      type,
      input,
      formattedQuery: getFormattedType(type, input)
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { 
          role: "user", 
          content: `Generate a Bible study plan for the following query: "${getFormattedType(type, input)}". Remember to follow the format exactly and respond only with the JSON object.`
        }
      ],
      temperature: 0.7
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No response from OpenAI');
    }

    console.log('Raw OpenAI response:', completion.choices[0].message.content);

    let response;
    try {
      const content = completion.choices[0].message.content.trim();
      
      // Find the first { and last } to extract the JSON object
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');
      
      if (startIdx === -1 || endIdx === -1) {
        console.error('No JSON object found in response');
        throw new Error('Invalid response format: No JSON object found');
      }

      const jsonStr = content.slice(startIdx, endIdx + 1);
      console.log('Extracted JSON string:', jsonStr);

      // Replace single quotes with double quotes for valid JSON
      const validJsonStr = jsonStr
        .replace(/'/g, '"')  // Replace all single quotes with double quotes
        .replace(/\n/g, ' ') // Remove newlines for cleaner parsing
        .trim();
      
      console.log('Processed JSON string:', validJsonStr);

      response = JSON.parse(validJsonStr);
      
      // Validate response structure
      if (!response.title || !response.description || !response.scripture_reference || 
          !Array.isArray(response.checklist) || response.checklist.length < 5 || 
          response.checklist.length > 8) {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response structure: Missing required fields or invalid checklist length');
      }
      
      // Validate each checklist item
      for (const item of response.checklist) {
        if (!item.heading || !item.description) {
          console.error('Invalid checklist item:', item);
          throw new Error('Invalid checklist item structure: Missing heading or description');
        }
      }

      console.log('Successfully parsed response:', response);
    } catch (parseError: any) {
      console.error('Parse error details:', parseError);
      console.error('Failed to parse response:', completion.choices[0].message.content);
      throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error details:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to generate response: ${errorMessage}` },
      { status: 500 }
    );
  }
} 