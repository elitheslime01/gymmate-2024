import {
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  useDisclosure,
} from "@chakra-ui/react";
import { Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SideMenu from "./components/SideMenu";
import SchedulePage from "./pages/SchedulePage";
import WalkinBookingPage from "./pages/WalkinBookingPage";
import QueueManPage from "./pages/QueueManPage";
import BookingManPage from "./pages/BookingManPage";
import FeedbackManPage from "./pages/FeedbackManPage";


function App() {
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isAuthRoute = location.pathname === "/" || location.pathname === "/login";

  return (
    <Flex minH="100vh" bg="gray.100">
      {!isAuthRoute && (
        <>
          <Box display={{ base: "none", lg: "flex" }} position="sticky" top={0} h="100vh">
            <SideMenu />
          </Box>
          <Drawer placement="left" onClose={onClose} isOpen={isOpen} size="xs">
            <DrawerOverlay />
            <DrawerContent maxW="280px">
              <SideMenu onNavigate={onClose} />
            </DrawerContent>
          </Drawer>
        </>
      )}
      <Box flex="1" minH="100vh">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage onOpenMenu={onOpen} />} />
          <Route path="/schedule" element={<SchedulePage onOpenMenu={onOpen} />} />
          <Route path="/walkin" element={<WalkinBookingPage onOpenMenu={onOpen} />} />
          <Route path="/queue" element={<QueueManPage onOpenMenu={onOpen} />} />
          <Route path="/booking" element={<BookingManPage onOpenMenu={onOpen} />} />
          <Route path="/feedback" element={<FeedbackManPage onOpenMenu={onOpen} />} />
        </Routes>
      </Box>
    </Flex>
  );
}

export default App;
