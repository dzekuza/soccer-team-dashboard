import type { Metadata } from "next"
import { PlayersView } from "@/views/players-view"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Žaidėjai | FK Banga",
  description: "FK Banga žaidėjai: Banga A, Banga B ir Merginos.",
}

export default function Page() {
  return <PlayersView />
}
