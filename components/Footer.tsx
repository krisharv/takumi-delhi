'use client';
import { motion } from 'framer-motion';

const NAV_LINKS = [
  { href: '#about',      label: 'ABOUT' },
  { href: '#details',    label: 'DETAILS' },
  { href: '#schedule',   label: 'SCHEDULE' },
  { href: '#leaderboard',label: 'LEADERBOARD' },
  { href: '#voting',     label: 'VOTING' },
  { href: '#faq',        label: 'FAQ' },
  { href: '#contact',    label: 'CONTACT' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-ink/10 px-6 md:px-12 py-16 grid-overlay">
      <div className="max-w-5xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          {/* Wordmark */}
          <div>
            <div className="font-syne font-black text-3xl md:text-4xl text-ink leading-none tracking-tight mb-1">
              TAKUMI<span className="text-red">.</span>
            </div>
            <div className="font-mono text-[10px] text-muted tracking-widest">
              DELHI // CRAFT. CODE. CREATE.
            </div>
          </div>

          {/* Kanji mark */}
          <div className="font-syne font-bold text-ink/[0.06] text-7xl leading-none select-none" aria-hidden>
            匠
          </div>
        </div>

        {/* Nav */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-12">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-[10px] tracking-widest text-muted hover:text-red transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/admin"
            className="font-mono text-[10px] tracking-widest text-muted/40 hover:text-muted transition-colors"
          >
            ADMIN
          </a>
        </div>

        {/* Divider */}
        <div className="h-px bg-ink/10 mb-8" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="font-mono text-[10px] text-muted/50 tracking-widest space-y-1">
            <div>© 2026 TAKUMI DELHI. ALL RIGHTS RESERVED.</div>
            <div>A DOE OFFICIAL SATELLITE HACKATHON.</div>
          </div>
          <div className="font-mono text-[10px] text-muted/40 tracking-widest text-right space-y-1">
            <div>MAY 2–3, 2026</div>
            <div>DBSE OFFICE // IP EXTENSION, DELHI</div>
            <div className="mt-1 text-[8px]">28°38′N 77°13′E // SYS v1.0.0</div>
          </div>
        </div>

        {/* ASCII footer bar */}
        <div className="mt-10 font-mono text-[9px] text-ink/[0.06] tracking-widest text-center select-none hidden md:block">
          ── ── ── TAKUMI-DL // CRAFT.CODE.CREATE // GAME DEV // SATELLITE // MAY-2026 ── ── ──
        </div>
      </div>
    </footer>
  );
}
