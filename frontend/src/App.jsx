import { Flex } from "@chakra-ui/react";
import { Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SideMenu from "./components/SideMenu";
import SchedulePage from "./pages/SchedulePage";
import WalkinBookingPage from "./pages/WalkinBookingPage";
import QueueManPage from "./pages/QueueManPage";


function App() {
  const location = useLocation();

  return (
    <Flex>
      {(location.pathname !== '/' && location.pathname !== '/login') && <SideMenu />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/walkin" element={<WalkinBookingPage />} />
        <Route path="/queue" element={<QueueManPage />} />
      </Routes>
    </Flex>
  );
}

export default App;
