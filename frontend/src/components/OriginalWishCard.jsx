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
      <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
        Your Original Wish
      </h2>
      <blockquote
        onClick={() => setOpen(true)}
        className="rounded-2xl border border-stone-100 bg-white/80 px-6 py-4 text-stone-700 text-base italic leading-relaxed cursor-pointer hover:border-violet-200 hover:bg-violet-50/50 transition-colors"
      >
        "{wish}"
      </blockquote>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit your wish?</DialogTitle>
            <DialogDescription>
              This will take you back to the input screen with your wish pre-filled so you can refine it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setOpen(false)}
              className="rounded-full border border-stone-200 px-5 py-2 text-sm text-stone-500 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              className="rounded-full bg-violet-600 px-5 py-2 text-sm text-white hover:bg-violet-700 transition-colors"
            >
              Yes, edit it
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
