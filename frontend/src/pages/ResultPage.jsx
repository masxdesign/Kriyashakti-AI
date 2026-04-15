import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useWishResult, clearWishResult, setWishResult } from '../store/wishResult.js'
import OriginalWishCard from '../components/OriginalWishCard.jsx'
import CoreIntentionsChips from '../components/CoreIntentionsChips.jsx'
import SuggestionSlider from '../components/SuggestionSlider.jsx'
import { updateVisualizationsInHistory, updateAffirmationsInHistory } from '../store/historyDB.js'

export default function ResultPage() {
  const navigate = useNavigate()
  const result = useWishResult()

  useEffect(() => {
    if (!result?.data) {
      navigate({ to: '/' })
    }
  }, [result, navigate])

  if (!result?.data) return null

  const coreWishes = result.data.map(item => item.wish)
  const isSingle = result.data.length === 1

  function handleStartOver() {
    navigate({ to: '/' })
    clearWishResult()
  }

  async function handleVisualizationsGenerated(viz) {
    if (result.id != null) {
      await updateVisualizationsInHistory(result.id, 0, viz)
      setWishResult({ ...result, data: result.data.map((item, i) => i === 0 ? { ...item, visualizations: viz } : item) })
    }
  }

  async function handleAffirmationsGenerated(aff) {
    if (result.id != null) {
      await updateAffirmationsInHistory(result.id, 0, aff)
      setWishResult({ ...result, data: result.data.map((item, i) => i === 0 ? { ...item, affirmations: aff } : item) })
    }
  }

  return (
    <div className="page-shell">
      {isSingle ? (
        <>
          <div className="w-full max-w-2xl">
            <SuggestionSlider
              options={result.data[0].options}
              visualizations={result.data[0].visualizations}
              affirmations={result.data[0].affirmations}
              onVisualizationsGenerated={handleVisualizationsGenerated}
              onAffirmationsGenerated={handleAffirmationsGenerated}
              showPrimaryHeading
              sessionId={result.sessionId}
              wishIndex={0}
              coreWish={result.data[0].wish}
              rootWish={result.wish}
              onStartOver={handleStartOver}
            />
          </div>
        </>
      ) : (
        <>
          <div className="w-full max-w-2xl flex flex-col gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400 mb-1">Your Kriyashakti</p>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 leading-snug text-balance">
                Your wish has {coreWishes.length} core intentions
              </h1>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed text-pretty">
                Combined wording is harder to hold as a single image. Each intention gets its own Kriyashakti so the energy stays focused.
              </p>
            </div>
            <OriginalWishCard wish={result.wish} variant="secondary" />
            <CoreIntentionsChips wishes={coreWishes} sessionId={result.sessionId} />
          </div>
        </>
      )}

    </div>
  )
}
