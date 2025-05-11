import { createElysia } from '../utils'

export const farcasterRoutes = createElysia({ prefix: '/farcaster' })
  .get('/', () => {
    return { message: 'Hello World' }
  })
