-- ============================================================
-- RUN THIS IN SUPABASE SQL EDITOR TO FIX THE 400 ERROR
-- ============================================================

-- 1. Add 'staff' to the role check constraint
alter table profiles
  drop constraint if exists profiles_role_check;

alter table profiles
  add constraint profiles_role_check
  check (role in ('admin', 'staff', 'user'));

-- 2. Fix the admin update policy (needs WITH CHECK too)
drop policy if exists "Admins update any profile" on profiles;

create policy "Admins update any profile" on profiles
  for update
  using (is_admin())
  with check (is_admin());

-- 3. Add is_staff and is_staff_or_admin functions if not exist
create or replace function is_staff()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'staff'
  );
$$ language sql security definer;

create or replace function is_staff_or_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('admin', 'staff')
  );
$$ language sql security definer;

create or replace function is_user()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'user'
  );
$$ language sql security definer;

-- Let authenticated users restore only their own standard profile row
drop policy if exists "Users create own user profile" on profiles;

create policy "Users create own user profile" on profiles
  for insert
  with check (auth.uid() = id and role = 'user');

-- Allow staff to find users and users to find staff/admins for direct messages
drop policy if exists "Staff view user profiles" on profiles;
create policy "Staff view user profiles" on profiles
  for select
  using (role = 'user' and is_staff_or_admin());

drop policy if exists "Users view staff and admin profiles" on profiles;
create policy "Users view staff and admin profiles" on profiles
  for select
  using (role in ('admin', 'staff') and is_user());
