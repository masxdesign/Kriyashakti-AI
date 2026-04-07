import { useState } from 'react'

export default function SuggestionSlider({ options, visualizations }) {
  const [index, setIndex] = useState(0)
  const total = options.length

  function prev() {
    setIndex(i => (i - 1 + total) % total)
  }
  function next() {
    setIndex(i => (i + 1) % total)
  }

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-stone-100 bg-white/90 px-6 py-6 flex flex-col gap-4 min-h-[200px]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-1">
            Kriyashakti Statement
          </p>
          <p className="text-stone-800 text-base font-medium leading-snug">
            {options[index]}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">
            Visualization
          </p>
          <p className="text-stone-600 text-sm leading-relaxed">
            {visualizations[index]}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 px-1">
        <button
          onClick={prev}
          className="rounded-full px-4 py-1.5 text-sm text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
        >
          ← Prev
        </button>
        <span className="text-xs text-stone-400">
          {index + 1} / {total}
        </span>
        <button
          onClick={next}
          className="rounded-full px-4 py-1.5 text-sm text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
