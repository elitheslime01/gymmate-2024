import PropTypes from "prop-types";
import { Flex, Stack } from "@chakra-ui/react";
import ScheduleCalendar from "../components/ScheduleCalendar";
import ScheduleTimeSlots from "../components/ScheduleTimeSlots";
import PageContainer from "../components/PageContainer";

const SchedulePage = ({ onOpenMenu }) => {
    return (
        <PageContainer title="Schedule Management" onOpenMenu={onOpenMenu}>
            <Stack spacing={{ base: 4, md: 6 }}>
                <Flex
                    direction={{ base: "column", xl: "row" }}
                    gap={{ base: 4, md: 6, xl: 8 }}
                    align="stretch"
                >
                    <Flex flex={{ base: "1", xl: "0 0 360px" }}>
                        <ScheduleCalendar />
                    </Flex>
                    <Flex flex="1">
                        <ScheduleTimeSlots />
                    </Flex>
                </Flex>
            </Stack>
        </PageContainer>
    );
};

SchedulePage.propTypes = {
    onOpenMenu: PropTypes.func,
};

export default SchedulePage;