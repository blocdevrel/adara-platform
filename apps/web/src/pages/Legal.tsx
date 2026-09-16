import type { ReactNode } from "react";
import { useEffect } from "react";
import { Header } from "@/components/client/Header";
import { Footer } from "@/components/client/Footer";

function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    document.title = `${title} — Adara`;
    return () => {
      document.title = "Adara — Data and tools that make AI understand Africa";
    };
  }, [title]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-[calc(6rem+env(safe-area-inset-top))] sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Legal
        </p>
        <h1 className="mt-3 text-[clamp(2rem,4vw,2.75rem)] font-medium tracking-[-0.035em] text-foreground">
          {title}
        </h1>
        <div className="mt-8 space-y-5 text-base leading-relaxed text-foreground/85">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        Adara is not collecting account data yet. Waitlist emails you submit are stored only in your
        browser until our backend is live.
      </p>
      <p>
        Questions:{" "}
        <a href="mailto:info@adara.ai" className="underline underline-offset-4 hover:text-foreground">
          info@adara.ai
        </a>
        .
      </p>
    </LegalPage>
  );
}

export function Terms() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        Product access, APIs, and paid plans are not available yet. These terms will be published
        before accounts open.
      </p>
      <p>
        Questions:{" "}
        <a href="mailto:info@adara.ai" className="underline underline-offset-4 hover:text-foreground">
          info@adara.ai
        </a>
        .
      </p>
    </LegalPage>
  );
}
