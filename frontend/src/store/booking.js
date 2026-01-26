import { create } from 'zustand';
import API_BASE_URL from '../config';

const useBookingStore = create((set, get) => ({
  bookings: [],
  setBookings: (bookings) => set({ bookings }),
  date: "",
  setDate: (date) => set({ date }),
  timeSlot: { startTime: "", endTime: "" },
  setTimeSlot: (timeSlot) => set({ timeSlot }),
  
  clearBookings: () => set({ bookings: [], date: "", timeSlot: { startTime: "", endTime: "" } }),

  fetchAllCurrentMonthBookings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/currentMonth`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data && Array.isArray(data)) {
        set({ bookings: data });
      }
    } catch (error) {
      console.error("Error fetching current month bookings:", error.message);
      set({ bookings: [] });
    }
  },

  fetchBookings: async (date, timeSlot) => {
      try {
          set({ bookings: [] });
          const response = await fetch(`${API_BASE_URL}/api/bookings/get?date=${date}&startTime=${timeSlot.startTime}&endTime=${timeSlot.endTime}`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
              },
          });

          const data = await response.json();
          if (data && Array.isArray(data)) {
              set({ bookings: data });
          }
      } catch (error) {
          console.error("Error fetching bookings:", error);
          set({ bookings: [] });
      }
  },

  fetchBookingsByDate: async (date) => {
    try {
      set({ bookings: [] });

      const response = await fetch(`${API_BASE_URL}/api/bookings/get?date=${date}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        const filteredBookings = data.filter(booking => 
          new Date(booking._date).toISOString().split('T')[0] === date
        );
        set({ bookings: filteredBookings });
      }
    } catch (error) {
      console.error("Error fetching bookings by date:", error.message);
      set({ bookings: [] });
    }
  },

  refreshBookingData: async () => {
    const state = get();
      try {
          // Check for missed bookings and update statuses
          const response = await fetch(`${API_BASE_URL}/api/bookings/check-missed`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
          });

          if (response.ok) {
              // Immediately fetch fresh data based on current view
              if (state.date && state.timeSlot.startTime) {
                  await state.fetchBookings(state.date, state.timeSlot);
              } else {
                  await state.fetchAllCurrentMonthBookings();
              }
          }
      } catch (error) {
          console.error('Error refreshing booking data:', error);
      }
  },

  checkLapsedBookings: async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/update-lapsed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            // Refresh bookings after update
            const state = get();
            if (state.date && state.timeSlot) {
                await state.fetchBookings(state.date, state.timeSlot);
            } else {
                await state.fetchAllCurrentMonthBookings();
            }
        }
    } catch (error) {
        console.error('Error checking lapsed bookings:', error);
    }
  }
}));

export default useBookingStore;