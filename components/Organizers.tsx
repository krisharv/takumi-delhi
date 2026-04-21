'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from "next/image";

// 5 organizers — replace name/role/initials with real data
const ORGANIZERS = [
  { name: 'Vedita Reddy', role: 'Director of DOE', image: '/images/Vedita.jpeg', initials: '01' },
  { name: 'K.S. Upadhyay', role: 'Addl. Director of DOE', image: '/images/Ks_upadhyay.jpeg', initials: '02' },
  { name: 'Reena Maan', role: 'Lecturer Chemistry', image: '/images/Reena.jpeg', initials: '03' },
  { name: 'Atharv Chaubey', role: 'Lead Organizer', image: '/images/atharv.jpeg', initials: '04' },
  { name: 'Devpriya', role: 'Lead Organizer', image: '/images/devpriya.jpeg', initials: '05' },
  { name: 'Kanishk', role: 'Organizer', image: '/images/kanishk.jpeg', initials: '06' },
  { name: 'Ansh', role: 'Organizer', image: '/images/ansh.jpeg', initials: '07' },
  { name: 'Sukhdev', role: 'Organizer', image: '/images/Sukhdev.jpeg', initials: '08' },
  { name: 'Shorya', role: 'Organizer', image: '/images/shorya.jpeg', initials: '09' },
  { name: 'Aryan', role: 'Organizer', image: '/images/Aryan.jpeg', initials: '10' },
  
  
];
function OrgCard({ org, i }: { org: any; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: i * 0.07, duration: 0.55 }}
      className="scanline-hover group p-5 relative"
    >
      {/* IMAGE BOX */}
      <div className="w-full aspect-square bg-paper-dark mb-4 relative overflow-hidden border border-ink/8">

  {org.image ? (
    <>
      <Image
        src={org.image}
        alt={org.name}
        fill
        className="
          object-cover
          grayscale
          contrast-125
          brightness-90
          group-hover:grayscale-0
          group-hover:brightness-100
          group-hover:scale-105
          transition-all duration-500
        "
      />

      {/* SCAN LINE */}
      <div className="scan-line" />
    </>
  ) : (
    <div className="flex items-center justify-center w-full h-full">
      <span className="font-syne font-bold text-2xl text-ink/20 tracking-widest">
        {org.initials}
      </span>
    </div>
  )}

  {/* hover overlay (keep yours) */}
  <div
    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    style={{
      background:
        "linear-gradient(180deg, transparent 60%, rgba(26,26,24,0.08) 100%)",
    }}
  />
</div>

      {/* TEXT */}
      <div className="sys-label text-red/60 mb-1">ORGANIZER</div>
      <div className="font-syne font-semibold text-ink text-base">
        {org.name}
      </div>
      <div className="font-mono text-[10px] text-muted mt-0.5">
        {org.role.toUpperCase()}
      </div>

      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-red/20 group-hover:border-red/50 transition-colors" />
    </motion.div>
  );
}

export default function Organizers() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section id="organizers" ref={ref} className="relative border-t border-ink/10 bg-ink/[0.018]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="sys-label mb-12 flex items-center gap-3"
        >
          <span className="text-red">§04</span>
          <span className="h-px flex-1 max-w-[40px] bg-ink/20" />
          ORGANIZERS // TEAM
        </motion.div>

        {/* 5 cards — 5 columns on large, 3+2 on medium, 2+3 on small */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0 border border-ink/10">
          {ORGANIZERS.map((org, i) => (
            <div key={i} className="border-r border-b border-ink/10 last:border-r-0">
              <OrgCard org={org} i={i} />
            </div>
          ))}
        </div>

        <div className="mt-6 font-mono text-[10px] text-muted/40 tracking-widest">
          // HOVER CARDS TO REVEAL 
        </div>
      </div>
    </section>
  );
}
