# Deposit Service Demo

Reference integration for the [Rhinestone Deposits API](https://docs.rhinestone.dev/deposits/overview).
A Bun + Hono backend proxies the API and verifies webhooks; a React + Vite
frontend shows the deposit address, live status, and history.

This is not the widget — it's a scoped example of how to wire deposits into your
own backend and UI.

## Architecture

```
Frontend (Vite, :5173) ── REST + SSE ──▶ Backend (Bun + Hono, :3001)
                                           ▲  │
                         webhooks (HMAC) ──┘  │  /setup, /register-managed,
                                              ▼  /deposits, /chains
                                         Deposit Service
```

The backend is stateless — state lives in the deposit service. On startup it
calls `GET /chains`, `POST /setup` (webhook + sponsorship), and
`POST /register-managed` to derive a deterministic deposit address from `SALT`.
Incoming webhooks are verified via HMAC and fanned out to browsers over SSE.

## Prerequisites

- [Bun](https://bun.com) 1.3+
- A Rhinestone API key
- A public webhook URL — use [ngrok](https://ngrok.com) or
  [cloudflared](https://github.com/cloudflare/cloudflared):
  ```bash
  ngrok http 3001
  ```

## Run

```bash
bun install
cp .env.example .env   # fill in API key, recipient, WEBHOOK_URL
bun run dev
```

Backend on `http://localhost:3001`, frontend on `http://localhost:5173`.
Send any supported token to the deposit address shown in the UI; status updates
appear in real time.

## Layout

```
backend/src/
  index.ts             startup sequence
  routes.ts            /api/config, /deposits, /events (SSE), /webhooks
  deposit-service.ts   typed API client
  sse.ts               SSE broadcast hub
  webhook.ts           HMAC verification
  config.ts            env validation

frontend/src/
  App.tsx
  components/          DepositAddress, DepositStatus, DepositHistory
  hooks/               useSSE, useDeposits
  lib/                 explorer (viem/chains), time, tokens
```

## Notes for integrators

- **Account model.** Uses `POST /register-managed` — the deposit service owns
  the smart account and derives its address from `SALT`. No wallet connection on
  the frontend. For user-owned accounts, use `POST /register` instead.
- **Sponsorship.** Gas, bridging, and swap fees are sponsored on every chain the
  service supports. Without this, small deposits can be eaten by bridging fees.
  See `backend/src/deposit-service.ts`.
- **Deposit scoping.** `GET /deposits` returns every deposit under your API key
  by default — pass `?account=<addr>` to scope it to one account.
- **SSE caveats.** `Bun.serve` has a 10s idle timeout (disabled via
  `idleTimeout: 0`), and Vite's dev proxy buffers `text/event-stream`, so the
  frontend's `EventSource` connects directly to the backend in dev.
