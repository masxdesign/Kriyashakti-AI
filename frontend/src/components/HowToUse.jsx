import { useState } from 'react'

export default function HowToUse({ wish }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="rounded-lg border border-stone-200/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-primary/30 hover:bg-primary-muted/40 transition-all duration-200 flex items-center gap-2 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
      >
        <span className={`transition-transform duration-200 inline-block text-stone-500 ${open ? 'rotate-90' : ''}`} aria-hidden>
          ▸
        </span>
        How to use this
      </button>
      {open && (
        <div className="mt-3 text-sm text-stone-600 leading-relaxed max-w-prose text-pretty space-y-2">
          <p className="sm:hidden">
            We give you five versions of a Kriyashakti — a short phrase you say or write as if your wish is already true.
            Swipe or use the arrows to browse, then pick what feels natural. Add a visualization and affirmation when you are ready.
          </p>
          <p className="hidden sm:block">
            We give you five versions of a Kriyashakti — a short phrase you say or write as if your wish is already true.
            Use the arrows to browse, then pick what feels natural. Add a visualization and affirmation when you are ready.
          </p>
          {wish && (
            <p>
              Your original wish: <span className="italic text-stone-500">&ldquo;{wish}&rdquo;</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
