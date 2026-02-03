-- Create organization_invites table for pending invitations
create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade not null,
  email text not null,
  role text not null default 'read-only' check (role in ('admin', 'read-only')),
  invited_by uuid,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
  token text unique,
  expires_at timestamp with time zone not null,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for performance
create index if not exists idx_org_invites_org_id on public.organization_invites(organization_id);
create index if not exists idx_org_invites_email on public.organization_invites(email);
create index if not exists idx_org_invites_token on public.organization_invites(token);
create index if not exists idx_org_invites_status on public.organization_invites(status);
