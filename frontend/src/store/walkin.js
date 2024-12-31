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
    arCode: "",
    isARCodeValid: false,
    selectedTimeSlot: null,
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
    setArCode: (code) => set({ arCode: code }),
    setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
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
    addARCode: async (arCode, studentID) => {
        try {
            const response = await fetch('http://localhost:5000/api/ARCodes/uploadAR', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ _code: arCode, _studentID: studentID }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error adding AR code:", errorData.message);
                return { success: false, message: errorData.message };
            }
    
            const data = await response.json();
            console.log("AR code added successfully. AR ID:", data.arId); // Ensure this matches the server response
            return { success: true, message: "AR code added successfully.", arId: data.arId };
        } catch (error) {
            console.error("Error adding AR code:", error);
            return { success: false, message: "An error occurred while adding the AR code." };
        }
    },
    
    checkARCode: async (arCode) => {
        console.log("Sending AR Code for validation:", arCode); // Log the AR code being sent
        try {
            const response = await fetch('http://localhost:5000/api/ARCodes/checkAR', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ _code: arCode }), // Send the AR code
            });

            const data = await response.json(); // Ensure you parse the response
            console.log("Response from AR Code check:", data); // Log the response data
            if (response.ok) {
                console.log("AR Code Check Successful:", data);
                set({ isARCodeValid: true }); // Set to true if AR code is valid
                return { success: true, message: "AR code is valid." };
            } else {
                console.error("AR Code Check Failed:", data.message);
                set({ isARCodeValid: false }); // Set to false if AR code is invalid
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("Error checking AR code:", error);
            set({ isARCodeValid: false }); // Set to false on error
            return { success: false, message: "Server error." };
        }
    },

    addToQueue: async (studentId, date, timeSlot, scheduleId, arId) => {
        console.log('studentId:', studentId);
        console.log('date:', date);
        console.log('timeSlot:', timeSlot);
        console.log('scheduleId:', scheduleId); // Add this log
        console.log('arId:', arId);
    
        try {
            const response = await fetch('http://localhost:5000/api/queues/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId,
                    date,
                    timeSlot: {
                        startTime: timeSlot.startTime,
                        endTime: timeSlot.endTime,
                    },
                    scheduleId, // Ensure this is included
                    arId, // Ensure this is included
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Failed to add to queue:", errorData.message);
                return { success: false, message: errorData.message };
            }
    
            const data = await response.json();
            return { success: true, message: "Successfully added to queue.", data };
        } catch (error) {
            console.error("Error adding to queue:", error);
            return { success: false, message: "An error occurred while adding to the queue." };
        }
    },
}));

export default useWalkinStore;