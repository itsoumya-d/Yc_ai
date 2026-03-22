-- Vet providers for telehealth
create table if not exists public.vet_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text,
  bio text,
  avatar_url text,
  price_per_consultation decimal default 45,
  rating decimal(3,2),
  reviews_count integer default 0,
  available boolean default true,
  next_available_at timestamptz,
  daily_room_prefix text, -- Daily.co room name prefix
  created_at timestamptz default now()
);

-- Add telehealth columns to appointments
alter table public.appointments
  add column if not exists telehealth_room_url text,
  add column if not exists telehealth_room_name text,
  add column if not exists cost decimal;

-- Marketplace services (groomers, walkers, trainers, boarders)
create table if not exists public.marketplace_services (
  id uuid primary key default gen_random_uuid(),
  provider_name text not null,
  title text not null,
  description text,
  service_type text check (service_type in ('grooming', 'walking', 'training', 'boarding', 'sitting', 'daycare', 'other')),
  price decimal not null,
  duration_minutes integer,
  location text,
  rating decimal(3,2),
  reviews_count integer default 0,
  images text[],
  available boolean default true,
  created_at timestamptz default now()
);

-- Service bookings
create table if not exists public.service_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  service_id uuid references public.marketplace_services(id),
  pet_id uuid references public.pets(id),
  booking_date date not null,
  booking_time time,
  status text default 'confirmed' check (status in ('confirmed', 'in_progress', 'completed', 'cancelled')),
  total_price decimal,
  notes text,
  created_at timestamptz default now()
);

alter table public.vet_providers enable row level security;
alter table public.marketplace_services enable row level security;
alter table public.service_bookings enable row level security;

create policy "All can read vets" on public.vet_providers for select using (true);
create policy "All can read services" on public.marketplace_services for select using (true);
create policy "Own bookings" on public.service_bookings for all using (auth.uid() = user_id);

-- Seed some sample vet providers
insert into public.vet_providers (name, specialty, bio, price_per_consultation, rating, reviews_count, available)
values
  ('Dr. Sarah Chen', 'General Practice', 'Board-certified veterinarian with 12 years of experience.', 45, 4.9, 128, true),
  ('Dr. Emily Park', 'Dermatology', 'Specialist in pet skin conditions, allergies, and coat health.', 55, 4.8, 94, true),
  ('Dr. Marcus Rivera', 'Nutrition & Internal Medicine', 'Expert in chronic disease management.', 50, 4.7, 67, true)
on conflict do nothing;
