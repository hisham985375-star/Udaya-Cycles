"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Search, MapPin, Phone, Star } from "lucide-react";

// Dynamically import the map component with SSR disabled
const StoreMap = dynamic(() => import("./StoreMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] md:min-h-[600px] rounded-2xl bg-surface border border-border flex items-center justify-center">
      <div className="text-text-muted animate-pulse font-mono tracking-widest uppercase">Loading Map...</div>
    </div>
  )
});

interface Store {
  id: number;
  name: string;
  address: string;
  phone?: string;
  lat: number;
  lng: number;
  isPrimary?: boolean;
}

const STORES: Store[] = [
  {
    id: 1,
    name: "Udaya Cycles",
    address: "Kuruppath, Kondotty Bypass Rd, Kondotty, Keralam 673638",
    phone: "09961321144",
    lat: 11.1457203,
    lng: 75.9643753,
    isPrimary: true,
  },
  {
    id: 2,
    name: "Udaya Cycles Chelari",
    address: "Panakkad, Chelari, Moonniyur, Kerala 676317",
    phone: "80892 23394",
    lat: 11.1117844,
    lng: 75.8900722
  },
  {
    id: 3,
    name: "UDAYA CYCLES PACE",
    address: "53R7+MQ3, Kavanur, Kerala 673639",
    lat: 11.1968101,
    lng: 76.0714901
  },
  {
    id: 4,
    name: "Udaya Cycle Traders",
    address: "Vengara - Chankuvetti Rd, Vettuthodu, Vengara, Kerala 676304",
    phone: "9847886655",
    lat: 11.0515646,
    lng: 75.9857052
  },
  {
    id: 5,
    name: "Udaya Cycle Bazar",
    address: "X6F7+XMQ, Pallippuram, Angadipuram, Kerala 679322",
    lat: 10.9771438,
    lng: 76.2017172
  },
  {
    id: 6,
    name: "UDAYA CYCLE MARKET",
    address: "Kallingal - Manjachola Rd, Puthanathani, Kerala 676551",
    phone: "8156987595",
    lat: 10.9379100,
    lng: 76.0046211
  },
  {
    id: 7,
    name: "Udaya cycles & toys - Muvattupuzha",
    address: "S Valavu, Pezhakkappilly, Muvattupuzha, Kerala 686673",
    phone: "8891022959",
    lat: 10.0198565,
    lng: 76.5616964
  },
  {
    id: 8,
    name: "Udaya Cycle",
    address: "Near fousiya crane service, Nedumthode, Perumbavoor, Marampally, pallikavala 683547",
    phone: "8891022959",
    lat: 10.1147548,
    lng: 76.4778152
  },
  {
    id: 9,
    name: "Udaya cycle riders",
    address: "Udaya cycle State Highway 73, Oravampuram, Pandikkad, Kerala 676521",
    phone: "9447383645",
    lat: 11.1187490,
    lng: 76.2307744
  },
  {
    id: 10,
    name: "Udaya cycle mart",
    address: "4XW8+96C, Thangals Rd, Kondotty, Kerala 673638",
    phone: "04832712554",
    lat: 11.1457203,
    lng: 75.9643753
  },
  {
    id: 11,
    name: "Udaya cycle",
    address: "A17, Kozhikode - Palakkad Hwy, Poovannur Palli, Ramanattukara, Kozhikode, Kerala 673633",
    phone: "9847116583",
    lat: 11.1780876,
    lng: 75.8656196
  },
  {
    id: 12,
    name: "UDAYA cycle Bright",
    address: "W4RX+F58, Kolathur - Malappuram Rd, Kolathur, Kerala 679338",
    lat: 10.9414444,
    lng: 76.1389612
  }
];

export function StoreLocatorClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const filteredStores = STORES.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20">
      
      {/* Left Column: Store List */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        
        {/* Search Box */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Filter by title or description" 
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 pl-10 text-text-primary focus:outline-none focus:border-accent transition-colors font-mono"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        </div>

        {/* List of Stores */}
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
          {filteredStores.map(store => {
            const isSelected = selectedStore?.id === store.id;
            
            return (
              <div 
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-accent bg-accent/5' 
                    : 'border-border bg-surface hover:border-text-muted'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-bold text-lg ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                    {store.name}
                  </h3>
                  {store.isPrimary && (
                    <Star className="w-4 h-4 text-accent fill-accent" />
                  )}
                </div>
                
                <div className="flex items-start gap-2 text-text-secondary text-sm mb-3">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{store.address}</p>
                </div>
                
                {store.phone && (
                  <div className="flex items-center gap-2 text-text-muted text-sm font-mono">
                    <Phone className="w-4 h-4" />
                    <span>{store.phone}</span>
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredStores.length === 0 && (
            <div className="text-center py-8 text-text-muted">
              No stores found matching your search.
            </div>
          )}
        </div>

        {/* Global Action */}
        <button 
          onClick={() => setSelectedStore(null)}
          className="mt-4 border-2 border-border text-text-secondary hover:text-text-primary hover:border-text-muted rounded-xl py-3 font-bold uppercase tracking-widest text-sm transition-colors"
        >
          View All on Map
        </button>
      </div>

      {/* Right Column: Interactive Map */}
      <div className="w-full lg:w-2/3 min-h-[400px] lg:min-h-0 relative">
        <StoreMap stores={STORES} selectedStore={selectedStore} />
      </div>
      
    </div>
  );
}
