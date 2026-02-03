-- Create organizations table
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create organization members table
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'read-only')),
  invited_by uuid references auth.users(id) on delete set null,
  invited_at timestamp with time zone default now(),
  joined_at timestamp with time zone,
  unique(organization_id, user_id)
);

-- Add organization_id to profiles
alter table public.profiles 
  add column if not exists organization_id uuid references public.organizations(id) on delete set null,
  add column if not exists company_stage text,
  add column if not exists team_size text,
  add column if not exists market text,
  add column if not exists competitors text,
  add column if not exists business_model text,
  add column if not exists kpi_1 text,
  add column if not exists kpi_2 text,
  add column if not exists kpi_3 text;

-- Enable RLS
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- RLS Policies for organizations
create policy "orgs_select_members"
  on public.organizations for select
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = id and user_id = auth.uid()
    )
  );

create policy "orgs_insert_own"
  on public.organizations for insert
  with check (auth.uid() = created_by);

create policy "orgs_update_admin"
  on public.organizations for update
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = id and user_id = auth.uid() and role = 'admin'
    )
  );

create policy "orgs_delete_admin"
  on public.organizations for delete
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = id and user_id = auth.uid() and role = 'admin'
    )
  );

-- RLS Policies for organization_members
create policy "org_members_select_own_org"
  on public.organization_members for select
  using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = organization_id and om.user_id = auth.uid()
    )
  );

create policy "org_members_insert_admin"
  on public.organization_members for insert
  with check (
    exists (
      select 1 from public.organization_members
      where organization_id = organization_members.organization_id 
        and user_id = auth.uid() 
        and role = 'admin'
    )
  );

create policy "org_members_update_admin"
  on public.organization_members for update
  using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = organization_id 
        and om.user_id = auth.uid() 
        and om.role = 'admin'
    )
  );

create policy "org_members_delete_admin"
  on public.organization_members for delete
  using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = organization_id 
        and om.user_id = auth.uid() 
        and om.role = 'admin'
    )
  );

-- Create indexes for performance
create index if not exists idx_org_members_org_id on public.organization_members(organization_id);
create index if not exists idx_org_members_user_id on public.organization_members(user_id);
create index if not exists idx_profiles_org_id on public.profiles(organization_id);
