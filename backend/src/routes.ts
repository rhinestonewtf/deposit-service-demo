import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { streamSSE } from 'hono/streaming'

import { config } from './config.ts'
import type { ChainsResponse } from './deposit-service.ts'
import { listDeposits } from './deposit-service.ts'
import { broadcast, subscribe, type WebhookEvent } from './sse.ts'
import { verifySignature } from './webhook.ts'

interface State {
  depositAddress: string
  chains: ChainsResponse
}

export function createApp(state: State) {
  const app = new Hono()

  app.use('/api/*', cors())

  app.get('/api/config', (c) => {
    return c.json({
      depositAddress: state.depositAddress,
      targetChain: config.targetChain,
      targetToken: config.targetToken,
      recipient: config.recipient,
      chains: state.chains,
    })
  })

  app.get('/api/deposits', async (c) => {
    const result = await listDeposits(state.depositAddress)
    return c.json(result)
  })

  app.get('/api/events', (c) => {
    return streamSSE(c, async (stream) => {
      const unsubscribe = subscribe((event) => {
        stream.writeSSE({ data: JSON.stringify(event) })
      })
      stream.onAbort(() => unsubscribe())
      // Initial hello so the client knows the stream is live.
      await stream.writeSSE({ event: 'ready', data: '{}' })
      // Keep the stream open indefinitely.
      while (true) {
        await stream.sleep(30_000)
        await stream.writeSSE({ event: 'ping', data: '{}' })
      }
    })
  })

  app.post('/api/webhooks', async (c) => {
    const rawBody = await c.req.text()

    if (config.webhookSecret) {
      const signature = c.req.header('x-webhook-signature')
      if (!verifySignature(rawBody, signature, config.webhookSecret)) {
        return c.json({ error: 'invalid signature' }, 401)
      }
    }

    let event: WebhookEvent
    try {
      event = JSON.parse(rawBody) as WebhookEvent
    } catch {
      return c.json({ error: 'invalid json' }, 400)
    }

    // Webhooks are scoped to the API key, not to this demo's deposit address.
    // If the same key is reused elsewhere, drop events for other accounts so
    // they don't drive this UI.
    const account =
      typeof event.data === 'object' &&
      event.data !== null &&
      'account' in event.data
        ? String((event.data as { account: unknown }).account)
        : undefined

    if (account !== undefined && account !== state.depositAddress) {
      console.log(`[webhook] ${event.type} (skipped — account ${account})`)
      return c.json({ ok: true })
    }

    console.log(`[webhook] ${event.type}`)
    broadcast(event)
    return c.json({ ok: true })
  })

  return app
}
