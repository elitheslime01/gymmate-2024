import { useEffect, useState } from 'react';
import { Box, Button, Flex, Heading, Text, Tooltip, VStack } from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";
import { FaCalendarTimes } from "react-icons/fa";
import useWalkinStore from '../store/walkin.js';

const ScheduleTimeSlots = () => {
    const { setSelectedTimeSlot, selectedDay, scheduleData, selectedTime, setSelectedTime, fetchScheduleByDate } = useWalkinStore();
    const [showButtons, setShowButtons] = useState(false);
    const [buttonClicked, setButtonClicked] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

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
        setSelectedTime(slot._startTime); // Optionally store the start time
        setSelectedTimeSlot(slot); // Store the entire slot object
        console.log("Selected Slot Data:", slot); // Log the selected slot data
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
                <Box p={4} flex="1">
                    <Flex direction="row" flexWrap="wrap" justify="space-between" height="100%">
                        <VStack
                            w='50%'
                            gap={6}
                            alignItems="center"
                        >
                            <FaCalendarTimes size={80} />
                            <Text>No time slots created yet</Text>
                        </VStack>
                        {/* Repeat for additional empty slots */}
                    </Flex>
                </Box>
            )}

            {showButtons && scheduleData && scheduleData.timeSlots && (
                 <Box p={4} flex="1">
                    <Flex direction="row" flexWrap="wrap" justify="space-between" height="100%">
                        {scheduleData.timeSlots.map((slot) => (
                            <Button
                                key={slot._startTime}
                                w='48%'
                                bg={selectedTime === slot._startTime ? "white" : "white"}
                                border={selectedTime === slot._startTime ? "2px solid #FE7654" : "2px solid transparent"} 
                                onClick={() => handleTimeClick(slot)}
                                height="40%"
                                boxShadow="lg"
                                mb={2}
                                _hover={{ bg: selectedSlot === slot ? "gray.300" : "white" }} 
                            >
                                <VStack spacing={5} align="center">
                                    <Heading fontSize='sm'>{`${slot._startTime} - ${slot._endTime}`}</Heading>
                                    <Text fontSize='sm'>Available Slot/s: {slot._availableSlots}</Text>
                                    <Text fontSize='xs' fontWeight='extrabold'>Status: {slot._status}</Text>
                                </VStack>
                            </Button>
                        ))}
                    </Flex>
                </Box>
            )}
        </Box>
    );
}

export default ScheduleTimeSlots;