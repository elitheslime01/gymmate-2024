import { useEffect, useState } from 'react';
import {
    Box,
    useToast,
    Button,
    Flex,
    Heading,
    Text,
    Tooltip,
    VStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Select,
    SimpleGrid,
    Card,
    CardHeader,
    CardBody,
    Center,
    HStack,
    Tag,
    TagLabel,
    Icon
} from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";
import useScheduleStore from '../store/schedule.js';
import { FaCalendarPlus, FaTrashAlt } from "react-icons/fa";

const ScheduleTimeSlots = () => {
    const { selectedDay,formattedDate, scheduleData, createSchedule, fetchScheduleByDate, updateSchedule, deleteSchedule } = useScheduleStore();
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [status, setStatus] = useState(""); 
    const [availableSlots, setAvailableSlots] = useState(0); 
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
    const toast = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const statusColorMap = {
        "Available": "green",
        "Fully Booked": "red",
        "Under Maintenance": "orange",
        "Reserved": "purple",
        "Unavailable": "gray"
    };

    useEffect(() => {
        const fetchSchedule = async () => {
            if (selectedDay instanceof Date && !isNaN(selectedDay)) {
                const formattedDate = selectedDay.toISOString().split('T')[0];
                await fetchScheduleByDate(formattedDate);
            }
        };
        fetchSchedule();
    }, [selectedDay, fetchScheduleByDate]);

    const handleTimeClick = (slot) => {
        setSelectedSlot(slot); // Set the selected slot data
        setStatus(slot._status || ""); // Set the current status of the slot if available
        setAvailableSlots(slot._availableSlots); // Set the available slots for the selected slot
        onDetailsOpen(); // Open the modal
    };

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

    const handleDelete = async () => {
        if (!scheduleData?._id) {
            toast({
                title: "No schedule found",
                description: "There's nothing to delete for the selected date.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            setIsDeleting(true);
            const response = await deleteSchedule(scheduleData._id);
            setIsDeleting(false);

            if (response.success) {
                toast({
                    title: "Time slots deleted",
                    description: "All time slots for this date have been removed.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                onDeleteClose();

                if (formattedDate) {
                    await fetchScheduleByDate(formattedDate);
                }
            } else {
                toast({
                    title: "Failed to delete",
                    description: response.message || "Unable to delete time slots.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Error deleting schedule:", error);
            toast({
                title: "Failed to delete",
                description: "An unexpected error occurred.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsDeleting(false);
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
        <Card
            w="full"
            minH={{ base: "auto", md: "24rem" }}
            bg="white"
            borderRadius="xl"
            boxShadow="2xl"
            borderWidth="1px"
            borderColor="gray.100"
            overflow="hidden"
        >
            <CardHeader pb={0}>
                <Flex
                    color="#071434"
                    px={{ base: 0, md: 1 }}
                    py={{ base: 0, md: 1 }}
                    justify="space-between"
                    align={{ base: "flex-start", sm: "center" }}
                    direction={{ base: "column", sm: "row" }}
                    gap={3}
                >
                    <Box>
                        <Text fontSize="lg" fontWeight="semibold">Time Slots</Text>
                        <Text fontSize="sm" color="gray.500">Review capacity and status for each booking window.</Text>
                    </Box>
                    <HStack spacing={2} flexWrap="wrap" justify={{ base: "flex-start", sm: "flex-end" }}>
                        <Tooltip label="Need help?" aria-label="Time slots help tooltip">
                            <Button
                                variant="ghost"
                                colorScheme="orange"
                                size="sm"
                                leftIcon={<QuestionIcon />}
                            >
                                Help
                            </Button>
                        </Tooltip>
                        {scheduleData?._id ? (
                            <Button
                                onClick={onDeleteOpen}
                                colorScheme="red"
                                variant="outline"
                                size="sm"
                                leftIcon={<Icon as={FaTrashAlt} />}
                            >
                                Delete Slots
                            </Button>
                        ) : null}
                    </HStack>
                </Flex>
            </CardHeader>

            <CardBody px={{ base: 4, md: 6 }} pb={{ base: 6, md: 8 }}>
                {(!scheduleData || !scheduleData.timeSlots || scheduleData.timeSlots.length === 0) ? (
                    <Center py={10} px={{ base: 4, md: 6 }} textAlign="center">
                        <VStack spacing={4} maxW="sm">
                            <Icon as={FaCalendarPlus} boxSize={12} color="#FE7654" />
                            <Heading fontSize="lg">No time slots yet</Heading>
                            <Text fontSize="sm" color="gray.500">
                                Select a date in the calendar and create time slots to manage gym availability.
                            </Text>
                            <Button
                                onClick={handleCreateSchedulesClick}
                                bgColor="#FE7654"
                                color="white"
                                _hover={{ bg: '#e65c3b' }}
                                _active={{ bg: '#cc4a2d' }}
                                w="full"
                            >
                                Create Time Slots
                            </Button>
                        </VStack>
                    </Center>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
                        {scheduleData.timeSlots.map((slot) => {
                            const statusColor = statusColorMap[slot._status] || "gray";

                            return (
                                <Button
                                    key={slot._startTime}
                                    onClick={() => handleTimeClick(slot)}
                                    variant="outline"
                                    borderColor="gray.200"
                                    bg="white"
                                    _hover={{ borderColor: '#FE7654', boxShadow: 'md' }}
                                    _active={{ borderColor: '#cc4a2d' }}
                                    borderRadius="lg"
                                    py={{ base: 5, md: 6 }}
                                    px={4}
                                    h="auto"
                                    justifyContent="flex-start"
                                    alignItems="flex-start"
                                    textAlign="left"
                                >
                                    <VStack align="flex-start" spacing={3} w="full">
                                        <Heading fontSize={{ base: 'md', md: 'lg' }}>
                                            {`${slot._startTime} - ${slot._endTime}`}
                                        </Heading>
                                        <HStack spacing={3} flexWrap="wrap" w="full">
                                            <Tag colorScheme="gray" variant="subtle">
                                                <TagLabel>Available: {slot._availableSlots}</TagLabel>
                                            </Tag>
                                            <Tag colorScheme={statusColor} variant="solid">
                                                <TagLabel>{slot._status}</TagLabel>
                                            </Tag>
                                        </HStack>
                                    </VStack>
                                </Button>
                            );
                        })}
                    </SimpleGrid>
                )}
            </CardBody>

            {/* Modal for displaying selected time slot details */}
            <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} isCentered>
                <ModalOverlay />
                <ModalContent mx={{ base: 4, md: 0 }} maxW={{ base: "100%", md: "lg" }}>
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
                    <ModalFooter display="flex" flexWrap="wrap" justifyContent="flex-end" gap={3}>
                        <Button onClick={onDetailsClose} bgColor="white" color="#FE7654" border="2px" borderColor="#FE7654" _hover={{ bg: '#FE7654', color: 'white' }} _active={{ bg: '#cc4a2d' }} minW="32" px={4} py={2} rounded="md" display="flex" alignItems="center">
                            Cancel
                        </Button>
                        <Button bgColor='#FE7654' color='white' _hover={{ bg: '#e65c3b' }} _active={{ bg: '#cc4a2d' }} minW="32" px={4} py={2} rounded="md" display="flex" alignItems="center" onClick={handleUpdate}>
                            Update
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Confirmation Modal */}
            <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} isCentered>
                <ModalOverlay />
                <ModalContent mx={{ base: 4, md: 0 }} maxW={{ base: "100%", md: "md" }}>
                    <ModalHeader>Confirm Schedule Creation</ModalHeader>
                    <ModalBody my={5}>
                        <Text as="ul" listStyleType="disc" ml={4}>
                            <li>Are you sure you want to create time slots for the selected date?</li>
                        </Text>
                    </ModalBody>
                    <ModalFooter display="flex" flexWrap="wrap" justifyContent="flex-end" gap={3}>
                        <Button onClick={onConfirmClose} bgColor="white" color="#FE7654" border="2px" borderColor="#FE7654" _hover={{ bg: '#FE7654', color: 'white' }} _active={{ bg: '#cc4a2d' }} minW="32" px={4} py={2} rounded="md" display="flex" alignItems="center">
                            Cancel
                        </Button>
                        <Button bgColor='#FE7654' color='white' _hover={{ bg: '#e65c3b' }} _active={{ bg: '#cc4a2d' }} minW="32" px={4} py={2} rounded="md" display="flex" alignItems="center" onClick={handleConfirm}>
                            Confirm
                        </Button>                        
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
                <ModalOverlay />
                <ModalContent mx={{ base: 4, md: 0 }} maxW={{ base: "100%", md: "md" }}>
                    <ModalHeader>Delete Time Slots</ModalHeader>
                    <ModalBody my={5}>
                        <Text fontSize="sm" color="gray.600">
                            This will remove all time slots for the selected date. Any existing bookings tied to these slots will no longer have a schedule reference.
                        </Text>
                    </ModalBody>
                    <ModalFooter display="flex" flexWrap="wrap" justifyContent="flex-end" gap={3}>
                        <Button onClick={onDeleteClose} bgColor="white" color="#FE7654" border="2px" borderColor="#FE7654" _hover={{ bg: '#FE7654', color: 'white' }} _active={{ bg: '#cc4a2d' }} minW="32" px={4} py={2} rounded="md" display="flex" alignItems="center">
                            Cancel
                        </Button>
                        <Button
                            colorScheme="red"
                            minW="32"
                            px={4}
                            py={2}
                            rounded="md"
                            display="flex"
                            alignItems="center"
                            onClick={handleDelete}
                            isLoading={isDeleting}
                        >
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </Card>
    );
}

export default ScheduleTimeSlots;