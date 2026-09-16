import { DocPage, Section, Code, IC } from "../DocProse";

export default function Codeswitch() {
  return (
    <DocPage
      title="Code-switching"
      description="When a speaker moves between two languages in one sentence, Adara detects it."
      prev={{ label: "Understand Audio", to: "/docs/understand-audio" }}
      next={{ label: "Provisional & Warnings", to: "/docs/provisional" }}
    >
      <Section title="What is code-switching?">
        <p>
          Code-switching is the practice of alternating between two or more languages in a single
          conversation or utterance. It is the norm, not the exception, in West and East African
          daily speech:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Twi-English (GH):</strong> "Chale, I want to go to the market, na bus no baa"</li>
          <li><strong>Pidgin-Yoruba (NG):</strong> "Abeg, oya collect the owo"</li>
          <li><strong>Swahili-English (KE):</strong> "Nitakutext later, tukubaliane hapa"</li>
        </ul>
        <p>
          Systems that only detect one dominant language per utterance fail these speakers. Adara
          reports segment-level language boundaries so your application knows where each language
          starts and ends.
        </p>
      </Section>

      <Section title="In text">
        <p>
          The language detector in <IC>POST /v1/understand</IC> and{" "}
          <IC>POST /v1/language/detect</IC> returns a ranked list of detected languages. When
          multiple languages score above the confidence threshold, all are reported.
        </p>
        <Code lang="json">
{`{
  "language": "tw",
  "secondary_languages": ["en"],
  "codeswitch": true
}`}
        </Code>
      </Section>

      <Section title="In audio">
        <p>
          The audio pipeline segments the recording and assigns a language to each segment.
          Segment boundaries and per-segment languages are returned alongside the merged transcript.
        </p>
        <Code lang="json">
{`{
  "text": "Chale the momo no enter, so I had to use cash",
  "language": "tw",
  "segments": [
    { "start": 0.0, "end": 1.4, "language": "tw", "text": "Chale the momo no enter" },
    { "start": 1.4, "end": 2.8, "language": "en", "text": "so I had to use cash" }
  ]
}`}
        </Code>
      </Section>

      <Section title="Limits">
        <p>
          Segment-level languages on audio are returned when speech is enabled on your account.
          Text-only detection still reports mixed language when both score above threshold.
        </p>
      </Section>
    </DocPage>
  );
}
