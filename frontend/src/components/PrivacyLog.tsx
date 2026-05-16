import { useState, useEffect, useRef } from 'react'

const STEPS = [
  'Symptoms encrypted locally',
  'ZK proof generated on Midnight',
  'AI queried anonymously',
  'Analysis complete',
]

// Delays (ms) at which steps 0-2 become checked.
// Step 3 is triggered by the real API response, not a timer.
const TIMERS = [400, 1050, 1900]

interface Props {
  loading: boolean
}

export default function PrivacyLog({ loading }: Props) {
  const [count, setCount] = useState(0)
  const finalShown = useRef(false)

  // Steps 0-2: fixed timers from mount
  useEffect(() => {
    const handles = TIMERS.map((ms, i) =>
      setTimeout(() => setCount(c => Math.max(c, i + 1)), ms),
    )
    return () => handles.forEach(clearTimeout)
  }, [])

  // Step 3: show when API returns AND the third step is already visible
  useEffect(() => {
    if (!loading && count >= 3 && !finalShown.current) {
      finalShown.current = true
      const t = setTimeout(() => setCount(4), 280)
      return () => clearTimeout(t)
    }
  }, [loading, count])

  return (
    <div className="privacy-log card">
      <p className="privacy-log-label">Privacy Pipeline</p>
      <ul className="privacy-log-steps">
        {/* Checked steps */}
        {STEPS.slice(0, count).map((step, i) => (
          <li key={i} className="log-step log-step-done">
            <span className="log-check" aria-hidden="true">✓</span>
            <span>{step}</span>
          </li>
        ))}

        {/* Pending step (spinner + next label) */}
        {count < 4 && (
          <li className="log-step log-step-pending">
            <span className="log-spinner" aria-hidden="true" />
            <span>{STEPS[count]}</span>
          </li>
        )}
      </ul>
    </div>
  )
}
