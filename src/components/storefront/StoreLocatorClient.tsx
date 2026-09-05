"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Navigation } from "lucide-react";

export function StoreLocatorClient({ stores }: { stores: any[] }) {
  const [activeStore, setActiveStore] = useState(stores[0] || null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[70vh]">
      
      {/* Sidebar List */}
      <div className="space-y-6 lg:h-[70vh] lg:overflow-y-auto pr-4 custom-scrollbar">
        <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight">Our Stores</h1>
        <p className="text-text-secondary text-sm">Find an official Udaya Cycles retailer near you.</p>

        <div className="space-y-4">
          {stores.map((store) => (
            <div 
              key={store._id}
              onClick={() => setActiveStore(store)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                activeStore?._id === store._id 
                  ? 'bg-surface-raised border-accent shadow-lg shadow-accent/5' 
                  : 'bg-surface border-border hover:border-text-muted'
              }`}
            >
              <h3 className="font-bold text-text-primary text-lg mb-2">{store.name}</h3>
              <p className="text-sm text-text-secondary mb-4 line-clamp-2">{store.address}, {store.city}, {store.state} {store.pinCode}</p>
              
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-text-muted">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {store.city}</span>
                {activeStore?._id === store._id && <span className="text-accent">Selected</span>}
              </div>
            </div>
          ))}

          {stores.length === 0 && (
            <div className="text-center p-8 text-text-muted border border-dashed border-border rounded-xl">
              No store locations available at the moment.
            </div>
          )}
        </div>
      </div>

      {/* Map and Detail View */}
      <div className="lg:col-span-2 space-y-6">
        {activeStore ? (
          <>
            <div className="w-full h-96 bg-surface-raised rounded-3xl border border-border overflow-hidden relative group">
              {/* Fallback map using a free embed if coordinates exist, else address search */}
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(activeStore.address + ", " + activeStore.city)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                allowFullScreen
              ></iframe>
            </div>

            <div className="bg-surface-raised rounded-3xl border border-border p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-text-primary">{activeStore.name}</h2>
                  <p className="text-text-secondary mt-2">{activeStore.address}<br />{activeStore.city}, {activeStore.state} {activeStore.pinCode}</p>
                </div>

                <div className="space-y-3">
                  <a href={`tel:${activeStore.phone}`} className="flex items-center gap-3 text-sm text-text-primary hover:text-accent transition-colors">
                    <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-border"><Phone className="w-4 h-4" /></div>
                    {activeStore.phone}
                  </a>
                  {activeStore.email && (
                    <a href={`mailto:${activeStore.email}`} className="flex items-center gap-3 text-sm text-text-primary hover:text-accent transition-colors">
                      <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-border"><Mail className="w-4 h-4" /></div>
                      {activeStore.email}
                    </a>
                  )}
                </div>

                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeStore.address + ", " + activeStore.city)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-text-primary text-bg font-bold px-6 py-3 rounded-full hover:bg-accent hover:text-bg transition-colors uppercase tracking-wide text-sm"
                >
                  <Navigation className="w-4 h-4" /> Get Directions
                </a>
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-bold uppercase tracking-widest text-text-muted text-xs border-b border-border pb-2">
                  <Clock className="w-4 h-4" /> Opening Hours
                </h3>
                <ul className="space-y-3">
                  {activeStore.hours?.map((h: any, i: number) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary font-medium">{h.day}</span>
                      {h.isClosed ? (
                        <span className="text-error font-bold uppercase tracking-wider text-[10px]">Closed</span>
                      ) : (
                        <span className="text-text-primary font-mono">{h.open} - {h.close}</span>
                      )}
                    </li>
                  ))}
                  {(!activeStore.hours || activeStore.hours.length === 0) && (
                    <li className="text-text-muted text-sm">Hours not specified.</li>
                  )}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-surface-raised rounded-3xl border border-dashed border-border text-text-muted">
            Select a store from the list to view details
          </div>
        )}
      </div>

    </div>
  );
}
