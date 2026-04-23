'use client';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';

const FAQS = [
  { q: 'Who can participate?', a: 'Anyone under 18 years old. This is an under-18 offline hackathon. You must attend in person at the DBSE Office, IP Extension, Delhi.' },
  { q: 'What is the team size?', a: 'Teams of max 3 members. Solo registrations are not allowed but duo and team of three are allowed' },
  { q: 'Does my team need prior game dev experience?', a: 'No. Even if you are a complete beginer its okay we will have workshops. You can use any engine or framework — Godot, Unity, Pygame, vanilla JS, GameMaker, or even a terminal-based game. Craft matters more than polish.' },
  { q: 'What tools and engines are allowed?', a: 'Any engine, framework, or language is allowed. You must build the game during the hackathon — pre-built codebases are not permitted. Assets from open-source or licensed packs are allowed with attribution.' },
  { q: 'Is there a registration fee?', a: 'No registration fee. This is a community event. Register at /submit and watch for a confirmation message.' },
  { q: 'What should I bring?', a: 'Your laptop, charger, any peripherals you need, and your ID. Food will be provided during the event. ' },
  { q: 'How are projects judged?', a: 'Projects are judged on Gameplay (is it fun?), Craft (is it thoughtful?), and Originality (is it novel?). There is also a community voting round that contributes to the final score.' },
  { q: 'Is this a Hack Club event?', a: "No — Takumi Delhi is a CM Shri Satellite Hackathon. It is independently organized but follows Hack Club's Code of Conduct and ethos." },
];

function FAQItem({ item, index }: { item: typeof FAQS[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="border-b border-ink/10"
    >
      <button onClick={() => setOpen(!open)}
        className="w-full text-left flex items-start justify-between gap-4 py-5 group">
        <div className="flex gap-3 items-start">
          <span className="font-mono text-[9px] text-red/50 mt-1 tracking-widest shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="font-syne font-semibold text-ink text-sm group-hover:text-red transition-colors">
            {item.q}
          </span>
        </div>
        <span className="font-mono text-xs text-muted shrink-0 mt-0.5">{open ? '−' : '+'}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="c"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="pl-8 pb-5 font-syne text-sm text-ink/70 leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section id="faq" ref={ref} className="relative border-t border-ink/10">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="sys-label mb-12 flex items-center gap-3"
        >
          <span className="text-red">§07</span>
          <span className="h-px flex-1 max-w-[40px] bg-ink/20" />
          FAQ // FREQUENTLY ASKED
        </motion.div>
        <div className="max-w-2xl">
          {FAQS.map((item, i) => <FAQItem key={i} item={item} index={i} />)}
        </div>
      </div>
    </section>
  );
}
