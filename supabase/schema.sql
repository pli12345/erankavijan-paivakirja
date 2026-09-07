-- Metsästäjän päiväkirja — Supabase-skeema
-- Aja tämä Supabase-projektin SQL Editorissa (Dashboard → SQL Editor → New query).

/* ---------- profiles ---------- */

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  hunting_club text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Uudelle käyttäjälle luodaan profiili automaattisesti
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

/* ---------- trips (reissut) ---------- */

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text,
  area text,
  started_at timestamptz not null,
  ended_at timestamptz,
  latitude double precision,
  longitude double precision,
  weather_temp double precision,
  weather_code int,
  wind_speed double precision,
  companions text[],
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists trips_user_started_idx on public.trips (user_id, started_at desc);

alter table public.trips enable row level security;

create policy "trips_own" on public.trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

/* ---------- catches (saaliit) ---------- */

create table if not exists public.catches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  trip_id uuid references public.trips on delete set null,
  species text not null,
  sex text,
  age_class text,
  weight_kg numeric,
  antler_points int,
  shot_at timestamptz not null,
  latitude double precision,
  longitude double precision,
  photo_url text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists catches_user_shot_idx on public.catches (user_id, shot_at desc);
create index if not exists catches_trip_idx on public.catches (trip_id);

alter table public.catches enable row level security;

create policy "catches_own" on public.catches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

/* ---------- observations (havainnot) ---------- */

create table if not exists public.observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  trip_id uuid references public.trips on delete set null,
  species text not null,
  count int not null default 1,
  seen_at timestamptz not null,
  latitude double precision,
  longitude double precision,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists observations_user_seen_idx on public.observations (user_id, seen_at desc);
create index if not exists observations_trip_idx on public.observations (trip_id);

alter table public.observations enable row level security;

create policy "observations_own" on public.observations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

/* ---------- storage: saaliskuvat ---------- */

insert into storage.buckets (id, name, public)
values ('catch-photos', 'catch-photos', true)
on conflict (id) do nothing;

create policy "catch_photos_read" on storage.objects
  for select using (bucket_id = 'catch-photos');

create policy "catch_photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'catch-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "catch_photos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'catch-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
