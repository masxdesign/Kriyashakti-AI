import { useNavigate, useParams } from '@tanstack/react-router'
import { getWishResult, setWishResult } from '../store/wishResult.js'
import SuggestionSlider from '../components/SuggestionSlider.jsx'
import HowToUse from '../components/HowToUse.jsx'
import { updateVisualizationsInHistory, updateAffirmationsInHistory } from '../store/historyDB.js'

export default function WishDetailPage() {
  const navigate = useNavigate()
  const { index } = useParams({ from: '/result/wish/$index' })
  const result = getWishResult()
  const wishIndex = Number(index)
  const item = result.data[wishIndex]

  if (!item) {
    navigate({ to: '/result' })
    return null
  }

  async function handleVisualizationsGenerated(viz) {
    if (result.id != null) {
      await updateVisualizationsInHistory(result.id, wishIndex, viz)
      setWishResult({ ...result, data: result.data.map((d, i) => i === wishIndex ? { ...d, visualizations: viz } : d) })
    }
  }

  async function handleAffirmationsGenerated(aff) {
    if (result.id != null) {
      await updateAffirmationsInHistory(result.id, wishIndex, aff)
      setWishResult({ ...result, data: result.data.map((d, i) => i === wishIndex ? { ...d, affirmations: aff } : d) })
    }
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

      <div className="w-full max-w-2xl">
        <HowToUse />
      </div>

      <div className="w-full max-w-2xl">
        <SuggestionSlider
          options={item.options}
          visualizations={item.visualizations}
          affirmations={item.affirmations}
          onVisualizationsGenerated={handleVisualizationsGenerated}
          onAffirmationsGenerated={handleAffirmationsGenerated}
        />
      </div>
    </main>
  )
}
