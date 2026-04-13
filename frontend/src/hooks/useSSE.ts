import { useEffect } from 'react'
import type { WebhookEvent } from '../types.ts'

// In dev, connect directly to the backend. Vite's dev-server proxy buffers SSE
// responses, so subsequent events don't reach the browser until the connection
// is closed. The backend enables CORS on /api/*.
const SSE_URL = import.meta.env.DEV
  ? `${window.location.protocol}//${window.location.hostname}:3001/api/events`
  : '/api/events'

export function useSSE(onEvent: (event: WebhookEvent) => void) {
  useEffect(() => {
    const source = new EventSource(SSE_URL)

    source.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as WebhookEvent
        if (event && typeof event.type === 'string') {
          onEvent(event)
        }
      } catch (err) {
        console.warn('failed to parse SSE event', err)
      }
    }

    source.onerror = () => {
      // The browser will auto-reconnect; nothing to do.
    }

    return () => source.close()
  }, [onEvent])
}
