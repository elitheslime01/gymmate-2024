import { create } from 'zustand';

const useQueueStore = create((set) => ({
  queues: [],
  setQueues: (queues) => set({ queues }),
  date: "",
  setDate: (date) => set({ date }),
  timeSlot: { startTime: "", endTime: "" },
  setTimeSlot: (timeSlot) => set({ timeSlot }),
  
  clearQueues: () => set({ queues: [], date: "", timeSlot: { startTime: "", endTime: "" } }),


  // Add this to your useQueueStore
  fetchAllCurrentMonthQueues: async () => {
    try {
      const response = await fetch('http://localhost:5000/api/queues/currentMonth', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data && Array.isArray(data)) {
        set({ queues: data });
      }
    } catch (error) {
      console.error("Error fetching current month queues:", error.message);
      set({ queues: [] });
    }
  },
    
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
  allocateStudents: async (date, timeSlot) => {
    try {
      const response = await fetch('http://localhost:5000/api/queues/allocate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date, timeSlot })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // Refresh queues after successful allocation
      const fetchQueuesAction = useQueueStore.getState().fetchQueues;
      await fetchQueuesAction(date, timeSlot);

      return {
        success: true,
        data: data.data
      };

    } catch (error) {
      console.error("Error allocating students:", error.message);
      return {
        success: false,
        error: error.message
      };
    }
  },
}));

export default useQueueStore;