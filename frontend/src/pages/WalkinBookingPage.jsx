import PropTypes from "prop-types";
import {
    Box,
    Button,
    Center,
    Flex,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { PiConfettiFill } from "react-icons/pi";
import { useEffect, useState } from "react";
import useWalkinStore from "../store/walkin";
import WalkinOptions from "../components/WalkinOptions";
import WalkinRegister from "../components/WalkinRegister";
import WalkinLogin from "../components/WalkinLogin";
import WalkinLogOptions from "../components/WalkinLogOptions";
import WalkinBookSession from "../components/WalkinBookSession";
import WalkinARInput from "../components/WalkinARInput";
import WalkinReview from "../components/WalkinReview";
import WalkinTimeInOut from "../components/WalkinTimeInOut";
import PageContainer from "../components/PageContainer";

const WalkinBookingPage = ({ onOpenMenu }) => {
    const {
        isRegistered,
        setIsRegistered,
        isBooked,
        setIsBooked,
        showRegister,
        setShowRegister,
        showLogin,
        showBooking,
        showARInput,
        showReview,
        setShowReview,
        showLogOptions,
        showTimeInOut
    } = useWalkinStore();
    const [countdown, setCountdown] = useState(5);
    const { isOpen, onClose } = useDisclosure();

    useEffect(() => {
        let timer;
        if ((isRegistered || isBooked) && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setIsRegistered(false);
            setShowRegister(false);
            setIsBooked(false);
            setShowReview(false);
            setCountdown(5);
        }
        return () => clearInterval(timer);
    }, [isRegistered, isBooked, countdown, setIsRegistered, setShowRegister, setIsBooked, setShowReview]);

    const handleConfirm = () => {
        if (showRegister) setIsRegistered(true);
        else if (showReview) setIsBooked(true);
        onClose();
    };

    const renderRegistrationSuccess = () => (
        <Flex justify="center" align="center" textAlign="center">
            <Box
                p={{ base: 6, md: 8 }}
                w="full"
                maxW="4xl"
            >
                <Center mb={6}>
                    <PiConfettiFill color="#FE7654" size={120} />
                </Center>
                <Text as="h1" fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold" mb={6}>
                    Your account has been successfully registered!
                </Text>
                <Center mt={{ base: 10, md: 20 }}>
                    <Text>Returning in... {countdown}</Text>
                </Center>
            </Box>
        </Flex>
    );

    const renderBookingSuccess = () => (
        <Flex justify="center" align="center" textAlign="center">
            <Box
                p={{ base: 6, md: 8 }}
                w="full"
                maxW="4xl"
            >
                <Center mb={6}>
                    <PiConfettiFill color="#FE7654" size={120} />
                </Center>
                <Text as="h1" fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold" mb={6}>
                    Your selected session has been successfully queued!
                </Text>
                <Center mt={{ base: 10, md: 20 }}>
                    <Text>Returning in... {countdown}</Text>
                </Center>
            </Box>
        </Flex>
    );

    const renderContent = () => {
        if (isBooked) {
            return renderBookingSuccess();
        }

        if (showTimeInOut) {
            return (
                <Flex justify="center" align="center">
                    <WalkinTimeInOut />
                </Flex>
            );
        }

        if (showReview) {
            return (
                <Flex justify="center" align="center">
                    <WalkinReview />
                </Flex>
            );
        }

        if (showARInput) {
            return (
                <Flex justify="center" align="center">
                    <WalkinARInput />
                </Flex>
            );
        }

        if (showBooking) {
            return (
                <Flex justify="center" align="center">
                    <WalkinBookSession />
                </Flex>
            );
        }

        if (showLogOptions) {
            return (
                <Flex justify="center" align="center">
                    <WalkinLogOptions />
                </Flex>
            );
        }

        if (showLogin) {
            return (
                <Flex justify="center" align="center">
                    <WalkinLogin />
                </Flex>
            );
        }

        if (isRegistered) {
            return renderRegistrationSuccess();
        }

        if (showRegister) {
            return (
                <Flex justify="center" align="center">
                    <WalkinRegister />
                </Flex>
            );
        }

        return (
            <Flex justify="center" align="center">
                <WalkinOptions />
            </Flex>
        );
    };

    return (
        <PageContainer title="Walk-In Booking" onOpenMenu={onOpenMenu}>
            <Flex
                direction="column"
                w="full"
                justify="flex-start"
                align="center"
                minH={{ base: "auto", md: "70vh" }}
                py={{ base: 6, md: 10 }}
            >
                <Box
                    w="full"
                    maxW={{ base: "100%", lg: "6xl" }}
                    px={{ base: 4, md: 6 }}
                >
                    {renderContent()}
                </Box>
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <Flex justifyContent="center" alignItems="center">
                    <ModalContent mx={4}>
                        <ModalHeader>Are you sure your information is correct?</ModalHeader>
                        <ModalBody>
                            <Text as="ul" listStyleType="disc" ml={4}>
                                <li>If any of the information is incorrect, please go back and update it accordingly.</li>
                            </Text>
                        </ModalBody>
                        <ModalFooter display="flex" gap={3} flexWrap="wrap" justifyContent="flex-end">
                            <Button
                                onClick={onClose}
                                bgColor="white"
                                color="#FE7654"
                                border="2px"
                                borderColor="#FE7654"
                                _hover={{ bg: "#FE7654", color: "white" }}
                                _active={{ bg: "#cc4a2d" }}
                                minW="32"
                            >
                                Cancel
                            </Button>
                            <Button
                                bgColor="#FE7654"
                                color="white"
                                _hover={{ bg: "#e65c3b" }}
                                _active={{ bg: "#cc4a2d" }}
                                minW="32"
                                onClick={handleConfirm}
                            >
                                Confirm
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Flex>
            </Modal>
        </PageContainer>
    );
};

WalkinBookingPage.propTypes = {
    onOpenMenu: PropTypes.func,
};

export default WalkinBookingPage;