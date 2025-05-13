import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

function SyllabusAccordion({ accordion }: { accordion: string[] }) {
  return (
    <section className="py-6">
      <header className="mb-4">
        <h1 className="text-xl font-bold">Syllabus</h1>
      </header>
      <div className="w-full overflow-x-auto">
        <Accordion
          type="multiple"
          className="max-w-[40rem] min-w-[32rem] rounded-md border p-3 dark:border-blue-300/30"
        >
          {accordion.map((syllabus, i) => (
            <AccordionItem key={i} value={syllabus}>
              <AccordionTrigger className="hover:no-underline focus:outline-none">
                <div className="flex w-full justify-between px-4">
                  <h3 className="text-base font-bold">{syllabus}</h3>
                  <div className="hidden items-center gap-2 text-sm font-semibold text-gray-500">
                    <span>{syllabus.length} Lessons</span>
                    <Separator orientation="vertical" />
                    <span>{syllabus}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <ul className="space-y-2">
                  {accordion.map((s) => (
                    <li key={s} className="font-medium">
                      {s}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default SyllabusAccordion;
