import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Flex,
    Heading,
    Text,
    Tooltip,
    VStack,
    Card,
    CardHeader,
    CardBody,
    SimpleGrid,
    HStack,
    Tag,
    TagLabel,
    Center,
    Icon
} from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";
import { FaCalendarTimes } from "react-icons/fa";
import useWalkinStore from '../store/walkin.js';

const WalkinTimeSlots = () => {
    const { setSelectedTimeSlot, selectedDay, scheduleData, setSelectedTime, fetchScheduleByDate } = useWalkinStore();
    const [selectedSlot, setSelectedSlot] = useState(null);

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
        setSelectedTime({
            startTime: slot.startTime || slot._startTime,
            endTime: slot.endTime || slot._endTime
        });
        setSelectedTimeSlot(slot); // Store the entire slot object
        console.log("Selected Slot Data:", slot); // Log the selected slot data
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
                        <Text fontSize="sm" color="gray.500">Pick an available window to complete your walk-in booking.</Text>
                    </Box>
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
                </Flex>
            </CardHeader>

            <CardBody px={{ base: 4, md: 6 }} pb={{ base: 6, md: 8 }}>
                {(!scheduleData || !scheduleData.timeSlots || scheduleData.timeSlots.length === 0) ? (
                    <Center py={10} px={{ base: 4, md: 6 }} textAlign="center">
                        <VStack spacing={4} maxW="sm">
                            <Icon as={FaCalendarTimes} boxSize={12} color="#071434" />
                            <Heading fontSize="lg">No time slots available</Heading>
                            <Text fontSize="sm" color="gray.500">
                                Choose another date from the calendar to view walk-in time slots.
                            </Text>
                        </VStack>
                    </Center>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
                        {scheduleData.timeSlots.map((slot) => {
                            const isSelected = selectedSlot?._startTime === slot._startTime;
                            const statusColor = statusColorMap[slot._status] || "gray";
                            return (
                                <Button
                                    key={slot._startTime}
                                    onClick={() => handleTimeClick(slot)}
                                    variant="outline"
                                    borderColor={isSelected ? '#FE7654' : 'gray.200'}
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
        </Card>
    );
}

export default WalkinTimeSlots;