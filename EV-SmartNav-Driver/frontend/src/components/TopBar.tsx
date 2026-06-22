import React, { useState } from 'react';
import { Search, Bell, Battery, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface TopBarProps {
  currentBattery: string;
  setCurrentBattery: (val: string) => void;
}

export function TopBar({ currentBattery, setCurrentBattery }: TopBarProps) {
  const navigate = useNavigate();
  const { profile, vehicle, signOut } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Use the shared battery state for global UI
  const batteryPct = parseInt(currentBattery) || 0;
  const maxRange = vehicle?.total_range_km || (vehicle?.battery_capacity_kwh ? vehicle.battery_capacity_kwh * 5 : 300);
  const estimatedRange = Math.round(maxRange * (batteryPct / 100));

  return (
    <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-30">
      
      {/* Battery Input replacing Search Bar */}
      <div className="relative w-80 flex items-center gap-3">
        <label className="text-sm font-semibold text-white/70 whitespace-nowrap">Current Battery (%)</label>
        <div className="relative flex-1">
          <Battery className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
          <input 
            type="number" 
            placeholder="e.g. 80"
            value={currentBattery}
            onChange={(e) => setCurrentBattery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Global Battery Status */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5">
            <Battery className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">{batteryPct}%</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-xs text-white/60 font-medium">{estimatedRange} km</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${isNotificationsOpen ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'}`}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border border-black animate-pulse" />
          </button>

          {/* Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-[#161925] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                <h3 className="font-bold text-white">Notifications</h3>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                
                <div className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">Route Optimized</p>
                      <p className="text-xs text-white/60 mt-1">Your daily commute route has been updated. You will save 4% more battery today.</p>
                      <p className="text-[10px] text-white/40 mt-2 font-medium">10 mins ago</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">Eco Points Awarded! 🎉</p>
                      <p className="text-xs text-white/60 mt-1">You earned 50 Eco Points for completing your last trip efficiently.</p>
                      <p className="text-[10px] text-white/40 mt-2 font-medium">2 hours ago</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">New Station Alert</p>
                      <p className="text-xs text-white/60 mt-1">A new 150kW Ultra-Fast charger just opened 5km from your location.</p>
                      <p className="text-[10px] text-white/40 mt-2 font-medium">Yesterday</p>
                    </div>
                  </div>
                </div>

              </div>
              <div className="p-3 bg-black/40 text-center border-t border-white/5">
                <button className="text-xs font-semibold text-white/50 hover:text-white transition-colors">Mark all as read</button>
              </div>
            </div>
          )}
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/20 transition-colors group"
        >
          <LogOut className="w-4 h-4 text-white/60 group-hover:text-red-400 transition-colors" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-white/10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden border border-white/10">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-white leading-tight">
              {profile?.full_name || 'EV Driver'}
            </p>
            <p className="text-[11px] text-emerald-400 font-medium capitalize">
              {profile?.role === 'gov' ? 'Government User' : profile?.role === 'operator' ? 'Station Operator' : 'Premium Member'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
