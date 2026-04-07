import { useState } from 'react'

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
