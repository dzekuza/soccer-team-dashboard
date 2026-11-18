/**
 * Public documents of VšĮ „Gargždų futbolas“, published on the club website.
 * Source: https://www.fkbanga.lt/klubas (copied 2026-11-18). Files stay hosted there.
 */
export interface ClubDocument {
  title: string
  href: string
}

export interface ClubDocumentGroup {
  id: string
  title: string
  documents: ClubDocument[]
}

export const CLUB_DOCUMENT_GROUPS: ClubDocumentGroup[] = [
  {
    "id": "istatai",
    "title": "Įstatai",
    "documents": [
      {
        "title": "Viešosios įstaigos “Gargždų futbolas” įstatai, priimti dalininkų susirinkime 2016 metų gegužės 2 dieną",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2018/07/Istatai2016.pdf"
      }
    ]
  },
  {
    "id": "savivaldybes-lukesciai",
    "title": "Savivaldybės lūkesčiai",
    "documents": [
      {
        "title": "Lūkesčių raštas viešajai įstaigai “Gargždų futbolas” 2026-2028 metų laikotarpiui (patvirtintas Klaipėdos rajono savivaldybės mero 2026 m. sausio 2 d. potvarkiu)",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2026/01/20260102_lukesciai.pdf"
      }
    ]
  },
  {
    "id": "jaunuju-ugdymas",
    "title": "Jaunųjų futbolininkų ugdymas",
    "documents": [
      {
        "title": "Viešosios įstaigos “Gargždų futbolas” 2025-2027 metų “Jaunųjų futbolininkų ugdymo” programa, patvirtinta Klaipėdos rajono savivaldybės tarybos 2024 m. gruodžio 19 d. Nr. T11-564",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2025/03/T11_564_20241219.pdf"
      },
      {
        "title": "Viešosios įstaigos “Gargždų futbolas” 2022-2024 metų “Jaunųjų futbolininkų ugdymo” programa, patvirtinta Klaipėdos rajono savivaldybės tarybos 2022 metų sausio 27 d. Nr. T11-40",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2022/04/T11-40_20220127.pdf"
      },
      {
        "title": "Viešosios įstaigos “Gargždų futbolas” 2019-2021 metų “Jaunųjų futbolininkų ugdymo” programos (patvirtintos Klaipėdos rajono savivaldybės tarybos 2019 metų vasario 28 d. Nr. T11-53) pakeitimas, patvirtintas Klaipėdos rajono savivaldybės tarybos 2020 metų balandžio 16 d. Nr. T11-107",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2020/09/T11-107.pdf"
      },
      {
        "title": "Viešosios įstaigos “Gargždų futbolas” 2019-2021 metų “Jaunųjų futbolininkų ugdymo” programa, patvirtinta Klaipėdos rajono savivaldybės tarybos 2019 metų vasario 28 d. Nr. T11-53",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2019/03/T11-53_20190228.pdf"
      },
      {
        "title": "Viešosios įstaigos “Gargždų futbolas” 2018 metų “Jaunųjų futbolininkų ugdymo” programa, patvirtinta Klaipėdos rajono savivaldybės tarybos 2018 metų vasario 8 d. Nr. T11-34",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2018/07/2018_JUP.pdf"
      }
    ]
  },
  {
    "id": "darbo-uzmokestis",
    "title": "Darbo užmokestis",
    "documents": [
      {
        "title": "Darbuotojų, einančių vienodas pareigas, vidutinis mėnesio darbo užmokestis (bruto)",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2020/09/GFuzmokestis.pdf"
      }
    ]
  },
  {
    "id": "viesieji-pirkimai",
    "title": "Viešieji pirkimai",
    "documents": [
      {
        "title": "Supaprastintų viešųjų pirkimų taisyklės, patvirtintos Viešosios įstaigos „Gargždų futbolas“ direktoriaus 2017 m. birželio 27 d. įsakymu Nr.GF-22",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2018/07/2017vptaisykles.pdf"
      },
      {
        "title": "Mažos vertės pirkimų aprašas, patvirtintas Viešosios įstaigos „Gargždų futbolas“ direktoriaus 2017 m. rugsėjo 30 d. įsakymu Nr.GF-30",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2018/07/2017vptvarka.pdf"
      },
      {
        "title": "2020 metų Viešųjų pirkimų planas [2020-01-15]",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2020/12/2020-VP-planas_20200115.pdf"
      },
      {
        "title": "2020 metų Viešųjų pirkimų planas [2020-02-03]",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2020/12/2020-VP-planas_20200203.pdf"
      }
    ]
  },
  {
    "id": "tvarumo-strategija",
    "title": "Socialinio ir aplinkosauginio tvarumo strategija",
    "documents": [
      {
        "title": "Socialinio ir aplinkosauginio tvarumo strategija",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2025/03/SATS_2025.pdf"
      }
    ]
  },
  {
    "id": "vaiku-saugumo-strategija",
    "title": "Vaikų saugumo užtikrinimo strategija",
    "documents": [
      {
        "title": "Vaikų saugumo užtikrinimo strategija",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2025/03/VSU_strategija.pdf"
      }
    ]
  },
  {
    "id": "ataskaitos",
    "title": "Veiklos ir finansinės ataskaitos",
    "documents": [
      {
        "title": "VšĮ „Gargždų futbolas“ 2024 m. sausio-gruodžio mėn. finansinių ataskaitų rinkinys",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2025/03/GF_finansine2024.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ 2023 m. sausio-gruodžio mėn. finansinių ataskaitų rinkinys",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2024/04/GF_finansine_2023.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ veiklos ataskaita ir Valdybos veiklos ataskaita už 2023 metus",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2024/04/GF_ataskaitos-dalininkams_2024.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ 2022 m. sausio-gruodžio mėn. finansinių ataskaitų rinkinys",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2024/01/2022_finansine_ataskaita.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ veiklos ataskaita ir Valdybos veiklos ataskaita už 2022 metus",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2024/01/2022_GF_veiklos_ataskaita.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ 2021 m. sausio-gruodžio mėn. finansinių ataskaitų rinkinys",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2024/01/2021_finansine_ataskaita.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ veiklos ataskaita ir Valdybos veiklos ataskaita už 2021 metus",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2024/01/2021_GF_veiklos_ataskaita.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ 2020 m. sausio-gruodžio mėn. finansinių ataskaitų rinkinys",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2021/09/GF_2020_finansine.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ valdybos veiklos ataskaita už 2020 metus",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2021/09/GF_2020_valdybos.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ veiklos ataskaita už 2020 metus",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2021/09/GF_2020_veiklos.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ 2019 m. sausio-gruodžio mėn. finansinių ataskaitų rinkinys",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2020/09/GF_20200430_finansine_ataskaita_2019.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ valdybos veiklos ataskaita už 2019 metus",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2020/09/GF_20200430_valdybos_ataskaita_2019.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ veiklos ataskaita už 2019 metus",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2020/09/GF_20200430_istaigos_veiklos_ataskaita_2019.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ 2018 m. sausio-gruodžio mėn. finansinių ataskaitų rinkinys",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2019/05/GF_2018_finansines.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ 2018 m. sausio-gruodžio mėn. aiškinamasis raštas",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2019/05/GF_2018_aiskinamasis.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ veiklos ataskaita už 2018 metus",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2019/05/GF_2018_veiklos.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ 2017 m. sausio-gruodžio mėn. finansinių ataskaitų rinkinys",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2018/07/GF_2017_finansine.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ veiklos ataskaita už 2017 metus",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2018/07/GF_2017_istaigos.pdf"
      },
      {
        "title": "VšĮ „Gargždų futbolas“ valdybos veiklos ataskaita už 2017 metus",
        "href": "https://www.fkbanga.lt/wp-content/uploads/2018/07/GF_2017_valdybos.pdf"
      }
    ]
  }
]
