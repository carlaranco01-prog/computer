create table if not exists return_requests (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references computer_assignments(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'Pending' check (status in ('Pending', 'Completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (assignment_id, status)
);

alter table return_requests enable row level security;

create policy "Users view own return requests" on return_requests for select
  using (auth.uid() = user_id);
create policy "Staff view all return requests" on return_requests for select
  using (is_staff_or_admin());
create policy "Users request return for own active assignments" on return_requests for insert
  with check (
    auth.uid() = user_id
    and status = 'Pending'
    and exists (
      select 1 from computer_assignments
      where id = assignment_id and user_id = auth.uid() and status = 'Active'
    )
  );
create policy "Staff complete return requests" on return_requests for update
  using (is_staff_or_admin())
  with check (is_staff_or_admin());
