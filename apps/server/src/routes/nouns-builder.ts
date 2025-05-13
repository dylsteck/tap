import { createElysia } from '../lib/utils'
import { redis, checkKey, setKey } from '../lib/redis'
import { t } from 'elysia'
import { NounsBuilderProposalsResponse } from '@tap/common'

type ProposalsQuery = {
  dao_address: string;
  limit?: string;
  cursor?: string;
  status?: 'active' | 'pending' | 'completed' | 'all';
}

export const nounsBuilderRoutes = createElysia({ prefix: '/nouns-builder' })
  .get('/proposals', async ({ query }: { query: ProposalsQuery }) => {
    const { dao_address, limit = '25', cursor, status = 'all' } = query
    
    if (!dao_address) {
      throw new Error('DAO address parameter is required')
    }
    
    const cacheKey = `nouns_builder_proposals:${dao_address}:${status}:${limit}:${cursor || ''}`
    const cacheEx = 1800
    const cachedData = await checkKey(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    try {
      // Replace with actual implementation
      const data = { dao_address, status, results: [] } as NounsBuilderProposalsResponse
      
      await setKey(cacheKey, JSON.stringify(data), cacheEx)
      return data
    } catch (error) {
      throw new Error(`Failed to fetch proposals: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, {
    query: t.Object({
      dao_address: t.String(),
      limit: t.Optional(t.String({ default: '25' })),
      cursor: t.Optional(t.String()),
      status: t.Optional(t.Union([
        t.Literal('active'),
        t.Literal('pending'),
        t.Literal('completed'),
        t.Literal('all')
      ], { default: 'all' }))
    }),
    response: t.Any()
  })
