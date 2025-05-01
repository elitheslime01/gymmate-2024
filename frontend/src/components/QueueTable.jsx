import { 
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Box, Flex, Input, 
  Select, useToast, IconButton, Spinner, Button, Modal, ModalOverlay, 
  ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Text, Grid
} from "@chakra-ui/react";
import { RepeatIcon, InfoIcon } from "@chakra-ui/icons";
import { useState, useEffect } from 'react';
import useQueueStore from "../store/queue";

const QueueTable = () => {
  const { queues, setDate, setTimeSlot, fetchQueues, clearQueues, allocateStudents, fetchAllCurrentMonthQueues } = useQueueStore();  const [date, setDateState] = useState("");
  const toast = useToast();
  const [timeSlot, setTimeSlotState] = useState({ startTime: "", endTime: "" });
  const [isAllocating, setIsAllocating] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleViewDetails = (student, queueInfo) => {
    setSelectedStudent({ ...student, queueInfo });
    onOpen();
  };
  // Clear data when component unmounts
  useEffect(() => {
    fetchAllCurrentMonthQueues();
    return () => {
      clearQueues();
    };
  }, [fetchAllCurrentMonthQueues, clearQueues]);

  // Modify the existing useEffect to only fetch filtered data when date and timeSlot are selected
  useEffect(() => {
    if (date && timeSlot.startTime && timeSlot.endTime) {
      fetchQueues(date, timeSlot);
    }
  }, [date, timeSlot, fetchQueues]);

  // Reset states when date changes
  // Update handleDateChange to not clear queues immediately
  const handleDateChange = (e) => {
    setDateState(e.target.value);
    setDate(e.target.value);
    setTimeSlotState({ startTime: "", endTime: "" });
    setTimeSlot({ startTime: "", endTime: "" });
    
    // If date is cleared, show all current month queues
    if (!e.target.value) {
      fetchAllCurrentMonthQueues();
    }
  };

  // Reset data when time slot changes
  const handleTimeSlotChange = (e) => {
    const { name, value } = e.target;
    if (name === "startTime") {
      clearQueues(); // Clear existing data
      let endTime;
      switch(value) {
        case "08:00 AM": endTime = "10:00 AM"; break;
        case "10:00 AM": endTime = "12:00 PM"; break;
        case "12:00 PM": endTime = "02:00 PM"; break;
        case "02:00 PM": endTime = "04:00 PM"; break;
        default: endTime = "";
      }
      setTimeSlotState({ startTime: value, endTime });
      setTimeSlot({ startTime: value, endTime });
    }
  };

  const handleAllocate = async () => {
    if (!date || !timeSlot.startTime) {
      toast({
        title: "Selection Required",
        description: "Please select both date and time slot before allocating",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsAllocating(true);
    try {
      const result = await allocateStudents(date, timeSlot);
      
      if (result.success) {
        toast({
          title: "Allocation Complete",
          description: `Successfully allocated ${result.data.totalAllocated} students`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Allocation Failed",
          description: result.error || "Failed to allocate students",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsAllocating(false);
    }
  };

  useEffect(() => {
    if (date && timeSlot.startTime && timeSlot.endTime) {
      console.log("Condition met, calling fetchQueues");
      console.log("Fetching queues with date and time slot:", date, timeSlot);
      fetchQueues(date, timeSlot).then((data) => {
        console.log("Queues data:", data);
      });
    }
  }, [date, timeSlot, fetchQueues]);

  return (
    <Box mb={0}>
      <Flex gap={4} mb={8} justifyContent="space-between">
        <Flex gap={2}>
          <Input
            type="date"
            value={date}
            onChange={handleDateChange}
            placeholder="Select Date (yyyy-mm-dd)"
            bg="white" boxShadow="lg" 
          />
          <Select
            bg="white" boxShadow="lg" 
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
          <IconButton
            icon={isAllocating ? <Spinner size="sm" /> : <RepeatIcon />}
            aria-label="Allocate Students"
            bg="#FE7654"
            color="white"
            _hover={{ bg: '#e65c3b' }}
            onClick={handleAllocate}
            isLoading={isAllocating}
          />
        </Flex>
      </Flex>
      <TableContainer>
        <Table bg="white" size="sm">
          <Thead bg="#071434" position="sticky" top={0} zIndex={1}>
            <Tr>
              <Th color="white" textAlign="center" h="30px">Date</Th>
              <Th color="white" textAlign="center">Time Slot</Th>
              <Th color="white" textAlign="center">First Name</Th>
              <Th color="white" textAlign="center">Last Name</Th>
              <Th color="white" textAlign="center">Queue Status</Th>
              <Th color="white" textAlign="center">Priority Score</Th>
              <Th color="white" textAlign="center">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {queues && queues.length > 0 ? (
              queues.map((item, index) => (
                item.students.map((student, studentIndex) => (
                  <Tr key={`${index}-${studentIndex}`}>
                    <Td textAlign="center">{new Date(item._date).toLocaleDateString()}</Td>
                    <Td textAlign="center">{`${item._timeSlot.startTime} - ${item._timeSlot.endTime}`.toUpperCase()}</Td>
                    <Td textAlign="center">{student._studentId._fName.toUpperCase()}</Td>
                    <Td textAlign="center">{student._studentId._lName.toUpperCase()}</Td>
                    <Td textAlign="center">{student._queueStatus.toUpperCase()}</Td>
                    <Td textAlign="center">{student._priorityScore}</Td>
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
                <Td colSpan={7} textAlign="center">No data available</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="#071434" color="white" roundedTop="md">Student Queue Details</ModalHeader>
          <ModalBody p={8}>
            {selectedStudent && (
              <Box>
                {/* Student Information Section */}
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
                      value={selectedStudent._studentId._umakID.toUpperCase()}
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
                    <Text mb={2} color="gray.700">Attendance History</Text>
                    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                      <Input
                        value={`ATTENDED: ${selectedStudent._studentId._attendedSlots || 0}`}
                        bg="white"
                        boxShadow="lg"
                        isReadOnly
                      />
                      <Input
                        value={`NO SHOWS: ${selectedStudent._studentId._noShows || 0}`}
                        bg="white"
                        boxShadow="lg"
                        isReadOnly
                      />
                      <Input
                        value={`UNSUCCESSFUL: ${selectedStudent._studentId._unsuccessfulAttempts || 0}`}
                        bg="white"
                        boxShadow="lg"
                        isReadOnly
                      />
                    </Grid>
                  </Box>
                </Grid>
      
                {/* Queue Information Section */}
                <Text fontSize="lg" fontWeight="bold" mb={4} color="#071434">Queue Information</Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  <Box>
                    <Text mb={2} color="gray.700">Queue Date</Text>
                    <Input
                      value={new Date(selectedStudent.queueInfo._date).toLocaleDateString()}
                      bg="white"
                      boxShadow="lg"
                      isReadOnly
                    />
                  </Box>
                  <Box>
                    <Text mb={2} color="gray.700">Time Slot</Text>
                    <Input
                      value={`${selectedStudent.queueInfo._timeSlot.startTime} - ${selectedStudent.queueInfo._timeSlot.endTime}`}
                      bg="white"
                      boxShadow="lg"
                      isReadOnly
                    />
                  </Box>
                  <Box>
                    <Text mb={2} color="gray.700">Queue Status</Text>
                    <Input
                      value={selectedStudent._queueStatus.toUpperCase()}
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

export default QueueTable;