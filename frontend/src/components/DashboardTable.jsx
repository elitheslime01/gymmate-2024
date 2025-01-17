
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Box } from "@chakra-ui/react";

const DashboardTable = () => {
  const data = [
    { studentId: "S001", name: "Alice Johnson", bookedSchedule: "2023-10-01 10:00 AM", bookingStatus: "Confirmed" },
    { studentId: "S002", name: "Bob Smith", bookedSchedule: "2023-10-02 11:00 AM", bookingStatus: "Pending" },
    { studentId: "S003", name: "Charlie Brown", bookedSchedule: "2023-10-03 1:00 PM", bookingStatus: "Cancelled" },
    { studentId: "S004", name: "Diana Prince", bookedSchedule: "2023-10-04 3:00 PM", bookingStatus: "Confirmed" },
    { studentId: "S005", name: "Ethan Hunt", bookedSchedule: "2023-10-05 2:00 PM", bookingStatus: "Pending" },
  ];

  return (
    <Box mb={0}>
      <TableContainer borderTopRadius='lg' overflow='hidden'>
        <Table bg='white' size='sm'>
          <Thead bg='#071434'>
            <Tr>
              <Th color='white'>Student ID</Th>
              <Th color='white'>Name</Th>
              <Th color='white'>Booked Schedule</Th>
              <Th color='white'>Booking Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((item, index) => (
              <Tr key={index}>
                <Td>{item.studentId}</Td>
                <Td>{item.name}</Td>
                <Td>{item.bookedSchedule}</Td>
                <Td>{item.bookingStatus}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DashboardTable;