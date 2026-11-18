import type { Metadata } from "next"
import { NewsView } from "@/views/news-view"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Naujienos | FK Banga",
  description: "Naujausios FK Banga naujienos.",
}

export default function Page() {
  return <NewsView />
}
