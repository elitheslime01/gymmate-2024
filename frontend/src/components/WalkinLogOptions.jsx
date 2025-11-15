import { Box, Button, Flex, Heading, Text, VStack, useToast } from "@chakra-ui/react"
import useWalkinStore from "../store/walkin"
import { useStudentStore } from "../store/student" 

const WalkinLogOptions = () => {

    const {user} = useStudentStore();

    const toast = useToast();

    const {
        setShowBooking,
        setShowLogOptions,
        setShowTimeInOut,
        setShowLogin
    } = useWalkinStore();
    const { logout } = useStudentStore();

    const handleOptLogin = () => {
        setShowTimeInOut(true);
        setShowLogOptions(false);
    };

    const handleLogOptBook = () => {
        setShowBooking(true);
        setShowLogOptions(false);
    }

    const handleLogOptCancel = async () => {
        try {
            await logout(); // Call logout function
            setShowLogOptions(false);
            setShowLogin(true);
            toast({
            title: "Logged out",
            description: "You have successfully logged out.",
            status: "success",
            duration: 3000,
            isClosable: true,
            });
        } catch {
            toast({
            title: "Error",
            description: "Failed to log out.",
            status: "error",
            duration: 3000,
            isClosable: true,
            });
        }
    };


    return (
        <Box px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} minW="full" maxW="4xl">
            <Heading as="h1" size="md" color="gray.800" textAlign="center" mb={{ base: 6, md: 8 }}>
                Hello {user?._fName || "Guest"}, what do you want to do today?
            </Heading>
            <Flex
                direction={{ base: 'column', lg: 'row' }}
                justify="space-between"
                align="center"
                gap={{ base: 6, lg: 8 }}
            >
                <VStack flex="1" textAlign="center">
                    <Button 
                        bgColor='#FE7654'
                        color='white'
                        _hover={{ bg: '#e65c3b' }} 
                        _active={{ bg: '#cc4a2d' }}
                        size="lg"
                        w="100%"
                        minH="100px"
                        whiteSpace="normal"
                        onClick={handleLogOptBook}
                    >
                        I want to book a session.
                    </Button>
                </VStack>
                <Flex
                    flexDir={{ base: 'row', lg: 'column' }}
                    align="center"
                    justify="center"
                    gap={3}
                    minW={{ base: 'auto', lg: '12' }}
                >
                    <Box
                        h="1px"
                        w="40%"
                        bg="gray.400"
                        display={{ base: 'block', lg: 'none' }}
                    />
                    <Box
                        w="1px"
                        h="16"
                        bg="gray.400"
                        display={{ base: 'none', lg: 'block' }}
                    />
                    <Text color="gray.500">OR</Text>
                    <Box
                        h="1px"
                        w="40%"
                        bg="gray.400"
                        display={{ base: 'block', lg: 'none' }}
                    />
                    <Box
                        w="1px"
                        h="16"
                        bg="gray.400"
                        display={{ base: 'none', lg: 'block' }}
                    />
                </Flex>
                <VStack flex="1" textAlign="center">
                    <Button 
                        bgColor='#FE7654'
                        color='white'
                        _hover={{ bg: '#e65c3b' }} 
                        _active={{ bg: '#cc4a2d' }}
                        size="lg"
                        w="100%"
                        minH="100px"
                        whiteSpace="normal"
                        onClick={handleOptLogin}
                    >
                        I want to time in or time out of my session.
                    </Button>
                </VStack>
            </Flex>
            <Flex justify="center" mt={{ base: 8, md: 10 }}>
                <Button 
                    bgColor="white" 
                    color="#FE7654" 
                    border="2px" 
                    borderColor="#FE7654" 
                    _hover={{ bg: '#FE7654', color: 'white' }} 
                    _active={{ bg: '#cc4a2d' }}
                    px={6}
                    py={2} 
                    rounded="md" 
                    onClick={handleLogOptCancel}
                >
                    Log out
                </Button>
            </Flex>
        </Box>
    )
}

export default WalkinLogOptions