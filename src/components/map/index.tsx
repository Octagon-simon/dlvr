'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Company = {
  id: number;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  whatsapp: string;
  email?: string;
};

const companies: Company[] = [
  {
    id: 1,
    name: "Logistics One",
    location: { lat: 37.7749, lng: -122.4194 },
    whatsapp: "+1234567890",
    email: "contact@logisticsone.com",
  },
  {
    id: 2,
    name: "QuickShip Co.",
    location: { lat: 40.7128, lng: -74.006 },
    whatsapp: "+0987654321",
  },
  {
    id: 3,
    name: "FreightPro Services",
    location: { lat: 34.0522, lng: -118.2437 },
    whatsapp: "+1122334455",
    email: "info@freightpro.com",
  },
];

export default function LogisticsMap() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      // Initialize map
      mapRef.current = L.map(mapContainerRef.current).setView([37.7749, -122.4194], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      // Add markers for each company
      companies.forEach((company) => {
        const marker = L.marker([company.location.lat, company.location.lng]).addTo(mapRef.current!);

        // Attach popup with company details
        marker.bindPopup(`
          <div>
            <strong>${company.name}</strong>
            <p><b>WhatsApp:</b> ${company.whatsapp}</p>
            ${company.email ? `<p><b>Email:</b> ${company.email}</p>` : ""}
          </div>
        `);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={mapContainerRef} style={{ height: '100vh', width: '100%' }} />;
}
