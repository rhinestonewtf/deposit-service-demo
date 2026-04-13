import { createHmac, timingSafeEqual } from 'node:crypto'

// Matches the deposit service's X-Webhook-Signature format: "sha256=<hex>".
export function verifySignature(
  rawBody: string,
  headerValue: string | undefined,
  secret: string,
): boolean {
  if (!headerValue) return false
  const [scheme, signature] = headerValue.split('=')
  if (scheme !== 'sha256' || !signature) return false

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(signature, 'hex')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
