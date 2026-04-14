// Maps a (CAIP-2 chain, token address) pair to a human-readable symbol.
// Extend the registry as new chains/tokens are added to the demo.
const registry: Record<string, Record<string, string>> = {
  'eip155:8453': {
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'USDC',
  },
}

export function tokenSymbol(chain: string, address: string): string | null {
  return registry[chain]?.[address.toLowerCase()] ?? null
}
