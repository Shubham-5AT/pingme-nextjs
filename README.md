# PingME — Privacy-First NFC Smart Tags

A Next.js 15 app with Firebase Auth, Firestore, and Razorpay payments.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Auth & DB**: Firebase Auth + Firestore
- **Styling**: Tailwind CSS + shadcn/ui
- **Payments**: Razorpay

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

Required variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
NEXT_PUBLIC_PAYMENT_API_BASE_URL=
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run lint` | Run ESLint |

## Deployment

This app requires a Node.js server. Recommended platforms:
- **Vercel** (recommended) — connect GitHub repo, add env vars, deploy
- **Railway** — connect GitHub repo, set build/start commands
- **Any VPS** — run `npm run build` then `npm run start`

> GoDaddy shared hosting is **not supported** — it requires Node.js runtime.
