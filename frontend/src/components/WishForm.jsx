import { useState } from 'react'

const EXAMPLES = [
  'I want more money flowing into my life every month',
  'I want to lose weight and feel confident and energetic in my body',
  'I want a loving, committed relationship with the right person',
  'I want to be happy, calm and at peace with my life',
  'I want to grow my career and earn what I truly deserve',
]

function normalizeWish(text) {
  return text.trim().replace(/^[.\s]+|[.\s]+$/g, '').trim()
}

export default function WishForm({ onSubmit, isLoading, initialValue = '' }) {
  const [value, setValue] = useState(initialValue)
  const [touched, setTouched] = useState(false)

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-xl">
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        rows={6}
        disabled={isLoading}
        placeholder="Write your wish however it comes to you…"
        className={`w-full max-w-prose mx-auto rounded-2xl border bg-white/90 p-4 text-base text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/35 resize-none transition-shadow duration-200 disabled:opacity-50 ${showError ? 'border-red-400/90' : 'border-stone-200/90'}`}
      />
      {showError && (
        <p className="text-sm text-red-700 -mt-1 text-center">Write your wish before continuing.</p>
      )}
      <div>
        <p className="text-xs font-medium text-stone-500 mb-2">Try a starting line</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(example => (
            <button
              key={example}
              type="button"
              disabled={isLoading}
              onClick={() => submitExample(example)}
              className="rounded-lg border border-stone-200/90 bg-white/70 px-3 py-1.5 text-xs font-medium text-stone-600 hover:border-primary/35 hover:text-primary hover:bg-primary-muted/50 transition-all duration-200 disabled:opacity-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 text-left text-pretty max-w-full"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="self-end rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 transition-all duration-200 active:scale-[0.98] shadow-md shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
      >
        {isLoading ? 'Shaping…' : 'Shape my wish'}
      </button>
    </form>
  )
}
