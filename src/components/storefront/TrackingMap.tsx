"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Info } from "lucide-react";

// Fix default Leaflet icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Origin marker (Bangalore)
const originIcon = L.divIcon({
  className: "custom-map-pin",
  html: `<div style="width: 14px; height: 14px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.4);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Destination marker (Kochi)
const destIcon = L.divIcon({
  className: "custom-map-pin",
  html: `<div style="width: 18px; height: 18px; background: #ef4444; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(239,68,68,0.5);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Active truck marker
const truckIcon = L.divIcon({
  className: "custom-truck-pin",
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
      <div style="position: absolute; inset: 0; background: rgba(34, 197, 94, 0.35); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 36px; height: 36px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(34,197,94,0.6); border: 2px solid white;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
          <path d="M15 18H9"/>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
          <circle cx="17" cy="18" r="2"/>
          <circle cx="7" cy="18" r="2"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -20],
});

interface TrackingMapProps {
  currentHub?: string;
  status?: string;
  timestamp?: string;
}

export default function TrackingMap({
  currentHub = "Kochi Hub",
  status = "In Transit",
  timestamp = "27 Sep, 06:20 PM",
}: TrackingMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bangalore -> Coimbatore -> Kochi coordinates
  const bangaloreCoords: [number, number] = [12.9716, 77.5946];
  const coimbatoreCoords: [number, number] = [11.0168, 76.9558];
  const currentTruckCoords: [number, number] = [10.0889, 76.3533]; // Approaching Kochi Hub (Aluva / Kalamassery)
  const kochiCoords: [number, number] = [9.9312, 76.2673];

  const routePolyline: [number, number][] = [
    bangaloreCoords,
    [12.5204, 77.0382],
    [11.6643, 77.1065],
    coimbatoreCoords,
    [10.7867, 76.6548], // Palakkad
    [10.5276, 76.2144], // Thrissur
    currentTruckCoords,
    kochiCoords,
  ];

  if (!mounted) {
    return (
      <div className="w-full h-[320px] rounded-2xl bg-[#f0f3f6] dark:bg-[#1a1a18] animate-pulse flex items-center justify-center border border-border">
        <span className="text-text-muted text-sm font-medium">Loading live map updates...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col rounded-2xl overflow-hidden border border-[#e5e7eb] dark:border-[#2a2a28] bg-white dark:bg-[#161614] shadow-sm">
      {/* Map view container */}
      <div className="relative w-full h-[320px] z-0 overflow-hidden">
        <MapContainer
          center={[11.2, 76.8]}
          zoom={7}
          scrollWheelZoom={false}
          zoomControl={false}
          className="w-full h-full z-0"
        >
          {/* Custom position zoom control */}
          <ZoomControl position="bottomright" />

          {/* OpenStreetMap / CartoDB light style for crystal clear road map readability */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Connected route line */}
          <Polyline
            positions={routePolyline}
            pathOptions={{
              color: "#2563eb",
              weight: 4,
              opacity: 0.85,
              dashArray: "1, 0",
              lineJoin: "round",
            }}
          />

          {/* Origin Marker */}
          <Marker position={bangaloreCoords} icon={originIcon}>
            <Tooltip direction="top" offset={[0, -10]} permanent>
              <span className="font-semibold text-xs text-gray-800">Bangalore</span>
            </Tooltip>
          </Marker>

          {/* Destination Marker */}
          <Marker position={kochiCoords} icon={destIcon}>
            <Tooltip direction="bottom" offset={[0, 10]} permanent>
              <span className="font-semibold text-xs text-gray-800">Kochi</span>
            </Tooltip>
          </Marker>

          {/* Active Truck Marker with Callout Card */}
          <Marker position={currentTruckCoords} icon={truckIcon}>
            <Tooltip
              direction="top"
              offset={[0, -24]}
              permanent
              className="tracking-hub-tooltip"
            >
              <div className="bg-white text-gray-900 rounded-lg p-2.5 shadow-xl border border-gray-200 text-left min-w-[130px]">
                <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider leading-none mb-1">
                  {status}
                </div>
                <div className="text-sm font-bold text-gray-900 leading-snug">
                  {currentHub}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {timestamp}
                </div>
              </div>
            </Tooltip>
          </Marker>
        </MapContainer>
      </div>

      {/* Map Disclaimer Banner matching reference image */}
      <div className="p-3.5 bg-[#f0f7ff] dark:bg-[#1a2230] border-t border-[#e2e8f0] dark:border-[#223048] flex items-start gap-2.5 text-xs text-[#2563eb] dark:text-[#60a5fa] leading-relaxed">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#3b82f6]" />
        <span>
          The live location is an estimated route based on courier updates. Exact real-time vehicle location may not be available for all shipments.
        </span>
      </div>
    </div>
  );
}
