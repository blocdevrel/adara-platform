import { DocPage, Section, Code, Callout, IC } from "../DocProse";

export default function Provisional() {
  return (
    <DocPage
      title="Provisional & Warnings"
      description="Adara tells you explicitly when to distrust a result. Never drop these fields."
      prev={{ label: "Code-switching", to: "/docs/codeswitch" }}
      next={{ label: "STT Overview", to: "/docs/stt-overview" }}
    >
      <Section title="The provisional flag">
        <p>
          Every knowledge pack shipped with Adara today is <IC>provisional: true</IC>. That means
          the glosses, concepts, and local reference resolutions were assembled from secondary
          sources — dictionaries, community corpora, public documentation — and have not been
          reviewed by a fluent speaker of the language.
        </p>
        <p>
          This flag exists precisely so your application can surface the uncertainty to users
          rather than presenting unreviewed information as fact.
        </p>
        <Callout variant="warning">
          Do not drop <IC>provisional</IC>. Show it. A badge that says "Not yet verified by a
          native speaker" is far better than confidently displaying something wrong.
        </Callout>
      </Section>

      <Section title="The warnings array">
        <p>
          In addition to <IC>provisional</IC>, every Meaning object carries a <IC>warnings</IC>
          array. Call <IC>meaning.warnings()</IC> (SDK) or read the field directly:
        </p>
        <Code lang="python">
{`>>> meaning.warnings()
[
  'provisional=true: the knowledge behind these glosses was assembled from secondary sources '
  'and has not been reviewed by anyone who speaks the language.',
  'language detectors disagreed (speech=sw, text=tw); the text detector was used.',
  "region check failed: sw was detected, but every local reference resolved to GH.",
  "'olodo' is flagged sensitive: an insult in Yoruba.",
]`}
        </Code>
      </Section>

      <Section title="Types of warnings">
        <p><strong>provisional</strong> — Knowledge pack not reviewed by a native speaker.</p>
        <p><strong>Detector disagreement</strong> — The speech-based and text-based language detectors returned different languages. The higher-confidence one was used; the other is flagged.</p>
        <p><strong>Region mismatch</strong> — The detected language is from region A, but all local references resolved to region B. The utterance may be from a speaker living outside their home region.</p>
        <p><strong>Sensitive term</strong> — A resolved concept is marked sensitive in the knowledge pack — typically an insult, a contested name, or a term with significant cultural weight. Never paraphrase it; surface the sensitivity flag to your users.</p>
      </Section>

      <Section title="When provisional becomes false">
        <p>
          When a knowledge pack is reviewed and approved by at least one fluent native speaker,
          <IC>provisional</IC> will become <IC>false</IC> for that language. The API will not break;
          your code does not need to change. You can start trusting the result without a badge.
        </p>
        <p>
          Watch the{" "}
          <a href="/news" className="underline hover:opacity-80">
            changelog
          </a>{" "}
          for reviewed pack announcements.
        </p>
      </Section>

      <Section title="status: interface_only">
        <Callout variant="info">
          <IC>status: interface_only</IC> is different from <IC>provisional</IC>. It means no backend
          model ran — only the heuristic text detector. You get a language guess but no resolved
          concepts. It is not an error: nothing is broken, the backend is simply not installed.
        </Callout>
      </Section>
    </DocPage>
  );
}
