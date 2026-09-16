import { Link } from "react-router-dom";
import { DocPage, Section, Code, Callout, Steps, Step, IC } from "../DocProse";
import { API_BASE } from "../constants";

export default function Quickstart() {
  return (
    <DocPage
      title="Quickstart"
      description="Get an API key and make your first call in a few minutes."
      prev={{ label: "What's New", to: "/docs/whats-new" }}
      next={{ label: "Authentication & Keys", to: "/docs/authentication" }}
    >
      <Section title="Prerequisites">
        <ul className="list-disc pl-5 space-y-1">
          <li>An Adara account</li>
          <li>A server that can keep your API key secret — never a browser or mobile app</li>
        </ul>
      </Section>

      <Section title="Getting started">
        <Steps>
          <Step n={1} title="Sign in">
            <p>
              Open the{" "}
              <Link to="/login" className="underline hover:opacity-80">
                Adara dashboard
              </Link>{" "}
              and sign in.
            </p>
          </Step>
          <Step n={2} title="Copy your API key">
            <p>
              Go to <strong>Developers</strong> and copy a key. Production keys start with{" "}
              <IC>sk_live_</IC>. Test keys start with <IC>sk_test_</IC>.
            </p>
            <Callout variant="caution">
              Keep the key on your server. Never put it in a website, mobile app, or git repo.
            </Callout>
          </Step>
          <Step n={3} title="Make a request">
            <p>Store the key as an environment variable, then call Understand:</p>
            <Code lang="bash">
{`export ADARA_API_KEY=sk_live_...

curl -s ${API_BASE}/v1/understand \\
  -H "Authorization: Bearer $ADARA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "chale the momo no enter", "locale": "GH"}'`}
            </Code>
          </Step>
        </Steps>
      </Section>

      <Section title="What you get back">
        <Code lang="json">
{`{
  "language": "tw",
  "concepts": ["familiar_address", "mobile_money"],
  "provisional": true,
  "status": "ok"
}`}
        </Code>
        <p>
          Route on <IC>concepts</IC> — stable IDs — not on the raw wording of the utterance.
        </p>
      </Section>

      <Section title="Use the SDK">
        <Code lang="python" title="Python">
{`pip install adara-sdk`}
        </Code>
        <Code lang="python">
{`import os
from adara import Adara

client = Adara(api_key=os.environ["ADARA_API_KEY"])
meaning = client.understand("chale the momo no enter", locale="GH")
print(meaning.language)   # tw
print(meaning.concepts)   # ['familiar_address', 'mobile_money']`}
        </Code>
        <Code lang="javascript" title="Node.js">
{`npm install @adara/sdk`}
        </Code>
        <Code lang="javascript">
{`import { Adara } from '@adara/sdk'

const client = new Adara({ apiKey: process.env.ADARA_API_KEY })
const meaning = await client.understand('chale the momo no enter', { locale: 'GH' })
console.log(meaning.language, meaning.concepts)`}
        </Code>
        <p>
          Full SDK reference:{" "}
          <Link to="/docs/sdk-python" className="underline hover:opacity-80">
            Python
          </Link>{" "}
          and{" "}
          <Link to="/docs/sdk-javascript" className="underline hover:opacity-80">
            JavaScript
          </Link>
          .
        </p>
      </Section>
    </DocPage>
  );
}
