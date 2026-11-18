import type { Metadata } from "next"
import { LandingView } from "@/views/landing-view"

// Rebuilt at most once a minute: fast static HTML, news no more than 60s old.
export const revalidate = 60

export const metadata: Metadata = {
  title: "FK Banga – Gargždų futbolo klubas",
  description:
    "Gargždų „Bangos“ futbolo klubo naujienos, rungtynės, rezultatai, turnyrinė lentelė, bilietai ir parduotuvė.",
}

export default function Page() {
  return <LandingView />
}
