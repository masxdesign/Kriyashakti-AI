import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useMotionValueEvent, animate, useReducedMotion } from 'motion/react'
import { useDrag } from '@use-gesture/react'
import { generateVisualization, generateAffirmation } from '../api/processWish.js'
import { cn } from '@/lib/utils'
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
    if (event?.target?.closest('button, a, [data-no-drag]')) {
      cancel()
      return
    }

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
    <motion.div
      {...bind()}
      initial={false}
      layout={false}
      style={{ x, rotate, touchAction: 'none' }}
      className={cn(
        'relative z-10 w-full cursor-grab active:cursor-grabbing',
        className,
      )}
    >
      <div className="flex flex-col rounded-2xl border border-stone-100/90 bg-white/95 px-6 py-6 shadow-sm shadow-stone-900/5">
        <p className="text-stone-800 text-base font-semibold leading-relaxed text-pretty pr-1">{option}</p>

          <div
            data-no-drag
            className={cn(
              'mt-5 flex min-h-8 flex-nowrap items-center gap-x-3 border-t border-stone-100/90 pt-4 sm:gap-x-4',
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
      </div>

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

      <motion.div style={{ opacity: nextLabel }} className="absolute right-4 top-4 rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary pointer-events-none">
        Next →
      </motion.div>
    </motion.div>
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
}) {
  const total = options.length
  const [index, setIndex] = useState(0)
  const [behindIndex, setBehindIndex] = useState(1 % total)

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
  const cardRef = useRef(null)
  const indexRef = useRef(index)
  indexRef.current = index

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
        {/* Card behind — same grid cell; row height = max(front, back) */}
        <motion.div
          className="col-start-1 row-start-1 w-full max-w-full rounded-2xl border border-stone-100/90 bg-white/90 px-6 py-6 flex flex-col overflow-hidden shadow-sm shadow-stone-900/5 z-0"
          style={{
            scale: useTransform(x, [-300, 0], [0.97, 1]),
            transformOrigin: 'bottom',
          }}
        >
          <p className="text-stone-800 text-base font-semibold leading-relaxed text-pretty">{options[behindIndex]}</p>
          <div
            className="mt-5 flex min-h-8 flex-nowrap items-center gap-x-3 border-t border-transparent pt-4 sm:gap-x-4"
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
        />
      </div>

      <div className="flex items-center justify-between mt-4 px-1">
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
      </div>
    </div>
  )
}
