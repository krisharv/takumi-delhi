'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

/* ─── Sponsor data ───────────────────────────────────────────────────────── */
// Replace name/tier/url when confirmed. Keep kanji labels — they reinforce theme.
const TIERS = [
  {
    tier:   'PATRON',           // 一 — highest
    kanji:  '一',
    label:  'TIER ONE // PATRON',
    note:   'Primary sponsor — maximum visibility across all event materials',
    sponsors: [
      { name: 'TBA', url: '#', tba: true },
      { name: 'TBA', url: '#', tba: true },
    ],
  },
  {
    tier:   'ARTISAN',          // 二 — mid
    kanji:  '二',
    label:  'TIER TWO // ARTISAN',
    note:   'Supporting sponsor — featured on site, banners, and certificates',
    sponsors: [
      { name: 'TBA', url: '#', tba: true },
      { name: 'TBA', url: '#', tba: true },
      { name: 'TBA', url: '#', tba: true },
    ],
  },
  {
    tier:   'APPRENTICE',       // 三 — community
    kanji:  '三',
    label:  'TIER THREE // APPRENTICE',
    note:   'Community partner — credited on site and event communications',
    sponsors: [
      { name: 'TBA', url: '#', tba: true },
      { name: 'TBA', url: '#', tba: true },
      { name: 'TBA', url: '#', tba: true },
      { name: 'TBA', url: '#', tba: true },
    ],
  },
];

/* ─── Sponsor card ───────────────────────────────────────────────────────── */
function SponsorCard({
  sponsor, size, index,
}: {
  sponsor: { name: string; url: string; tba: boolean };
  size: 'lg' | 'md' | 'sm';
  index: number;
}) {
  const heights: Record<string, string> = { lg: 'h-28', md: 'h-20', sm: 'h-16' };
  const textSizes: Record<string, string> = { lg: 'text-lg', md: 'text-sm', sm: 'text-xs' };

  return (
    <motion.a
      href={sponsor.url}
      target={sponsor.tba ? undefined : '_blank'}
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className={`
        group relative border border-ink/10 flex items-center justify-center
        ${heights[size]} overflow-hidden
        hover:border-red/40 transition-colors duration-300
        ${sponsor.tba ? 'cursor-default' : 'cursor-pointer'}
      `}
    >
      {/* Scanline sweep on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(156,31,31,0.04) 50%, transparent 100%)' }} />

      {/* Corner marks */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red/20 group-hover:border-red/50 transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red/20 group-hover:border-red/50 transition-colors" />

      {sponsor.tba ? (
        <div className="text-center px-4">
          <div className="font-mono text-[8px] tracking-[0.3em] text-red/30 mb-1.5">AWAITING SPONSOR</div>
          <div className={`font-syne font-bold text-ink/[0.08] tracking-tight ${textSizes[size]}`}>
            ████████
          </div>
          <div className="font-mono text-[8px] tracking-widest text-muted/30 mt-1.5">TBA</div>
        </div>
      ) : (
        <div className={`font-syne font-bold text-ink/70 group-hover:text-ink transition-colors tracking-tight px-6 text-center ${textSizes[size]}`}>
          {sponsor.name}
        </div>
      )}
    </motion.a>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function Sponsors() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const gridCols: Record<string, string> = {
    PATRON:     'grid-cols-1 sm:grid-cols-2',
    ARTISAN:    'grid-cols-2 sm:grid-cols-3',
    APPRENTICE: 'grid-cols-2 sm:grid-cols-4',
  };
  const cardSize: Record<string, 'lg' | 'md' | 'sm'> = {
    PATRON: 'lg', ARTISAN: 'md', APPRENTICE: 'sm',
  };

  return (
    <section id="sponsors" ref={ref} className="relative border-t border-ink/10">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-24">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="sys-label mb-4 flex items-center gap-3"
        >
          <span className="text-red">§05</span>
          <span className="h-px flex-1 max-w-[40px] bg-ink/20" />
          SPONSORS // SUPPORTING CRAFT
        </motion.div>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          <div>
            <div className="red-rule mb-5" />
            <p className="font-syne text-sm text-ink/70 leading-relaxed">
              Takumi Delhi is made possible by organisations that believe in
              craft, code, and the next generation of builders. Sponsor spots
              are open — reach out to be part of the event.
            </p>
          </div>
          <div className="md:pl-8 border-l border-ink/8">
            <a
              href="mailto:connect@takumidelhi.com?subject=Sponsorship%20Inquiry%20—%20Takumi%20Delhi"
              className="group inline-flex items-center gap-3 font-mono text-[10px] tracking-widest text-muted hover:text-red transition-colors"
            >
              <span className="w-6 h-px bg-muted group-hover:bg-red transition-colors" />
              INTERESTED IN SPONSORING? EMAIL US
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <div className="mt-4 font-mono text-[9px] text-muted/40 leading-relaxed tracking-widest">
              // connect@takumidelhi.com<br />
              // SPONSORSHIP DECK AVAILABLE ON REQUEST
            </div>
          </div>
        </motion.div>

        {/* Tiers */}
        <div className="space-y-12">
          {TIERS.map((tier, ti) => (
            <motion.div
              key={tier.tier}
              initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + ti * 0.12, duration: 0.6 }}
            >
              {/* Tier label row */}
              <div className="flex items-center gap-4 mb-5">
                <span
                  className="font-syne font-bold text-ink/[0.06] leading-none select-none"
                  style={{ fontSize: 'clamp(36px, 6vw, 56px)' }}
                  aria-hidden
                >
                  {tier.kanji}
                </span>
                <div>
                  <div className="sys-label text-red">{tier.label}</div>
                  <div className="font-mono text-[9px] text-muted/50 mt-0.5">{tier.note}</div>
                </div>
              </div>

              {/* Cards */}
              <div className={`grid ${gridCols[tier.tier]} gap-0 border border-ink/10`}>
                {tier.sponsors.map((s, si) => (
                  <div key={si} className="border-r border-b border-ink/10 last:border-r-0">
                    <SponsorCard
                      sponsor={s}
                      size={cardSize[tier.tier]}
                      index={ti * 10 + si}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-10 font-mono text-[10px] text-muted/40 tracking-widest"
        >
          // SPONSOR SLOTS TBA — CONTACT US TO SECURE YOUR POSITION
        </motion.div>

        {/* ASCII decorative block */}
        <div className="mt-8 font-mono text-[9px] text-ink/[0.05] tracking-widest select-none hidden md:block leading-tight">
          {'┌─ TIER ONE: 一 ─────── TIER TWO: 二 ─────── TIER THREE: 三 ─┐'}<br />
          {'│  PATRON          ARTISAN              APPRENTICE            │'}<br />
          {'└──────────────────────────────────────────────────────────────┘'}
        </div>
      </div>
    </section>
  );
}