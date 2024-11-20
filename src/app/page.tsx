import Registration from '@/components/forms/Register';
import LeafletMap from '@/components/map/Index';
import { Box, Flex } from '@chakra-ui/react';

export default function Page() {

  return (
    <Flex backgroundColor={"#ddd"} p={10} gap={10}>
      <Box flex="1">
        <Registration />
      </Box>
      <Box flex="2">
        <Box id="map" border="1px solid #bbb" p={5} backgroundColor={"#ccc"}>
          <LeafletMap />
        </Box>
      </Box>
    </Flex>

  )
}