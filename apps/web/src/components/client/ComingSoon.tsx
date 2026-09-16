import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/components/client/Header";
import { Footer } from "@/components/client/Footer";
import { WaitlistForm } from "@/components/client/WaitlistForm";

const PAGE_COPY: Record<string, { name: string; description: string }> = {
  "/products": {
    name: "Products",
    description: "Corpus, models, and applied tools will live here. Join the waitlist for the first release.",
  },
  "/api": {
    name: "API",
    description: "The Africa Context API reference isn’t published yet. We’ll email you when docs go live.",
  },
  "/documentation": {
    name: "Documentation",
    description: "Guides and references are on the way. Get notified when they ship.",
  },
  "/about": {
    name: "About",
    description: "The full story of Adara is coming. Stay close for the launch.",
  },
  "/enterprise": {
    name: "Enterprise",
    description: "Dedicated capacity and support for teams. Waitlist for enterprise access.",
  },
  "/government": {
    name: "Government",
    description: "Public-sector programs aren’t open yet. We’ll reach out when they are.",
  },
  "/customers": {
    name: "Customers",
    description: "Customer stories will appear here. Join the list for updates.",
  },
  "/support": {
    name: "Support",
    description: "Help center isn’t live yet. For now, email info@adara.ai — or join the waitlist.",
  },
  "/learn": {
    name: "Learn",
    description: "Tutorials and courses are coming. We’ll tell you when the first ones drop.",
  },
  "/request-quota": {
    name: "Enterprise access",
    description: "Quota requests aren’t open yet. Leave your email and we’ll follow up.",
  },
};

export function ComingSoon() {
  const { pathname } = useLocation();
  const copy = PAGE_COPY[pathname] ?? {
    name: "This page",
    description: "This part of Adara isn’t live yet. Join the waitlist and we’ll email you.",
  };

  useEffect(() => {
    document.title = `${copy.name} — Coming soon — Adara`;
    return () => {
      document.title = "Adara — Data and tools that make AI understand Africa";
    };
  }, [copy.name]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-[calc(6rem+env(safe-area-inset-top))] text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Coming soon
        </p>
        <h1 className="mt-4 text-[clamp(2.25rem,6vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-foreground">
          {copy.name}
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
          {copy.description}
        </p>

        <div className="mt-10 w-full max-w-sm text-left">
          <WaitlistForm source={pathname} submitLabel="Notify me" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
