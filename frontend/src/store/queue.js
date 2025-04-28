import { create } from 'zustand';

const useQueueStore = create((set) => ({
  queues: [],
  setQueues: (queues) => set({ queues }),
  date: "",
  setDate: (date) => set({ date }),
  timeSlot: { startTime: "", endTime: "" },
  setTimeSlot: (timeSlot) => set({ timeSlot }),
  
  clearQueues: () => set({ queues: [], date: "", timeSlot: { startTime: "", endTime: "" } }),
  
  fetchQueues: async (date, timeSlot) => {
    try {
      // Clear existing queues before fetching
      set({ queues: [] });

      const response = await fetch(`http://localhost:5000/api/queues/get?date=${date}&startTime=${timeSlot.startTime}&endTime=${timeSlot.endTime}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      // Only set queues if we have valid data
      if (data && Array.isArray(data)) {
        // Filter queues by the selected date and time slot
        const filteredQueues = data.filter(queue => 
          new Date(queue._date).toISOString().split('T')[0] === date &&
          queue._timeSlot.startTime === timeSlot.startTime
        );
        set({ queues: filteredQueues });
      }
    } catch (error) {
      console.error("Error fetching queues:", error.message);
      set({ queues: [] }); // Clear queues on error
    }
  },
}));

export default useQueueStore;