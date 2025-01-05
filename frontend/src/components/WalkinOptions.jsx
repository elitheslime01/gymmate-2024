import { Box, Flex, Heading, VStack, Button, Text, Divider } from "@chakra-ui/react"
import useWalkinStore from "../store/walkin";

const WalkinOptions = () => {

    const { setShowRegister, setShowLogin } = useWalkinStore();

    const handleOptRegister = () => {
        setShowRegister(true);
        setShowLogin(false);
    };

    const handleOptLogin = () => {
        setShowLogin(true); 
        setShowRegister(false); 
    }

    return (
        <Box p={8} minW="full" maxW="4xl">
            <Flex alignSelf="center" mb={6} justify="space-between">
                <Heading as="h1" size="md" color="gray.800" textAlign="center" flex="1">
                    Do you have an existing GymMate Account?
                </Heading>
            </Flex>
            <Flex justify="space-between" align="center">
                <VStack flex="1" textAlign="center" whiteSpace="nowrap">
                    <Text color="gray.600" mb={4}>
                        No, I don’t have a GymMate account.
                    </Text>
                    <Button 
                        bgColor='#FE7654'
                        color='white'
                        _hover={{ bg: '#e65c3b' }} 
                        _active={{ bg: '#cc4a2d' }}
                        size="lg" w="full"
                        onClick={handleOptRegister}>
                        Register
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
                    <Text color="gray.600" mb={4} whiteSpace="nowrap">
                        Yes, I do have a GymMate account.
                    </Text>
                    <Button 
                        bgColor='#FE7654'
                        color='white'
                        _hover={{ bg: '#e65c3b' }} 
                        _active={{ bg: '#cc4a2d' }}
                        size="lg" w="full"
                        onClick={handleOptLogin}>
                        Log In
                    </Button>
                </VStack>
            </Flex>
        </Box>
  )
}

export default WalkinOptions