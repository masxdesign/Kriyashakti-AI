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

export default function OriginalWishCard({ wish }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  function handleEdit() {
    setPendingEdit(wish)
    clearWishResult()
    navigate({ to: '/' })
  }

  return (
    <section className="w-full max-w-2xl">
      <h2 className="text-xs font-medium tracking-[0.14em] text-stone-500 mb-2">
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
        className="rounded-2xl border border-stone-100/90 bg-white/90 px-6 py-5 text-stone-800 text-base font-medium leading-relaxed cursor-pointer shadow-sm shadow-stone-900/5 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-stone-900/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 italic text-pretty"
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
