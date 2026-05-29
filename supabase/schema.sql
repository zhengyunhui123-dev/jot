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

drop policy if exists "anon can manage own accountbook backup rows" on public.accountbook_expenses;

create policy "anon can manage own accountbook backup rows"
on public.accountbook_expenses
for all
to authenticated
using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);

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

with ordered_profiles as (
  select
    user_id,
    row_number() over (order by updated_at asc, user_id asc) as profile_no
  from public.accountbook_profiles
)
update public.accountbook_profiles target
set display_name = 'momo-' || ordered_profiles.profile_no::text
from ordered_profiles
where target.user_id = ordered_profiles.user_id
  and target.display_name ~ '^momo-[0-9]+$';

select setval(
  'public.accountbook_profile_name_seq',
  greatest(
    coalesce((
      select max(substring(display_name from '^momo-([0-9]+)$')::bigint)
      from public.accountbook_profiles
      where display_name ~ '^momo-[0-9]+$'
    ), 0),
    1
  ),
  true
);

create unique index if not exists accountbook_profiles_display_name_key
on public.accountbook_profiles (display_name);

alter table public.accountbook_profiles enable row level security;

drop policy if exists "anon can manage own accountbook profile" on public.accountbook_profiles;

create policy "anon can manage own accountbook profile"
on public.accountbook_profiles
for all
to authenticated
using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);

-- 迁移函数：将旧 ab_xxx 用户数据迁移到当前登录用户的 UUID
-- 用法：select public.migrate_accountbook_user('ab_xxx旧ID');
create or replace function public.migrate_accountbook_user(old_user_id text)
returns void
language plpgsql
security definer
as $$
declare
  new_user_id text;
begin
  new_user_id := auth.uid()::text;
  if old_user_id is null or old_user_id = '' or old_user_id = new_user_id then
    return;
  end if;

  update public.accountbook_expenses
  set user_id = new_user_id, synced_at = now()
  where user_id = old_user_id;

  insert into public.accountbook_profiles (user_id, display_name, updated_at)
  select new_user_id, p.display_name, now()
  from public.accountbook_profiles p
  where p.user_id = old_user_id
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    updated_at = now();

  delete from public.accountbook_profiles where user_id = old_user_id;
end;
$$;
