import React, { useState } from 'react';
import { MapPin, Navigation, Battery, Zap, Plus, X, Route as RouteIcon } from 'lucide-react';

interface JourneyPlannerProps {
  onRouteCalculated: (routeData: any) => void;
  currentBattery: string;
  layout?: 'vertical' | 'horizontal';
}

export function JourneyPlanner({ onRouteCalculated, currentBattery, layout = 'vertical' }: JourneyPlannerProps) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [stops, setStops] = useState<string[]>([]);
  const [connector, setConnector] = useState('Type 2');
  const [isCalculating, setIsCalculating] = useState(false);

  const handleAddStop = () => {
    setStops([...stops, '']);
  };

  const handleRemoveStop = (index: number) => {
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
  };

  const handleStopChange = (index: number, value: string) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setSource(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      });
    }
  };

  const calculateRoute = async () => {
    setIsCalculating(true);
    try {
      await onRouteCalculated({
        source,
        destination,
        stops,
        battery: currentBattery,
        connector,
        distance: 0, 
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className={`bg-[#0f111a] border border-white/10 ${layout === 'horizontal' ? 'rounded-2xl p-4' : 'rounded-3xl p-6'} relative overflow-hidden`}>
      {layout === 'vertical' && (
        <div className="flex items-center gap-2 mb-6">
          <RouteIcon className="w-5 h-5 text-white" />
          <h2 className="text-xl font-bold text-white tracking-tight">Journey Details</h2>
        </div>
      )}

      <div className={layout === 'horizontal' ? "flex items-end gap-4 overflow-x-auto scrollbar-hide pb-2" : "space-y-5"}>
        
        {/* Current Location */}
        <div className={layout === 'horizontal' ? "flex-1 min-w-[200px]" : ""}>
          <div className="flex items-center justify-between mb-2">
            <label className={layout === 'horizontal' ? "text-xs font-semibold text-white/70" : "text-sm font-semibold text-white/70"}>Current Location</label>
            {layout === 'vertical' && (
              <button 
                onClick={handleUseMyLocation}
                className="text-xs font-bold text-emerald-400 flex items-center gap-1 hover:text-emerald-300 transition-colors"
              >
                <Navigation className="w-3 h-3" />
                Use My Location
              </button>
            )}
          </div>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="e.g. Indore, MP or Lat, Lng" 
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-[#161925] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Dynamic Stops */}
        {stops.map((stop, index) => (
          <div key={index} className={layout === 'horizontal' ? "flex-1 min-w-[200px]" : "relative"}>
            <label className={`${layout === 'horizontal' ? "text-xs" : "text-sm"} font-semibold text-white/70 block mb-2`}>Stop {index + 1}</label>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="text" 
                  placeholder="e.g. Charging Station A" 
                  value={stop}
                  onChange={(e) => handleStopChange(index, e.target.value)}
                  className="w-full bg-[#161925] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                />
              </div>
              <button 
                onClick={() => handleRemoveStop(index)}
                className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Add Stop Button */}
        {layout === 'vertical' && (
          <button 
            onClick={handleAddStop}
            className="text-xs font-bold text-emerald-400 flex items-center gap-1 hover:text-emerald-300 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Stop
          </button>
        )}

        {/* Destination */}
        <div className={layout === 'horizontal' ? "flex-1 min-w-[200px]" : ""}>
          <div className="flex items-center justify-between mb-2">
            <label className={`${layout === 'horizontal' ? "text-xs" : "text-sm"} font-semibold text-white/70 block`}>Destination</label>
            {layout === 'horizontal' && (
              <button 
                onClick={handleAddStop}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                + Add Stop
              </button>
            )}
          </div>
          <div className="relative">
            <RouteIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="e.g. Los Angeles, CA" 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-[#161925] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Connector Type */}
        <div className={layout === 'horizontal' ? "w-32 min-w-[128px]" : ""}>
          <label className={`${layout === 'horizontal' ? "text-xs" : "text-sm"} font-semibold text-white/70 block mb-2`}>Connector</label>
          <div className="relative">
            <Zap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 z-10" />
            <select 
              value={connector}
              onChange={(e) => setConnector(e.target.value)}
              className="w-full bg-[#161925] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all text-sm appearance-none relative z-0"
            >
              <option>Type 2</option>
              <option>CCS2</option>
              <option>CHAdeMO</option>
              <option>Tesla Supercharger</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          onClick={calculateRoute}
          disabled={isCalculating || !source || !destination}
          className={`${layout === 'horizontal' ? 'px-6 py-3 shrink-0' : 'w-full py-3.5 mt-4'} bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2`}
        >
          {isCalculating ? (
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Generate AI Recommendation
            </>
          )}
        </button>

      </div>
    </div>
  );
}
