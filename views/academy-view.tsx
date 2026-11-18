import Link from "next/link"
import { PublicNavigation } from "@/components/public-navigation"
import { PublicFooter } from "@/components/public-footer"
import { PageHeading } from "@/components/common/page-heading"
import { ContentSection } from "@/components/common/content-section"
import { AcademyGroupCard } from "@/components/club/academy-group-card"
import {
  ACADEMY_BOYS_GROUPS,
  ACADEMY_GIRLS_GROUPS,
  ACADEMY_INTRO,
  CLUB_CONTACT_PEOPLE,
} from "@/lib/club-content"
import { CLUB_DOCUMENT_GROUPS } from "@/lib/club-documents"

export function AcademyView() {
  const youthProgram = CLUB_DOCUMENT_GROUPS.find((group) => group.id === "jaunuju-ugdymas")?.documents[0]
  const youthLead = CLUB_CONTACT_PEOPLE.find((person) => person.role.startsWith("Jaunimo"))

  return (
    <div className="min-h-screen bg-background text-white">
      <PublicNavigation currentPage="pamaina" />

      <main>
        <PageHeading title="Pamaina" />

        <ContentSection id="futbolas-vienija" title="Futbolas vienija!">
          <p className="max-w-prose text-lg leading-relaxed text-white">{ACADEMY_INTRO}</p>
          <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
            Pasirinkite savo vaiko gimimo metų grupę ir paskambinkite nurodytam kontaktiniam asmeniui.
          </p>
        </ContentSection>

        <ContentSection id="berniukai" title="Berniukų grupės">
          <ul className="grid gap-4 sm:grid-cols-2">
            {ACADEMY_BOYS_GROUPS.map((group) => (
              <li key={group.birthYears}>
                <AcademyGroupCard group={group} audience="berniukai" />
              </li>
            ))}
          </ul>
        </ContentSection>

        <ContentSection id="mergaites" title="Mergaičių grupės">
          <ul className="grid gap-4 sm:grid-cols-2">
            {ACADEMY_GIRLS_GROUPS.map((group) => (
              <li key={group.birthYears}>
                <AcademyGroupCard group={group} audience="mergaitės" />
              </li>
            ))}
          </ul>
        </ContentSection>

        <ContentSection id="ugdymo-programa" title="Ugdymo programa">
          <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
            Vaikų ir jaunimo ugdymas vykdomas pagal Klaipėdos rajono savivaldybės tarybos patvirtintą „Jaunųjų futbolininkų ugdymo“ programą.
          </p>
          {youthProgram ? (
            <a
              href={youthProgram.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-medium text-primary underline underline-offset-4 hover:text-primary-strong"
            >
              {youthProgram.title}
              <span className="sr-only"> (PDF, atidaroma naujame lange)</span>
            </a>
          ) : null}
          <p className="text-base text-muted-foreground">
            Visos programos ir kiti dokumentai:{" "}
            <Link href="/klubas#dokumentai" className="text-primary underline underline-offset-4 hover:text-primary-strong">
              Klubo dokumentai
            </Link>
          </p>
        </ContentSection>

        {youthLead ? (
          <ContentSection id="susisiekite" title="Susisiekite">
            <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
              Neradote savo amžiaus grupės arba turite klausimų? Rašykite jaunimo ugdymo programų vadovui.
            </p>
            <p className="text-lg font-semibold text-white">{youthLead.name}</p>
            <a href={`mailto:${youthLead.email}`} className="text-primary hover:text-primary-strong">
              {youthLead.email}
            </a>
          </ContentSection>
        ) : null}
      </main>

      <PublicFooter />
    </div>
  )
}
