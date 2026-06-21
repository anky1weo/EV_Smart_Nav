import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Zap } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import type { ChargingStation } from '../lib/supabase';

// Fix leaflet default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon for Waypoints/Stops
const StopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom Red Lightning Bolt icon for Charging Stations
const ChargingIconHtml = renderToString(
  <div style={{ backgroundColor: '#ef4444', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
    <Zap size={16} color="white" fill="white" />
  </div>
);

// Green icon for available stations
const AvailableChargingIconHtml = renderToString(
  <div style={{ backgroundColor: '#22c55e', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
    <Zap size={16} color="white" fill="white" />
  </div>
);

const ChargingStationIcon = new L.DivIcon({
  html: ChargingIconHtml,
  className: 'custom-charging-icon',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

const AvailableStationIcon = new L.DivIcon({
  html: AvailableChargingIconHtml,
  className: 'custom-charging-icon',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

// Component to handle flying to user's location
function LocationMarker({ position }: { position: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, 13, { animate: true, duration: 1.5 });
    }
  }, [map, position]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <div className="text-zinc-900">
          <p className="font-bold">You are here</p>
          <p className="text-xs">Live Geolocation</p>
        </div>
      </Popup>
    </Marker>
  );
}

// Component to fit bounds around the entire route
function RouteBounds({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
    }
  }, [coordinates, map]);
  return null;
}

interface RouteMapProps {
  routeCoordinates?: [number, number][];
  stations?: ChargingStation[];
}

export default function RouteMap({ routeCoordinates = [], stations = [] }: RouteMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setErrorMsg('Unable to retrieve your location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Bhopal coordinates as default
  const defaultCenter: [number, number] = [23.2599, 77.4126]; 

  const routeStart = routeCoordinates.length > 0 ? routeCoordinates[0] : null;
  const routeEnd = routeCoordinates.length > 0 ? routeCoordinates[routeCoordinates.length - 1] : null;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative z-10">
      {errorMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-red-500/90 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
          {errorMsg}
        </div>
      )}
      
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        {/* Google Maps Tiles */}
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />

        {/* Real Charging Stations from Supabase */}
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            icon={station.available_slots > 0 ? AvailableStationIcon : ChargingStationIcon}
          >
            <Popup>
              <div className="text-zinc-900 min-w-[180px]">
                <p className="font-bold text-sm">{station.name}</p>
                <p className="text-xs text-gray-500 mt-1">{station.address}</p>
                <div className="mt-2 space-y-1 text-xs">
                  <p>⚡ {station.power_kw} kW • {station.station_type}</p>
                  <p>🔌 {station.connector_types?.join(', ')}</p>
                  <p className={station.available_slots > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {station.available_slots}/{station.total_slots} slots available
                  </p>
                  <p>💰 ₹{station.price_per_kwh}/kWh • ⭐ {station.rating}</p>
                  {station.operator_name && <p className="text-gray-400">by {station.operator_name}</p>}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Draw the Route Line */}
        {routeCoordinates.length > 0 && (
          <>
            <Polyline 
              positions={routeCoordinates} 
              pathOptions={{ color: '#3b82f6', weight: 6, opacity: 0.8 }} 
            />
            <RouteBounds coordinates={routeCoordinates} />
            
            {routeStart && (
              <Marker position={routeStart}>
                <Popup>Source</Popup>
              </Marker>
            )}
            
            {routeEnd && (
              <Marker position={routeEnd} icon={StopIcon}>
                <Popup>Destination</Popup>
              </Marker>
            )}
          </>
        )}

        {/* Show live user position if no route is active */}
        {routeCoordinates.length === 0 && position ? (
          <LocationMarker position={position} />
        ) : routeCoordinates.length === 0 ? (
          <Marker position={defaultCenter}>
            <Popup>Bhopal Default</Popup>
          </Marker>
        ) : null}
      </MapContainer>
    </div>
  );
}
