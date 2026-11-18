import Link from "next/link"
import { ContentSection } from "@/components/common/content-section"
import { PageHeading } from "@/components/common/page-heading"

export default function FixtureNotFound() {
  return (
    <>
      <PageHeading title="Rungtynės nerastos" />
      <ContentSection id="nerasta" title="Ko ieškote?">
        <p className="max-w-prose text-lg text-white">Tokių rungtynių nėra arba nuoroda pasikeitė.</p>
        <p className="text-base text-muted-foreground">
          Peržiūrėkite{" "}
          <Link href="/rezultatai" className="text-primary underline underline-offset-4 hover:text-primary-strong">
            rezultatus
          </Link>{" "}
          arba{" "}
          <Link href="/tvarkarastis" className="text-primary underline underline-offset-4 hover:text-primary-strong">
            tvarkaraštį
          </Link>
          .
        </p>
      </ContentSection>
    </>
  )
}
