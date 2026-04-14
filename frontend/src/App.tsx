import { useCallback, useEffect, useMemo, useState } from 'react'
import { DepositAddress } from './components/DepositAddress.tsx'
import { DepositHistory } from './components/DepositHistory.tsx'
import { DepositStatus } from './components/DepositStatus.tsx'
import { useDeposits } from './hooks/useDeposits.ts'
import { useSSE } from './hooks/useSSE.ts'
import { tokenSymbol } from './lib/tokens.ts'
import type { AppConfig, ChainInfo, Deposit, LiveStatus } from './types.ts'

export function App() {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const { deposits, loading, refresh } = useDeposits()

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((body: AppConfig) => setConfig(body))
      .catch((err) => console.error('failed to load config', err))
  }, [])

  // Webhooks fire per-deposit with no global ordering guarantee, so use them
  // only as a refresh trigger and read live status from the newest deposit.
  // This way two in-flight deposits can't regress the stepper by event order.
  const onEvent = useCallback(() => {
    refresh()
  }, [refresh])

  useSSE(onEvent)

  const status = useMemo(() => deriveStatus(deposits[0]), [deposits])

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold">Rhinestone Deposit Demo</h1>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          {config ? (
            <>
              <DepositAddress address={config.depositAddress} />
              <ConfigSummary config={config} />
              <DepositStatus status={status} />
            </>
          ) : (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-500 shadow-sm">
              Loading configuration…
            </div>
          )}
        </section>

        {config && (
          <DepositHistory
            deposits={deposits}
            loading={loading}
            chains={config.chains}
          />
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-zinc-500">
          Powered by Rhinestone Deposit Service
        </div>
      </footer>
    </div>
  )
}

function deriveStatus(deposit: Deposit | undefined): LiveStatus {
  if (!deposit) return { kind: 'idle' }
  const at = deposit.completedAt ?? deposit.createdAt
  switch (deposit.status) {
    case 'pending':
      return { kind: 'received', at, txHash: deposit.txHash }
    case 'processing':
      return { kind: 'bridging', at, txHash: deposit.txHash }
    case 'completed':
      return { kind: 'complete', at, txHash: deposit.txHash }
    case 'failed':
      return { kind: 'failed', at }
  }
}

function ConfigSummary({ config }: { config: AppConfig }) {
  const targetChain = config.chains[config.targetChain]
  const sourceEntries = Object.entries(config.chains).filter(
    ([, info]: [string, ChainInfo]) => info.deposit,
  )
  const targetTokenSymbol =
    tokenSymbol(config.targetChain, config.targetToken) ?? config.targetToken

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-500">
        Configuration
      </h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-zinc-500">Target</dt>
        <dd className="font-medium">
          {targetTokenSymbol} on {targetChain?.name ?? config.targetChain}
        </dd>
        <dt className="text-zinc-500">Recipient</dt>
        <dd className="font-mono text-xs">{config.recipient}</dd>
        <dt className="text-zinc-500">Source chains</dt>
        <dd className="text-zinc-700">
          {sourceEntries.map(([, info]) => info.name).join(', ')}
        </dd>
      </dl>
    </div>
  )
}
