import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is Adara?",
    a: "Adara builds AI for African languages and context, corpus, models, API, and products that help any application understand local languages, culture, and daily life.",
  },
  {
    q: "How does the Context API work?",
    a: "Send text or speech through our API and get translation, localization, and culturally grounded responses tuned to African locales. No model training required.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. We use consent-first collection and never sell partner data. Details on data handling are in our documentation and privacy policy.",
  },
  {
    q: "Do I need to fine-tune my own models?",
    a: "No. Most teams start with our API and pre-trained models. Custom fine-tuning is available when you need it.",
  },
  {
    q: "How do I get started?",
    a: "Sign up for free API access and read the docs. Enterprise and government teams can reach out for dedicated support.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="bg-white py-16 text-[#0B0F0D] sm:py-24">
      <div className="mx-auto w-full max-w-[880px] px-4 sm:px-6">
        <h2 className="text-center text-[clamp(2rem,4vw,3.15rem)] font-light tracking-[-0.035em]">
          Common questions
        </h2>

        <Accordion type="single" collapsible className="mt-10 w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.q} value={`item-${i}`} className="border-[#E6EBE8]">
              <AccordionTrigger className="text-left text-base sm:text-lg">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-[#5C6560]">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
