import { create } from 'zustand';

const useWalkinStore = create((set, get) => ({
    navigationStack: ['options'],
    currentView: 'options',
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
    showTimeInOut: false,
    showPassword: { password: false, confirmPassword: false },
    currentBooking: null,

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
    setShowTimeInOut: (value) => set({ showTimeInOut: value }),
    setArCode: (code) => set({ arCode: code }),
    setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
    setShowPassword: (value) => set((state) => ({ showPassword: { ...state.showPassword, ...value } })),

    setARImage: (arImage) => {
        console.log('arImage:', arImage);
        set({ arImage });
    },

   

    fetchCurrentBooking: async (studentId) => {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/current/${studentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        const data = await response.json();
        if (response.ok) {
          set({ currentBooking: data });
          console.log("Current booking fetched successfully:", data);
          return { success: true, data };
        }
        return { success: false, message: data.message };
      } catch (error) {
        console.error("Error fetching current booking:", error);
        return { success: false, message: "Failed to fetch booking information" };
      }
    },

    // Function to fetch schedule data by date
    fetchScheduleByDate: async (date) => {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) {
            console.error("Invalid date:", date);
            return; // Exit if the date is invalid
        }
        
        const formattedDate = parsedDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
        const response = await fetch(`http://localhost:5000/api/schedules/${formattedDate}`); 
        const data = await response.json();
    
        if (response.ok) {
            set({ scheduleData: data, scheduleId: data ? data._id : null }); 
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
            console.log("AR code added successfully. AR ID:", data.arId); 
            return { success: true, message: "AR code added successfully.", arId: data.arId };
        } catch (error) {
            console.error("Error adding AR code:", error);
            return { success: false, message: "An error occurred while adding the AR code." };
        }
    },
    
    checkARCode: async (arCode) => {
        console.log("Sending AR Code for validation:", arCode); 
        try {
            const response = await fetch('http://localhost:5000/api/ARCodes/checkAR', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ _code: arCode }), 
            });

            const data = await response.json(); 
            console.log("Response from AR Code check:", data); 
            if (response.ok) {
                console.log("AR Code Check Successful:", data);
                set({ isARCodeValid: true }); 
                return { success: true, message: "AR code is valid." };
            } else {
                console.error("AR Code Check Failed:", data.message);
                set({ isARCodeValid: false }); 
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("Error checking AR code:", error);
            set({ isARCodeValid: false }); 
            return { success: false, message: "Server error." };
        }
    },

    addToQueue: async (studentId, date, timeSlot, scheduleId, timeSlotId, arId) => {
        console.log('studentId:', studentId);
        console.log('date:', date);
        console.log('timeSlot:', timeSlot);
        console.log('scheduleDataId:', scheduleId); 
        console.log('timeSlotId:', timeSlotId); 
        console.log('arId:', arId);

        try {
            const response = await fetch('http://localhost:5000/api/queues/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    _studentId: studentId, 
                    _date: date,
                    _timeSlot: {
                        startTime: timeSlot.startTime,
                        endTime: timeSlot.endTime,
                    },
                    _timeSlotId: timeSlotId,
                    _scheduleId: scheduleId,
                    _arId: arId,
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

    uploadARImage: async (arImage, studentId) => {
        try {
            if (!arImage || typeof arImage !== 'object' || !arImage.size) {
                console.error('Error: arImage is not a file object');
                return;
              }
            
          const formData = new FormData();
          formData.append('_arImage', arImage);
          formData.append('_studentId', studentId);
    
          const response = await fetch('http://localhost:5000/api/arImage/upload', {
            method: 'POST',
            body: formData,
          });
    
          if (response.ok) {
            const data = await response.json();
            set({ arImage: data });
          } else {
            console.error('Error uploading AR image:', response.statusText);
          }
        } catch (error) {
          console.error('Error uploading AR image:', error.message);
        }
      },
    
      getARImage: async (studentID) => {
        try {
          const response = await fetch(`http://localhost:5000/api/arImage/${studentID}`);
    
          if (response.ok) {
            const data = await response.json();
            set({ arImage: data });
          } else {
            console.error('Error getting AR image:', response.statusText);
          }
        } catch (error) {
          console.error('Error getting AR image:', error.message);
        }
      },

    // Navigation functions
    navigateTo: (view) => {
        const currentStack = get().navigationStack;
        set({ 
            navigationStack: [...currentStack, view],
            currentView: view,
            // Reset all show states first
            showRegister: false,
            showLogin: false,
            showLogOptions: false,
            showBooking: false,
            showARInput: false,
            showReview: false,
            // Set the appropriate view state
            [`show${view.charAt(0).toUpperCase() + view.slice(1)}`]: true
        });
    },

    goBack: () => {
        const currentStack = get().navigationStack;
        if (currentStack.length > 1) {
            const newStack = currentStack.slice(0, -1);
            const previousView = newStack[newStack.length - 1];
            set({ 
                navigationStack: newStack,
                currentView: previousView,
                // Reset all show states
                showRegister: false,
                showLogin: false,
                showLogOptions: false,
                showBooking: false,
                showARInput: false,
                showReview: false,
                // Set the appropriate view state
                [`show${previousView.charAt(0).toUpperCase() + previousView.slice(1)}`]: true
            });
        }
    },

    // Reset navigation
    resetNavigation: () => {
        set({ 
            navigationStack: ['options'],
            currentView: 'options',
            showRegister: false,
            showLogin: false,
            showLogOptions: false,
            showBooking: false,
            showARInput: false,
            showReview: false,
            isRegistered: false,
            isBooked: false
        });
    }
}));

export default useWalkinStore;