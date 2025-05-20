import { createElysia } from '../lib/utils'
import { openai } from '@ai-sdk/openai'
import { convertToCoreMessages, Message, smoothStream, streamText } from 'ai'
import { t } from 'elysia'

import { SYSTEM_PROMPT } from '../lib/model'
import { tools } from '../lib/tools'
import { ChatRepository } from '../db/repositories/chat'
import { db } from '../db'

export const chatRoutes = createElysia({ prefix: '/chat' })
  .get('/:id', async ({ params }) => {
    const chat = await db.chat.getById(params.id)
    if (!chat) {
      return { success: false, error: 'Chat not found' }
    }
    return { success: true, data: chat }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  .get('/user/:userId', async ({ params }) => {
    const chats = await db.chat.getByUserId(params.userId)
    return { success: true, data: chats }
  }, {
    params: t.Object({
      userId: t.String()
    })
  })
  .get('/history', async ({ request, headers }) => {
    const authHeader = headers.authorization || ''
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const parts = authHeader.split(' ')
    if (parts.length !== 2) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const token = parts[1]
    try {
      const user = await verifyToken(token)
      if (!user || !user.id) {
        return { success: false, error: 'Unauthorized' }
      }
      
      const chats = await db.chat.getByUserId(user.id)
      return { success: true, data: chats }
    } catch (error) {
      return { success: false, error: 'Unauthorized' }
    }
  })
  .delete('/history', async ({ request, headers }) => {
    const authHeader = headers.authorization || ''
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const parts = authHeader.split(' ')
    if (parts.length !== 2) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const token = parts[1]
    try {
      const user = await verifyToken(token)
      if (!user || !user.id) {
        return { success: false, error: 'Unauthorized' }
      }
      
      await db.chat.deleteByUserId(user.id)
      return { success: true, message: 'Chat history deleted successfully' }
    } catch (error) {
      return { success: false, error: 'Failed to delete chat history' }
    }
  })
  .post('/', async ({ body }) => {
    const { id, messages, model, profile, userId } = body

    const coreMessages = convertToCoreMessages(messages)
    const result = await streamText({
      model: await openai(model),
      system: SYSTEM_PROMPT(null as any),
      messages: coreMessages,
      maxSteps: 3,
      tools,
      experimental_transform: smoothStream(),
      onFinish: async (stepResult) => {
        const existingChat = await db.chat.getById(id)
        if (existingChat) {
          await db.chat.update(id, { 
            messages: JSON.stringify(messages),
            profile
          })
        } else {
          await db.chat.create({
            id,
            createdAt: new Date(),
            messages: JSON.stringify(messages),
            profile,
            userId
          })
        }
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
      profile: t.String(),
      userId: t.String()
    })
  })
  .delete('/:id', async ({ params }) => {
    await db.chat.delete(params.id)
    return { success: true }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  .delete('/user/:userId', async ({ params }) => {
    await db.chat.deleteByUserId(params.userId)
    return { success: true }
  }, {
    params: t.Object({
      userId: t.String()
    })
  })

async function verifyToken(token: string) {
  try {
    // Implement your token verification logic here
    // This is a placeholder for actual token verification
    const payload = { id: token.split('-')[0] } // Example only
    return payload
  } catch (error) {
    return null
  }
}