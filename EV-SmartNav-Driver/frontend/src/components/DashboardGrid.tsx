import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Navigation, Battery, CloudRain, ShieldAlert, 
  Leaf, TrendingUp, Zap, Clock, Activity 
} from 'lucide-react';
import RouteMap from './RouteMap';
import { JourneyPlanner } from './JourneyPlanner';
import { supabase } from '../lib/supabase';
import type { ChargingStation } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface DashboardGridProps {
  currentBattery: string;
  routeCoordinates: [number, number][];
  setRouteCoordinates: React.Dispatch<React.SetStateAction<[number, number][]>>;
  tripStats: { distance: string; eta: string };
  setTripStats: React.Dispatch<React.SetStateAction<{ distance: string; eta: string }>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  onRouteCalculated: (data: any) => Promise<void>;
}

export function DashboardGrid({ 
  currentBattery, 
  routeCoordinates, 
  setRouteCoordinates, 
  tripStats, 
  setTripStats, 
  setActiveTab,
  onRouteCalculated
}: DashboardGridProps) {
  const { vehicle } = useAuth();
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [stationsLoading, setStationsLoading] = useState(true);
  const [stationFilter, setStationFilter] = useState<'all' | 'Fast' | 'Ultra-Fast'>('all');

  // Fetch charging stations from Supabase
  useEffect(() => {
    const fetchStations = async () => {
      setStationsLoading(true);
      const { data, error } = await supabase
        .from('charging_stations')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(20);

      if (data && !error) {
        setStations(data as ChargingStation[]);
      }
      setStationsLoading(false);
    };

    fetchStations();
  }, []);

  const filteredStations = stationFilter === 'all'
    ? stations
    : stations.filter(s => s.station_type === stationFilter);

  // Use real vehicle battery data synced with TopBar
  const batteryPct = parseInt(currentBattery) || 0;
  const batteryCapacity = vehicle?.battery_capacity_kwh ?? 60;
  const maxRange = vehicle?.total_range_km || (batteryCapacity * 5);
  const estimatedRange = Math.round(maxRange * (batteryPct / 100));


  // Closest station for "Next Charging Stop"
  const nextStation = stations.length > 0 ? stations[0] : null;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
      
      {/* TOP ROW: Trip & Map */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left: Journey Planner & Stats */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          
          {/* Interactive Journey Planner */}
          <JourneyPlanner onRouteCalculated={onRouteCalculated} currentBattery={currentBattery} />

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Battery Status */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-white/60 uppercase font-semibold">Battery Status</p>
                <Battery className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-bold mb-2">{batteryPct}%</p>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-4">
                <div className="bg-emerald-400 h-full" style={{ width: `${batteryPct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-white/60">
                <span>Est. Range</span>
                <span className="font-semibold text-white">{estimatedRange} km</span>
              </div>
            </div>

            {/* Weather Impact */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-white/60 uppercase font-semibold">Weather Impact</p>
                <CloudRain className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-center py-2">
                <p className="text-2xl font-bold text-red-400">-6% Range</p>
                <p className="text-xs text-white/50 mt-1">Due to headwind/rain</p>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Map Area */}
        <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative min-h-[400px]">
          <RouteMap routeCoordinates={[]} stations={[]} />
          
          {/* Floating Live Traffic Widget */}
          <div className="absolute top-6 right-6 z-[400] bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-xl">
            <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold mb-2">Live Traffic</p>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-yellow-400">Moderate</p>
                <p className="text-xs text-white/80">Some delays on route</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: AI & Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* AI Recommendation */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-3xl p-6 relative">
          <div className="absolute top-4 right-4">
            <Leaf className="w-5 h-5 text-emerald-400 opacity-50" />
          </div>
          <p className="text-xs text-white/60 uppercase font-bold tracking-wider mb-2">AI Recommendation</p>
          <p className="text-xl font-bold mb-1">Energy Efficient Route</p>
          <p className="text-sm text-emerald-400 font-medium mb-6">Save 18% Battery (Avoids steep inclines)</p>
          <button className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl py-2.5 text-sm font-semibold transition-all">
            Apply Route
          </button>
        </div>

        {/* Next Charging Stop — from real data */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <p className="text-xs text-white/60 uppercase font-bold tracking-wider mb-4">Next Charging Stop</p>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-bold text-lg">{nextStation?.name || 'No stations found'}</p>
              <p className="text-sm text-white/60">
                {nextStation ? `${nextStation.power_kw} kW ${nextStation.station_type} Charger` : 'Loading...'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm mt-6 pt-4 border-t border-white/5">
            <span className="text-white/60">Price: <span className="text-emerald-400 font-bold">₹{nextStation?.price_per_kwh ?? '--'}/kWh</span></span>
            <span className="text-white/60">Slots: <span className="text-white font-bold">{nextStation?.available_slots ?? '--'}/{nextStation?.total_slots ?? '--'}</span></span>
          </div>
        </div>

        {/* Dynamic Re-routing Status */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
           <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-white/60 uppercase font-bold tracking-wider">Dynamic Re-routing</p>
              <Activity className="w-4 h-4 text-emerald-400" />
           </div>
           <p className="text-3xl font-bold mb-2">Active</p>
           <p className="text-sm text-white/60 mb-4">Monitoring traffic, weather, and battery consumption in real-time.</p>
           <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
             <div className="h-full w-full bg-emerald-400 bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]" style={{backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)'}} />
           </div>
        </div>
        
        {/* Cost Estimator */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <p className="text-xs text-white/60 uppercase font-bold tracking-wider mb-4">Trip Cost Estimate</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold">₹{tripStats.distance !== '0 km' ? Math.round(parseFloat(tripStats.distance) * 3.6) : '0'}</span>
            <span className="text-sm text-white/60">Total</span>
          </div>
          <p className="text-sm text-emerald-400 mb-6 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>₹3.6 / km</span>
          </p>
          <div className="text-xs text-white/50 space-y-2">
            <div className="flex justify-between"><span>Distance:</span> <span>{tripStats.distance}</span></div>
            <div className="flex justify-between"><span>ETA:</span> <span>{tripStats.eta}</span></div>
          </div>
        </div>

      </div>

      {/* BOTTOM ROW: AI Prediction Chart & Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* AI Charging Prediction */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">AI Charging Prediction</h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs outline-none">
              {stations.slice(0, 3).map((s) => (
                <option key={s.id}>{s.name}</option>
              ))}
              {stations.length === 0 && <option>Loading...</option>}
            </select>
          </div>
          
          <div className="flex gap-8">
            <div className="flex flex-col items-center justify-center w-32 h-32 relative shrink-0">
              {/* Circular Progress */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="none" stroke="#34d399" strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={nextStation ? 251.2 - (251.2 * (nextStation.available_slots / nextStation.total_slots)) : 251.2 * 0.33}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold">
                  {nextStation ? `${nextStation.available_slots}/${nextStation.total_slots}` : '--'}
                </span>
                <span className="text-[10px] text-white/50 uppercase">Available</span>
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-white/50 uppercase mb-1">Predicted Wait</p>
                <p className="text-xl font-bold">12 min</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-white/50 uppercase mb-1">Best Time</p>
                <p className="text-sm font-bold">10:00 PM - 6:00 AM</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 col-span-2 flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/50 uppercase mb-1">AI Insight</p>
                  <p className="text-sm font-semibold text-yellow-400">High demand expected (6 PM - 9 PM)</p>
                </div>
                <ShieldAlert className="w-5 h-5 text-yellow-400/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Charging Stations List — from real Supabase data */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Nearby Charging Stations</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setStationFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  stationFilter === 'all' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >All</button>
              <button
                onClick={() => setStationFilter('Fast')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  stationFilter === 'Fast' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >Fast</button>
              <button
                onClick={() => setStationFilter('Ultra-Fast')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  stationFilter === 'Ultra-Fast' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >Ultra</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
            {stationsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : filteredStations.length === 0 ? (
              <div className="text-center py-10 text-white/40 text-sm">
                No stations found. Run the schema.sql in Supabase to seed data.
              </div>
            ) : (
              filteredStations.map((station) => (
                <div key={station.id} className="bg-black/30 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-emerald-500/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${station.available_slots === 0 ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                      <Zap className={`w-5 h-5 ${station.available_slots === 0 ? 'text-red-400' : 'text-emerald-400'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{station.name}</p>
                      <div className="flex gap-3 text-xs text-white/50 mt-1">
                        <span>{station.station_type}</span>
                        <span>•</span>
                        <span>{station.power_kw} kW</span>
                        <span>•</span>
                        <span>⭐ {station.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">₹{station.price_per_kwh}/kWh</p>
                    <p className="text-[10px] text-white/50 mt-1 uppercase">
                      {station.available_slots}/{station.total_slots} available
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
