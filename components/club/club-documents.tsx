import { FileText } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { ClubDocumentGroup } from "@/lib/club-documents"

interface ClubDocumentsProps {
  groups: ClubDocumentGroup[]
}

/** Document groups as an accordion; each file opens the PDF in a new tab. */
export function ClubDocuments({ groups }: ClubDocumentsProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {groups.map((group) => (
        <AccordionItem key={group.id} value={group.id} className="border-surface">
          <AccordionTrigger className="text-left text-lg font-semibold text-white hover:no-underline">
            {group.title}
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-3">
              {group.documents.map((document) => (
                <li key={document.href}>
                  <a
                    href={document.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-3 text-muted-foreground transition-colors hover:text-primary"
                  >
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      {document.title}
                      <span className="sr-only"> (PDF, atidaroma naujame lange)</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
