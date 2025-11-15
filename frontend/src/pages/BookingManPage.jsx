import PropTypes from "prop-types";
import { Box, Flex } from "@chakra-ui/react";
import BookingTable from "../components/BookingTable";
import PageContainer from "../components/PageContainer";

const BookingManPage = ({ onOpenMenu }) => {
  return (
    <PageContainer title="Booking Management" onOpenMenu={onOpenMenu}>
      <Flex direction="column" gap={{ base: 4, md: 6 }}>
        <Box bg="white" borderRadius="lg" boxShadow="md" p={{ base: 4, md: 6 }}>
          <BookingTable />
        </Box>
      </Flex>
    </PageContainer>
  );
};

BookingManPage.propTypes = {
  onOpenMenu: PropTypes.func,
};

export default BookingManPage;