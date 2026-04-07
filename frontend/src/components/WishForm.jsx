export default function WishForm({ onSubmit, isLoading }) {
  function handleSubmit(e) {
    e.preventDefault()
    const wish = e.target.wish.value.trim()
    if (wish) onSubmit(wish)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xl">
      <textarea
        name="wish"
        rows={6}
        disabled={isLoading}
        placeholder="Write your wish however it comes to you…"
        className="w-full rounded-2xl border border-stone-200 bg-white/70 p-4 text-base text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none disabled:opacity-50"
        required
      />
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
