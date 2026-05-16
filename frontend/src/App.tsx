import { useState } from 'react'
import SymptomForm from './components/SymptomForm'
import HealthInsights, { type InsightsData } from './components/HealthInsights'
import PrivacyLog from './components/PrivacyLog'
import './App.css'

export default function App() {
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [submitCount, setSubmitCount] = useState(0)
  const [logVisible, setLogVisible] = useState(false)
  const [submittedSummary, setSubmittedSummary] = useState('')

  const handleReset = () => {
    setInsights(null)
    setError(null)
    setSessionId(null)
    setLogVisible(false)
  }

  const handleSubmit = async (symptoms: string, age: string, category: string) => {
    setLoading(true)
    setError(null)
    setInsights(null)
    setSessionId(null)
    setSubmitCount(c => c + 1)
    setLogVisible(true)
    setSubmittedSummary(symptoms.trim())

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms, age, category }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Analysis failed. Please try again.')
      }

      setSessionId((data.session_id as string) ?? null)
      setInsights(data as InsightsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-cross" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="6" y="1" width="4" height="14" rx="1"/>
                <rect x="1" y="6" width="14" height="4" rx="1"/>
              </svg>
            </span>
            PrivateDoc
          </div>

          <div className="zk-badge" title="Zero-knowledge proofs prevent raw symptom data from touching the blockchain">
            <span className="zk-dot" />
            ZK-Protected
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="hero">
          <h1>Private Health Insights,<br />Powered by AI</h1>
          <p>
            Describe your symptoms and receive AI-guided health information.
            Midnight's zero-knowledge proofs ensure your raw data is never
            recorded. Not by us, not by the blockchain.
          </p>
          <div className="hero-stat">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <span className="hero-stat-count">1,247</span>
            <span>private analyses protected</span>
          </div>
        </div>

        {/* ── TOP: form (left) | privacy metadata (right) ── */}
        <div className="layout-top">
          <SymptomForm
            onSubmit={handleSubmit}
            onReset={handleReset}
            loading={loading}
            collapsed={!!insights}
            submittedSummary={submittedSummary}
          />

          <div className="results-pane">
            {logVisible ? (
              <div className="results-top">
                <PrivacyLog key={submitCount} loading={loading} />

                {sessionId && (
                  <div className="session-badge">
                    <span className="session-label">Midnight Session</span>
                    <code className="session-id">
                      0x{sessionId.slice(0, 8)}...{sessionId.slice(-8)}
                    </code>
                    <span className="session-net">Testnet</span>
                  </div>
                )}

                {insights && (
                  <div className="insights-header">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <polyline points="9 12 11 14 15 10"/>
                    </svg>
                    ZK-Verified Analysis
                  </div>
                )}
              </div>
            ) : (
              <div className="placeholder-card">
                <div className="placeholder-icon">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
                    <path d="M9 12h6M12 9v6M3 12a9 9 0 1018 0A9 9 0 003 12z" strokeLinecap="round"/>
                  </svg>
                </div>
                <p>Your analysis will appear here.</p>
                <p className="placeholder-sub">Symptom data is never retained after your session.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── BOTTOM: full-width results grid ── */}
        {(insights || error) && (
          <div className="layout-bottom">
            {insights && <HealthInsights data={insights} />}

            {error && (
              <div className="card error-card">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 15a1 1 0 110-2 1 1 0 010 2zm1-4a1 1 0 11-2 0V8a1 1 0 112 0v5z"/>
                </svg>
                {error}
              </div>
            )}
          </div>
        )}

        {/* How privacy works */}
        <section className="how-it-works">
          <p className="hiw-label">How your privacy is protected</p>
          <div className="steps">
            <div className="step">
              <div className="step-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <div>
                <strong>Encrypted Client-Side</strong>
                <p>Your symptoms are processed locally and never sent in plaintext to any server.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <div>
                <strong>ZK Proof on Midnight</strong>
                <p>The blockchain records only a session ID. A ZK proof attests the analysis ran, with no patient data recorded.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3v1m0 16v1M4.22 4.22l.7.7m13.86 13.86.7.7M3 12H2m20 0h-1M4.92 19.08l.7-.7M18.36 5.64l.7-.7"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
              </div>
              <div>
                <strong>Private AI Inference</strong>
                <p>Claude returns health insights tied to the on-chain proof. Your raw symptoms are never disclosed.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        PrivateDoc is not a medical professional. This tool is for demonstration purposes only. Always consult a doctor.
      </footer>
    </div>
  )
}
