import { useToast, Box, Button, Flex, Heading, Input, InputGroup, InputLeftElement, InputRightElement, VStack } from "@chakra-ui/react"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { MdEmail } from "react-icons/md"
import { RiLockPasswordFill } from "react-icons/ri"
import useWalkinStore from "../store/walkin"
import { useState } from "react";
import { useStudentStore } from "../store/student"

const WalkinLogin = () => {
    const {
        showPassword,
        isRegistered,
        setShowPassword,
        setShowLogin,
        setShowLogOptions,
    } = useWalkinStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { loginStudent } = useStudentStore();

    const toast = useToast();

    const togglePasswordVisibility = (field) => {
        setShowPassword({ [field]: !showPassword[field] });
    };

    const handleInputChange = (setter) => (event) => {
        setter(event.target.value);
    };

    const handleLogCancel = () => {
        setShowLogin(false); 
    };

    const handleLogLogin = async ()  => {
        console.log("Email:", email);
        console.log("Password:", password);

        const result = await loginStudent(email, password);
        const { success = false, message = "An unexpected error occurred." } = result || {};
        
        toast({
            title: success ? "Success" : "Error",
            description: message,
            status: success ? "success" : "error",
            duration: 3000,
            isClosable: true
        });
    
        if (success) {
        // Clear the input fields
        setEmail(''); // Reset email
        setPassword(''); // Reset password
    
        setShowLogOptions(true)
        setShowLogin(false);
        }
    }

    return (
        <Box p={8} w="full" maxW="4xl" display={isRegistered ? 'none' : 'block'}>
            <Heading as="h1" size="md" mb={20} align="center">Log in a GymMate account</Heading>
            <VStack w='100%' justify="center" mb={6} spacing={5}>
                {/* Email Input */}
                <InputGroup w='100%'>
                    <InputLeftElement 
                        color='gray.500' 
                        pointerEvents='none' 
                        h='50px' 
                        display='flex' 
                        alignItems='center'>
                        <MdEmail />
                    </InputLeftElement>
                    <Input
                        placeholder='Email'
                        variant="outline" 
                        boxShadow='lg' 
                        rounded='md'
                        bg="white"
                        h='50px'
                        value={email}
                        onChange={handleInputChange(setEmail)}
                    />
                </InputGroup>

                {/* Password Input */}
                <InputGroup w='100%'>
                    <InputLeftElement 
                        color='gray.500' 
                        pointerEvents='none' 
                        h='50px' 
                        display='flex' 
                        alignItems='center'>
                        <RiLockPasswordFill />
                    </InputLeftElement>
                    <Input
                        variant="outline" 
                        pr='4.5rem'
                        type={showPassword.password ? 'text' : 'password'}
                        value={password}
                        onChange={handleInputChange(setPassword)}
                        placeholder='Password'
                        boxShadow='lg' 
                        rounded='md'
                        h='50px'
                        bg="white"
                    />
                    <InputRightElement 
                        width='4.5rem' 
                        h='50px' 
                        display='flex' 
                        alignItems='center'>
                        <Button 
                            color="gray.500" 
                            variant='ghost' 
                            onClick={() => togglePasswordVisibility('password')} 
                            size='md'
                        >
                            {showPassword.password ? <FaEyeSlash /> : <FaEye />}
                        </ Button>
                    </InputRightElement>
                </InputGroup>
            </VStack>

            <Flex justify="space-between" mt={20}>
                <Button bgColor="white" color="#FE7654" border="2px" borderColor="#FE7654" _hover={{ bg: '#FE7654', color: 'white' }} _active={{ bg: '#cc4a2d' }} px={6} py={2} rounded="md" onClick={handleLogCancel}>Cancel</Button>
                <Button bgColor='#FE7654' color='white' _hover={{ bg: '#e65c3b' }} _active={{ bg: '#cc4a2d' }} px={6} py={2} rounded="md" onClick={handleLogLogin}>Log In</Button>
            </Flex>
        </Box>
  )
}

export default WalkinLogin