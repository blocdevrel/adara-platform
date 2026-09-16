import { DocPage, Section, Code, Callout } from "../DocProse";

export default function SdkLocal() {
  return (
    <DocPage
      title="Offline mode"
      description="Run understanding without calling the hosted API, useful for tests and air-gapped setups."
      prev={{ label: "JavaScript SDK", to: "/docs/sdk-javascript" }}
      next={{ label: "Testing", to: "/docs/sdk-testing" }}
    >
      <Section title="When to use it">
        <p>
          Most apps should call the hosted API. Offline mode runs the same understanding layer in
          your process when you cannot reach the network, or when you want deterministic CI.
        </p>
        <p>Speech (transcribe / synthesize) still needs the hosted API.</p>
      </Section>

      <Section title="Python">
        <Code lang="bash">{`pip install "adara-sdk[local]"`}</Code>
        <Code lang="python">
{`from adara import Adara
from adara.local import LocalTransport

client = Adara(api_key="local", transport=LocalTransport())
meaning = client.understand("chale the momo no enter")`}
        </Code>
        <Callout variant="info">
          Switch to the hosted API later by dropping <code>transport=</code> and setting{" "}
          <code>ADARA_API_KEY</code>. Your call sites stay the same.
        </Callout>
      </Section>
    </DocPage>
  );
}
