import {
    Box,
    Button,
    Flex,
    Grid,
    Text,
    IconButton,
    Tooltip,
    Card,
    CardHeader,
    CardBody,
    Stack,
    useBreakpointValue
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, QuestionIcon } from '@chakra-ui/icons';
import useScheduleStore from "../store/schedule.js"; 

const ScheduleCalendar = () => {
    const { currentDate,setFormattedDate, selectedDay, setCurrentDate, setSelectedDay, fetchScheduleByDate } = useScheduleStore();
    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDay(null); 
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDay(null); 
    };

    const handleDayClick = (day) => {
        setSelectedDay(day); // Update the selected day

        // Log the selected day, month, and year in yyyy-mm-dd format
        const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        setFormattedDate(formattedDate)
        console.log(`You pressed: ${formattedDate}`); // Logs in yyyy-mm-dd format

        // Fetch schedule data for the selected date
        fetchScheduleByDate(formattedDate); // Call the function from the store
    };

    const dayButtonSize = useBreakpointValue({ base: '2.5rem', md: '2.75rem' });

    const renderDays = () => {
        const days = [];
        const firstDay = getFirstDayOfMonth(currentDate.getMonth(), currentDate.getFullYear());
        const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());

        // Add empty boxes for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<Box key={`empty-${i}`} />);
        }

        // Add buttons for each day of the month
        for (let i = 1; i <= totalDays; i++) {
            days.push(
                <Button
                    key={i}
                    h={dayButtonSize}
                    w={dayButtonSize}
                    mx="auto"
                    borderWidth="1px"
                    borderColor={selectedDay === i ? '#FE7654' : 'transparent'}
                    bg={selectedDay === i ? '#FE7654' : 'gray.50'}
                    color={selectedDay === i ? 'white' : 'gray.700'}
                    fontWeight="medium"
                    borderRadius="full"
                    _hover={{ bg: selectedDay === i ? '#e65c3b' : 'gray.100' }}
                    _active={{ bg: selectedDay === i ? '#cc4a2d' : 'gray.200' }}
                    onClick={() => handleDayClick(i)}
                    aria-pressed={selectedDay === i}
                >
                    {i}
                </Button>
            );
        }

        return days;
    };

    const renderWeekDays = () => {
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return weekDays.map((day, index) => (
            <Box key={index} textAlign="center" fontWeight="semibold" fontSize="sm" color="gray.600">
                {day}
            </Box>
        ));
    };

    return (
        <Card
            bg="white"
            borderRadius="xl"
            boxShadow="2xl"
            borderWidth="1px"
            borderColor="gray.100"
            w="full"
        >
            <CardHeader pb={0}>
                <Flex
                    color="#071434"
                    justify="space-between"
                    align={{ base: 'flex-start', sm: 'center' }}
                    direction={{ base: 'column', sm: 'row' }}
                    gap={3}
                >
                    <Box>
                        <Text fontSize="lg" fontWeight="semibold">Date</Text>
                        <Text fontSize="sm" color="gray.500">Select a day to view or manage its schedule.</Text>
                    </Box>
                    <Tooltip label="Need help?" aria-label="Calendar help tooltip">
                        <IconButton
                            icon={<QuestionIcon />}
                            aria-label="Calendar help"
                            variant="ghost"
                            colorScheme="orange"
                            size="sm"
                        />
                    </Tooltip>
                </Flex>
            </CardHeader>
            <CardBody>
                <Stack spacing={4}>
                    <Flex
                        justify="space-between"
                        align="center"
                        wrap="wrap"
                        gap={3}
                    >
                        <IconButton
                            icon={<ChevronLeftIcon />}
                            aria-label="Previous Month"
                            onClick={handlePrevMonth}
                            variant="ghost"
                            colorScheme="gray"
                            size="sm"
                        />
                        <Text fontSize="lg" fontWeight="semibold" textAlign="center">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </Text>
                        <IconButton
                            icon={<ChevronRightIcon />}
                            aria-label="Next Month"
                            onClick={handleNextMonth}
                            variant="ghost"
                            colorScheme="gray"
                            size="sm"
                        />
                    </Flex>
                    <Box>
                        <Box overflowX="auto" pb={2}>
                            <Grid templateColumns="repeat(7, minmax(2.75rem, 1fr))" gap={2} minW="21rem">
                                {renderWeekDays()}
                            </Grid>
                        </Box>
                        <Box overflowX="auto">
                            <Grid templateColumns="repeat(7, minmax(2.75rem, 1fr))" gap={2} minW="21rem">
                                {renderDays()}
                            </Grid>
                        </Box>
                    </Box>
                </Stack>
            </CardBody>
        </Card>
    );
};

export default ScheduleCalendar;