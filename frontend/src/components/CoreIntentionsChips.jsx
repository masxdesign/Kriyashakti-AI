import { useNavigate } from '@tanstack/react-router'

export default function CoreIntentionsChips({ wishes }) {
  const navigate = useNavigate()
  const isSplit = wishes.length > 1

  return (
    <section className="w-full max-w-2xl">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
        Your Core Intentions
      </h2>
      {isSplit && (
        <p className="text-sm text-stone-500 mb-3">
          Your wish contains <span className="font-medium text-stone-700">{wishes.length} separate intentions</span> — we've given each one its own Kriyashakti so the energy stays focused and clear. One combined wish is harder to visualize and less effective.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {wishes.map((wish, i) => (
          <button
            key={i}
            onClick={() => navigate({ to: '/result/wish/$index', params: { index: String(i) } })}
            className="rounded-full bg-violet-100 px-4 py-1.5 text-sm text-violet-700 font-medium hover:bg-violet-200 transition-colors cursor-pointer"
          >
            {wish} →
          </button>
        ))}
      </div>
    </section>
  )
}
