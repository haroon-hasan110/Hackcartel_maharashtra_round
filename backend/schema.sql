-- Run this in the Supabase SQL editor before starting the API.
-- Existing PRD tables gain clip_id/body; generated_asset_id is optional because
-- this endpoint is keyed directly by clip_id.
create table if not exists public.platform_adaptations (
    id uuid primary key default gen_random_uuid(),
    clip_id text not null,
    platform text not null,
    hook text not null,
    body text not null,
    created_at timestamptz not null default now()
);

-- Add endpoint fields when migrating an existing PRD-era table.
alter table public.platform_adaptations
    add column if not exists clip_id text,
    add column if not exists body text;

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
    and table_name = 'platform_adaptations'
    and column_name = 'generated_asset_id'
    ) then
        alter table public.platform_adaptations
            alter column generated_asset_id drop not null;
    end if;
end $$;
