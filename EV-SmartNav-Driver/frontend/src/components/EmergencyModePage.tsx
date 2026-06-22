import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, MapPin, ShieldAlert, Wind, ZapOff, BatteryWarning, Wrench, XCircle } from 'lucide-react';

export default function EmergencyModePage() {
  const [sosActive, setSosActive] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar pr-2 pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-3xl font-bold text-red-500 mb-2 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8" />
            Emergency Mode
          </h2>
          <p className="text-white/60">Critical tools for low-battery or vehicle breakdown situations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          
          {/* Huge SOS Button */}
          <div className={`border rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden ${
            sosActive 
              ? 'bg-red-600/20 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]' 
              : 'bg-gradient-to-br from-[#161925] to-[#0f111a] border-red-500/20 hover:border-red-500/50'
          }`}>
            {sosActive && (
              <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />
            )}
            
            <button 
              onClick={() => setSosActive(!sosActive)}
              className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all duration-300 shadow-2xl ${
                sosActive 
                  ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.8)] scale-110' 
                  : 'bg-red-500/10 border-4 border-red-500/30 text-red-500 hover:bg-red-500/20 hover:border-red-500/50'
              }`}
            >
              <AlertTriangle className={`w-12 h-12 ${sosActive ? 'animate-bounce' : ''}`} />
            </button>

            <h3 className={`text-2xl font-bold mb-2 ${sosActive ? 'text-white' : 'text-red-400'}`}>
              {sosActive ? 'SOS TRANSMITTING' : 'ACTIVATE SOS'}
            </h3>
            <p className="text-white/60 text-sm max-w-sm">
              {sosActive 
                ? 'Your GPS coordinates are being broadcasted to nearby emergency services and tow trucks.' 
                : 'Tap to instantly share your live location with emergency services and roadside assistance.'}
            </p>

            {sosActive && (
              <button 
                onClick={() => setSosActive(false)}
                className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Cancel SOS
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 transition-colors p-6 rounded-3xl flex flex-col items-center justify-center gap-3 text-center group">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-white mb-1">Closest Charger</div>
                <div className="text-xs text-white/50">Ignores preferences</div>
              </div>
            </button>

            <button className="bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-colors p-6 rounded-3xl flex flex-col items-center justify-center gap-3 text-center group">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-white mb-1">Tow Truck</div>
                <div className="text-xs text-white/50">Dispatch immediately</div>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column - Battery Preservation Guide */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-yellow-500/20 text-yellow-400 rounded-xl">
              <BatteryWarning className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Critical Battery Guide</h3>
              <p className="text-sm text-yellow-400">Follow these steps immediately to maximize remaining range.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
              <div className="mt-1 text-red-400">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">1. Turn off AC/Heater</h4>
                <p className="text-sm text-white/60">Climate control consumes massive battery power. Turn it off completely to instantly gain 10-15% range.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
              <div className="mt-1 text-emerald-400">
                <ZapOff className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">2. Limit Speed to 60 km/h</h4>
                <p className="text-sm text-white/60">Aerodynamic drag squares with speed. Driving at 60 km/h instead of 100 km/h drastically reduces battery drain.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
              <div className="mt-1 text-blue-400">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">3. Avoid Hard Braking</h4>
                <p className="text-sm text-white/60">Use regenerative braking by slowly lifting off the accelerator instead of using the brake pedal.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <h4 className="text-red-400 font-bold flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" /> Warning
            </h4>
            <p className="text-sm text-white/70 leading-relaxed">
              If your battery drops below 2%, pull over to a safe location immediately. The car may shut down the drivetrain without further warning to protect the battery cells from permanent damage.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
