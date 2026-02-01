import { Box, Button, Flex, Icon, Text, VStack, useToast } from "@chakra-ui/react";
import {
  MdAccountCircle,
  MdDashboard,
  MdLogout,
  MdOutlineSchedule,
  MdSettings,
  MdPeople,
} from "react-icons/md";
import { GrSchedules } from "react-icons/gr";
import { GiWalk } from "react-icons/gi";
import { ImTable } from "react-icons/im";
import { RiFeedbackLine } from "react-icons/ri";
import PropTypes from "prop-types";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAdminStore } from "../store/admin.js";
import useScheduleStore from "../store/schedule.js";

const menuItems = [
  { label: "Dashboard", icon: MdDashboard, path: "/dashboard" },
  { label: "Schedule", icon: GrSchedules, path: "/schedule" },
  { label: "Walk-In", icon: GiWalk, path: "/walkin" },
  { label: "Queue", icon: MdOutlineSchedule, path: "/queue" },
  { label: "Booking", icon: ImTable, path: "/booking" },
  { label: "Feedback", icon: RiFeedbackLine, path: "/feedback" },
  { label: "Users", icon: MdPeople, path: "/users" },
];

const SideMenu = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAdminStore();
  const toast = useToast();
  const { setCurrentDate, setSelectedDay, setSelectedTime } = useScheduleStore();

  useEffect(() => {
    return () => {
      setCurrentDate(new Date());
      setSelectedDay(null);
      setSelectedTime(null);
    };
  }, [setCurrentDate, setSelectedDay, setSelectedTime]);

  const handleNavigate = (path) => {
    navigate(path);
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleLogout = () => {
    logout();

    toast({
      title: "Logged out",
      description: "You have successfully logged out.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    navigate("/");
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <Box
      as="nav"
      bg="#071434"
      color="white"
      w={{ base: "100%", lg: "260px" }}
      maxW={{ base: "100%", lg: "260px" }}
      minH={{ base: "100%", lg: "100vh" }}
      h="full"
      px={{ base: 6, md: 6 }}
      py={{ base: 6, md: 8 }}
      display="flex"
      flexDirection="column"
      gap={8}
      overflowY="auto"
    >
      <Flex direction="column" gap={6}>
        <Flex align="center" gap={3}>
          <Icon as={MdAccountCircle} boxSize={6} />
          <Box>
            <Text fontWeight="semibold" fontSize="lg">
              Admin Panel
            </Text>
            <Text fontSize="sm" color="gray.300">
              Manage operations
            </Text>
          </Box>
        </Flex>
        <VStack align="stretch" spacing={1}>
          {menuItems.map(({ label, icon, path }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <Flex
                key={path}
                as="button"
                onClick={() => handleNavigate(path)}
                align="center"
                gap={3}
                px={3}
                py={3}
                borderRadius="md"
                bg={isActive ? "rgba(255,255,255,0.12)" : "transparent"}
                color="white"
                _hover={{ bg: "rgba(255,255,255,0.18)" }}
                transition="background-color 0.2s ease"
              >
                <Icon as={icon} boxSize={5} />
                <Text fontWeight="medium" fontSize="sm">
                  {label}
                </Text>
              </Flex>
            );
          })}
        </VStack>
      </Flex>

      <Flex direction="column" gap={2} mt="auto">
        <Flex
          align="center"
          gap={3}
          px={3}
          py={3}
          borderRadius="md"
          bg="rgba(255,255,255,0.08)"
        >
          <Icon as={MdSettings} boxSize={5} />
          <Text fontSize="sm">Settings</Text>
        </Flex>
        <Button
          leftIcon={<Icon as={MdLogout} />}
          bg="#FE7654"
          color="white"
          _hover={{ bg: "#e65c3b" }}
          _active={{ bg: "#cc4a2d" }}
          onClick={handleLogout}
        >
          Log out
        </Button>
      </Flex>
    </Box>
  );
};

SideMenu.propTypes = {
  onNavigate: PropTypes.func,
};

export default SideMenu;