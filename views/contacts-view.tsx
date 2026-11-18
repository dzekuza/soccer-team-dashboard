import { Mail, MapPin, Phone, Tent } from "lucide-react"
import { PageHeading } from "@/components/common/page-heading"
import { ContentSection } from "@/components/common/content-section"
import { ContactCard } from "@/components/club/contact-card"
import {
  BANGA_CAMP_CONTACT,
  CLUB_ADDRESS,
  CLUB_CONTACT_PEOPLE,
  CLUB_LEGAL_NAME,
  CLUB_PHONE,
} from "@/lib/club-content"

const linkClassName = "text-primary hover:text-primary-strong"

export function ContactsView() {
  return (
    <>
        <PageHeading title="Kontaktai" />

        <ContentSection id="adresas" title="Adresas ir telefonas">
          <div className="grid gap-4 sm:grid-cols-2">
            <ContactCard icon={MapPin} title="Adresas">
              <address className="not-italic">
                <p>{CLUB_LEGAL_NAME}</p>
                <p>
                  {CLUB_ADDRESS.street}, {CLUB_ADDRESS.city}
                </p>
              </address>
              <a href={CLUB_ADDRESS.mapUrl} target="_blank" rel="noopener noreferrer" className={linkClassName}>
                Rodyti žemėlapyje
                <span className="sr-only"> (atidaroma naujame lange)</span>
              </a>
            </ContactCard>

            <ContactCard icon={Phone} title="Telefonas">
              <a href={CLUB_PHONE.href} className={linkClassName}>
                {CLUB_PHONE.label}
              </a>
            </ContactCard>
          </div>
        </ContentSection>

        <ContentSection id="darbuotojai" title="El. paštas">
          <ul className="grid gap-4 sm:grid-cols-2">
            {CLUB_CONTACT_PEOPLE.map((person) => (
              <li key={person.email}>
                <ContactCard icon={Mail} title={person.role}>
                  <p className="text-white">{person.name}</p>
                  <a href={`mailto:${person.email}`} className={linkClassName}>
                    {person.email}
                  </a>
                </ContactCard>
              </li>
            ))}
          </ul>
        </ContentSection>

        <ContentSection id="banga-camp" title="BANGA CAMP">
          <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
            „Bangos“ futbolo stovyklavietės BANGA CAMP rezervacija:
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ContactCard icon={Tent} title="Rezervacija el. paštu">
              <a href={`mailto:${BANGA_CAMP_CONTACT.email}`} className={linkClassName}>
                {BANGA_CAMP_CONTACT.email}
              </a>
            </ContactCard>
            <ContactCard icon={Phone} title="Rezervacija telefonu">
              <a href={BANGA_CAMP_CONTACT.phone.href} className={linkClassName}>
                {BANGA_CAMP_CONTACT.phone.label}
              </a>
            </ContactCard>
          </div>
        </ContentSection>
    </>
  )
}
