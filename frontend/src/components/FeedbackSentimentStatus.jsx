import { Card, CardBody, Box, Text, Flex, VStack, HStack } from "@chakra-ui/react";

const FeedbackSentimentStatus = () => {
    return (
        <VStack spacing={4} align="stretch">
            {/* Overall Sentiment Level Card */}
            <Card shadow="md" bg="white">
                <CardBody p={6}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={4}>
                        OVERALL SENTIMENT LEVEL
                    </Text>
                    <Flex align="center" justify="space-between">
                        <Box
                            w="60px"
                            h="60px"
                            borderRadius="full"
                            border="4px solid #22c55e"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            bg="white"
                        >
                            <Text fontSize="2xl" color="#22c55e">
                                😊
                            </Text>
                        </Box>
                        <Box textAlign="right">
                            <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                                3.89 / 5
                            </Text>
                            <Text fontSize="md" fontWeight="semibold" color="#22c55e">
                                POSITIVE
                            </Text>
                        </Box>
                    </Flex>
                </CardBody>
            </Card>

            {/* Feedback Sentiment Breakdown Card */}
            <Card shadow="md" bg="white">
                <CardBody p={6}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={6}>
                        FEEDBACK SENTIMENT
                    </Text>
                    <HStack spacing={8} justify="space-around">
                        {/* Positive */}
                        <VStack spacing={2}>
                            <Box
                                w="50px"
                                h="50px"
                                borderRadius="full"
                                border="3px solid #22c55e"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                bg="white"
                            >
                                <Text fontSize="xl" color="#22c55e">
                                    😊
                                </Text>
                            </Box>
                            <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                69%
                            </Text>
                        </VStack>

                        {/* Neutral */}
                        <VStack spacing={2}>
                            <Box
                                w="50px"
                                h="50px"
                                borderRadius="full"
                                border="3px solid #eab308"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                bg="white"
                            >
                                <Text fontSize="xl" color="#eab308">
                                    😐
                                </Text>
                            </Box>
                            <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                21%
                            </Text>
                        </VStack>

                        {/* Negative */}
                        <VStack spacing={2}>
                            <Box
                                w="50px"
                                h="50px"
                                borderRadius="full"
                                border="3px solid #ef4444"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                bg="white"
                            >
                                <Text fontSize="xl" color="#ef4444">
                                    😞
                                </Text>
                            </Box>
                            <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                10%
                            </Text>
                        </VStack>
                    </HStack>
                </CardBody>
            </Card>
        </VStack>
    );
};

export default FeedbackSentimentStatus;