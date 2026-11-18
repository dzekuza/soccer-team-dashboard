import type { Metadata } from "next"
import { PlayersView } from "@/views/players-view"

export const metadata: Metadata = {
  title: "Žaidėjai | FK Banga",
  description: "FK Banga žaidėjai: Banga A, Banga B ir Merginos.",
}

interface PageProps {
  searchParams: Promise<{ team?: string }>
}

// Reads ?team= so the right squad is open in the first HTML; the data itself is cached for a minute.
export default async function Page({ searchParams }: PageProps) {
  const { team } = await searchParams
  return <PlayersView initialTeam={team} />
}
