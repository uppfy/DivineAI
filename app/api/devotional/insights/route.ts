import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { scripture, reflection } = await req.json();

    if (!scripture || !reflection) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Using GPT-3.5 for faster responses
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
      temperature: 0.7,
      max_tokens: 500 // Limiting response length for faster results
    });

    const insights = completion.choices[0]?.message?.content;
    
    if (!insights) {
      return NextResponse.json(
        { error: 'No insights generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights. Please try again.' },
      { status: 500 }
    );
  }
} 