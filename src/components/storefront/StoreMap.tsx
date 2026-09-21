"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Phone, MapPin } from "lucide-react";

// Fix Leaflet's default icon issue with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Store {
  id: number;
  name: string;
  address: string;
  phone?: string;
  lat: number;
  lng: number;
}

// Component to handle map zooming/panning when a store is selected
function MapController({ selectedStore, stores }: { selectedStore: Store | null, stores: Store[] }) {
  const map = useMap();

  useEffect(() => {
    if (selectedStore) {
      // Fly to the selected store
      map.flyTo([selectedStore.lat, selectedStore.lng], 15, { duration: 1.5 });
    } else {
      // Fit bounds to show all stores
      if (stores.length > 0) {
        const bounds = L.latLngBounds(stores.map(s => [s.lat, s.lng]));
        map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
      }
    }
  }, [selectedStore, stores, map]);

  return null;
}

export default function StoreMap({ stores, selectedStore }: { stores: Store[], selectedStore: Store | null }) {
  return (
    <div className="w-full h-full min-h-[400px] md:min-h-[600px] rounded-2xl overflow-hidden shadow-lg border border-border relative z-0">
      <MapContainer 
        center={[11.1457203, 75.9643753]} // Default center
        zoom={10} 
        scrollWheelZoom={true}
        className="w-full h-full absolute inset-0 z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {stores.map((store) => (
          <Marker key={store.id} position={[store.lat, store.lng]} icon={redIcon}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-[14px] text-gray-900 mb-1">{store.name}</h3>
                <p className="text-gray-600 text-xs mb-2 leading-tight">{store.address}</p>
                {store.phone && (
                  <p className="text-accent font-mono text-xs font-bold">{store.phone}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        <MapController selectedStore={selectedStore} stores={stores} />
      </MapContainer>
    </div>
  );
}
