import type { Metadata } from "next"
import { ResultsView } from "@/views/results-view"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Rezultatai | FK Banga",
  description: "FK Banga sužaistų rungtynių rezultatai.",
}

export default function Page() {
  return <ResultsView />
}
