// frontend/src/store/schedule.js
import { create } from 'zustand';

const useScheduleStore = create((set) => ({
    currentDate: new Date(), // The current date
    selectedDay: null, // The day selected by the user
    selectedTime: null, // The time slot selected by the user
    scheduleData: null, // The schedule data fetched from the server
    scheduleId: null, // The ID of the fetched schedule
    formattedDate: "",

    // Function to set the current date
    setCurrentDate: (date) => set({ currentDate: date }),

    // Function to set the selected day
    setSelectedDay: (day) => set({ selectedDay: day }),

    // Function to set the selected time
    setSelectedTime: (time) => set({ selectedTime: time }),

    // Function to set the fetched schedule data
    setScheduleData: (data) => set({ scheduleData: data, scheduleId: data ? data._id : null }),

    setFormattedDate: (date) => set({ formattedDate: date }),

    // Function to reset the schedule state
    resetScheduleState: () => set({ selectedDay: null, selectedTime: null, scheduleData: null, scheduleId: null }),

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

    // Function to create a new schedule with fixed time slots
    createSchedule: async (date) => {
        const fixedTimeSlots = [
            {
                _startTime: "08:00 AM",
                _endTime: "10:00 AM",
                _availableSlots: 15,
                _status: "Available",
                _isFullyBooked: false,
            },
            {
                _startTime: "10:00 AM",
                _endTime: "12:00 PM",
                _availableSlots: 15,
                _status: "Available",
                _isFullyBooked: false,
            },
            {
                _startTime: "12:00 PM",
                _endTime: "02:00 PM",
                _availableSlots: 15,
                _status: "Available",
                _isFullyBooked: false,
            },
            {
                _startTime: "02:00 PM",
                _endTime: "04:00 PM",
                _availableSlots: 15,
                _status: "Available",
                _isFullyBooked: false,
            },
        ];

        const scheduleData = {
            _date: new Date(date),
            timeSlots: fixedTimeSlots,
        };

        try {
            const response = await fetch('http://localhost:5000/api/schedules/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scheduleData),
            });

            if (response.ok) {
                const data = await response.json();
                set({ scheduleData: data, scheduleId: data ? data._id : null }); // Ensure this line is executed
                console.log("Schedule created successfully:", data); // Log the created schedule
            } else {
                console.error("Failed to create schedule:", response.statusText);
            }
        } catch (error) {
            console.error("Error creating schedule:", error);
        }
    },
    
    updateSchedule: async (scheduleId, timeSlot) => {
        try {
            const response = await fetch('http://localhost:5000/api/schedules/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    scheduleId,
                    timeSlot,
                }),
            });
    
            const data = await response.json(); // Get the response data
    
            if (response.ok) {
                set({ scheduleData: data.data }); // Update the schedule data in the store
                return { success: true }; // Return success
            } else {
                console.error("Failed to update schedule:", data);
                return { success: false, message: data.message || "Failed to update schedule." }; // Return failure message
            }
        } catch (error) {
            console.error("Error updating schedule:", error);
            return { success: false, message: "An error occurred while updating the schedule." }; // Return error message
        }
    },
    
}));

export default useScheduleStore;