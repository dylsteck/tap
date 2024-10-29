import { convertToCoreMessages, Message, streamText } from 'ai';
import { z } from 'zod';

import { customModel } from '@/ai';
import { auth } from '@/app/(auth)/auth';
import Iframe from '@/components/custom/iframe';
import { deleteChatById, getChatById, saveChat } from '@/db/queries';
import { Model, models } from '@/lib/model';

export async function POST(request: Request) {
  const {
    id,
    messages,
    model,
  }: { id: string; messages: Array<Message>; model: Model['name'] } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!models.find((m) => m.name === model)) {
    return new Response('Model not found', { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);

  const result = await streamText({
    model: customModel(model),
    system:
      'you are a friendly assistant! keep your responses concise and helpful.',
    messages: coreMessages,
    maxSteps: 5,
    tools: {
      getWeather: {
        description: 'Get the current weather at a location',
        parameters: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }),
        execute: async ({ latitude, longitude }) => {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`
          );

          const weatherData = await response.json();
          return weatherData;
        },
      },
      getCasts: {
        description: 'Get posts(casts) around a certain keyword that happened on Farcaster. Do not return any other text at all.',
        parameters: z.object({
          keyword: z.string(),
        }),
        execute: async ({ keyword }) => {
          const response = await fetch(
            `https://searchcaster.xyz/api/search?text=${keyword}&count=10&engagement=reactions`
          );
          const castData = await response.json();
          return castData;
        },
      },
      getEvents: {
        description: 'Get upcoming Farcaster events on Events.xyz',
        parameters: z.object({}),
        execute: async ({}) => {
          // const eventsLink = 'https://beta.events.xyz/api/events';
          // const eventsLink = 'https://cortex-dev.vercel.app/api/farcaster/events';
          const eventsLink = '/api/farcaster/events';
          //const eventsLink = 'http://localhost:3000/api/farcaster/events';
          const response = await fetch(eventsLink);
          console.log(response)
          const eventsData = await response.json();
          console.log(eventsData)
          return eventsData;
        },
      },
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
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

    if (chat.userId !== session.user.id) {
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