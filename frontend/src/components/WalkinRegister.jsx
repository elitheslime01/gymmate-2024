import { Box, Button, Checkbox, Flex, Grid, Heading, Input, InputGroup, InputRightElement, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Select, Stack, Text, useDisclosure,} from "@chakra-ui/react";
import { FaEye, FaEyeSlash, FaImage, FaUpload, FaUser } from "react-icons/fa";
import useWalkinStore from "../store/walkin";

const WalkinRegister = () => {
    const {
        showPassword,
        isRegistered,
        setShowRegister,
        setShowPassword,
        showRegister,
        showReview,
        setIsRegistered,
        setIsBooked
    } = useWalkinStore();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleRegRegister = () => {
        onOpen(); 
    };

    const handleConfirm = () => {
        if (showRegister) setIsRegistered(true);
        else if (showReview) setIsBooked(true);
        onClose(); 
    };

    const handleRegCancel = () => {
        setShowRegister(false); 
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword({ [field]: !showPassword[field] });
    };

    return (
        <Box p={8} w="full" maxW="4xl" display={isRegistered ? 'none' : 'block'}>
            <Heading as="h1" size="md" mb={10} >Register a GymMate account</Heading>
            <Grid templateColumns="1fr 2fr" gap={10}>
                <Flex direction="column" align="center">
                    <Box position="relative" w="40" h="40" bg="white" rounded="md" boxShadow="lg" display="flex" alignItems="center" justifyContent="center" mb={4}>
                        <FaUser   size="6rem" color="gray.400" />
                        <Button position="absolute" bottom="0" right="0" bg="#071434" color="white" _hover={{ bg: '#071434', color: 'white' }} _active={{ bg: 'gray.100', color: 'white' }} p={2} rounded="md" w="8" h="8" display="flex" alignItems="center" justifyContent="center">
                            <FaImage />
                        </Button>
                    </Box>
                    <Button bg="white" color="#071434" border="2px" borderColor="#071434" _hover={{ bg: '#071434', color: 'white' }} _active={{ bg: 'gray.100', color: 'white' }} w="40" px={4} py={2} rounded="md" display="flex" alignItems="center" mb={4}>
                        <FaUpload style={{ marginRight: '0.5rem' }} /> Upload COR
                    </Button>
                    <Flex direction="row" align="center" gap={1}>
                        <Text>Are you an athlete?</Text>
                        <Checkbox colorScheme='green' size="lg" bg="white" value="true"/>
                    </Flex>
                </Flex>
                <Grid templateColumns="repeat(2, 1fr)" gap={6} colSpan={2}>
                    <Box>
                        <Text mb={2} color="gray.700">Name</Text>
                        <Flex direction="row" align="center" gap={2}> 
                            <Input bg="white" boxShadow="lg" placeholder="ex. Juan" />
                            <Input bg="white" boxShadow="lg" placeholder="ex. Dela Cruz" />
                        </Flex>
                    </Box>
                    <Box>
                        <Text mb={2} color="gray.700">Sex</Text>
                        <RadioGroup>
                            <Stack direction="row">
                                <Radio bg="white" boxShadow="lg" value="male">Male</Radio>
                                <Radio bg="white" boxShadow="lg" value="female">Female</Radio>
                            </Stack>
                        </RadioGroup>
                    </Box>
                    <Box>
                        <Text mb={2} color="gray.700">College & Course</Text>
                        <Flex gap={2}>
                            <Select 
                                bg="white" 
                                boxShadow="lg" 
                                placeholder="College"
                            >
                                <option value="CCIS">CCIS</option>
                            </Select>
                            <Select 
                                bg="white" 
                                boxShadow="lg" 
                                placeholder="Course"
                            >
                                <option value="course1">Social Computing</option>
                                <option value="course2">Application Development</option>
                            </Select>
                        </Flex>
                    </Box>
                    <Box>
                        <Text mb={2} color="gray.700">Year & Section</Text>
                        <Flex gap={2}>
                            <Select 
                                bg="white" 
                                boxShadow="lg" 
                                placeholder="Year"
                            >
                                <option value="I">I</option>
                                <option value="II">II</option>
                                <option value="III">III</option>
                                <option value="IV">IV</option>
                            </Select>
                            <Select 
                                bg="white" 
                                boxShadow="lg" 
                                placeholder="Section"
                            >
                                <option value="course1">ACSSC</option>
                                <option value="course2">ACSAD</option>
                            </Select>
                        </Flex>
                    </Box>
                    <Box>
                        <Text mb={2} color="gray.700">UMak Email Address</Text>
                        <Input bg="white" boxShadow="lg" placeholder="ex. juan.delacruz@umak.edu.ph" />
                    </Box>
                    <Box>
                        <Text mb={2} color="gray.700">UMak Student ID</Text>
                        <Input bg="white" boxShadow="lg" placeholder="ex. a12345678" />
                    </Box>
                    <Box>
                        <Text mb={2} color="gray.700">Password</Text>
                        <InputGroup>
                            <Input
                                type={showPassword.password ? 'text' : 'password'} 
                                placeholder="Enter your password" 
                                bg="white"  boxShadow="lg"
                            />
                            <InputRightElement>
                                <Button 
                                    variant="link" 
                                    onClick={() => togglePasswordVisibility('password')} 
                                    p={2}
                                >
                                    {showPassword.password ? <FaEyeSlash /> : <FaEye />}
                                </ Button>
                            </InputRightElement>
                        </InputGroup>
                    </Box>
                    <Box>
                        <Text mb={2} color="gray.700">Confirm Password</Text>
                        <InputGroup>
                            <Input 
                                type={showPassword.confirmPassword ? 'text' : 'password'} 
                                placeholder="Confirm your password" 
                                bg="white" boxShadow="lg"
                            />
                            <InputRightElement>
                                <Button 
                                    variant="link" 
                                    onClick={() => togglePasswordVisibility('confirmPassword')} 
                                    p={2}
                                >
                                    {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </Box>
                </Grid>
            </Grid>
            <Flex justify="space-between" mt={10}>
                <Button bgColor="white" color="#FE7654" border="2px" borderColor="#FE7654" _hover={{ bg: '#FE7654', color: 'white' }} _active={{ bg: '#cc4a2d' }} px={6} py={2} rounded="md" onClick={handleRegCancel}>Cancel</Button>
                <Button bgColor='#FE7654' color='white' _hover={{ bg: '#e65c3b' }} _active={{ bg: '#cc4a2d' }} px={6} py={2} rounded="md" onClick={handleRegRegister}>Register</Button>
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <Flex justifyContent="center" alignItems="center"> {/* Add this Flex container */}
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
  )
}

export default WalkinRegister