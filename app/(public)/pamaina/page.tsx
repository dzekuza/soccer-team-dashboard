import type { Metadata } from "next"
import { AcademyView } from "@/views/academy-view"

export const metadata: Metadata = {
  title: "Pamaina | FK Banga",
  description:
    "FK Gargždų Banga vaikų ir jaunimo futbolo grupės: berniukai 2015–2020 m. gimimo, mergaitės 2012–2018 m. gimimo. Treniruočių grupės ir kontaktai.",
}

export default function Page() {
  return <AcademyView />
}
