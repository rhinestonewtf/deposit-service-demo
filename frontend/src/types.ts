export interface ChainInfo {
  name: string
  testnet: boolean
  deposit: boolean
  destination: boolean
  supportedTokens:
    | 'all'
    | Array<{ symbol: string; address: string; decimals: number }>
}

export type ChainsResponse = Record<string, ChainInfo>

export interface AppConfig {
  depositAddress: string
  targetChain: string
  targetToken: string
  recipient: string
  chains: ChainsResponse
}

export interface Deposit {
  chain: string
  txHash: string
  token: string
  amount: string
  sender: string
  account: string
  targetChain: string
  targetToken: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  sourceTxHash: string | null
  destinationTxHash: string | null
  sourceAmount: string | null
  destinationAmount: string | null
  createdAt: string
  completedAt: string | null
}

export type WebhookType =
  | 'deposit-received'
  | 'bridge-started'
  | 'bridge-complete'
  | 'bridge-failed'
  | 'bridge-progress'
  | 'error'
  | string

export interface WebhookEvent {
  version: string
  type: WebhookType
  time: string
  data: Record<string, unknown>
}

export type LiveStatus =
  | { kind: 'idle' }
  | { kind: 'received'; at: string; txHash?: string }
  | { kind: 'bridging'; at: string; txHash?: string }
  | { kind: 'complete'; at: string; txHash?: string }
  | { kind: 'failed'; at: string }
