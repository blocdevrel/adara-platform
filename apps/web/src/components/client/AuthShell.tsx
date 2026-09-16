import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/client/Logo";

export const authSocialButtonClassName =
  "interactive-scale flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted/30";

export const authInputClassName =
  "h-12 w-full rounded-full border border-border bg-background px-5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/25 focus:outline-none focus:ring-0";

export const authSoonFieldClassName =
  `${authInputClassName} cursor-pointer text-muted-foreground`;

export const authSoonButtonClassName =
  "h-12 w-full cursor-pointer rounded-full border border-border bg-background px-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/30";

export const authTextareaClassName =
  "min-h-[120px] w-full resize-none rounded-3xl border border-border bg-background px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/25 focus:outline-none focus:ring-0";

export const authSubmitClassName =
  "interactive-scale h-12 w-full rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-white/90";

const defaultFooterLinks = [
  { label: "Documentation", href: "/documentation" },
  { label: "Products", href: "/products" },
  { label: "API", href: "/api" },
  { label: "Support", href: "/support" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

type AuthShellProps = {
  title: string;
  description: ReactNode;
  children: ReactNode;
  badge?: string;
  alternateLink?: { prompt: string; label: string; href: string };
  legal?: ReactNode;
  footerLinks?: { label: string; href: string }[];
};

export function AuthShell({
  title,
  description,
  children,
  badge = "Coming soon",
  alternateLink,
  legal,
  footerLinks = defaultFooterLinks,
}: AuthShellProps) {
  return (
    <div className="adara-ambient relative flex min-h-screen flex-col bg-background text-foreground">
      <Logo className="absolute left-4 top-[max(1.25rem,env(safe-area-inset-top))] z-10 sm:left-8" />

      <main className="relative flex flex-1 flex-col items-center justify-center px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-28 sm:px-8">
        <div className="hero-enter w-full max-w-[400px]">
          <div className="text-center">
            <p className="mb-4 inline-flex rounded-full border border-border bg-muted/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {badge}
            </p>
            <h1 className="text-[clamp(1.75rem,4vw,2.125rem)] font-semibold leading-tight tracking-tight text-foreground">
              {title}
            </h1>
            <div className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</div>
          </div>

          <div className="mt-10 space-y-3">{children}</div>

          {alternateLink ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {alternateLink.prompt}{" "}
              <Link
                to={alternateLink.href}
                className="text-foreground hover:underline underline-offset-4"
              >
                {alternateLink.label}
              </Link>
            </p>
          ) : null}

          {legal ? (
            <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">{legal}</p>
          ) : null}
        </div>
      </main>

      <footer className="relative px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-8">
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="inline-block px-1 py-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mt-8 text-center text-xs text-muted-foreground/70">Adara</p>
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function AuthSocialButtons({
  onUnavailable,
}: {
  onUnavailable?: (provider: string) => void;
}) {
  return (
    <>
      <button
        type="button"
        className={authSocialButtonClassName}
        onClick={() => onUnavailable?.("Google")}
      >
        <GoogleIcon />
        Continue with Google
      </button>
      <button
        type="button"
        className={authSocialButtonClassName}
        onClick={() => onUnavailable?.("GitHub")}
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
        Continue with GitHub
      </button>
    </>
  );
}
