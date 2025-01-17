import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Box, Flex, Input, Select } from "@chakra-ui/react";
import { useState, useEffect } from 'react';
import useQueueStore from "../store/queue";

const QueueTable = () => {
  const { queues, setDate, setTimeSlot, fetchQueues } = useQueueStore();
  const [date, setDateState] = useState("");
  const [timeSlot, setTimeSlotState] = useState({ startTime: "", endTime: "" });

  const handleDateChange = (e) => {
    setDateState(e.target.value);
    setDate(e.target.value);
    console.log("Date changed:", e.target.value);
  };

  const handleTimeSlotChange = (e) => {
    const { name, value } = e.target;
    if (name === "startTime") {
      setTimeSlotState({ ...timeSlot, startTime: value, endTime: "10:00 AM" });
      setTimeSlot({ ...timeSlot, startTime: value, endTime: "10:00 AM" });
    } else if (name === "endTime") {
      setTimeSlotState({ ...timeSlot, endTime: value });
      setTimeSlot({ ...timeSlot, endTime: value });
    }
    console.log("Time slot changed:", value);
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
              <Th color="white" textAlign="center" w="20%" >Date</Th>
              <Th color="white" textAlign="center">First Name</Th>
              <Th color="white" textAlign="center">Last Name</Th>
              <Th color="white" textAlign="center">Queue Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {queues && queues.length > 0 ? (
              queues.map((item, index) => (
                item.students.map((student, studentIndex) => (
                  <Tr key={`${index}-${studentIndex}`}>
                    <Td>{new Date(item._date).toLocaleDateString()}</Td> 
                    <Td>{student._studentId._fName}</Td>
                    <Td>{student._studentId._lName}</Td>
                    <Td>{student._queueStatus}</Td>
                  </Tr>
                ))
              ))
            ) : (
              <Tr>
                <Td colSpan={4} textAlign="center">No data available</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default QueueTable;