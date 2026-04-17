'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import dynamic from 'next/dynamic';

const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false });

/* ─── types ──────────────────────────────────── */
interface Member { name: string; email: string; }

type Phase =
  | 'loading'          // checking localStorage / Supabase
  | 'register'         // team not registered yet
  | 'registered'       // registered, submissions closed
  | 'submit'           // registered, submissions open
  | 'submitted';       // already submitted

/* ─── helpers ────────────────────────────────── */
const TEAM_KEY = 'tkm_team_id';

function getStoredTeamId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TEAM_KEY);
}

function storeTeamId(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TEAM_KEY, id);
}

/* ─── field helper ───────────────────────────── */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <label className="sys-label">{label}</label>
        {hint && <span className="font-mono text-[9px] text-muted/50">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = 'text', placeholder = '...' }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <input className="terminal-input" type={type} value={value}
      onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required />
  );
}

function Textarea({ value, onChange, placeholder = '...', rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea className="terminal-input resize-none" rows={rows} value={value}
      onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ borderBottom: '1px solid var(--ink)' }} />
  );
}

/* ─── STATUS BADGE ────────────────────────────── */
function StatusBar({ submissionsOpen }: { submissionsOpen: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-12 pb-5 border-b border-ink/10">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-muted tracking-widest">SUBMISSIONS</span>
        <span className={`font-mono text-[9px] tracking-widest border px-2 py-0.5 ${
          submissionsOpen ? 'border-green-700 text-green-700' : 'border-red/60 text-red/60'
        }`}>
          {submissionsOpen ? '● OPEN' : '● CLOSED'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-muted tracking-widest">REGISTRATION</span>
        <span className="font-mono text-[9px] tracking-widest border border-green-700 text-green-700 px-2 py-0.5">
          ● OPEN
        </span>
      </div>
    </div>
  );
}

/* ─── PHASE: REGISTER ────────────────────────── */
function RegisterForm({ onRegistered }: { onRegistered: (teamId: string, teamName: string) => void }) {
  const supabase = createClient();
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<Member[]>([
    { name: '', email: '' }, { name: '', email: '' }, { name: '', email: '' },
  ]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const setMember = (i: number, field: keyof Member, val: string) => {
    setMembers((m) => m.map((mm, idx) => idx === i ? { ...mm, [field]: val } : mm));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    // Check duplicate team name
    const { data: existing } = await supabase
      .from('teams').select('id').eq('name', teamName.trim()).maybeSingle();
    if (existing) {
      setErrorMsg('A team with this name already exists. Choose a different name or retrieve your team below.');
      setStatus('error');
      return;
    }

    const { data, error } = await supabase.from('teams').insert({
      name: teamName.trim(),
      members: members,
    }).select('id').single();

    if (error || !data) {
      setErrorMsg(error?.message ?? 'Registration failed. Try again.');
      setStatus('error');
      return;
    }

    storeTeamId(data.id);
    onRegistered(data.id, teamName.trim());
  };

  /* retrieve existing team */
  const [retrieveName, setRetrieveName] = useState('');
  const [retrieving, setRetrieving] = useState(false);
  const [showRetrieve, setShowRetrieve] = useState(false);

  const handleRetrieve = async (e: React.FormEvent) => {
    e.preventDefault();
    setRetrieving(true);
    const { data } = await supabase.from('teams').select('id, name')
      .eq('name', retrieveName.trim()).maybeSingle();
    if (data) {
      storeTeamId(data.id);
      onRegistered(data.id, data.name);
    } else {
      alert('Team not found. Check your team name.');
    }
    setRetrieving(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Registration form */}
        <div>
          <div className="red-rule mb-6" />
          <h2 className="font-syne font-bold text-2xl text-ink mb-2">Register Your Team</h2>
          <p className="font-syne text-sm text-ink/60 leading-relaxed mb-8">
            Register once. Your team ID will be saved to this browser.
            All 3 members should use the same device for submission, or note your team name to retrieve access.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Field label="TEAM NAME" hint="unique, max 40 chars">
              <Input value={teamName} onChange={setTeamName} placeholder="e.g. Pixel Ronin" />
            </Field>

            <div>
              <label className="sys-label block mb-3">TEAM MEMBERS (3 REQUIRED)</label>
              <div className="space-y-4">
                {members.map((m, i) => (
                  <div key={i} className="border border-ink/8 p-4 relative">
                    <div className="font-mono text-[9px] text-red/50 tracking-widest mb-3">
                      MEMBER {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="space-y-3">
                      <Field label="NAME">
                        <Input value={m.name} onChange={(v) => setMember(i, 'name', v)} placeholder="Full name" />
                      </Field>
                      <Field label="EMAIL">
                        <Input type="email" value={m.email} onChange={(v) => setMember(i, 'email', v)} placeholder="email@example.com" />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="font-mono text-[10px] text-red tracking-widest border-l-2 border-red pl-3 py-1">
                {errorMsg}
              </div>
            )}

            <button type="submit" disabled={status === 'loading'}
              className="font-mono text-xs tracking-widest px-6 py-3 bg-ink text-paper hover:bg-red transition-colors duration-200 disabled:opacity-50">
              {status === 'loading' ? 'REGISTERING ...' : 'REGISTER TEAM →'}
            </button>
          </form>
        </div>

        {/* Info + retrieve */}
        <div className="md:pt-10">
          <div className="border border-ink/10 p-6 mb-8">
            <div className="sys-label text-red mb-3">HOW IT WORKS</div>
            <div className="space-y-4 font-syne text-sm text-ink/70 leading-relaxed">
              <div className="flex gap-3">
                <span className="font-mono text-[9px] text-red/60 mt-0.5 shrink-0">01</span>
                <p><strong className="text-ink">Register your team</strong> — Enter your team name and all 3 member details.</p>
              </div>
              <div className="flex gap-3">
                <span className="font-mono text-[9px] text-red/60 mt-0.5 shrink-0">02</span>
                <p><strong className="text-ink">Wait for submissions to open</strong> — The admin toggles this during the hackathon.</p>
              </div>
              <div className="flex gap-3">
                <span className="font-mono text-[9px] text-red/60 mt-0.5 shrink-0">03</span>
                <p><strong className="text-ink">Submit your project</strong> — Paste your itch.io/GitHub link, add a description and demo video.</p>
              </div>
              <div className="flex gap-3">
                <span className="font-mono text-[9px] text-red/60 mt-0.5 shrink-0">04</span>
                <p><strong className="text-ink">Voting opens</strong> — Other participants vote for their favourite project. You can also vote on the main site.</p>
              </div>
            </div>
          </div>

          {/* Retrieve team */}
          <div>
            <button onClick={() => setShowRetrieve(!showRetrieve)}
              className="font-mono text-[10px] tracking-widest text-muted hover:text-ink transition-colors mb-4">
              {showRetrieve ? '− HIDE' : '+ ALREADY REGISTERED? RETRIEVE YOUR TEAM'}
            </button>
            <AnimatePresence>
              {showRetrieve && (
                <motion.form
                  key="retrieve"
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                  onSubmit={handleRetrieve}
                  className="overflow-hidden border border-ink/10 p-5 space-y-4"
                >
                  <div className="font-mono text-[9px] text-muted tracking-widest">
                    Enter your exact team name to restore access on this browser.
                  </div>
                  <Field label="TEAM NAME">
                    <Input value={retrieveName} onChange={setRetrieveName} placeholder="Your exact team name" />
                  </Field>
                  <button type="submit" disabled={retrieving}
                    className="font-mono text-[10px] tracking-widest px-4 py-2 border border-ink text-ink hover:bg-ink hover:text-paper transition-colors disabled:opacity-50">
                    {retrieving ? 'SEARCHING ...' : 'RETRIEVE →'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── PHASE: REGISTERED (submissions closed) ─── */
function RegisteredWaiting({ teamName }: { teamName: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-lg border border-ink/10 p-8">
      <div className="font-mono text-[10px] tracking-widest text-green-700 mb-3">✓ TEAM REGISTERED</div>
      <div className="font-syne font-bold text-ink text-xl mb-2">{teamName}</div>
      <p className="font-syne text-sm text-ink/65 leading-relaxed mb-6">
        Your team is registered. Submissions are not open yet — the organizer will open
        them during the hackathon. Come back to this page when submissions open and you
        will see the project submission form here.
      </p>
      <div className="font-mono text-[9px] text-muted/50 tracking-widest">
        // BOOKMARK THIS PAGE // SUBMISSIONS OPEN IN REAL-TIME
      </div>
    </motion.div>
  );
}

/* ─── PHASE: SUBMIT ──────────────────────────── */
function SubmitForm({ teamId, teamName, onSubmitted }: {
  teamId: string; teamName: string; onSubmitted: () => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState({
    projectTitle: '',
    projectDescription: '',
    submissionUrl: '',
    demoVideoUrl: '',
    notes: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Update team with project info
    await supabase.from('teams').update({
      project_title: form.projectTitle,
      project_description: form.projectDescription,
    }).eq('id', teamId);

    // Upsert submission (allow resubmit)
    const { error } = await supabase.from('submissions').upsert({
      team_id: teamId,
      submission_url: form.submissionUrl,
      demo_video_url: form.demoVideoUrl || null,
      notes: form.notes || null,
    }, { onConflict: 'team_id' });

    if (error) {
      setErrorMsg(error.message);
      setStatus('error');
      return;
    }
    onSubmitted();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="red-rule" />
            <span className="font-mono text-[9px] text-green-700 tracking-widest border border-green-700 px-2 py-0.5">
              ✓ REGISTERED: {teamName}
            </span>
          </div>

          <h2 className="font-syne font-bold text-2xl text-ink mb-2">Submit Your Project</h2>
          <p className="font-syne text-sm text-ink/60 leading-relaxed mb-8">
            You can resubmit until submissions close. Your latest submission overwrites the previous one.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Field label="PROJECT TITLE">
              <Input value={form.projectTitle} onChange={set('projectTitle')} placeholder="e.g. Dungeon Walker" />
            </Field>

            <Field label="PROJECT DESCRIPTION" hint="shown to voters">
              <Textarea value={form.projectDescription} onChange={set('projectDescription')}
                placeholder="What is your game about? What makes it interesting?" rows={4} />
            </Field>

            <Field label="SUBMISSION URL" hint="itch.io, GitHub, or any public link">
              <Input type="url" value={form.submissionUrl} onChange={set('submissionUrl')}
                placeholder="https://itch.io/your-game" />
            </Field>

            <Field label="DEMO VIDEO URL" hint="optional — YouTube, Drive, etc.">
              <Input type="url" value={form.demoVideoUrl} onChange={set('demoVideoUrl')}
                placeholder="https://youtube.com/..." />
            </Field>

            <Field label="NOTES FOR JUDGES" hint="optional">
              <Textarea value={form.notes} onChange={set('notes')}
                placeholder="Anything you want judges to know — tools used, challenges faced, etc." rows={3} />
            </Field>

            {errorMsg && (
              <div className="font-mono text-[10px] text-red tracking-widest border-l-2 border-red pl-3 py-1">
                {errorMsg}
              </div>
            )}

            <button type="submit" disabled={status === 'loading'}
              className="font-mono text-xs tracking-widest px-6 py-3 bg-red text-paper hover:bg-ink transition-colors duration-200 disabled:opacity-50">
              {status === 'loading' ? 'SUBMITTING ...' : 'SUBMIT PROJECT →'}
            </button>
          </form>
        </div>

        {/* Right: tips */}
        <div className="md:pt-12">
          <div className="sys-label mb-4 text-red">SUBMISSION CHECKLIST</div>
          <div className="space-y-0 mb-10">
            {[
              'Game is playable from the submission URL',
              'Project was built during the hackathon (May 2–3)',
              'All team members are listed in registration',
              'Assets used are open-source or licensed',
              'Source code is included or linked',
            ].map((item, i) => (
              <div key={i} className="flex gap-3 py-3 border-b border-ink/8">
                <span className="font-mono text-[9px] text-red/50 shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-syne text-sm text-ink/75">{item}</span>
              </div>
            ))}
          </div>

          <div className="border border-ink/10 p-5">
            <div className="sys-label text-muted mb-2">ACCEPTED PLATFORMS</div>
            <div className="font-syne text-sm text-ink/70 leading-relaxed">
              itch.io, GitHub (with playable release or web build), Google Drive (with sharing enabled),
              or any public URL where judges can access or download the game.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── PHASE: SUBMITTED ───────────────────────── */
function SubmittedConfirm({ teamName, onResubmit }: { teamName: string; onResubmit: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-lg">
      <div className="border border-red/20 bg-red/[0.02] p-8 mb-6">
        <div className="font-mono text-[10px] tracking-widest text-red mb-3">PROJECT SUBMITTED</div>
        <div className="font-syne font-bold text-ink text-xl mb-2">{teamName}</div>
        <p className="font-syne text-sm text-ink/65 leading-relaxed">
          Your project has been submitted. It will appear in the leaderboard and voting section
          after the organizer opens voting.
        </p>
      </div>
      <button onClick={onResubmit}
        className="font-mono text-[10px] tracking-widest text-muted hover:text-red transition-colors">
        ← EDIT SUBMISSION
      </button>
    </motion.div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────── */
export default function SubmitPage() {
  const supabase = createClient();
  const [phase, setPhase] = useState<Phase>('loading');
  const [teamId, setTeamId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [submissionsOpen, setSubmissionsOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Check submissions_open setting
      const { data: setting } = await supabase
        .from('settings').select('value').eq('key', 'submissions_open').single();
      const isOpen = setting?.value === true || setting?.value === 'true';
      setSubmissionsOpen(isOpen);

      // Check localStorage for team
      const storedId = getStoredTeamId();
      if (!storedId) { setPhase('register'); return; }

      const { data: team } = await supabase
        .from('teams').select('id, name').eq('id', storedId).maybeSingle();

      if (!team) { setPhase('register'); return; }

      setTeamId(team.id);
      setTeamName(team.name);

      if (!isOpen) { setPhase('registered'); return; }

      // Check if already submitted
      const { data: sub } = await supabase
        .from('submissions').select('id').eq('team_id', team.id).maybeSingle();

      setPhase(sub ? 'submitted' : 'submit');
    };

    init();

    // Real-time: watch submissions_open
    const ch = supabase.channel('submit-settings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, (payload) => {
        if (payload.new.key === 'submissions_open') {
          const open = payload.new.value === true || payload.new.value === 'true';
          setSubmissionsOpen(open);
          setPhase((prev) => {
            if (prev === 'registered' && open) return 'submit';
            if (prev === 'submit' && !open) return 'registered';
            return prev;
          });
        }
      }).subscribe();

    return () => { supabase.removeChannel(ch); };
  }, []); // eslint-disable-line

  const handleRegistered = (id: string, name: string) => {
    setTeamId(id);
    setTeamName(name);
    setPhase(submissionsOpen ? 'submit' : 'registered');
  };

  return (
    <div className="min-h-screen grid-overlay">
      <CustomCursor />

      {/* Header */}
      <div className="border-b border-ink/10">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
          <a href="/" className="group flex items-center gap-3">
            <span className="font-syne font-black text-xl text-ink group-hover:text-red transition-colors">
              TAKUMI<span className="text-red">.</span>
            </span>
            <span className="font-mono text-[9px] text-muted tracking-widest hidden sm:block">
              DELHI // 2025
            </span>
          </a>
          <div className="sys-label">TEAM PORTAL</div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="sys-label mb-3 flex items-center gap-3">
            <span className="text-red">TKM // PORTAL</span>
            <span className="h-px flex-1 max-w-[40px] bg-ink/20" />
            TEAM REGISTRATION & SUBMISSION
          </div>
          <h1 className="font-syne font-black text-ink leading-none tracking-tight"
            style={{ fontSize: 'clamp(32px, 6vw, 72px)' }}>
            REGISTER & SUBMIT
          </h1>
        </motion.div>

        <StatusBar submissionsOpen={submissionsOpen} />

        {/* Phase content */}
        <AnimatePresence mode="wait">
          {phase === 'loading' && (
            <div key="loading" className="font-mono text-xs text-muted py-8">
              &gt; INITIALIZING TEAM PORTAL ...
              <span className="inline-block w-2 h-3 bg-muted/40 ml-1" style={{ animation: 'blink 1s step-start infinite' }} />
            </div>
          )}

          {phase === 'register' && (
            <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RegisterForm onRegistered={handleRegistered} />
            </motion.div>
          )}

          {phase === 'registered' && (
            <motion.div key="registered" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RegisteredWaiting teamName={teamName} />
            </motion.div>
          )}

          {phase === 'submit' && (
            <motion.div key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SubmitForm
                teamId={teamId}
                teamName={teamName}
                onSubmitted={() => setPhase('submitted')}
              />
            </motion.div>
          )}

          {phase === 'submitted' && (
            <motion.div key="submitted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SubmittedConfirm teamName={teamName} onResubmit={() => setPhase('submit')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="border-t border-ink/10 mt-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
          <span className="font-mono text-[9px] text-muted/50 tracking-widest">
            TAKUMI DELHI // MAY 2–3, 2025
          </span>
          <a href="/" className="font-mono text-[9px] text-muted/50 hover:text-red transition-colors tracking-widest">
            ← BACK TO MAIN SITE
          </a>
        </div>
      </div>
    </div>
  );
}
