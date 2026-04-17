-- ═══════════════════════════════════════════════════════
--  TAKUMI DELHI — SUPABASE SCHEMA v2
--  Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════

-- ── 1. SETTINGS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL
);
INSERT INTO public.settings (key, value) VALUES
  ('voting_open',      'false'::jsonb),
  ('submissions_open', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ── 2. TEAMS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.teams (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT        NOT NULL UNIQUE,
  members             JSONB       DEFAULT '[]'::jsonb,
  project_title       TEXT,
  project_description TEXT,
  score_override      INTEGER,
  is_winner           BOOLEAN     DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ── 3. SUBMISSIONS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.submissions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         UUID        NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  submission_url  TEXT        NOT NULL,
  demo_video_url  TEXT,
  notes           TEXT,
  submitted_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id)
);

-- ── 4. VOTES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.votes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id    TEXT        NOT NULL,
  team_id     UUID        NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(voter_id)
);

-- ── 5. CONTACT MESSAGES ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── RLS ──────────────────────────────────────────────────
ALTER TABLE public.settings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_public_read"      ON public.settings    FOR SELECT USING (true);
CREATE POLICY "settings_admin_write"      ON public.settings    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "teams_public_read"         ON public.teams       FOR SELECT USING (true);
CREATE POLICY "teams_public_insert"       ON public.teams       FOR INSERT WITH CHECK (true);
CREATE POLICY "teams_public_update"       ON public.teams       FOR UPDATE USING (true);
CREATE POLICY "teams_admin_all"           ON public.teams       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "submissions_public_read"   ON public.submissions FOR SELECT USING (true);
CREATE POLICY "submissions_public_insert" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "submissions_public_update" ON public.submissions FOR UPDATE USING (true);
CREATE POLICY "submissions_admin_all"     ON public.submissions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "votes_public_read"         ON public.votes       FOR SELECT USING (true);
CREATE POLICY "votes_public_insert"       ON public.votes       FOR INSERT WITH CHECK (true);
CREATE POLICY "votes_admin_all"           ON public.votes       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "contact_public_insert"     ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_admin_read"        ON public.contact_messages FOR SELECT USING (auth.role() = 'authenticated');

-- Enable Realtime for: votes, settings, teams, submissions
-- Supabase Dashboard → Database → Replication → enable those 4 tables
