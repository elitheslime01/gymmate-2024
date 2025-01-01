import { useToast, Box, Button, Flex, Heading, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure, VStack } from "@chakra-ui/react";
import useWalkinStore from "../store/walkin";
import { useStudentStore } from "../store/student"; // Import the student store

const WalkinReview = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const {
        isBooked,
        setShowARInput,
        showReview,
        setShowReview,
        setIsRegistered,
        setIsBooked,
        formattedDate,
        selectedTimeSlot,
        arCode,
        showRegister,
        addARCode,
        checkIfStudentInQueue,
        addToQueue, // Import the addToQueue function
    } = useWalkinStore();

    const { user, isLoggedIn } = useStudentStore(); // Get user data from the student store
    const toast = useToast();

    console.log("User  object:", user);

    const handleRevCancel = () => {
        setShowARInput(true);
        setShowReview(false);
    }

    const handleRevProceed = () => {
        onOpen();
    }

    const handleConfirm = async () => {
        if (!arCode || arCode.trim() === "") {
            toast({
                title: "Error",
                description: "AR code is required.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
    
        // First, check if the student is already in the queue
        const queueCheckResult = await checkIfStudentInQueue(
            user._id, // Student ID
            formattedDate, // Selected date
            {
                startTime: selectedTimeSlot._startTime,
                endTime: selectedTimeSlot._endTime,
            }
        );
    
        if (!queueCheckResult.success) {
            toast({
                title: "Error",
                description: queueCheckResult.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
    
        if (queueCheckResult.isInQueue) {
            toast({
                title: "Error",
                description: "Student is already in the queue for this time slot.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return; // Exit early if the student is already in the queue
        }
    
        // If the student is not in the queue, proceed to upload the AR code
        const arResult = await addARCode(arCode, user._id);
        if (!arResult.success) {
            toast({
                title: "Error",
                description: arResult.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
    
        const arId = arResult.arId; // Ensure arId is extracted correctly
        if (!arId) {
            toast({
                title: "Error",
                description: "Failed to retrieve AR ID.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
    
        // Add the student to the queue
        const result = await addToQueue(
            user._id, // Student ID
            formattedDate, // Selected date
            {
                startTime: selectedTimeSlot._startTime,
                endTime: selectedTimeSlot._endTime,
            },
            selectedTimeSlot._id, // Schedule ID
            arId // AR ID
        );
    
        if (result.success) {
            if (showRegister) setIsRegistered(true);
            else if (showReview) setIsBooked(true);
            onClose(); // Close the modal after successful addition to the queue
        } else {
            toast({
                title: "Error",
                description: result.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box p={8} minW="full" maxW="4xl" display={isBooked ? 'none' : 'block'}>
            <Heading as="h1" size="md" mb={20}>Please review your booking details</Heading>
            <Flex justify="space-between" align="flex-start" gap={10}>
                <Box flex="1" pr={2}>
                    <VStack align="start" spacing={4} whiteSpace="nowrap">
                        <Text fontWeight="semibold">Full Name: {isLoggedIn ? `${user._fName} ${user._lName}` : 'N/A'}</Text>
                        <Text fontWeight="semibold">Student ID: {isLoggedIn ? user._umakID : 'N/A'}</Text>
                        <Text fontWeight="semibold">UMak Email Address: {isLoggedIn ? user._umakEmail : 'N/A'}</Text>
                    </VStack>
                </Box>
                <Box flex="1" pl={2}>
                    <VStack align="start" spacing={4} whiteSpace="nowrap">
                        <Text fontWeight="semibold">Selected Date: {formattedDate}</Text>
                        <Text fontWeight="semibold">Selected Time Slot: {selectedTimeSlot ? `${selectedTimeSlot._startTime} - ${selectedTimeSlot._endTime}` : 'N/A'}</Text>
                        <Text fontWeight="semibold">AR Number: {arCode}</Text>
                    </VStack>
                </Box>
            </Flex>
            <Flex justify="space-between" mt={20}>
                <Button bgColor="white" color="#FE7654" border="2px" borderColor="#FE7654" _hover={{ bg: '#FE7654', color: 'white' }} _active={{ bg: '#cc4a2d' }} px={6} py={2} rounded="md" onClick={handleRevCancel}>Cancel</Button>
                <Button bgColor='#FE7654' color='white' _hover={{ bg: '#e65c3b' }} _active={{ bg: '#cc4a2d' }} px={6} py={2} rounded="md" onClick={handleRevProceed}>Book Slot</Button>
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <Flex justifyContent="center" alignItems="center">
                    <ModalContent>
                        <ModalHeader>Are you sure your information is correct?</ModalHeader>
                        <ModalBody>
                            <Text as="ul" listStyleType="disc" ml={4}>
                                <li>If any of the information is incorrect, please go back and update it accordingly.</li>
                                <li>Once confirmed, AR Number cannot be used again.</li>
                            </Text>
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={onClose} bgColor="white" color="#FE7654" border="2px" borderColor="#FE7654" _hover={{ bg: '#FE7654', color : 'white' }} _active={{ bg: '#cc4a2d' }} mr={3}>Cancel</Button>
                            <Button colorScheme="blue" onClick={handleConfirm}>Confirm</Button>
                        </ModalFooter>
                    </ModalContent>
                </Flex>
            </Modal>
        </Box>
    );
};

export default WalkinReview;