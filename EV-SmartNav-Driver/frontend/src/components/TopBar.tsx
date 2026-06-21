import React from 'react';
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Use the shared battery state for global UI
  const batteryPct = parseInt(currentBattery) || 0;
  const estimatedRange = vehicle?.battery_capacity_kwh
    ? Math.round((vehicle.battery_capacity_kwh * (batteryPct / 100)) * 5)
    : Math.round(60 * (batteryPct / 100) * 5);

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
        <button className="relative w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <Bell className="w-4 h-4 text-white/80" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border border-black" />
        </button>

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
