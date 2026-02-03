-- Create KPI ownership table
create table if not exists public.kpi_ownership (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  signal_id uuid references public.signals(id) on delete cascade not null,
  is_primary boolean default false,
  created_at timestamp with time zone default now(),
  unique(user_id, signal_id)
);

-- Create decisions table
create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  owner_id uuid references auth.users(id) not null,
  status text check (status in ('upcoming', 'decided', 'implemented')) default 'upcoming',
  context text,
  target_date date,
  created_at timestamp with time zone default now(),
  decided_at timestamp with time zone,
  implemented_at timestamp with time zone,
  created_by uuid references auth.users(id)
);

-- Create decision_signals mapping table
create table if not exists public.decision_signals (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid references public.decisions(id) on delete cascade not null,
  signal_id uuid references public.signals(id) on delete cascade not null,
  snapshot_value numeric,
  snapshot_benchmark numeric,
  snapshot_date date,
  created_at timestamp with time zone default now(),
  unique(decision_id, signal_id)
);

-- Enable RLS
alter table public.kpi_ownership enable row level security;
alter table public.decisions enable row level security;
alter table public.decision_signals enable row level security;

-- RLS Policies for kpi_ownership
create policy "kpi_ownership_select_all"
  on public.kpi_ownership for select
  using (true);

create policy "kpi_ownership_insert_own"
  on public.kpi_ownership for insert
  with check (auth.uid() = user_id);

create policy "kpi_ownership_update_own"
  on public.kpi_ownership for update
  using (auth.uid() = user_id);

create policy "kpi_ownership_delete_own"
  on public.kpi_ownership for delete
  using (auth.uid() = user_id);

-- RLS Policies for decisions
create policy "decisions_select_all"
  on public.decisions for select
  using (true);

create policy "decisions_insert_own"
  on public.decisions for insert
  with check (auth.uid() = owner_id);

create policy "decisions_update_own"
  on public.decisions for update
  using (auth.uid() = owner_id);

create policy "decisions_delete_own"
  on public.decisions for delete
  using (auth.uid() = owner_id);

-- RLS Policies for decision_signals
create policy "decision_signals_select_all"
  on public.decision_signals for select
  using (true);

create policy "decision_signals_insert_authenticated"
  on public.decision_signals for insert
  with check (auth.uid() is not null);

create policy "decision_signals_update_authenticated"
  on public.decision_signals for update
  using (auth.uid() is not null);

create policy "decision_signals_delete_authenticated"
  on public.decision_signals for delete
  using (auth.uid() is not null);

-- Create indexes
create index idx_kpi_ownership_user on public.kpi_ownership(user_id);
create index idx_kpi_ownership_signal on public.kpi_ownership(signal_id);
create index idx_decisions_owner on public.decisions(owner_id);
create index idx_decisions_status on public.decisions(status);
create index idx_decision_signals_decision on public.decision_signals(decision_id);
create index idx_decision_signals_signal on public.decision_signals(signal_id);
