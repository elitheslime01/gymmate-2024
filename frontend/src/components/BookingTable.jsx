import { 
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Box, Flex, Input, 
  Select, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, 
  ModalBody, ModalFooter, useDisclosure, Text, Grid, Button
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import { useState, useEffect } from 'react';
import useBookingStore from "../store/booking";

const BookingTable = () => {
  const { bookings, setDate, setTimeSlot, fetchBookingsByDate, clearBookings, fetchBookings, fetchAllCurrentMonthBookings } = useBookingStore();
  const [date, setDateState] = useState("");
  const [timeSlot, setTimeSlotState] = useState({ startTime: "", endTime: "" });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleViewDetails = (student, bookingInfo) => {
    setSelectedStudent({ ...student, bookingInfo });
    onOpen();
  };

  useEffect(() => {
    fetchAllCurrentMonthBookings();
  }, [fetchAllCurrentMonthBookings]);

  const handleDateChange = (e) => {
    setDateState(e.target.value);
    setDate(e.target.value);
    setTimeSlotState({ startTime: "", endTime: "" });
    setTimeSlot({ startTime: "", endTime: "" });
    
    if (!e.target.value) {
      fetchAllCurrentMonthBookings();
    } else {
      fetchBookingsByDate(e.target.value);
    }
  };

  // const handleTimeSlotChange = (e) => {
  //   const { name, value } = e.target;
  //   if (name === "startTime") {
  //     clearBookings();
  //     let endTime;
  //     switch(value) {
  //       case "08:00 AM": endTime = "10:00 AM"; break;
  //       case "10:00 AM": endTime = "12:00 PM"; break;
  //       case "12:00 PM": endTime = "02:00 PM"; break;
  //       case "02:00 PM": endTime = "04:00 PM"; break;
  //       default: endTime = "";
  //     }
  //     setTimeSlotState({ startTime: value, endTime });
  //     setTimeSlot({ startTime: value, endTime });
  //   }
  // };

  useEffect(() => {
    if (date && timeSlot.startTime && timeSlot.endTime) {
      fetchBookings(date, timeSlot);
    }
  }, [date, timeSlot, fetchBookings]);
  
  const handleTimeSlotChange = (e) => {
    const { name, value } = e.target;
    if (name === "startTime") {
      let endTime;
      clearBookings();
      switch(value) {
        case "08:00 AM": endTime = "10:00 AM"; break;
        case "10:00 AM": endTime = "12:00 PM"; break;
        case "12:00 PM": endTime = "02:00 PM"; break;
        case "02:00 PM": endTime = "04:00 PM"; break;
        default: endTime = "";
      }
      setTimeSlotState({ startTime: value, endTime });
      setTimeSlot({ startTime: value, endTime });
      
      // If both date and time slot are selected, fetch filtered data
      if (date && value) {
        fetchBookings(date, { startTime: value, endTime });
      }
    }
  };

  return (
    <Box mb={0}>
      <Flex gap={4} mb={8} justifyContent="space-between">
        <Flex gap={2}>
          <Input
            type="date"
            value={date}
            onChange={handleDateChange}
            placeholder="Select Date (yyyy-mm-dd)"
            bg="white" 
            boxShadow="lg" 
          />
          <Select
            bg="white" 
            boxShadow="lg" 
            name="startTime"
            value={timeSlot.startTime}
            onChange={handleTimeSlotChange}
          >
            <option value="">Select Time Slot</option>
            <option value="08:00 AM">08:00 AM - 10:00 AM</option>
            <option value="10:00 AM">10:00 AM - 12:00 PM</option>
            <option value="12:00 PM">12:00 PM - 02:00 PM</option>
            <option value="02:00 PM">02:00 PM - 04:00 PM</option>
          </Select>
        </Flex>
        <Flex gap={2}>
          <Select w="70%" bg="white" boxShadow="lg">
            <option value="option1">Student ID</option>
            <option value="option2">Umak Email</option>
          </Select>
          <Input bg="white" boxShadow="lg" placeholder="Search" />
        </Flex>
      </Flex>
      <TableContainer>
        <Table bg="white" size="sm">
        <Thead bg="#071434" position="sticky" top={0} zIndex={1}>
          <Tr>
            <Th color="white" textAlign="center">Date</Th>
            <Th color="white" textAlign="center">Time Slot</Th>
            <Th color="white" textAlign="center">First Name</Th>
            <Th color="white" textAlign="center">Last Name</Th>
            <Th color="white" textAlign="center">Booking Status</Th>
            <Th color="white" textAlign="center">Timed-In</Th>
            <Th color="white" textAlign="center">Timed-Out</Th>
            <Th color="white" textAlign="center">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {bookings && bookings.length > 0 ? (
            bookings.map((item, index) => (
              item.students.map((student, studentIndex) => (
                <Tr key={`${index}-${studentIndex}`}>
                  <Td textAlign="center">{new Date(item._date).toLocaleDateString()}</Td>
                  <Td textAlign="center">{`${item._timeSlot.startTime} - ${item._timeSlot.endTime}`.toUpperCase()}</Td>
                  <Td textAlign="center">{student._studentId._fName.toUpperCase()}</Td>
                  <Td textAlign="center">{student._studentId._lName.toUpperCase()}</Td>
                  <Td textAlign="center">{student._bookingStatus}</Td>
                  <Td textAlign="center">
                    {student._timedIn ? new Date(student._timedIn).toLocaleTimeString() : '--'}
                  </Td>
                  <Td textAlign="center">
                    {student._timedOut ? new Date(student._timedOut).toLocaleTimeString() : '--'}
                  </Td>
                  <Td textAlign="center">
                    <IconButton
                      icon={<InfoIcon />}
                      variant="ghost"
                      size="sm"
                      color="#FE7654"
                      _hover={{ bg: 'rgba(254, 118, 84, 0.1)', color: '#e65c3b' }}
                      onClick={() => handleViewDetails(student, item)}
                    />
                  </Td>
                </Tr>
              ))
            ))
          ) : (
            <Tr>
              <Td colSpan={9} textAlign="center">No data available</Td>
            </Tr>
          )}
        </Tbody>
        </Table>
      </TableContainer>

      {/* Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent maxW="50%">
          <ModalHeader bg="#071434" color="white" roundedTop="md">Student Booking Details</ModalHeader>
          <ModalBody p={8}>
            {selectedStudent && (
              <Box>
                <Text fontSize="lg" fontWeight="bold" mb={4} color="#071434">Student Information</Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={8}>
                  <Box>
                    <Text mb={2} color="gray.700">Name</Text>
                    <Input
                      value={`${selectedStudent._studentId._fName} ${selectedStudent._studentId._lName}`.toUpperCase()}
                      bg="white"
                      boxShadow="lg"
                      isReadOnly
                    />
                  </Box>
                  <Box>
                    <Text mb={2} color="gray.700">Student ID</Text>
                    <Input
                      value={selectedStudent._studentId._umakEmail.toUpperCase()}
                      bg="white"
                      boxShadow="lg"
                      isReadOnly
                    />
                  </Box>
                  <Box>
                    <Text mb={2} color="gray.700">Sex</Text>
                    <Input
                      value={selectedStudent._studentId._sex.toUpperCase()}
                      bg="white"
                      boxShadow="lg"
                      isReadOnly
                    />
                  </Box>
                  <Box>
                    <Text mb={2} color="gray.700">College</Text>
                    <Input
                      value={selectedStudent._studentId._college.toUpperCase()}
                      bg="white"
                      boxShadow="lg"
                      isReadOnly
                    />
                  </Box>
                  <Box>
                    <Text mb={2} color="gray.700">Course</Text>
                    <Input
                      value={selectedStudent._studentId._course.toUpperCase()}
                      bg="white"
                      boxShadow="lg"
                      isReadOnly
                    />
                  </Box>
                  <Box>
                    <Text mb={2} color="gray.700">Year & Section</Text>
                    <Input
                      value={`${selectedStudent._studentId._year}-${selectedStudent._studentId._section}`.toUpperCase()}
                      bg="white"
                      boxShadow="lg"
                      isReadOnly
                    />
                  </Box>
                  <Box>
                    <Text mb={2} color="gray.700">Email</Text>
                    <Input
                      value={selectedStudent._studentId._umakEmail.toUpperCase()}
                      bg="white"
                      boxShadow="lg"
                      isReadOnly
                    />
                  </Box>
                  <Box>
                    <Text mb={2} color="gray.700">Status</Text>
                    <Input
                      value={selectedStudent._studentId._activeStat ? "ACTIVE" : "INACTIVE"}
                      bg="white"
                      boxShadow="lg"
                      isReadOnly
                    />
                  </Box>
                  <Box gridColumn="span 2">
                    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                      <Box>
                        <Text mb={2} color="gray.700">Attended</Text>
                        <Input
                          value={selectedStudent._studentId._attendedSlots || 0}
                          bg="white"
                          boxShadow="lg"
                          isReadOnly
                        />
                      </Box>
                      <Box>
                        <Text mb={2} color="gray.700">Cancellations/No Shows</Text>
                        <Input
                          value={selectedStudent._studentId._noShows || 0}
                          bg="white"
                          boxShadow="lg"
                          isReadOnly
                        />
                      </Box>
                      <Box>
                        <Text mb={2} color="gray.700">Unsuccessful</Text>
                        <Input
                          value={selectedStudent._studentId._unsuccessfulAttempts || 0}
                          bg="white"
                          boxShadow="lg"
                          isReadOnly
                        />
                      </Box>
                    </Grid>
                  </Box>
                </Grid>
      
                <Text fontSize="lg" fontWeight="bold" mb={4} color="#071434">Booking Information</Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  <Box>
                    <Text mb={2} color="gray.700">Date</Text>
                    <Input
                      value={new Date(selectedStudent.bookingInfo._date).toLocaleDateString()}
                      bg="white"
                      boxShadow="lg"
                      isReadOnly
                    />
                  </Box>
                  <Box>
                    <Text mb={2} color="gray.700">Time Slot</Text>
                    <Input
                      value={`${selectedStudent.bookingInfo._timeSlot.startTime} - ${selectedStudent.bookingInfo._timeSlot.endTime}`}
                      bg="white"
                      boxShadow="lg"
                      isReadOnly
                    />
                  </Box>
                  <Box>
                    <Text mb={2} color="gray.700">Booking Status</Text>
                    <Input
                      value={selectedStudent._bookingStatus}
                      bg="white"
                      boxShadow="lg"
                      isReadOnly
                    />
                  </Box>
                  <Box>
                    <Text mb={2} color="gray.700">Priority Score</Text>
                    <Input
                      value={selectedStudent._priorityScore}
                      bg="white"
                      boxShadow="lg"
                      isReadOnly
                    />
                  </Box>
                  <Box>
                    <Text mb={2} color="gray.700">Timed-In</Text>
                    <Input
                      value={selectedStudent._timedIn ? new Date(selectedStudent._timedIn).toLocaleTimeString() : 'Not yet timed in'}
                      bg="white"
                      boxShadow="lg"
                      isReadOnly
                    />
                  </Box>
                  <Box>
                    <Text mb={2} color="gray.700">Timed-Out</Text>
                    <Input
                      value={selectedStudent._timedOut ? new Date(selectedStudent._timedOut).toLocaleTimeString() : 'Not yet timed out'}
                      bg="white"
                      boxShadow="lg"
                      isReadOnly
                    />
                  </Box>
                </Grid>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              bgColor='#FE7654' 
              color='white' 
              _hover={{ bg: '#e65c3b' }} 
              _active={{ bg: '#cc4a2d' }}
              px={6} 
              py={2} 
              rounded="md"
              onClick={onClose}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BookingTable;