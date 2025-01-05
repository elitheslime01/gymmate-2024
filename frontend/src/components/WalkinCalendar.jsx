import { Box, Button, Flex, Grid, Text, IconButton, Tooltip } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, QuestionIcon } from '@chakra-ui/icons';
import useWalkinStore from '../store/walkin';

const ScheduleCalendar = () => {
    const { currentDate, setFormattedDate, selectedDay, setCurrentDate, setSelectedDay, fetchScheduleByDate } = useWalkinStore();

    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDay(null); // Reset selected day when changing month
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDay(null); // Reset selected day when changing month
    };

    const handleDayClick = (day) => {
        setSelectedDay(day); // Update the selected day

        // Log the selected day, month, and year in yyyy-mm-dd format
        const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        setFormattedDate(formattedDate);
        console.log(`You pressed: ${formattedDate}`); // Logs in yyyy-mm-dd format

        // Fetch schedule data for the selected date
        fetchScheduleByDate(formattedDate); // Call the function from the store
    };

    const renderDays = () => {
        const days = [];
        const firstDay = getFirstDayOfMonth(currentDate.getMonth(), currentDate.getFullYear());
        const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());
        const today = new Date(); // Get today's date
        today.setHours(0, 0, 0, 0); // Normalize today's date to midnight for accurate comparison
    
        // Add empty boxes for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<Box key={`empty-${i}`} />);
        }
    
        // Add buttons for each day of the month
        for (let i = 1; i <= totalDays; i++) {
            const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            dayDate.setHours(0, 0, 0, 0); // Normalize dayDate to midnight for accurate comparison
            const isPastDay = dayDate < today; // Check if the day is in the past
    
            days.push(
                <Button
                    key={i}
                    width="40px"
                    height="40px"
                    mx="auto"
                    border="2px"
                    bg={isPastDay ? "gray.300" : "white"} // Gray for past days
                    borderColor={selectedDay === i ? "#FE7654" : "transparent"} // Change background if active
                    onClick={() => !isPastDay && handleDayClick(i)} // Handle day click only if not a past day
                    isDisabled={isPastDay} // Disable button for past days
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
            <Box key={index} textAlign="center" fontWeight="light">
                {day}
            </Box>
        ));
    };

    return (
        <Box width="100%" bg="white" borderRadius="lg" boxShadow="lg">
            <Flex color="#071434" p={4} justify="space-between" align="center">
                <Text fontSize="lg" fontWeight="semibold">Date</Text>
                <Tooltip label="Help" aria-label="A tooltip">
                    <QuestionIcon />
                </Tooltip>
            </Flex>
            <Box p={4}>
                <Flex justify="space-between" align="center" mb={4}>
                    <IconButton
                        icon={<ChevronLeftIcon />}
                        aria-label="Previous Month"
                        onClick={handlePrevMonth}
                        colorScheme="gray"
                    />
                    <Text fontSize="lg" fontWeight ="bold">{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</Text>
                    <IconButton
                        icon={<ChevronRightIcon />}
                        aria-label="Next Month"
                        onClick={handleNextMonth}
                        colorScheme="gray"
                    />
                </Flex>
                <Grid templateColumns="repeat(7, 1fr)" gap={2}>
                    {renderWeekDays()}
                    {renderDays()}
                </Grid>
            </Box>
        </Box>
    );
};

export default ScheduleCalendar;