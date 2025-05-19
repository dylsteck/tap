import cors from '@elysiajs/cors'
import { Elysia } from 'elysia'
import swagger from '@elysiajs/swagger'
import { opentelemetry } from '@elysiajs/opentelemetry'
import { Logestic } from 'logestic'

import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { SERVER_BASE_URL } from '@tap/common'

export const BASE_URL = SERVER_BASE_URL

const instrumentation = opentelemetry({
  spanProcessors: [
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: 'https://api.axiom.co/v1/traces', 
        headers: {
          Authorization: `Bearer ${Bun.env.AXIOM_TOKEN}`, 
          'X-Axiom-Dataset': Bun.env.AXIOM_DATASET!
        } 
      })
    )
  ]
})

const swaggerConfig = swagger({
  documentation: {
      info: {
          title: 'Tap API Docs',
          version: '0.0.1',
      }
  },
  path: '/docs'
})

export const createElysia = (config?: ConstructorParameters<typeof Elysia>[0]) =>
  new Elysia(config)
    .use(cors())
    .use(Logestic.preset('common'))
    .use(instrumentation)
    .use(swaggerConfig)
    .onError(({ server, error, path }) => {
      console.error(path, error)
      if (error.message.toLowerCase().includes('out of memory')) {
        server?.stop()
        process.exit(1)
      }
    })
