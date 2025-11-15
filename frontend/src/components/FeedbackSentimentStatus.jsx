import { Card, CardBody, Box, Text, Flex, VStack, HStack, Center, Spinner } from "@chakra-ui/react";
import { useMemo } from "react";
import useFeedbackStore from "../store/feedback";

const sentimentDisplayMap = {
    positive: { color: "#22c55e", emoji: "😊", label: "Positive" },
    neutral: { color: "#eab308", emoji: "😐", label: "Neutral" },
    negative: { color: "#ef4444", emoji: "😞", label: "Negative" },
};

const FeedbackSentimentStatus = () => {
    const { feedback, isLoading } = useFeedbackStore();

    const sentimentStats = useMemo(() => {
        const counts = {
            positive: 0,
            neutral: 0,
            negative: 0,
        };

        feedback.forEach((item) => {
            const key = item?.sentiment;
            if (key && counts[key] !== undefined) {
                counts[key] += 1;
            }
        });

        const total = counts.positive + counts.neutral + counts.negative;

        const percentages = total
            ? {
                    positive: Math.round((counts.positive / total) * 100),
                    neutral: Math.round((counts.neutral / total) * 100),
                    negative: Math.round((counts.negative / total) * 100),
                }
            : { positive: 0, neutral: 0, negative: 0 };

            const dominant = total
                ? Object.entries(counts).reduce(
                        (currentBest, [key, value]) =>
                            value > currentBest.value ? { key, value } : currentBest,
                        { key: "positive", value: counts.positive }
                    ).key
                : null;

        const overallScore = total
            ? ((counts.positive * 5 + counts.neutral * 3 + counts.negative * 1) / total).toFixed(2)
            : "0.00";

        return {
            counts,
            percentages,
            total,
            dominant,
            overallScore,
        };
    }, [feedback]);

    const dominantDisplay = sentimentStats.dominant
        ? sentimentDisplayMap[sentimentStats.dominant]
        : { color: "#a0aec0", emoji: "–", label: "No data" };

    const renderSentimentCircle = (key) => {
        const config = sentimentDisplayMap[key];
        return (
            <VStack spacing={2} key={key}>
                <Box
                    w="50px"
                    h="50px"
                    borderRadius="full"
                    border={`3px solid ${config.color}`}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="white"
                >
                    <Text fontSize="xl" color={config.color}>
                        {config.emoji}
                    </Text>
                </Box>
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    {`${sentimentStats.percentages[key]}%`}
                </Text>
                <Text fontSize="sm" color="gray.500" textTransform="uppercase">
                    {config.label}
                </Text>
            </VStack>
        );
    };

    return (
        <VStack spacing={4} align="stretch">
            <Card shadow="md" bg="white">
                <CardBody p={6}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={4}>
                        OVERALL SENTIMENT LEVEL
                    </Text>
                    {isLoading ? (
                        <Center py={6}>
                            <Spinner size="md" color="#FE7654" thickness="4px" />
                        </Center>
                    ) : (
                        <Flex align="center" justify="space-between">
                            <Box
                                w="60px"
                                h="60px"
                                borderRadius="full"
                                border={`4px solid ${dominantDisplay.color}`}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                bg="white"
                            >
                                <Text fontSize="2xl" color={dominantDisplay.color}>
                                    {dominantDisplay.emoji}
                                </Text>
                            </Box>
                            <Box textAlign="right">
                                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                                    {sentimentStats.overallScore} / 5
                                </Text>
                                <Text fontSize="md" fontWeight="semibold" color={dominantDisplay.color}>
                                    {dominantDisplay.label.toUpperCase()}
                                </Text>
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {sentimentStats.total} feedback entries analysed
                                </Text>
                            </Box>
                        </Flex>
                    )}
                </CardBody>
            </Card>

            <Card shadow="md" bg="white">
                <CardBody p={6}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={6}>
                        FEEDBACK SENTIMENT
                    </Text>
                    {isLoading ? (
                        <Center py={6}>
                            <Spinner size="md" color="#FE7654" thickness="4px" />
                        </Center>
                    ) : (
                        <HStack spacing={8} justify="space-around" flexWrap="wrap">
                            {Object.keys(sentimentDisplayMap).map((key) => renderSentimentCircle(key))}
                        </HStack>
                    )}
                </CardBody>
            </Card>
        </VStack>
    );
};

export default FeedbackSentimentStatus;