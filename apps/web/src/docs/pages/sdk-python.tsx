import { DocPage, Section, Code, Table, IC } from "../DocProse";

export default function SdkPython() {
  return (
    <DocPage
      title="Python SDK"
      description="Call Adara from Python 3.11+ without writing HTTP yourself."
      prev={{ label: "Live Events (SSE)", to: "/docs/agent-events" }}
      next={{ label: "JavaScript SDK", to: "/docs/sdk-javascript" }}
    >
      <Section title="Install">
        <Code lang="bash">{`pip install adara-sdk`}</Code>
      </Section>

      <Section title="First call">
        <Code lang="python">
{`import os
from adara import Adara

client = Adara(api_key=os.environ["ADARA_API_KEY"])
meaning = client.understand("NEPA don take light", locale="NG")
print(meaning.language)
print(meaning.concepts)`}
        </Code>
      </Section>

      <Section title="What you can call">
        <Table
          headers={["Method", "Use for"]}
          rows={[
            ["client.understand(...)", "Language, entities, and local context"],
            ["client.speech.transcribe(...)", "Speech to text"],
            ["client.speech.synthesize(...)", "Text to speech"],
            ["client.language.detect(...)", "Language ID"],
            ["client.language.entities(...)", "Named entities"],
            ["client.context.resolve(...)", "Local terms"],
            ["client.catalog.languages()", "Supported languages"],
          ]}
        />
      </Section>

      <Section title="Errors">
        <Code lang="python">
{`from adara import RateLimitError, AuthenticationError, AdaraError

try:
    result = client.speech.transcribe(open("call.wav", "rb"))
except AuthenticationError:
    ...  # bad or missing key
except RateLimitError as e:
    ...  # wait e.retry_after seconds
except AdaraError as e:
    ...  # e.request_id is what support needs`}
        </Code>
      </Section>
    </DocPage>
  );
}
