interface LoadErrorProps {
  /** What failed to load, e.g. "rezultatų". */
  subject: string
}

/** Shown when a page's data could not be loaded; the page frame stays visible. */
export function LoadError({ subject }: LoadErrorProps) {
  return (
    <div role="alert" className="px-4 py-16 text-center md:px-16">
      <p className="text-lg font-semibold text-white">Nepavyko įkelti {subject}.</p>
      <p className="mt-2 text-base text-muted-foreground">Bandykite atnaujinti puslapį po kelių minučių.</p>
    </div>
  )
}
