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
    upcomingBookings: [],

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
    clearCurrentBooking: () => set({ currentBooking: null }),

    setARImage: (arImage) => {
        console.log('arImage:', arImage);
        set({ arImage });
    },

    resetState: () => set({
        currentBooking: null,
        showTimeInOut: false,
        showLogin: true,
        // Reset other relevant state
    }),

    fetchUpcomingBookings: async (studentId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/bookings/get?studentId=${studentId}`);
            const data = await response.json();
    
            if (data && Array.isArray(data)) {
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinutes = now.getMinutes();
    
                const upcoming = data
                    .filter(booking => {
                        const bookingDate = new Date(booking._date);
                        const hasStudent = booking.students.some(s => s._studentId._id === studentId);
                        const isNotCurrent = booking._id !== get().currentBooking?._id;
    
                        // Parse booking time
                        const [hours, minutes] = booking._timeSlot.startTime.match(/(\d+):(\d+) (AM|PM)/).slice(1);
                        let bookingHour = parseInt(hours);
                        const bookingMinutes = parseInt(minutes);
                        const isPM = booking._timeSlot.startTime.includes('PM');
    
                        // Convert to 24-hour format
                        if (isPM && bookingHour !== 12) bookingHour += 12;
                        else if (!isPM && bookingHour === 12) bookingHour = 0;
    
                        // Compare dates and times
                        if (bookingDate.toDateString() === now.toDateString()) {
                            // For same day, check if time slot is in the future
                            return hasStudent && isNotCurrent && 
                                   (bookingHour > currentHour || 
                                   (bookingHour === currentHour && bookingMinutes > currentMinutes));
                        } else {
                            // For different days, check if date is in the future
                            return hasStudent && isNotCurrent && bookingDate > now;
                        }
                    })
                    .sort((a, b) => new Date(a._date) - new Date(b._date));
    
                set({ upcomingBookings: upcoming });
            }
        } catch (error) {
            console.error("Error fetching upcoming bookings:", error);
            set({ upcomingBookings: [] });
        }
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

        // Update the existing addToQueue function
    addToQueue: async (studentId, date, timeSlot, scheduleId, timeSlotId, arId) => {
        try {
            // Check for existing booking first
            const checkResult = await get().checkExistingBooking(studentId, date, timeSlot);
            if (checkResult.exists) {
                return { 
                    success: false, 
                    message: "You already have a booking for this time slot" 
                };
            }
    
            // Continue with existing queue addition logic
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
    },

    checkExistingBooking: async (studentId, date, timeSlot) => {
        try {
            // Validate inputs before making request
            if (!studentId || !date || !timeSlot || !timeSlot.startTime || !timeSlot.endTime) {
                console.error('Missing required parameters:', { studentId, date, timeSlot });
                return {
                    success: false,
                    exists: false,
                    message: "Invalid parameters for booking check"
                };
            }
    
            // Format date to YYYY-MM-DD
            const formattedDate = new Date(date).toISOString().split('T')[0];
    
            // Debug log
            console.log('Checking booking with:', { studentId, date: formattedDate, timeSlot });
                
            const encodedStartTime = encodeURIComponent(timeSlot.startTime);
            const encodedEndTime = encodeURIComponent(timeSlot.endTime);
                
            const response = await fetch(
                `http://localhost:5000/api/bookings/check-existing?` +
                `studentId=${studentId}&` +
                `date=${formattedDate}&` +
                `startTime=${encodedStartTime}&` +
                `endTime=${encodedEndTime}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
    
            const data = await response.json();
            console.log('Check Existing Booking Response:', data);
                
            return {
                success: response.ok,
                exists: data.exists,
                message: data.message
            };
        } catch (error) {
            console.error("Error checking existing booking:", error);
            return {
                success: false,
                exists: false,
                message: "Failed to check existing booking"
            };
        }
    },

    checkMissedBookings: async () => {
        try {
            const response = await fetch('http://localhost:5000/api/bookings/check-missed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const state = get();
                const userId = state.user?._id;
                if (userId) {
                    await state.fetchCurrentBooking(userId);
                    await state.fetchUpcomingBookings(userId);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error checking missed bookings:", error);
            return false;
        }
    },

    // Update existing timeIn function
    timeIn: async (bookingId, studentId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/timeIn`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId,
                    timeIn: new Date(),
                }),
            });

            if (response.ok) {
                await get().fetchCurrentBooking(studentId);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error recording time in:", error);
            return false;
        }
    },

    // Update existing timeOut function
    timeOut: async (bookingId, studentId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/timeOut`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId,
                    timeOut: new Date(),
                }),
            });

            if (response.ok) {
                await get().fetchCurrentBooking(studentId);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error recording time out:", error);
            return false;
        }
    }
}));

export default useWalkinStore;