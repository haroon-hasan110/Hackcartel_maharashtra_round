create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content_type text not null default 'podcast',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source_video jsonb not null default '{}',
  script_text text default '',
  analysis jsonb default null,
  generated_clips_count integer not null default 0,
  total_assets_count integer not null default 0,
  thumbnail_url text default ''
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  asset_type text not null default 'video',
  filename text not null,
  format text not null default 'mp4',
  size text not null default '0 MB',
  created_at timestamptz not null default now(),
  metadata jsonb default '{}'
);

alter table public.projects enable row level security;
alter table public.assets enable row level security;

create policy "Allow public read access for projects" on public.projects for select using (true);
create policy "Allow public insert access for projects" on public.projects for insert with check (true);
create policy "Allow public update access for projects" on public.projects for update using (true) with check (true);

create policy "Allow public read access for assets" on public.assets for select using (true);
create policy "Allow public insert access for assets" on public.assets for insert with check (true);
create policy "Allow public update access for assets" on public.assets for update using (true) with check (true);
