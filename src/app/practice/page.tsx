import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PracticePage() {
  return (
    <div className="px-12 py-8">
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="accordion-item-problem-selection">
          <AccordionTrigger>1. Select Problem</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>Placeholder</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="accordion-item-clarification">
          <AccordionTrigger>2. Ask Clarifying Questions</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>Display problem here</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="accordion-item-thought-process">
          <AccordionTrigger>3. Explain Thought Process</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>Placeholder</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="accordion-item-pseudocode">
          <AccordionTrigger>4. Draft Pseudocode</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>Placeholder</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="accordion-item-implementation">
          <AccordionTrigger>5. Implement Code</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>Placeholder</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="accordion-item-complexity-analysis">
          <AccordionTrigger>6. Analyze Complexity</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>Placeholder</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
