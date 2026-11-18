import type { Metadata } from "next"
import { ClubView } from "@/views/club-view"

export const metadata: Metadata = {
  title: "Klubas | FK Banga",
  description:
    "Apie Gargždų „Bangos“ futbolo klubą: istorija, vadovybė, dalininkai, veiklos sritys ir viešieji dokumentai.",
}

export default function Page() {
  return <ClubView />
}
