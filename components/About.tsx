'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (d: number) => ({
    opacity: 1, y: 0,
    transition: { delay: d * 0.12, duration: 0.75, ease: [0.4, 0, 0.2, 1] },
  }),
};

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" ref={ref} className="relative border-t border-ink/10">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-24 md:py-32">
        <motion.div
          variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0}
          className="sys-label mb-12 flex items-center gap-3"
        >
          <span className="text-red">§01</span>
          <span className="h-px flex-1 max-w-[40px] bg-ink/20" />
          ABOUT
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          <div>
            <motion.div
              variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={1}
              className="mb-6"
            >
              <div className="flex items-start gap-4">
                <span className="font-syne font-bold text-ink/[0.07] leading-none select-none"
                  style={{ fontSize: 'clamp(80px, 14vw, 120px)' }}>匠</span>
                <div className="pt-3">
                  <div className="font-mono text-[10px] tracking-widest text-muted mb-1">TAKUMI // 匠</div>
                  <div className="font-syne font-bold text-2xl md:text-3xl text-ink leading-tight">
                    The Craftsman&apos;s<br />Philosophy
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={2}
              className="space-y-4 text-ink/75 leading-relaxed font-syne text-[15px]"
            >
              <p>In Japanese craft tradition, a <em>Takumi</em> is a master artisan — someone who has devoted years to perfecting a single discipline. Not to be fast. Not to be loud. But to be <em>precise</em>.</p>
              <p>This hackathon carries that name as a challenge: build something that reflects craft. Every mechanic considered. Every screen intentional. Every frame earned.</p>
            </motion.div>
          </div>

          <div className="md:pt-16">
            <motion.div
              variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={3}
              className="border-l-2 border-red pl-6 mb-8"
            >
              <div className="font-mono text-[10px] tracking-widest text-red mb-2">THE EVENT</div>
              <p className="font-syne font-semibold text-xl text-ink leading-snug">
                A 24-hour game development hackathon for builders under 18 — offline, intense, and deliberately designed to reward craft over chaos.
              </p>
            </motion.div>
            <motion.div
              variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={4}
            >
              {[
                ['THEME',      'Game Development — any genre, any mechanic'],
                ['PHILOSOPHY', 'Precision over hype. Craft over spectacle'],
                ['FORMAT',     'Two 12-hour sprints across May 2–3'],
                ['SATELLITE',  'Official Hack Club satellite event'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3 py-3 border-b border-ink/8">
                  <span className="sys-label w-24 shrink-0 pt-0.5">{k}</span>
                  <span className="font-syne text-sm text-ink/80">{v}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
