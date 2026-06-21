-- ============================================
-- EV SmartNav — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Enable PostGIS extension for geospatial queries
create extension if not exists postgis;

-- ============================================
-- 2. Profiles Table (extends Supabase auth.users)
-- ============================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  role text check (role in ('driver', 'gov', 'operator')) default 'driver',
  avatar_url text,
  preferred_route text default 'Fastest',
  min_battery_buffer integer default 20,
  eco_points integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'driver')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if any, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- 3. Vehicles Table
-- ============================================
create table if not exists vehicles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  company text not null,
  model_name text not null,
  variant text,
  manufacturing_year integer,
  battery_capacity_kwh numeric,
  battery_health_pct numeric default 100,
  connector_type text default 'Type 2',
  created_at timestamptz default now()
);

alter table vehicles enable row level security;

create policy "Users can view own vehicles"
  on vehicles for select
  using (auth.uid() = user_id);

create policy "Users can insert own vehicles"
  on vehicles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own vehicles"
  on vehicles for update
  using (auth.uid() = user_id);

create policy "Users can delete own vehicles"
  on vehicles for delete
  using (auth.uid() = user_id);

-- ============================================
-- 4. Charging Stations Table (with PostGIS)
-- ============================================
create table if not exists charging_stations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  address text,
  connector_types text[] default '{"Type 2"}',
  power_kw numeric default 50,
  total_slots integer default 4,
  available_slots integer default 4,
  price_per_kwh numeric default 18,
  rating numeric default 4.0,
  station_type text check (station_type in ('Fast', 'Slow', 'Ultra-Fast')) default 'Fast',
  operator_name text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table charging_stations enable row level security;

-- Everyone can view stations (public data)
create policy "Anyone can view active stations"
  on charging_stations for select
  using (true);

-- Only gov/operator roles can insert/update/delete stations
create policy "Gov users can insert stations"
  on charging_stations for insert
  with check (
    exists (select 1 from profiles where id = auth.uid() and role in ('gov', 'operator'))
  );

create policy "Gov users can update stations"
  on charging_stations for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role in ('gov', 'operator'))
  );

create policy "Gov users can delete stations"
  on charging_stations for delete
  using (
    exists (select 1 from profiles where id = auth.uid() and role in ('gov', 'operator'))
  );

-- ============================================
-- 5. Trips Table
-- ============================================
create table if not exists trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  source_name text,
  destination_name text,
  source_lat double precision,
  source_lng double precision,
  destination_lat double precision,
  destination_lng double precision,
  distance_km numeric,
  duration_minutes integer,
  battery_start_pct numeric,
  battery_end_pct numeric,
  charging_stops integer default 0,
  estimated_cost numeric,
  route_geojson jsonb,
  created_at timestamptz default now()
);

alter table trips enable row level security;

create policy "Users can view own trips"
  on trips for select
  using (auth.uid() = user_id);

create policy "Users can insert own trips"
  on trips for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own trips"
  on trips for delete
  using (auth.uid() = user_id);

-- ============================================
-- 6. Gov Profiles Table
-- ============================================
create table if not exists gov_profiles (
  id uuid references profiles(id) on delete cascade primary key,
  org_name text,
  org_type text,
  gst_number text,
  org_contact text,
  org_address text,
  designation text,
  employee_id text,
  department_name text,
  region text,
  assigned_stations text,
  access_level text default 'L1',
  num_charging_stations integer default 0,
  service_areas text
);

alter table gov_profiles enable row level security;

create policy "Gov users can view own gov profile"
  on gov_profiles for select
  using (auth.uid() = id);

create policy "Gov users can insert own gov profile"
  on gov_profiles for insert
  with check (auth.uid() = id);

create policy "Gov users can update own gov profile"
  on gov_profiles for update
  using (auth.uid() = id);

-- ============================================
-- 7. Seed Data: Sample Charging Stations (India)
-- ============================================
insert into charging_stations (name, latitude, longitude, address, connector_types, power_kw, total_slots, available_slots, price_per_kwh, rating, station_type, operator_name) values
  ('Tata Power EZ Charge - Indore', 22.7196, 75.8577, 'AB Road, Indore, MP', '{"CCS2","Type 2"}', 50, 6, 4, 18, 4.6, 'Fast', 'Tata Power'),
  ('Shell Recharge - Vijay Nagar', 22.7533, 75.8937, 'Vijay Nagar, Indore, MP', '{"CCS2"}', 150, 4, 2, 21, 4.8, 'Ultra-Fast', 'Shell Recharge'),
  ('Statiq Charger - Palasia', 22.7236, 75.8775, 'Palasia Square, Indore, MP', '{"Type 2"}', 22, 2, 0, 15, 4.1, 'Slow', 'Statiq'),
  ('EESL ChargeGrid - Bhopal', 23.2599, 77.4126, 'New Market, Bhopal, MP', '{"CCS2","CHAdeMO"}', 50, 4, 3, 16, 4.3, 'Fast', 'EESL'),
  ('Ather Grid - Bhopal', 23.2332, 77.4343, 'DB Mall, Bhopal, MP', '{"Ather"}', 22, 3, 2, 12, 4.5, 'Slow', 'Ather Energy'),
  ('ChargeZone - Dewas', 22.9623, 76.0508, 'AB Road, Dewas, MP', '{"CCS2","Type 2"}', 60, 4, 4, 17, 4.2, 'Fast', 'ChargeZone'),
  ('Tata Power - Ujjain', 23.1793, 75.7849, 'Freeganj, Ujjain, MP', '{"CCS2"}', 50, 4, 3, 18, 4.4, 'Fast', 'Tata Power'),
  ('HPCL Charge Hub - Mumbai', 19.0760, 72.8777, 'Andheri East, Mumbai, MH', '{"CCS2","CHAdeMO","Type 2"}', 150, 8, 5, 22, 4.7, 'Ultra-Fast', 'HPCL'),
  ('Fortum Charge - Delhi', 28.6139, 77.2090, 'Connaught Place, Delhi', '{"CCS2","Type 2"}', 50, 6, 4, 19, 4.5, 'Fast', 'Fortum'),
  ('MG ZS Station - Bangalore', 12.9716, 77.5946, 'MG Road, Bangalore, KA', '{"CCS2"}', 60, 4, 2, 20, 4.6, 'Fast', 'MG Motor'),
  ('ElectricPe Hub - Pune', 18.5204, 73.8567, 'Hinjewadi, Pune, MH', '{"CCS2","Type 2"}', 120, 6, 5, 19, 4.4, 'Ultra-Fast', 'ElectricPe'),
  ('Glida Charge - Hyderabad', 17.3850, 78.4867, 'HITEC City, Hyderabad, TS', '{"CCS2","CHAdeMO"}', 50, 4, 3, 17, 4.3, 'Fast', 'Glida')
on conflict do nothing;

-- ============================================
-- 8. Helper Function: Find nearby stations
-- ============================================
create or replace function nearby_stations(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision default 50
)
returns table (
  id uuid,
  name text,
  latitude double precision,
  longitude double precision,
  address text,
  connector_types text[],
  power_kw numeric,
  total_slots integer,
  available_slots integer,
  price_per_kwh numeric,
  rating numeric,
  station_type text,
  operator_name text,
  distance_km double precision
)
language sql
stable
as $$
  select
    cs.id,
    cs.name,
    cs.latitude,
    cs.longitude,
    cs.address,
    cs.connector_types,
    cs.power_kw,
    cs.total_slots,
    cs.available_slots,
    cs.price_per_kwh,
    cs.rating,
    cs.station_type,
    cs.operator_name,
    (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(cs.latitude))
        * cos(radians(cs.longitude) - radians(user_lng))
        + sin(radians(user_lat)) * sin(radians(cs.latitude))
      )
    ) as distance_km
  from charging_stations cs
  where cs.is_active = true
  order by distance_km
  limit 20;
$$;
