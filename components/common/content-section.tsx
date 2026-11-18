import type { ReactNode } from "react"

interface ContentSectionProps {
  /** Used for the heading id and the section's accessible name. */
  id: string
  title: string
  children: ReactNode
}

/** Titled block: heading on the left, content on the right from `lg` up. */
export function ContentSection({ id, title, children }: ContentSectionProps) {
  const headingId = `${id}-heading`

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="grid gap-6 border-b border-surface px-4 py-10 md:px-16 lg:grid-cols-3 lg:gap-12 lg:py-14"
    >
      <h2 id={headingId} className="text-title font-bold text-white lg:col-span-1">
        {title}
      </h2>
      <div className="space-y-6 lg:col-span-2">{children}</div>
    </section>
  )
}
