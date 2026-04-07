import { useState } from 'react'

const EXAMPLES = [
  'I want more money flowing into my life every month',
  'I want to lose weight and feel confident and energetic in my body',
  'I want a loving, committed relationship with the right person',
  'I want to be happy, calm and at peace with my life',
  'I want to grow my career and earn what I truly deserve',
]

export default function WishForm({ onSubmit, isLoading, initialValue = '' }) {
  const [value, setValue] = useState(initialValue)
  const [touched, setTouched] = useState(false)

  const isEmpty = value.trim() === ''
  const showError = touched && isEmpty

  function handleSubmit(e) {
    e.preventDefault()
    setTouched(true)
    if (!isEmpty) onSubmit(value.trim().replace(/^[.\s]+|[.\s]+$/g, '').trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xl">
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        rows={6}
        disabled={isLoading}
        placeholder="Write your wish however it comes to you…"
        className={`w-full rounded-2xl border bg-white/70 p-4 text-base text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none disabled:opacity-50 ${showError ? 'border-red-400' : 'border-stone-200'}`}
      />
      {showError && (
        <p className="text-sm text-red-500 -mt-2">Please write your wish before continuing.</p>
      )}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map(example => (
          <button
            key={example}
            type="button"
            disabled={isLoading}
            onClick={() => setValue(example)}
            className="rounded-full border border-stone-200 bg-white/60 px-3 py-1.5 text-xs text-stone-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/60 transition-colors disabled:opacity-50"
          >
            {example}
          </button>
        ))}
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="self-end rounded-full bg-violet-600 px-8 py-3 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Shaping…' : 'Shape my wish'}
      </button>
    </form>
  )
}
