import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useMotionValueEvent, animate } from 'motion/react'
import { useDrag } from '@use-gesture/react'
import { generateVisualization, generateAffirmation } from '../api/processWish.js'
import { cn } from '@/lib/utils'
import { makeFavoriteDedupeKey, isFavoriteDedupeKey, toggleFavorite, onFavoritesChange } from '../store/historyDB.js'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 640px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const handler = e => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

function ResponsiveOverlay({ open, onOpenChange, title, description, children }) {
  const isDesktop = useIsDesktop()
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold tracking-tight text-stone-900">{title}</DialogTitle>
            {description && <DialogDescription className="sr-only">{description}</DialogDescription>}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    )
  }
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-0">
        <DrawerHeader className="border-b border-stone-100/80 px-6 pb-3 pr-14 pt-1">
          <DrawerTitle className="text-base font-semibold tracking-tight text-stone-900">{title}</DrawerTitle>
          {description && <DrawerDescription className="sr-only">{description}</DrawerDescription>}
        </DrawerHeader>
        {children}
      </DrawerContent>
    </Drawer>
  )
}



const SwipeCard = forwardRef(function SwipeCard({
  option,
  onSwipe, x, className,
  cardIndex, total,
}, ref) {

  const rotate = useTransform(x, [-280, 0], [-20, 0])
  const swipeHintOpacity = useTransform(x, [-20, 0], [0, 1])
  const flying = useRef(false)
  /** Stops mid-flight animations so x never freezes; pointer loss no longer leaves flying=true. */
  const cardAnimRef = useRef(null)

  const nextLabel = useTransform(x, v => v < -36 ? 1 : 0)

  function stopCardAnim() {
    cardAnimRef.current?.stop?.()
    cardAnimRef.current = null
    flying.current = false
  }

  useEffect(() => {
    stopCardAnim()
    x.set(0)
  }, [option])

  // Safety net: if pointer is released anywhere outside the card, snap back
  useEffect(() => {
    function onPointerUp() {
      if (!flying.current && x.get() !== 0) {
        stopCardAnim()
        const anim = animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 })
        cardAnimRef.current = anim
        anim.then(() => {
          if (cardAnimRef.current === anim) cardAnimRef.current = null
        })
      }
    }
    window.addEventListener('touchend', onPointerUp)
    window.addEventListener('touchcancel', onPointerUp)
    return () => {
      window.removeEventListener('touchend', onPointerUp)
      window.removeEventListener('touchcancel', onPointerUp)
    }
  }, [])

  useImperativeHandle(ref, () => ({
    flyOut(direction) {
      if (flying.current) return
      stopCardAnim()
      flying.current = true
      const flyTo = direction === 'right' ? 500 : -500
      const anim = animate(x, flyTo, { duration: 0.3, ease: 'easeOut' })
      cardAnimRef.current = anim
      anim.then(() => {
        onSwipe(direction)
        flying.current = false
        if (cardAnimRef.current === anim) cardAnimRef.current = null
      })
    },
  }))

  const bind = useDrag(({ down, movement: [mx], velocity: [vx], canceled, event }) => {
    if (event?.pointerType === 'mouse') return
    if (flying.current) return

    if (canceled || (!down && mx === 0)) {
      stopCardAnim()
      const anim = animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 })
      cardAnimRef.current = anim
      anim.then(() => {
        if (cardAnimRef.current === anim) cardAnimRef.current = null
      })
      return
    }

    if (down) {
      stopCardAnim()
      x.set(Math.min(0, mx))
      return
    }

    const shouldFlyLeft = mx < -100 || (vx < -0.45 && mx < -24)
    if (shouldFlyLeft) {
      flying.current = true
      const anim = animate(x, -500, { duration: 0.3, ease: 'easeOut' })
      cardAnimRef.current = anim
      anim.then(() => {
        onSwipe('left')
        flying.current = false
        if (cardAnimRef.current === anim) cardAnimRef.current = null
      })
    } else {
      const anim = animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 })
      cardAnimRef.current = anim
      anim.then(() => {
        if (cardAnimRef.current === anim) cardAnimRef.current = null
      })
    }
  }, { filterTaps: true, pointer: { touch: true } })

  return (
    <div
      className={cn(
        'relative z-10 flex w-full flex-col gap-4',
        className,
      )}
    >
      <motion.div
        initial={false}
        layout={false}
        style={{ x, rotate, touchAction: 'none' }}
        className="relative w-full"
      >
        {/* Gradient border wrapper */}
        <div
          {...bind()}
          className="touch-none rounded-2xl p-px shadow-sm shadow-stone-900/5"
          style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 12%, #fbcfe8 26%, #fda4af 36%, #fdba74 44%, #fca5a5 51%, #86efac 62%, #7dd3fc 74%, #818cf8 84%, #a78bfa 100%)' }}
        >
          <div className="relative flex w-full flex-col overflow-hidden rounded-[15px] bg-white px-6 py-6">
{total > 1 && (
              <p className="relative mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
                Statement {cardIndex + 1} of {total}
              </p>
            )}
            <p className="relative text-stone-800 text-lg font-semibold leading-relaxed text-pretty pr-14 min-h-20">
              {option}
            </p>
            <motion.p
              style={{ opacity: swipeHintOpacity }}
              className="relative pointer-events-none mt-3 self-end text-[11px] font-medium text-stone-300 select-none sm:hidden"
              aria-hidden
            >
              swipe ←
            </motion.p>
          </div>
        </div>

        <motion.div style={{ opacity: nextLabel }} className="pointer-events-none absolute right-4 top-4 rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
          Next →
        </motion.div>
      </motion.div>


    </div>
  )
})

export default function SuggestionSlider({
  options,
  visualizations: initialVisualizations,
  affirmations: initialAffirmations,
  onVisualizationsGenerated,
  onAffirmationsGenerated,
  /** When true, this block is the page hero (Result page). */
  showPrimaryHeading = false,
  /** When set, star saves this Kriyashakti line to IndexedDB favorites. */
  sessionId,
  wishIndex = 0,
  coreWish = '',
  rootWish = '',
  /** Open the slider at this option index (e.g. from Favorites deep link). */
  initialOptionIndex,
  onStartOver,
  onBackToIntentions,
}) {
  const total = options.length
  const [index, setIndex] = useState(() =>
    initialOptionIndex != null && initialOptionIndex >= 0 && initialOptionIndex < options.length
      ? initialOptionIndex
      : 0,
  )
  const [dialogOpen, setDialogOpen] = useState(null)
  const [howToUseOpen, setHowToUseOpen] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [favoriteSaving, setFavoriteSaving] = useState(false)
  const [favoriteError, setFavoriteError] = useState(false)
  const [behindIndex, setBehindIndex] = useState(1 % total)
  const wishIndexNum = Number.isFinite(Number(wishIndex)) ? Number(wishIndex) : 0

  const [visualizations, setVisualizations] = useState(
    () => Array.from({ length: total }, (_, i) => initialVisualizations?.[i] ?? null)
  )
  const [vizStates, setVizStates] = useState(
    () => Array.from({ length: total }, (_, i) => initialVisualizations?.[i] ? 'done' : 'idle')
  )
  const [affirmations, setAffirmations] = useState(
    () => Array.from({ length: total }, (_, i) => initialAffirmations?.[i] ?? null)
  )
  const [affStates, setAffStates] = useState(
    () => Array.from({ length: total }, (_, i) => initialAffirmations?.[i] ? 'done' : 'idle')
  )

  const x = useMotionValue(0)
  const behindScale = useTransform(x, [-300, 0], [0.97, 1])
  const behindOpacity = useTransform(x, [-120, 0], [1, 0])
  const cardRef = useRef(null)
  const indexRef = useRef(index)
  indexRef.current = index

  useEffect(() => {
    if (
      initialOptionIndex != null &&
      initialOptionIndex >= 0 &&
      initialOptionIndex < total
    ) {
      setIndex(initialOptionIndex)
    }
  }, [initialOptionIndex, total])

  useEffect(() => {
    setFavoriteError(false)
  }, [sessionId, wishIndexNum, index])

  useEffect(() => {
    if (!sessionId) {
      setFavorited(false)
      return
    }
    let cancelled = false
    function checkFav() {
      const key = makeFavoriteDedupeKey(sessionId, wishIndexNum, index)
      isFavoriteDedupeKey(key)
        .then(ok => { if (!cancelled) setFavorited(ok) })
        .catch(() => { if (!cancelled) setFavorited(false) })
    }
    checkFav()
    const unsub = onFavoritesChange(checkFav)
    return () => {
      cancelled = true
      unsub()
    }
  }, [sessionId, wishIndexNum, index])

  async function handleToggleFavorite() {
    if (!sessionId) return
    setFavoriteError(false)
    setFavoriteSaving(true)
    try {
      const { favorited: next } = await toggleFavorite({
        dedupeKey: makeFavoriteDedupeKey(sessionId, wishIndexNum, index),
        sessionId,
        wishIndex: wishIndexNum,
        optionIndex: index,
        kriyashakti: options[index],
        coreWish,
        rootWish,
        visualization: visualizations[index],
        affirmation: affirmations[index],
      })
      setFavorited(next)
    } catch {
      setFavoriteError(true)
    } finally {
      setFavoriteSaving(false)
    }
  }

  /** Only when drag first crosses into negative x — avoids setState every frame and swipe flicker. */
  const peekingLeftRef = useRef(false)
  useMotionValueEvent(x, 'change', val => {
    if (val < 0) {
      if (!peekingLeftRef.current) {
        peekingLeftRef.current = true
        setBehindIndex((indexRef.current + 1) % total)
      }
    } else {
      peekingLeftRef.current = false
    }
  })

  function handleSwipe(direction) {
    setDialogOpen(null)
    x.set(0)
    setIndex(i => {
      const next = direction === 'left' ? (i + 1) % total : (i - 1 + total) % total
      setBehindIndex((next + 1) % total)
      return next
    })
  }

  function goNext() {
    setBehindIndex((index + 1) % total)
    cardRef.current?.flyOut('left')
  }

  function goPrev() {
    setBehindIndex((index - 1 + total) % total)
    cardRef.current?.flyOut('right')
  }

  async function handleGenerateViz(cardIndex) {
    if (vizStates[cardIndex] === 'loading') return
    setVizStates(prev => prev.map((s, i) => i === cardIndex ? 'loading' : s))
    try {
      const viz = await generateVisualization(options[cardIndex])
      setVisualizations(prev => {
        const next = prev.map((v, i) => i === cardIndex ? viz : v)
        onVisualizationsGenerated?.(next)
        return next
      })
      setVizStates(prev => prev.map((s, i) => i === cardIndex ? 'done' : s))
      setDialogOpen('viz')
    } catch {
      setVizStates(prev => prev.map((s, i) => i === cardIndex ? 'error' : s))
    }
  }

  async function handleGenerateAff(cardIndex) {
    if (affStates[cardIndex] === 'loading') return
    setAffStates(prev => prev.map((s, i) => i === cardIndex ? 'loading' : s))
    try {
      const aff = await generateAffirmation(options[cardIndex], visualizations[cardIndex])
      setAffirmations(prev => {
        const next = prev.map((v, i) => i === cardIndex ? aff : v)
        onAffirmationsGenerated?.(next)
        return next
      })
      setAffStates(prev => prev.map((s, i) => i === cardIndex ? 'done' : s))
      setDialogOpen('aff')
    } catch {
      setAffStates(prev => prev.map((s, i) => i === cardIndex ? 'error' : s))
    }
  }

  return (
    <div className="w-full">
      {showPrimaryHeading ? (
        <header className="mb-2 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">
            Pick what feels right
          </p>
        </header>
      ) : (
        <p className="text-xs font-medium tracking-[0.08em] text-primary/80 uppercase mb-3">
          Pick what feels right
        </p>
      )}

      <div className="relative grid grid-cols-1 grid-rows-1 place-items-start select-none">
        {/* Card behind — mirrors front stack height (statement card + spacer for controls below) */}
        <motion.div
          className="col-start-1 row-start-1 z-0 flex w-full max-w-full flex-col gap-4"
          style={{
            scale: behindScale,
            transformOrigin: 'bottom',
          }}
        >
          <motion.div
            className="rounded-2xl border border-stone-100/80 bg-white px-6 py-6 shadow-sm shadow-stone-900/5 overflow-hidden"
            style={{ opacity: behindOpacity }}
          >
            <p className="text-stone-800 text-lg font-semibold leading-relaxed text-pretty pr-14 min-h-20">
              {options[behindIndex]}
            </p>
          </motion.div>
        </motion.div>

        {/* Top draggable card */}
        <SwipeCard
          ref={cardRef}
          className="col-start-1 row-start-1"
          option={options[index]}
          onSwipe={handleSwipe}
          x={x}
          cardIndex={index}
          total={total}
        />
      </div>

      {/* Prev / Next */}
      <div className="flex items-center justify-between mt-3 px-0.5">
        <button
          type="button"
          onClick={goPrev}
          title="Previous statement"
          aria-label="Previous statement"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200/90 bg-white shadow-sm shadow-stone-900/5 text-stone-500 transition-all duration-200 hover:border-stone-300 hover:text-stone-800 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex gap-1.5 items-center">
          {options.map((_, i) => (
            <span key={i} className={`rounded-full transition-all duration-200 ${i === index ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-stone-200'}`} />
          ))}
        </div>
        <button
          type="button"
          onClick={goNext}
          title="Next statement"
          aria-label="Next statement"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200/90 bg-white shadow-sm shadow-stone-900/5 text-stone-500 transition-all duration-200 hover:border-stone-300 hover:text-stone-800 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* CTA buttons */}
      <div className="mx-auto mt-8 w-full sm:w-56 flex flex-col gap-2">
        {/* Primary CTAs — generate/view */}
        {vizStates[index] === 'loading' ? (
          <span className="flex h-12 items-center justify-center gap-2 text-sm text-stone-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 animate-spin opacity-60" aria-hidden><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            Shaping visualization…
          </span>
        ) : vizStates[index] === 'error' ? (
          <button type="button" onClick={() => handleGenerateViz(index)} className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/35">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
            Retry visualization
          </button>
        ) : visualizations[index] ? (
          <button type="button" onClick={() => setDialogOpen('viz')} className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-primary/40 bg-transparent text-sm font-medium text-primary transition-all duration-200 hover:bg-primary-muted/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
            View visualization
          </button>
        ) : (
          <button type="button" onClick={() => handleGenerateViz(index)} className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary-muted/60 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /></svg>
            Generate visualization
          </button>
        )}

        {affStates[index] === 'loading' ? (
          <span className="flex h-12 items-center justify-center gap-2 text-sm text-stone-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 animate-spin opacity-60" aria-hidden><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            Shaping affirmation…
          </span>
        ) : affStates[index] === 'error' ? (
          <button type="button" onClick={() => handleGenerateAff(index)} className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/35">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
            Retry affirmation
          </button>
        ) : affirmations[index] ? (
          <button type="button" onClick={() => setDialogOpen('aff')} className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-primary/40 bg-transparent text-sm font-medium text-primary transition-all duration-200 hover:bg-primary-muted/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
            View affirmation
          </button>
        ) : (
          <button type="button" onClick={() => handleGenerateAff(index)} className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary-muted/60 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" /></svg>
            Generate affirmation
          </button>
        )}

        {/* Secondary CTAs */}
        <div className="flex flex-col gap-2">
          {sessionId && (
            <button
              type="button"
              disabled={favoriteSaving}
              onClick={handleToggleFavorite}
              className={cn(
                'flex h-12 w-full items-center justify-center gap-2 rounded-full border text-sm font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:opacity-50',
                favorited
                  ? 'border-amber-300/50 bg-amber-50/80 text-amber-600 hover:bg-amber-100'
                  : 'border-stone-300 bg-transparent text-stone-500 hover:text-stone-700 hover:border-stone-400',
              )}
              aria-pressed={favorited}
              aria-busy={favoriteSaving}
            >
              {favoriteSaving ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 animate-spin opacity-60" aria-hidden><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                  Saving…
                </>
              ) : favorited ? (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-4 w-4" aria-hidden><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                  Saved to favorites
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                  Save to favorites
                </>
              )}
            </button>
          )}
          {favoriteError && (
            <p className="text-center text-xs text-red-600" role="alert">Could not update favorites. Try again.</p>
          )}
          <button
            type="button"
            onClick={() => setHowToUseOpen(true)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-stone-200/70 bg-transparent text-sm font-medium text-stone-400 transition-all duration-200 hover:text-stone-600 hover:border-stone-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
            How to use this
          </button>
          {onBackToIntentions && (
            <button
              type="button"
              onClick={onBackToIntentions}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-stone-200/70 bg-transparent text-sm font-medium text-stone-400 transition-all duration-200 hover:text-stone-600 hover:border-stone-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden><path d="M15 18l-6-6 6-6" /></svg>
              Back to intentions
            </button>
          )}
          {onStartOver && (
            <button
              type="button"
              onClick={onStartOver}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-stone-200/70 bg-transparent text-sm font-medium text-stone-400 transition-all duration-200 hover:text-stone-600 hover:border-stone-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
              Start over
            </button>
          )}
        </div>
      </div>

      <ResponsiveOverlay
        open={dialogOpen !== null}
        onOpenChange={open => !open && setDialogOpen(null)}
        title={dialogOpen === 'viz' ? 'Visualization' : 'Affirmation'}
        description={dialogOpen === 'viz'
          ? 'Mental picture for your practice, with your Kriyashakti line as context.'
          : 'Affirmation lines for your practice, with your Kriyashakti line as context.'}
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-8 px-6 pb-8 pt-6">
            {dialogOpen === 'viz' && visualizations[index] && (
              <div className="text-pretty">
                <p className="text-[1.0625rem] sm:text-lg font-normal leading-[1.65] tracking-[-0.02em] text-stone-900">
                  {visualizations[index]}
                </p>
              </div>
            )}
            {dialogOpen === 'aff' && affirmations[index] && (
              <div className="flex flex-col gap-5 text-pretty">
                {affirmations[index].split('\n').map((line, i) => (
                  <p key={i} className="text-[1.0625rem] sm:text-lg font-normal leading-[1.65] tracking-[-0.015em] text-stone-800 italic">
                    {line}
                  </p>
                ))}
              </div>
            )}
            <div className="border-t border-stone-200/90 pt-6">
              <div className="flex gap-3.5">
                <div className="mt-0.5 w-1 shrink-0 self-stretch min-h-11 rounded-full bg-primary/25" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/70">Kriyashakti</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-stone-500">{options[index]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveOverlay>

      <ResponsiveOverlay
        open={howToUseOpen}
        onOpenChange={setHowToUseOpen}
        title="How to use this"
        description="Instructions for using Kriyashakti statements."
      >
        <div className="flex flex-col gap-4 px-6 pb-8 pt-6 text-sm text-stone-600 leading-relaxed text-pretty">
          <p>
            We give you five versions of a Kriyashakti — a short phrase you say or write as if your wish is already true.
            Use the arrows to browse, then pick what feels natural. Add a visualization and affirmation when you are ready.
          </p>
          {rootWish && (
            <p>Your original wish: <span className="italic text-stone-400">&ldquo;{rootWish}&rdquo;</span></p>
          )}
        </div>
      </ResponsiveOverlay>
    </div>
  )
}
