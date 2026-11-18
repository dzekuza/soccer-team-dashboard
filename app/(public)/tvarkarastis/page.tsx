import type { Metadata } from "next"
import { ScheduleView } from "@/views/schedule-view"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Tvarkaraštis | FK Banga",
  description: "FK Banga artimiausių rungtynių tvarkaraštis ir bilietai.",
}

export default function Page() {
  return <ScheduleView />
}
