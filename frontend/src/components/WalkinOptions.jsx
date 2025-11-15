import { Box, Flex, Heading, VStack, Button, Text } from "@chakra-ui/react"
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
        <Box px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} minW="full" maxW="4xl">
            <Heading as="h1" size="md" color="gray.800" textAlign="center" mb={{ base: 6, md: 8 }}>
                Do you have an existing GymMate Account?
            </Heading>
            <Flex
                direction={{ base: 'column', lg: 'row' }}
                justify="space-between"
                align="center"
                gap={{ base: 6, lg: 8 }}
            >
                <VStack flex="1" textAlign="center" spacing={4}>
                    <Text color="gray.600">
                        No, I don’t have a GymMate account.
                    </Text>
                    <Button
                        bgColor='#FE7654'
                        color='white'
                        _hover={{ bg: '#e65c3b' }} 
                        _active={{ bg: '#cc4a2d' }}
                        size="lg"
                        w={{ base: '100%', lg: 'full' }}
                        onClick={handleOptRegister}
                    >
                        Register
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
                <VStack flex="1" textAlign="center" spacing={4}>
                    <Text color="gray.600">
                        Yes, I do have a GymMate account.
                    </Text>
                    <Button 
                        bgColor='#FE7654'
                        color='white'
                        _hover={{ bg: '#e65c3b' }} 
                        _active={{ bg: '#cc4a2d' }}
                        size="lg"
                        w={{ base: '100%', lg: 'full' }}
                        onClick={handleOptLogin}
                    >
                        Log In
                    </Button>
                </VStack>
            </Flex>
        </Box>
  )
}

export default WalkinOptions