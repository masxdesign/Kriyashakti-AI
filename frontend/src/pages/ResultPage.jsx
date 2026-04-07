import { useNavigate } from '@tanstack/react-router'
import { getWishResult, clearWishResult } from '../store/wishResult.js'
import OriginalWishCard from '../components/OriginalWishCard.jsx'
import CoreIntentionsChips from '../components/CoreIntentionsChips.jsx'
import SuggestionSlider from '../components/SuggestionSlider.jsx'
import HowToUse from '../components/HowToUse.jsx'

export default function ResultPage() {
  const navigate = useNavigate()
  const result = getWishResult()

  const coreWishes = result.data.map(item => item.wish)
  const isSingle = result.data.length === 1

  function handleStartOver() {
    clearWishResult()
    navigate({ to: '/' })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 to-stone-50 flex flex-col items-center px-4 py-16 gap-6">
      <div className="text-center max-w-lg">
        <h1 className="text-3xl font-semibold text-stone-800 mb-1">Your Kriyashakti</h1>
        <p className="text-stone-400 text-sm">
          {isSingle ? 'Browse the statements below and pick the one that resonates most.' : 'Tap a wish below to get your Kriyashakti statements.'}
        </p>
      </div>

      <OriginalWishCard wish={result.wish} />

      {isSingle ? (
        <>
          <div className="w-full max-w-2xl">
            <HowToUse />
          </div>
          <div className="w-full max-w-2xl">
            <SuggestionSlider options={result.data[0].options} visualizations={result.data[0].visualizations} />
          </div>
        </>
      ) : (
        <CoreIntentionsChips wishes={coreWishes} />
      )}

      <button
        onClick={handleStartOver}
        className="rounded-full border border-stone-200 px-6 py-2.5 text-sm text-stone-500 hover:bg-stone-100 transition-colors"
      >
        Start over
      </button>
    </main>
  )
}
