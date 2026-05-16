interface Condition {
  name: string
  description: string
  likelihood: 'high' | 'medium' | 'low'
}

export interface InsightsData {
  possible_conditions: Condition[]
  urgency_level: 'emergency' | 'urgent' | 'routine' | 'self-care'
  recommendations: string[]
  self_care: string[]
  seek_care_if: string[]
  emergency_signs: string[]
  general_advice: string
  disclaimer: string
}

interface Props {
  data: InsightsData
}

const likelihoodLabel: Record<string, string> = {
  high: 'Likely',
  medium: 'Possible',
  low: 'Less likely',
}

const urgencyConfig = {
  emergency: {
    label: 'Seek Emergency Care Immediately',
    sub: 'Call 911 or go to the nearest emergency room now.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 15a1 1 0 110-2 1 1 0 010 2zm1-4a1 1 0 11-2 0V8a1 1 0 112 0v5z"/>
      </svg>
    ),
  },
  urgent: {
    label: 'See a Doctor Today',
    sub: 'Your symptoms warrant medical attention within 24 hours.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  routine: {
    label: 'Schedule an Appointment',
    sub: 'Consider seeing a healthcare provider within the next few days.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  'self-care': {
    label: 'Manageable at Home',
    sub: 'Rest and self-care are appropriate for these symptoms.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
}

export default function HealthInsights({ data }: Props) {
  const urgency = urgencyConfig[data.urgency_level] ?? urgencyConfig['routine']

  const hasSelfCare   = data.self_care.length > 0
  const hasSeekCare   = data.seek_care_if.length > 0
  const hasEmergency  = data.emergency_signs.length > 0
  const hasBottomRow  = hasSelfCare || hasSeekCare || hasEmergency

  return (
    <div className="insights">
      {/* ── Row 1: Urgency banner — full width ── */}
      <div className={`urgency-banner urgency-${data.urgency_level}`}>
        <div className="urgency-icon">{urgency.icon}</div>
        <div className="urgency-text">
          <strong>{urgency.label}</strong>
          <p>{urgency.sub}</p>
        </div>
      </div>

      {/* ── Row 2: Conditions + Recommendations — 2 columns ── */}
      <div className="insights-2col">
        {data.possible_conditions.length > 0 && (
          <section className="insight-section">
            <h3>Possible Conditions</h3>
            <div className="conditions-list">
              {data.possible_conditions.map((c, i) => (
                <div key={i} className="condition-card">
                  <div className="condition-top">
                    <span className="condition-name">{c.name}</span>
                    <span className={`likelihood-badge likelihood-${c.likelihood}`}>
                      {likelihoodLabel[c.likelihood]}
                    </span>
                  </div>
                  <p className="condition-desc">{c.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.recommendations.length > 0 && (
          <section className="insight-section">
            <h3>Recommendations</h3>
            <ol className="recommendations-list">
              {data.recommendations.map((r, i) => (
                <li key={i}><span>{r}</span></li>
              ))}
            </ol>
          </section>
        )}
      </div>

      {/* ── Row 3: Self-Care / See Doctor / Emergency — 3 columns ── */}
      {hasBottomRow && (
        <div className="insights-3col">
          {hasSelfCare && (
            <section className="insight-section">
              <h3>Self-Care Steps</h3>
              <ul className="bullet-list">
                {data.self_care.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </section>
          )}

          {hasSeekCare && (
            <section className="insight-section">
              <div className="section-banner banner-warning">
                <h3>See a Doctor If...</h3>
              </div>
              <ul className="bullet-list">
                {data.seek_care_if.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </section>
          )}

          {hasEmergency && (
            <section className="insight-section">
              <div className="section-banner banner-danger">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 15a1 1 0 110-2 1 1 0 010 2zm1-4a1 1 0 11-2 0V8a1 1 0 112 0v5z"/>
                </svg>
                <h3>Emergency Warning Signs</h3>
              </div>
              <ul className="bullet-list bullet-danger">
                {data.emergency_signs.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* ── Row 4: General Advice — full width ── */}
      {data.general_advice && (
        <section className="insight-section insight-section-full">
          <h3>General Advice</h3>
          <p className="general-advice-text">{data.general_advice}</p>
        </section>
      )}

      <p className="disclaimer-text">{data.disclaimer}</p>
    </div>
  )
}
