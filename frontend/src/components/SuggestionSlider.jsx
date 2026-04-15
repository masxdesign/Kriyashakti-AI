import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useMotionValueEvent, animate, useReducedMotion } from 'motion/react'
import { useDrag } from '@use-gesture/react'
import { generateVisualization, generateAffirmation } from '../api/processWish.js'
import { cn } from '@/lib/utils'
import { makeFavoriteDedupeKey, isFavoriteDedupeKey, toggleFavorite } from '../store/historyDB.js'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'

function IconChevronsLeft({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
  )
}

function IconStar({ className, filled }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

/** Quiet cue — icon + text share one vertical center; shimmer only on lead words */
function SwipeHint() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="mb-3 flex max-w-xl items-center gap-0" role="status">
      <div
        className="pointer-events-none h-5 w-px shrink-0 rounded-full bg-gradient-to-b from-stone-200/0 via-stone-400/35 to-stone-200/0"
        aria-hidden
      />
      <div className="flex min-w-0 flex-1 items-center gap-2.5 pl-3.5">
        <motion.span
          className="inline-flex shrink-0 items-center justify-center text-primary/45"
          animate={reduceMotion ? false : { x: [0, -3, 0] }}
          transition={{ duration: 2.75, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
          aria-hidden
        >
          <IconChevronsLeft className="h-[1.0625rem] w-[1.0625rem]" />
        </motion.span>
        <p className="min-w-0 text-[13px] leading-5 tracking-[-0.01em] sm:text-[0.8125rem]">
          <span className="swipe-hint__shine">Swipe left</span>
          <span className="font-normal text-stone-500"> for the next line.</span>
        </p>
      </div>
    </div>
  )
}

const SwipeCard = forwardRef(function SwipeCard({
  option, visualization, vizState, onGenerateViz,
  affirmation, affState, onGenerateAff,
  onSwipe, x, className,
  favorited, onToggleFavorite, favoriteEnabled,
  favoriteSaving, favoriteError,
  bottomOpacity,
}, ref) {
  const [dialogOpen, setDialogOpen] = useState(null)

  const rotate = useTransform(x, [-280, 0], [-20, 0])
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
    setDialogOpen(null)
    stopCardAnim()
    x.set(0)
  }, [option])

  useImperativeHandle(ref, () => ({
    flyOut(direction) {
      if (flying.current) return
      stopCardAnim()
      flying.current = true
      const flyTo = direction === 'right' ? 500 : -500
      const anim = animate(x, flyTo, { duration: 0.3, ease: 'easeOut' })
      cardAnimRef.current = anim
      anim
        .then(() => {
          onSwipe(direction)
        })
        .finally(() => {
          flying.current = false
          if (cardAnimRef.current === anim) cardAnimRef.current = null
        })
    },
  }))

  const bind = useDrag(({ down, movement: [mx], velocity: [vx], canceled, event, cancel }) => {
    if (canceled) {
      stopCardAnim()
      const anim = animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 })
      cardAnimRef.current = anim
      anim.finally(() => {
        if (cardAnimRef.current === anim) cardAnimRef.current = null
      })
      return
    }

    if (flying.current && !down) return

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
      anim
        .then(() => {
          onSwipe('left')
        })
        .finally(() => {
          flying.current = false
          if (cardAnimRef.current === anim) cardAnimRef.current = null
        })
    } else {
      const anim = animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 })
      cardAnimRef.current = anim
      anim.finally(() => {
        if (cardAnimRef.current === anim) cardAnimRef.current = null
      })
    }
  }, { filterTaps: true, pointer: { capture: true } })

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
        <div
          {...bind()}
          className="flex w-full cursor-grab touch-none flex-col rounded-2xl border border-stone-100/90 bg-white/95 px-6 py-6 shadow-sm shadow-stone-900/5 active:cursor-grabbing"
        >
          <p className="text-stone-800 text-base font-semibold leading-relaxed text-pretty pr-14 min-h-20">
            {option}
          </p>
        </div>

        <motion.div style={{ opacity: nextLabel }} className="pointer-events-none absolute right-4 top-4 rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
          Next →
        </motion.div>
      </motion.div>

      <motion.div className="flex flex-col gap-3 px-0.5" style={{ opacity: bottomOpacity }}>
        {favoriteEnabled && (
          <div className="flex flex-col gap-1">
            <div className="flex min-h-8 items-center gap-2">
              <button
                type="button"
                disabled={favoriteSaving}
                onClick={onToggleFavorite}
                className={cn(
                  'rounded-lg p-1.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50',
                  favorited
                    ? 'text-amber-500 ring-2 ring-amber-400/40 hover:text-amber-600'
                    : 'text-stone-300 hover:text-amber-500',
                )}
                aria-pressed={favorited}
                aria-busy={favoriteSaving}
                aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
              >
                <IconStar className="h-5 w-5" filled={favorited} />
              </button>
              {favorited && !favoriteSaving ? (
                <span className="text-xs font-semibold text-amber-600">Saved on this device</span>
              ) : null}
              {favoriteSaving ? (
                <span className="text-xs text-stone-500">Saving…</span>
              ) : null}
            </div>
            {favoriteError ? (
              <p className="text-xs text-red-600" role="alert">
                Could not update favorites. Check that browser storage is allowed, then try again.
              </p>
            ) : null}
          </div>
        )}

        <div
          className={cn(
            'flex min-h-8 flex-nowrap items-center gap-x-3 border-t border-stone-200/90 pt-4 sm:gap-x-4',
            visualization ? 'justify-between' : 'justify-start',
          )}
        >
          <div className="flex h-8 min-w-0 items-center">
            {vizState === 'loading' ? (
              <span className="inline-flex h-8 items-center text-xs text-stone-500">Shaping visualization…</span>
            ) : vizState === 'error' ? (
              <button
                type="button"
                onClick={onGenerateViz}
                className="inline-flex h-8 max-w-full items-center truncate text-xs text-red-600 hover:text-red-800 underline-offset-2 hover:underline transition-colors"
              >
                Could not generate. Try again
              </button>
            ) : visualization ? (
              <button
                type="button"
                onClick={() => setDialogOpen('viz')}
                className="inline-flex h-8 max-w-full items-center truncate rounded-md px-2 text-xs font-medium text-primary transition-colors hover:bg-primary-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
              >
                View visualization
              </button>
            ) : (
              <button
                type="button"
                onClick={onGenerateViz}
                className="inline-flex h-8 shrink-0 items-center rounded-lg border border-primary/25 bg-primary-muted/50 px-3 text-xs font-medium text-primary transition-all duration-200 hover:bg-primary-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
              >
                Generate visualization
              </button>
            )}
          </div>

          {visualization && (
            <>
              <span className="h-4 w-px shrink-0 bg-stone-200/90" aria-hidden />
              <div className="flex h-8 min-w-0 items-center">
                {affState === 'loading' ? (
                  <span className="inline-flex h-8 items-center text-xs text-stone-500">Shaping affirmation…</span>
                ) : affState === 'error' ? (
                  <button
                    type="button"
                    onClick={onGenerateAff}
                    className="inline-flex h-8 max-w-full items-center truncate text-xs text-red-600 hover:text-red-800 underline-offset-2 hover:underline transition-colors"
                  >
                    Could not generate. Try again
                  </button>
                ) : affirmation ? (
                  <button
                    type="button"
                    onClick={() => setDialogOpen('aff')}
                    className="inline-flex h-8 max-w-full items-center truncate rounded-md px-2 text-xs font-medium text-primary transition-colors hover:bg-primary-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    View affirmation
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onGenerateAff}
                    className="inline-flex h-8 shrink-0 items-center rounded-lg border border-primary/25 bg-primary-muted/50 px-3 text-xs font-medium text-primary transition-all duration-200 hover:bg-primary-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    Generate affirmation
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>

      <Drawer open={dialogOpen !== null} onOpenChange={open => !open && setDialogOpen(null)}>
        <DrawerContent className="p-0">
          <DrawerHeader className="border-b border-stone-100/80 px-6 pb-3 pr-14 pt-1">
            <DrawerTitle className="text-base font-semibold tracking-tight text-stone-900">
              {dialogOpen === 'viz' ? 'Visualization' : 'Affirmation'}
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              {dialogOpen === 'viz'
                ? 'Mental picture for your practice, with your Kriyashakti line as context.'
                : 'Affirmation lines for your practice, with your Kriyashakti line as context.'}
            </DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-8 px-6 pb-8 pt-6">
              {dialogOpen === 'viz' && visualization && (
                <div className="text-pretty">
                  <p className="text-[1.0625rem] sm:text-lg font-normal leading-[1.65] tracking-[-0.02em] text-stone-900">
                    {visualization}
                  </p>
                </div>
              )}
              {dialogOpen === 'aff' && affirmation && (
                <div className="flex flex-col gap-5 text-pretty">
                  {affirmation.split('\n').map((line, i) => (
                    <p
                      key={i}
                      className="text-[1.0625rem] sm:text-lg font-normal leading-[1.65] tracking-[-0.015em] text-stone-800 italic"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}

              <div className="border-t border-stone-200/90 pt-6">
                <div className="flex gap-3.5">
                  <div className="mt-0.5 w-1 shrink-0 self-stretch min-h-[2.75rem] rounded-full bg-primary/25" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/70">Kriyashakti</p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-stone-500">{option}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
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
}) {
  const total = options.length
  const [index, setIndex] = useState(() =>
    initialOptionIndex != null && initialOptionIndex >= 0 && initialOptionIndex < options.length
      ? initialOptionIndex
      : 0,
  )
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
  const bottomOpacity = useTransform(x, [-30, 0], [0, 1])
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
    const key = makeFavoriteDedupeKey(sessionId, wishIndexNum, index)
    isFavoriteDedupeKey(key)
      .then(ok => {
        if (!cancelled) setFavorited(ok)
      })
      .catch(() => {
        if (!cancelled) setFavorited(false)
      })
    return () => {
      cancelled = true
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
    } catch {
      setAffStates(prev => prev.map((s, i) => i === cardIndex ? 'error' : s))
    }
  }

  return (
    <div className="w-full">
      {showPrimaryHeading ? (
        <header className="mb-5 text-left">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 text-balance text-pretty sm:text-[1.75rem]">
            Pick what feels right
          </h1>
          <p className="mt-2 text-sm font-medium text-stone-500">
            Statement {index + 1} of {total}
          </p>
        </header>
      ) : (
        <p className="text-xs font-medium tracking-[0.08em] text-primary/80 uppercase mb-3">
          Version {index + 1} of {total} — pick what feels right
        </p>
      )}

      {total > 1 && <SwipeHint />}

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
            className="rounded-2xl border border-stone-100/90 bg-white/90 px-6 py-6 shadow-sm shadow-stone-900/5 overflow-hidden"
            style={{ opacity: behindOpacity }}
          >
            <p className="text-stone-800 text-base font-semibold leading-relaxed text-pretty pr-14 min-h-20">
              {options[behindIndex]}
            </p>
          </motion.div>
          <div
            className={cn(
              'pointer-events-none shrink-0 border-t border-transparent pt-0',
              sessionId ? 'min-h-[6.75rem]' : 'min-h-[4.5rem]',
            )}
            aria-hidden
          />
        </motion.div>

        {/* Top draggable card */}
        <SwipeCard
          ref={cardRef}
          className="col-start-1 row-start-1"
          option={options[index]}
          visualization={visualizations[index]}
          vizState={vizStates[index]}
          onGenerateViz={() => handleGenerateViz(index)}
          affirmation={affirmations[index]}
          affState={affStates[index]}
          onGenerateAff={() => handleGenerateAff(index)}
          onSwipe={handleSwipe}
          x={x}
          favorited={favorited}
          onToggleFavorite={handleToggleFavorite}
          favoriteEnabled={Boolean(sessionId)}
          favoriteSaving={favoriteSaving}
          favoriteError={favoriteError}
          bottomOpacity={bottomOpacity}
        />
      </div>

      <motion.div style={{ opacity: bottomOpacity }} className="flex items-center justify-between mt-4 px-1">
        <button
          type="button"
          onClick={goPrev}
          className="rounded-full px-4 py-1.5 text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100/90 transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          title="Go to previous statement"
        >
          Previous
        </button>
        <div className="flex gap-1.5 items-center">
          {options.map((_, i) => (
            <span
              key={i}
              className={`rounded-full transition-all duration-200 ${i === index ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-stone-200'}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={goNext}
          className="rounded-full px-4 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100/90 transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          Next →
        </button>
      </motion.div>
    </div>
  )
}
