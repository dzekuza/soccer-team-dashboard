/** Client-safe date helpers (no server imports). Dates are calendar days, so UTC avoids shifts. */

/** "2026 m. lapkričio 1 d." */
export function formatDayMonthYear(isoDate: string): string {
  return new Date(`${isoDate.slice(0, 10)}T00:00:00Z`).toLocaleDateString("lt-LT", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/** "14:15" from "14:15:00" */
export function formatTime(time: string | null): string {
  return time ? time.slice(0, 5) : ""
}
