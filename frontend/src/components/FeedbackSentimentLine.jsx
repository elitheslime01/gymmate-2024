import { Card, CardBody, Input } from "@chakra-ui/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FeedbackSentimentLine = () => {
    const data = [
        {
            name: 'Sentiment',
            positive: 30,
            neutral: 17,
            negative: 12
        }
    ];

    // const handleDateChange = (e) => {
    //     setDateState(e.target.value);
    //     setDate(e.target.value);
    //     // Clear timeslot selection
    //     setTimeSlotState({ startTime: "", endTime: "" });
    //     setTimeSlot({ startTime: "", endTime: "" });

    //     if (!e.target.value) {
    //     // If date is cleared, show all current month queues
    //     fetchAllCurrentMonthQueues();
    //     } else {
    //     // If date is selected, show all queues for that date
    //     fetchQueuesByDate(e.target.value);
    //     }
    // };

    return (
        <Card w="100%" h="100%" shadow="md">
            <CardBody p={6} display="flex" flexDirection="column">
                <Input w="150px"
                    type="date"
                    // value={date}
                    // onChange={handleDateChange}
                    placeholder="Select Date (yyyy-mm-dd)"
                    bg="white" boxShadow="lg" 
                    mb={4}
                />
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }} barCategoryGap="40%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={false} />
                        <YAxis 
                            domain={[0, 50]} 
                            ticks={[0, 10, 20, 30, 40, 50]}
                            tick={{ fontSize: 12 }} 
                            axisLine={false} 
                            tickLine={false} 
                        />
                        <Tooltip />
                        <Bar 
                            dataKey="positive" 
                            fill="#00C851" 
                            name="POSITIVE"
                            barSize={100}
                        />
                        <Bar 
                            dataKey="neutral" 
                            fill="#FFD700" 
                            name="NEUTRAL"
                            barSize={100}
                        />
                        <Bar 
                            dataKey="negative" 
                            fill="#FF4444" 
                            name="NEGATIVE"
                            barSize={100}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardBody>
        </Card>
    );
};

export default FeedbackSentimentLine;