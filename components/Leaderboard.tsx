'use client';
import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface LeaderboardEntry {
  rank: number;
  team_name: string;
  project_title: string;
  vote_count: number;
  score_override: number | null;
  final_score: number;
  is_winner: boolean;
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const supabase = createClient();

  const fetchLeaderboard = async () => {
    const { data: teams } = await supabase
      .from('teams').select('id, name, project_title, score_override, is_winner');
    const { data: votes } = await supabase.from('votes').select('team_id');
    if (!teams) return;

    const voteCounts: Record<string, number> = {};
    (votes ?? []).forEach((v) => { voteCounts[v.team_id] = (voteCounts[v.team_id] ?? 0) + 1; });

    const ranked = teams
      .map((t) => ({
        rank: 0,
        team_name: t.name,
        project_title: t.project_title ?? '—',
        vote_count: voteCounts[t.id] ?? 0,
        score_override: t.score_override,
        final_score: t.score_override ?? voteCounts[t.id] ?? 0,
        is_winner: t.is_winner ?? false,
      }))
      .sort((a, b) => b.final_score - a.final_score)
      .map((t, i) => ({ ...t, rank: i + 1 }));

    setData(ranked);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
    const channel = supabase.channel('leaderboard-votes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, fetchLeaderboard)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, fetchLeaderboard)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []); // eslint-disable-line

  return (
    <section id="leaderboard" ref={ref} className="relative border-t border-ink/10">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="sys-label mb-12 flex items-center gap-3"
        >
          <span className="text-red">§05</span>
          <span className="h-px flex-1 max-w-[40px] bg-ink/20" />
          LEADERBOARD // LIVE RANKING
          <span className="ml-auto w-2 h-2 rounded-full bg-red" style={{ animation: 'blink 2s step-start infinite' }} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}>
          {loading ? (
            <div className="font-mono text-xs text-muted py-8">
              &gt; FETCHING RANKINGS ...
              <span className="inline-block w-2 h-3 bg-muted/40 ml-1" style={{ animation: 'blink 1s step-start infinite' }} />
            </div>
          ) : data.length === 0 ? (
            <div className="font-mono text-xs text-muted/60 py-8 border border-ink/10 px-6">
              // NO TEAMS REGISTERED YET — CHECK BACK AFTER SUBMISSIONS OPEN
            </div>
          ) : (
            <div className="border border-ink/10 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink/10 bg-ink/[0.02]">
                    {['RNK', 'TEAM', 'PROJECT', 'VOTES', 'SCORE', 'STATUS'].map((h) => (
                      <th key={h} className="font-mono text-[9px] tracking-widest text-muted px-4 py-3 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <motion.tr key={row.team_name}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.4 }}
                      className={`border-b border-ink/8 last:border-b-0 hover:bg-ink/[0.02] transition-colors ${row.rank === 1 ? 'bg-red/[0.03]' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <span className={`font-mono text-sm font-semibold ${row.rank <= 3 ? 'text-red' : 'text-muted'}`}>
                          {String(row.rank).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-syne text-sm font-semibold text-ink">{row.team_name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">{row.project_title}</td>
                      <td className="px-4 py-3 font-mono text-xs text-ink">{row.vote_count}</td>
                      <td className="px-4 py-3 font-mono text-sm font-semibold text-ink">{row.final_score}</td>
                      <td className="px-4 py-3">
                        {row.is_winner ? (
                          <span className="font-mono text-[9px] tracking-widest text-red border border-red px-2 py-0.5">WINNER</span>
                        ) : (
                          <span className="font-mono text-[9px] text-muted/40">—</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-3 font-mono text-[10px] text-muted/40 tracking-widest">
            // RANKINGS UPDATE IN REAL-TIME // VOTE COUNT + JUDGE OVERRIDE
          </div>
        </motion.div>
      </div>
    </section>
  );
}
