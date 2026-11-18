import Image from "next/image"
import Link from "next/link"
import { PublicNavigation } from "@/components/public-navigation"
import { PublicFooter } from "@/components/public-footer"
import { PageHeading } from "@/components/common/page-heading"
import { ContentSection } from "@/components/common/content-section"
import { ClubDocuments } from "@/components/club/club-documents"
import {
  CLUB_ACTIVITIES,
  CLUB_ADDRESS,
  CLUB_CONTACT_PEOPLE,
  CLUB_INTRO,
  CLUB_LEADERSHIP,
  CLUB_LEGAL_NAME,
  CLUB_PHONE,
  CLUB_SHAREHOLDERS,
} from "@/lib/club-content"
import { CLUB_DOCUMENT_GROUPS } from "@/lib/club-documents"

export function ClubView() {
  const director = CLUB_CONTACT_PEOPLE[0]

  return (
    <div className="min-h-screen bg-background text-white">
      <PublicNavigation currentPage="klubas" />

      <main>
        <PageHeading title="Klubas" />

        <ContentSection id="apie-kluba" title="Apie klubą">
          {CLUB_INTRO.map((paragraph) => (
            <p key={paragraph} className="max-w-prose text-base leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          ))}
          <figure>
            <Image
              src="/club/klubas-banner.jpg"
              alt="Gargždų „Bangos“ sirgalių transparantas su užrašu „Už Tigrų, ekipą!“"
              width={660}
              height={300}
              className="h-auto w-full max-w-xl"
            />
          </figure>
        </ContentSection>

        <ContentSection id="vadovybe" title="Vadovybė">
          <dl className="space-y-5">
            {CLUB_LEADERSHIP.map((entry) => (
              <div key={entry.role}>
                <dt className="text-sm text-muted-foreground">{entry.role}</dt>
                <dd className="text-lg font-semibold text-white">{entry.people}</dd>
              </div>
            ))}
          </dl>
        </ContentSection>

        <ContentSection id="dalininkai" title="Dalininkai">
          <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
            {CLUB_SHAREHOLDERS.summary}
          </p>
          <ul className="space-y-2">
            {CLUB_SHAREHOLDERS.major.map((entry) => (
              <li key={entry.holder} className="flex flex-wrap justify-between gap-x-6 border-b border-surface pb-2">
                <span className="font-medium text-white">{entry.holder}</span>
                <span className="text-primary">{entry.share}</span>
              </li>
            ))}
          </ul>
          <details className="group max-w-prose">
            <summary className="cursor-pointer font-medium text-white hover:text-primary">
              Visi kiti dalininkai
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{CLUB_SHAREHOLDERS.others}</p>
          </details>
        </ContentSection>

        <ContentSection id="veiklos-sritys" title="Veiklos sritys">
          <ul className="max-w-prose list-disc space-y-2 pl-5 text-base leading-relaxed text-muted-foreground marker:text-primary">
            {CLUB_ACTIVITIES.map((activity) => (
              <li key={activity}>{activity}</li>
            ))}
          </ul>
        </ContentSection>

        <ContentSection id="dokumentai" title="Dokumentai">
          <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
            Įstatai, strategijos, pirkimų tvarka ir veiklos bei finansinės ataskaitos. Dokumentai atidaromi PDF formatu.
          </p>
          <ClubDocuments groups={CLUB_DOCUMENT_GROUPS} />
        </ContentSection>

        <ContentSection id="kontaktai" title="Kontaktai">
          <address className="space-y-1 not-italic text-muted-foreground">
            <p className="font-semibold text-white">{CLUB_LEGAL_NAME}</p>
            <p>
              {CLUB_ADDRESS.street}, {CLUB_ADDRESS.city}
            </p>
            <p>
              Tel.{" "}
              <a href={CLUB_PHONE.href} className="text-primary hover:text-primary-strong">
                {CLUB_PHONE.label}
              </a>
            </p>
            <p>
              {director.role}:{" "}
              <a href={`mailto:${director.email}`} className="text-primary hover:text-primary-strong">
                {director.email}
              </a>
            </p>
          </address>
          <Link href="/kontaktai" className="inline-block font-medium text-primary underline underline-offset-4 hover:text-primary-strong">
            Visi kontaktai
          </Link>
        </ContentSection>
      </main>

      <PublicFooter />
    </div>
  )
}
