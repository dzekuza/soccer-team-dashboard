import { StandingsClient } from "./standings-client"

export default function LentelePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Turnyrinė lentelė</h1>
          <p className="text-gray-600">Tvarkykite komandų lentelės duomenis</p>
        </div>
      </div>
      <StandingsClient />
    </div>
  )
} 