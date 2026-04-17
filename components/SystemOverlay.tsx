'use client';
import { useEffect, useState } from 'react';

export default function SystemOverlay() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        })
      );
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 font-mono text-[9px] tracking-widest text-muted/70 select-none">
      {/* Top-left */}
      <div className="absolute top-4 left-5 space-y-0.5">
        <div>SYS:00 // TKM-DL-2025</div>
        <div>{time} IST</div>
      </div>
      {/* Top-right */}
      <div className="absolute top-4 right-5 text-right space-y-0.5">
        <div>28°38′N 77°13′E</div>
        <div>SECTOR // IP-EXT</div>
      </div>
      {/* Bottom-left */}
      <div className="absolute bottom-4 left-5">
        TAKUMI.DEL // v1.0.0
      </div>
      {/* Bottom-right */}
      <div className="absolute bottom-4 right-5 text-right">
        GAME DEV // SATELLITE
      </div>
    </div>
  );
}
