import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Input,
  Select,
  useToast,
  IconButton,
  Spinner,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Text,
  Grid,
  Image,
  Center,
  VStack,
  Stack,
} from "@chakra-ui/react";
import { RepeatIcon, InfoIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef, useCallback } from 'react';
import useQueueStore from "../store/queue";
import ArImageViewer from "./ArImageViewer";

const QueueTable = () => {
  const {
    queues,
    setDate,
    setTimeSlot,
    fetchQueues,
    fetchQueuesByDate,
    clearQueues,
    allocateStudents,
    fetchAllCurrentMonthQueues,
    refreshQueueData,
    autoAllocationIntervalMinutes,
  } = useQueueStore();
  const [date, setDateState] = useState("");
  const toast = useToast();
  const [timeSlot, setTimeSlotState] = useState({ startTime: "", endTime: "" });
  const [isAllocating, setIsAllocating] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [arImageData, setArImageData] = useState(null);
  const [isArImageLoading, setIsArImageLoading] = useState(false);
  const [arImageError, setArImageError] = useState(null);
  const detailsDisclosure = useDisclosure();
  const imageDisclosure = useDisclosure();
  const { isOpen, onOpen, onClose } = detailsDisclosure;
  const {
    isOpen: isViewerOpen,
    onOpen: onViewerOpen,
    onClose: onViewerClose,
  } = imageDisclosure;
  const allocationInProgressRef = useRef(false);

  const fetchArImage = async (studentId) => {
    setIsArImageLoading(true);
    setArImageError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/arImage/${studentId}`);
      const result = await response.json().catch(() => null);

      if (response.ok && result?.success && result?.data?._dataUrl) {
        setArImageData(result.data);
      } else {
        const message = result?.message || "No AR image available.";
        setArImageData(null);
        setArImageError(message);
      }
    } catch (error) {
      console.error("Error fetching AR image:", error.message);
      setArImageError("Unable to load AR image.");
      setArImageData(null);
    } finally {
      setIsArImageLoading(false);
    }
  };

  const handleViewDetails = (student, queueInfo) => {
  onViewerClose();
  const studentDetails = { ...student, queueInfo };
    setSelectedStudent(studentDetails);
    setArImageData(null);
    setArImageError(null);
    onOpen();

    if (studentDetails?._studentId?._id) {
      fetchArImage(studentDetails._studentId._id);
    }
  };

  const handleModalClose = () => {
    setSelectedStudent(null);
    setArImageData(null);
    setArImageError(null);
    onViewerClose();
    onClose();
  };
  // // Clear data when component unmounts
  // useEffect(() => {
  //   fetchAllCurrentMonthQueues();
  //   return () => {
  //     clearQueues();
  //   };
  // }, [fetchAllCurrentMonthQueues, clearQueues]);

  // Add polling interval
  useEffect(() => {
    // Initial fetch
    fetchAllCurrentMonthQueues();
    
    // // Set up polling every 5 seconds
    // const intervalId = setInterval(() => {
    //   if (date && timeSlot.startTime && timeSlot.endTime) {
    //     fetchQueues(date, timeSlot);
    //   } else {
    //     fetchAllCurrentMonthQueues();
    //   }
    // }, 5000); // 5000ms = 5 seconds

    // Cleanup on unmount
    return () => {
      // clearInterval(intervalId);
      clearQueues();
    };
  }, [fetchAllCurrentMonthQueues, fetchQueues, date, timeSlot, clearQueues]);

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
    // Clear timeslot selection
    setTimeSlotState({ startTime: "", endTime: "" });
    setTimeSlot({ startTime: "", endTime: "" });
    
    if (!e.target.value) {
      // If date is cleared, show all current month queues
      fetchAllCurrentMonthQueues();
    } else {
      // If date is selected, show all queues for that date
      fetchQueuesByDate(e.target.value);
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

  const runAllocation = useCallback(
    async (trigger = "manual") => {
      if (allocationInProgressRef.current) {
        return;
      }

      allocationInProgressRef.current = true;

      if (trigger === "manual") {
        setIsAllocating(true);
      }

      try {
        const result = await allocateStudents();

        if (result?.success) {
          if (trigger === "manual") {
            toast({
              title: "Allocation Complete",
              description: `Successfully allocated ${result.data.totalAllocated} students`,
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          }

          await refreshQueueData();
        } else {
          if (trigger === "manual") {
            toast({
              title: "Allocation Failed",
              description: result?.error || result?.message || "Failed to allocate students",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          } else {
            console.warn("Automatic allocation attempt did not succeed.", result);
          }
        }
      } catch (error) {
        console.error("Error allocating students:", error);
        if (trigger === "manual") {
          toast({
            title: "Allocation Error",
            description: error.message || "Unexpected error during allocation.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } finally {
        if (trigger === "manual") {
          setIsAllocating(false);
        }
        allocationInProgressRef.current = false;
      }
    },
    [allocateStudents, refreshQueueData, toast]
  );

  const handleAllocate = () => {
    void runAllocation("manual");
  };

  useEffect(() => {
    const intervalMinutes = autoAllocationIntervalMinutes;
    if (!intervalMinutes || intervalMinutes <= 0) {
      return undefined;
    }

    const intervalMs = intervalMinutes * 60 * 1000;
    const intervalId = setInterval(() => {
      void runAllocation("auto");
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [autoAllocationIntervalMinutes, runAllocation]);

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
      <Stack
        direction={{ base: "column", xl: "row" }}
        spacing={{ base: 4, md: 6 }}
        mb={{ base: 6, md: 8 }}
        justify="space-between"
        align={{ base: "stretch", xl: "center" }}
      >
        <Stack
          direction={{ base: "column", md: "row" }}
          spacing={{ base: 3, md: 4 }}
          w={{ base: "100%", xl: "auto" }}
        >
          <Input
            type="date"
            value={date}
            onChange={handleDateChange}
            placeholder="Select Date (yyyy-mm-dd)"
            bg="white"
            boxShadow="lg"
            maxW={{ base: "100%", md: "220px" }}
          />
          <Select
            bg="white"
            boxShadow="lg"
            name="startTime"
            value={timeSlot.startTime}
            onChange={handleTimeSlotChange}
            maxW={{ base: "100%", md: "220px" }}
          >
            <option value="">Select Time Slot</option>
            <option value="08:00 AM">08:00 AM - 10:00 AM</option>
            <option value="10:00 AM">10:00 AM - 12:00 PM</option>
            <option value="12:00 PM">12:00 PM - 02:00 PM</option>
            <option value="02:00 PM">02:00 PM - 04:00 PM</option>
          </Select>
        </Stack>
        <Stack
          direction={{ base: "column", md: "row" }}
          spacing={{ base: 3, md: 4 }}
          w={{ base: "100%", xl: "auto" }}
          align={{ base: "stretch", md: "center" }}
        >
          <Select bg="white" boxShadow="lg" maxW={{ base: "100%", md: "220px" }}>
            <option value="option1">Student ID</option>
            <option value="option2">Umak Email</option>
          </Select>
          <Input bg="white" boxShadow="lg" placeholder="Search" maxW={{ base: "100%", md: "220px" }} />
          <IconButton
            icon={isAllocating ? <Spinner size="sm" /> : <RepeatIcon />}
            aria-label="Allocate Students"
            bg="#FE7654"
            color="white"
            _hover={{ bg: "#e65c3b" }}
            onClick={handleAllocate}
            isLoading={isAllocating}
            alignSelf={{ base: "flex-start", md: "center" }}
            minW={{ base: "100%", md: "auto" }}
          />
        </Stack>
      </Stack>
      <TableContainer overflowX="auto">
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
      <Modal isOpen={isOpen} onClose={handleModalClose} isCentered size="2xl">
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }} maxW={{ base: "100%", md: "2xl" }}>
          <ModalHeader bg="#071434" color="white" roundedTop="md">Student Queue Details</ModalHeader>
          <ModalBody p={8}>
            {selectedStudent && (
              <Box>
                {/* Student Information Section */}
                <Text fontSize="lg" fontWeight="bold" mb={4} color="#071434">Student Information</Text>
                <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={6} mb={8}>
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
                  <Box gridColumn={{ base: "span 1", md: "span 2" }}>
                    <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={4}>
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

                {/* Queue Information Section */}
                <Text fontSize="lg" fontWeight="bold" mb={4} color="#071434">Queue Information</Text>
                <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={6}>
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
                    <Text mb={2} color="gray.700">Queued At</Text>
                    <Input
                      value={new Date(selectedStudent._queuedAt).toLocaleTimeString()}
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

                {/* AR Image Section */}
                <Text fontSize="lg" fontWeight="bold" mb={4} mt={6} color="#071434">Acknowledgement Receipt</Text>
                <Box mb={8} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200" p={4}>
                  {isArImageLoading ? (
                    <Center py={10}>
                      <Spinner size="lg" color="#FE7654" />
                    </Center>
                  ) : arImageData ? (
                    <VStack spacing={4}>
                      <Image
                        src={arImageData._dataUrl}
                        alt="Uploaded acknowledgement receipt"
                        maxH="320px"
                        objectFit="contain"
                        borderRadius="md"
                        boxShadow="md"
                        bg="white"
                      />
                      <Button
                        size="sm"
                        bgColor="#FE7654"
                        color="white"
                        _hover={{ bg: "#e65c3b" }}
                        _active={{ bg: "#cc4a2d" }}
                        onClick={onViewerOpen}
                      >
                        View full size
                      </Button>
                      {arImageData._contentType && (
                        <Text fontSize="sm" color="gray.600">
                          Format: {arImageData._contentType}
                        </Text>
                      )}
                    </VStack>
                  ) : (
                    <Text textAlign="center" color="gray.600">
                      {arImageError || "No AR image uploaded for this student."}
                    </Text>
                  )}
                </Box>
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
              onClick={handleModalClose}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ArImageViewer
        isOpen={isViewerOpen}
        onClose={onViewerClose}
        imageSrc={arImageData?._dataUrl}
        contentType={arImageData?._contentType}
        title={selectedStudent ? `${selectedStudent._studentId._fName} ${selectedStudent._studentId._lName} - Acknowledgement Receipt` : undefined}
      />
    </Box>
  );
};

export default QueueTable;