import { Box, Button, Flex, Heading, useToast } from "@chakra-ui/react";
import useWalkinStore from "../store/walkin";
import WalkinCalendar from "../components/WalkinCalendar";
import WalkinTimeSlots from "../components/WalkinTimeSlots";

const WalkinBookSession = () => {
    const {
        selectedDay,
        selectedTime,
        setShowARInput,
        setShowBooking,
    } = useWalkinStore();

    const toast = useToast();

    const handleBkCancel = () => {
        setShowBooking(false);
    };

    const handleBkProceed = () => {
        if (!selectedDay || !selectedTime) {
            toast({
                title: "Selection Required",
                description: "Please select a date and time slot before proceeding.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return; 
        }

        // Proceed to the AR input if selections are valid
        setShowARInput(true);
        setShowBooking(false);
    };

    return (
        <Box p={8} minW="full" maxW="4xl">
            <Heading as="h1" size="md" mb={10}>Book a session</Heading>
            <Flex w='100%' gap="10" justify="space-between" mb={6}>
                <WalkinCalendar />
                <WalkinTimeSlots />
            </Flex>
            <Flex justify="space-between" mt={20}>
                <Button
                    bgColor="white"
                    color="#FE7654"
                    border="2px"
                    borderColor="#FE7654"
                    _hover={{ bg: '#FE7654', color: 'white' }}
                    _active={{ bg: '#cc4a2d' }}
                    px={6}
                    py={2}
                    rounded="md"
                    onClick={handleBkCancel}
                >
                    Cancel
                </Button>
                <Button
                    bgColor='#FE7654'
                    color='white'
                    _hover={{ bg: '#e65c3b' }}
                    _active={{ bg: '#cc4a2d' }}
                    px={6}
                    py={2}
                    rounded="md"
                    onClick={handleBkProceed}
                >
                    Proceed
                </Button>
            </Flex>
        </Box>
    );
};

export default WalkinBookSession;