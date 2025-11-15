import PropTypes from "prop-types";
import { Box, Flex } from "@chakra-ui/react";
import QueueTable from "../components/QueueTable";
import PageContainer from "../components/PageContainer";

const QueueManPage = ({ onOpenMenu }) => {
    return (
        <PageContainer title="Queue Management" onOpenMenu={onOpenMenu}>
            <Flex direction="column" gap={{ base: 4, md: 6 }}>
                <Box bg="white" borderRadius="lg" boxShadow="md" p={{ base: 4, md: 6 }}>
                    <QueueTable />
                </Box>
            </Flex>
        </PageContainer>
    );
};

QueueManPage.propTypes = {
    onOpenMenu: PropTypes.func,
};

export default QueueManPage;