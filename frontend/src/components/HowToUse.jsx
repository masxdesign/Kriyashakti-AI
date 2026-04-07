import { useState } from 'react'

export default function HowToUse() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="rounded-full bg-violet-100 px-3 py-1 text-xs text-violet-600 hover:bg-violet-200 transition-colors flex items-center gap-1"
      >
        <span className={`transition-transform duration-200 inline-block ${open ? 'rotate-90' : ''}`}>▸</span>
        How to use this
      </button>
      {open && (
        <p className="mt-2 text-xs text-violet-600 leading-relaxed">
          We've written 5 versions of a Kriyashakti statement — a short phrase you say or write as if your wish has already come true. Browse through them and pick the one that feels most natural to you, then use the visualization to picture it clearly in your mind.
        </p>
      )}
    </div>
  )
}
