-- Create signals table
create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  owner_id uuid references auth.users(id),
  benchmark_value numeric,
  benchmark_type text,
  trend text check (trend in ('increasing', 'decreasing', 'stable')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id),
  unique(name)
);

-- Create data_points table for historical signal values
create table if not exists public.data_points (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid references public.signals(id) on delete cascade not null,
  value numeric not null,
  date date not null,
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users(id),
  unique(signal_id, date)
);

-- Create upload_history table
create table if not exists public.upload_history (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  uploaded_by uuid references auth.users(id) not null,
  signals_created integer default 0,
  signals_updated integer default 0,
  data_points_added integer default 0,
  status text check (status in ('success', 'partial', 'failed')) default 'success',
  errors text[],
  warnings text[],
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.signals enable row level security;
alter table public.data_points enable row level security;
alter table public.upload_history enable row level security;

-- RLS Policies for signals
create policy "signals_select_all"
  on public.signals for select
  using (true);

create policy "signals_insert_authenticated"
  on public.signals for insert
  with check (auth.uid() is not null);

create policy "signals_update_authenticated"
  on public.signals for update
  using (auth.uid() is not null);

create policy "signals_delete_authenticated"
  on public.signals for delete
  using (auth.uid() is not null);

-- RLS Policies for data_points
create policy "data_points_select_all"
  on public.data_points for select
  using (true);

create policy "data_points_insert_authenticated"
  on public.data_points for insert
  with check (auth.uid() is not null);

create policy "data_points_update_authenticated"
  on public.data_points for update
  using (auth.uid() is not null);

create policy "data_points_delete_authenticated"
  on public.data_points for delete
  using (auth.uid() is not null);

-- RLS Policies for upload_history
create policy "upload_history_select_own"
  on public.upload_history for select
  using (auth.uid() = uploaded_by);

create policy "upload_history_insert_own"
  on public.upload_history for insert
  with check (auth.uid() = uploaded_by);

-- Create indexes for performance
create index idx_signals_name on public.signals(name);
create index idx_signals_owner on public.signals(owner_id);
create index idx_data_points_signal on public.data_points(signal_id);
create index idx_data_points_date on public.data_points(date);
create index idx_upload_history_user on public.upload_history(uploaded_by);

-- Function to calculate 90-day average
create or replace function calculate_90_day_average(signal_uuid uuid)
returns numeric
language plpgsql
as $$
declare
  avg_value numeric;
begin
  select avg(value) into avg_value
  from public.data_points
  where signal_id = signal_uuid
    and date >= current_date - interval '90 days';
  
  return avg_value;
end;
$$;
