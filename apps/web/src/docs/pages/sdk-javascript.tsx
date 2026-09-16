import { DocPage, Section, Code, Table, Callout, IC } from "../DocProse";

export default function SdkJavascript() {
  return (
    <DocPage
      title="JavaScript SDK"
      description="Call Adara from Node.js 18+. Server-side only."
      prev={{ label: "Python SDK", to: "/docs/sdk-python" }}
      next={{ label: "Offline mode", to: "/docs/sdk-local" }}
    >
      <Section title="Install">
        <Code lang="bash">{`npm install @adara/sdk`}</Code>
      </Section>

      <Section title="First call">
        <Code lang="javascript">
{`import { Adara } from '@adara/sdk'

const client = new Adara({ apiKey: process.env.ADARA_API_KEY })
const meaning = await client.understand('NEPA don take light', { locale: 'NG' })
console.log(meaning.language, meaning.concepts)`}
        </Code>
        <Callout variant="caution">
          Do not use this SDK in the browser with a live key. Put a small endpoint on your own
          server and call Adara from there.
        </Callout>
      </Section>

      <Section title="What you can call">
        <Table
          headers={["Method", "Use for"]}
          rows={[
            ["client.understand(...)", "Language, entities, and local context"],
            ["client.speech.transcribe(...)", "Speech to text"],
            ["client.speech.synthesize(...)", "Text to speech"],
            ["client.language.detect(...)", "Language ID"],
            ["client.context.resolve(...)", "Local terms"],
          ]}
        />
      </Section>
    </DocPage>
  );
}
