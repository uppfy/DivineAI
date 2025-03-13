import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { headers } from 'next/headers';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemMessage = `You are a Daily Devotional Generator. Generate an inspiring devotional with these components:

{
  'title': '<Short uplifting title>',
  'scripture': {
    'text': '<Full verse text>',
    'reference': '<Bible reference (e.g., John 14:27)>'
  },
  'reflection': '<A longer, detailed reflection that provides deep spiritual insights and practical application>',
  'prayer': '<A longer, heartfelt prayer that builds on the reflection>'
}

Guidelines:
1. The 'title' should be a concise, uplifting phrase that encapsulates the devotional's theme.
2. The 'scripture' must include both 'text' (the verse text) and 'reference' (e.g., 'John 14:27').
3. The 'reflection' should be longer, offering thoughtful insights on the verse and how it applies to daily life.
4. The 'prayer' should also be longer, guiding the reader into a deeper, heartfelt conversation with God.

Please produce only the JSON object, with no additional commentary or formatting.`;

export async function GET(request: Request) {
  // Get the URL from the request
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  
  // Verify cron job authentication
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const isCronRequest = userAgent.includes('vercel-cron');
  
  // Enhanced logging for debugging
  console.log('Request headers:', {
    'x-vercel-cron': headersList.get('x-vercel-cron'),
    'user-agent': headersList.get('user-agent')
  });
  console.log('Environment:', {
    'NODE_ENV': process.env.NODE_ENV,
    'Has CRON_SECRET_TOKEN': !!process.env.CRON_SECRET_TOKEN
  });
  
  // Check if this is a cron job request or has a valid token
  // Skip token validation during development
  const isValidRequest = 
    process.env.NODE_ENV === 'development' || 
    isCronRequest || 
    token === process.env.CRON_SECRET_TOKEN;
  
  if (!isValidRequest) {
    console.log('Unauthorized access attempt to devotional API');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Get current date with explicit timezone
    const now = new Date();
    const dateFormatOptions: Intl.DateTimeFormatOptions = {
      timeZone: 'Africa/Nairobi',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    // Format date for Firestore document ID (YYYY-MM-DD)
    const dateId = now.toLocaleDateString('en-US', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-');

    // Check if today's devotional already exists
    const devotionalRef = adminDb.collection('devotionals').doc(dateId);
    const devotionalDoc = await devotionalRef.get();

    if (devotionalDoc.exists) {
      // Return existing devotional
      return NextResponse.json(devotionalDoc.data());
    }

    console.log(`Generating new devotional for ${dateId}`);

    // Generate new devotional content from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: "Generate a daily devotional." }
      ],
      temperature: 0.7
    }).catch(error => {
      console.error('OpenAI API Error:', error);
      throw error;
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No response from OpenAI');
    }

    let devotionalContent;
    try {
      // Parse OpenAI response
      const content = completion.choices[0].message.content.trim();
      const jsonStr = content.substring(
        content.indexOf('{'),
        content.lastIndexOf('}') + 1
      );
      
      const validJsonStr = jsonStr
        .replace(/'/g, '"')
        .replace(/\n/g, ' ')
        .trim();
      
      devotionalContent = JSON.parse(validJsonStr);
      
      // Validate devotional content structure
      if (!devotionalContent.title || !devotionalContent.scripture || 
          !devotionalContent.scripture.text || !devotionalContent.scripture.reference || 
          !devotionalContent.reflection || !devotionalContent.prayer) {
        throw new Error('Invalid devotional content structure');
      }

      // Combine devotional content with accurate time metadata
      const devotionalWithMetadata = {
        ...devotionalContent,
        date: now.toLocaleDateString('en-US', dateFormatOptions),
        timestamp: Timestamp.now(),
        dateId: dateId
      };

      // Store in Firestore
      await devotionalRef.set(devotionalWithMetadata);
      
      console.log(`Successfully created devotional for ${dateId}`);
      return NextResponse.json(devotionalWithMetadata);

    } catch (parseError) {
      console.error('Parse error:', parseError);
      throw new Error('Failed to parse OpenAI response');
    }
  } catch (error) {
    console.error('Error details:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: `Failed to generate response: ${errorMessage}` },
      { status: 500 }
    );
  }
} 