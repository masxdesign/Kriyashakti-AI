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
    <div className="page-shell">
      <div className="w-full max-w-2xl pt-1">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 text-balance leading-snug">{item.wish}</h1>
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
    </div>
  )
}
