import { useState } from 'react'
import type { ReactNode } from 'react'

interface Category {
  id: string
  label: string
  icon: ReactNode
}

const CATEGORIES: Category[] = [
  {
    id: 'head',
    label: 'Head & Neurological',
    icon: (
      // EEG/pulse wave — reads instantly as neurological
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    id: 'chest',
    label: 'Chest & Respiratory',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    id: 'stomach',
    label: 'Stomach & Digestive',
    icon: (
      // Pill shape with divider — pharmaceutical/digestive
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m10.5 20.5-7-7a4.95 4.95 0 0 1 7-7l7 7a4.95 4.95 0 0 1-7 7z"/>
        <line x1="8.5" y1="12.5" x2="15.5" y2="5.5"/>
      </svg>
    ),
  },
  {
    id: 'skin',
    label: 'Skin & Allergies',
    icon: (
      // Sun rays — skin sensitivity / UV / rash
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
      </svg>
    ),
  },
  {
    id: 'muscles',
    label: 'Muscles & Joints',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="8" width="4" height="8" rx="1"/>
        <rect x="18" y="8" width="4" height="8" rx="1"/>
        <line x1="6" y1="12" x2="18" y2="12"/>
        <line x1="9" y1="9" x2="9" y2="15"/>
        <line x1="15" y1="9" x2="15" y2="15"/>
      </svg>
    ),
  },
  {
    id: 'other',
    label: 'Other',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>
      </svg>
    ),
  },
]

interface Props {
  onSubmit: (symptoms: string, age: string, category: string) => void
  onReset: () => void
  loading: boolean
  collapsed: boolean
  submittedSummary: string
}

export default function SymptomForm({ onSubmit, onReset, loading, collapsed, submittedSummary }: Props) {
  const [category, setCategory] = useState('other')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    onSubmit(
      (data.get('symptoms') as string) ?? '',
      (data.get('age') as string) ?? '',
      category,
    )
  }

  if (collapsed) {
    return (
      <div className="card form-card form-card-collapsed">
        <div className="form-header">
          <h2>Describe Your Symptoms</h2>
          <p className="form-subtitle">Your data never leaves this session unencrypted.</p>
        </div>
        <div className="form-summary">
          <p className="form-summary-label">Analyzed</p>
          <p className="form-summary-text">{submittedSummary}</p>
        </div>
        <button type="button" className="btn-analyze-again" onClick={onReset}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
          </svg>
          Analyze Again
        </button>
      </div>
    )
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>Describe Your Symptoms</h2>
        <p className="form-subtitle">Your data never leaves this session unencrypted.</p>
      </div>

      {/* Category selector */}
      <fieldset className="category-fieldset" disabled={loading}>
        <legend className="category-legend">
          Symptom Category
          <span className="optional"> (helps target the analysis)</span>
        </legend>
        <div className="category-grid">
          {CATEGORIES.map(cat => (
            <label
              key={cat.id}
              className={`category-pill${category === cat.id ? ' category-pill-active' : ''}`}
            >
              <input
                type="radio"
                name="category"
                value={cat.id}
                checked={category === cat.id}
                onChange={() => setCategory(cat.id)}
              />
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-label">{cat.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="symptoms">What symptoms are you experiencing?</label>
        <textarea
          id="symptoms"
          name="symptoms"
          required
          rows={5}
          placeholder="e.g. Headache behind the eyes for 2 days, mild fever, fatigue, runny nose..."
          disabled={loading}
        />
      </div>

      <div className="field">
        <label htmlFor="age">Age <span className="optional">(optional)</span></label>
        <input
          id="age"
          name="age"
          type="number"
          min="1"
          max="120"
          placeholder="e.g. 34"
          disabled={loading}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner" />
            Analyzing privately...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Analyze Privately
          </>
        )}
      </button>
    </form>
  )
}
