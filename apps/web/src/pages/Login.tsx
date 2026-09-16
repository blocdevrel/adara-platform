import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AuthShell,
  AuthSocialButtons,
  authSoonButtonClassName,
  authSoonFieldClassName,
} from "@/components/client/AuthShell";
import { WaitlistForm } from "@/components/client/WaitlistForm";

export default function Login() {
  const [hint, setHint] = useState<string | null>(null);

  function showSoon(feature: string) {
    setHint(`${feature} isn’t available yet. Leave your email and we’ll notify you.`);
  }

  return (
    <AuthShell
      title="Sign in to Adara"
      description="Accounts aren’t live yet. Click any field to see what’s coming, or join the waitlist below."
      alternateLink={{
        prompt: "Want early access?",
        label: "Join the waitlist",
        href: "/signup",
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

      <AuthSocialButtons onUnavailable={(provider) => showSoon(`${provider} sign-in`)} />

      <p className="py-1 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        or email
      </p>

      <input
        type="email"
        readOnly
        placeholder="Coming soon"
        aria-label="Email, coming soon"
        onFocus={(e) => {
          e.target.blur();
          showSoon("Email sign-in");
        }}
        className={authSoonFieldClassName}
      />
      <input
        type="password"
        readOnly
        placeholder="Coming soon"
        aria-label="Password, coming soon"
        onFocus={(e) => {
          e.target.blur();
          showSoon("Password sign-in");
        }}
        className={authSoonFieldClassName}
      />
      <button
        type="button"
        onClick={() => showSoon("Email sign-in")}
        className={authSoonButtonClassName}
      >
        Continue with email, coming soon
      </button>

      <div className="pt-4">
        <p className="mb-3 text-center text-sm text-muted-foreground">Get notified when sign-in opens</p>
        <WaitlistForm source="login" submitLabel="Notify me" />
      </div>
    </AuthShell>
  );
}
