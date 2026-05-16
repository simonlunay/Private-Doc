import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { randomBytes } from 'crypto'
import dotenv from 'dotenv'

// Load .env from project root regardless of where npm run is invoked
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../../.env') })

import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json())

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })

const SYSTEM_PROMPT = `You are PrivateDoc, a privacy-preserving AI health assistant that provides general health information based on reported symptoms. You operate within a zero-knowledge proof system — no raw patient data is stored or logged.

Always respond with valid JSON in exactly this shape:
{
  "possible_conditions": [
    { "name": string, "description": string, "likelihood": "high" | "medium" | "low" }
  ],
  "urgency_level": "emergency" | "urgent" | "routine" | "self-care",
  "recommendations": string[],
  "self_care": string[],
  "seek_care_if": string[],
  "emergency_signs": string[],
  "general_advice": string,
  "disclaimer": string
}

Rules:
- possible_conditions: list from most to least likely, max 4
- urgency_level: choose exactly one —
    "emergency"  → go to ER / call 911 immediately
    "urgent"     → see a doctor within 24 hours
    "routine"    → schedule an appointment in the next few days
    "self-care"  → manageable at home with rest and OTC remedies
- recommendations: 3-5 clear, actionable next steps tailored to the urgency level
- self_care: practical home-care steps (omit if urgency is "emergency")
- seek_care_if: specific signs that warrant a doctor visit within 24-72 hours
- emergency_signs: symptoms requiring immediate ER/911 care
- general_advice: one concise paragraph of overall guidance
- disclaimer: always include "This is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment."
- When a symptom_category is provided, focus analysis on conditions within that body system first, then note other possibilities only if the symptoms strongly suggest them
- Keep language accessible to non-medical audiences
- Never diagnose definitively — use "may indicate", "could be", "is consistent with"`

const CATEGORY_LABELS: Record<string, string> = {
  head:    'Head & Neurological',
  chest:   'Chest & Respiratory',
  stomach: 'Stomach & Digestive',
  skin:    'Skin & Allergies',
  muscles: 'Muscles & Joints',
  other:   'General / Other',
}

interface AnalyzeRequest {
  symptoms: string
  age?: string
  category?: string
}

app.post('/api/analyze', async (req, res) => {
  const { symptoms, age, category } = req.body as AnalyzeRequest

  if (!symptoms?.trim()) {
    res.status(400).json({ error: 'Symptoms are required' })
    return
  }

  const parts: string[] = []
  if (category && category !== 'other') {
    parts.push(`symptom_category: ${CATEGORY_LABELS[category] ?? category}`)
  }
  if (age) parts.push(`patient_age: ${age}`)
  parts.push(`symptoms: ${symptoms.trim()}`)
  const userMessage = parts.join('\n')

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1280,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userMessage }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Claude did not return valid JSON')
    }

    res.json({
      ...JSON.parse(jsonMatch[0]),
      session_id: randomBytes(16).toString('hex'),
    })
  } catch (err) {
    console.error('Analysis error:', err)
    res.status(500).json({ error: 'Failed to analyze symptoms. Please try again.' })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'PrivateDoc API' })
})

app.listen(PORT, () => {
  console.log(`PrivateDoc server running on http://localhost:${PORT}`)
})
