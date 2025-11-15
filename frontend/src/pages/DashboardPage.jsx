import PropTypes from "prop-types";
import { SimpleGrid, Stack } from "@chakra-ui/react";
import { GrSchedules } from "react-icons/gr";
import { AiOutlineSchedule } from "react-icons/ai";
import { ImTable } from "react-icons/im";
import { FaUsersBetweenLines } from "react-icons/fa6";
import { RiFeedbackLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import DashboardButtons from "../components/DashboardButtons.jsx";
import PageContainer from "../components/PageContainer.jsx";

const DashboardPage = ({ onOpenMenu }) => {
  const navigate = useNavigate();

  return (
    <PageContainer title="Dashboard" onOpenMenu={onOpenMenu}>
      <Stack spacing={{ base: 6, md: 10 }}>
        <SimpleGrid
          columns={{ base: 1, sm: 2, xl: 3 }}
          spacing={{ base: 4, md: 6, xl: 8 }}
          w="full"
        >
          <DashboardButtons
            text="Schedule Management"
            icon={GrSchedules}
            onClick={() => navigate("/schedule")}
          />
          <DashboardButtons
            text="Walk-In Booking"
            icon={AiOutlineSchedule}
            onClick={() => navigate("/walkin")}
          />
          <DashboardButtons
            text="Queue Management"
            onClick={() => navigate("/queue")}
            icon={ImTable}
          />
          <DashboardButtons
            text="Booking Management"
            onClick={() => navigate("/booking")}
            icon={ImTable}
          />
          <DashboardButtons text="User Management" icon={FaUsersBetweenLines} />
          <DashboardButtons
            text="Feedback Management"
            onClick={() => navigate("/feedback")}
            icon={RiFeedbackLine}
          />
        </SimpleGrid>
      </Stack>
    </PageContainer>
  );
};

export default DashboardPage;

DashboardPage.propTypes = {
  onOpenMenu: PropTypes.func,
};