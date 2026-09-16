import { DocPage, Section, Code } from "../DocProse";

export default function SdkTesting() {
  return (
    <DocPage
      title="Testing"
      description="Stub Adara in unit tests so CI does not hit the live API."
      prev={{ label: "Offline mode", to: "/docs/sdk-local" }}
      next={{ label: "Health Check", to: "/docs/health" }}
    >
      <Section title="Python">
        <Code lang="python">
{`from adara import Adara, MockTransport

transport = MockTransport()
transport.queue({
    "concepts": ["mobile_money"],
    "language": "tw",
    "status": "ok",
    "provisional": True,
})

client = Adara(api_key="test", transport=transport)
meaning = client.understand("the momo no enter")
assert meaning.concepts == ["mobile_money"]`}
        </Code>
      </Section>
    </DocPage>
  );
}
