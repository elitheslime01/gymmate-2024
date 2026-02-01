import { create } from 'zustand';
import API_BASE_URL from '../config';

const DEFAULT_AUTO_ALLOCATION_MINUTES = Number(
  import.meta.env.VITE_QUEUE_AUTO_ALLOCATION_MINUTES ?? 30
);

const sanitizeMinutes = (minutes) => {
  const parsed = Number(minutes);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_AUTO_ALLOCATION_MINUTES;
};

const useQueueStore = create((set, get) => ({
  queues: [],
  setQueues: (queues) => set({ queues }),
  date: "",
  setDate: (date) => set({ date }),
  timeSlot: { startTime: "", endTime: "" },
  setTimeSlot: (timeSlot) => set({ timeSlot }),
  autoAllocationIntervalMinutes: sanitizeMinutes(DEFAULT_AUTO_ALLOCATION_MINUTES),
  setAutoAllocationIntervalMinutes: (minutes) =>
    set({ autoAllocationIntervalMinutes: sanitizeMinutes(minutes) }),
  getAutoAllocationIntervalMs: () => get().autoAllocationIntervalMinutes * 60 * 1000,
  
  clearQueues: () => set({ queues: [], date: "", timeSlot: { startTime: "", endTime: "" } }),


  // Add this to your useQueueStore
  fetchAllCurrentMonthQueues: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queues/currentMonth`, {
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

      const response = await fetch(`${API_BASE_URL}/api/queues/get?date=${date}&startTime=${timeSlot.startTime}&endTime=${timeSlot.endTime}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      // Only set queues if we have valid data
      if (data && Array.isArray(data)) {
        // Filter queues by the selected date and time slot
        const filteredQueues = data.filter(queue => {
          const queueDate = new Date(queue._date);
          const selectedDate = new Date(date + 'T00:00:00.000Z'); // Ensure UTC date
          return queueDate.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0] &&
                 queue._timeSlot.startTime === timeSlot.startTime;
        });
        set({ queues: filteredQueues });
      }
    } catch (error) {
      console.error("Error fetching queues:", error.message);
      set({ queues: [] }); // Clear queues on error
    }
  },
  
  allocateStudents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queues/allocate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      const data = await response.json();
  
      if (!data.success) {
        throw new Error(data.message);
      }
  
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

  notifyAllocationStatuses: async (changes = []) => {
    if (!Array.isArray(changes) || changes.length === 0) {
      return [];
    }

    const notifications = [];

    for (const change of changes) {
      if (!change?.userId) {
        continue;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/allocations/notify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: change.userId,
            bookingId: change.bookingId || null,
          }),
        });

        const data = await response.json();

        notifications.push({
          userId: change.userId,
          bookingId: change.bookingId || null,
          success: data?.success ?? false,
          status: data?.data?.status || change.status || null,
          message: data?.message,
        });
      } catch (error) {
        console.error("Error notifying allocation status:", error.message);
        notifications.push({
          userId: change.userId,
          bookingId: change.bookingId || null,
          success: false,
          status: change.status || null,
          message: error.message,
        });
      }
    }

    return notifications;
  },
  
  // Add this new function
  fetchQueuesByDate: async (date) => {
    try {
      set({ queues: [] });

      const response = await fetch(`${API_BASE_URL}/api/queues/get?date=${date}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        // Filter queues by just the date
        const filteredQueues = data.filter(queue => {
          const queueDate = new Date(queue._date);
          const selectedDate = new Date(date + 'T00:00:00.000Z'); // Ensure UTC date
          return queueDate.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
        });
        set({ queues: filteredQueues });
      }
    } catch (error) {
      console.error("Error fetching queues by date:", error.message);
      set({ queues: [] });
    }
  },

  // Modify the existing refreshQueueData function
  refreshQueueData: async () => {
    const state = get();
    if (state.date && state.timeSlot.startTime) {
      await state.fetchQueues(state.date, state.timeSlot);
    } else if (state.date) {
      await state.fetchQueuesByDate(state.date);
    } else {
      await state.fetchAllCurrentMonthQueues();
    }
  }
}));

export default useQueueStore;