import { Card, CardBody, Center, Spinner, Text } from "@chakra-ui/react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";
import useFeedbackStore from "../store/feedback";

const sentimentColors = {
    positive: "#00C851",
    neutral: "#FFD700",
    negative: "#FF4444",
};

const FeedbackSentimentLine = () => {
    const { feedback, isLoading } = useFeedbackStore();

    const totals = useMemo(() => {
        const summary = {
            positive: 0,
            neutral: 0,
            negative: 0,
        };

        feedback.forEach((item) => {
            const key = item?.sentiment;
            if (key && summary[key] !== undefined) {
                summary[key] += 1;
            }
        });

        return summary;
    }, [feedback]);

    const chartData = useMemo(
        () => [
            {
                name: "Sentiment",
                positive: totals.positive,
                neutral: totals.neutral,
                negative: totals.negative,
            },
        ],
        [totals.positive, totals.neutral, totals.negative]
    );

    const maxValue = Math.max(totals.positive, totals.neutral, totals.negative, 0);
    const yAxisMax = maxValue === 0 ? 5 : Math.ceil((maxValue + 2) / 5) * 5;
    const hasData = maxValue > 0;

    return (
        <Card w="100%" h="100%" shadow="md">
            <CardBody p={6} display="flex" flexDirection="column" gap={4}>
                <Text fontSize="lg" fontWeight="semibold" color="#071434">
                    Sentiment Breakdown
                </Text>
                {isLoading ? (
                    <Center flex={1} py={6}>
                        <Spinner size="lg" color="#FE7654" thickness="4px" />
                    </Center>
                ) : hasData ? (
                    <ResponsiveContainer>
                        <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                            barCategoryGap="40%"
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={false} />
                            <YAxis
                                domain={[0, yAxisMax]}
                                ticks={Array.from({ length: Math.floor(yAxisMax / 5) + 1 }, (_, index) => index * 5)}
                                tick={{ fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                formatter={(value, key) => [`${value} feedback`, key.toUpperCase()]}
                                cursor={{ fill: "rgba(7, 20, 52, 0.05)" }}
                            />
                            <Bar dataKey="positive" fill={sentimentColors.positive} name="Positive" barSize={100} />
                            <Bar dataKey="neutral" fill={sentimentColors.neutral} name="Neutral" barSize={100} />
                            <Bar dataKey="negative" fill={sentimentColors.negative} name="Negative" barSize={100} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <Center flex={1} py={6}>
                        <Text color="gray.500" fontSize="sm">
                            No feedback available for the selected filters.
                        </Text>
                    </Center>
                )}
            </CardBody>
        </Card>
    );
};

export default FeedbackSentimentLine;