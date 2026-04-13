export interface WebhookEvent {
  version: string
  type: string
  time: string
  data: unknown
}

type Listener = (event: WebhookEvent) => void

const listeners = new Set<Listener>()

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function broadcast(event: WebhookEvent): void {
  for (const listener of listeners) {
    try {
      listener(event)
    } catch (error) {
      console.error('SSE listener error', error)
    }
  }
}
