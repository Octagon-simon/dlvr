'use client';

import dynamic from 'next/dynamic';
import RegistrationForm from '@/components/forms';
import { Box, Flex } from '@chakra-ui/react';

const LogisticsMap = dynamic(() => import('@/components/map/LogisticsMap'), { ssr: false });

export default function Page() {
  return (
    <Flex backgroundColor={"#ddd"} p={10} gap={10}>
      <Box flex="1">
        <RegistrationForm />
      </Box>
      <Box flex="2">
        <Box id="map" border="1px solid #bbb" p={5} backgroundColor={"#ccc"}>
          <LogisticsMap />
        </Box>
      </Box>
    </Flex>
  );
}
