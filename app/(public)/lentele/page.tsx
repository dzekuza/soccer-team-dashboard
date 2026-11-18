import type { Metadata } from "next"
import { StandingsView } from "@/views/standings-view"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Turnyrinė lentelė | FK Banga",
  description: "FK Banga komandų turnyrinė lentelė.",
}

export default function Page() {
  return <StandingsView />
}
