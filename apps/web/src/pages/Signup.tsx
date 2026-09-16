import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AuthShell,
  AuthSocialButtons,
  authSoonButtonClassName,
  authSoonFieldClassName,
  authTextareaClassName,
} from "@/components/client/AuthShell";
import { WaitlistForm } from "@/components/client/WaitlistForm";

export default function Signup() {
  const [hint, setHint] = useState<string | null>(null);

  function showSoon(feature: string) {
    setHint(`${feature} isn’t available yet. Leave your email and we’ll notify you.`);
  }

  return (
    <AuthShell
      title="Build with Adara"
      description="Pilot accounts aren’t open yet. Click a field to see what’s coming, then join the waitlist."
      alternateLink={{
        prompt: "Already exploring?",
        label: "Sign in",
        href: "/login",
      }}
      legal={
        <>
          By continuing, you agree to Adara&apos;s{" "}
          <Link to="/terms" className="text-foreground/80 underline-offset-4 hover:text-foreground hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-foreground/80 underline-offset-4 hover:text-foreground hover:underline">
            Privacy Policy
          </Link>
          .
        </>
      }
    >
      {hint ? (
        <p className="rounded-2xl border border-border bg-muted/30 px-4 py-3 text-center text-sm text-foreground">
          {hint}
        </p>
      ) : null}

      <AuthSocialButtons onUnavailable={(provider) => showSoon(`${provider} sign-up`)} />

      <p className="py-1 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        or email
      </p>

      <input
        type="email"
        readOnly
        placeholder="Work email, coming soon"
        aria-label="Work email, coming soon"
        onFocus={(e) => {
          e.target.blur();
          showSoon("Email sign-up");
        }}
        className={authSoonFieldClassName}
      />
      <input
        type="text"
        readOnly
        placeholder="Company name, coming soon"
        aria-label="Company name, coming soon"
        onFocus={(e) => {
          e.target.blur();
          showSoon("Account creation");
        }}
        className={authSoonFieldClassName}
      />
      <textarea
        readOnly
        rows={4}
        placeholder="What are you building?, coming soon"
        aria-label="Use case, coming soon"
        onFocus={(e) => {
          e.target.blur();
          showSoon("Pilot applications");
        }}
        className={`${authTextareaClassName} cursor-pointer text-muted-foreground`}
      />
      <button
        type="button"
        onClick={() => showSoon("Account creation")}
        className={authSoonButtonClassName}
      >
        Continue with email, coming soon
      </button>

      <div className="pt-4">
        <p className="mb-3 text-center text-sm text-muted-foreground">Get notified when access opens</p>
        <WaitlistForm source="signup" submitLabel="Join the waitlist" />
      </div>
    </AuthShell>
  );
}
