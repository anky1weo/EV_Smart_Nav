import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, Vehicle, GovProfile } from '../lib/supabase';

interface AuthContextType {
  // Auth state
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  vehicle: Vehicle | null;
  govProfile: GovProfile | null;
  loading: boolean;
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: AuthError | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  
  // Profile actions
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any }>;
  upsertVehicle: (data: Partial<Vehicle>) => Promise<{ error: any }>;
  upsertGovProfile: (data: Partial<GovProfile>) => Promise<{ error: any }>;
  
  // Refresh
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [govProfile, setGovProfile] = useState<GovProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile + vehicle + gov data for a user
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        setProfile(profileData as Profile);

        // Fetch vehicle if driver
        if (profileData.role === 'driver') {
          const { data: vehicleData } = await supabase
            .from('vehicles')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (vehicleData) setVehicle(vehicleData as Vehicle);
        }

        // Fetch gov profile if gov/operator
        if (profileData.role === 'gov' || profileData.role === 'operator') {
          const { data: govData } = await supabase
            .from('gov_profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (govData) setGovProfile(govData as GovProfile);
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        fetchUserData(existingSession.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchUserData(newSession.user.id);
        } else {
          setProfile(null);
          setVehicle(null);
          setGovProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ---------- Auth Actions ----------

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // e.g. { full_name, role, phone }
      },
    });

    if (!error && data.user) {
      // Create profile row immediately
      const role = metadata?.role || 'driver';
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: metadata?.full_name || null,
        phone: metadata?.phone || null,
        role,
        preferred_route: metadata?.preferred_route || 'Fastest',
        min_battery_buffer: metadata?.min_battery_buffer || 20,
        eco_points: 0,
      });

      // If driver, create vehicle
      if (role === 'driver' && metadata?.vehicle_company) {
        await supabase.from('vehicles').insert({
          user_id: data.user.id,
          company: metadata.vehicle_company,
          model_name: metadata.vehicle_model || '',
          variant: metadata.vehicle_variant || null,
          manufacturing_year: metadata.manufacturing_year || null,
          battery_capacity_kwh: metadata.battery_capacity || null,
          battery_health_pct: metadata.battery_health || null,
          connector_type: metadata.connector_type || 'Type 2',
        });
      }

      // If gov/operator, create gov profile
      if (role === 'gov' || role === 'operator') {
        await supabase.from('gov_profiles').upsert({
          id: data.user.id,
          org_name: metadata?.org_name || null,
          org_type: metadata?.org_type || null,
          gst_number: metadata?.gst_number || null,
          org_contact: metadata?.org_contact || null,
          org_address: metadata?.org_address || null,
          designation: metadata?.designation || null,
          employee_id: metadata?.employee_id || null,
          department_name: metadata?.department_name || null,
          region: metadata?.region || null,
          assigned_stations: metadata?.assigned_stations || null,
          access_level: metadata?.access_level || 'L1',
          num_charging_stations: metadata?.num_charging_stations || 0,
          service_areas: metadata?.service_areas || null,
        });
      }

      // Check if email confirmation is needed
      const needsConfirmation = !data.session;
      return { error: null, needsConfirmation };
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setVehicle(null);
    setGovProfile(null);
  };

  // ---------- Profile Actions ----------

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) await fetchUserData(user.id);
    return { error };
  };

  const upsertVehicle = async (data: Partial<Vehicle>) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('vehicles')
      .upsert({ ...data, user_id: user.id });

    if (!error) await fetchUserData(user.id);
    return { error };
  };

  const upsertGovProfile = async (data: Partial<GovProfile>) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('gov_profiles')
      .upsert({ ...data, id: user.id });

    if (!error) await fetchUserData(user.id);
    return { error };
  };

  const refreshProfile = async () => {
    if (user) await fetchUserData(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        vehicle,
        govProfile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        upsertVehicle,
        upsertGovProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
