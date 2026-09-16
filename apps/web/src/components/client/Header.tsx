import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/client/Logo";
import { MintButton } from "@/components/client/MintButton";
import { moreDropdownItems, navigationItems } from "@/components/client/nav";

type HeaderProps = {
  variant?: "default" | "home";
};

export function Header({ variant = "default" }: HeaderProps) {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isHome = variant === "home";

  useEffect(() => {
    setIsMenuOpen(false);
    setIsMoreDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMoreDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleScroll() {
      const next = window.scrollY > 12;
      setScrolled((prev) => (prev === next ? prev : next));
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const onDark = isHome;

  const navLink = cn(
    "text-[13px] font-medium uppercase tracking-[0.14em] transition-colors duration-150",
    onDark
      ? "text-white/70 hover:text-white"
      : "text-muted-foreground hover:text-foreground"
  );

  const mobileNavLink = onDark
    ? "block rounded-lg px-3 py-3 text-base text-white/80 transition hover:bg-white/5 hover:text-white"
    : "block rounded-lg px-3 py-3 text-base text-muted-foreground transition hover:bg-accent hover:text-foreground";

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-200 safe-area-top",
        isHome
          ? cn(
              "border-b",
              scrolled || isMenuOpen
                ? "border-white/10 bg-[#0B0F0D]"
                : "border-transparent bg-transparent"
            )
          : cn("border-b bg-background", scrolled ? "border-border/60" : "border-border/50")
      )}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-[4.25rem]">
          <div className="flex min-w-0 items-center gap-8">
            <Logo onDark={onDark} className="relative z-10" />

            <nav className="hidden items-center gap-7 lg:flex">
              {navigationItems.map((item) => (
                <Link key={item.href} to={item.href} className={navLink}>
                  {item.label}
                </Link>
              ))}

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                  className={cn("flex items-center gap-1", navLink)}
                >
                  Resources
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 opacity-70 transition-transform duration-200",
                      isMoreDropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {isMoreDropdownOpen && (
                  <div
                    className={cn(
                      "absolute left-0 top-full z-50 mt-3 w-48 rounded-xl border py-1.5 shadow-xl",
                      onDark
                        ? "border-white/10 bg-[#141816] shadow-black/40"
                        : "border-border bg-card shadow-black/30"
                    )}
                  >
                    {moreDropdownItems.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className={cn(
                          "mx-1 flex items-center rounded-lg px-3 py-2.5 text-[15px] transition-colors",
                          onDark
                            ? "text-white/70 hover:bg-white/5 hover:text-white"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                        onClick={() => setIsMoreDropdownOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/login"
              className={cn(
                "text-[13px] font-medium transition-colors",
                onDark ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign in
            </Link>
            <MintButton to="/signup" size="sm">
              Try Adara
            </MintButton>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition touch-manipulation lg:hidden",
              onDark ? "text-white hover:bg-white/10" : "text-foreground hover:bg-accent"
            )}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "lg:hidden",
          isMenuOpen
            ? cn(
                "h-[calc(100dvh-4rem-env(safe-area-inset-top))] overflow-y-auto border-t sm:h-[calc(100dvh-4.25rem-env(safe-area-inset-top))]",
                onDark ? "border-white/10 bg-[#0B0F0D]" : "border-border bg-card"
              )
            : "hidden"
        )}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 safe-area-bottom sm:px-6">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className={cn("mt-2 border-t pt-2", onDark ? "border-white/10" : "border-border")}>
            <p
              className={cn(
                "px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em]",
                onDark ? "text-white/40" : "text-muted-foreground"
              )}
            >
              Resources
            </p>
            {moreDropdownItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={mobileNavLink}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className={cn("mt-2 flex flex-col gap-2 border-t pt-3", onDark ? "border-white/10" : "border-border")}>
            <Link
              to="/login"
              className={cn(
                "inline-flex h-12 items-center justify-center rounded-full border px-4 text-base font-medium transition",
                onDark
                  ? "border-white/20 text-white hover:bg-white/5"
                  : "border-border text-foreground hover:bg-accent"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              Sign in
            </Link>
            <MintButton to="/signup" size="lg" className="w-full" onClick={() => setIsMenuOpen(false)}>
              Try Adara
            </MintButton>
          </div>
        </nav>
      </div>
    </header>
  );
}
