import PropTypes from "prop-types";
import { Box, Flex } from "@chakra-ui/react";
import PageContainer from "../components/PageContainer";
import UserTable from "../components/UserTable";

const UserManPage = ({ onOpenMenu }) => {
  return (
    <PageContainer title="User Management" onOpenMenu={onOpenMenu}>
      <Flex direction="column" gap={{ base: 4, md: 6 }}>
        <Box bg="white" borderRadius="lg" boxShadow="md" p={{ base: 4, md: 6 }}>
          <UserTable />
        </Box>
      </Flex>
    </PageContainer>
  );
};

UserManPage.propTypes = {
  onOpenMenu: PropTypes.func,
};

export default UserManPage;
