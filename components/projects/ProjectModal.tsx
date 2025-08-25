"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { getProjectForEdit, updateProject, createProjectActivity } from "@/app/(actions)/projects"
import { motion, AnimatePresence } from "framer-motion"
import { X, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ProjectSubtaskRow } from "@/components/projects/ProjectSubtaskRow"
import { useIsMobile } from "@/components/ui/use-mobile"

type Subtask = { id?: string; name: string; target: number; unit?: string; order?: number }

type Props = {
  mode: "create" | "edit"
  projectId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreatedOrUpdated?: (createdId?: string) => void
}

const EMOJI_OPTIONS = [
  "🎯","💪","📚","🏃","🧘","💧","🎨","🎵","🍎","💤","📝","🌱","🏋️","🚶","🧠","❤️","🌟","⚡","🔥","✨",
  "💻","💡","💰","📈","📅","✅","🎉","🏆","🥇","🚀",
]

export function ProjectModal({ mode, projectId, open, onOpenChange, onCreatedOrUpdated }: Props) {
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("🧩")
  const [description, setDescription] = useState("")
  const [subtasks, setSubtasks] = useState<Subtask[]>([{ name: "", target: 10 }])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const previousActiveElRef = useRef<Element | null>(null)
  const isMobile = useIsMobile()
  const [step, setStep] = useState<"details" | "subtasks">("details")

  // Load project when editing
  useEffect(() => {
    let active = true
    if (open && mode === "edit" && projectId) {
      getProjectForEdit({ projectId }).then((p) => {
        if (!active || !p) return
        setName(p.name || "")
        setEmoji(p.emoji || "🧩")
        setDescription(p.description || "")
        setSubtasks((p.subtasks || []).map((s) => ({ ...s, target: Number(s.target || 0) })))
      }).catch(() => {})
    } else if (open && mode === "create") {
      setName("")
      setEmoji("🧩")
      setDescription("")
      setSubtasks([{ name: "", target: 10 }])
    }
    return () => { active = false }
  }, [open, mode, projectId])

  useEffect(() => {
    if (open) {
      previousActiveElRef.current = document.activeElement
      document.body.style.overflow = "hidden"
      setError(null)
      setTimeout(() => titleRef.current?.focus(), 0)
    } else {
      document.body.style.overflow = ""
      if (previousActiveElRef.current instanceof HTMLElement) {
        setTimeout(() => (previousActiveElRef.current as HTMLElement).focus(), 0)
      }
    }
  }, [open])

  const addSubtask = () => setSubtasks((s) => (s.length >= 10 ? s : [...s, { name: "", target: 10 }]))
  const updateSubtask = (i: number, patch: Partial<Subtask>) =>
    setSubtasks((s) => s.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  const removeSubtask = (i: number) =>
    setSubtasks((s) => (s.length <= 1 ? s : s.filter((_, idx) => idx !== i)))

  const hasValidSubtask = useMemo(() =>
    subtasks.some((s) => s.name.trim().length > 0 && Number(s.target) > 0),
  [subtasks])

  const isValid = useMemo(() => {
    const nameOk = name.trim().length >= 2 && name.trim().length <= 40
    return nameOk && hasValidSubtask
  }, [name, hasValidSubtask])

  const onSubmit = () => {
    if (!isValid) return
    startTransition(async () => {
      try {
        setError(null)
        const filtered = subtasks
          .map((s, idx) => ({ ...s, target: Math.max(0, Number(s.target || 0)), order: idx }))
          .filter((s) => s.name.trim().length > 0 && s.target > 0)

        if (mode === "edit" && projectId) {
          await updateProject({ projectId, name: name.trim(), emoji, description: description.trim(), subtasks: filtered })
          onOpenChange(false)
          onCreatedOrUpdated?.(projectId)
        } else {
          const created = await createProjectActivity({ name: name.trim(), emoji, description: description.trim(), subtasks: filtered.map(({ id: _id, ...rest }) => rest) })
          onOpenChange(false)
          onCreatedOrUpdated?.(created?.id)
        }
      } catch (e: any) {
        setError(e?.message || "Failed to save project")
      }
    })
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation(); onOpenChange(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className={"fixed inset-0 z-50 flex " + (isMobile ? "items-end" : "items-center") + " justify-center p-0 md:p-4"} role="dialog" aria-modal="true" onKeyDown={onKeyDown}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          <motion.div
            initial={{ opacity: 0, y: isMobile ? 40 : 20, scale: isMobile ? 1 : 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isMobile ? 40 : 20, scale: isMobile ? 1 : 0.9 }}
            className={isMobile ? "relative w-full rounded-t-2xl md:rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border-0 max-h-[90svh] flex flex-col" : "relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border-0 md:max-h-[80vh] overflow-hidden flex flex-col"}
          >
            <div className="sticky top-0 z-10 bg-[var(--modal-bg,#111827)]/90 backdrop-blur supports-[backdrop-filter]:bg-[var(--modal-bg,#111827)]/70 border-b border-white/5 px-4 py-3 md:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                    <Flame className="h-6 w-6 text-white" />
                  </div>
                  <h2 ref={titleRef} tabIndex={-1} className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {mode === "create" ? "Add Project" : "Edit Project"}
                  </h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <form className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 md:px-6 py-4 md:py-6 space-y-6" onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Project Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Daily Workout" className="rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 h-12 text-base" aria-label="Project Name" />
                {name.trim().length > 0 && (name.trim().length < 2 || name.trim().length > 40) && (
                  <div className="mt-1 text-sm text-red-500">Name must be 2–40 characters.</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Choose an Emoji</label>
                <div className="border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-700/20 p-3 max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-10 gap-2">
                    {EMOJI_OPTIONS.map((emojiOption) => (
                      <button key={emojiOption} type="button" onClick={() => setEmoji(emojiOption)} className={`p-2 text-2xl rounded-lg transition-all hover:scale-110 aspect-square flex items-center justify-center ${emoji === emojiOption ? "bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/50 dark:to-red-900/50 ring-2 ring-orange-500 shadow-lg" : "hover:bg-gray-100 dark:hover:bg-gray-600"}`} aria-label={`Emoji ${emojiOption}`}>
                        {emojiOption}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Description (Optional)</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of your project..." className="rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 resize-none text-base" rows={3} aria-label="Description (Optional)" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Subtasks</label>
                  <Button type="button" size="sm" variant="secondary" onClick={addSubtask} disabled={isPending || subtasks.length >= 10}>Add subtask</Button>
                </div>
                <div className="space-y-2">
                  {subtasks.map((s, i) => (
                    <ProjectSubtaskRow key={(s.id || "new") + "-" + i} value={s} onChange={(patch) => updateSubtask(i, patch)} onRemove={() => removeSubtask(i)} disableRemove={subtasks.length <= 1} compact={!!isMobile} />
                  ))}
                </div>
              </div>

              <div className="sticky bottom-0 z-10 bg-[var(--modal-bg,#111827)]/90 backdrop-blur border-t border-white/5 px-0 md:px-0 pt-2 pb-3" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
                <div className="flex space-x-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl h-12 border-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">Cancel</Button>
                  <Button type="submit" disabled={isPending || !isValid} className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0">{mode === "edit" ? "Save" : "Create"}</Button>
                </div>
              </div>
              {error && <div className="pt-2 text-sm text-red-500">{error}</div>}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}


