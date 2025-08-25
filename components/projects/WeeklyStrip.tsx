"use client"

type Day = { date: string; total: number }

export function WeeklyStrip({ days }: { days: Day[] }) {
  const totals = days.map((d) => d.total)
  const max = Math.max(1, ...totals)
  const min = Math.min(0, ...totals)
  const range = Math.max(1, max - min)

  const intensity = (t: number) => (t - min) / range

  return (
    <div>
      <div className="flex items-center gap-1">
        {days.map((d) => {
          const i = Math.max(0, Math.min(1, intensity(d.total)))
          const bg = `linear-gradient(135deg, rgba(255,122,24,${0.2 + i * 0.6}) 0%, rgba(255,61,84,${0.2 + i * 0.6}) 100%)`
          return (
            <div
              key={d.date}
              className="h-3 w-3 rounded-[3px] border border-white/10"
              title={`${d.date} — ${d.total >= 0 ? "+" : ""}${Math.round(d.total)}`}
              style={{ backgroundImage: bg }}
            />
          )
        })}
      </div>
      <div className="mt-1 text-right text-[10px] text-foreground/60">Last 7 days</div>
    </div>
  )
}


