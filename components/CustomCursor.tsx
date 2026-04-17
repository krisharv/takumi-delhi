'use client';
import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mx = -100, my = -100;
    let rx = -100, ry = -100;
    let raf: number;

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      rx = lerp(rx, mx, 0.14);
      ry = lerp(ry, my, 0.14);

      if (dot.current) {
        dot.current.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate(${rx - 14}px, ${ry - 14}px)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onDown = () => {
      dot.current?.classList.add('scale-150');
      ring.current?.classList.add('scale-75', 'opacity-50');
    };
    const onUp = () => {
      dot.current?.classList.remove('scale-150');
      ring.current?.classList.remove('scale-75', 'opacity-50');
    };

    const onEnterLink = () => ring.current?.classList.add('ring-hover');
    const onLeaveLink = () => ring.current?.classList.remove('ring-hover');

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    const addLinkListeners = () => {
      document.querySelectorAll('a, button, [role="button"], input, textarea, select, label').forEach((el) => {
        el.addEventListener('mouseenter', onEnterLink);
        el.addEventListener('mouseleave', onLeaveLink);
      });
    };
    addLinkListeners();

    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Solid dot */}
      <div
        ref={dot}
        className="fixed top-0 left-0 z-[999] pointer-events-none transition-transform duration-75"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--red)',
          willChange: 'transform',
        }}
      />
      {/* Trailing ring */}
      <div
        ref={ring}
        className="fixed top-0 left-0 z-[998] pointer-events-none transition-[width,height,border-color] duration-150"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '1.5px solid var(--red)',
          opacity: 0.45,
          willChange: 'transform',
        }}
      />
      <style>{`
        * { cursor: none !important; }
        .ring-hover { width: 38px !important; height: 38px !important; opacity: 0.65 !important; border-color: var(--red) !important; }
      `}</style>
    </>
  );
}
