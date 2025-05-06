import { Box, Button, Divider, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import useWalkinStore from "../store/walkin"
import { useStudentStore } from "../store/student" 

const WalkinLogOptions = () => {

    const {user} = useStudentStore();

    const {
        setShowBooking,
        setShowLogOptions,
        setShowTimeInOut,
        setShowLogin
    } = useWalkinStore();

    const handleOptLogin = () => {
        setShowTimeInOut(true);
        setShowLogOptions(false);
    };

    const handleLogOptBook = () => {
        setShowBooking(true);
        setShowLogOptions(false);
    }

    const handleLogOptCancel  = () => {
        setShowLogOptions(false);
        setShowLogin(true);
    }


    return (
        <Box p={8} minW="full" maxW="4xl">
            <Flex align="center" mb={6} justify="space-between">
                <Heading as="h1" size="md" color="gray.800" textAlign="center" flex="1">
                    Hello {user?._fName || "Guest"}, what do you want to do today?
                </Heading>
            </Flex>
                <Flex justify="space-between" align="center">
                <VStack flex="1" textAlign="center" >
                    <Button 
                        bgColor='#FE7654'
                        color='white'
                        _hover={{ bg: '#e65c3b' }} 
                        _active={{ bg: '#cc4a2d' }}
                        size="lg" w="100%"
                        h="100px"
                        whiteSpace="wrap"
                        onClick={handleLogOptBook}>
                        I want to book a session.
                    </Button>
                </VStack>
                <Flex flexDir="column" align="center" mx={4}>
                    <Divider orientation="vertical" height="16" borderColor="gray.500" />
                    <Text color="gray.500" my={2}>
                        OR
                    </Text>
                    <Divider orientation="vertical" height="16" borderColor="gray.500" />
                </Flex>
                <VStack flex="1" textAlign="center" >
                    <Button 
                        bgColor='#FE7654'
                        color='white'
                        _hover={{ bg: '#e65c3b' }} 
                        _active={{ bg: '#cc4a2d' }}
                        size="lg" w="100%"
                        h="100px"
                        whiteSpace="wrap"
                        onClick={handleOptLogin}>
                        I want to time in or time out of my session.
                    </Button>
                </VStack>
            </Flex>
            <Flex justify="center" mt={6}>
                <Button 
                    bgColor="white" 
                    color="#FE7654" 
                    border="2px" 
                    borderColor="#FE7654" 
                    _hover={{ bg: '#FE7654', color: 'white' }} 
                    _active={{ bg: '#cc4a2d' }} px={6} py={2} 
                    rounded="md" 
                    onClick={handleLogOptCancel}>
                        Log out
                </Button>
            </Flex>
        </Box>
    )
}

export default WalkinLogOptions