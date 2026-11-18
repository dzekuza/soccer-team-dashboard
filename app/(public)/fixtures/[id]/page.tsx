import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FixtureView } from "@/views/fixture-view"
import { getFixtureById } from "@/lib/fixtures"

// Match pages are static HTML refreshed at most once a minute (scores, events).
export const revalidate = 60

// No pages are built ahead of time; each match is rendered on first visit, then cached (see revalidate).
export function generateStaticParams() {
  return []
}

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const fixture = await getFixtureById(id)
  if (!fixture) return { title: "Rungtynės nerastos | FK Banga" }

  const hasScore = fixture.homeScore !== null && fixture.awayScore !== null
  const score = hasScore ? ` ${fixture.homeScore}:${fixture.awayScore}` : ""

  return {
    title: `${fixture.homeTeam} – ${fixture.awayTeam}${score} | FK Banga`,
    description: `${fixture.homeTeam} – ${fixture.awayTeam}${score}. ${fixture.round ?? "Rungtynės"}, ${fixture.matchDate}.`,
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const fixture = await getFixtureById(id)
  if (!fixture) notFound()

  return <FixtureView fixture={fixture} />
}
