/**
 * Static club copy for the Klubas, Pamaina and Kontaktai pages.
 * Source: https://www.fkbanga.lt (klubas, pamaina, kontaktai), copied 2026-11-18.
 * Update here when staff, phone numbers or the address change.
 */

export interface ContactPerson {
  role: string
  name: string
  email: string
}

export const CLUB_LEGAL_NAME = "VšĮ „Gargždų futbolas“"

export const CLUB_ADDRESS = {
  street: "Kvietinių g. 26",
  city: "Gargždai",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Kvietini%C5%B3+g.+26%2C+Gargžd%C5%B3",
} as const

export const CLUB_PHONE = {
  label: "(8-46) 452782",
  href: "tel:+37046452782",
} as const

export const CLUB_CONTACT_PEOPLE: ContactPerson[] = [
  { role: "Direktorius", name: "Rimantas Mikalauskas", email: "rimas@fkbanga.lt" },
  { role: "Jaunimo ugdymo programų vadovas", name: "Pavel Kozlov", email: "pavel@fkbanga.lt" },
  { role: "Vyr. buhalterė", name: "Gerda Montvydienė", email: "montvgerda@yahoo.com" },
]

export const BANGA_CAMP_CONTACT = {
  email: "camp@fkbanga.lt",
  phone: { label: "+370 608 11 829", href: "tel:+37060811829" },
} as const

export const CLUB_INTRO: string[] = [
  "Gargždų „Bangos“ futbolo klubą sudaro profesionali vyrų futbolo komanda, moterų futbolo komanda, vaikų ir jaunimo futbolo grupės, kurių veikla rūpinasi viešoji įstaiga „Gargždų futbolas“.",
  "Viešoji įstaiga „Gargždų futbolas“, įsteigta 2002 metų gruodžio mėnesį, 2005 metų pabaigoje suvienijo Gargždų futbolo aistruolius ir 2006 metais pradėjo aktyvią veiklą, siekdama grąžinti buvusią Gargždų futbolo šlovę bei atgaivinti futbolo tradicijas.",
]

export const CLUB_LEADERSHIP: { role: string; people: string }[] = [
  { role: "Direktorius", people: "Rimantas Mikalauskas" },
  { role: "Valdybos pirmininkas", people: "Arturas Uosis" },
  {
    role: "Valdybos nariai (išrinkti 2024-04-25)",
    people: "Rinaldis Bendikas, Virginijus Simutis, Dainius Šatkus, Arturas Uosis",
  },
  {
    role: "Savivaldybės deleguoti valdybos nariai (3 metams)",
    people: "Jevgenijus Bardauskas (nuo 2025-05-29), Violeta Riaukienė, Algirdas Petravičius",
  },
]

export const CLUB_SHAREHOLDERS = {
  summary:
    "Nuo 2025 m. gruodžio 17 d. viešosios įstaigos „Gargždų futbolas“ dalininkais yra 31 fizinis ir juridinis asmuo.",
  major: [
    { holder: "Klaipėdos rajono savivaldybė", share: "34 % balsų" },
    { holder: "Labdaros ir paramos fondas „Gargždų rėmėjas“", share: "36,7 % balsų" },
  ],
  others:
    "Kiti dalininkai (R. Bendikas, V. Gailius, A. Giedraitis, O. Jakubaitis, A. Jasilionis, M. Jonelys, M. Kazlauskas, R. Lukošius, R. Mušauskas, R. Petkevičius, J. Riekašienė, R. Riekašius, G. Samsonik, K. Sinskas, M. Striauka, L. Šliuoža, T. Tamošauskas, A. Uosis, R. Vaišnoras, E. Vilimas, L. Virvilienė, R. Žutautas, L. Karbauskienės IĮ, UAB „Gargždų banga“, UAB „Neogroup“, UAB „Voltas“, VšĮ „Banga 1253“, VšĮ „Garsų harmonija“, asociacija „Gargždų Bangos draugai“) turi nuo 0,37 iki 3,30 procentų balsų.",
} as const

export const CLUB_ACTIVITIES: string[] = [
  "klubo žaidėjų (vaikų, paauglių, suaugusių ir merginų) pritraukimas ir valdymas;",
  "žaidėjų meistriškumo tobulinimas;",
  "futbolo infrastruktūros plėtra;",
  "trenerių kvalifikacijos kėlimas;",
  "įvairių futbolo varžybų ir renginių organizavimas įvairaus amžiaus ir meistriškumo futbolo mėgėjams.",
]

export interface AcademyGroup {
  /** Birth years of the children in the group, e.g. "2018 ir 2020". */
  birthYears: string
  contactName: string
  phone: { label: string; href: string }
}

export const ACADEMY_INTRO =
  "FK Gargždų Banga kviečia treniruotis 2015–2020 metais gimusius berniukus ir 2012–2018 metais gimusias mergaites suformuotose futbolo grupėse Gargžduose."

export const ACADEMY_BOYS_GROUPS: AcademyGroup[] = [
  { birthYears: "2018 ir 2020", contactName: "Aurimas Šlušnys", phone: { label: "+370 683 30801", href: "tel:+37068330801" } },
  { birthYears: "2017 ir 2019", contactName: "Nojus Šimkus", phone: { label: "+370 611 41191", href: "tel:+37061141191" } },
  { birthYears: "2016", contactName: "Pavel Kozlov", phone: { label: "+370 608 11829", href: "tel:+37060811829" } },
  { birthYears: "2015", contactName: "Monika Grikšaitė", phone: { label: "+370 647 52616", href: "tel:+37064752616" } },
]

export const ACADEMY_GIRLS_GROUPS: AcademyGroup[] = [
  { birthYears: "2012–2013 ir 2014–2015", contactName: "Simonas Alsys", phone: { label: "+370 635 43529", href: "tel:+37063543529" } },
  { birthYears: "2016–2018", contactName: "Paulina Lengvinienė", phone: { label: "+370 612 26833", href: "tel:+37061226833" } },
]
