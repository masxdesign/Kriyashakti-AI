import { useNavigate } from '@tanstack/react-router'
import { getWishResult, clearWishResult, setWishResult } from '../store/wishResult.js'
import OriginalWishCard from '../components/OriginalWishCard.jsx'
import CoreIntentionsChips from '../components/CoreIntentionsChips.jsx'
import SuggestionSlider from '../components/SuggestionSlider.jsx'
import HowToUse from '../components/HowToUse.jsx'
import { updateVisualizationsInHistory, updateAffirmationsInHistory } from '../store/historyDB.js'

export default function ResultPage() {
  const navigate = useNavigate()
  const result = getWishResult()

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
      <div className="page-heading">
        <h1 className="page-title">Your Kriyashakti</h1>
        <p className="page-lead text-sm">
          {isSingle
            ? 'Browse the statements below and pick the one that resonates most.'
            : 'Tap a wish below to open its statements and practice notes.'}
        </p>
      </div>

      <OriginalWishCard wish={result.wish} />

      {isSingle ? (
        <>
          <div className="w-full max-w-2xl">
            <HowToUse />
          </div>
          <div className="w-full max-w-2xl">
            <SuggestionSlider
              options={result.data[0].options}
              visualizations={result.data[0].visualizations}
              affirmations={result.data[0].affirmations}
              onVisualizationsGenerated={handleVisualizationsGenerated}
              onAffirmationsGenerated={handleAffirmationsGenerated}
            />
          </div>
        </>
      ) : (
        <CoreIntentionsChips wishes={coreWishes} />
      )}

      <button
        type="button"
        onClick={handleStartOver}
        className="rounded-full border border-stone-200/90 bg-white/60 px-6 py-2.5 text-sm font-medium text-stone-600 shadow-sm shadow-stone-900/5 transition-all duration-200 hover:bg-stone-50 hover:border-stone-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
      >
        Start over
      </button>
    </div>
  )
}
