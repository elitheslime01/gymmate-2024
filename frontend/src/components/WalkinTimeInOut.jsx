import { 
  Box, 
  Card, 
  CardBody, 
  Heading, 
  Text, 
  VStack,
  HStack,
  Divider,
  Button,
  useToast
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useStudentStore } from "../store/student";
import { format } from 'date-fns';

const WalkinTimeInOut = () => {
  const { user } = useStudentStore();
  const [currentBooking, setCurrentBooking] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchCurrentBooking = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/current/${user._id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (response.ok) {
          setCurrentBooking(data);
        }
      } catch (error) {
        console.error("Error fetching current booking:", error);
        toast({
          title: "Error",
          description: "Failed to fetch booking information",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    if (user?._id) {
      fetchCurrentBooking();
    }
  }, [user?._id, toast]);

  const handleTimeIn = async () => {
    // Implement time in logic
  };

  const handleTimeOut = async () => {
    // Implement time out logic
  };

  if (!currentBooking) {
    return (
      <Box p={8} minW="full" maxW="4xl">
        <Card bg="white" boxShadow="lg">
          <CardBody>
            <Text textAlign="center">No active bookings found</Text>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box p={8} minW="full" maxW="4xl">
      <Card bg="white" boxShadow="lg">
        <CardBody>
          <VStack spacing={6} align="stretch">
            <HStack justifyContent="space-between">
              <VStack align="start" spacing={1}>
                <Heading size="lg">
                  {`${currentBooking._timeSlot.startTime} - ${currentBooking._timeSlot.endTime}`}
                </Heading>
                <Text fontSize="md" color="gray.600">
                  {format(new Date(currentBooking._date), 'EEEE - MMMM d')}
                </Text>
              </VStack>
              <Text fontSize="xl" fontWeight="bold" color="gray.700">
                #{currentBooking._arId?._code || "000000"}
              </Text>
            </HStack>
            
            <Divider />
            
            <VStack spacing={4}>
              <Text fontSize="md" fontWeight="semibold" color="gray.600">
                Status: {currentBooking._bookingStatus}
              </Text>
              {currentBooking._timedIn ? (
                <Text fontSize="sm" color="gray.500">
                  Timed In: {new Date(currentBooking._timedIn).toLocaleTimeString()}
                </Text>
              ) : null}
              {currentBooking._timedOut ? (
                <Text fontSize="sm" color="gray.500">
                  Timed Out: {new Date(currentBooking._timedOut).toLocaleTimeString()}
                </Text>
              ) : null}
            </VStack>

            <HStack spacing={4} justify="center">
              <Button
                bgColor="white"
                color="#FE7654"
                border="2px"
                borderColor="#FE7654"
                _hover={{ bg: '#FE7654', color: 'white' }}
                _active={{ bg: '#cc4a2d' }}
                isDisabled={!!currentBooking._timedIn}
                onClick={handleTimeIn}
              >
                Time In
              </Button>
              <Button
                bgColor="#FE7654"
                color="white"
                _hover={{ bg: '#e65c3b' }}
                _active={{ bg: '#cc4a2d' }}
                isDisabled={!currentBooking._timedIn || !!currentBooking._timedOut}
                onClick={handleTimeOut}
              >
                Time Out
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default WalkinTimeInOut;