-- Pavan's World — database schema for Supabase
-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.

-- ============ TABLES ============
create table if not exists profiles (
  id text primary key,                       -- = auth user id
  phone text not null,
  name text default '',
  area text,
  role text not null default 'member' check (role in ('member','admin')),
  created_at timestamptz default now()
);

create table if not exists shops (
  id text primary key default gen_random_uuid()::text,
  name text not null, category text not null, area text, address text,
  phone text, whatsapp text, distance_km numeric default 0, maps_url text,
  about text, emoji text default '🏪', active boolean default true,
  created_at timestamptz default now()
);

create table if not exists deals (
  id text primary key default gen_random_uuid()::text,
  shop_id text references shops(id) on delete set null,
  shop_name text not null, shop_phone text, area text,
  title text not null, description text, discount_label text not null, code text,
  category text not null, valid_till date not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  submitted_by text, created_at timestamptz default now()
);

create table if not exists helpers (
  id text primary key default gen_random_uuid()::text,
  name text not null, category text not null, phone text not null, whatsapp text, area text,
  experience_years int, rate_note text, verified boolean default false, languages text, about text,
  active boolean default true, created_at timestamptz default now()
);

create table if not exists reviews (
  id text primary key default gen_random_uuid()::text,
  helper_id text references helpers(id) on delete cascade,
  user_id text not null, user_name text, rating int check (rating between 1 and 5), comment text,
  created_at timestamptz default now()
);

create table if not exists ideas (
  id text primary key default gen_random_uuid()::text,
  kind text not null check (kind in ('startup','franchise','content')),
  title text not null, category text, summary text,
  budget_min int, budget_max int, space text, monthly_earning text, difficulty text,
  steps text[], tags text[], created_at timestamptz default now()
);

create table if not exists interests (
  id text primary key default gen_random_uuid()::text,
  idea_id text references ideas(id) on delete cascade, idea_title text,
  user_id text not null, user_name text, phone text, note text, created_at timestamptz default now()
);

create table if not exists collab_posts (
  id text primary key default gen_random_uuid()::text,
  user_id text not null, user_name text, type text check (type in ('looking','offering')),
  title text not null, body text, skills text, contact text,
  status text default 'open' check (status in ('open','closed')), created_at timestamptz default now()
);

create table if not exists fitness_profiles (
  id text primary key,                       -- = user id
  name text, phone text, goal text, level text, minutes int, conditions text[] default '{}',
  age int, weight_start numeric, preferred_time text,
  coaching text default 'free' check (coaching in ('free','requested','active')),
  created_at timestamptz default now()
);

create table if not exists checkins (
  id text primary key default gen_random_uuid()::text,
  user_id text not null, date date not null, completed text[] default '{}',
  mood int, energy int, sleep_hours numeric, weight numeric, note text,
  created_at timestamptz default now(),
  unique (user_id, date)
);

create table if not exists leads (
  id text primary key default gen_random_uuid()::text,
  user_id text, name text, phone text, kind text, message text,
  status text default 'new' check (status in ('new','contacted','done')), created_at timestamptz default now()
);

-- ============ HELPERS ============
create or replace function is_admin() returns boolean language sql stable security definer as $$
  select exists (select 1 from profiles where id = auth.uid()::text and role = 'admin');
$$;

-- Members cannot make themselves admin
create or replace function protect_role() returns trigger language plpgsql as $$
begin
  -- auth.uid() is null in the Supabase SQL editor, so the owner can always change roles there
  if new.role is distinct from old.role and auth.uid() is not null and not is_admin() then new.role := old.role; end if;
  return new;
end $$;
drop trigger if exists trg_protect_role on profiles;
create trigger trg_protect_role before update on profiles for each row execute function protect_role();

-- ============ ROW LEVEL SECURITY ============
alter table profiles enable row level security;
alter table shops enable row level security;
alter table deals enable row level security;
alter table helpers enable row level security;
alter table reviews enable row level security;
alter table ideas enable row level security;
alter table interests enable row level security;
alter table collab_posts enable row level security;
alter table fitness_profiles enable row level security;
alter table checkins enable row level security;
alter table leads enable row level security;

-- profiles
create policy "own or admin read" on profiles for select using (id = auth.uid()::text or is_admin());
create policy "create own" on profiles for insert with check (id = auth.uid()::text and role = 'member');
create policy "update own or admin" on profiles for update using (id = auth.uid()::text or is_admin());

-- public listings (anyone can read; only admin changes)
create policy "read shops" on shops for select using (active or is_admin());
create policy "admin shops" on shops for all using (is_admin()) with check (is_admin());
create policy "read helpers" on helpers for select using (active or is_admin());
create policy "admin helpers" on helpers for all using (is_admin()) with check (is_admin());
create policy "read ideas" on ideas for select using (true);
create policy "admin ideas" on ideas for all using (is_admin()) with check (is_admin());

-- deals: public sees approved; logged-in vendors can submit (pending); admin approves
create policy "read deals" on deals for select using (status = 'approved' or is_admin() or submitted_by = auth.uid()::text);
create policy "submit deal" on deals for insert with check (auth.uid() is not null and (status = 'pending' or is_admin()));
create policy "admin deals" on deals for update using (is_admin());
create policy "admin delete deals" on deals for delete using (is_admin());

-- reviews
create policy "read reviews" on reviews for select using (true);
create policy "write own review" on reviews for insert with check (user_id = auth.uid()::text);
create policy "admin delete review" on reviews for delete using (is_admin() or user_id = auth.uid()::text);

-- interests & leads (private: owner + admin)
create policy "own interests" on interests for select using (user_id = auth.uid()::text or is_admin());
create policy "add interest" on interests for insert with check (user_id = auth.uid()::text);
create policy "admin interests" on interests for delete using (is_admin());
create policy "own leads" on leads for select using (user_id = auth.uid()::text or is_admin());
create policy "add lead" on leads for insert with check (user_id = auth.uid()::text);
create policy "admin leads" on leads for update using (is_admin());
create policy "admin delete leads" on leads for delete using (is_admin());

-- collab board
create policy "read collab" on collab_posts for select using (true);
create policy "add collab" on collab_posts for insert with check (user_id = auth.uid()::text or is_admin());
create policy "edit own collab" on collab_posts for update using (user_id = auth.uid()::text or is_admin());
create policy "delete own collab" on collab_posts for delete using (user_id = auth.uid()::text or is_admin());

-- fitness (private: owner + coach/admin)
create policy "own fitness" on fitness_profiles for all using (id = auth.uid()::text or is_admin()) with check (id = auth.uid()::text or is_admin());
create policy "own checkins" on checkins for all using (user_id = auth.uid()::text or is_admin()) with check (user_id = auth.uid()::text);

-- ============ MAKE YOURSELF ADMIN ============
-- After you log in to the app once with your phone number, run:
--   update profiles set role = 'admin' where phone = '98XXXXXXXX';
