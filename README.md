# PrivateDoc

**A privacy-preserving AI symptom checker that uses zero-knowledge proofs on the Midnight blockchain, so patient data never touches the public ledger.**

Built in 48 hours. Symptoms are processed as a private witness inside a Midnight ZK circuit, so only a session ID is ever written on-chain, while Claude generates structured health guidance.

![Demo](https://www.youtube.com/watch?v=3NScEWbn9F4)
<!-- Replace with a 10 to 15 second GIF: enter symptoms, show the ZK proof pipeline animation, then the results grid with the session ID -->

> **No hosted demo.** The app runs on my own Claude API key, so there's no public instance. You can run it locally with your own key (see [Run it yourself](#run-it-yourself)).

---

## How it works

1. **Input.** The user describes symptoms, age, and a body-area category.
2. **Zero-knowledge proof.** A Compact smart contract runs a Midnight circuit that takes the symptoms as a private witness. Only a `sessionId` is disclosed and written to the public ledger, with no patient data on-chain.
3. **AI inference.** The Express backend sends the symptoms to the Claude API and returns structured insights: possible conditions, urgency level, recommendations, self-care steps, when to seek care, and emergency warning signs.
4. **Verification.** The frontend shows the insights alongside the Midnight session ID, with an animated view of each step in the proof pipeline.

## Architecture

```
┌──────────────────────────┐
│  React + Vite frontend   │
│  SymptomForm · PrivacyLog│
│  HealthInsights          │
└────────────┬─────────────┘
             │ POST /api/analyze
┌────────────▼─────────────┐        ┌──────────────────────────┐
│   Express backend        │───────▶│  Midnight ZK circuit     │
│   (Node, TypeScript)     │        │  symptoms = private      │
└────────────┬─────────────┘        │  witness → sessionId     │
             │                      │  only on public ledger   │
┌────────────▼─────────────┐        └──────────────────────────┘
│   Claude API             │
│   structured JSON output │
└──────────────────────────┘
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| Backend | Express, Node.js, TypeScript |
| AI | Claude API with structured JSON responses |
| Privacy | Midnight blockchain, Compact zero-knowledge smart contracts |
| Infrastructure | Docker Compose local devnet (node, indexer, proof server) |

## API

`POST /api/analyze`

```json
{
  "symptoms": "headache and mild fever for two days",
  "age": "34",
  "category": "head"
}
```

Returns `possible_conditions`, `urgency_level`, `recommendations`, `self_care`, `seek_care_if`, `emergency_signs`, `general_advice`, `disclaimer`, and `session_id`.

Valid categories: `head`, `chest`, `stomach`, `skin`, `muscles`, `other`.

---

## Run it yourself

**Requirements:** Node 22 and a Claude API key. Docker (Compose v2) and the Compact compiler are only needed for the ZK contract devnet.

Create a `.env` at the project root:

```env
CLAUDE_API_KEY=sk-ant-...
```

Then, in two terminals:

```bash
npm run dev:server     # backend on :3001
npm run dev:frontend   # frontend on :5173
```

Open http://localhost:5173. The frontend proxies `/api` to the backend.

<details>
<summary><b>Midnight devnet (ZK contract)</b></summary>

```bash
npm install
npm run setup      # starts local devnet, compiles and deploys the contract
npm run test:e2e   # smoke test against the deployed contract
docker compose down -v   # tear down
```

The local devnet uses a well-known genesis seed. Never use it against Preprod, mainnet, or anything that handles real value.
</details>

## Project structure

```
Private-Doc/
├── contracts/
│   └── symptom-checker.compact   # Midnight ZK smart contract
├── frontend/src/components/
│   ├── SymptomForm.tsx           # Symptom input and category selector
│   ├── PrivacyLog.tsx            # Animated ZK proof pipeline
│   └── HealthInsights.tsx        # Results grid
├── server/src/index.ts           # Express API and Claude integration
└── docker-compose.yml            # Local Midnight devnet
```

## Disclaimer

PrivateDoc is a hackathon demo, not a medical device or a substitute for professional care. Always consult a qualified healthcare provider.

---

Built by [Simon Lunay](https://www.simonlunay.com) · [LinkedIn](https://www.linkedin.com/in/simonlunay)
