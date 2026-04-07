import { useNavigate } from '@tanstack/react-router'
import { getWishResult, clearWishResult } from '../store/wishResult.js'
import OriginalWishCard from '../components/OriginalWishCard.jsx'
import CoreIntentionsChips from '../components/CoreIntentionsChips.jsx'
import ClarifiedWishSection from '../components/ClarifiedWishSection.jsx'

export default function ResultPage() {
  const navigate = useNavigate()
  const result = getWishResult()

  const coreWishes = result.data.map(item => item.wish)

  function handleStartOver() {
    clearWishResult()
    navigate({ to: '/' })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 to-stone-50 flex flex-col items-center px-4 py-16 gap-10">
      <div className="text-center max-w-lg">
        <h1 className="text-3xl font-semibold text-stone-800 mb-1">Your Kriyashakti</h1>
        <p className="text-stone-400 text-sm">Here's what we shaped from your wish.</p>
      </div>

      <OriginalWishCard wish={result.wish} />
      <CoreIntentionsChips wishes={coreWishes} />

      {result.data.map((item, i) => (
        <ClarifiedWishSection key={i} item={item} index={i} />
      ))}

      <button
        onClick={handleStartOver}
        className="rounded-full border border-stone-200 px-6 py-2.5 text-sm text-stone-500 hover:bg-stone-100 transition-colors"
      >
        Start over
      </button>
    </main>
  )
}
