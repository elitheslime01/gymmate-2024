import PropTypes from "prop-types";
import { Box, Stack } from "@chakra-ui/react";
import FeedbackSentimentLine from "../components/FeedbackSentimentLine.jsx";
import FeedbackSentimentStatus from "../components/FeedbackSentimentStatus.jsx";
import FeedbackTable from "../components/FeedbackTable.jsx";
import PageContainer from "../components/PageContainer";

const FeedbackManPage = ({ onOpenMenu }) => {
    return (
        <PageContainer title="Feedback Management" onOpenMenu={onOpenMenu}>
            <Stack spacing={{ base: 4, md: 6 }}>
                <Stack direction={{ base: "column", xl: "row" }} gap={{ base: 4, md: 6 }}>
                    <Box flex="2" bg="white" borderRadius="lg" boxShadow="md" p={{ base: 4, md: 6 }}>
                        <FeedbackSentimentLine />
                    </Box>
                    <Box flex="1" bg="white" borderRadius="lg" boxShadow="md" p={{ base: 4, md: 6 }}>
                        <FeedbackSentimentStatus />
                    </Box>
                </Stack>
                <Box bg="white" borderRadius="lg" boxShadow="md" p={{ base: 4, md: 6 }} overflowX="auto">
                    <FeedbackTable />
                </Box>
            </Stack>
        </PageContainer>
    );
};

FeedbackManPage.propTypes = {
    onOpenMenu: PropTypes.func,
};

export default FeedbackManPage;