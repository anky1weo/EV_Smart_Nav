import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { DashboardGrid } from '../components/DashboardGrid';
import ChargingStationsPage from '../components/ChargingStationsPage';
import RouteMap from '../components/RouteMap';
import { supabase } from '../lib/supabase';
import { JourneyPlanner } from '../components/JourneyPlanner';
import AIPredictionPage from '../components/AIPredictionPage';
import TripHistoryPage from '../components/TripHistoryPage';
import EmergencyModePage from '../components/EmergencyModePage';
import AnalyticsPage from '../components/AnalyticsPage';
import SettingsPage from '../components/SettingsPage';
import HelpPage from '../components/HelpPage';
export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentBattery, setCurrentBattery] = useState('100'); // Lifted state
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [routeStations, setRouteStations] = useState<any[]>([]);
  const [tripStats, setTripStats] = useState({ distance: '0 km', eta: '0h 0m' });
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleRouteCalculated = async (data: any) => {
    setActiveTab('navigation');
    setIsCalculatingRoute(true);
    try {
      const places = [data.source, ...data.stops, data.destination].filter(Boolean);
      const coords: [number, number][] = [];
      
      for (const place of places) {
        if (place.match(/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/)) {
          const [lat, lng] = place.split(',').map(Number);
          coords.push([lat, lng]);
          continue;
        }
        
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`);
        const result = await response.json();
        if (result && result.length > 0) {
          coords.push([parseFloat(result[0].lat), parseFloat(result[0].lon)]);
        }
      }

      if (coords.length >= 2) {
        const reqBody = {
          source_lat: coords[0][0],
          source_lng: coords[0][1],
          dest_lat: coords[coords.length - 1][0],
          dest_lng: coords[coords.length - 1][1],
          current_battery_pct: parseInt(data.battery) || 100,
          battery_capacity_kwh: 60.0,
          fear_threshold_pct: 15.0
        };

        const aiResponse = await fetch("http://localhost:8000/route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqBody)
        });

        const aiData = await aiResponse.json();

        if (aiData.success) {
          // GeoJSON LineString coordinates are in [lng, lat]
          const routeLatLngs = aiData.route_geojson.coordinates.map((c: number[]) => [c[1], c[0]]);
          setRouteCoordinates(routeLatLngs);
          
          setTripStats({ 
            distance: `${aiData.total_distance_km} km`, 
            eta: `${Math.floor(aiData.total_drive_time_mins / 60)}h ${aiData.total_drive_time_mins % 60}m` 
          });

          const allStations = [];
          if (aiData.pitstops && aiData.pitstops.length > 0) {
            allStations.push(...aiData.pitstops.map((st: any) => ({ ...st, is_pitstop: true })));
          }
          if (aiData.nearby_stations && aiData.nearby_stations.length > 0) {
            allStations.push(...aiData.nearby_stations.map((st: any) => ({ ...st, is_pitstop: false })));
          }
          setRouteStations(allStations);

          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('trips').insert({
              user_id: user.id,
              source_name: data.source,
              destination_name: data.destination,
              source_lat: coords[0][0],
              source_lng: coords[0][1],
              destination_lat: coords[coords.length - 1][0],
              destination_lng: coords[coords.length - 1][1],
              distance_km: aiData.total_distance_km,
              duration_minutes: aiData.total_drive_time_mins,
              battery_start_pct: parseInt(data.battery) || null,
              charging_stops: aiData.pitstops ? aiData.pitstops.length : 0,
              estimated_cost: aiData.total_distance_km * 3.6,
              route_geojson: aiData.route_geojson,
            });
          }
        }
      }
    } catch (error) {
      console.error("Routing error:", error);
      alert("Failed to calculate route. Please try again.");
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isRunning = true;
    let animationFrameId: number;

    const updateOpacity = () => {
      if (!isRunning) return;
      if (video.duration) {
        const t = video.currentTime;
        const d = video.duration;
        let opacity = 0;

        const maxOpacity = 0.55; // Lighter/more visible than intro page
        if (t < 0.5) {
          opacity = (t / 0.5) * maxOpacity;
        } else if (t > d - 0.5) {
          opacity = Math.max(0, (d - t) / 0.5) * maxOpacity;
        } else {
          opacity = maxOpacity;
        }
        video.style.opacity = opacity.toString();
      }
      animationFrameId = requestAnimationFrame(updateOpacity);
    };

    const handleEnded = () => {
      video.style.opacity = '0';
      setTimeout(() => {
        if (!isRunning) return;
        video.currentTime = 0;
        video.play().catch(err => console.log('Replay error:', err));
      }, 100);
    };

    video.addEventListener('ended', handleEnded);
    video.play().catch(err => console.log('Play error:', err));
    animationFrameId = requestAnimationFrame(updateOpacity);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      if (video) {
        video.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  return (
    <div className="min-h-screen text-white flex font-sans overflow-hidden bg-black">
      
      {/* Video Background matching Background_page theme but made lighter */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4"
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
        style={{ opacity: 0, filter: 'brightness(0.65) saturate(0.6)' }}
      />

      {/* Blurred overlay shape to help readability over the video */}
      <div 
        className="fixed w-[984px] h-[527px] opacity-80 bg-gray-950 blur-[82px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
        style={{ contentVisibility: 'auto' }}
      />

      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-col ml-64 h-screen relative z-10">
        
        {/* Top Navigation */}
        <TopBar currentBattery={currentBattery} setCurrentBattery={setCurrentBattery} />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
          
          {/* Header Title based on Tab */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold capitalize tracking-tight mb-2">
                {activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}
              </h1>
              <p className="text-white/60 text-sm">
                AI-powered EV navigation with predictive charging intelligence.
              </p>
            </div>
            
            {activeTab === 'dashboard' && (
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)]">
                Start Navigation
              </button>
            )}
          </div>

          {/* Dynamic Tab Rendering */}
          {activeTab === 'dashboard' && (
            <DashboardGrid 
              currentBattery={currentBattery} 
              routeCoordinates={routeCoordinates} 
              setRouteCoordinates={setRouteCoordinates} 
              tripStats={tripStats} 
              setTripStats={setTripStats} 
              setActiveTab={setActiveTab} 
              onRouteCalculated={handleRouteCalculated}
            />
          )}
          {activeTab === 'stations' && <ChargingStationsPage />}
          
          {activeTab === 'navigation' && (
            <div className="flex flex-col gap-6 w-full h-[calc(100vh-180px)]">
              {/* Horizontal Journey Planner at the top */}
              <div className="w-full shrink-0">
                <JourneyPlanner onRouteCalculated={handleRouteCalculated} currentBattery={currentBattery} layout="horizontal" />
              </div>
              {/* Map and Stations Panel */}
              <div className="flex-1 flex gap-6 w-full overflow-hidden">
                {/* Map taking 75% space */}
                <div className="flex-[3] bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative">
                  <RouteMap routeCoordinates={routeCoordinates} stations={routeStations} />
                  
                  {isCalculatingRoute && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-md z-50 flex flex-col items-center justify-center rounded-3xl transition-all duration-300">
                      <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                      <p className="text-white font-bold text-2xl animate-pulse tracking-wide drop-shadow-lg">Calculating Optimal Route...</p>
                      <p className="text-emerald-400/80 text-sm mt-3 font-medium tracking-wider uppercase drop-shadow-md">AI is analyzing battery drain and pitstops</p>
                    </div>
                  )}
                </div>
                {/* Right panel for Stations taking 25% space */}
                {routeStations.length > 0 && (
                  <div className="flex-[1] bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden flex flex-col">
                    <div className="p-5 bg-black/60 border-b border-white/10 shrink-0 z-10 shadow-sm">
                      <h3 className="text-xl font-semibold text-emerald-400">
                        Stations on Route
                      </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-3">
                      {[...routeStations].sort((a, b) => {
                        if (a.is_pitstop && !b.is_pitstop) return -1;
                        if (!a.is_pitstop && b.is_pitstop) return 1;
                        return (a.distance_from_start_km || 0) - (b.distance_from_start_km || 0);
                      }).map((st, idx) => (
                        <div key={st.id || idx} className={`p-4 rounded-2xl border transition-all ${st.is_pitstop ? 'bg-emerald-900/40 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)] transform scale-[1.02]' : 'bg-white/5 border-white/5 hover:border-emerald-500/50'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-white truncate" title={st.name}>{st.name}</h4>
                            {st.is_pitstop && (
                              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ml-2 shrink-0 animate-pulse">
                                AI Pitstop
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-sm text-white/60 mb-2">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                              {st.power_kw} kW {st.station_type}
                            </span>
                            <span>{st.distance_from_start_km ? `${st.distance_from_start_km} km` : 'Nearby'}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-white/80">Available Slots:</span>
                            <span className={`font-bold ${st.available_slots > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {st.available_slots} / {st.total_slots}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'ai' && <AIPredictionPage />}
          {activeTab === 'history' && <TripHistoryPage />}
          {activeTab === 'emergency' && <EmergencyModePage />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'settings' && <SettingsPage />}
          {activeTab === 'help' && <HelpPage />}

        </main>
      </div>
    </div>
  );
}
