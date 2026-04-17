'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const BOOT_LINES = [
  'INITIALIZING TAKUMI SYSTEM v1.0 ...',
  'LOADING CRAFTSMANSHIP PROTOCOLS ...',
  'ESTABLISHING SECURE UPLINK ...',
  'CALIBRATING INTERFACE LAYER ...',
  'MOUNTING GAME DEV ENVIRONMENT ...',
  '匠  SYSTEM READY.',
];

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setLines((p) => [...p, BOOT_LINES[i++]]);
      } else {
        clearInterval(iv);
        setTimeout(() => {
          setExiting(true);
          setTimeout(onComplete, 700);
        }, 500);
      }
    }, 320);
    return () => clearInterval(iv);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="loader"
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center"
          style={{ backgroundColor: '#1A1A18' }}
        >
          {/* Corner decorations */}
          <div className="absolute top-4 left-5 font-mono text-[10px] text-paper/20 tracking-widest">
            SYS:00 // TAKUMI-DL
          </div>
          <div className="absolute top-4 right-5 font-mono text-[10px] text-paper/20 tracking-widest">
            28°38′N 77°13′E
          </div>

          {/* Kanji watermark */}
          <div
            className="absolute font-syne font-bold text-paper/[0.03] select-none pointer-events-none"
            style={{ fontSize: 'clamp(160px, 30vw, 320px)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            匠
          </div>

          {/* Boot log */}
          <div className="relative z-10 font-mono text-xs w-[min(360px,90vw)] space-y-1">
            {lines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18 }}
                className={
                  i === BOOT_LINES.length - 1
                    ? 'text-[#9C1F1F] font-semibold tracking-wider'
                    : 'text-paper/50'
                }
              >
                <span className="text-paper/20 mr-2">&gt;</span>
                {line}
              </motion.div>
            ))}
            {!exiting && (
              <span
                className="inline-block w-[8px] h-[14px] ml-4 bg-paper/40"
                style={{ animation: 'blink 1s step-start infinite' }}
              />
            )}
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-5 left-5 right-5 flex justify-between">
            <span className="font-mono text-[9px] text-paper/15 tracking-widest">TAKUMI DELHI // MAY 2–3</span>
            <span className="font-mono text-[9px] text-paper/15 tracking-widest">GAME DEV HACKATHON</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
