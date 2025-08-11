import { 
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Box, Flex, Input, 
  Select, IconButton
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

const FeedbackTable = () => {
  return (
    <Box mt={8}>
      <Flex gap={4} mb={5} justifyContent="space-between">
        <Flex gap={2}>
          <Input
            type="date"
            value={''}
            onChange={''}
            placeholder="Select Date (yyyy-mm-dd)"
            bg="white" boxShadow="lg" 
          />
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
              <Th color="white" textAlign="center" h="30px">Date</Th>
              <Th color="white" textAlign="center">Name</Th>
              <Th color="white" textAlign="center">UMak Email</Th>
              <Th color="white" textAlign="center">Category</Th>
              <Th color="white" textAlign="center">Title</Th>
              <Th color="white" textAlign="center">Sentiment</Th>
               <Th color="white" textAlign="center">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td textAlign="center">2024-10-09</Td>
              <Td textAlign="center">JUAN DELA CRUZ</Td>
              <Td textAlign="center">JUAN.DELACRUZ@UMAK.EDU.PH</Td>
              <Td textAlign="center">EQUIPMENT</Td>
              <Td textAlign="center">GREAT GYM FACILITIES</Td>
              <Td textAlign="center">POSITIVE</Td>
              <Td textAlign="center">
                <IconButton
                  icon={<InfoIcon />}
                  variant="ghost"
                  size="sm"
                  color="#FE7654"
                  _hover={{ bg: 'rgba(254, 118, 84, 0.1)', color: '#e65c3b' }}
                />
              </Td>
            </Tr>
            <Tr>
              <Td textAlign="center">2024-10-09</Td>
              <Td textAlign="center">MARIA SANTOS</Td>
              <Td textAlign="center">MARIA.SANTOS@UMAK.EDU.PH</Td>
              <Td textAlign="center">STAFF</Td>
              <Td textAlign="center">HELPFUL STAFF MEMBERS</Td>
              <Td textAlign="center">POSITIVE</Td>
              <Td textAlign="center">
                <IconButton
                  icon={<InfoIcon />}
                  variant="ghost"
                  size="sm"
                  color="#FE7654"
                  _hover={{ bg: 'rgba(254, 118, 84, 0.1)', color: '#e65c3b' }}
                />
              </Td>
            </Tr>
            <Tr>
              <Td textAlign="center">2024-10-09</Td>
              <Td textAlign="center">PEDRO REYES</Td>
              <Td textAlign="center">PEDRO.REYES@UMAK.EDU.PH</Td>
              <Td textAlign="center">CLEANLINESS</Td>
              <Td textAlign="center">NEEDS IMPROVEMENT</Td>
              <Td textAlign="center">NEGATIVE</Td>
              <Td textAlign="center">
                <IconButton
                  icon={<InfoIcon />}
                  variant="ghost"
                  size="sm"
                  color="#FE7654"
                  _hover={{ bg: 'rgba(254, 118, 84, 0.1)', color: '#e65c3b' }}
                />
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>

      
      
    </Box>
  );
};

export default FeedbackTable;