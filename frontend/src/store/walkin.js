import { create } from 'zustand';

const useWalkinStore = create((set) => ({
    currentDate: new Date(),
    selectedDay: null, 
    selectedTime: null, 
    scheduleData: null, 
    scheduleId: null, 
    formattedDate: "",
    isRegistered: false,
    isBooked: false,
    showRegister: false,
    showLogin: false,
    showBooking: false,
    showARInput: false,
    showReview: false,
    showLogOptions: false,
    showPassword: { password: false, confirmPassword: false }, 

    setCurrentDate: (date) => set({ currentDate: date }),
    setSelectedDay: (day) => set({ selectedDay: day }),
    setSelectedTime: (time) => set({ selectedTime: time }),
    setScheduleData: (data) => set({ scheduleData: data, scheduleId: data ? data._id : null }),
    setFormattedDate: (date) => set({ formattedDate: date }),
    resetScheduleState: () => set({ selectedDay: null, selectedTime: null, scheduleData: null, scheduleId: null }),
    setIsRegistered: (value) => set({ isRegistered: value }),
    setIsBooked: (value) => set({ isBooked: value }),
    setShowRegister: (value) => set({ showRegister: value }),
    setShowLogin: (value) => set({ showLogin: value }),
    setShowBooking: (value) => set({ showBooking: value }),
    setShowARInput: (value) => set({ showARInput: value }),
    setShowReview: (value) => set({ showReview: value }),
    setShowLogOptions: (value) => set({ showLogOptions: value }),
    setShowPassword: (value) => set((state) => ({ showPassword: { ...state.showPassword, ...value } })),

    // Function to fetch schedule data by date
    fetchScheduleByDate: async (date) => {
        // Check if the date is valid
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) {
            console.error("Invalid date:", date);
            return; // Exit if the date is invalid
        }
        
        const formattedDate = parsedDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
        const response = await fetch(`http://localhost:5000/api/schedules/${formattedDate}`); // Adjust the URL as needed
        const data = await response.json();
    
        if (response.ok) {
            set({ scheduleData: data, scheduleId: data ? data._id : null }); // Store the fetched schedule data
            if (data && data._id) {
                console.log("Schedule exists with ID:", data._id); // Log the existing schedule ID
            } else {
                console.log("No schedule found for this date, but response was OK."); // Log if no schedule ID exists
            }
        } else {
            console.log("No schedule found for this date. Response not OK:", data.message); // Log if no schedule exists
            set({ scheduleData: null, scheduleId: null }); // Clear the schedule data if not found
        }
    },

    
}));

export default useWalkinStore;