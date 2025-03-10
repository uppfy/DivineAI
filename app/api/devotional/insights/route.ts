import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const body = await req.json();
    
    if (!body.scripture || !body.reflection) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { scripture, reflection } = body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a Biblical scholar providing deeper insights into devotional reflections. Focus on historical context, original language nuances, and practical modern-day applications."
        },
        {
          role: "user",
          content: `Please provide deeper insights for this devotional:\n\nScripture: ${scripture.text} (${scripture.reference})\n\nReflection: ${reflection}\n\nProvide analysis of key themes, original language insights if relevant, historical context, and practical modern applications.`
        }
      ],
      temperature: 0.7
    });

    if (!completion.choices[0]?.message?.content) {
      return new NextResponse(
        JSON.stringify({ error: 'No response from OpenAI' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ insights: completion.choices[0].message.content }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error details:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({ error: `Failed to generate insights: ${errorMessage}` }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 