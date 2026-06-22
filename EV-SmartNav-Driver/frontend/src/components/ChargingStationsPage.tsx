import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Zap, Search, Filter, MapPin, Navigation, Loader2, ChevronDown, Star, Clock, ExternalLink } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// ── Icon Setup (matching RouteMap style) ──
const makeChargingIcon = (color: string) => {
  const html = renderToString(
    <div style={{ backgroundColor: color, borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
      <Zap size={18} color="white" fill="white" />
    </div>
  );
  return new L.DivIcon({ html, className: 'custom-charging-icon', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16] });
};

const iconOperational = makeChargingIcon('#22c55e');
const iconFast = makeChargingIcon('#3b82f6');
const iconUltraFast = makeChargingIcon('#a855f7');
const iconOffline = makeChargingIcon('#ef4444');



// ── Types ──
interface OCMStation {
  ID: number;
  AddressInfo: {
    Title: string;
    AddressLine1: string | null;
    AddressLine2: string | null;
    Town: string | null;
    StateOrProvince: string | null;
    Postcode: string | null;
    Latitude: number;
    Longitude: number;
    Distance: number;
    DistanceUnit: number;
    ContactTelephone1: string | null;
  };
  Connections: Array<{
    ConnectionType?: { Title: string };
    Level?: { Title: string; IsFastChargeCapable: boolean };
    PowerKW: number | null;
    CurrentType?: { Title: string };
    Quantity: number | null;
  }>;
  OperatorInfo?: { Title: string; WebsiteURL: string | null };
  UsageType?: { Title: string };
  StatusType?: { IsOperational: boolean; Title: string };
  NumberOfPoints: number | null;
  UsageCost: string | null;
  DateLastVerified: string | null;
}

// ── Map sub-component: fly to position ──
function FlyTo({ position, zoom }: { position: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo(position, zoom, { animate: true, duration: 1.2 }); }, [position, zoom, map]);
  return null;
}

// ── Helpers ──
function getMaxPower(station: OCMStation): number {
  return Math.max(0, ...station.Connections.map(c => c.PowerKW ?? 0));
}

function getStationIcon(station: OCMStation) {
  if (!station.StatusType?.IsOperational) return iconOffline;
  const power = getMaxPower(station);
  if (power >= 50) return iconUltraFast;
  if (power >= 22) return iconFast;
  return iconOperational;
}

function getSpeedLabel(station: OCMStation): string {
  const power = getMaxPower(station);
  if (power >= 50) return 'Ultra-Fast';
  if (power >= 22) return 'Fast';
  if (power > 0) return 'Standard';
  return 'Unknown';
}

function getConnectorTypes(station: OCMStation): string[] {
  return [...new Set(station.Connections.map(c => c.ConnectionType?.Title ?? 'Unknown').filter(Boolean))];
}

const API_KEY = import.meta.env.VITE_OPENCHARGEMAP_API_KEY || '';

// ══════════════════════════════════════════
// ── Main Component ──
// ══════════════════════════════════════════
export default function ChargingStationsPage() {
  const [stations, setStations] = useState<OCMStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]);
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedStation, setSelectedStation] = useState<OCMStation | null>(null);
  const [searchRadius, setSearchRadius] = useState(50);
  const [maxResults, setMaxResults] = useState(100);
  const [speedFilter, setSpeedFilter] = useState<'all' | 'fast' | 'ultra'>('all');
  const [stationFilter, setStationFilter] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSearching, setLocationSearching] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);



  // Fetch stations from Open Charge Map (debounced)
  useEffect(() => {
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => {
      const fetchStations = async () => {
        setLoading(true);
        setError(null);
        try {
          const url = `https://api.openchargemap.io/v3/poi/?output=json&latitude=${mapCenter[0]}&longitude=${mapCenter[1]}&distance=${searchRadius}&distanceunit=KM&maxresults=${maxResults}&key=${API_KEY}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`API error: ${res.status}`);
          const data: OCMStation[] = await res.json();

          if (data.length === 0 && searchRadius < 200) {
            // Auto-expand: no stations in selected radius, try 200 km
            const expandedUrl = `https://api.openchargemap.io/v3/poi/?output=json&latitude=${mapCenter[0]}&longitude=${mapCenter[1]}&distance=200&distanceunit=KM&maxresults=${maxResults}&key=${API_KEY}`;
            const expandedRes = await fetch(expandedUrl);
            if (expandedRes.ok) {
              const expandedData: OCMStation[] = await expandedRes.json();
              setStations(expandedData);
              if (expandedData.length > 0) {
                setError(`No stations within ${searchRadius} km. Showing ${expandedData.length} nearest stations (up to 200 km).`);
              } else {
                setError(`No EV charging stations found near this location in Open Charge Map's database.`);
              }
            }
          } else {
            setStations(data);
          }
        } catch (err: any) {
          setError(err.message || 'Failed to fetch stations');
        } finally {
          setLoading(false);
        }
      };
      if (API_KEY) fetchStations();
      else { setError('Open Charge Map API key missing. Add VITE_OPENCHARGEMAP_API_KEY to .env'); setLoading(false); }
    }, 400);
    return () => { if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current); };
  }, [mapCenter, searchRadius, maxResults]);

  // Location search via Nominatim
  const handleLocationSearch = async () => {
    if (!locationQuery.trim()) return;
    setLocationSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&limit=1&countrycodes=in`);
      const results = await res.json();
      if (results && results.length > 0) {
        const { lat, lon } = results[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setMapZoom(13);
      } else {
        setError(`No location found for "${locationQuery}". Try another city name.`);
      }
    } catch {
      setError('Failed to search location. Check your internet connection.');
    } finally {
      setLocationSearching(false);
    }
  };

  // Filters (filter the already-fetched list by name/operator text)
  const filtered = stations.filter((s) => {
    if (speedFilter === 'fast' && getMaxPower(s) < 22) return false;
    if (speedFilter === 'ultra' && getMaxPower(s) < 50) return false;
    if (stationFilter) {
      const q = stationFilter.toLowerCase();
      const title = s.AddressInfo?.Title?.toLowerCase() || '';
      const addr = s.AddressInfo?.AddressLine1?.toLowerCase() || '';
      const op = s.OperatorInfo?.Title?.toLowerCase() || '';
      if (!title.includes(q) && !addr.includes(q) && !op.includes(q)) return false;
    }
    return true;
  });

  const handleStationClick = (station: OCMStation) => {
    setSelectedStation(station);
    setMapCenter([station.AddressInfo.Latitude, station.AddressInfo.Longitude]);
    setMapZoom(16);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto h-full">

      {/* ── Controls Bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Location Search (geocode to re-center map) */}
        <div className="flex-1 min-w-[220px] relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
          <input
            type="text"
            placeholder="Search city or area (e.g. Delhi, Mumbai, Pune)..."
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleLocationSearch(); }}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-24 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50 transition-colors"
          />
          <button
            onClick={handleLocationSearch}
            disabled={locationSearching}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            {locationSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
            Search
          </button>
        </div>

        {/* Speed Filter */}
        <div className="flex gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
          {(['all', 'fast', 'ultra'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setSpeedFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                speedFilter === f ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {f === 'all' ? 'All' : f === 'fast' ? '⚡ Fast 22kW+' : '🔥 Ultra 50kW+'}
            </button>
          ))}
        </div>

        {/* Radius */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <select
            value={searchRadius}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
            className="bg-transparent text-sm text-white outline-none cursor-pointer"
          >
            <option value={10} className="bg-zinc-900">10 km</option>
            <option value={25} className="bg-zinc-900">25 km</option>
            <option value={50} className="bg-zinc-900">50 km</option>
            <option value={100} className="bg-zinc-900">100 km</option>
            <option value={200} className="bg-zinc-900">200 km</option>
          </select>
        </div>



        {/* Count */}
        <div className="text-xs text-white/40 ml-auto">
          {loading ? 'Loading...' : `${filtered.length} stations found`}
        </div>
      </div>

      {/* ── Main Layout: Map + List ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[600px]">

        {/* ── Map (2/3 width) ── */}
        <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative min-h-[500px]">
          <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} className="z-0">
            <TileLayer attribution='&copy; Google Maps' url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" />
            <FlyTo position={mapCenter} zoom={mapZoom} />



            {/* Station markers */}
            {filtered.map((station) => (
              <Marker
                key={station.ID}
                position={[station.AddressInfo.Latitude, station.AddressInfo.Longitude]}
                icon={getStationIcon(station)}
                eventHandlers={{ click: () => setSelectedStation(station) }}
              >
                <Popup>
                  <div className="text-zinc-900 min-w-[200px]">
                    <p className="font-bold text-sm">{station.AddressInfo.Title}</p>
                    {station.OperatorInfo?.Title && station.OperatorInfo.Title !== '(Unknown Operator)' && (
                      <p className="text-xs text-gray-500">by {station.OperatorInfo.Title}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{station.AddressInfo.AddressLine1}{station.AddressInfo.Town ? `, ${station.AddressInfo.Town}` : ''}</p>
                    <div className="mt-2 space-y-1 text-xs">
                      <p>⚡ {getMaxPower(station) > 0 ? `${getMaxPower(station)} kW` : 'N/A'} • {getSpeedLabel(station)}</p>
                      <p>🔌 {getConnectorTypes(station).join(', ')}</p>
                      <p>📊 {station.NumberOfPoints ?? '?'} charging point(s)</p>
                      <p className={station.StatusType?.IsOperational ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {station.StatusType?.IsOperational ? '✅ Operational' : '❌ Not Operational'}
                      </p>
                      {station.UsageType && <p>🏷️ {station.UsageType.Title}</p>}
                      {station.AddressInfo.Distance > 0 && <p>📏 {station.AddressInfo.Distance.toFixed(1)} km away</p>}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 z-[400] bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <div className="flex items-center gap-3 bg-black/70 px-6 py-3 rounded-full border border-white/10">
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                <span className="text-sm text-white font-medium">Finding charging stations...</span>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-[400] bg-black/70 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl">
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-2">Legend</p>
            <div className="space-y-1.5 text-xs text-white/80">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> Standard</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /> Fast (22kW+)</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500" /> Ultra-Fast (50kW+)</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Offline</div>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-[400] text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg max-w-[90%] text-center ${
              error.includes('No stations within') || error.includes('Showing') ? 'bg-amber-500/90' : 'bg-red-500/90'
            }`}>
              {error}
            </div>
          )}
        </div>

        {/* ── Station List (1/3 width) ── */}
        <div className="xl:col-span-1 bg-white/5 border border-white/10 rounded-3xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              Nearby Stations
            </h3>
            <p className="text-xs text-white/40 mt-1">Real-time data from Open Charge Map</p>
            <div className="relative mt-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                placeholder="Filter by name..."
                value={stationFilter}
                onChange={(e) => setStationFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-white/25 outline-none focus:border-emerald-500/40 transition-colors"
              />
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-white/30 text-sm">
                <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No stations found</p>
                <p className="text-xs mt-1">Try increasing the search radius</p>
              </div>
            ) : (
              filtered.map((station) => {
                const isSelected = selectedStation?.ID === station.ID;
                const power = getMaxPower(station);
                const speedLabel = getSpeedLabel(station);
                const isOnline = station.StatusType?.IsOperational ?? false;

                return (
                  <button
                    key={station.ID}
                    onClick={() => handleStationClick(station)}
                    className={`w-full text-left bg-black/30 border rounded-2xl p-4 transition-all hover:border-emerald-500/40 hover:bg-white/5 cursor-pointer ${
                      isSelected ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20' : 'border-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{station.AddressInfo.Title}</p>
                        {station.OperatorInfo?.Title && station.OperatorInfo.Title !== '(Unknown Operator)' && (
                          <p className="text-xs text-emerald-400/80 mt-0.5">{station.OperatorInfo.Title}</p>
                        )}
                        <p className="text-xs text-white/40 mt-1 truncate">
                          {station.AddressInfo.AddressLine1}{station.AddressInfo.Town ? `, ${station.AddressInfo.Town}` : ''}
                        </p>
                      </div>
                      <div className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {isOnline ? 'ONLINE' : 'OFFLINE'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs text-white/50">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" /> {power > 0 ? `${power} kW` : 'N/A'}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        speedLabel === 'Ultra-Fast' ? 'bg-purple-500/20 text-purple-400' :
                        speedLabel === 'Fast' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-white/10 text-white/50'
                      }`}>
                        {speedLabel}
                      </span>
                      {station.AddressInfo.Distance > 0 && (
                        <span className="ml-auto text-white/40">
                          {station.AddressInfo.Distance.toFixed(1)} km
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {getConnectorTypes(station).map((ct) => (
                        <span key={ct} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] text-white/60">
                          {ct}
                        </span>
                      ))}
                    </div>

                    {station.UsageType && (
                      <p className="text-[10px] text-white/30 mt-2">🏷️ {station.UsageType.Title}</p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
