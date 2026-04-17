'use client';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name, email: form.email, message: form.message,
    });
    if (error) { setStatus('error'); return; }
    setStatus('sent');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" ref={ref} className="relative border-t border-ink/10 bg-ink/[0.018]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="sys-label mb-12 flex items-center gap-3"
        >
          <span className="text-red">§08</span>
          <span className="h-px flex-1 max-w-[40px] bg-ink/20" />
          CONTACT // UPLINK
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <div className="red-rule mb-6" />
            <h2 className="font-syne font-bold text-2xl md:text-3xl text-ink mb-4 leading-tight">
              Questions?<br />Reach us directly.
            </h2>
            <p className="font-syne text-sm text-ink/65 leading-relaxed mb-8">
              If you have questions about registration, eligibility, venue access,
              or anything else — send us a message and we will respond within 24 hours.
            </p>
            <div className="space-y-0">
              {[
                { label: 'EMAIL',    value: 'krisharv.chaubey@gmail.com' },
                { label: 'LOCATION',value: 'DBSE Office, IP Extension, Delhi' },
                { label: 'FOLLOW',  value: '@takumidelhi' },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4 py-3 border-b border-ink/8">
                  <span className="sys-label w-20 shrink-0 pt-0.5">{label}</span>
                  <span className="font-mono text-xs text-ink/70">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-12 font-mono text-[10px] text-ink/10 leading-tight select-none hidden md:block">
              {'┌──────────────────────┐'}<br />
              {'│  TAKUMI DELHI // §08  │'}<br />
              {'│  CONTACT UPLINK OPEN  │'}<br />
              {'└──────────────────────┘'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {status === 'sent' ? (
              <div className="border border-red/20 p-8 bg-red/[0.02]">
                <div className="font-mono text-[10px] tracking-widest text-red mb-3">TRANSMISSION SENT</div>
                <div className="font-syne font-semibold text-ink text-base mb-2">Message received.</div>
                <div className="font-mono text-xs text-muted/70">We will respond to your email within 24 hours.</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {(['name','email','message'] as const).map((id) => (
                  <div key={id}>
                    <label className="sys-label block mb-1">{id.toUpperCase()}</label>
                    {id === 'message' ? (
                      <textarea className="terminal-input resize-none" rows={4}
                        value={form[id]} onChange={(e) => setForm({ ...form, [id]: e.target.value })}
                        placeholder="..." required style={{ borderBottom: '1px solid var(--ink)' }} />
                    ) : (
                      <input className="terminal-input" type={id === 'email' ? 'email' : 'text'}
                        value={form[id]} onChange={(e) => setForm({ ...form, [id]: e.target.value })}
                        placeholder="..." required />
                    )}
                  </div>
                ))}
                {status === 'error' && (
                  <div className="font-mono text-[10px] text-red tracking-widest">
                    // TRANSMISSION FAILED — TRY AGAIN OR EMAIL US DIRECTLY
                  </div>
                )}
                <button type="submit" disabled={status === 'sending'}
                  className="font-mono text-xs tracking-widest px-6 py-3 bg-ink text-paper hover:bg-red transition-colors duration-200 disabled:opacity-50">
                  {status === 'sending' ? 'TRANSMITTING ...' : 'SEND MESSAGE →'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
