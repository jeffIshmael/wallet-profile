# Wallet Profile Web

Next.js frontend for Wallet Profile — dashboard, landing page, wallet analysis UI, and API routes.

## Setup

```bash
npm install
cp .env.local.example .env   # add your Privy app ID
npm run dev
```

Runs at [http://localhost:3000](http://localhost:3000).

## Structure

```
src/
├── app/           # Next.js App Router pages & API routes
├── components/    # React components
├── data/          # Mock wallet data (dev)
├── hooks/
├── lib/
├── providers/
└── public/        # Static assets (Celo logo, etc.)
```

From the repo root you can also run `npm run dev` via npm workspaces.
