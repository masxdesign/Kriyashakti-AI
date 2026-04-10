import { useNavigate } from '@tanstack/react-router'

export default function CoreIntentionsChips({ wishes, sessionId }) {
  const navigate = useNavigate()
  const isSplit = wishes.length > 1

  return (
    <section className="w-full max-w-2xl">
      <h2 className="text-xs font-medium tracking-[0.14em] text-stone-500 mb-2">
        Core intentions
      </h2>
      {isSplit && (
        <p className="text-sm text-stone-600 mb-4 leading-relaxed max-w-prose text-pretty">
          Your wish holds <span className="font-semibold text-stone-800">{wishes.length} separate intentions</span>.
          Each one has its own Kriyashakti so the energy stays focused. Combined wording is harder to picture clearly.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {wishes.map((wish, i) => (
          <button
            key={i}
            type="button"
            onClick={() =>
              navigate({
                to: '/result/$sessionId/wish/$index',
                params: { sessionId, index: String(i) },
              })
            }
            className="rounded-lg bg-primary-muted/90 px-4 py-2 text-sm font-medium text-primary border border-primary/15 hover:bg-primary-muted transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 text-left text-pretty"
          >
            {wish}
            <span className="text-primary/70 ml-1" aria-hidden>→</span>
          </button>
        ))}
      </div>
    </section>
  )
}
