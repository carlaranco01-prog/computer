-- ============================================================
-- COMPUTER MANAGEMENT SYSTEM — SUPABASE SQL SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- 1. PROFILES TABLE
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz default now()
);

-- 2. COMPUTERS TABLE
create table if not exists computers (
  id uuid primary key default gen_random_uuid(),
  computer_code text not null unique,
  computer_name text not null,
  brand text not null,
  model text not null,
  serial_number text not null unique,
  processor text,
  ram text,
  storage text,
  operating_system text,
  location text,
  status text not null default 'Available'
    check (status in ('Available','Assigned','Under Maintenance','Damaged','Retired')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. COMPUTER ASSIGNMENTS TABLE
create table if not exists computer_assignments (
  id uuid primary key default gen_random_uuid(),
  computer_id uuid not null references computers(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  assigned_date date not null default current_date,
  returned_date date,
  status text not null default 'Active' check (status in ('Active','Returned')),
  remarks text,
  created_at timestamptz default now()
);

-- 4. MAINTENANCE TABLE
create table if not exists maintenance (
  id uuid primary key default gen_random_uuid(),
  computer_id uuid not null references computers(id) on delete cascade,
  issue text not null,
  description text,
  maintenance_date date not null default current_date,
  status text not null default 'Pending'
    check (status in ('Pending','In Progress','Completed')),
  remarks text,
  created_at timestamptz default now()
);

-- 5. MESSAGES TABLE
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  message text not null,
  status text not null default 'unread' check (status in ('unread','read')),
  created_at timestamptz default now()
);

-- 6. ACTIVITY LOGS TABLE
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  action text not null,
  description text,
  created_at timestamptz default now()
);

-- ============================================================
-- AUTO-UPDATE updated_at ON COMPUTERS
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists computers_updated_at on computers;
create trigger computers_updated_at
  before update on computers
  for each row execute function update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table computers enable row level security;
alter table computer_assignments enable row level security;
alter table maintenance enable row level security;
alter table messages enable row level security;
alter table activity_logs enable row level security;

create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- PROFILES policies
create policy "Users view own profile" on profiles for select using (auth.uid() = id);
create policy "Admins view all profiles" on profiles for select using (is_admin());
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins update any profile" on profiles for update using (is_admin());

-- COMPUTERS policies
create policy "Authenticated view computers" on computers for select using (auth.role() = 'authenticated');
create policy "Admins insert computers" on computers for insert with check (is_admin());
create policy "Admins update computers" on computers for update using (is_admin());
create policy "Admins delete computers" on computers for delete using (is_admin());

-- COMPUTER ASSIGNMENTS policies
create policy "Users view own assignments" on computer_assignments for select using (auth.uid() = user_id);
create policy "Admins view all assignments" on computer_assignments for select using (is_admin());
create policy "Admins insert assignments" on computer_assignments for insert with check (is_admin());
create policy "Admins update assignments" on computer_assignments for update using (is_admin());
create policy "Admins delete assignments" on computer_assignments for delete using (is_admin());

-- MAINTENANCE policies
create policy "Authenticated view maintenance" on maintenance for select using (auth.role() = 'authenticated');
create policy "Admins insert maintenance" on maintenance for insert with check (is_admin());
create policy "Admins update maintenance" on maintenance for update using (is_admin());
create policy "Admins delete maintenance" on maintenance for delete using (is_admin());

-- MESSAGES policies
create policy "Users view own messages" on messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Authenticated send messages" on messages for insert with check (auth.uid() = sender_id);
create policy "Receiver mark read" on messages for update using (auth.uid() = receiver_id);

-- ACTIVITY LOGS policies
create policy "Users view own logs" on activity_logs for select using (auth.uid() = user_id);
create policy "Admins view all logs" on activity_logs for select using (is_admin());
create policy "Users insert own logs" on activity_logs for insert with check (auth.uid() = user_id);

-- ============================================================
-- SAMPLE DATA
-- ============================================================
insert into computers (computer_code, computer_name, brand, model, serial_number, processor, ram, storage, operating_system, location, status) values
  ('PC-001', 'Lab Computer 1', 'Dell', 'OptiPlex 7090', 'SN-DELL-001', 'Intel Core i7-10700', '16GB DDR4', '512GB SSD', 'Windows 11 Pro', 'Lab Room 101', 'Available'),
  ('PC-002', 'Lab Computer 2', 'HP', 'EliteDesk 800', 'SN-HP-002', 'Intel Core i5-10500', '8GB DDR4', '256GB SSD', 'Windows 10 Pro', 'Lab Room 101', 'Available'),
  ('PC-003', 'Office PC 1', 'Lenovo', 'ThinkCentre M90', 'SN-LEN-003', 'Intel Core i7-11700', '32GB DDR4', '1TB SSD', 'Windows 11 Pro', 'Admin Office', 'Available'),
  ('PC-004', 'Lab Computer 3', 'Acer', 'Veriton X4', 'SN-ACR-004', 'Intel Core i5-11400', '8GB DDR4', '512GB HDD', 'Windows 10 Pro', 'Lab Room 102', 'Under Maintenance'),
  ('PC-005', 'Library PC 1', 'Dell', 'Inspiron 3891', 'SN-DELL-005', 'Intel Core i3-10100', '4GB DDR4', '256GB HDD', 'Windows 10 Home', 'Library', 'Available');
