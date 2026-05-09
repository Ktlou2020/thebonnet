create extension if not exists pgcrypto;

create type public.app_role as enum ('CONSUMER', 'MECHANIC_OWNER', 'ADMIN');
create type public.workshop_status as enum ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED');
create type public.subscription_tier as enum ('FREE', 'GROWTH', 'PRO');
create type public.accreditation_status as enum ('PENDING', 'VERIFIED', 'REJECTED');
create type public.lead_status as enum ('NEW', 'QUALIFIED', 'ASSIGNED', 'CLOSED_WON', 'CLOSED_LOST', 'SPAM');
create type public.assignment_status as enum ('SENT', 'VIEWED', 'QUOTED', 'WON', 'LOST', 'EXPIRED');
create type public.quote_status as enum ('DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'EXPIRED');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  role public.app_role not null default 'CONSUMER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workshops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text not null,
  city text not null,
  province text not null,
  address_line_1 text,
  suburb text,
  postal_code text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  whatsapp text,
  phone text,
  email text,
  website text,
  status public.workshop_status not null default 'PENDING',
  subscription_tier public.subscription_tier not null default 'FREE',
  featured boolean not null default false,
  mobile_service boolean not null default false,
  service_radius_km integer,
  response_minutes integer,
  hourly_rate integer,
  rating_average numeric(3, 2) not null default 0,
  review_count integer not null default 0,
  warranty_policy text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.accreditations (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops (id) on delete cascade,
  authority text not null,
  membership_number text not null,
  status public.accreditation_status not null default 'PENDING',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (authority, membership_number)
);

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.vehicle_makes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.workshop_services (
  workshop_id uuid not null references public.workshops (id) on delete cascade,
  category_id uuid not null references public.service_categories (id) on delete cascade,
  primary key (workshop_id, category_id)
);

create table public.workshop_makes (
  workshop_id uuid not null references public.workshops (id) on delete cascade,
  make_id uuid not null references public.vehicle_makes (id) on delete cascade,
  primary key (workshop_id, make_id)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  location text not null,
  city text,
  province text,
  vehicle_make text,
  vehicle_model text,
  vehicle_year integer,
  vehicle_label text not null,
  service_needed text not null,
  urgency text,
  details text,
  preferred_date timestamptz,
  status public.lead_status not null default 'NEW',
  created_at timestamptz not null default now()
);

create table public.lead_assignments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  workshop_id uuid not null references public.workshops (id) on delete cascade,
  status public.assignment_status not null default 'SENT',
  lead_price_cents integer,
  assigned_at timestamptz not null default now(),
  viewed_at timestamptz,
  responded_at timestamptz,
  unique (lead_id, workshop_id)
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null unique references public.lead_assignments (id) on delete cascade,
  labour_cents integer not null,
  parts_cents integer not null,
  vat_cents integer not null default 0,
  total_cents integer not null,
  eta_text text,
  warranty_text text,
  notes text,
  status public.quote_status not null default 'SUBMITTED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  verified_job boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.price_benchmarks (
  id uuid primary key default gen_random_uuid(),
  service_category_id uuid not null references public.service_categories (id) on delete cascade,
  vehicle_make_id uuid not null references public.vehicle_makes (id) on delete cascade,
  vehicle_model text not null,
  city text not null,
  low_cents integer not null,
  independent_avg_cents integer not null,
  high_cents integer not null,
  dealership_avg_cents integer not null,
  sample_size integer not null default 0,
  confidence_label text not null default 'Medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_category_id, vehicle_make_id, vehicle_model, city)
);

create table public.workshop_subscriptions (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null unique references public.workshops (id) on delete cascade,
  tier public.subscription_tier not null,
  provider text not null default 'manual',
  external_ref text,
  start_date timestamptz not null,
  renews_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workshop_media (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops (id) on delete cascade,
  type text not null,
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index workshops_city_province_idx on public.workshops (city, province);
create index workshops_status_featured_idx on public.workshops (status, featured);
create index accreditations_workshop_id_idx on public.accreditations (workshop_id);
create index leads_status_created_at_idx on public.leads (status, created_at desc);
create index leads_city_province_idx on public.leads (city, province);
create index lead_assignments_workshop_status_idx on public.lead_assignments (workshop_id, status);
create index reviews_workshop_created_at_idx on public.reviews (workshop_id, created_at desc);
create index workshop_media_workshop_sort_idx on public.workshop_media (workshop_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_workshops_updated_at before update on public.workshops
for each row execute function public.set_updated_at();

create trigger set_quotes_updated_at before update on public.quotes
for each row execute function public.set_updated_at();

create trigger set_price_benchmarks_updated_at before update on public.price_benchmarks
for each row execute function public.set_updated_at();

create trigger set_workshop_subscriptions_updated_at before update on public.workshop_subscriptions
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  );
$$;

create or replace function public.owns_workshop(target_workshop_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workshops w
    where w.id = target_workshop_id and w.owner_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.workshops enable row level security;
alter table public.accreditations enable row level security;
alter table public.service_categories enable row level security;
alter table public.vehicle_makes enable row level security;
alter table public.workshop_services enable row level security;
alter table public.workshop_makes enable row level security;
alter table public.leads enable row level security;
alter table public.lead_assignments enable row level security;
alter table public.quotes enable row level security;
alter table public.reviews enable row level security;
alter table public.price_benchmarks enable row level security;
alter table public.workshop_subscriptions enable row level security;
alter table public.workshop_media enable row level security;

create policy "profiles_self_select" on public.profiles
for select to authenticated
using (auth.uid() = id or public.is_admin());

create policy "profiles_self_update" on public.profiles
for update to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

create policy "verified_workshops_public_read" on public.workshops
for select to anon, authenticated
using (status = 'VERIFIED' or owner_id = auth.uid() or public.is_admin());

create policy "workshops_owner_insert" on public.workshops
for insert to authenticated
with check (owner_id = auth.uid() or public.is_admin());

create policy "workshops_owner_update" on public.workshops
for update to authenticated
using (owner_id = auth.uid() or public.is_admin())
with check (owner_id = auth.uid() or public.is_admin());

create policy "workshops_owner_delete" on public.workshops
for delete to authenticated
using (owner_id = auth.uid() or public.is_admin());

create policy "accreditations_public_read_for_verified" on public.accreditations
for select to anon, authenticated
using (
  exists (
    select 1 from public.workshops w
    where w.id = workshop_id
      and (w.status = 'VERIFIED' or w.owner_id = auth.uid() or public.is_admin())
  )
);

create policy "accreditations_owner_manage" on public.accreditations
for all to authenticated
using (public.owns_workshop(workshop_id) or public.is_admin())
with check (public.owns_workshop(workshop_id) or public.is_admin());

create policy "service_categories_public_read" on public.service_categories
for select to anon, authenticated
using (true);

create policy "vehicle_makes_public_read" on public.vehicle_makes
for select to anon, authenticated
using (true);

create policy "workshop_services_public_read" on public.workshop_services
for select to anon, authenticated
using (
  exists (
    select 1 from public.workshops w
    where w.id = workshop_id
      and (w.status = 'VERIFIED' or w.owner_id = auth.uid() or public.is_admin())
  )
);

create policy "workshop_services_owner_manage" on public.workshop_services
for all to authenticated
using (public.owns_workshop(workshop_id) or public.is_admin())
with check (public.owns_workshop(workshop_id) or public.is_admin());

create policy "workshop_makes_public_read" on public.workshop_makes
for select to anon, authenticated
using (
  exists (
    select 1 from public.workshops w
    where w.id = workshop_id
      and (w.status = 'VERIFIED' or w.owner_id = auth.uid() or public.is_admin())
  )
);

create policy "workshop_makes_owner_manage" on public.workshop_makes
for all to authenticated
using (public.owns_workshop(workshop_id) or public.is_admin())
with check (public.owns_workshop(workshop_id) or public.is_admin());

create policy "lead_insert_public" on public.leads
for insert to anon, authenticated
with check (true);

create policy "lead_select_owner_or_admin" on public.leads
for select to authenticated
using (
  public.is_admin()
  or customer_id = auth.uid()
  or exists (
    select 1
    from public.lead_assignments la
    join public.workshops w on w.id = la.workshop_id
    where la.lead_id = id and w.owner_id = auth.uid()
  )
);

create policy "lead_assignment_owner_read" on public.lead_assignments
for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.workshops w
    where w.id = workshop_id and w.owner_id = auth.uid()
  )
);

create policy "lead_assignment_owner_update" on public.lead_assignments
for update to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.workshops w
    where w.id = workshop_id and w.owner_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.workshops w
    where w.id = workshop_id and w.owner_id = auth.uid()
  )
);

create policy "lead_assignment_admin_insert" on public.lead_assignments
for insert to authenticated
with check (public.is_admin());

create policy "quotes_owner_read" on public.quotes
for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.lead_assignments la
    join public.workshops w on w.id = la.workshop_id
    where la.id = assignment_id and w.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.lead_assignments la
    join public.leads l on l.id = la.lead_id
    where la.id = assignment_id and l.customer_id = auth.uid()
  )
);

create policy "quotes_owner_manage" on public.quotes
for all to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.lead_assignments la
    join public.workshops w on w.id = la.workshop_id
    where la.id = assignment_id and w.owner_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.lead_assignments la
    join public.workshops w on w.id = la.workshop_id
    where la.id = assignment_id and w.owner_id = auth.uid()
  )
);

create policy "reviews_public_read" on public.reviews
for select to anon, authenticated
using (true);

create policy "reviews_authenticated_insert" on public.reviews
for insert to authenticated
with check (user_id = auth.uid() or public.is_admin());

create policy "reviews_owner_update" on public.reviews
for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "price_benchmarks_public_read" on public.price_benchmarks
for select to anon, authenticated
using (true);

create policy "price_benchmarks_admin_manage" on public.price_benchmarks
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "workshop_subscriptions_owner_read" on public.workshop_subscriptions
for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.workshops w
    where w.id = workshop_id and w.owner_id = auth.uid()
  )
);

create policy "workshop_subscriptions_admin_manage" on public.workshop_subscriptions
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "workshop_media_public_read" on public.workshop_media
for select to anon, authenticated
using (
  exists (
    select 1 from public.workshops w
    where w.id = workshop_id
      and (w.status = 'VERIFIED' or w.owner_id = auth.uid() or public.is_admin())
  )
);

create policy "workshop_media_owner_manage" on public.workshop_media
for all to authenticated
using (public.owns_workshop(workshop_id) or public.is_admin())
with check (public.owns_workshop(workshop_id) or public.is_admin());
