import { useState } from 'react'

const EXAMPLES = [
  'I want more money flowing into my life every month',
  'I want to lose weight and feel confident in my body',
  'I want a loving, committed relationship',
  'I want to be calm and at peace with my life',
  'I want to grow my career and earn what I deserve',
]

function normalizeWish(text) {
  return text.trim().replace(/^[.\s]+|[.\s]+$/g, '').trim()
}

export default function WishForm({ onSubmit, isLoading, initialValue = '' }) {
  const [value, setValue] = useState(initialValue)
  const [touched, setTouched] = useState(false)
  const [focused, setFocused] = useState(false)

  const isEmpty = value.trim() === ''
  const showError = touched && isEmpty

  function handleSubmit(e) {
    e.preventDefault()
    setTouched(true)
    const normalized = normalizeWish(value)
    if (normalized) onSubmit(normalized)
  }

  function submitExample(example) {
    const normalized = normalizeWish(example)
    if (!normalized || isLoading) return
    setValue(example)
    onSubmit(normalized)
  }

  return (
    <form onSubmit={handleSubmit} className="home-form">

      {/* ── Gradient border shell → white inner core ── */}
      <div className={`home-card${focused ? ' home-card--focused' : ''}${showError ? ' home-card--error' : ''}`}>
        <div className="home-card-inner">

          {/* Textarea */}
          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={() => { setTouched(true); setFocused(false) }}
            onFocus={() => setFocused(true)}
            rows={5}
            disabled={isLoading}
            placeholder="Say it however it comes to you…"
            className="home-textarea"
            aria-label="Your wish"
          />

          {/* Footer bar — error left, CTA right */}
          <div className="home-card-footer">
            {showError
              ? <p className="home-field-error" role="alert">Write your wish first.</p>
              : <span />
            }
            <button
              type="submit"
              disabled={isLoading}
              className="home-submit-btn"
            >
              <span className="home-submit-label">
                {isLoading ? 'Shaping…' : 'Shape my wish'}
              </span>
              <span className="home-submit-icon" aria-hidden>
                {isLoading ? (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                    <path d="M6.5 1v1.5M6.5 10.5V12M1 6.5h1.5M10.5 6.5H12M2.7 2.7l1.06 1.06M9.24 9.24l1.06 1.06M2.7 10.3l1.06-1.06M9.24 3.76l1.06-1.06"/>
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6.5h9M8 3l3.5 3.5L8 10"/>
                  </svg>
                )}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* ── Example chips — compact wrapping row ── */}
      <div className="home-chips-wrap">
        <span className="home-chips-label">Try</span>
        <div className="home-chips">
          {EXAMPLES.map((example, i) => (
            <button
              key={example}
              type="button"
              disabled={isLoading}
              onClick={() => submitExample(example)}
              className="home-chip"
              style={{ animationDelay: `${i * 50 + 80}ms` }}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </form>
  )
}
