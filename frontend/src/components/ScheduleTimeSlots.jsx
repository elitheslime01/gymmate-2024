import { useEffect, useState } from 'react';
import { Box, useToast, Button, Flex, Heading, Text, Tooltip, VStack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Select } from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";
import useScheduleStore from '../store/schedule.js';
import { FaCalendarPlus } from "react-icons/fa";

const ScheduleTimeSlots = () => {
    const { selectedDay,formattedDate, scheduleData, createSchedule, fetchScheduleByDate, updateSchedule } = useScheduleStore();
    const [showButtons, setShowButtons] = useState(false);
    const [buttonClicked, setButtonClicked] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [status, setStatus] = useState(""); 
    const [availableSlots, setAvailableSlots] = useState(0); 
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        const fetchSchedule = async () => {
            if (selectedDay instanceof Date && !isNaN(selectedDay)) {
                const formattedDate = selectedDay.toISOString().split('T')[0];
                await fetchScheduleByDate(formattedDate);
            }
        };
        fetchSchedule();
    }, [selectedDay, fetchScheduleByDate]);

    useEffect(() => {
        if (scheduleData) {
            setShowButtons(true);
        } else {
            setShowButtons(false);
            setButtonClicked(false);
        }
    }, [scheduleData]);

    const handleTimeClick = (slot) => {
        setSelectedSlot(slot); // Set the selected slot data
        setStatus(slot._status || ""); // Set the current status of the slot if available
        setAvailableSlots(slot._availableSlots); // Set the available slots for the selected slot
        onDetailsOpen(); // Open the modal
    };

    // const handleCreateSchedulesClick = () => {
    //     setShowButtons(true);
    //     setButtonClicked(true);
    // };

    const handleCreateSchedulesClick = () => {
        // Check if a date is selected
        if (!selectedDay) {
            toast({
                title: "Date Required",
                description: "Please select a date in the calendar before creating time slots.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        onConfirmOpen(); // Open confirmation modal
    };

    const handleConfirm = async () => {
        await createSchedule(formattedDate); // Call the createSchedule function from the store
        onConfirmClose(); // Close the modal
        toast({
            title: "Schedule Created",
            description: "Time slots have been created successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
        // Fetch the schedule for the selected day after creation
        await fetchScheduleByDate(formattedDate);
    };

    const incrementSlots = () => {
        if (availableSlots < 99) {
            setAvailableSlots(prev => prev + 1);
        }
    };

    const decrementSlots = () => {
        if (availableSlots > 0) {
            setAvailableSlots(prev => prev - 1);
        }
    };

    const handleUpdate = async () => {
        if (selectedSlot) {
            // Create the updated time slot object
            const updatedTimeSlot = {
                _startTime: selectedSlot._startTime,
                _availableSlots: availableSlots,
                _status: status,
            };
    
            // Call the updateSchedule function from the Zustand store
            const response = await updateSchedule(scheduleData._id, updatedTimeSlot);
    
            // Close the modal
            onDetailsClose();
    
            // Show a success or error toast based on the response
            if (response.success) {
                toast({
                    title: "Slot Updated",
                    description: "The time slot has been updated successfully.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                toast({
                    title: "Update Failed",
                    description: response.message || "An error occurred while updating the time slot.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };
    

    return (
        <Box width="100%" height="25.5em" display="flex" flexDirection="column">
            <Flex color="#071434" p={4} justify="space-between" align="center">
                <Text fontSize="lg" fontWeight="semibold">Time Slots</Text>
                <Tooltip label="Help" aria-label="A tooltip">
                    <QuestionIcon />
                </Tooltip>
            </Flex>

            {!buttonClicked && !showButtons && (
                <Flex height="100vh" justifyContent="center" alignItems="center">
                    <Button 
                        onClick={handleCreateSchedulesClick} 
                        bgColor='#FE7654' 
                        color='white'
                        _hover={{ bg: '#e65c3b' }}
                        _active={{ bg: '#cc4a2d' }}
                        w='50%'
                        h='50%'
                    >
                        <VStack gap={6}>
                            <FaCalendarPlus size={80} />
                            <Text>Create Time Slots</Text>
                        </VStack>
                    </Button>
                </Flex>
            )}

            {showButtons && scheduleData && scheduleData.timeSlots &&(
                <Box p={4} flex="1">
                    <Flex direction="row" flexWrap="wrap" justify="space-between" height="100%">
                        {scheduleData.timeSlots.map((slot) => (
                            <Button
                                key={slot._startTime}
                                w='48%'
                                bg="white"
                                onClick={() => handleTimeClick(slot)} // Pass the slot data
                                height="40%"
                                boxShadow="lg"
                                mb={2}
                            >
                                <VStack spacing={5} align="center">
                                    <Heading fontSize='sm'>{`${slot._startTime} - ${slot._endTime}`}</Heading>
                                    <Text fontSize='sm'>Available Slot/s: {slot._availableSlots}</Text>
                                    <Text fontSize='xs' fontWeight='extrabold' >Status: {slot._status}</Text>
                                </VStack>
                            </Button>
                        ))}
                    </Flex>
                </Box>
            )}

            {/* Modal for displaying selected time slot details */}
            <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} isCentered>
                <ModalOverlay />
                <Flex justifyContent="center" alignItems="center">
                    <ModalContent>
                        <ModalHeader>Update Time Slot Details</ModalHeader>
                        <ModalBody my={5}>
                            {selectedSlot && (
                                <VStack spacing={4} >
                                    <Text fontWeight="bold">{`${selectedSlot._startTime} - ${selectedSlot._endTime}`}</Text>
                                    <Flex alignItems="center" gap={2}>
                                        <Text>{`Available Slot/s: `}</Text>
                                        <Button bg="white" boxShadow="md" onClick={decrementSlots} isDisabled={availableSlots <= 0}>-</Button>
                                        <Text>{availableSlots}</Text>
                                        <Button bg="white" boxShadow="md" onClick={incrementSlots} isDisabled={availableSlots >= 99}>+</Button>
                                    </Flex>
                                    <Flex alignItems="center" gap={2}>
                                        <Text >{`Status: `}</Text>
                                        <Select 
                                            variant="filled"
                                            bg="white"
                                            boxShadow="md"
                                            w={200}
                                            value={status} 
                                            onChange={(e) => setStatus(e.target.value)}
                                            focusBorderColor="#FE7654"
                                        >
                                            <option value="Available">Available</option>
                                            <option value="Fully Booked">Fully Booked</option>
                                            <option value="Under Maintenance">Under Maintenance</option>
                                            <option value="Reserved">Reserved</option>
                                            <option value="Unavailable">Unavailable</option>
                                        </Select>
                                    </Flex>
                                </VStack>
                            )}
                        </ModalBody>
                        <ModalFooter display="flex" justifyContent="space-between">
                            <Button onClick={onDetailsClose} bgColor="white" color="#FE7654" border="2px" borderColor="#FE7654" _hover={{ bg: '#FE7654', color: 'white' }} _active={{ bg: '#cc4a2d' }} w="40" px={4} py={2} rounded="md" display="flex" alignItems="center">
                                Cancel
                            </Button>
                            <Button bgColor='#FE7654' color='white' _hover={{ bg: '#e65c3b' }} _active={{ bg: '#cc4a2d' }} w="40" px={4} py={2} rounded="md" display="flex" alignItems="center" onClick={handleUpdate}>
                                Update
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Flex>
            </Modal>

            {/* Confirmation Modal */}
            <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} isCentered>
                <ModalOverlay />
                <Flex justifyContent="center" alignItems="center">
                    <ModalContent>
                        <ModalHeader>Confirm Schedule Creation</ModalHeader>
                        <ModalBody my={5}>
                            <Text as="ul" listStyleType="disc" ml={4}>
                                <li>Are you sure you want to create time slots for the selected date?</li>
                            </Text>
                        </ModalBody>
                        <ModalFooter display="flex" justifyContent="space-between">
                            <Button onClick={onConfirmClose} bgColor="white" color="#FE7654" border="2px" borderColor="#FE7654" _hover={{ bg: '#FE7654', color: 'white' }} _active={{ bg: '#cc4a2d' }} w="40" px={4} py={2} rounded="md" display="flex" alignItems="center">
                                Cancel
                            </Button>
                            <Button bgColor='#FE7654' color='white' _hover={{ bg: '#e65c3b' }} _active={{ bg: '#cc4a2d' }} w="40" px={4} py={2} rounded="md" display="flex" alignItems="center" onClick={handleConfirm}>
                                Confirm
                            </Button>                        
                        </ModalFooter>
                    </ModalContent>
                </Flex>
            </Modal>

        </Box>
    );
}

export default ScheduleTimeSlots;