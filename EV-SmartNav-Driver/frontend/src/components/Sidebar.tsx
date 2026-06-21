import React from 'react';
import { 
  LayoutDashboard, Navigation, Zap, BrainCircuit, 
  History, BarChart3, Settings, HelpCircle, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  const { profile } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'navigation', label: 'Route Planner', icon: Navigation },
    { id: 'stations', label: 'Charging Stations', icon: Zap },
    { id: 'ai', label: 'AI Prediction', icon: BrainCircuit },
    { id: 'history', label: 'Trip History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'emergency', label: 'Emergency Mode', icon: ShieldAlert },
  ];

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  const ecoPoints = profile?.eco_points ?? 0;

  return (
    <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="p-6 flex items-center gap-3">
        <img 
          src="/logo.png" 
          alt="EV SmartNav Logo" 
          className="h-16 w-auto object-contain rounded-lg scale-125 origin-left" 
        />
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}

        {/* Eco Points Widget in Sidebar */}
        <div className="mt-8 mx-2 p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/20">
          <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-1">Eco Points</p>
          <p className="text-2xl font-bold text-white">{ecoPoints.toLocaleString()}</p>
          <p className="text-xs text-emerald-400/80 mt-1">
            {ecoPoints === 0 ? 'Start driving to earn' : `+${Math.min(ecoPoints, 120)} this week`}
          </p>
        </div>
      </nav>

      <div className="p-4 border-t border-white/5 space-y-1.5">
        {bottomItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
