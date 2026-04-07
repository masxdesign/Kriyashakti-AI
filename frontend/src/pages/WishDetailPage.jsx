import { useNavigate, useParams } from '@tanstack/react-router'
import { getWishResult } from '../store/wishResult.js'
import SuggestionSlider from '../components/SuggestionSlider.jsx'

export default function WishDetailPage() {
  const navigate = useNavigate()
  const { index } = useParams({ from: '/result/wish/$index' })
  const result = getWishResult()
  const item = result.data[Number(index)]

  if (!item) {
    navigate({ to: '/result' })
    return null
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-violet-50 to-stone-50 flex flex-col items-center px-4 py-16 gap-8">
      <div className="w-full max-w-2xl flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/result' })}
          className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="w-full max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Your intention</p>
        <h1 className="text-xl font-semibold text-stone-800">{item.wish}</h1>
      </div>

      <div className="w-full max-w-2xl bg-violet-50 border border-violet-100 rounded-2xl px-5 py-4 text-sm text-violet-700 leading-relaxed">
        <p className="font-semibold mb-1">How to use this</p>
        <p>We've written 5 versions of a Kriyashakti statement — a short phrase you say or write as if your wish has already come true. Browse through them and pick the one that feels most natural to you, then use the visualization to picture it clearly in your mind.</p>
      </div>

      <div className="w-full max-w-2xl">
        <SuggestionSlider options={item.options} visualizations={item.visualizations} />
      </div>
    </main>
  )
}
