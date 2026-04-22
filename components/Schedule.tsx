'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const DAY1 = [
  { time: '08:00', event: 'Participant Check-in',     type: 'ADMIN',  note: 'ID verification required' },
  { time: '09:00', event: 'Opening Ceremony + Rules Brief',          type: 'SYSTEM', note: 'Welcome + rules brief' },
  { time: '10:00', event: 'Workshops/Bootcamp by Godot, Github etc.',   type: 'START',  note: 'Notes time' },
  { time: '13:00', event: 'Lunch Break',               type: 'PAUSE',  note: '45 minutes' },
  { time: '14:00', event: 'Hacking Continue',          type: 'CHECK',  note: 'Hardwork time' },
  { time: '17:00', event: 'Mid Day Check in',         type: 'PAUSE',  note: 'Mentor Walkthroughs' },
  { time: '18:00 - 20:00', event: 'Dinner + Warp up',         type: 'PAUSE',  note: 'Time to go home' },
];

const DAY2 = [
  { time: '08:00', event: 'Resume — Day 2',            type: 'START',  note: 'Builds resume' },
  { time: '09:00', event: 'Final Development Window',            type: 'START',  note: 'Sprint' },
  { time: '10:00', event: 'Submission Window Opens',   type: 'SYSTEM', note: 'Upload required' },
  { time: '12:00', event: 'Final Submission Deadline', type: 'END',    note: 'Hard cutoff' },
  { time: '13:00', event: 'Lunch + Judging Prep',      type: 'PAUSE',  note: '' },
  { time: '14:00', event: 'Presentations & Demo',      type: 'SYSTEM', note: '2-3 min per team' },
  { time: '17:30', event: 'Voting By Students',      type: 'SYSTEM', note: 'Fair Voting' },
  { time: '18:00', event: 'Results & Closing',         type: 'ADMIN',    note: 'Winners announced' },
  { time: '19:00 - 20:00', event: 'Closing Ceremony',         type: 'END',    note: 'Result' },
];

const TYPE_COLOR: Record<string, string> = {
  ADMIN: 'text-muted', SYSTEM: 'text-orange', START: 'text-red',
  END: 'text-red', PAUSE: 'text-ink/40', CHECK: 'text-ink/60',
};

function DayBlock({ label, events, delay }: { label: string; events: typeof DAY1; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6 }}
    >
      <div className="sys-label mb-4 text-red tracking-widest">{label}</div>
      <div className="border border-ink/10">
        {events.map((e, i) => (
          <div key={i} className="flex border-b border-ink/8 last:border-b-0 hover:bg-ink/[0.02] transition-colors">
            <div className="w-16 shrink-0 font-mono text-[11px] text-muted px-3 py-3 border-r border-ink/8">{e.time}</div>
            <div className="flex-1 px-4 py-3">
              <div className="font-syne text-sm font-semibold text-ink">{e.event}</div>
              {e.note && <div className="font-mono text-[9px] text-muted/60 mt-0.5">{e.note}</div>}
            </div>
            <div className={`font-mono text-[9px] tracking-widest px-3 py-3 shrink-0 self-center ${TYPE_COLOR[e.type] ?? 'text-muted'}`}>
              {e.type}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Schedule() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section id="schedule" ref={ref} className="relative border-t border-ink/10">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="sys-label mb-12 flex items-center gap-3"
        >
          <span className="text-red">§03</span>
          <span className="h-px flex-1 max-w-[40px] bg-ink/20" />
          SCHEDULE // TIMELINE
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <DayBlock label="DAY 1 // MAY 2" events={DAY1} delay={0.1} />
          <DayBlock label="DAY 2 // MAY 3" events={DAY2} delay={0.25} />
        </div>
        <div className="mt-6 font-mono text-[10px] text-muted/40 tracking-widest">
          // SCHEDULE IS INDICATIVE — FINAL TIMINGS SHARED VIA OFFICIAL CHANNELS
        </div>
      </div>
    </section>
  );
}
