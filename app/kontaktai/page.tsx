import type { Metadata } from "next"
import { ContactsView } from "@/views/contacts-view"

export const metadata: Metadata = {
  title: "Kontaktai | FK Banga",
  description:
    "FK Banga kontaktai: adresas Kvietinių g. 26, Gargždai, telefonas, darbuotojų el. paštai ir BANGA CAMP stovyklavietės rezervacija.",
}

export default function Page() {
  return <ContactsView />
}
