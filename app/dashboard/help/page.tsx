import { HelpCircle, Calendar, Ticket, Users, BarChart2, QrCode, Download, Megaphone, BadgeCheck, Tag, ShoppingBag, BookOpen, Settings } from "lucide-react"
import HelpClient from "./help-client"

export default function HelpPage() {
  const helpSections = [
    {
      title: "Renginių valdymas",
      icon: Calendar,
      description: "Kaip kurti ir valdyti renginius",
      items: [
        {
          question: "Kaip sukurti naują renginį?",
          answer: "Eikite į 'Renginiai' skiltį ir spauskite 'Pridėti renginį'. Užpildykite visus reikalaujamus laukus: pavadinimą, datą, laiką, vietą ir aprašymą. Nustatykite bilietų kainas ir kiekius."
        },
        {
          question: "Kaip redaguoti esamą renginį?",
          answer: "Renginių sąraše spauskite ant renginio pavadinimo arba naudokite 'Redaguoti' mygtuką. Galite keisti bet kokią informaciją apie renginį, išskyrus jau parduotus bilietus."
        },
        {
          question: "Kaip atšaukti renginį?",
          answer: "Renginio redagavimo puslapyje naudokite 'Atšaukti renginį' mygtuką. Atšaukti renginiai automatiškai grąžina pinigus visiems bilietų pirkėjams."
        }
      ]
    },
    {
      title: "Bilietų valdymas",
      icon: Ticket,
      description: "Bilietų generavimas ir valdymas",
      items: [
        {
          question: "Kaip generuoti bilietus?",
          answer: "Renginio puslapyje spauskite 'Generuoti bilietus'. Pasirinkite bilietų tipą, kiekį ir kainą. Sistema automatiškai sukurs unikalius QR kodus kiekvienam bilietui."
        },
        {
          question: "Kaip valdyti bilietų pardavimą?",
          answer: "Bilietų skiltyje galite matyti visus parduotus bilietus, jų statusą ir pirkėjų informaciją. Galite atšaukti bilietus arba pakeisti jų statusą."
        },
        {
          question: "Kaip veikia QR kodai?",
          answer: "Kiekvienas bilietas turi unikalų QR kodą. QR skaitytuvas gali nuskaityti šiuos kodus ir patikrinti bilieto galiojimą realiu laiku."
        }
      ]
    },
    {
      title: "Prenumeratų valdymas",
      icon: BadgeCheck,
      description: "Prenumeratų tipų ir valdymas",
      items: [
        {
          question: "Kaip sukurti prenumeratos tipą?",
          answer: "Eikite į 'Prenumeratos tipai' ir spauskite 'Pridėti tipą'. Nustatykite pavadinimą, kainą, galiojimo laiką ir privilegijas (pvz., pirmenybė bilietų pirkimui)."
        },
        {
          question: "Kaip valdyti prenumeratas?",
          answer: "Prenumeratų skiltyje galite matyti visus prenumeratos narius, jų statusą ir prenumeratos istoriją. Galite atnaujinti arba atšaukti prenumeratas."
        },
        {
          question: "Kaip veikia automatinis atnaujinimas?",
          answer: "Sistema automatiškai siunčia priminimus apie prenumeratos galiojimo pabaigą ir siūlo atnaujinti prenumeratą."
        }
      ]
    },
    {
      title: "Gerbėjų valdymas",
      icon: Users,
      description: "Gerbėjų duomenų valdymas",
      items: [
        {
          question: "Kaip pridėti gerbėją?",
          answer: "Gerbėjų skiltyje spauskite 'Pridėti gerbėją' ir įveskite asmeninę informaciją: vardą, pavardę, el. paštą ir telefono numerį."
        },
        {
          question: "Kaip valdyti gerbėjų duomenis?",
          answer: "Galite redaguoti gerbėjų informaciją, peržiūrėti jų pirkimų istoriją ir prenumeratos statusą. Sistema automatiškai seka gerbėjų aktyvumą."
        },
        {
          question: "Kaip eksportuoti gerbėjų duomenis?",
          answer: "Naudokite 'Eksportas' skiltį, kad išsaugotumėte gerbėjų sąrašą CSV formatu arba integruotumėte su rinkodaros įrankiais."
        }
      ]
    },
    {
      title: "QR skaitytuvas",
      icon: QrCode,
      description: "Bilietų tikrinimas",
      items: [
        {
          question: "Kaip naudoti QR skaitytuvą?",
          answer: "Eikite į 'QR skaitytuvas' skiltį ir leiskite prieigą prie kameros. Nukreipkite kamerą į bilieto QR kodą, kad patikrintumėte jo galiojimą."
        },
        {
          question: "Ką reiškia skirtingi QR kodo rezultatai?",
          answer: "Žalias - bilietas galioja ir gali būti naudojamas. Raudonas - bilietas negalioja arba jau buvo naudotas. Geltonas - bilietas greitai pasibaigs."
        },
        {
          question: "Kaip veikia offline režimas?",
          answer: "QR skaitytuvas veikia ir be interneto ryšio. Duomenys bus sinchronizuoti, kai atsiras interneto ryšys."
        }
      ]
    },
    {
      title: "Parduotuvės valdymas",
      icon: ShoppingBag,
      description: "Prekių ir atributų valdymas",
      items: [
        {
          question: "Kaip pridėti prekę į parduotuvę?",
          answer: "Parduotuvės skiltyje spauskite 'Pridėti prekę'. Nustatykite pavadinimą, aprašymą, kainą, kiekį ir pridėkite nuotrauką."
        },
        {
          question: "Kaip valdyti prekių atsargas?",
          answer: "Sistema automatiškai seka prekių kiekius ir siunčia pranešimus, kai atsargos baigiasi. Galite rankiniu būdu atnaujinti kiekius."
        },
        {
          question: "Kaip nustatyti prekių atributus?",
          answer: "Prekės redagavimo puslapyje galite pridėti atributus: dydžius, spalvas, medžiagas ir kitas charakteristikas."
        }
      ]
    },
    {
      title: "Kuponų valdymas",
      icon: Tag,
      description: "Nuolaidų kuponų kūrimas",
      items: [
        {
          question: "Kaip sukurti nuolaidos kuponą?",
          answer: "Kuponų skiltyje spauskite 'Pridėti kuponą'. Nustatykite kodo pavadinimą, nuolaidos procentą arba sumą, galiojimo laiką ir naudojimo limitus."
        },
        {
          question: "Kaip veikia kuponų validacija?",
          answer: "Sistema automatiškai tikrina kuponų galiojimą, naudojimo limitus ir taiko nuolaidas bilietų ar prekių pirkimui."
        },
        {
          question: "Kaip sekti kuponų naudojimą?",
          answer: "Kuponų skiltyje galite matyti visus sukurtus kuponus, jų naudojimo statistiką ir efektyvumą."
        }
      ]
    },
    {
      title: "Rinkodaros įrankiai",
      icon: Megaphone,
      description: "Rinkodaros kampanijų valdymas",
      items: [
        {
          question: "Kaip sukurti rinkodaros kampaniją?",
          answer: "Rinkodaros skiltyje spauskite 'Nauja kampanija'. Nustatykite tikslinę auditoriją, pranešimą ir kampanijos laikotarpį."
        },
        {
          question: "Kaip siųsti el. laiškus gerbėjams?",
          answer: "Pasirinkite gerbėjų grupę ir sukurkite el. laiško šabloną. Sistema automatiškai siunčia personalizuotus laiškus."
        },
        {
          question: "Kaip sekti kampanijų rezultatus?",
          answer: "Rinkodaros skiltyje galite matyti kampanijų atidarymo, paspaudimo ir konversijos statistiką."
        }
      ]
    },
    {
      title: "Eksportas ir ataskaitos",
      icon: Download,
      description: "Duomenų eksportavimas",
      items: [
        {
          question: "Kokius duomenis galima eksportuoti?",
          answer: "Galite eksportuoti bilietų pardavimų, gerbėjų, renginių ir finansų duomenis įvairiais formatais (CSV, Excel, PDF)."
        },
        {
          question: "Kaip generuoti ataskaitas?",
          answer: "Eksporto skiltyje pasirinkite ataskaitos tipą, laikotarpį ir formatą. Sistema automatiškai sugeneruos ataskaitą."
        },
        {
          question: "Kaip nustatyti automatinius ataskaitų siuntimus?",
          answer: "Galite nustatyti, kad sistema automatiškai siųstų ataskaitas el. paštu nurodytu laiku."
        }
      ]
    },
    {
      title: "Sistemos nustatymai",
      icon: Settings,
      description: "Sistemos konfigūracija",
      items: [
        {
          question: "Kaip keisti sistemos nustatymus?",
          answer: "Sistemos skiltyje galite keisti organizacijos informaciją, el. pašto nustatymus, mokėjimo sąlygas ir kitus parametrus."
        },
        {
          question: "Kaip valdyti vartotojų prieigas?",
          answer: "Galite pridėti naujus vartotojus, nustatyti jų teises ir sekti jų veiklą sistemoje."
        },
        {
          question: "Kaip atnaujinti sistemos duomenis?",
          answer: "Sistema automatiškai atnaujina duomenis realiu laiku. Galite rankiniu būdu sinchronizuoti duomenis, jei reikia."
        }
      ]
    },
    {
      title: "Komandos valdymas",
      icon: Users,
      description: "Žaidėjų ir rungtynių valdymas",
      items: [
        {
          question: "Kaip pridėti naują žaidėją?",
          answer: "Eikite į 'Mano komanda' → 'Žaidėjai' ir spauskite 'Pridėti žaidėją'. Įveskite žaidėjo duomenis: vardą, pavardę, poziciją, numerį ir kitą informaciją."
        },
        {
          question: "Kaip kurti rungtynes?",
          answer: "Eikite į 'Mano komanda' → 'Rungtynės' ir spauskite 'Pridėti rungtynes'. Nustatykite varžovą, datą, laiką, vietą ir rungtynių tipą (namų, išvykos, turnyras)."
        },
        {
          question: "Kaip valdyti komandos lentelę?",
          answer: "Lentelės skiltyje galite matyti komandos poziciją, taškus, įmuštus ir praleistus įvarčius. Sistema automatiškai atnaujina lentelę po kiekvienų rungtynių."
        }
      ]
    },
    {
      title: "Šablonų valdymas",
      icon: Settings,
      description: "El. laiškų ir pranešimų šablonai",
      items: [
        {
          question: "Kaip sukurti el. laiško šabloną?",
          answer: "Šablonų skiltyje spauskite 'Naujas šablonas'. Pasirinkite šablono tipą (el. laiškas, SMS, pranešimas) ir sukurkite turinį su personalizacijos žymėmis."
        },
        {
          question: "Kaip naudoti personalizacijos žymes?",
          answer: "Naudokite žymes kaip {vardas}, {pavarde}, {renginys} ir {data} šablonuose. Sistema automatiškai pakeis jas tikrais duomenimis."
        },
        {
          question: "Kaip testuoti šablonus?",
          answer: "Šablono redagavimo puslapyje naudokite 'Testuoti' mygtuką, kad išsiųstumėte bandomąjį pranešimą į savo el. paštą."
        }
      ]
    }
  ]

  return <HelpClient helpSections={helpSections} />
}
