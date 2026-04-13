import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface Props {
  address: string
}

export function DepositAddress({ address }: Props) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-500">
        Deposit Address
      </h2>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="rounded-md bg-white p-2 ring-1 ring-zinc-200">
          <QRCodeSVG value={address} size={144} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <code className="break-all rounded-md bg-zinc-100 px-3 py-2 font-mono text-sm text-zinc-800">
            {address}
          </code>
          <button
            type="button"
            onClick={onCopy}
            className="self-start rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
