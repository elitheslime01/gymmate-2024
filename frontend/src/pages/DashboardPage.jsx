
import { Box, SimpleGrid, VStack, Heading} from "@chakra-ui/react";
import { GrSchedules } from "react-icons/gr";
import { AiOutlineSchedule } from "react-icons/ai";
import { ImTable } from "react-icons/im";
import { FaUsersBetweenLines } from "react-icons/fa6";
import { RiFeedbackLine } from "react-icons/ri";
import DashboardButtons from '../components/DashboardButtons.jsx';
import DashboardTable from "../components/DashboardTable.jsx";
import { useNavigate } from "react-router-dom";


const DashboardPage = () => {

  const navigate = useNavigate(); 

  return (
    <Box 
      bg='gray.300'
      w='80vw' 
      h='100vh'
      position='relative'
    >
      <VStack>
        <Box 
          bg='white' 
          w='80vw' 
          h='10vh'
          boxShadow='lg' 
          position='fixed'
          top={0}
          zIndex={1}
          alignContent='center'
          paddingLeft='5%'
        >
          <Heading as='h3' size='lg'>Dashboard</Heading>
        </Box>
        
        <Box
          bg='gray.100' 
          w='80vw' 
          h='90vh'
          position='absolute' 
          top='10vh' 
          bottom={0}
          p='5%'
        >
          <SimpleGrid columns={3} spacing={10}>
            <DashboardButtons
              text="Schedule Management" 
              icon={GrSchedules}
              onClick={() => navigate('/schedule')}
            />
            <DashboardButtons 
              text="Walk-In Booking" 
              icon={AiOutlineSchedule} 
              onClick={() => navigate('/walkin')}
            />
            <DashboardButtons 
              text="Queue Management" 
              onClick={() => navigate('/queue')}
              icon={ImTable} 
            />
            <DashboardButtons 
              text="Booking Management" 
              onClick={() => navigate('/booking')}
              icon={ImTable} 
            />
            <DashboardButtons 
              text="User Management" 
              icon={FaUsersBetweenLines} 
            />
            <DashboardButtons 
              text="Feedback Management" 
              icon={RiFeedbackLine} 
            />
          </SimpleGrid>

          <Box mt={4}>
            <DashboardTable /> 
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};
export default DashboardPage