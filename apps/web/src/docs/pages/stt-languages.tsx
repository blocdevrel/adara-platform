import { DocPage, Section, Table, Callout, IC } from "../DocProse";

const LANGUAGES = [
  { code: "tw", name: "Twi", region: "GH", status: "Live" },
  { code: "yo", name: "Yoruba", region: "NG", status: "Live" },
  { code: "ig", name: "Igbo", region: "NG", status: "Live" },
  { code: "ha", name: "Hausa", region: "NG / GH", status: "Live" },
  { code: "pcm", name: "Nigerian Pidgin", region: "NG", status: "Live" },
  { code: "sw", name: "Swahili", region: "KE / TZ", status: "Live" },
  { code: "rw", name: "Kinyarwanda", region: "RW", status: "Live" },
  { code: "am", name: "Amharic", region: "ET", status: "Live" },
  { code: "wo", name: "Wolof", region: "SN", status: "Live" },
  { code: "lg", name: "Luganda", region: "UG", status: "Live" },
  { code: "sn", name: "Shona", region: "ZW", status: "Live" },
  { code: "zu", name: "Zulu", region: "ZA", status: "Live" },
  { code: "xh", name: "Xhosa", region: "ZA", status: "Live" },
  { code: "so", name: "Somali", region: "SO / ET / KE", status: "Live" },
  { code: "om", name: "Oromo", region: "ET", status: "Live" },
  { code: "ee", name: "Ewe", region: "GH / TG", status: "Live" },
  { code: "ny", name: "Chichewa", region: "MW / ZM", status: "Live" },
  { code: "ti", name: "Tigrinya", region: "ET / ER", status: "Live" },
  { code: "bm", name: "Bambara", region: "ML", status: "Live" },
  { code: "af", name: "Afrikaans", region: "ZA", status: "Live" },
  { code: "en", name: "English (African accents)", region: "All", status: "Live" },
  { code: "fr", name: "French (West African)", region: "CI / SN / CM", status: "Live" },
];

export default function SttLanguages() {
  return (
    <DocPage
      title="Supported Languages"
      description="Languages and accents available for speech transcription."
      prev={{ label: "STT Overview", to: "/docs/stt-overview" }}
      next={{ label: "Upload File (Sync)", to: "/docs/stt-upload-sync" }}
    >
      <Section title="Active languages">
        <Callout variant="info">
          Quality varies per language. Check <IC>GET /v1/languages?capability=transcribe</IC> on
          measured <IC>asr_quality</IC> score.
        </Callout>
        <Table
          headers={["Code", "Language", "Primary region(s)", "Status"]}
          rows={LANGUAGES.map((l) => [
            <IC key={l.code}>{l.code}</IC>,
            l.name,
            l.region,
            <span key={l.code + "s"} className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              {l.status}
            </span>,
          ])}
        />
      </Section>

      <Section title="Accent coverage">
        <p>
          African languages exist on a spectrum of accents, dialects, and registers. Adara
          evaluates transcription accuracy against recordings from actual speakers in each region,
          not from studio recordings of formal speech.
        </p>
        <p>
          The <IC>asr_quality</IC> field on the language catalog reflects WER (Word Error Rate)
          measured on held-out community audio. Lower is better. Where a language is listed without
          a quality score, it is <strong>interface_only</strong>, the route exists but returns
          501.
        </p>
      </Section>

      <Section title="Requesting a language">
        <p>
          If your target language is missing or the quality for your accent is too low, contact us
          at{" "}
          <a href="mailto:dev@adara.ai" className="underline hover:opacity-80">
            dev@adara.ai
          </a>{" "}
          with a description of the language, region, and use case. Community-contributed audio
          annotations go directly into the training and evaluation pipeline.
        </p>
      </Section>
    </DocPage>
  );
}
