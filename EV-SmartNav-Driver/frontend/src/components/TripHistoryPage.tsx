import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Route as RouteIcon, Battery, Zap, Trash2, Calendar, Clock, Loader2, AlertCircle } from 'lucide-react';

export default function TripHistoryPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("You must be logged in to view trip history.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTrips(data || []);
    } catch (err: any) {
      console.error("Error fetching trips:", err);
      setError("Failed to load trip history.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      // Optimistic UI update
      setTrips(trips.filter(t => t.id !== id));
      
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err: any) {
      console.error("Error deleting trip:", err);
      alert("Failed to delete trip.");
      fetchTrips(); // revert on failure
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col gap-6 w-full h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar pr-2 pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-emerald-400" />
            Trip History
          </h2>
          <p className="text-white/60">Review your past generated routes and AI charging logs.</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-white">{trips.length}</div>
          <div className="text-sm text-white/50 uppercase tracking-widest font-bold">Total Trips</div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
          <p className="text-white/60 font-medium">Loading history...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-white font-bold text-lg mb-1">Could not load history</p>
          <p className="text-white/60">{error}</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center backdrop-blur-md">
          <RouteIcon className="w-16 h-16 text-white/20 mb-4" />
          <p className="text-xl font-bold text-white mb-2">No trips found</p>
          <p className="text-white/50 max-w-md">You haven't generated any AI routes yet. Head over to the Dashboard or Route Planner to start your first journey!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-gradient-to-br from-[#161925] to-[#0f111a] border border-white/10 rounded-3xl p-6 backdrop-blur-md hover:border-emerald-500/30 transition-all group relative overflow-hidden">
              
              {/* Delete Button */}
              <button 
                onClick={() => deleteTrip(trip.id)}
                className="absolute top-4 right-4 w-8 h-8 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
                title="Delete Trip"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="text-xs font-bold text-emerald-400/80 mb-4 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(trip.created_at)}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-400 shrink-0" />
                  <div className="w-0.5 h-6 bg-gradient-to-b from-blue-400 to-emerald-400 my-1" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400 shrink-0" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate" title={trip.source_name || "Unknown Source"}>
                    {trip.source_name || "Current Location"}
                  </p>
                  <p className="text-sm text-white/40 my-2">to</p>
                  <p className="text-white font-semibold truncate" title={trip.destination_name || "Unknown Destination"}>
                    {trip.destination_name || "Destination"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                <div>
                  <div className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1">Distance</div>
                  <div className="text-lg font-bold text-white">{trip.distance_km} km</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1">Time</div>
                  <div className="text-lg font-bold text-white">
                    {Math.floor(trip.duration_minutes / 60)}h {Math.floor(trip.duration_minutes % 60)}m
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1">AI Pitstops</div>
                  <div className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    {trip.charging_stops} Stops
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1">Est. Cost</div>
                  <div className="text-lg font-bold text-white">₹{Math.round(trip.estimated_cost)}</div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
