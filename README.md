# PrivateDoc

A privacy-preserving AI health symptom checker built on the Midnight blockchain. Describe your symptoms and receive AI-guided health information — zero-knowledge proofs ensure your raw data is never recorded on-chain.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Backend | Express + Node |
| AI | Claude API (`claude-sonnet-4-6`) |
| Privacy | Midnight blockchain + Compact ZK smart contracts |

---

## Prerequisites

- Node 22
- A `.env` file at the project root containing your Claude API key:

```
CLAUDE_API_KEY=sk-ant-...
```

---

## Running the app

Open two terminals from the project root.

**Terminal 1 — backend (port 3001):**
```bash
npm run dev:server
```

**Terminal 2 — frontend (port 5173):**
```bash
npm run dev:frontend
```

Then open `http://localhost:5173`. The frontend proxies `/api` requests to the backend automatically.

The frontend dev server runs with `--host`, so it's also accessible on your local network at the IP address Vite prints on startup.

### Root-level dev scripts

| Script | Description |
|---|---|
| `npm run dev:frontend` | Start the Vite dev server (`frontend/`) |
| `npm run dev:server` | Start the Express backend (`server/`) with ts-node |

---

## Project structure

```
privatedoc/
├── contracts/
│   └── symptom-checker.compact   # Midnight ZK smart contract (do not modify)
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── HealthInsights.tsx  # Results grid (urgency, conditions, etc.)
│   │   │   ├── PrivacyLog.tsx      # Animated ZK proof pipeline steps
│   │   │   └── SymptomForm.tsx     # Symptom input + category selector
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
├── server/
│   ├── src/
│   │   └── index.ts               # Express API + Claude integration
│   └── package.json
├── .env                           # CLAUDE_API_KEY (gitignored)
└── package.json
```

---

## How it works

1. **Client-side** — symptoms are never sent in plaintext; the app simulates local encryption before submission.
2. **ZK proof** — `contracts/symptom-checker.compact` runs a Midnight circuit that takes symptoms as a private witness. Only a `sessionId` is disclosed and written to the public ledger — no patient data on-chain.
3. **AI inference** — the Express backend calls the Claude API with the symptoms and returns structured health insights (possible conditions, urgency level, recommendations, etc.).
4. **Response** — the frontend displays the insights alongside the Midnight session ID, proving the analysis ran without exposing the input.

### API

`POST /api/analyze`

```json
{
  "symptoms": "headache and mild fever for two days",
  "age": "34",
  "category": "head"
}
```

Returns a JSON object with `possible_conditions`, `urgency_level`, `recommendations`, `self_care`, `seek_care_if`, `emergency_signs`, `general_advice`, `disclaimer`, and `session_id`.

Valid `category` values: `head`, `chest`, `stomach`, `skin`, `muscles`, `other`.

---

## Midnight devnet (ZK contract development)

The Compact contract in `contracts/` was scaffolded with `create-mn-app`. To compile and deploy it locally you need Docker (Compose v2) and the Compact compiler.

```bash
npm install
npm run setup      # starts local devnet, compiles contract, deploys
npm run test:e2e   # smoke check against deployed contract
```

`npm run setup` starts a local Midnight devnet (node + indexer + proof-server via Docker), compiles the contract, and deploys it.

Tear down the devnet:
```bash
docker compose down -v
```

> **Warning:** The local devnet uses a well-known genesis seed (`0000…0001`). Do not use it against Preprod, mainnet, or any environment that handles real value.

---

## Disclaimer

PrivateDoc is not a medical professional. This tool is for demonstration purposes only. Always consult a qualified healthcare provider.
