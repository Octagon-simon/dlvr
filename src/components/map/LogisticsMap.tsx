'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Button, HStack, Text, useDisclosure } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import { FaEnvelope, FaMapPin } from 'react-icons/fa6';
import { BsBicycle, BsFillPhoneFill, BsHouse } from 'react-icons/bs';
import { useCompanies } from '@/hooks/useCompanies';
import { useRiders } from '@/hooks/useRiders';
import { BookRider } from '../riders/BookRider';
import { CompanyDTO } from '@/types';

const riderIcon = L.icon({
  iconUrl: '/dispatch.png',
  iconSize: [80, 80],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const companyIcon = L.icon({
  iconUrl: '/delivery-truck.svg',
  iconSize: [80, 80],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

export default function LogisticsMap() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const { loading: loadingCompanies, companies } = useCompanies()
  const { loading: loadingRiders, riders } = useRiders()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [currentCompany, setCurrentCompany] = useState<CompanyDTO>()

  const getCompanyName = useCallback((companyId: string) =>
    companies?.find((company) => company.id === companyId)?.companyName || "Unknown company",
    [companies]
  );

  useEffect(() => {

    if (typeof window === "undefined") return

    if (!mapRef.current && !loadingCompanies && !loadingRiders && mapContainerRef.current && companies?.length > 0) {

      mapRef.current = L.map(mapContainerRef.current).setView([companies[0]?.location?.lat, companies[0]?.location?.lng], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      companies.forEach((company) => {
        const marker = L.marker([company.location.lat, company.location.lng], {
          icon: companyIcon,
        }).addTo(mapRef.current!);

        const popupContent = document.createElement('div');

        createRoot(popupContent).render(
          <Box>
            <Text fontSize='16px' mb={5} fontWeight={"800"}>{company.companyName}</Text>
            <HStack fontSize="15px" mb={1}>
              <FaMapPin /> <Text m={0}>{company.formattedAddress}</Text>
            </HStack>
            <HStack fontSize="15px" mb={1}>
              <BsFillPhoneFill /> <Text>{company.whatsapp}</Text>
            </HStack>
            {(company?.email) ?
              <HStack fontSize="15px" mb={1}>
                <FaEnvelope /> <Text>{company.email}</Text>
              </HStack>
              : null}
            <Text fontSize='16px' mb={0} fontWeight={"800"}>Place Order</Text>
            <Button w={"full"} onClick={() => {
              setCurrentCompany(company);
              onOpen();
            }} colorScheme='teal'>
              Book Now
            </Button>
          </Box>
        );

        marker.bindPopup(popupContent);
      });

      riders.forEach((rider) => {
        // const marker = L.marker([rider.location.lat, rider.location.lng]).addTo(mapRef.current!);
        const marker = L.marker([rider.location.lat, rider.location.lng], {
          icon: riderIcon,
        }).addTo(mapRef.current!);

        const companyName = getCompanyName(rider.companyId);
        const popupContent = document.createElement('div');

        createRoot(popupContent).render(
          <Box>
            <Text fontSize='16px' mb={5} fontWeight={"800"}>{rider.name + ' (' + companyName?.split(' ')[0] + ')'}</Text>
            <HStack fontSize="15px" mb={1}>
              <FaMapPin size={20} /> <Text m={0}>{rider.formattedAddress}</Text>
            </HStack>
            <HStack fontSize="16px" mb={1}>
              <BsHouse size={20} /> <Text>{companyName}</Text>
            </HStack>
            <HStack color={(rider?.isAvailable) ? 'green' : 'red'} fontSize="16px" mb={1} fontWeight={"800"}>
              <BsBicycle size={20} /> <Text>{(rider?.isAvailable) ? "Available" : "Not Available"}</Text>
            </HStack>
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
  }, [companies, loadingCompanies, loadingRiders, riders, onOpen, getCompanyName]);

  return (
    <>
      <div suppressHydrationWarning={true} ref={mapContainerRef} style={{ height: '100vh', width: '100%' }} />
      <BookRider company={currentCompany} isOpen={isOpen} onClose={onClose} />
    </>
  )
}
