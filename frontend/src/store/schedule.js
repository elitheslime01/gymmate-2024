// frontend/src/store/schedule.js
import { create } from 'zustand';
import API_BASE_URL from '../config';

const useScheduleStore = create((set) => ({
    currentDate: new Date(),
    selectedDay: null, 
    selectedTime: null, 
    scheduleData: null, 
    scheduleId: null, 
    formattedDate: "",

    setCurrentDate: (date) => set({ currentDate: date }),

    setSelectedDay: (day) => set({ selectedDay: day }),

    setSelectedTime: (time) => set({ selectedTime: time }),

    setScheduleData: (data) => set({ scheduleData: data, scheduleId: data ? data._id : null }),

    setFormattedDate: (date) => set({ formattedDate: date }),

    resetScheduleState: () => set({ selectedDay: null, selectedTime: null, scheduleData: null, scheduleId: null }),

    // Function to fetch schedule data by date
    fetchScheduleByDate: async (date) => {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) {
            console.error("Invalid date:", date);
            return; 
        }
        
        const formattedDate = parsedDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
        const response = await fetch(`${API_BASE_URL}/api/schedules/${formattedDate}`);
        const data = await response.json();
    
        if (response.ok) {
            set({ scheduleData: data, scheduleId: data ? data._id : null }); // Store the fetched schedule data
            if (data && data._id) {
                console.log("Schedule exists with ID:", data._id);
            } else {
                console.log("No schedule found for this date, but response was OK.");
            }
        } else {
            console.log("No schedule found for this date. Response not OK:", data.message); 
            set({ scheduleData: null, scheduleId: null });
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
            const response = await fetch(`${API_BASE_URL}/api/schedules/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scheduleData),
            });

            if (response.ok) {
                const data = await response.json();
                set({ scheduleData: data, scheduleId: data ? data._id : null }); 
                console.log("Schedule created successfully:", data); 
            } else {
                console.error("Failed to create schedule:", response.statusText);
            }
        } catch (error) {
            console.error("Error creating schedule:", error);
        }
    },
    
    updateSchedule: async (scheduleId, timeSlot) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/schedules/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    scheduleId,
                    timeSlot,
                }),
            });
    
            const data = await response.json(); 
    
            if (response.ok) {
                set({ scheduleData: data.data }); 
                return { success: true }; 
            } else {
                console.error("Failed to update schedule:", data);
                return { success: false, message: data.message || "Failed to update schedule." };
            }
        } catch (error) {
            console.error("Error updating schedule:", error);
            return { success: false, message: "An error occurred while updating the schedule." }; 
        }
    },

    deleteSchedule: async (scheduleId) => {
        if (!scheduleId) {
            return { success: false, message: "Schedule ID is required." };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/schedules/${scheduleId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                set({ scheduleData: null, scheduleId: null });
                return { success: true };
            }

            return { success: false, message: data.message || "Failed to delete schedule." };
        } catch (error) {
            console.error("Error deleting schedule:", error);
            return { success: false, message: "An error occurred while deleting the schedule." };
        }
    },
    
}));

export default useScheduleStore;