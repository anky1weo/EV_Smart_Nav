import React, { useState } from 'react';
import { Activity, BrainCircuit, Wind, ThermometerSun, Navigation2, Zap, AlertTriangle, TrendingDown, Gauge } from 'lucide-react';

export default function AIPredictionPage() {
  const [speed, setSpeed] = useState(80);

  // Simple mock simulation calculations
  const baseRange = 400; // km
  const speedPenalty = (speed - 60) * 1.5; // lose 1.5km per km/h over 60
  const predictedRange = Math.max(100, Math.round(baseRange - speedPenalty));
  const efficiency = Math.round((predictedRange / baseRange) * 100);

  return (
    <div className="flex flex-col gap-6 w-full h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar pr-2 pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-emerald-400" />
            AI Prediction Engine
          </h2>
          <p className="text-white/60">Real-time telemetry and predictive modeling for your EV battery.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 font-bold text-sm tracking-wide uppercase">Model Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* Main Stats */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">Prediction Accuracy</h3>
              </div>
              <div className="text-4xl font-black text-white mb-1">96.8<span className="text-xl text-white/50">%</span></div>
              <p className="text-sm text-emerald-400 font-medium">± 2.4 km margin of error</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">Live Data Points</h3>
              </div>
              <div className="text-4xl font-black text-white mb-1">1.2M+</div>
              <p className="text-sm text-purple-400 font-medium">Telemetry points analyzed</p>
            </div>
          </div>

          {/* Interactive Simulation */}
          <div className="bg-gradient-to-br from-[#161925] to-[#0f111a] border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-emerald-400" />
                  Speed vs. Range Simulator
                </h3>
                <p className="text-white/50 text-sm mt-1">See how driving speed impacts AI predictions.</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-emerald-400">{predictedRange} <span className="text-lg text-emerald-400/50">km</span></div>
                <div className="text-sm text-white/50 font-medium uppercase tracking-wider">Predicted Range</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm text-white/60 font-medium mb-4">
                <span>40 km/h</span>
                <span className="text-white text-lg font-bold">{speed} km/h</span>
                <span>140 km/h</span>
              </div>
              <input 
                type="range" 
                min="40" 
                max="140" 
                value={speed} 
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
              />
            </div>

            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden mt-8 flex">
              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${efficiency}%` }} />
              <div className="h-full bg-red-500/50 transition-all duration-300" style={{ width: `${100 - efficiency}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs font-bold uppercase tracking-wider">
              <span className="text-emerald-500">Efficiency Preserved</span>
              <span className="text-red-400">Drag Loss</span>
            </div>
          </div>
        </div>

        {/* Neural Network Factors */}
        <div className="flex flex-col gap-4">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-6">Neural Network Weights</h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <ThermometerSun className="w-4 h-4 text-orange-400" />
                    Weather & Temp
                  </div>
                  <span className="text-sm font-bold text-orange-400">High Impact</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-400 h-full w-[85%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Navigation2 className="w-4 h-4 text-blue-400" />
                    Topography (Hills)
                  </div>
                  <span className="text-sm font-bold text-blue-400">Critical</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-400 h-full w-[92%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    Aerodynamic Drag
                  </div>
                  <span className="text-sm font-bold text-cyan-400">Medium</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full w-[60%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    Traffic Congestion
                  </div>
                  <span className="text-sm font-bold text-yellow-400">Variable</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-yellow-400 h-full w-[45%]" />
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <h4 className="text-emerald-400 font-bold flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4" /> AI Insight
              </h4>
              <p className="text-sm text-white/70 leading-relaxed">
                The model predicts that driving in heavy stop-and-go traffic actually <strong className="text-white">increases</strong> your range by 12% due to continuous regenerative braking.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
