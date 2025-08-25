import { format } from "date-fns"

// Minimal local day normalization without date-fns-tz dependency
export function startOfLocalDay(date: Date, tz?: string): Date {
  try {
    const d = new Date(date)
    // If a timezone string is provided and Intl supports it, attempt basic shift
    const timeZone = tz || Intl.DateTimeFormat().resolvedOptions().timeZone
    if (timeZone) {
      // Derive the local parts in the target timezone via toLocaleString
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
        .formatToParts(d)
        .reduce<Record<string, string>>((acc, p) => {
          if (p.type !== "literal") acc[p.type] = p.value
          return acc
        }, {})

      const year = Number(parts.year)
      const month = Number(parts.month)
      const day = Number(parts.day)
      // Create a time in that timezone at 00:00:00 by finding the offset at that wall time
      const tzDate = new Date(
        new Date(
          `${parts.year}-${parts.month}-${parts.day}T00:00:00`
        ).toLocaleString("en-US", { timeZone })
      )
      return new Date(
        `${year.toString().padStart(4, "0")}-${month
          .toString()
          .padStart(2, "0")}-${day.toString().padStart(2, "0")}T00:00:00.000`
      )
    }
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
  } catch {
    const d = new Date(date)
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
  }
}

export function isoDay(date: Date, tz?: string): string {
  const start = startOfLocalDay(date, tz)
  return format(start, "yyyy-MM-dd")
}


