"use client"

import { useEffect, useRef, useState } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

type Props = {
  onEdit?: () => void
  onDelete?: () => void
}

export function ProjectMenu({ onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const hoverTimeoutRef = useRef<any>(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("click", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("click", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  const isCoarsePointer = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(pointer: coarse)").matches

  const openNow = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setOpen(true)
  }
  const closeSoon = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => setOpen(false), 180)
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => { if (!isCoarsePointer) openNow() }}
      onMouseLeave={() => { if (!isCoarsePointer) closeSoon() }}
    >
      <button
        type="button"
        className="p-2 rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        aria-label="Project menu"
        onClick={(e) => { e.preventDefault(); setOpen((o) => !o) }}
        onMouseDown={(e) => e.stopPropagation()}
        title="Menu"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl z-10"
          onMouseEnter={() => { if (!isCoarsePointer) openNow() }}
          onMouseLeave={() => { if (!isCoarsePointer) closeSoon() }}
        >
          {onEdit && (
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center gap-2"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); onEdit() }}
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
          )}
          {onDelete && (
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 text-red-400 flex items-center gap-2"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); if (confirm("Delete project?")) onDelete() }}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}


