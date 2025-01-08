import { create } from 'zustand';

const useQueueStore = create((set) => ({
  queues: [],
  setQueues: (queues) => set({ queues }),
  date: "",
  setDate: (date) => set({ date }),
  timeSlot: { startTime: "", endTime: "" },
  setTimeSlot: (timeSlot) => set({ timeSlot }),
  
  fetchQueues: async (date, timeSlot) => {
    try {
      const response = await fetch('http://localhost:5000/api/queues/get', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        params: { date, timeSlot },
      });
      console.log('Response:', response); // Log the response object
    const data = await response.json();
    console.log('Fetched data:', data); // Log the fetched data
    set({ queues: data });
    } catch (error) {
      console.error("Error fetching queues:", error.message);
    }
  },
}));

export default useQueueStore;