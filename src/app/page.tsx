
import RegisterCompany from '@/components/forms/RegisterCompany';
import LogisticsMap from '@/components/map/LogisticsMap';
import { Box, Flex } from '@chakra-ui/react';

export default function Page() {

  return (
    <Flex backgroundColor={"#ddd"} p={10} gap={10}>
      <Box flex="1">
        <RegisterCompany />
      </Box>
      <Box flex="2">
        <Box id="map" border="1px solid #bbb" p={5} backgroundColor={"#ccc"}>
          <LogisticsMap />
        </Box>
      </Box>
    </Flex>

  )
}