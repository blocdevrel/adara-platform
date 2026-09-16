/**
 * Shared layout primitives for every doc page.
 *
 * Usage:
 *   <DocPage title="Introduction" description="Adara for developers">
 *     <Section title="What is Adara?">
 *       <p>...</p>
 *     </Section>
 *   </DocPage>
 */

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// ─── Page shell ────────────────────────────────────────────────────────────

export function DocPage({
  title,
  description,
  children,
  prev,
  next,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  prev?: { label: string; to: string };
  next?: { label: string; to: string };
}) {
  return (
    <article className="mx-auto max-w-4xl px-7 py-12 lg:px-12">
      {/* Header */}
      <header className="mb-10 border-b border-zinc-100 dark:border-zinc-900 pb-8">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">{title}</h1>
        {description && (
          <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
        )}
      </header>

      {/* Body */}
      <div className="space-y-10">{children}</div>

      {/* Prev / Next */}
      {(prev || next) && (
        <div className="mt-14 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-7">
          {prev ? (
            <Link
              to={prev.to}
              className="flex items-center gap-1 text-base text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              ← {prev.label}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to={next.to}
              className="flex items-center gap-1 text-base text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              {next.label} →
            </Link>
          )}
        </div>
      )}
    </article>
  );
}

// ─── Section ───────────────────────────────────────────────────────────────

export function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = title.toLowerCase().replace(/\s+/g, "-");
  return (
    <section id={id}>
      <h2 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-white">{title}</h2>
      <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-8 text-[17px]">
        {children}
      </div>
    </section>
  );
}

// ─── Code block ────────────────────────────────────────────────────────────

export function Code({
  children,
  lang = "bash",
  title,
}: {
  children: string;
  lang?: string;
  title?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-4">
      {title && (
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</span>
          <span className="ml-auto text-xs text-zinc-400 uppercase tracking-wide">{lang}</span>
        </div>
      )}
      <pre className="overflow-x-auto bg-zinc-950 dark:bg-zinc-950 p-5 text-[15px] leading-7">
        <code className={`language-${lang} text-zinc-200`}>{children.trim()}</code>
      </pre>
    </div>
  );
}

// ─── Callout ───────────────────────────────────────────────────────────────

type CalloutVariant = "info" | "warning" | "tip" | "caution";

const calloutStyles: Record<CalloutVariant, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200",
  tip: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  warning: "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-200",
  caution: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200",
};

const calloutLabels: Record<CalloutVariant, string> = {
  info: "Note",
  tip: "Tip",
  warning: "Warning",
  caution: "Caution",
};

export function Callout({
  variant = "info",
  children,
}: {
  variant?: CalloutVariant;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-lg border px-5 py-4 my-4 text-base leading-7 ${calloutStyles[variant]}`}>
      <span className="font-semibold">{calloutLabels[variant]}:</span>{" "}
      {children}
    </div>
  );
}

// ─── Table ─────────────────────────────────────────────────────────────────

export function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 my-4">
      <table className="w-full text-base">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3.5 text-left font-semibold text-zinc-700 dark:text-zinc-300"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b last:border-0 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Step list ─────────────────────────────────────────────────────────────

export function Steps({ children }: { children: ReactNode }) {
  return <ol className="space-y-7 my-4">{children}</ol>;
}

export function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-base font-bold">
        {n}
      </div>
      <div className="flex-1 pt-0.5">
        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2">{title}</h3>
        <div className="text-base text-zinc-600 dark:text-zinc-400 space-y-2">{children}</div>
      </div>
    </li>
  );
}

// ─── Pill badge ────────────────────────────────────────────────────────────

export function Pill({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "green" | "orange" | "red";
}) {
  const styles = {
    default: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}

// ─── Inline code ───────────────────────────────────────────────────────────

export function IC({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[14px] font-mono text-zinc-800 dark:text-zinc-200">
      {children}
    </code>
  );
}

// ─── NavLink card (for overview pages) ────────────────────────────────────

export function DocCard({
  to,
  title,
  description,
}: {
  to: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-start gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm transition-all"
    >
      <div className="flex-1">
        <p className="font-medium text-lg text-zinc-900 dark:text-white mb-1">{title}</p>
        <p className="text-base text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <ChevronRight size={16} className="mt-0.5 text-zinc-400 shrink-0" />
    </Link>
  );
}
