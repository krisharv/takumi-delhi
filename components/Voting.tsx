'use client';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase';

type Category = 'gamedev' | 'webdev';

interface Team {
  id: string;
  name: string;
  project_title: string;
  project_description: string;
  category: Category;
  submission_url?: string;
}

const VOTER_KEY = 'tkm_voter_id';

function getVoterId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(VOTER_KEY);
  if (!id) { id = uuidv4(); localStorage.setItem(VOTER_KEY, id); }
  return id;
}

const CATEGORIES: { key: Category; label: string; code: string }[] = [
  { key: 'gamedev', label: 'Game Dev',  code: 'CAT-01' },
  { key: 'webdev',  label: 'Web Dev',   code: 'CAT-02' },
];

function VoteCard({ team, index, voted, submitting, onVote }: {
  team: Team; index: number; voted: string | null; submitting: boolean; onVote: (id: string) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const isVoted = voted === team.id;
  const isOther = voted && voted !== team.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`relative border flex flex-col transition-all duration-200 ${
        isVoted ? 'border-red bg-red/[0.04]'
        : isOther ? 'border-ink/10 opacity-40 pointer-events-none'
        : 'border-ink/10 hover:border-red/40 hover:bg-red/[0.02]'
      }`}
    >
      {isVoted && (
        <div className="absolute top-3 right-3">
          <span className="font-mono text-[9px] tracking-widest text-red border border-red px-2 py-0.5">✓ VOTED</span>
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="sys-label text-red/50 mb-2">{String(index + 1).padStart(2,'0')} // TEAM</div>
        <div className="font-syne font-bold text-ink text-lg mb-1">{team.name}</div>
        <div className="font-mono text-[10px] text-orange tracking-wide mb-3">{team.project_title || '—'}</div>
        <p className="font-syne text-xs text-ink/60 leading-relaxed flex-1 mb-4">
          {team.project_description || 'No description provided.'}
        </p>
        {team.submission_url && (
          <a href={team.submission_url} target="_blank" rel="noopener noreferrer"
            className="font-mono text-[9px] tracking-widest text-muted hover:text-red transition-colors mb-4"
            onClick={(e) => e.stopPropagation()}>
            ↗ VIEW PROJECT
          </a>
        )}
        {!voted && (
          !confirm ? (
            <button onClick={() => setConfirm(true)} disabled={submitting}
              className="w-full font-mono text-[10px] tracking-widest py-2.5 border border-ink/20 text-ink hover:border-red hover:text-red transition-colors">
              CAST VOTE
            </button>
          ) : (
            <div className="border border-red/40 p-3 bg-red/[0.03]">
              <div className="font-mono text-[9px] text-red tracking-widest mb-2">CONFIRM VOTE?</div>
              <div className="font-syne text-xs text-ink/70 mb-3">This cannot be undone. One vote per category.</div>
              <div className="flex gap-2">
                <button onClick={() => onVote(team.id)} disabled={submitting}
                  className="flex-1 font-mono text-[9px] tracking-widest py-2 bg-red text-paper hover:bg-ink transition-colors disabled:opacity-50">
                  {submitting ? '...' : 'CONFIRM →'}
                </button>
                <button onClick={() => setConfirm(false)}
                  className="font-mono text-[9px] tracking-widest py-2 px-3 border border-ink/20 text-muted hover:text-ink transition-colors">
                  CANCEL
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </motion.div>
  );
}

export default function Voting() {
  const [votingOpen, setVotingOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  // voted is per-category: { gamedev: teamId | null, webdev: teamId | null }
  const [voted, setVoted] = useState<Record<Category, string | null>>({ gamedev: null, webdev: null });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>('gamedev');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: setting } = await supabase
        .from('settings').select('value').eq('key', 'voting_open').single();
      const isOpen = setting?.value === true || setting?.value === 'true';
      setVotingOpen(isOpen);

      if (isOpen) {
        const { data: teamsData } = await supabase
          .from('teams').select('id, name, project_title, project_description, category').order('name');
        const { data: subs } = await supabase.from('submissions').select('team_id, submission_url');
        const subMap: Record<string, string> = {};
        (subs ?? []).forEach((s) => { subMap[s.team_id] = s.submission_url; });
        setTeams((teamsData ?? []).map((t) => ({ ...t, submission_url: subMap[t.id] })));

        const vid = getVoterId();
        // Fetch votes for both categories
        const { data: existingVotes } = await supabase
          .from('votes').select('team_id, category').eq('voter_id', vid);
        if (existingVotes) {
          const voteMap: Record<Category, string | null> = { gamedev: null, webdev: null };
          existingVotes.forEach((v) => {
            if (v.category === 'gamedev' || v.category === 'webdev') {
              voteMap[v.category as Category] = v.team_id;
            }
          });
          setVoted(voteMap);
        }
      }
      setLoading(false);
    };

    init();

    const ch = supabase.channel('voting-settings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, (payload) => {
        if (payload.new.key === 'voting_open') setVotingOpen(payload.new.value === true || payload.new.value === 'true');
      }).subscribe();

    return () => { supabase.removeChannel(ch); };
  }, []); // eslint-disable-line

  const handleVote = async (teamId: string) => {
    if (voted[activeCategory] || submitting) return;
    setSubmitting(true);
    const vid = getVoterId();
    const { error } = await supabase.from('votes').insert({
      voter_id: vid,
      team_id: teamId,
      category: activeCategory,
    });
    if (!error) setVoted((prev) => ({ ...prev, [activeCategory]: teamId }));
    setSubmitting(false);
  };

  const visibleTeams = teams.filter((t) => t.category === activeCategory);
  const currentVote = voted[activeCategory];

  return (
    <section id="voting" ref={ref} className="relative border-t border-ink/10 bg-ink/[0.018]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-24">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="sys-label mb-3 flex items-center gap-3"
        >
          <span className="text-red">§06</span>
          <span className="h-px flex-1 max-w-[40px] bg-ink/20" />
          VOTING // PARTICIPANT CHOICE
          {!loading && (
            <span className={`ml-auto font-mono text-[9px] tracking-widest border px-2 py-0.5 ${
              votingOpen ? 'border-green-700 text-green-700' : 'border-red/60 text-red/60'
            }`}>
              {votingOpen ? '● VOTING OPEN' : '● VOTING CLOSED'}
            </span>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.15 }}
          className="font-mono text-[9px] text-muted/50 tracking-widest mb-8">
          // ONE VOTE PER CATEGORY // CANNOT BE CHANGED // RESULTS ON LEADERBOARD
        </motion.div>

        {/* Category toggle tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex gap-0 mb-10 border border-ink/10 w-fit"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            const hasVoted = !!voted[cat.key];
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`relative px-6 py-3 font-mono text-[10px] tracking-widest transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-ink text-paper'
                    : 'bg-transparent text-muted hover:text-ink'
                }`}
              >
                <span className="text-[8px] opacity-50">{cat.code}</span>
                {cat.label.toUpperCase()}
                {hasVoted && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-red' : 'bg-red/60'}`} />
                )}
              </button>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div key="loading" className="font-mono text-xs text-muted py-4">&gt; CHECKING STATUS ...</div>
          ) : !votingOpen ? (
            <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="max-w-md border border-ink/10 p-8">
              <div className="font-mono text-[10px] tracking-widest text-muted mb-3">SYSTEM STATUS</div>
              <div className="font-syne font-semibold text-ink text-xl mb-2">Voting has not started yet.</div>
              <div className="font-mono text-xs text-muted/70 leading-relaxed">
                Voting opens after all teams submit their projects. The status badge above updates in real-time.
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {currentVote && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-8 border border-red/20 bg-red/[0.02] p-4 max-w-md">
                  <div className="font-mono text-[9px] tracking-widest text-red mb-1">VOTE REGISTERED</div>
                  <div className="font-syne text-sm text-ink">
                    You voted for: <span className="font-bold">{teams.find((t) => t.id === currentVote)?.name ?? '—'}</span>
                  </div>
                </motion.div>
              )}

              {visibleTeams.length === 0 ? (
                <div className="font-mono text-xs text-muted/60 py-8 border border-ink/10 px-6">
                  // NO {activeCategory === 'gamedev' ? 'GAME DEV' : 'WEB DEV'} TEAMS REGISTERED YET
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleTeams.map((team, i) => (
                    <VoteCard key={team.id} team={team} index={i} voted={currentVote}
                      submitting={submitting} onVote={handleVote} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}