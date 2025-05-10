import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, Message, smoothStream, streamText } from 'ai';
import { z } from 'zod';

import { auth } from '@/app/(auth)/auth';
import { deleteChatById, getChatById, saveChat } from '@/db/queries';
import { SYSTEM_PROMPT } from '@/lib/model';
import { tools } from '@/lib/tools';
import { SessionData } from '@/lib/types';
import { BASE_URL } from '@/lib/utils';

export async function POST(request: Request) {
  const { id, messages, model }: { id: string; messages: Array<Message>; model: string } = await request.json();

  const session = await auth();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const result = await streamText({
    model: await openai(model),
    system: SYSTEM_PROMPT(session.user as SessionData),
    messages: coreMessages,
    maxSteps: 3,
    tools,
    experimental_transform: smoothStream(),
    onFinish: async (stepResult) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...stepResult.response.messages],
            userId: session.user.id
          });
        } catch (error) {
          console.error('Failed to save chat');
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: 'stream-text',
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat?.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}