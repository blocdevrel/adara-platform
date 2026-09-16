import { Link } from "react-router-dom";
import { Header } from "@/components/client/Header";
import { Footer } from "@/components/client/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4 pt-24 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)] font-medium tracking-[-0.035em] text-foreground">
          Page not found
        </h1>
        <p className="mt-3 max-w-sm text-muted-foreground">
          That URL isn’t on Adara. Head home or read the latest from the lab.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Home
          </Link>
          <Link
            to="/news"
            className="inline-flex h-11 items-center rounded-full border border-border px-5 text-sm font-medium text-foreground hover:bg-muted/30"
          >
            Latest news
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
