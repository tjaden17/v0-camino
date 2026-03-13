-- Create benchmark history table
create table if not exists public.benchmark_history (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid references public.signals(id) on delete cascade not null,
  benchmark_value numeric not null,
  benchmark_type text not null,
  effective_date date not null,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  notes text
);

-- Create data quality metrics table
create table if not exists public.data_quality_metrics (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid references public.signals(id) on delete cascade not null,
  metric_date date not null,
  completeness_score numeric check (completeness_score >= 0 and completeness_score <= 100),
  timeliness_score numeric check (timeliness_score >= 0 and timeliness_score <= 100),
  accuracy_score numeric check (accuracy_score >= 0 and accuracy_score <= 100),
  last_update_date date,
  data_point_count integer default 0,
  created_at timestamp with time zone default now(),
  unique(signal_id, metric_date)
);

-- Create signal analytics table (pre-computed metrics)
create table if not exists public.signal_analytics (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid references public.signals(id) on delete cascade not null,
  period_start date not null,
  period_end date not null,
  period_type text check (period_type in ('day', 'week', 'month', 'quarter', 'year')) not null,
  avg_value numeric,
  min_value numeric,
  max_value numeric,
  std_dev numeric,
  data_point_count integer default 0,
  trend_direction text check (trend_direction in ('increasing', 'decreasing', 'stable')),
  trend_strength numeric,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(signal_id, period_start, period_end, period_type)
);

-- Create alerts/notifications table
create table if not exists public.signal_alerts (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid references public.signals(id) on delete cascade not null,
  alert_type text check (alert_type in ('threshold_breach', 'missing_data', 'quality_issue', 'benchmark_miss')) not null,
  severity text check (severity in ('low', 'medium', 'high', 'critical')) default 'medium',
  title text not null,
  description text,
  is_read boolean default false,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  resolved_at timestamp with time zone
);

-- Enable RLS
alter table public.benchmark_history enable row level security;
alter table public.data_quality_metrics enable row level security;
alter table public.signal_analytics enable row level security;
alter table public.signal_alerts enable row level security;

-- RLS Policies for benchmark_history
create policy "benchmark_history_select_all"
  on public.benchmark_history for select
  using (true);

create policy "benchmark_history_insert_authenticated"
  on public.benchmark_history for insert
  with check (auth.uid() is not null);

-- RLS Policies for data_quality_metrics
create policy "data_quality_select_all"
  on public.data_quality_metrics for select
  using (true);

create policy "data_quality_insert_authenticated"
  on public.data_quality_metrics for insert
  with check (auth.uid() is not null);

-- RLS Policies for signal_analytics
create policy "signal_analytics_select_all"
  on public.signal_analytics for select
  using (true);

create policy "signal_analytics_insert_authenticated"
  on public.signal_analytics for insert
  with check (auth.uid() is not null);

-- RLS Policies for signal_alerts
create policy "signal_alerts_select_own"
  on public.signal_alerts for select
  using (auth.uid() = user_id);

create policy "signal_alerts_update_own"
  on public.signal_alerts for update
  using (auth.uid() = user_id);

-- Create indexes
create index idx_benchmark_history_signal on public.benchmark_history(signal_id, effective_date desc);
create index idx_data_quality_signal on public.data_quality_metrics(signal_id, metric_date desc);
create index idx_signal_analytics_signal on public.signal_analytics(signal_id, period_start desc);
create index idx_signal_alerts_user on public.signal_alerts(user_id, is_read, created_at desc);

-- Function to calculate data quality score
create or replace function calculate_data_quality(signal_uuid uuid, check_date date)
returns table (
  completeness numeric,
  timeliness numeric,
  accuracy numeric
)
language plpgsql
as $$
declare
  expected_points integer;
  actual_points integer;
  recent_points integer;
  days_since_last numeric;
begin
  -- Calculate completeness (data points in last 30 days)
  expected_points := 30;
  select count(*) into actual_points
  from public.data_points
  where signal_id = signal_uuid
    and date >= check_date - interval '30 days'
    and date <= check_date;
  
  completeness := least(100, (actual_points::numeric / expected_points::numeric) * 100);
  
  -- Calculate timeliness (days since last data point)
  select extract(day from check_date - max(date))::numeric into days_since_last
  from public.data_points
  where signal_id = signal_uuid
    and date <= check_date;
  
  if days_since_last is null then
    timeliness := 0;
  elsif days_since_last <= 1 then
    timeliness := 100;
  elsif days_since_last <= 7 then
    timeliness := 80;
  elsif days_since_last <= 30 then
    timeliness := 50;
  else
    timeliness := 20;
  end if;
  
  -- Accuracy score (placeholder - could be enhanced with validation rules)
  accuracy := 90;
  
  return query select completeness, timeliness, accuracy;
end;
$$;

-- Function to detect anomalies
create or replace function detect_anomalies(signal_uuid uuid, threshold_multiplier numeric default 2.0)
returns table (
  date date,
  value numeric,
  is_anomaly boolean,
  z_score numeric
)
language plpgsql
as $$
declare
  avg_val numeric;
  std_val numeric;
begin
  -- Calculate mean and standard deviation
  select avg(dp.value), stddev(dp.value)
  into avg_val, std_val
  from public.data_points dp
  where dp.signal_id = signal_uuid
    and dp.date >= current_date - interval '90 days';
  
  return query
  select 
    dp.date,
    dp.value,
    (abs(dp.value - avg_val) > (threshold_multiplier * coalesce(std_val, 1))) as is_anomaly,
    (dp.value - avg_val) / nullif(std_val, 0) as z_score
  from public.data_points dp
  where dp.signal_id = signal_uuid
    and dp.date >= current_date - interval '90 days'
  order by dp.date desc;
end;
$$;
