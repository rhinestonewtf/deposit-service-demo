import { useEffect, useState } from 'react'
import type { ChainsResponse, Deposit } from '../types.ts'
import { explorerTxUrl } from '../lib/explorer.ts'
import { timeAgo } from '../lib/time.ts'

interface Props {
  deposits: Deposit[]
  loading: boolean
  chains: ChainsResponse
}

function chainName(chains: ChainsResponse, id: string): string {
  return chains[id]?.name ?? id
}

function shortHash(hash: string): string {
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`
}

function StatusBadge({ status }: { status: Deposit['status'] }) {
  const styles: Record<Deposit['status'], string> = {
    pending: 'bg-zinc-100 text-zinc-700',
    processing: 'bg-blue-50 text-blue-700',
    completed: 'bg-emerald-50 text-emerald-700',
    failed: 'bg-red-50 text-red-700',
  }
  const label: Record<Deposit['status'], string> = {
    pending: 'Pending',
    processing: 'Bridging',
    completed: 'Complete',
    failed: 'Failed',
  }
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {label[status]}
    </span>
  )
}

export function DepositHistory({ deposits, loading, chains }: Props) {
  // Tick every 30s so relative times stay fresh.
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <aside className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-500">
        Deposit History
      </h2>

      {loading && <p className="text-sm text-zinc-500">Loading…</p>}

      {!loading && deposits.length === 0 && (
        <p className="text-sm text-zinc-500">No deposits yet.</p>
      )}

      <ul className="space-y-3">
        {deposits.map((d) => {
          // Prefer the destination tx (the bridge output on the target chain).
          // Fall back to the source deposit tx while the bridge is in flight.
          const showingDestination = d.destinationTxHash !== null
          const hash = d.destinationTxHash ?? d.txHash
          const chain = showingDestination ? d.targetChain : d.chain
          const txUrl = explorerTxUrl(chain, hash)
          return (
            <li
              key={d.txHash}
              className="rounded-md border border-zinc-100 p-3 text-sm"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className="text-xs text-zinc-500"
                  title={new Date(d.createdAt).toLocaleString()}
                >
                  {timeAgo(d.createdAt)}
                </span>
                <StatusBadge status={d.status} />
              </div>
              <div className="mt-1 text-zinc-700">
                {chainName(chains, d.chain)} →{' '}
                {chainName(chains, d.targetChain)}
              </div>
              <div className="mt-1 flex items-baseline gap-2 font-mono text-xs">
                {txUrl ? (
                  <a
                    href={txUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {shortHash(hash)} ↗
                  </a>
                ) : (
                  <span className="text-zinc-500">{shortHash(hash)}</span>
                )}
                {!showingDestination && (
                  <span className="font-sans text-[10px] uppercase tracking-wide text-zinc-400">
                    Deposit
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
