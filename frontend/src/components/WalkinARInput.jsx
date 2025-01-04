import { useToast, Box, Button, Divider, Flex, Heading, HStack, PinInput, PinInputField, VStack, Text } from "@chakra-ui/react";
import { FaUpload } from "react-icons/fa";
import useWalkinStore from "../store/walkin";

const WalkinARInput = () => {

    const { setShowBooking, setShowARInput, setShowReview, arCode, setArCode, checkARCode, setARImage, arImage } = useWalkinStore();
    const toast = useToast();

    const handleARCancel =  () => {
        setShowARInput(false);
        setShowBooking(true);
    }

    const handleARProceed = async () => {
        if (!arCode || !arImage) {
            toast({
                title: "Error",
                description: "Please enter AR code and upload image",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
          
        try {
            //console.log("Checking AR Code:", arCode); // Log the AR code
            const result = await checkARCode(arCode); // Check the AR code
            //console.log("Check AR Code Result:", result); // Log the result of the check
        
            if (result.success) {
                setShowARInput(false);
                setShowReview(true); // Proceed to the review page
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error(error);
        }
        
    };

    const handleImageChange = (event) => {
        console.log('event.target.files:', event.target.files);
        const file = event.target.files[0];

        if (!file.type.match("image.*")) {
            alert("Only images are allowed");
            return;
        }

        setARImage(event.target.files[0]);
        console.log('arImage:', arImage);
    };

    return (
        <Box p={8} minW="full" maxW="4xl">
            <Heading as="h1" size="md" textAlign="center" mb={10}>Input Acknowledgement Receipt Number</Heading>
            <VStack w='100%' gap="10" justify="center" mb={6}>
                <HStack spacing={8}> {/* Adjust the value as needed for desired spacing */}
                    <PinInput size='lg' onChange={(value) => setArCode(value)}>
                        <PinInputField borderWidth="0" bg="white" boxShadow="lg" />
                        <PinInputField borderWidth="0" bg="white" boxShadow="lg"/>
                        <PinInputField borderWidth="0" bg="white" boxShadow="lg"/>
                        <PinInputField borderWidth="0" bg="white" boxShadow="lg"/>
                        <PinInputField borderWidth="0" bg="white" boxShadow="lg"/>
                        <PinInputField borderWidth="0" bg="white" boxShadow="lg"/>
                    </PinInput>
                </HStack>
                <Divider orientation="horizontal" borderColor="gray.500"/>
                <Button as="label" htmlFor="file-input" bg="white" boxShadow='lg' px={4} py={2} rounded="md" alignItems="center" >
                    <FaUpload style={{ marginRight: '0.5rem' }} /> Upload Acknowledgement Receipt
                    <input
                        id="file-input"
                        type="file"
                        accept=".jpg, .jpeg, .png"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                    />
                    {arImage && (
                        <Text fontSize="sm" color="gray.500" ml={2}>
                            {arImage.name.length > 10 ? arImage.name.slice(0, 5) + '...' + arImage.name.slice(arImage.name.lastIndexOf('.')) : arImage.name}
                        </Text>
                    )}
                </Button>
            </VStack>
            <Flex justify="space-between" mt={20}>
                <Button bgColor="white" color="#FE7654" border="2px" borderColor="#FE7654" _hover={{ bg: '#FE7654', color: 'white' }} _active={{ bg: '#cc4a2d' }} px={6} py={2} rounded="md" onClick={handleARCancel}>Cancel</Button>
                <Button bgColor='#FE7654' color='white' _hover={{ bg: '#e65c3b' }} _active={{ bg: '#cc4a2d' }} px={6} py={2} rounded="md" onClick={handleARProceed}>Proceed</Button>
            </Flex>
        </Box>
    )
}

export default WalkinARInput