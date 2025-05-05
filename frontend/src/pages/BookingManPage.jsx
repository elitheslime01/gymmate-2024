import { Box, Flex, Heading, VStack } from "@chakra-ui/react";
import BookingTable from "../components/BookingTable";

const BookingManPage = () => {
  return (
    <Box 
      bg='gray.300'
      w='80vw' 
      h='100vh'
      position='relative'>
      <VStack>
        <Box 
          bg='white' 
          w='80vw' 
          h='10vh'
          boxShadow='lg' 
          position='fixed'
          top={0}
          zIndex={1}
          alignContent='center'
          paddingLeft='5%'>
          <Heading as='h3' size='lg'>Booking Management</Heading>
        </Box>

        <Box
          bg='gray.100' 
          w='80vw' 
          h='90vh'
          position='absolute' 
          top='10vh' 
          bottom={0}
          p='5%'>
          <Flex justify="center" align="center">
            <Box w="full" maxW="full">
              <BookingTable />
            </Box>
          </Flex>
        </Box>
      </VStack>
    </Box>
  );
};

export default BookingManPage;