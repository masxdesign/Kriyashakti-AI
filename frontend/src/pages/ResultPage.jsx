import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getWishResult, clearWishResult, setWishResult } from '../store/wishResult.js'
import OriginalWishCard from '../components/OriginalWishCard.jsx'
import CoreIntentionsChips from '../components/CoreIntentionsChips.jsx'
import SuggestionSlider from '../components/SuggestionSlider.jsx'
import { updateVisualizationsInHistory, updateAffirmationsInHistory } from '../store/historyDB.js'

export default function ResultPage() {
  const navigate = useNavigate()
  const result = getWishResult()

  useEffect(() => {
    if (!result?.data) {
      navigate({ to: '/' })
    }
  }, [result, navigate])

  if (!result?.data) return null

  const coreWishes = result.data.map(item => item.wish)
  const isSingle = result.data.length === 1

  function handleStartOver() {
    clearWishResult()
    navigate({ to: '/' })
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
          <div className="page-heading w-full max-w-2xl !text-left">
            <h1 className="page-title !text-left">Your Kriyashakti</h1>
            <p className="page-lead !mx-0 text-sm !text-left">
              Tap a wish below to open its statements and practice notes.
            </p>
          </div>
          <OriginalWishCard wish={result.wish} variant="secondary" />
          <CoreIntentionsChips wishes={coreWishes} sessionId={result.sessionId} />
        </>
      )}

    </div>
  )
}
