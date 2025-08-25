"use client"

type DayPoint = { date: string; total: number }

export function WeeklyMiniChart({ points }: { points: DayPoint[] }) {
  const totals = points.map((p) => p.total)
  const max = Math.max(1, ...totals)
  const width = 12
  const gap = 4
  const bars = points.length
  const svgWidth = bars * width + (bars - 1) * gap
  const svgHeight = 40

  const gradient = (i: number) => `url(#grad-${i})`

  return (
    <div>
      <svg width={svgWidth} height={svgHeight} role="img" aria-label="Last 7 days">
        {points.map((p, i) => {
          const h = Math.round(((p.total || 0) / max) * (svgHeight - 2))
          const x = i * (width + gap)
          const y = svgHeight - h
          const intensity = Math.max(0.25, Math.min(1, (p.total || 0) / max))
          const id = `grad-${i}`
          return (
            <g key={p.date}>
              <defs>
                <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={`rgba(255,122,24,${0.3 + 0.5 * intensity})`} />
                  <stop offset="100%" stopColor={`rgba(255,61,84,${0.3 + 0.5 * intensity})`} />
                </linearGradient>
              </defs>
              <rect x={x} y={y} width={width} height={h} rx={3} ry={3} fill={gradient(i)}>
                <title>{`${p.date} • +${Math.round(p.total || 0)}`}</title>
              </rect>
            </g>
          )
        })}
      </svg>
      <div className="mt-1 text-right text-[10px] text-foreground/60">Last 7 days</div>
    </div>
  )
}


