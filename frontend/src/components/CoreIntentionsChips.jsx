export default function CoreIntentionsChips({ wishes }) {
  return (
    <section className="w-full max-w-2xl">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
        Your Core Intentions
      </h2>
      <div className="flex flex-wrap gap-2">
        {wishes.map((wish, i) => (
          <span
            key={i}
            className="rounded-full bg-violet-100 px-4 py-1.5 text-sm text-violet-700 font-medium"
          >
            {wish}
          </span>
        ))}
      </div>
    </section>
  )
}
