import type { LiveStatus } from '../types.ts'

interface Props {
  status: LiveStatus
}

type StepKey = 'received' | 'bridging' | 'complete'

const steps: Array<{ key: StepKey; label: string }> = [
  { key: 'received', label: 'Deposit received' },
  { key: 'bridging', label: 'Bridging' },
  { key: 'complete', label: 'Complete' },
]

function stepState(
  step: StepKey,
  status: LiveStatus,
): 'done' | 'active' | 'idle' {
  const order: StepKey[] = ['received', 'bridging', 'complete']
  const current =
    status.kind === 'received'
      ? 'received'
      : status.kind === 'bridging'
        ? 'bridging'
        : status.kind === 'complete'
          ? 'complete'
          : null

  if (!current) return 'idle'
  const stepIdx = order.indexOf(step)
  const currentIdx = order.indexOf(current)
  if (stepIdx < currentIdx) return 'done'
  if (stepIdx === currentIdx) return status.kind === 'complete' ? 'done' : 'active'
  return 'idle'
}

export function DepositStatus({ status }: Props) {
  const failed = status.kind === 'failed'
  const idle = status.kind === 'idle'

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-500">
        Live Status
      </h2>

      {idle && (
        <p className="text-sm text-zinc-500">
          Waiting for a deposit. Send tokens to the address above from any
          supported source chain.
        </p>
      )}

      {failed && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Deposit failed.
        </div>
      )}

      {!idle && !failed && (
        <ol className="space-y-3">
          {steps.map((step) => {
            const s = stepState(step.key, status)
            return (
              <li key={step.key} className="flex items-center gap-3">
                <StepDot state={s} />
                <span
                  className={
                    s === 'idle'
                      ? 'text-zinc-400'
                      : s === 'active'
                        ? 'font-medium text-zinc-900'
                        : 'text-zinc-700'
                  }
                >
                  {step.label}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

function StepDot({ state }: { state: 'done' | 'active' | 'idle' }) {
  if (state === 'done') {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] text-white">
        ✓
      </span>
    )
  }
  if (state === 'active') {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center">
        <span className="h-3 w-3 animate-pulse rounded-full bg-blue-600" />
      </span>
    )
  }
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center">
      <span className="h-3 w-3 rounded-full border border-zinc-300" />
    </span>
  )
}
