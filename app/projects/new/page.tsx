"use client"

import { useState, useTransition } from "react"
import { createProjectActivity } from "@/app/(actions)/projects"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Subtask = { name: string; target: number; unit?: string; order?: number }

export default function NewProjectPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("🧩")
  const [description, setDescription] = useState("")
  const [subtasks, setSubtasks] = useState<Subtask[]>([{ name: "", target: 10 }])
  const [isPending, startTransition] = useTransition()

  const addSubtask = () => setSubtasks((s) => [...s, { name: "", target: 10 }])
  const updateSubtask = (i: number, patch: Partial<Subtask>) =>
    setSubtasks((s) => s.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  const removeSubtask = (i: number) => setSubtasks((s) => s.filter((_, idx) => idx !== i))

  const onSubmit = () => {
    startTransition(async () => {
      try {
        const filtered = subtasks.map((s, idx) => ({ ...s, order: idx })).filter((s) => s.name.trim().length > 0)
        const { id } = await createProjectActivity({ name, emoji, description, subtasks: filtered })
        toast.success("Project created")
        router.push(`/projects/${id}`)
      } catch (e: any) {
        toast.error(e?.message || "Failed to create project")
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-semibold">New Project</h1>
      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <label className="text-sm text-foreground/70">Emoji</label>
          <input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="sm:col-span-2 h-9 rounded-md bg-background border border-white/10 px-3" />
          <label className="text-sm text-foreground/70">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="sm:col-span-2 h-9 rounded-md bg-background border border-white/10 px-3" />
          <label className="text-sm text-foreground/70">Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="sm:col-span-2 h-9 rounded-md bg-background border border-white/10 px-3" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Subtasks</div>
            <Button size="sm" variant="secondary" onClick={addSubtask} disabled={isPending}>
              Add subtask
            </Button>
          </div>
          {subtasks.map((s, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <input
                placeholder="Name"
                value={s.name}
                onChange={(e) => updateSubtask(i, { name: e.target.value })}
                className="sm:col-span-6 h-9 rounded-md bg-background border border-white/10 px-3"
              />
              <input
                placeholder="Target"
                type="number"
                step={1}
                value={s.target}
                onChange={(e) => updateSubtask(i, { target: Number(e.target.value || 0) })}
                className="sm:col-span-3 h-9 rounded-md bg-background border border-white/10 px-3"
              />
              <input
                placeholder="Unit (optional)"
                value={s.unit || ""}
                onChange={(e) => updateSubtask(i, { unit: e.target.value })}
                className="sm:col-span-2 h-9 rounded-md bg-background border border-white/10 px-3"
              />
              <Button size="sm" variant="ghost" onClick={() => removeSubtask(i)} disabled={isPending}>
                Remove
              </Button>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={onSubmit} disabled={isPending || !name.trim() || subtasks.length === 0}>
            Create
          </Button>
        </div>
      </div>
    </div>
  )
}


