import { createElysia } from '../lib/utils'
import { t } from 'elysia'
import { db } from '../db'

export const userRoutes = createElysia({ prefix: '/user' })
  .get('/:id', async ({ params }) => {
    const user = await db.user.getById(params.id)
    if (!user) {
      return { success: false, error: 'User not found' }
    }
    return { success: true, data: user }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  .get('/fid/:fid', async ({ params }) => {
    const user = await db.user.getByFid(params.fid)
    if (!user) {
      return { success: false, error: 'User not found' }
    }
    return { success: true, data: user }
  }, {
    params: t.Object({
      fid: t.String()
    })
  })
  .get('/username/:username', async ({ params }) => {
    const user = await db.user.getByUsername(params.username)
    if (!user) {
      return { success: false, error: 'User not found' }
    }
    return { success: true, data: user }
  }, {
    params: t.Object({
      username: t.String()
    })
  })
  .post('/', async ({ body }) => {
    const user = await db.user.create(body)
    return { success: true, data: user }
  }, {
    body: t.Object({
      id: t.String(),
      fid: t.String(),
      username: t.String(),
      name: t.Optional(t.String()),
      bio: t.Optional(t.String()),
      verified_address: t.Optional(t.String()),
      pfp_url: t.Optional(t.String())
    })
  })
  .put('/:id', async ({ params, body }) => {
    const user = await db.user.update(params.id, body)
    return { success: true, data: user }
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      fid: t.Optional(t.String()),
      username: t.Optional(t.String()),
      name: t.Optional(t.String()),
      bio: t.Optional(t.String()),
      verified_address: t.Optional(t.String()),
      pfp_url: t.Optional(t.String())
    })
  })
  .delete('/:id', async ({ params }) => {
    await db.user.delete(params.id)
    return { success: true }
  }, {
    params: t.Object({
      id: t.String()
    })
  })