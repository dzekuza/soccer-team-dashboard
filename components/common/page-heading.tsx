interface PageHeadingProps {
  title: string
}

/** Title bar used at the top of public pages. Renders the page's single <h1>. */
export function PageHeading({ title }: PageHeadingProps) {
  return (
    <header className="border-b border-surface px-4 py-8 text-center">
      <h1 className="h1-public">{title}</h1>
    </header>
  )
}
