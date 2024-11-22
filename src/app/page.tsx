'use client';

import dynamic from 'next/dynamic';
import RegistrationForm from '@/components/forms';
import { Box, Flex } from '@chakra-ui/react';

const LogisticsMap = dynamic(() => import('@/components/map/LogisticsMap'), { ssr: false });

export default function Page() {
  return (
    <Flex 
      backgroundColor={"#ddd"} 
      p={10} 
      gap={10} 
      direction={{ base: "column", md: "row" }}
    >
      <Box 
        flex={{ base: "none", md: "1" }} 
        mb={{ base: 4, md: 0 }}
      >
        <RegistrationForm />
      </Box>
      <Box 
        flex={{ base: "none", md: "2" }} 
        p={5} 
        border="1px solid #bbb" 
        backgroundColor={"#ccc"} 
      >
        <LogisticsMap />
      </Box>
    </Flex>
  );
}

