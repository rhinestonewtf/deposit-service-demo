import * as chains from 'viem/chains'
import type { Chain } from 'viem'

const byId = new Map<number, Chain>()
for (const value of Object.values(chains)) {
  if (value && typeof value === 'object' && 'id' in value) {
    byId.set((value as Chain).id, value as Chain)
  }
}

function chainIdFromCaip(caip2: string): number | null {
  const id = Number(caip2.split(':')[1])
  return Number.isFinite(id) ? id : null
}

export function explorerTxUrl(caip2: string, txHash: string): string | null {
  const id = chainIdFromCaip(caip2)
  if (id === null) return null
  const url = byId.get(id)?.blockExplorers?.default?.url
  return url ? `${url}/tx/${txHash}` : null
}
