'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import { FaEnvelope, FaMapPin } from 'react-icons/fa6';
import { BsFillPhoneFill } from 'react-icons/bs';

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
    name: "Express Logistics Ltd",
    location: { lat: 6.5532932, lng: 3.3370028 },
    whatsapp: "+1234567890",
    email: "contact@logisticsone.com",
  },
  {
    id: 2,
    name: "QuickShip Co.",
    location: { lat: 6.6099615, lng: 3.3953873 },
    whatsapp: "+0987654321",
    email:  'support@quickship.co'
  },
  {
    id: 3,
    name: "FreightPro Services",
    location: { lat: 6.578996999999999, lng: 3.3494666 },
    whatsapp: "+1122334455",
    email: "info@freightpro.com",
  },
];

export default function LogisticsMap() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {

      mapRef.current = L.map(mapContainerRef.current).setView([companies[0]?.location?.lat, companies[0]?.location?.lng], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      companies.forEach((company) => {
        const marker = L.marker([company.location.lat, company.location.lng]).addTo(mapRef.current!);

        const popupContent = document.createElement('div');

        createRoot(popupContent).render(
          <Box>
            <Text fontSize='16px' mb={5} fontWeight={"800"}>{company.name}</Text>
            <HStack fontSize="15px" mb={1}>
              <FaMapPin /> <Text m={0}>No 1 Egbulegbu</Text>
            </HStack>
            <HStack fontSize="15px" mb={1}>
              <BsFillPhoneFill /> <Text>{company.whatsapp}</Text>
            </HStack>
            <HStack fontSize="15px" mb={1}>
              <FaEnvelope /> <Text>{company.email}</Text>
            </HStack>

            <Button w={"full"} colorScheme='teal'>
              Book Now
            </Button>
          </Box>
        );

        marker.bindPopup(popupContent);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div suppressHydrationWarning={true} ref={mapContainerRef} style={{ height: '100vh', width: '100%' }} />;
}
