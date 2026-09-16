import { DocPage, Section, Table, Callout, IC } from "../DocProse";

const TTS_LANGUAGES = [
  { code: "tw", name: "Twi", region: "GH" },
  { code: "yo", name: "Yoruba", region: "NG" },
  { code: "ig", name: "Igbo", region: "NG" },
  { code: "ha", name: "Hausa", region: "NG / GH" },
  { code: "pcm", name: "Nigerian Pidgin", region: "NG" },
  { code: "sw", name: "Swahili", region: "KE / TZ" },
  { code: "rw", name: "Kinyarwanda", region: "RW" },
  { code: "am", name: "Amharic", region: "ET" },
  { code: "wo", name: "Wolof", region: "SN" },
  { code: "lg", name: "Luganda", region: "UG" },
  { code: "sn", name: "Shona", region: "ZW" },
  { code: "zu", name: "Zulu", region: "ZA" },
  { code: "xh", name: "Xhosa", region: "ZA" },
  { code: "ee", name: "Ewe", region: "GH / TG" },
  { code: "en", name: "English", region: "All" },
];

export default function TtsLanguages() {
  return (
    <DocPage
      title="TTS Languages & Accents"
      description="Languages available for text-to-speech synthesis."
      prev={{ label: "TTS Overview", to: "/docs/tts-overview" }}
      next={{ label: "TTS Generate", to: "/docs/tts-generate" }}
    >
      <Section title="Supported languages">
        <Callout variant="info">
          TTS coverage is a subset of STT coverage. A language that can be transcribed cannot
          always be synthesised, the synthesis model needs its own training data. Check{" "}
          <IC>GET /v1/languages?capability=synthesize</IC> for the live list.
        </Callout>
        <Table
          headers={["Code", "Language", "Primary region(s)"]}
          rows={TTS_LANGUAGES.map((l) => [
            <IC key={l.code}>{l.code}</IC>,
            l.name,
            l.region,
          ])}
        />
      </Section>

      <Section title="Voice quality">
        <p>Voices are clear and usable for product replies. Evaluate on your own copy before launch.</p>
        <p>
          The <IC>tts_quality</IC> field on <IC>GET /v1/languages</IC> reflects automated UTMOS
          (Universal Text-to-speech MOS) scoring on a set of held-out reference texts.
        </p>
      </Section>

      <Section title="Requesting a language or accent">
        <p>
          If your language is missing or the synthesised accent is too far from your target
          speakers, contact{" "}
          <a href="mailto:dev@adara.ai" className="underline hover:opacity-80">
            dev@adara.ai
          </a>
          . Contributed text data (normalised, copyright-clear) goes directly into the TTS training
          pipeline.
        </p>
      </Section>
    </DocPage>
  );
}
