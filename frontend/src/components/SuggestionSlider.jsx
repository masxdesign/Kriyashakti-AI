import { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { motion, useMotionValue, useTransform, useMotionValueEvent, animate } from 'motion/react'
import { useDrag } from '@use-gesture/react'
import { generateVisualization, generateAffirmation } from '../api/processWish.js'

const SwipeCard = forwardRef(function SwipeCard({
  option, visualization, vizState, onGenerateViz,
  affirmation, affState, onGenerateAff,
  onSwipe, x
}, ref) {
  const rotate = useTransform(x, [-300, 300], [-25, 25])
  const opacity = useTransform(x, [-400, -200, 0, 200, 400], [0, 1, 1, 1, 0])
  const flying = useRef(false)

  const nextLabel = useTransform(x, v => v < -40 ? 1 : 0)
  const prevLabel = useTransform(x, v => v > 40 ? 1 : 0)

  useImperativeHandle(ref, () => ({
    flyOut(direction) {
      if (flying.current) return
      flying.current = true
      const flyTo = direction === 'right' ? 500 : -500
      animate(x, flyTo, { duration: 0.3, ease: 'easeOut' }).then(() => {
        onSwipe(direction)
      })
    }
  }))

  const bind = useDrag(({ down, movement: [mx], velocity: [vx], canceled, event, cancel }) => {
    if (flying.current) return

    if (event?.target?.closest('button')) {
      cancel()
      return
    }

    if (down) {
      x.set(mx)
      return
    }

    if (canceled) {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 })
      return
    }

    const shouldFly = Math.abs(mx) > 100 || Math.abs(vx) > 0.5
    if (shouldFly) {
      flying.current = true
      const flyTo = mx > 0 ? 500 : -500
      animate(x, flyTo, { duration: 0.3, ease: 'easeOut' }).then(() => {
        onSwipe(mx > 0 ? 'right' : 'left')
      })
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 })
    }
  }, { filterTaps: true, pointer: { capture: false } })

  return (
    <motion.div
      {...bind()}
      style={{ x, rotate, opacity, touchAction: 'none' }}
      className="absolute inset-0 rounded-2xl border border-stone-100 bg-white px-6 py-6 flex flex-col gap-4 cursor-grab active:cursor-grabbing overflow-hidden"
    >
      <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1">
        <p className="text-stone-800 text-base font-medium leading-snug">{option}</p>

        {/* Visualization section */}
        <div>
          {visualization ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Picture this in your mind</p>
              <p className="text-stone-600 text-sm leading-relaxed">{visualization}</p>
            </>
          ) : vizState === 'loading' ? (
            <Skeleton />
          ) : vizState === 'error' ? (
            <button onClick={onGenerateViz} className="text-xs text-red-400 hover:text-red-600 transition-colors text-left">
              Failed to generate. Try again →
            </button>
          ) : (
            <button onClick={onGenerateViz} className="mt-1 rounded-full border border-violet-200 px-4 py-1.5 text-xs text-violet-500 hover:bg-violet-50 transition-colors">
              Generate visualization
            </button>
          )}
        </div>

        {/* Affirmation section — only visible after visualization is done */}
        {visualization && (
          <div>
            {affirmation ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Your affirmation</p>
                <div className="flex flex-col gap-0.5">
                  {affirmation.split('\n').map((line, i) => (
                    <p key={i} className="text-stone-600 text-sm leading-relaxed italic">{line}</p>
                  ))}
                </div>
              </>
            ) : affState === 'loading' ? (
              <Skeleton />
            ) : affState === 'error' ? (
              <button onClick={onGenerateAff} className="text-xs text-red-400 hover:text-red-600 transition-colors text-left">
                Failed to generate. Try again →
              </button>
            ) : (
              <button onClick={onGenerateAff} className="rounded-full border border-amber-200 px-4 py-1.5 text-xs text-amber-600 hover:bg-amber-50 transition-colors">
                Generate affirmation
              </button>
            )}
          </div>
        )}
      </div>

      <motion.div style={{ opacity: nextLabel }} className="absolute right-4 top-4 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-400 pointer-events-none">
        next →
      </motion.div>
      <motion.div style={{ opacity: prevLabel }} className="absolute left-4 top-4 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-400 pointer-events-none">
        ← prev
      </motion.div>
    </motion.div>
  )
})

function Skeleton() {
  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="h-3 bg-stone-100 rounded-full animate-pulse w-full" />
      <div className="h-3 bg-stone-100 rounded-full animate-pulse w-5/6" />
      <div className="h-3 bg-stone-100 rounded-full animate-pulse w-4/6" />
    </div>
  )
}

export default function SuggestionSlider({ options, visualizations: initialVisualizations, affirmations: initialAffirmations, onVisualizationsGenerated, onAffirmationsGenerated }) {
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

  useMotionValueEvent(x, 'change', val => {
    const next = val < 0 ? (index + 1) % total : (index - 1 + total) % total
    setBehindIndex(next)
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

  const behindViz = visualizations[behindIndex]
  const behindVizState = vizStates[behindIndex]
  const behindAff = affirmations[behindIndex]

  return (
    <div className="w-full">
      <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-3">
        Version {index + 1} of {total} — pick the one that feels right
      </p>

      <div className="relative h-[340px] select-none">
        {/* Card behind */}
        <motion.div
          className="absolute inset-0 rounded-2xl border border-stone-100 bg-white px-6 py-6 flex flex-col gap-4 overflow-hidden"
          style={{
            scale: useTransform(x, [-300, -60, 0, 60, 300], [1, 1, 0.97, 1, 1]),
            transformOrigin: 'bottom',
          }}
        >
          <div className="flex flex-col gap-4 overflow-hidden flex-1">
            <p className="text-stone-800 text-base font-medium leading-snug">{options[behindIndex]}</p>
            {behindViz ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Picture this in your mind</p>
                <p className="text-stone-600 text-sm leading-relaxed">{behindViz}</p>
              </div>
            ) : behindVizState === 'loading' ? (
              <Skeleton />
            ) : null}
            {behindViz && behindAff && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Your affirmation</p>
                <div className="flex flex-col gap-0.5">
                  {behindAff.split('\n').map((line, i) => (
                    <p key={i} className="text-stone-600 text-sm leading-relaxed italic">{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top draggable card */}
        <SwipeCard
          ref={cardRef}
          key={index}
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
          onClick={goPrev}
          className="rounded-full px-4 py-1.5 text-sm text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
        >
          ← Prev
        </button>
        <div className="flex gap-1.5 items-center">
          {options.map((_, i) => (
            <span
              key={i}
              className={`rounded-full transition-all duration-200 ${i === index ? 'w-4 h-1.5 bg-violet-400' : 'w-1.5 h-1.5 bg-stone-200'}`}
            />
          ))}
        </div>
        <button
          onClick={goNext}
          className="rounded-full px-4 py-1.5 text-sm text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
