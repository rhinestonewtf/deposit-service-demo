import { useCallback, useEffect, useState } from 'react'
import type { Deposit } from '../types.ts'

interface State {
  deposits: Deposit[]
  loading: boolean
  error: string | null
}

export function useDeposits() {
  const [state, setState] = useState<State>({
    deposits: [],
    loading: true,
    error: null,
  })

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/deposits')
      if (!res.ok) throw new Error(`GET /api/deposits -> ${res.status}`)
      const body = (await res.json()) as { deposits: Deposit[] }
      setState({ deposits: body.deposits ?? [], loading: false, error: null })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      }))
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { ...state, refresh }
}
