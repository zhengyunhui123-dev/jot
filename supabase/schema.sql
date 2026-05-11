create table if not exists public.accountbook_expenses (
  user_id text not null,
  local_id bigint not null,
  date date not null,
  category text not null,
  amount numeric(12, 2) not null default 0,
  payment_method text not null default '',
  expected_amount numeric(12, 2),
  saving_amount numeric(12, 2) not null default 0,
  saving_reason text not null default '',
  note text not null default '',
  created_at bigint not null,
  payload jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now(),
  primary key (user_id, local_id)
);

alter table public.accountbook_expenses enable row level security;

create or replace function public.accountbook_request_user_id()
returns text
language sql
stable
as $$
  select nullif(current_setting('request.headers', true)::json ->> 'x-accountbook-user-id', '')
$$;

drop policy if exists "anon can manage own accountbook backup rows" on public.accountbook_expenses;

create policy "anon can manage own accountbook backup rows"
on public.accountbook_expenses
for all
to anon
using (user_id = public.accountbook_request_user_id())
with check (user_id = public.accountbook_request_user_id());

create index if not exists accountbook_expenses_user_id_created_at_idx
on public.accountbook_expenses (user_id, created_at);

create sequence if not exists public.accountbook_profile_name_seq start with 1 increment by 1;

create table if not exists public.accountbook_profiles (
  user_id text primary key,
  display_name text not null default ('momo-' || nextval('public.accountbook_profile_name_seq')::text),
  updated_at timestamptz not null default now()
);

alter table public.accountbook_profiles
alter column display_name set default ('momo-' || nextval('public.accountbook_profile_name_seq')::text);

alter table public.accountbook_profiles enable row level security;

drop policy if exists "anon can manage own accountbook profile" on public.accountbook_profiles;

create policy "anon can manage own accountbook profile"
on public.accountbook_profiles
for all
to anon
using (user_id = public.accountbook_request_user_id())
with check (user_id = public.accountbook_request_user_id());
