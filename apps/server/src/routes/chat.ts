import { createElysia } from '../lib/utils'
import { openai } from '@ai-sdk/openai'
import { convertToCoreMessages, Message, smoothStream, streamText } from 'ai'

import { SYSTEM_PROMPT } from '../lib/model'
import { tools } from '../lib/tools'
import { t } from 'elysia'

export const chatRoutes = createElysia({ prefix: '/chat' })
  .post('/', async ({ body }) => {
    const { id, messages, model } = body

    const coreMessages = convertToCoreMessages(messages)
    const result = await streamText({
      model: await openai(model),
      system: SYSTEM_PROMPT(null),
      messages: coreMessages,
      maxSteps: 3,
      tools,
      experimental_transform: smoothStream(),
      onFinish: async (stepResult) => {
      },
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'stream-text',
      },
    })

    return result
  }, {
    body: t.Object({
      id: t.String(),
      messages: t.Array(t.Any()),
      model: t.String(),
    })
  })