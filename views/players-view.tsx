import { PageHeading } from "@/components/common/page-heading"
import { LoadError } from "@/components/common/load-error"
import { PlayersBoard } from "@/components/players/players-board"
import { getPlayers } from "@/lib/players"

interface PlayersViewProps {
  /** Squad to open first, e.g. "BANGA B". */
  initialTeam?: string
}

export async function PlayersView({ initialTeam }: PlayersViewProps) {
  const players = await getPlayers()

  return (
    <>
      <PageHeading title="Žaidėjai" />
      {players ? <PlayersBoard players={players} initialTeam={initialTeam} /> : <LoadError subject="žaidėjų" />}
    </>
  )
}
