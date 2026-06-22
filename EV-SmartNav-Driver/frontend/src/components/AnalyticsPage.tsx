import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, Leaf, Banknote, Zap, BatteryCharging, Gauge, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const [totalKm, setTotalKm] = useState(0);
  const [totalTrips, setTotalTrips] = useState(0);
  
  // Calculate stats based on real trips if available, otherwise mock a baseline
  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('trips').select('distance_km').eq('user_id', user.id);
        if (data && data.length > 0) {
          const sum = data.reduce((acc, trip) => acc + (trip.distance_km || 0), 0);
          setTotalKm(Math.round(sum));
          setTotalTrips(data.length);
        }
      }
    };
    fetchStats();
  }, []);

  // Assumptions for calculations
  const displayKm = totalKm > 0 ? totalKm : 4250; // Use mock if no trips yet
  const petrolCostPerKm = 10; // ₹10 per km for petrol
  const evCostPerKm = 2; // ₹2 per km for EV
  const moneySaved = displayKm * (petrolCostPerKm - evCostPerKm);
  const co2SavedKg = Math.round(displayKm * 0.192); // 192g CO2 per km for average petrol car

  // Mock bar chart data
  const monthlyData = [
    { month: 'Jan', km: 850, height: '60%' },
    { month: 'Feb', km: 620, height: '45%' },
    { month: 'Mar', km: 1100, height: '80%' },
    { month: 'Apr', km: 940, height: '65%' },
    { month: 'May', km: 1450, height: '100%' },
    { month: 'Jun', km: displayKm > 0 ? displayKm : 1200, height: '85%' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar pr-2 pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-emerald-400" />
            Driving Analytics
          </h2>
          <p className="text-white/60">Your lifetime environmental impact, savings, and charging behavior.</p>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-900/40 to-[#0f111a] border border-emerald-500/20 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="flex items-center gap-3 mb-2">
            <Banknote className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white/80">Money Saved</h3>
          </div>
          <div className="text-4xl font-black text-white mt-4">₹{moneySaved.toLocaleString()}</div>
          <p className="text-sm text-emerald-400 mt-2 font-medium flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> vs. Petrol Vehicles
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-900/40 to-[#0f111a] border border-blue-500/20 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="flex items-center gap-3 mb-2">
            <Leaf className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white/80">CO₂ Prevented</h3>
          </div>
          <div className="text-4xl font-black text-white mt-4">{co2SavedKg.toLocaleString()} <span className="text-xl text-white/50">kg</span></div>
          <p className="text-sm text-blue-400 mt-2 font-medium">Equivalent to planting 12 trees</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 to-[#0f111a] border border-purple-500/20 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="flex items-center gap-3 mb-2">
            <Gauge className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white/80">Lifetime Distance</h3>
          </div>
          <div className="text-4xl font-black text-white mt-4">{displayKm.toLocaleString()} <span className="text-xl text-white/50">km</span></div>
          <p className="text-sm text-purple-400 mt-2 font-medium">Across {totalTrips > 0 ? totalTrips : 14} total trips</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        
        {/* Left Column: Chart */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
          <h3 className="text-xl font-bold text-white mb-8">Monthly Distance Driven</h3>
          
          {/* Custom CSS Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-4 mt-8 pb-2 border-b border-white/10">
            {monthlyData.map((data) => (
              <div key={data.month} className="flex flex-col items-center flex-1 group">
                <div className="w-full flex justify-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold bg-white text-black px-2 py-1 rounded-lg">{data.km}km</span>
                </div>
                <div 
                  className="w-full max-w-[48px] bg-emerald-500/20 group-hover:bg-emerald-500 transition-all duration-500 rounded-t-xl relative overflow-hidden"
                  style={{ height: data.height }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/50 to-transparent" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm font-semibold text-white/50 px-2">
            {monthlyData.map(d => <span key={d.month}>{d.month}</span>)}
          </div>
        </div>

        {/* Right Column: Charging & Eco Score */}
        <div className="flex flex-col gap-6">
          
          {/* Charging Habits */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-yellow-500/20 text-yellow-400 rounded-xl">
                <BatteryCharging className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Charging Habits</h3>
            </div>
            
            <div className="flex justify-between items-end mb-3">
              <span className="text-white font-medium">Fast Charging (DC)</span>
              <span className="text-2xl font-bold text-white">72%</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-yellow-400 w-[72%] rounded-full" />
            </div>

            <div className="flex justify-between items-end mb-3">
              <span className="text-white font-medium">Slow Charging (AC)</span>
              <span className="text-2xl font-bold text-white">28%</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-blue-400 w-[28%] rounded-full" />
            </div>

            <div className="pt-6 border-t border-white/10 mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/50 mb-1">Avg. Cost / kWh</p>
                <p className="text-xl font-bold text-white">₹18.40</p>
              </div>
              <div>
                <p className="text-sm text-white/50 mb-1">Total Plug-ins</p>
                <p className="text-xl font-bold text-white">47</p>
              </div>
            </div>
          </div>

          {/* Eco Score */}
          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-3xl p-6 backdrop-blur-md flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                Driver Eco-Score
              </h3>
              <p className="text-sm text-emerald-100/70">Top 15% most efficient drivers</p>
            </div>
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <span className="text-2xl font-black text-emerald-400">92</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
