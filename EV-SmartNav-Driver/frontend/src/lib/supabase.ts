import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️ Supabase credentials missing!\n' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.\n' +
    'Get these from: Supabase Dashboard → Settings → API'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// ---------- Type Definitions ----------

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'driver' | 'gov' | 'operator';
  avatar_url: string | null;
  preferred_route: string;
  min_battery_buffer: number;
  eco_points: number;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  company: string;
  model_name: string;
  variant: string | null;
  manufacturing_year: number | null;
  battery_capacity_kwh: number | null;
  battery_health_pct: number | null;
  connector_type: string;
  created_at: string;
}

export interface ChargingStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  connector_types: string[];
  power_kw: number;
  total_slots: number;
  available_slots: number;
  price_per_kwh: number;
  rating: number;
  station_type: 'Fast' | 'Slow' | 'Ultra-Fast';
  operator_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  source_name: string | null;
  destination_name: string | null;
  source_lat: number | null;
  source_lng: number | null;
  destination_lat: number | null;
  destination_lng: number | null;
  distance_km: number | null;
  duration_minutes: number | null;
  battery_start_pct: number | null;
  battery_end_pct: number | null;
  charging_stops: number;
  estimated_cost: number | null;
  route_geojson: any;
  created_at: string;
}

export interface GovProfile {
  id: string;
  org_name: string | null;
  org_type: string | null;
  gst_number: string | null;
  org_contact: string | null;
  org_address: string | null;
  designation: string | null;
  employee_id: string | null;
  department_name: string | null;
  region: string | null;
  assigned_stations: string | null;
  access_level: string;
  num_charging_stations: number;
  service_areas: string | null;
}
