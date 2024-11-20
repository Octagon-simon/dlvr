'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import { FaEnvelope, FaMapPin } from 'react-icons/fa6';
import { BsFillPhoneFill } from 'react-icons/bs';
import axios from 'axios';
import { CompanyDTO } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const demoCompanies: CompanyDTO[] = [
  {
    companyName: "Express Logistics Ltd",
    locationObject: { lat: 6.5532932, lng: 3.3370028 },
    whatsapp: "+2349128873664",
    email: "contact@logisticsone.com",
    formattedAddress: "123 Main St, Logistics One, Lagos, Nigeria"
  },
  {
    companyName: "QuickShip Co.",
    locationObject: { lat: 6.6099615, lng: 3.3953873 },
    whatsapp: "+2348126635447",
    email: 'support@quickship.co',
    formattedAddress: "456 Elm St, QuickShip Co., Lagos, Nigeria"
  },
  {
    companyName: "FreightPro Services",
    locationObject: { lat: 6.578996999999999, lng: 3.3494666 },
    whatsapp: "+2348163345226",
    email: "info@freightpro.com",
    formattedAddress: "789 Oak St, FreightPro Services, Lagos, Nigeria"
  },
];

export default function LogisticsMap() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get('api/companies/get-all')

        if (response?.data && Object.keys(response.data?.data).length) {
          const responseData = response.data.data as CompanyDTO[]
          setCompanies(responseData)
        } else {
          setCompanies(demoCompanies);
        }

      } catch (e) {
        console.error(e);
        setCompanies(demoCompanies);
      }
    }

    fetchCompanies()
  }, [])


  useEffect(() => {

    if (!mapRef.current && mapContainerRef.current && companies?.length > 0) {

      mapRef.current = L.map(mapContainerRef.current).setView([companies[0]?.locationObject?.lat, companies[0]?.locationObject?.lng], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      companies.forEach((company) => {
        const marker = L.marker([company.locationObject.lat, company.locationObject.lng]).addTo(mapRef.current!);

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
  }, [companies]);

  return <div suppressHydrationWarning={true} ref={mapContainerRef} style={{ height: '100vh', width: '100%' }} />;
}
