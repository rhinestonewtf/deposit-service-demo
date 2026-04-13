import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('ok'))

const port = Number(process.env.PORT ?? 3001)

Bun.serve({ port, fetch: app.fetch })

console.log(`backend listening on http://localhost:${port}`)
