export default function OriginalWishCard({ wish }) {
  return (
    <section className="w-full max-w-2xl">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
        Your Original Wish
      </h2>
      <blockquote className="rounded-2xl border border-stone-100 bg-white/80 px-6 py-4 text-stone-700 text-base italic leading-relaxed">
        "{wish}"
      </blockquote>
    </section>
  )
}
