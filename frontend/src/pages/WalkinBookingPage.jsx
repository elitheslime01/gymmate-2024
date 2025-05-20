import { Box, Button, Center,  Flex, Heading, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure, VStack } from "@chakra-ui/react";
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

const WalkinBookingPage = () => {
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
    
    return (
        <Box 
            bg='gray.300'
            w='80vw' 
            h='100vh'
            position='relative'>
            <VStack>
                <Box 
                    bg='white' 
                    w='80vw' 
                    h='10vh'
                    boxShadow='lg' 
                    position='fixed'
                    top={0}
                    zIndex={1}
                    alignContent='center'
                    paddingLeft='5%'>
                    <Heading as='h3' size='lg' >Walk-In Booking</Heading>
                </Box>

                <Box
                    bg='gray.100' 
                    w='80vw' 
                    h='90vh'
                    position='absolute' 
                    top='10vh' 
                    bottom={0}
                    p='5%'
                    display="flex"
                    alignItems="center"
                    justifyContent="center" >
                    
                    {!showRegister && !isRegistered && !showLogin && !showBooking && !showARInput && !showReview && !isBooked && !showLogOptions && !showTimeInOut && ( 
                    <Flex align="center" justify="center">
                        <WalkinOptions/>
                    </Flex>
                    )}

                    {showRegister && (
                    <Flex justify="center" align="center" >
                        <WalkinRegister/>
                    </Flex>
                    )}

                    {isRegistered && (
                    <Flex justify="center" align="center">
                        <Box p={8} w="full" maxW="4xl" display={isRegistered ? 'block' : 'none'}>
                            <Center mb={6}><PiConfettiFill color='#FE7654' size={120}/></Center>
                            <Heading as="h1" size="md" mb={6}>Your account has been successfully registered!</Heading>
                            <Center mt={20}>
                                <Text>Returning in... {countdown}</Text>
                            </Center>
                        </Box>
                    </Flex>
                    )}

                    {showLogin && (
                    <Flex justify="center" align="center">
                        <WalkinLogin/>
                    </Flex>
                    )}

                    {showLogOptions && (
                    <Flex align="center" justify="center">
                        <WalkinLogOptions/>
                    </Flex>
                    )}

                    {showBooking && (
                    <Flex justify="center" align="center">
                        <WalkinBookSession/>
                    </Flex>
                    )}

                    {showARInput && (
                    <Flex justify="center" align="center">
                        <WalkinARInput/>
                    </Flex>
                    )}

                    {showReview && (
                    <Flex justify="center" align="center">
                        <WalkinReview/>
                    </Flex>
                    )}

                    {showTimeInOut && (
                        <Flex justify="center" align="center">
                        <WalkinTimeInOut/>
                    </Flex>
                    )}

                    {isBooked && (
                    <Flex justify="center" align="center">
                        <Box p={8} w="full" maxW="4xl" display={isBooked ? 'block' : 'none'}>
                            <Center mb={6}><PiConfettiFill color='#FE7654' size={120}/></Center>
                            <Heading as="h1" size="md" mb={6}>Your selected session has been successfully queued!</Heading>
                            <Center mt={20}>
                                <Text>Returning in... {countdown}</Text>
                            </Center>
                        </Box>
                    </Flex>
                    )}
                    
                    
                    <Modal isOpen={isOpen} onClose={onClose} isCentered>
                        <ModalOverlay />
                        <Flex justifyContent="center" alignItems="center"> 
                            <ModalContent>
                                <ModalHeader>Are you sure your information is correct?</ModalHeader>
                                <ModalBody>
                                    <Text as="ul" listStyleType="disc" ml={4}>
                                        <li>If any of the information is incorrect, please go back and update it accordingly.</li>
                                    </Text>
                                </ModalBody>
                                <ModalFooter display="flex" justifyContent="space-between">
                                    <Button onClick={onClose} bgColor="white" color="#FE7654" border="2px" borderColor="#FE7654" _hover={{ bg: '#FE7654', color: 'white' }} _active={{ bg: '#cc4a2d' }} w="40" px={4} py={2} rounded="md" display="flex" alignItems="center">
                                        Cancel
                                    </Button>
                                    <Button bgColor='#FE7654' color='white' _hover={{ bg: '#e65c3b' }} _active={{ bg: '#cc4a2d' }} w="40" px={4} py={2} rounded="md" display="flex" alignItems="center" onClick={handleConfirm}>
                                        Confirm
                                    </Button>
                                </ModalFooter>
                            </ModalContent>
                        </Flex>
                    </Modal>

                </Box>
            </VStack>
        </Box>
    );
};

export default WalkinBookingPage