const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function timeAgo(iso: string, now: number = Date.now()): string {
  const ms = now - new Date(iso).getTime()
  const s = Math.round(ms / 1000)
  if (Math.abs(s) < 60) return rtf.format(-s, 'second')
  const m = Math.round(s / 60)
  if (Math.abs(m) < 60) return rtf.format(-m, 'minute')
  const h = Math.round(m / 60)
  if (Math.abs(h) < 24) return rtf.format(-h, 'hour')
  const d = Math.round(h / 24)
  return rtf.format(-d, 'day')
}
