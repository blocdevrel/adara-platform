import { Link } from "react-router-dom";
import { ArrowUpRight, Github, Instagram, Linkedin, Twitter } from "lucide-react";
import { Logo } from "@/components/client/Logo";

const footerLinks = {
  product: [
    { label: "Products", href: "/products" },
    { label: "Enterprise", href: "/enterprise" },
    { label: "Government", href: "/government" },
    { label: "Customers", href: "/customers" },
  ],
  developers: [
    { label: "Documentation", href: "/documentation" },
    { label: "API Reference", href: "/api" },
    { label: "Support", href: "/support" },
    { label: "Learn", href: "/learn" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "News", href: "/news" },
    { label: "Contact", href: "/#contact" },
    { label: "Sign up", href: "/signup" },
    { label: "Sign in", href: "/login" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/adaraailab", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com/company/adara", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com/adaraailab", label: "Instagram" },
  { icon: Github, href: "https://github.com/adara", label: "GitHub" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {links.map((item) => (
          <li key={item.label}>
            <Link
              to={item.href}
              className="inline-block py-1 text-sm text-white/65 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#0B0F0D] text-white">
      <p
        aria-hidden
        className="pointer-events-none absolute bottom-[-0.22em] left-1/2 w-[140%] -translate-x-1/2 text-center text-[22vw] font-semibold leading-none tracking-[-0.07em] text-white/[0.055]"
      >
        ADARA
      </p>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-16 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo onDark size="sm" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              AI for African languages and context.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-white/30 hover:text-white"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <a
                href="mailto:info@adara.ai"
                className="inline-flex items-center gap-1.5 py-1 text-sm text-white transition-colors hover:text-white/70"
              >
                info@adara.ai
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <p className="text-sm text-white/50">Accra · Lagos · Nairobi</p>
            </div>
          </div>

          <FooterColumn title="Product" links={footerLinks.product} />
          <FooterColumn title="Developers" links={footerLinks.developers} />
          <FooterColumn title="Company" links={footerLinks.company} />
        </div>

        <div className="relative flex flex-col gap-4 border-t border-white/10 py-6 pb-24 sm:flex-row sm:items-center sm:justify-between sm:pb-28">
          <p className="text-sm text-white/45">© {currentYear} Adara. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              to="/privacy"
              className="inline-block py-2 text-sm text-white/45 transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="inline-block py-2 text-sm text-white/45 transition-colors hover:text-white"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
