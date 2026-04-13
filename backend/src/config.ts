function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function optional(name: string): string | undefined {
  const value = process.env[name]
  return value && value.length > 0 ? value : undefined
}

export const config = {
  depositProcessorUrl: required('DEPOSIT_PROCESSOR_URL'),
  apiKey: required('RHINESTONE_API_KEY'),
  targetChain: required('TARGET_CHAIN'),
  targetToken: required('TARGET_TOKEN'),
  recipient: required('RECIPIENT'),
  salt: required('SALT'),
  webhookUrl: required('WEBHOOK_URL'),
  webhookSecret: optional('WEBHOOK_SECRET'),
  port: Number(process.env.PORT ?? 3001),
}

export type Config = typeof config
