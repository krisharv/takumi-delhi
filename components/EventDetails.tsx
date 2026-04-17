'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const SPECS = [
  { id: 'SPEC-01', label: 'Team Size',   value: '3 Members',     sub: 'Per team' },
  { id: 'SPEC-02', label: 'Eligibility', value: 'Under 18',      sub: 'Age at event date' },
  { id: 'SPEC-03', label: 'Mode',        value: 'Offline',       sub: 'In-person only' },
  { id: 'SPEC-04', label: 'Venue',       value: 'DBSE Office',   sub: 'IP Extension, Delhi' },
  { id: 'SPEC-05', label: 'Duration',    value: '24 Hours',      sub: '12 + 12 hrs across 2 days' },
  { id: 'SPEC-06', label: 'Theme',       value: 'Game Dev',      sub: 'Any genre, any engine' },
];

export default function EventDetails() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="details" ref={ref} className="relative border-t border-ink/10 bg-ink/[0.018]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="sys-label mb-12 flex items-center gap-3"
        >
          <span className="text-red">§02</span>
          <span className="h-px flex-1 max-w-[40px] bg-ink/20" />
          EVENT DETAILS // SYSTEM SPEC
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border border-ink/10">
          {SPECS.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="p-6 border-b border-r border-ink/10 relative group"
            >
              <div className="font-mono text-[9px] tracking-widest text-red/60 mb-3">{s.id}</div>
              <div className="sys-label text-muted mb-2">{s.label.toUpperCase()}</div>
              <div className="font-syne font-bold text-ink text-xl md:text-2xl mb-1 leading-tight">{s.value}</div>
              <div className="font-mono text-[10px] text-muted/70">{s.sub}</div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-red/30 group-hover:border-red/70 transition-colors" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-6 font-mono text-[10px] text-muted/50 tracking-widest"
        >
          // ALL SPECS SUBJECT TO CONFIRMATION — CHECK COMMUNICATION CHANNELS
        </motion.div>
      </div>
    </section>
  );
}
