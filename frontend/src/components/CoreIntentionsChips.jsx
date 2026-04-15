import { useNavigate } from '@tanstack/react-router'

export default function CoreIntentionsChips({ wishes, sessionId }) {
  const navigate = useNavigate()

  return (
    <section className="w-full max-w-2xl flex flex-col gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">
        Tap an intention to open its statements
      </p>
      <div className="flex flex-col gap-2.5">
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
            className="group flex w-full items-center gap-4 rounded-2xl border border-stone-100/90 bg-white px-5 py-4 text-left shadow-sm shadow-stone-900/5 transition-all duration-200 hover:border-primary/25 hover:shadow-md hover:shadow-stone-900/8 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-muted/80 text-xs font-bold text-primary">
              {i + 1}
            </span>
            <span className="flex-1 text-sm font-medium leading-snug text-stone-700 text-pretty">
              {wish}
            </span>
            <svg
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              className="h-4 w-4 shrink-0 text-stone-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary/60"
              aria-hidden
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>
    </section>
  )
}
