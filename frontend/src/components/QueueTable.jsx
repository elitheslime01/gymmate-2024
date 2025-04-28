import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Box, Flex, Input, Select } from "@chakra-ui/react";
import { useState, useEffect } from 'react';
import useQueueStore from "../store/queue";

const QueueTable = () => {
  const { queues, setDate, setTimeSlot, fetchQueues, clearQueues } = useQueueStore();
  const [date, setDateState] = useState("");
  const [timeSlot, setTimeSlotState] = useState({ startTime: "", endTime: "" });

  // Clear data when component unmounts
  useEffect(() => {
    return () => {
      clearQueues();
    };
  }, [clearQueues]);

  // Reset states when date changes
  const handleDateChange = (e) => {
    clearQueues(); // Clear existing data
    setDateState(e.target.value);
    setDate(e.target.value);
    setTimeSlotState({ startTime: "", endTime: "" });
    setTimeSlot({ startTime: "", endTime: "" });
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
        </Flex>
      </Flex>
      <TableContainer
        style={{
          maxHeight: "500px", 
          height: "500px",
          overflowY: "auto",
        }}
      >
        <Table bg="white" size="sm">
          <Thead bg="#071434" position="sticky" top={0} zIndex={1}>
            <Tr>
              <Th color="white" textAlign="center" h="30px">Date</Th>
              <Th color="white" textAlign="center">First Name</Th>
              <Th color="white" textAlign="center">Last Name</Th>
              <Th color="white" textAlign="center">Queue Status</Th>
              <Th color="white" textAlign="center">Priority Score</Th>
            </Tr>
          </Thead>
          <Tbody>
            {queues && queues.length > 0 ? (
              queues.map((item, index) => (
                item.students.map((student, studentIndex) => (
                  <Tr key={`${index}-${studentIndex}`}>
                    <Td textAlign="center">{new Date(item._date).toLocaleDateString()}</Td> 
                    <Td textAlign="center">{student._studentId._fName}</Td>
                    <Td textAlign="center">{student._studentId._lName}</Td>
                    <Td textAlign="center">{student._queueStatus}</Td>
                    <Td textAlign="center">{student._priorityScore}</Td>
                  </Tr>
                ))
              ))
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center">No data available</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default QueueTable;