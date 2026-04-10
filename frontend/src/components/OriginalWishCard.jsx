import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { setPendingEdit, clearWishResult } from '../store/wishResult.js'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export default function OriginalWishCard({ wish, variant = 'default' }) {
  const secondary = variant === 'secondary'
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  function handleEdit() {
    setPendingEdit(wish)
    clearWishResult()
    navigate({ to: '/' })
  }

  return (
    <section className={cn('w-full max-w-2xl', secondary && 'pt-1')}>
      <h2
        className={cn(
          'mb-2 font-medium',
          secondary
            ? 'text-[11px] tracking-[0.12em] text-stone-400'
            : 'text-xs tracking-[0.14em] text-stone-500',
        )}
      >
        Original wish
      </h2>
      <blockquote
        onClick={() => setOpen(true)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(true)
          }
        }}
        tabIndex={0}
        role="button"
        className={cn(
          'rounded-2xl border cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 italic text-pretty',
          secondary
            ? 'border-stone-200/70 bg-stone-50/60 px-4 py-3.5 text-sm font-normal leading-relaxed text-stone-600 shadow-none hover:border-stone-300/90 hover:bg-stone-100/50'
            : 'border-stone-100/90 bg-white/90 px-6 py-5 text-stone-800 text-base font-medium leading-relaxed shadow-sm shadow-stone-900/5 hover:border-primary/30 hover:shadow-md hover:shadow-stone-900/8',
        )}
      >
        &ldquo;{wish}&rdquo;
      </blockquote>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit your wish?</DialogTitle>
            <DialogDescription>
              We&apos;ll send you back to the input screen with this text filled in so you can refine it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-stone-200 px-5 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            >
              Yes, edit it
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
