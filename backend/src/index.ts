import { config } from './config.ts'
import { getChains, registerManaged, setup } from './deposit-service.ts'
import { createApp } from './routes.ts'

async function main() {
  console.log('[startup] fetching supported chains...')
  const chains = await getChains()

  console.log('[startup] configuring webhook + sponsorship...')
  await setup(chains)

  console.log('[startup] registering managed account...')
  const { evmDepositAddress } = await registerManaged()
  console.log(`[startup] deposit address: ${evmDepositAddress}`)

  const app = createApp({ depositAddress: evmDepositAddress, chains })

  Bun.serve({
    port: config.port,
    fetch: app.fetch,
    // 0 disables the default 10s idle timeout so SSE streams stay open.
    idleTimeout: 0,
  })

  console.log(`[startup] backend listening on http://localhost:${config.port}`)
}

main().catch((error) => {
  console.error('[startup] failed:', error)
  process.exit(1)
})
