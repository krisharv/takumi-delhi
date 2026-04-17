# TAKUMI DELHI — Setup Guide

```
匠  Craft. Code. Create.
Game Dev Hackathon — Satellite Event — May 2–3
DBSE Office, IP Extension, Delhi
```

---

## Tech Stack

| Layer     | Tool                           |
|-----------|--------------------------------|
| Framework | Next.js 14 (App Router)        |
| Styling   | Tailwind CSS                   |
| Animation | Framer Motion                  |
| Backend   | Supabase (Postgres + Realtime) |
| Fonts     | Syne + JetBrains Mono          |
| Deploy    | Vercel                         |

---

## Quick Start

```bash
cd takumi-delhi
npm install
cp .env.local.example .env.local
# Fill in Supabase keys, then:
npm run dev
```

- Main site: http://localhost:3000  
- Team portal: http://localhost:3000/submit  
- Admin panel: http://localhost:3000/admin

---

## How Registration & Submission Works

### Overview

There are two separate admin toggles controlling the hackathon flow:

```
settings table:
  voting_open       → boolean  (controls /voting section)
  submissions_open  → boolean  (controls /submit page)
```

### Complete Flow

```
Phase 1 — REGISTRATION (always open)
  Teams → /submit → Register team name + 3 members
  Team ID saved to localStorage (tkm_team_id)

Phase 2 — SUBMISSIONS OPEN (admin toggles ON at hackathon)
  Admin → /admin → Overview → "OPEN SUBMISSIONS"
  Teams → /submit → See project submission form
  Teams fill: project title, description, submission URL,
              optional demo video URL, notes for judges
  Teams can resubmit — latest overwrites previous
  Submission stored in submissions table

Phase 3 — SUBMISSIONS CLOSE (admin toggles OFF before judging)
  Admin → /admin → Overview → "CLOSE SUBMISSIONS"
  /submit page shows "registered, waiting" state again
  Judges review submitted projects

Phase 4 — VOTING OPEN (admin toggles ON after demos)
  Admin → /admin → Overview → "OPEN VOTING"
  Voting section on main site activates in real-time
  Each participant gets a UUID voter_id in localStorage
  Voter selects a team → confirmation modal → CONFIRM
  Vote is stored; UNIQUE(voter_id) prevents double voting

Phase 5 — VOTING CLOSES + RESULTS
  Admin → /admin → Overview → "CLOSE VOTING"
  Admin can override scores and mark winners
  Leaderboard shows final = judge_score ?? vote_count
```

### Key Rules

| Rule | Enforcement |
|------|-------------|
| One vote per participant | `UNIQUE(voter_id)` in Postgres |
| One submission per team | `UNIQUE(team_id)` in submissions table (upsert) |
| Cannot vote when closed | Frontend check + settings table flag |
| Cannot submit when closed | Frontend check + settings flag (real-time) |
| Teams can resubmit | Supabase `upsert` with `onConflict: 'team_id'` |

### Team Identity

Teams are identified by a UUID stored in `localStorage` (key: `tkm_team_id`).
If a team clears their browser, they can recover access on the `/submit` page using
the "Already Registered? Retrieve your team" flow — by entering their exact team name.

---

## Supabase Setup

### 1. Create Project

supabase.com → New Project → Singapore region (closest to India)

### 2. Run Schema

Supabase Dashboard → SQL Editor → New Query → paste `supabase/schema.sql` → Run

### 3. Enable Realtime

Database → Replication → enable for: `votes`, `settings`, `teams`, `submissions`

### 4. Create Admin User

Authentication → Users → Add User → your email + strong password

### 5. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Deploy to Vercel

```bash
git init && git add . && git commit -m "init: takumi delhi"
# Push to GitHub, then import in Vercel
# Add env vars: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Customisation Checklist

| File | What to change |
|------|----------------|
| `components/Organizers.tsx` | Replace 5 placeholder slots with real names, roles, photos |
| `components/Schedule.tsx` | Update confirmed timings |
| `components/EventDetails.tsx` | Update venue if needed |
| `components/Contact.tsx` | Email + social handle |
| `components/Footer.tsx` | Same |
| `components/Hero.tsx` | Email signup — connect to mailing list or Supabase |

---

## Admin Dashboard Usage

| Action | Location |
|--------|----------|
| Open / Close Submissions | Overview tab → Submission Control |
| Open / Close Voting | Overview tab → Voting Control |
| Override team score | Overview → Leaderboard → click score cell |
| Mark winners | Overview → Leaderboard → MARK button |
| View all votes | Votes tab |
| View all submissions | Submissions tab |
| View registered teams | Teams tab |

---

## Project Structure

```
takumi-delhi/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx              ← Main site
│   ├── submit/
│   │   ├── layout.tsx
│   │   └── page.tsx          ← Team registration + submission portal
│   └── admin/
│       ├── layout.tsx
│       └── page.tsx          ← Admin dashboard
├── components/
│   ├── CustomCursor.tsx      ← Small red circle cursor, no glow
│   ├── LoadingScreen.tsx
│   ├── SystemOverlay.tsx
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── EventDetails.tsx
│   ├── Schedule.tsx
│   ├── Organizers.tsx        ← 5 organizer slots
│   ├── Leaderboard.tsx
│   ├── Voting.tsx            ← Confirm modal, shows project details
│   ├── FAQ.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── lib/
│   ├── supabase.ts
│   └── supabase-server.ts
├── supabase/
│   └── schema.sql
└── .env.local.example
```

---

*Built for Takumi Delhi · Hack Club Satellite · 2025*
