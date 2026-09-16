import { DocPage, Section, Code, Callout, IC, Pill } from "../DocProse";

export default function LanguageCodeswitch() {
  return (
    <DocPage
      title="Code-switch Segments"
      description="Detect language boundaries within a single text utterance."
      prev={{ label: "Named Entities (NER)", to: "/docs/language-entities" }}
      next={{ label: "Context, Resolve", to: "/docs/context-resolve" }}
    >
      <Section title="Endpoint">
        <Code lang="text">{`POST /v1/language/codeswitch`}</Code>
        <div className="flex items-center gap-2 my-2">
          <Pill variant="orange">Not yet wired</Pill>
          <span className="text-sm text-zinc-500">Returns 501 today, included here for forward-compatibility</span>
        </div>
      </Section>

      <Section title="Planned response">
        <Code lang="json">
{`{
  "segments": [
    { "text": "Chale the momo no enter",  "language": "tw", "start": 0,  "end": 24 },
    { "text": "so I had to use cash",       "language": "en", "start": 25, "end": 45 }
  ],
  "primary_language": "tw"
}`}
        </Code>
        <Callout variant="info">
          Audio already includes language segments on the transcribe path. This standalone text
          endpoint is coming next.
        </Callout>
      </Section>
    </DocPage>
  );
}
