import { createElysia } from '../lib/utils'

export const chatRoutes = createElysia({ prefix: '/chat' })
  .get('/', () => {
    return { message: 'Hello World' }
  })