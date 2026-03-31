-- ─── ESFITNESS DATABASE SCHEMA ───────────────────────────────────────
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run

-- CLIENTS TABLE
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  goal text,
  email text,
  phone text,
  joined_at timestamptz default now(),
  active boolean default true
);

-- CHECK-INS TABLE
create table if not exists checkins (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade,
  week_label text not null,           -- e.g. "2024-W14"
  submitted_at timestamptz default now(),

  -- Body stats
  weight numeric,
  waist numeric,
  arms numeric,
  chest numeric,

  -- Compliance
  workout_compliance integer,         -- 0–100
  diet_adherence integer,             -- 0–100

  -- Recovery
  sleep_quality integer,              -- 1–10
  energy_level integer,               -- 1–10
  mood integer,                       -- 1–10

  -- Text
  client_notes text,
  ai_feedback text,
  coach_note text default '',

  -- Photos stored as base64 JSON array
  photos jsonb default '[]',

  unique(client_id, week_label)
);

-- Enable Row Level Security (open for now — add auth later if needed)
alter table clients enable row level security;
alter table checkins enable row level security;

-- Allow all operations for anon key (fine for a private coaching app)
create policy "allow_all_clients" on clients for all using (true) with check (true);
create policy "allow_all_checkins" on checkins for all using (true) with check (true);

-- Index for fast weekly queries
create index if not exists checkins_week_idx on checkins(week_label);
create index if not exists checkins_client_idx on checkins(client_id);
