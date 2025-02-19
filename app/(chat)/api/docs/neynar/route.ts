import { NextRequest, NextResponse } from 'next/server';

import { redis } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const cacheKey = `docs:neynar:${question}`;
    const cachedResponse = await redis.get(cacheKey);

    if (cachedResponse) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(cachedResponse as string));
          controller.close();
        }
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=86400',
        }
      });
    }

    const response = await fetch('https://docs.neynar.com/chatgpt/ask', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`Neynar API request failed with status ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = '';

    const stream = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader?.read() || {};
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          result += chunk;
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        
        const sanitizedResult = result
          .replace(/^---data:\s*/gm, '')
          .replace(/\n+/g, '\n')
          .trim();

        await redis.set(cacheKey, sanitizedResult, { ex: 86400 });
        
        controller.close();
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400',
      }
    });
  } catch (error) {
    console.error('Error in Neynar API route:', error);
    return NextResponse.json({ 
      error: `Error querying Neynar: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}