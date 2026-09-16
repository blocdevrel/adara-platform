import type { ReactNode } from "react";

export function TabletFrame({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[1.75rem] bg-[#141816] p-2.5 shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
      <div className="overflow-hidden rounded-[1.3rem] bg-white">
        <div className="h-1.5 bg-[#EB501F]" />
        {children}
      </div>
    </div>
  );
}

export function LanguageDonut() {
  return (
    <div className="flex flex-col items-center gap-6 px-6 py-8 sm:flex-row sm:justify-center sm:gap-8 sm:py-10">
      <svg viewBox="0 0 160 160" className="h-40 w-40 shrink-0" aria-hidden>
        <circle cx="80" cy="80" r="58" fill="none" stroke="#E8EEEA" strokeWidth="22" />
        <circle
          cx="80"
          cy="80"
          r="58"
          fill="none"
          stroke="#EB501F"
          strokeWidth="22"
          strokeDasharray="146 365"
          strokeDashoffset="0"
          transform="rotate(-90 80 80)"
        />
        <circle
          cx="80"
          cy="80"
          r="58"
          fill="none"
          stroke="#0B0F0D"
          strokeWidth="22"
          strokeDasharray="110 365"
          strokeDashoffset="-146"
          transform="rotate(-90 80 80)"
        />
        <circle
          cx="80"
          cy="80"
          r="58"
          fill="none"
          stroke="#9AE0B8"
          strokeWidth="22"
          strokeDasharray="108 365"
          strokeDashoffset="-256"
          transform="rotate(-90 80 80)"
        />
        <text x="80" y="76" textAnchor="middle" className="fill-[#0B0F0D]" fontSize="13" fontFamily="Inter, sans-serif">
          Twi-7B
        </text>
        <text x="80" y="94" textAnchor="middle" className="fill-[#6B7280]" fontSize="10" fontFamily="Inter, sans-serif">
          ready
        </text>
      </svg>
      <ul className="space-y-3 text-sm text-[#0B0F0D]">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#EB501F]" />
          Twi-7B
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#0B0F0D]" />
          Yoruba-Speech
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#9AE0B8]" />
          Swahili-Context
        </li>
      </ul>
    </div>
  );
}

export function LineChartVisual() {
  return (
    <div className="px-6 py-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B7280]">Transcribe</p>
      <p className="mt-1 text-sm text-[#0B0F0D]">Sika a ɛwɔ me mobile money akawnt no dɔɔso.</p>
      <svg viewBox="0 0 320 140" className="mt-6 h-32 w-full" aria-hidden>
        <polyline
          fill="none"
          stroke="#EB501F"
          strokeWidth="3"
          points="8,108 48,92 88,96 128,62 168,70 208,40 248,48 308,22"
        />
        <polyline
          fill="none"
          stroke="#0B0F0D"
          strokeWidth="1.5"
          points="8,118 48,110 88,114 128,90 168,94 208,72 248,78 308,58"
        />
      </svg>
      <p className="text-xs text-[#6B7280]">There is enough money in my mobile money account.</p>
    </div>
  );
}

export function BarChartVisual() {
  const bars = [42, 68, 54, 88, 60, 74];
  return (
    <div className="px-6 py-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B7280]">adara/models</p>
      <p className="mt-1 text-sm text-[#0B0F0D]">Twi, Yoruba, Swahili</p>
      <div className="mt-8 flex h-32 items-end gap-3">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md"
            style={{
              height: `${h}%`,
              backgroundColor: i % 2 === 0 ? "#EB501F" : "#0B0F0D",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function HexCluster() {
  return (
    <div className="relative mx-auto h-56 w-56" aria-hidden>
      <div className="absolute left-1/2 top-6 h-20 w-[4.5rem] -translate-x-1/2 bg-[#EB501F] [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]" />
      <div className="absolute left-6 top-[4.75rem] h-20 w-[4.5rem] bg-[#0B0F0D] [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]" />
      <div className="absolute right-6 top-[4.75rem] h-20 w-[4.5rem] bg-[#9AE0B8] [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]" />
      <div className="absolute bottom-4 left-1/2 h-20 w-[4.5rem] -translate-x-1/2 bg-[#E8F8EE] ring-1 ring-[#0B0F0D]/10 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]" />
    </div>
  );
}
