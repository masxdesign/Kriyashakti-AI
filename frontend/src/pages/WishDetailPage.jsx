import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useWishResult, setWishResult, clearWishResult } from '../store/wishResult.js'
import SuggestionSlider from '../components/SuggestionSlider.jsx'
import { updateVisualizationsInHistory, updateAffirmationsInHistory } from '../store/historyDB.js'

export default function WishDetailPage() {
  const navigate = useNavigate()
  const { sessionId, index } = useParams({ from: '/result/$sessionId/wish/$index' })
  const { line: lineFromSearch } = useSearch({ from: '/result/$sessionId/wish/$index' })
  const result = useWishResult()
  const wishIndex = Number(index)
  const item = result?.data?.[wishIndex]
  const totalWishes = result?.data?.length ?? 1
  const isMulti = totalWishes > 1

  if (!item) {
    navigate({ to: '/result/$sessionId', params: { sessionId } })
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

  function handleBackToIntentions() {
    navigate({ to: '/result/$sessionId', params: { sessionId } })
  }

  function handleStartOver() {
    navigate({ to: '/' })
    clearWishResult()
  }

  return (
    <div className="page-shell">
      <div className="w-full max-w-2xl flex flex-col gap-1">
        {isMulti && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">
            Intention {wishIndex + 1} of {totalWishes}
          </p>
        )}
        <h1 className="text-xl font-bold tracking-tight text-stone-900 leading-snug text-balance">
          {item.wish}
        </h1>
      </div>

      <div className="w-full max-w-2xl">
        <SuggestionSlider
          options={item.options}
          visualizations={item.visualizations}
          affirmations={item.affirmations}
          onVisualizationsGenerated={handleVisualizationsGenerated}
          onAffirmationsGenerated={handleAffirmationsGenerated}
          showPrimaryHeading
          sessionId={result.sessionId}
          wishIndex={wishIndex}
          coreWish={item.wish}
          rootWish={result.wish}
          initialOptionIndex={lineFromSearch}
          onBackToIntentions={isMulti ? handleBackToIntentions : undefined}
          onStartOver={handleStartOver}
        />
      </div>
    </div>
  )
}
