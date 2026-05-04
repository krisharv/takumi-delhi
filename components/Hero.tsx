'use client';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

function useTypewriter(text: string, speed = 38, delay = 1200) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const iv = setInterval(() => {
      if (i < text.length) setDisplayed(text.slice(0, ++i));
      else clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [started, text, speed]);

  return { displayed, done: displayed === text };
}

export default function Hero() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { displayed: tagline, done: taglineDone } = useTypewriter('Craft. Code. Create.', 42, 800);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;


    // 1. Save email to Supabase
    const { error } = await supabase
      .from("contact_messages")
      .insert([{ email }]);

    if (error) {
      console.error(error);
    }

    // 2. Redirect to Google Form
    window.open("https://takumi.fillout.com/register", "_blank");

    // 3. Optional UI feedback
    setSubmitted(true);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (d: number) => ({ opacity: 1, y: 0, transition: { delay: d, duration: 0.7, ease: [0.4, 0, 0.2, 1] } }),
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen grid-overlay flex flex-col justify-between px-6 md:px-12 pt-24 pb-20"
    >
      {/* Faint kanji watermark */}
      <div
        className="absolute inset-0 flex items-center justify-end pr-12 pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <span
          className="font-syne font-bold text-ink/[0.032]"
          style={{ fontSize: 'clamp(200px, 38vw, 500px)', lineHeight: 1 }}
        >
          匠
        </span>
      </div>

      {/* Vertical accent text */}
      <div className="absolute right-5 top-1/2 -translate-y-1/2 vertical-text sys-label hidden lg:block">
        GAME DEV HACKATHON — SATELLITE EVENT
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-5xl">

        {/* System prefix */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0.1}
          className="sys-label mb-6 flex items-center gap-3"
        >
          <span className="inline-block w-4 h-px bg-muted/50" />
          TAKUMI // DELHI // 2026
        </motion.div>

        {/* Main title */}
        <div className="overflow-hidden mb-2">
          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
            className="font-syne font-black text-ink leading-none tracking-[-0.02em]"
            style={{
              fontSize: 'clamp(52px, 12vw, 140px)',
              animation: 'flicker 8s infinite 2s',
            }}
          >
            TAKUMI
          </motion.h1>
        </div>

        <div className="overflow-hidden mb-8">
          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1], delay: 0.35 }}
            className="font-syne font-black text-ink leading-none tracking-[-0.02em]"
            style={{ fontSize: 'clamp(52px, 12vw, 140px)' }}
          >
            DELHI
            <span className="text-red ml-4 md:ml-6">.</span>
          </motion.h1>
        </div>

        {/* Tagline — typing */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0.6}
          className="font-mono text-base md:text-xl text-ink/75 mb-2 tracking-wider"
        >
          &gt;&nbsp;
          <span>{tagline}</span>
          {!taglineDone && (
            <span
              className="inline-block w-[10px] h-[18px] bg-ink/60 ml-0.5 align-middle"
              style={{ animation: 'blink 1s step-start infinite' }}
            />
          )}
        </motion.div>

        {/* Event meta */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0.9}
          className="flex flex-wrap gap-6 mt-8 mb-12"
        >
          {[
            { label: 'DATE', value: 'MAY 2–3, 2026' },
            { label: 'VENUE', value: 'Office Of RDE East, IP EXT' },
            { label: 'DURATION', value: '12 + 12 HRS' },
          ].map((m) => (
            <div key={m.label}>
              <div className="sys-label mb-0.5">{m.label}</div>
              <div className="font-mono text-sm text-ink font-medium tracking-wide">{m.value}</div>
            </div>
          ))}
        </motion.div>

        {/* Event status */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={1.1}
          className="max-w-md"
        >
          <div className="font-mono text-sm tracking-wide border border-red/40 px-4 py-3 flex items-center gap-3">
            <span className="inline-block w-2 h-2 rounded-full bg-red" />
            <span className="text-red tracking-widest uppercase">
              &gt; Event Has Ended
            </span>
          </div>
          <p className="font-mono text-xs text-ink/60 mt-2 tracking-wide">
            Thank you to all participants and attendees for making TAKUMI Delhi 2026 a success. See you next time soon!
          </p>
        </motion.div>
      </div>

      {/* Bottom divider */}
      <div className="relative z-10 flex items-center gap-4 mt-12">
        <div className="red-rule" />
        <span className="sys-label">SCROLL TO EXPLORE</span>
        <div className="flex-1 h-px bg-ink/8" />
      </div>
    </section>
  );
}