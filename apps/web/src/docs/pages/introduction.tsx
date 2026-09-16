import { Link } from "react-router-dom";
import { DocPage, Section, Callout, Table, DocCard, IC, Steps, Step } from "../DocProse";

export default function Introduction() {
  return (
    <DocPage
      title="Introduction"
      description="African speech, language, and context — as APIs you can call from your backend."
      next={{ label: "What's New", to: "/docs/whats-new" }}
    >
      <Section title="What Adara does">
        <p>
          Adara turns African-language speech and text into something your app can act on:
          a transcript, spoken audio, a language code, and local meaning (what <IC>momo</IC> or{" "}
          <IC>NEPA</IC> refers to here).
        </p>
      </Section>

      <Section title="Services">
        <div className="grid gap-3 sm:grid-cols-2">
          <DocCard
            to="/docs/understand-overview"
            title="Understand"
            description="One call: language, entities, and local context."
          />
          <DocCard
            to="/docs/stt-overview"
            title="Speech to text"
            description="Upload audio. Get a transcript. Short files sync; long files as a job."
          />
          <DocCard
            to="/docs/tts-overview"
            title="Text to speech"
            description="Send text. Get spoken audio in the language you specify."
          />
          <DocCard
            to="/docs/language-detect"
            title="Language"
            description="Detect language and extract named entities on their own."
          />
          <DocCard
            to="/docs/context-resolve"
            title="Context"
            description="Resolve local terms — momo, NEPA, trotro — with a gloss and confidence."
          />
          <DocCard
            to="/docs/agent-overview"
            title="Voice agent"
            description="Sessions, turns, and live updates for in-app voice conversations."
          />
        </div>
      </Section>

      <Section title="Why teams use it">
        <Table
          headers={["Capability", "What it means for you"]}
          rows={[
            ["African accents", "Recognition tuned for West and East African speech, not only studio English."],
            ["Code-switching", "Handles mixed utterances — Twi–English, Pidgin–Yoruba, and similar."],
            ["Local meaning", "Not only words: concepts you can route on in your product."],
            ["Honest results", "Warnings and a provisional flag when knowledge is still being reviewed."],
          ]}
        />
      </Section>

      <Section title="Getting started">
        <Callout variant="info">
          Questions? Email{" "}
          <a href="mailto:dev@adara.ai" className="underline">
            dev@adara.ai
          </a>
          .
        </Callout>
        <Steps>
          <Step n={1} title="Sign in">
            <p>
              Use the{" "}
              <Link to="/login" className="underline hover:opacity-80">
                dashboard
              </Link>
              .
            </p>
          </Step>
          <Step n={2} title="Copy an API key">
            <p>Open Developers and copy a key. Keep it on your server only.</p>
          </Step>
          <Step n={3} title="Call the API">
            <p>
              Follow the{" "}
              <Link to="/docs/quickstart" className="underline hover:opacity-80">
                Quickstart
              </Link>
              .
            </p>
          </Step>
        </Steps>
      </Section>
    </DocPage>
  );
}
