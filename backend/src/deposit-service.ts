import { config } from './config.ts'

type Json = Record<string, unknown>

async function request<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: Json,
): Promise<T> {
  const response = await fetch(`${config.depositProcessorUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await response.text()
  if (!response.ok) {
    throw new Error(
      `Deposit service ${method} ${path} failed: ${response.status} ${text}`,
    )
  }
  return text ? (JSON.parse(text) as T) : (undefined as T)
}

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

export interface DepositListItem {
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

export interface ListDepositsResponse {
  deposits: DepositListItem[]
  nextCursor: string | null
}

export interface ManagedRegisterResponse {
  evmDepositAddress: string
  solanaDepositAddress?: string
}

export function getChains() {
  return request<ChainsResponse>('GET', '/chains')
}

export function listDeposits(account?: string) {
  const query = account ? `?account=${account}` : ''
  return request<ListDepositsResponse>('GET', `/deposits${query}`)
}

export function setup(chains: ChainsResponse) {
  // Sponsor gas, bridging, and swap fees on every chain that participates in a
  // deposit (source or destination). Real integrations may want to scope this
  // more tightly, but for a demo we eat all the costs so the user just sees
  // their funds arrive.
  const sponsorship: Record<
    string,
    { gas: 'all'; bridging: 'all'; swap: 'all' }
  > = {}
  for (const [id, info] of Object.entries(chains)) {
    if (info.deposit || info.destination) {
      sponsorship[id] = { gas: 'all', bridging: 'all', swap: 'all' }
    }
  }
  return request<{ message: string }>('POST', '/setup', {
    params: {
      webhookUrl: config.webhookUrl,
      webhookSecret: config.webhookSecret,
      sponsorship,
    },
  })
}

export function registerManaged() {
  return request<ManagedRegisterResponse>('POST', '/register-managed', {
    account: {
      salt: config.salt,
      target: {
        chain: config.targetChain,
        token: config.targetToken,
        recipient: config.recipient,
      },
    },
  })
}
