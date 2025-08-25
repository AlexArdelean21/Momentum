"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { createProjectActivity, upsertProjectSubtasks } from "@/app/(actions)/projects"
import { motion, AnimatePresence } from "framer-motion"
import { X, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ProjectSubtaskRow } from "@/components/projects/ProjectSubtaskRow"

type Subtask = { id?: string; name: string; target: number; unit?: string; order?: number }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "create" | "edit"
  project?: {
    id: string
    name: string
    emoji?: string
    description?: string
    subtasks: Array<{ id: string; name: string; target: number; unit?: string; order?: number }>
  }
  onCreatedOrUpdated?: (createdId?: string) => void
}

const EMOJI_OPTIONS = [
  "🎯","💪","📚","🏃","🧘","💧","🎨","🎵","🍎","💤","📝","🌱","🏋️","🚶","🧠","❤️","🌟","⚡","🔥","✨",
  "💻","💡","💰","📈","📅","✅","🎉","🏆","🥇","🚀",
  "🧗","🚵","🏊","🧘‍♂️","🤸","🏀","⚽","⚾","🎾","🏐",
  "🎨","🖌️","🎼","🎹","🎺","🥁","💃","🕺","🎤","🎧",
  "📖","✏️","🔬","🔭","⚗️","🧪","💾","📈","📊","💡",
  "🥗","🥑","🥦","🥕","🍓","🥝","🍵","🥤","💊","🩹",
  "🧼","🛏️","☀️","🌙","⭐","🏞️","🌅","🌆","🌲","🌳",
  "👨‍💻","👩‍💻","👨‍🏫","👩‍🏫","👨‍🎨","👩‍🎨","👨‍🍳","👩‍🍳","👨‍🔬","👩‍🔬",
  "💖","💞","💯","🙌","🙏","🤝","🤗","🥰","🥳","🤩",
  "☢️","🌚","🍃","🍳","🎰","🌠",
]

export function AddProjectModal({ open, onOpenChange, mode = "create", project, onCreatedOrUpdated }: Props) {
  const [name, setName] = useState(project?.name || "")
  const [emoji, setEmoji] = useState(project?.emoji || "🧩")
  const [description, setDescription] = useState(project?.description || "")
  const [subtasks, setSubtasks] = useState<Subtask[]>(project?.subtasks || [{ name: "", target: 10 }])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const previousActiveElRef = useRef<Element | null>(null)

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
    if (open && project) {
      setName(project.name || "")
      setEmoji(project.emoji || "🧩")
      setDescription(project.description || "")
      setSubtasks(project.subtasks || [])
    }
  }, [open, project])

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
          .map(({ id: _id, ...rest }) => rest)

        if (mode === "create") {
          const created = await createProjectActivity({ name: name.trim(), emoji, description: description.trim(), subtasks: filtered })
          onOpenChange(false)
          onCreatedOrUpdated?.(created?.id)
        } else if (project) {
          await upsertProjectSubtasks({ projectId: project.id, subtasks: filtered })
          onOpenChange(false)
          onCreatedOrUpdated?.(project.id)
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" onKeyDown={onKeyDown}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border-0"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <h2
                  ref={titleRef}
                  tabIndex={-1}
                  className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
                >
                  {mode === "create" ? "Add Project" : "Edit Project"}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Project Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Daily Workout"
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 h-12 text-base"
                  aria-label="Project Name"
                />
                {name.trim().length > 0 && (name.trim().length < 2 || name.trim().length > 40) && (
                  <div className="mt-1 text-sm text-red-500">Name must be 2–40 characters.</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Choose an Emoji</label>
                <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-700/20">
                  {EMOJI_OPTIONS.map((emojiOption) => (
                    <button
                      key={emojiOption}
                      type="button"
                      onClick={() => setEmoji(emojiOption)}
                      className={`p-1.5 text-xl rounded-lg transition-all hover:scale-110 aspect-square flex items-center justify-center ${
                        emoji === emojiOption
                          ? "bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/50 dark:to-red-900/50 ring-2 ring-orange-500 shadow-lg"
                          : "hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                      aria-label={`Emoji ${emojiOption}`}
                    >
                      {emojiOption}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Description (Optional)</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your project..."
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 resize-none text-base"
                  rows={3}
                  aria-label="Description (Optional)"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Subtasks</label>
                  <Button type="button" size="sm" variant="secondary" onClick={addSubtask} disabled={isPending || subtasks.length >= 10}>
                    Add subtask
                  </Button>
                </div>
                <div className="space-y-3">
                  {subtasks.map((s, i) => (
                    <ProjectSubtaskRow
                      key={s.id || i}
                      value={s}
                      onChange={(patch) => updateSubtask(i, patch)}
                      onRemove={() => removeSubtask(i)}
                      disableRemove={subtasks.length <= 1}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 rounded-xl h-12 border-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !isValid}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                >
                  Create
                </Button>
              </div>
              {error && <div className="pt-2 text-sm text-red-500">{error}</div>}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}


