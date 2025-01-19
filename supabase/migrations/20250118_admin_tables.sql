-- Enable RLS
alter table reported_content enable row level security;
alter table categories enable row level security;
alter table admin_settings enable row level security;

-- Create reported_content table
create table if not exists reported_content (
  id uuid primary key default uuid_generate_v4(),
  content_type text not null,
  content_id uuid not null,
  reporter_id uuid references auth.users(id),
  reason text not null,
  status text default 'pending',
  rejection_reason text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create categories table
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  icon text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create admin_settings table
create table if not exists admin_settings (
  id text primary key default 'default',
  general jsonb default '{}'::jsonb,
  security jsonb default '{}'::jsonb,
  email jsonb default '{}'::jsonb,
  payment jsonb default '{}'::jsonb,
  integration jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint single_row check (id = 'default')
);

-- Insert default admin settings
insert into admin_settings (id)
values ('default')
on conflict (id) do nothing;

-- Create RLS policies

-- Reported content policies
create policy "Only admins can view reported content"
  on reported_content
  for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Only admins can update reported content"
  on reported_content
  for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Categories policies
create policy "Anyone can view categories"
  on categories
  for select
  using (true);

create policy "Only admins can modify categories"
  on categories
  for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Admin settings policies
create policy "Only admins can view settings"
  on admin_settings
  for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Only admins can modify settings"
  on admin_settings
  for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create functions and triggers
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_reported_content_updated_at
  before update on reported_content
  for each row
  execute function update_updated_at();

create trigger update_categories_updated_at
  before update on categories
  for each row
  execute function update_updated_at();

create trigger update_admin_settings_updated_at
  before update on admin_settings
  for each row
  execute function update_updated_at();
