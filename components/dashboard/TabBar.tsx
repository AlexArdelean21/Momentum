"use client"

type Props = {
  active: "activities" | "projects"
  onChange: (tab: "activities" | "projects") => void
}

export function TabBar({ active, onChange }: Props) {
  return (
    <div className="flex space-x-2 rounded-xl bg-white/5 p-1 border border-white/10">
      <button
        type="button"
        onClick={() => onChange("activities")}
        className={
          "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 " +
          (active === "activities"
            ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white"
            : "text-gray-300 hover:text-white")
        }
        aria-pressed={active === "activities"}
      >
        Activities
      </button>
      <button
        type="button"
        onClick={() => onChange("projects")}
        className={
          "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 " +
          (active === "projects"
            ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white"
            : "text-gray-300 hover:text-white")
        }
        aria-pressed={active === "projects"}
      >
        Projects
      </button>
    </div>
  )
}


