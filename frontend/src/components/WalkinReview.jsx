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
        addToQueue,
        scheduleData,
        uploadARImage,
        arImage
    } = useWalkinStore();

    const { user, isLoggedIn } = useStudentStore();
    const toast = useToast();

    //console.log("User  object:", user);

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
    
        if (!arImage) {
            toast({
                title: "Error",
                description: "AR acknowledgement receipt image is required.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // First, check if the AR code exists or add it if it doesn't
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

        const imageResult = await uploadARImage(arImage, user._id);
        if (!imageResult.success) {
            toast({
                title: "Error",
                description: imageResult.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Add the student to the queue
        const result = await addToQueue(
            user._id, 
            formattedDate, 
            {
                startTime: selectedTimeSlot._startTime,
                endTime: selectedTimeSlot._endTime,
            },
            scheduleData._id,
            selectedTimeSlot._id, 
            arId
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
        <Box px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} minW="full" maxW="4xl" display={isBooked ? 'none' : 'block'}>
            <Heading as="h1" size="md" mb={{ base: 6, md: 10 }}>Please review your booking details</Heading>
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="flex-start" gap={{ base: 6, md: 10 }}>
                <Box flex="1" pr={{ base: 0, md: 2 }}>
                    <VStack align="start" spacing={3}>
                        <Text fontWeight="semibold">Full Name: {isLoggedIn ? `${user._fName} ${user._lName}` : 'N/A'}</Text>
                        <Text fontWeight="semibold">Student ID: {isLoggedIn ? user._umakID : 'N/A'}</Text>
                        <Text fontWeight="semibold">UMak Email Address: {isLoggedIn ? user._umakEmail : 'N/A'}</Text>
                    </VStack>
                </Box>
                <Box flex="1" pl={{ base: 0, md: 2 }}>
                    <VStack align="start" spacing={3}>
                        <Text fontWeight="semibold">Selected Date: {formattedDate}</Text>
                        <Text fontWeight="semibold">Selected Time Slot: {selectedTimeSlot ? `${selectedTimeSlot._startTime} - ${selectedTimeSlot._endTime}` : 'N/A'}</Text>
                        <Text fontWeight="semibold">AR Number: {arCode}</Text>
                    </VStack>
                </Box>
            </Flex>
            <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align="center" gap={4} mt={{ base: 10, md: 16 }}>
                <Button bgColor="white" color="#FE7654" border="2px" borderColor="#FE7654" _hover={{ bg: '#FE7654', color: 'white' }} _active={{ bg: '#cc4a2d' }} px={6} py={2} rounded="md" onClick={handleRevCancel} w={{ base: '100%', sm: 'auto' }}>Cancel</Button>
                <Button bgColor='#FE7654' color='white' _hover={{ bg: '#e65c3b' }} _active={{ bg: '#cc4a2d' }} px={6} py={2} rounded="md" onClick={handleRevProceed} w={{ base: '100%', sm: 'auto' }}>Book Slot</Button>
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <Flex justifyContent="center" alignItems="center">
                    <ModalContent mx={{ base: 4, md: 0 }} maxW={{ base: '100%', md: 'lg' }}>
                        <ModalHeader>Are you sure your information is correct?</ModalHeader>
                        <ModalBody>
                            <Text as="ul" listStyleType="disc" ml={4}>
                                <li>If any of the information is incorrect, please go back and update it accordingly.</li>
                                <li>Once confirmed, AR Number cannot be used again.</li>
                            </Text>
                        </ModalBody>
                        <ModalFooter display="flex" flexWrap="wrap" justifyContent="flex-end" gap={3}>
                            <Button onClick={onClose} bgColor="white" color="#FE7654" border="2px" borderColor="#FE7654" _hover={{ bg: '#FE7654', color : 'white' }} _active={{ bg: '#cc4a2d' }} minW="32">Cancel</Button>
                            <Button bgColor='#FE7654' color='white' _hover={{ bg: '#e65c3b' }} _active={{ bg: '#cc4a2d' }} minW="32" onClick={handleConfirm}>Confirm</Button>
                        </ModalFooter>
                    </ModalContent>
                </Flex>
            </Modal>
        </Box>
    );
};

export default WalkinReview;