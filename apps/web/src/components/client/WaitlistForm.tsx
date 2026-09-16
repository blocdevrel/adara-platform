import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";

type WaitlistFormProps = {
  source: string;
  submitLabel?: string;
  className?: string;
};

export function WaitlistForm({
  source,
  submitLabel = "Notify me",
  className,
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value) return;

    try {
      const key = "adara-waitlist";
      const existing = JSON.parse(localStorage.getItem(key) || "[]") as unknown[];
      localStorage.setItem(
        key,
        JSON.stringify([...existing, { email: value, source, at: Date.now() }])
      );
    } catch {
      /* ignore quota / private mode */
    }

    setSubmitted(true);
    setEmail("");
  }

  if (submitted) {
    return (
      <div className={cn("rounded-2xl border border-border bg-muted/20 px-5 py-6 text-center", className)}>
        <p className="text-sm font-medium text-foreground">You&apos;re on the list</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          We&apos;ll email you when this is ready. Nothing is live yet.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Add another email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", className)}>
      <label htmlFor={`waitlist-email-${source}`} className="sr-only">
        Email
      </label>
      <input
        id={`waitlist-email-${source}`}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        autoComplete="email"
        className="h-12 w-full rounded-full border border-border bg-background px-5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/25 focus:outline-none focus:ring-0"
      />
      <button
        type="submit"
        className="h-12 w-full rounded-full bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-adara-orange-hover"
      >
        {submitLabel}
      </button>
    </form>
  );
}
