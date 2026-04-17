'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';

/* ── types ─────────────────────────────────────── */
interface Team {
  id: string;
  name: string;
  project_title: string;
  project_description: string;
  score_override: number | null;
  is_winner: boolean;
  created_at: string;
}
interface Vote {
  id: string;
  voter_id: string;
  team_id: string;
  created_at: string;
  teams?: { name: string };
}
interface Submission {
  id: string;
  team_id: string;
  submission_url: string;
  notes: string;
  submitted_at: string;
  teams?: { name: string };
}

type Tab = 'overview' | 'teams' | 'votes' | 'submissions';

/* ── helpers ────────────────────────────────────── */
function Pill({ on }: { on: boolean }) {
  return (
    <span className={`font-mono text-[9px] tracking-widest border px-2 py-0.5 ${
      on ? 'border-green-700 text-green-700' : 'border-red/60 text-red/70'
    }`}>
      {on ? '● OPEN' : '● CLOSED'}
    </span>
  );
}

/* ── main component ─────────────────────────────── */
export default function AdminPage() {
  const supabase = createClient();

  /* auth */
  const [authed, setAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  /* data */
  const [tab, setTab] = useState<Tab>('overview');
  const [votingOpen, setVotingOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [submissionsOpen, setSubmissionsOpen] = useState(false);
  const [togglingSubmissions, setTogglingSubmissions] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [editScore, setEditScore] = useState<{ id: string; val: string } | null>(null);

  /* ── check session ─────────────────────────── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setAuthLoading(false);
    });
  }, []); // eslint-disable-line

  /* ── load data ──────────────────────────────── */
  const load = useCallback(async () => {
    setDataLoading(true);

    const [{ data: settingData }, { data: subsSettingData }, { data: teamsData }, { data: votesData }, { data: subsData }] =
      await Promise.all([
        supabase.from('settings').select('value').eq('key', 'voting_open').single(),
        supabase.from('settings').select('value').eq('key', 'submissions_open').single(),
        supabase.from('teams').select('*').order('created_at'),
        supabase.from('votes').select('*, teams(name)').order('created_at', { ascending: false }),
        supabase.from('submissions').select('*, teams(name)').order('submitted_at', { ascending: false }),
      ]);

    setVotingOpen(settingData?.value === true || settingData?.value === 'true');
    setSubmissionsOpen(subsSettingData?.value === true || subsSettingData?.value === 'true');
    setTeams(teamsData ?? []);
    setVotes(votesData ?? []);
    setSubmissions(subsData ?? []);
    setDataLoading(false);
  }, []); // eslint-disable-line

  useEffect(() => { if (authed) load(); }, [authed, load]);

  /* ── login ──────────────────────────────────── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPwd,
    });
    if (error) { setLoginError(error.message); setLoggingIn(false); return; }
    setAuthed(true);
    setLoggingIn(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
  };

  /* ── toggle voting ──────────────────────────── */
  const toggleVoting = async () => {
    setToggling(true);
    const next = !votingOpen;
    await supabase.from('settings').update({ value: next }).eq('key', 'voting_open');
    setVotingOpen(next);
    setToggling(false);
  };

  /* ── toggle submissions ───────────────────── */
  const toggleSubmissions = async () => {
    setTogglingSubmissions(true);
    const next = !submissionsOpen;
    await supabase.from('settings').update({ value: next }).eq('key', 'submissions_open');
    setSubmissionsOpen(next);
    setTogglingSubmissions(false);
  };

  /* ── score override ─────────────────────────── */
  const saveScore = async (teamId: string) => {
    if (!editScore) return;
    const val = editScore.val === '' ? null : Number(editScore.val);
    await supabase
      .from('teams')
      .update({ score_override: val })
      .eq('id', teamId);
    setEditScore(null);
    load();
  };

  /* ── winner toggle ──────────────────────────── */
  const toggleWinner = async (team: Team) => {
    await supabase
      .from('teams')
      .update({ is_winner: !team.is_winner })
      .eq('id', team.id);
    load();
  };

  /* ── vote counts ────────────────────────────── */
  const voteCounts: Record<string, number> = {};
  votes.forEach((v) => { voteCounts[v.team_id] = (voteCounts[v.team_id] ?? 0) + 1; });

  const rankedTeams = [...teams]
    .map((t) => ({ ...t, voteCount: voteCounts[t.id] ?? 0, finalScore: t.score_override ?? voteCounts[t.id] ?? 0 }))
    .sort((a, b) => b.finalScore - a.finalScore);

  /* ── render: not authed ─────────────────────── */
  if (authLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-xs text-muted">
        &gt; AUTHENTICATING ...
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-paper grid-overlay flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xs"
        >
          <div className="sys-label mb-1 text-red">ADMIN ACCESS</div>
          <div className="font-syne font-bold text-2xl text-ink mb-8">Secure Login</div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="sys-label block mb-1">EMAIL</label>
              <input
                className="terminal-input"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="sys-label block mb-1">PASSWORD</label>
              <input
                className="terminal-input"
                type="password"
                value={loginPwd}
                onChange={(e) => setLoginPwd(e.target.value)}
                required
              />
            </div>
            {loginError && (
              <div className="font-mono text-[10px] text-red tracking-widest">{loginError}</div>
            )}
            <button
              type="submit"
              disabled={loggingIn}
              className="font-mono text-xs tracking-widest px-5 py-2.5 bg-ink text-paper hover:bg-red transition-colors duration-200 disabled:opacity-50"
            >
              {loggingIn ? 'VERIFYING ...' : 'ENTER SYSTEM →'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  /* ── render: dashboard ──────────────────────── */
  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview',    label: 'OVERVIEW' },
    { id: 'teams',       label: 'TEAMS' },
    { id: 'votes',       label: `VOTES (${votes.length})` },
    { id: 'submissions', label: 'SUBMISSIONS' },
  ];

  return (
    <div className="min-h-screen bg-paper grid-overlay">
      {/* Header */}
      <div className="border-b border-ink/10 px-6 md:px-10 py-4 flex items-center justify-between">
        <div>
          <div className="sys-label text-red">ADMIN DASHBOARD</div>
          <div className="font-syne font-bold text-lg text-ink">Takumi Delhi Control</div>
        </div>
        <div className="flex items-center gap-4">
          <Pill on={votingOpen} />
          <button
            onClick={handleLogout}
            className="font-mono text-[10px] tracking-widest text-muted hover:text-red transition-colors"
          >
            LOG OUT
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-ink/10 px-6 md:px-10 flex gap-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`font-mono text-[10px] tracking-widest py-3 border-b-2 transition-colors ${
              tab === t.id
                ? 'border-red text-red'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={load}
          className="ml-auto font-mono text-[10px] tracking-widest text-muted hover:text-ink transition-colors py-3"
        >
          ↻ REFRESH
        </button>
      </div>

      {/* Content */}
      <div className="px-6 md:px-10 py-8">
        {dataLoading ? (
          <div className="font-mono text-xs text-muted">&gt; LOADING DATA ...</div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-ink/10 max-w-3xl mb-10">
                  {[
                    { label: 'TEAMS', value: teams.length },
                    { label: 'VOTES', value: votes.length },
                    { label: 'SUBMISSIONS', value: submissions.length },
                    { label: 'WINNERS', value: teams.filter((t) => t.is_winner).length },
                  ].map((s) => (
                    <div key={s.label} className="p-5 border-r border-b border-ink/10 last:border-r-0">
                      <div className="sys-label mb-1">{s.label}</div>
                      <div className="font-syne font-bold text-3xl text-ink">{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Voting toggle */}
                <div className="border border-ink/10 p-6 max-w-md mb-8">
                  <div className="sys-label mb-3">VOTING CONTROL</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-syne font-semibold text-ink mb-1">
                        Voting is currently{' '}
                        <span className={votingOpen ? 'text-green-700' : 'text-red'}>
                          {votingOpen ? 'OPEN' : 'CLOSED'}
                        </span>
                      </div>
                      <div className="font-mono text-[10px] text-muted">
                        This updates in real-time across the site.
                      </div>
                    </div>
                    <button
                      onClick={toggleVoting}
                      disabled={toggling}
                      className={`font-mono text-[10px] tracking-widest px-4 py-2 border transition-colors ${
                        votingOpen
                          ? 'border-red text-red hover:bg-red hover:text-paper'
                          : 'border-ink text-ink hover:bg-ink hover:text-paper'
                      } disabled:opacity-50`}
                    >
                      {toggling ? '...' : votingOpen ? 'CLOSE VOTING' : 'OPEN VOTING'}
                    </button>
                  </div>
                </div>

                {/* Submissions toggle */}
                <div className="border border-ink/10 p-6 max-w-md mb-8">
                  <div className="sys-label mb-3">SUBMISSION CONTROL</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-syne font-semibold text-ink mb-1">
                        Submissions are currently{' '}
                        <span className={submissionsOpen ? 'text-green-700' : 'text-red'}>
                          {submissionsOpen ? 'OPEN' : 'CLOSED'}
                        </span>
                      </div>
                      <div className="font-mono text-[10px] text-muted">
                        Teams submit via <a href="/submit" className="text-red hover:underline">/submit</a>
                      </div>
                    </div>
                    <button
                      onClick={toggleSubmissions}
                      disabled={togglingSubmissions}
                      className={`font-mono text-[10px] tracking-widest px-4 py-2 border transition-colors ${
                        submissionsOpen
                          ? 'border-red text-red hover:bg-red hover:text-paper'
                          : 'border-ink text-ink hover:bg-ink hover:text-paper'
                      } disabled:opacity-50`}
                    >
                      {togglingSubmissions ? '...' : submissionsOpen ? 'CLOSE SUBMISSIONS' : 'OPEN SUBMISSIONS'}
                    </button>
                  </div>
                </div>

                {/* Live leaderboard */}
                <div className="sys-label mb-3">LIVE LEADERBOARD</div>
                <div className="border border-ink/10 max-w-3xl overflow-x-auto">
                  <table className="admin-table w-full">
                    <thead>
                      <tr>
                        {['RNK', 'TEAM', 'VOTES', 'OVERRIDE', 'FINAL', 'WINNER'].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rankedTeams.map((t, i) => (
                        <tr key={t.id}>
                          <td className="text-red font-semibold">{String(i + 1).padStart(2, '0')}</td>
                          <td className="font-semibold">{t.name}</td>
                          <td>{t.voteCount}</td>
                          <td>
                            {editScore?.id === t.id ? (
                              <div className="flex gap-1">
                                <input
                                  className="terminal-input w-16 text-xs"
                                  value={editScore.val}
                                  onChange={(e) => setEditScore({ id: t.id, val: e.target.value })}
                                  autoFocus
                                />
                                <button onClick={() => saveScore(t.id)} className="text-red text-[10px]">✓</button>
                                <button onClick={() => setEditScore(null)} className="text-muted text-[10px]">✕</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditScore({ id: t.id, val: String(t.score_override ?? '') })}
                                className="text-muted hover:text-ink transition-colors"
                              >
                                {t.score_override ?? <span className="text-muted/40">—</span>}
                              </button>
                            )}
                          </td>
                          <td className="font-semibold text-ink">{t.finalScore}</td>
                          <td>
                            <button
                              onClick={() => toggleWinner(t)}
                              className={`font-mono text-[9px] tracking-widest border px-2 py-0.5 transition-colors ${
                                t.is_winner
                                  ? 'border-red text-red hover:bg-red/10'
                                  : 'border-ink/20 text-muted hover:border-red hover:text-red'
                              }`}
                            >
                              {t.is_winner ? 'WINNER ✓' : 'MARK'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ── TEAMS ── */}
            {tab === 'teams' && (
              <motion.div key="teams" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="border border-ink/10 overflow-x-auto max-w-5xl">
                  <table className="admin-table w-full">
                    <thead>
                      <tr>
                        {['TEAM NAME', 'PROJECT', 'DESCRIPTION', 'REGISTERED'].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((t) => (
                        <tr key={t.id}>
                          <td className="font-semibold">{t.name}</td>
                          <td>{t.project_title || '—'}</td>
                          <td className="max-w-xs truncate text-muted">{t.project_description || '—'}</td>
                          <td className="text-muted">{new Date(t.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ── VOTES ── */}
            {tab === 'votes' && (
              <motion.div key="votes" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="border border-ink/10 overflow-x-auto max-w-3xl">
                  <table className="admin-table w-full">
                    <thead>
                      <tr>
                        {['VOTER ID', 'VOTED FOR', 'TIMESTAMP'].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {votes.map((v) => (
                        <tr key={v.id}>
                          <td className="text-muted font-mono text-[10px]">{v.voter_id.slice(0, 16)}...</td>
                          <td className="font-semibold">{v.teams?.name ?? v.team_id}</td>
                          <td className="text-muted">{new Date(v.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ── SUBMISSIONS ── */}
            {tab === 'submissions' && (
              <motion.div key="submissions" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="border border-ink/10 overflow-x-auto max-w-4xl">
                  <table className="admin-table w-full">
                    <thead>
                      <tr>
                        {['TEAM', 'SUBMISSION URL', 'NOTES', 'SUBMITTED AT'].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((s) => (
                        <tr key={s.id}>
                          <td className="font-semibold">{s.teams?.name ?? s.team_id}</td>
                          <td>
                            <a
                              href={s.submission_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red hover:underline font-mono text-[10px]"
                            >
                              {s.submission_url}
                            </a>
                          </td>
                          <td className="text-muted max-w-xs truncate">{s.notes || '—'}</td>
                          <td className="text-muted">{new Date(s.submitted_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
