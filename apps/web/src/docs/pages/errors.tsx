import { DocPage, Section, Code, Callout, Table, IC } from "../DocProse";
import { API_BASE } from "../constants";

export default function Errors() {
  return (
    <DocPage
      title="Errors & Retries"
      description="How to read failures and when to retry."
      prev={{ label: "Authentication & Keys", to: "/docs/authentication" }}
      next={{ label: "Understand, Overview", to: "/docs/understand-overview" }}
    >
      <Section title="Error body">
        <Code lang="json">
{`{
  "error": {
    "code": "authentication_error",
    "message": "Invalid API key.",
    "request_id": "req_01j9..."
  }
}`}
        </Code>
        <p>
          Branch on <IC>code</IC>. Quote <IC>request_id</IC> if you email support.
        </p>
      </Section>

      <Section title="Codes">
        <Table
          headers={["HTTP", "code", "What to do"]}
          rows={[
            ["400 / 422", "bad_request", "Fix the request. Do not retry as-is."],
            ["401", "authentication_error", "Check the key."],
            ["403", "permission_denied", "This key cannot use that route."],
            ["404", "not_found", "Wrong path or missing resource."],
            ["413", "payload_too_large", "Use a smaller file or an async job."],
            ["429", "rate_limit_error", "Wait, then retry. Honour Retry-After."],
            ["5xx", "server_error", "Retry with backoff."],
          ]}
        />
      </Section>

      <Section title="Retries">
        <p>Retry 429 and 5xx. Do not retry 400, 401, 403, 404, or 422.</p>
        <p>
          On any <IC>POST</IC> you might retry, send <IC>Idempotency-Key</IC> so a timeout does not
          run the work twice.
        </p>
        <Code lang="bash">
{`curl -X POST ${API_BASE}/v1/speech/transcribe \\
  -H "Authorization: Bearer $ADARA_API_KEY" \\
  -H "Idempotency-Key: turn-4821" \\
  -F "file=@call.wav"`}
        </Code>
      </Section>
    </DocPage>
  );
}
