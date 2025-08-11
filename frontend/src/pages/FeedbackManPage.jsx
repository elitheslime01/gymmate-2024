import { Box, Flex, Heading, VStack } from "@chakra-ui/react"
import FeedbackSentimentLine from "../components/FeedbackSentimentLine.jsx"
import FeedbackSentimentStatus from "../components/FeedbackSentimentStatus.jsx"
import FeedbackTable from "../components/FeedbackTable.jsx"

const FeedbackManPage = () => {

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
                    <Heading as='h3' size='lg' >Feedback Management</Heading>
                </Box>

                <Box
                    bg='gray.100' 
                    w='80vw' 
                    h='90vh'
                    position='absolute' 
                    top='10vh' 
                    bottom={0}
                    p='5%'
                    overflowY="auto">

                    <Flex justify="space-between" gap={6} mb={6}>
                        <Box flex="2">
                            <FeedbackSentimentLine/>
                        </Box> 
                        <Box flex="1">
                            <FeedbackSentimentStatus />
                        </Box>
                    </Flex>
                    <Box w="100%" overflowX="auto">
                        <FeedbackTable/>
                    </Box>
                </Box>
            </VStack>
        </Box>
    )
}

export default FeedbackManPage